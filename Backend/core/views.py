
# Third party imports
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action

# Django imports
from django.contrib.auth import update_session_auth_hash, logout
from core.serializers import PurchaseRequestSerializer, SubmitReceiptSerializer
from core.models import PurchaseRequest
from core.permissions import HasStaffMemberPermission, HasManagmentPermission, HasFinanceMemberPermission
from accounts.models import User, Manager, StaffMember


from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.parsers import MultiPartParser, FormParser

@extend_schema_view(
    list=extend_schema(summary="List purchase requests"),
    create=extend_schema(
        summary="Create a purchase request",
        description="Create a new purchase request. Only staff members can create purchase requests.",
        request=PurchaseRequestSerializer,
        responses=PurchaseRequestSerializer,
    )
)
class PurchaseRequestViewSet(viewsets.GenericViewSet):
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    # UUID lookup
    lookup_field = "id"
    lookup_url_kwarg = "id"

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()

        if request.user.user_type == User.STAFF:
            qs = qs.filter(created_by__user=request.user)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        if request.user.user_type != User.STAFF:
            return Response({
                "errorMessage": "Only staff members can create purchase requests",
                "status_code": status.HTTP_403_FORBIDDEN
                },
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance: PurchaseRequest = self.get_object()
        
        if request.user.user_type != User.STAFF:
            return Response({
                "errorMessage": "Only staff members can update purchase requests",
                "status_code": status.HTTP_403_FORBIDDEN
                }, status=status.HTTP_403_FORBIDDEN)
        
        if instance.created_by.user != request.user:
            return Response({
                "errorMessage": "You can only update your own purchase requests",
                "status_code": status.HTTP_403_FORBIDDEN
                }, status=status.HTTP_403_FORBIDDEN)
            
        if request.user.user_type == User.STAFF and instance.status != PurchaseRequest.PENDING:
            return Response({
                "errorMessage": "Cannot update after approval or rejection",
                "status_code": status.HTTP_400_BAD_REQUEST
                }, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="approve", permission_classes=[HasManagmentPermission])
    def approve(self, request, id=None):
        pr: PurchaseRequest = self.get_object()
        pr.status = PurchaseRequest.APPROVED
        pr.approved_by = Manager.objects.get(user__username=request.user)
        pr.save()

        # Automatically generate Purchase Order
        po_result = {"success": False, "message": "No proforma attached"}
        try:
            from core.services import POGenerationService

            po_service = POGenerationService()
            po_result = po_service.generate_purchase_order(pr)

            if po_result["success"]:
                po_message = f"Purchase request approved and PO generated: {po_result['po_file']}"
            else:
                po_message = f"Purchase request approved. PO generation note: {po_result.get('error', 'Unknown error')}"
        except Exception as e:
            po_message = f"Purchase request approved. PO generation failed: {str(e)}"
            po_result = {"success": False, "error": str(e)}

        return Response({
            "successMessage": po_message,
            "status_code": status.HTTP_200_OK,
            "po_generated": po_result.get("success", False),
            "po_file": po_result.get("po_file"),
            "po_data": po_result.get("extracted_data")
            }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="reject", permission_classes=[HasManagmentPermission])
    def reject(self, request, id=None):
        pr = self.get_object()
        pr.status = PurchaseRequest.REJECTED
        pr.approved_by = Manager.objects.get(user=request.user)
        pr.save()
        return Response({
            "successMessage": "Purchase request rejected",
            "status_code": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)

    @extend_schema(
        request=SubmitReceiptSerializer,
        responses=PurchaseRequestSerializer,
        examples=[],
    )
    @action(detail=True, methods=["post"], url_path="submit-receipt", permission_classes=[HasStaffMemberPermission])
    def submit_receipt(self, request, id=None):
        pr = self.get_object()

        if pr.status != "approved":
            return Response({"detail": "You can only submit a receipt after approval"}, status=400)

        receipt_serializer = SubmitReceiptSerializer(instance=pr, data=request.data, partial=True)
        receipt_serializer.is_valid(raise_exception=True)
        receipt_serializer.save()

        # Validate receipt with AI
        try:
            from core.services import ReceiptValidationService

            validator = ReceiptValidationService()
            validation_result = validator.validate_receipt(
                receipt_file_path=pr.receipt.path,
                purchase_request=pr
            )

            # Update validation status based on result
            if validation_result.get('is_valid'):
                pr.receipt_validation_status = 'valid'
            else:
                pr.receipt_validation_status = 'invalid'

            pr.receipt_validation_result = validation_result
            pr.save()

            return Response({
                "successMessage": "Receipt submitted and validated successfully",
                "status_code": status.HTTP_200_OK,
                "validation_status": pr.receipt_validation_status,
                "validation_result": validation_result
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # If validation fails, still accept the receipt but mark as error
            pr.receipt_validation_status = 'error'
            pr.receipt_validation_result = {
                "is_valid": False,
                "error": str(e),
                "summary": "Validation failed due to system error"
            }
            pr.save()

            return Response({
                "successMessage": "Receipt submitted but validation failed",
                "status_code": status.HTTP_200_OK,
                "validation_status": "error",
                "error": str(e)
            }, status=status.HTTP_200_OK)


