import React from 'react';
import { FileText, Package, DollarSign, Calendar, Truck } from 'lucide-react';
import { POData } from '../../types';
import { cn } from '../../lib/utils';

interface PODataDisplayProps {
  poData: POData | null;
  purchaseOrderUrl: string | null;
}

const PODataDisplay: React.FC<PODataDisplayProps> = ({ poData, purchaseOrderUrl }) => {
  if (!poData && !purchaseOrderUrl) {
    return null;
  }

  // If there's no extracted data but there's a PO file, show minimal view
  if (!poData && purchaseOrderUrl) {
    return (
      <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-1">
              Purchase Order Generated
            </h3>
            <p className="text-sm text-gray-600">
              PO document has been created and is ready for download
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error in extraction
  if (poData?.error) {
    return (
      <div className="bg-amber-50 rounded-2xl p-8 border-2 border-amber-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-1">
              Purchase Order Generated
            </h3>
            <p className="text-sm text-gray-600">
              Automated extraction unavailable. Manual review may be required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-200">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-emerald-900 mb-1">
            Purchase Order Generated
          </h3>
          <p className="text-sm text-gray-600">
            PO created with extracted data from proforma invoice
          </p>
        </div>
      </div>

      {/* Vendor Information */}
      {poData?.vendor && (
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
            Vendor Information
          </h4>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {poData.vendor.name}
                </span>
              </div>
              {poData.vendor.address && poData.vendor.address !== 'N/A' && (
                <p className="text-sm text-gray-600 ml-6">
                  {poData.vendor.address}
                </p>
              )}
              {poData.vendor.contact && poData.vendor.contact !== 'N/A' && (
                <p className="text-sm text-gray-600 ml-6">
                  {poData.vendor.contact}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      {poData?.items && poData.items.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
            Line Items
          </h4>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {poData.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      ${item.unit_price}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      ${item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing */}
      {poData?.pricing && (
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
            Pricing Summary
          </h4>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${poData.pricing.subtotal}</span>
              </div>
              {poData.pricing.tax && poData.pricing.tax !== 'N/A' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">${poData.pricing.tax}</span>
                </div>
              )}
              {poData.pricing.shipping && poData.pricing.shipping !== 'N/A' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">${poData.pricing.shipping}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-gray-900">Total:</span>
                  <span className="text-base font-bold text-emerald-600">
                    ${poData.pricing.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms */}
      {poData?.terms && (
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
            Terms & Conditions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poData.terms.payment && poData.terms.payment !== 'N/A' && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Payment Terms</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {poData.terms.payment}
                </p>
              </div>
            )}
            {poData.terms.delivery && poData.terms.delivery !== 'N/A' && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Delivery Terms</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {poData.terms.delivery}
                </p>
              </div>
            )}
            {poData.terms.validity && poData.terms.validity !== 'N/A' && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Validity</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {poData.terms.validity}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {poData?.notes && poData.notes !== 'N/A' && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Notes</h4>
          <p className="text-sm text-gray-700">{poData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PODataDisplay;
