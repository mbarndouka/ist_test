import os
import io
from typing import Dict, Any
from datetime import datetime
from openai import OpenAI
import pdfplumber
from PIL import Image
import pytesseract
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from django.core.files.base import ContentFile


class ReceiptValidationService:
    """
    Service to validate receipts against purchase orders using AI
    Extracts receipt data and compares with PO information
    """

    def __init__(self):
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file using pdfplumber"""
        try:
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
                return text
        except Exception as e:
            return f"Error extracting PDF text: {str(e)}"

    def extract_text_from_image(self, file_path: str) -> str:
        """Extract text from image file using OCR (pytesseract)"""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            return f"Error extracting image text: {str(e)}"

    def extract_receipt_data(self, file_path: str) -> str:
        """
        Extract text from receipt file based on file type
        Supports PDF and image formats
        """
        file_extension = os.path.splitext(file_path)[1].lower()

        if file_extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            return self.extract_text_from_image(file_path)
        else:
            return "Unsupported file format"

    def validate_receipt_with_ai(
        self,
        receipt_text: str,
        po_data: Dict[str, Any],
        proforma_text: str = None
    ) -> Dict[str, Any]:
        """
        Use OpenAI to validate receipt against PO data
        Returns validation result with discrepancies flagged
        """

        # Construct the validation prompt
        prompt = f"""
You are a financial auditor validating a receipt against a purchase order (PO).

**Purchase Order Information:**
- Title: {po_data.get('title', 'N/A')}
- Description: {po_data.get('description', 'N/A')}
- Approved Amount: ${po_data.get('amount', 'N/A')}

**Receipt Text Extracted:**
{receipt_text}

**Task:**
Compare the receipt with the PO and validate the following:
1. **Vendor/Seller**: Does the seller on the receipt match the vendor mentioned in the PO description or title?
2. **Items**: Do the items on the receipt match the items described in the PO?
3. **Prices**: Are the prices on the receipt consistent with the approved amount?
4. **Total Amount**: Does the total on the receipt match or is close to the approved PO amount?

**Output Format (JSON):**
{{
    "is_valid": true/false,
    "confidence_score": 0-100,
    "discrepancies": [
        {{"type": "vendor/items/price/amount", "description": "details of mismatch"}}
    ],
    "extracted_data": {{
        "vendor": "vendor name from receipt",
        "total_amount": "total from receipt",
        "items": ["list of items"]
    }},
    "summary": "brief validation summary"
}}

Provide only the JSON output, no additional text.
"""

        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial auditor validating receipts against purchase orders. Always respond in valid JSON format."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )

            # Extract and parse the response
            validation_result = response.choices[0].message.content.strip()

            # Try to parse as JSON (OpenAI should return JSON)
            import json
            try:
                result_json = json.loads(validation_result)
                return result_json
            except json.JSONDecodeError:
                # If not valid JSON, wrap in error response
                return {
                    "is_valid": False,
                    "confidence_score": 0,
                    "discrepancies": [
                        {"type": "validation_error", "description": "Failed to parse AI response"}
                    ],
                    "extracted_data": {},
                    "summary": "AI validation failed",
                    "raw_response": validation_result
                }

        except Exception as e:
            return {
                "is_valid": False,
                "confidence_score": 0,
                "discrepancies": [
                    {"type": "system_error", "description": str(e)}
                ],
                "extracted_data": {},
                "summary": f"Validation error: {str(e)}"
            }

    def validate_receipt(self, receipt_file_path: str, purchase_request) -> Dict[str, Any]:
        """
        Main validation method
        Extracts receipt data and validates against PO

        Args:
            receipt_file_path: Path to the uploaded receipt file
            purchase_request: PurchaseRequest model instance

        Returns:
            Dict with validation results
        """

        # Extract text from receipt
        receipt_text = self.extract_receipt_data(receipt_file_path)

        if "Error" in receipt_text or not receipt_text.strip():
            return {
                "is_valid": False,
                "confidence_score": 0,
                "discrepancies": [
                    {"type": "extraction_error", "description": "Could not extract text from receipt"}
                ],
                "extracted_data": {},
                "summary": "Receipt text extraction failed"
            }

        # Prepare PO data
        po_data = {
            "title": purchase_request.title,
            "description": purchase_request.description,
            "amount": str(purchase_request.amount),
            "status": purchase_request.status
        }

        # Extract proforma text if available (for additional context)
        proforma_text = None
        if purchase_request.proforma:
            try:
                proforma_path = purchase_request.proforma.path
                proforma_text = self.extract_receipt_data(proforma_path)
            except:
                proforma_text = None

        # Validate using AI
        validation_result = self.validate_receipt_with_ai(
            receipt_text=receipt_text,
            po_data=po_data,
            proforma_text=proforma_text
        )

        return validation_result


class POGenerationService:
    """
    Service to automatically generate Purchase Orders from proforma invoices using AI
    Extracts vendor, items, prices, and terms to create a formal PO document
    """

    def __init__(self):
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file using pdfplumber"""
        try:
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
                return text
        except Exception as e:
            return f"Error extracting PDF text: {str(e)}"

    def extract_text_from_image(self, file_path: str) -> str:
        """Extract text from image file using OCR (pytesseract)"""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            return f"Error extracting image text: {str(e)}"

    def extract_proforma_data(self, file_path: str) -> str:
        """Extract text from proforma file"""
        file_extension = os.path.splitext(file_path)[1].lower()

        if file_extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            return self.extract_text_from_image(file_path)
        else:
            return "Unsupported file format"

    def extract_po_data_with_ai(self, proforma_text: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use OpenAI to extract structured PO data from proforma invoice
        Returns vendor, items, prices, terms, and other PO details
        """

        prompt = f"""
You are a procurement specialist extracting information from a proforma invoice to create a Purchase Order.

**Purchase Request Information:**
- Title: {request_data.get('title', 'N/A')}
- Description: {request_data.get('description', 'N/A')}
- Approved Amount: ${request_data.get('amount', 'N/A')}

**Proforma Invoice Text:**
{proforma_text}

**Task:**
Extract the following information to generate a Purchase Order:
1. **Vendor Information**: Company name, address, contact details
2. **Items**: List of items with descriptions, quantities, and unit prices
3. **Pricing**: Subtotal, taxes, shipping, total amount
4. **Terms**: Payment terms, delivery terms, validity period

**Output Format (JSON):**
{{
    "vendor": {{
        "name": "Vendor company name",
        "address": "Vendor address",
        "contact": "Phone/email"
    }},
    "items": [
        {{
            "description": "Item name/description",
            "quantity": "quantity",
            "unit_price": "price per unit",
            "total": "total price"
        }}
    ],
    "pricing": {{
        "subtotal": "subtotal amount",
        "tax": "tax amount",
        "shipping": "shipping cost",
        "total": "total amount"
    }},
    "terms": {{
        "payment": "payment terms",
        "delivery": "delivery terms",
        "validity": "validity period"
    }},
    "notes": "Any additional notes or special instructions"
}}

Provide only the JSON output, no additional text. If information is not available, use "N/A".
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a procurement specialist. Extract structured data from proforma invoices and respond in valid JSON format only."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )

            result_text = response.choices[0].message.content.strip()

            import json
            try:
                po_data = json.loads(result_text)
                return po_data
            except json.JSONDecodeError:
                return {
                    "error": "Failed to parse AI response",
                    "raw_response": result_text
                }

        except Exception as e:
            return {
                "error": f"AI extraction failed: {str(e)}"
            }

    def generate_po_pdf(self, po_data: Dict[str, Any], request_data: Dict[str, Any]) -> io.BytesIO:
        """
        Generate a PDF Purchase Order document from extracted data
        Returns a BytesIO buffer containing the PDF
        """

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()

        # Title
        title = Paragraph("<b>PURCHASE ORDER</b>", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 0.3*inch))

        # PO Details
        po_number = f"PO-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        po_date = datetime.now().strftime('%B %d, %Y')

        po_info = [
            ['PO Number:', po_number],
            ['PO Date:', po_date],
            ['Request:', request_data.get('title', 'N/A')],
            ['Amount:', f"${request_data.get('amount', '0.00')}"]
        ]

        po_table = Table(po_info, colWidths=[1.5*inch, 4*inch])
        po_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ]))
        story.append(po_table)
        story.append(Spacer(1, 0.3*inch))

        # Vendor Information
        if not po_data.get('error'):
            vendor = po_data.get('vendor', {})
            story.append(Paragraph("<b>VENDOR INFORMATION</b>", styles['Heading2']))
            vendor_info = [
                ['Vendor:', vendor.get('name', 'N/A')],
                ['Address:', vendor.get('address', 'N/A')],
                ['Contact:', vendor.get('contact', 'N/A')]
            ]
            vendor_table = Table(vendor_info, colWidths=[1.5*inch, 4*inch])
            vendor_table.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
            ]))
            story.append(vendor_table)
            story.append(Spacer(1, 0.3*inch))

            # Items Table
            story.append(Paragraph("<b>ITEMS</b>", styles['Heading2']))
            items = po_data.get('items', [])

            if items:
                items_data = [['Description', 'Quantity', 'Unit Price', 'Total']]
                for item in items:
                    items_data.append([
                        item.get('description', 'N/A'),
                        str(item.get('quantity', '')),
                        f"${item.get('unit_price', '0.00')}",
                        f"${item.get('total', '0.00')}"
                    ])

                items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.25*inch, 1.25*inch])
                items_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ]))
                story.append(items_table)
                story.append(Spacer(1, 0.3*inch))

            # Pricing
            pricing = po_data.get('pricing', {})
            if pricing:
                story.append(Paragraph("<b>PRICING</b>", styles['Heading2']))
                pricing_data = [
                    ['Subtotal:', f"${pricing.get('subtotal', '0.00')}"],
                    ['Tax:', f"${pricing.get('tax', '0.00')}"],
                    ['Shipping:', f"${pricing.get('shipping', '0.00')}"],
                    ['<b>Total:</b>', f"<b>${pricing.get('total', '0.00')}</b>"]
                ]
                pricing_table = Table(pricing_data, colWidths=[5*inch, 1.5*inch])
                pricing_table.setStyle(TableStyle([
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
                ]))
                story.append(pricing_table)
                story.append(Spacer(1, 0.3*inch))

            # Terms
            terms = po_data.get('terms', {})
            if terms:
                story.append(Paragraph("<b>TERMS & CONDITIONS</b>", styles['Heading2']))
                terms_data = [
                    ['Payment Terms:', terms.get('payment', 'N/A')],
                    ['Delivery Terms:', terms.get('delivery', 'N/A')],
                    ['Validity:', terms.get('validity', 'N/A')]
                ]
                terms_table = Table(terms_data, colWidths=[1.5*inch, 5*inch])
                terms_table.setStyle(TableStyle([
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
                ]))
                story.append(terms_table)

            # Notes
            notes = po_data.get('notes')
            if notes and notes != 'N/A':
                story.append(Spacer(1, 0.2*inch))
                story.append(Paragraph(f"<b>Notes:</b> {notes}", styles['Normal']))
        else:
            # Error case - minimal PO
            story.append(Paragraph(f"<b>Note:</b> Automated extraction unavailable. Manual review required.", styles['Normal']))
            story.append(Paragraph(f"<b>Request Description:</b> {request_data.get('description', 'N/A')}", styles['Normal']))

        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer

    def generate_purchase_order(self, purchase_request) -> Dict[str, Any]:
        """
        Main method to generate PO from purchase request
        Extracts data from proforma, generates PDF PO, and saves it

        Args:
            purchase_request: PurchaseRequest model instance

        Returns:
            Dict with success status, PO file, and extracted data
        """

        result = {
            "success": False,
            "po_file": None,
            "extracted_data": None,
            "error": None
        }

        try:
            # Check if proforma exists
            if not purchase_request.proforma:
                result["error"] = "No proforma invoice attached"
                result["success"] = False
                return result

            # Extract text from proforma
            proforma_path = purchase_request.proforma.path
            proforma_text = self.extract_proforma_data(proforma_path)

            if "Error" in proforma_text or not proforma_text.strip():
                result["error"] = "Could not extract text from proforma"
                result["success"] = False
                return result

            # Prepare request data
            request_data = {
                "title": purchase_request.title,
                "description": purchase_request.description,
                "amount": str(purchase_request.amount)
            }

            # Extract PO data using AI
            po_data = self.extract_po_data_with_ai(proforma_text, request_data)
            result["extracted_data"] = po_data

            # Generate PDF PO
            pdf_buffer = self.generate_po_pdf(po_data, request_data)

            # Save PO file
            po_filename = f"PO_{purchase_request.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            purchase_request.purchase_order.save(
                po_filename,
                ContentFile(pdf_buffer.read()),
                save=True
            )

            result["success"] = True
            result["po_file"] = purchase_request.purchase_order.name

        except Exception as e:
            result["error"] = f"PO generation failed: {str(e)}"
            result["success"] = False

        return result
