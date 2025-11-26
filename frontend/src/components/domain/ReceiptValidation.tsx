import React from "react";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import { ReceiptValidationResult, ValidationStatus } from "../../types";
import { cn } from "../../lib/utils";

interface ReceiptValidationProps {
  validationStatus: ValidationStatus | null;
  validationResult: ReceiptValidationResult | null;
}

const statusConfig = {
  valid: {
    icon: CheckCircle,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-900",
    label: "Receipt Validated",
    description: "Receipt matches purchase order requirements",
  },
  invalid: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    textColor: "text-red-900",
    label: "Discrepancies Found",
    description: "Receipt validation identified mismatches",
  },
  error: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    textColor: "text-amber-900",
    label: "Validation Error",
    description: "Unable to complete validation",
  },
  pending: {
    icon: AlertCircle,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    textColor: "text-blue-900",
    label: "Validation Pending",
    description: "Waiting for validation results",
  },
};

const ReceiptValidation: React.FC<ReceiptValidationProps> = ({
  validationStatus,
  validationResult,
}) => {
  if (!validationStatus || !validationResult) {
    return null;
  }

  const config = statusConfig[validationStatus];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-2xl p-8 border-2",
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            validationStatus === "valid"
              ? "bg-emerald-100"
              : validationStatus === "invalid"
              ? "bg-red-100"
              : validationStatus === "error"
              ? "bg-amber-100"
              : "bg-blue-100"
          )}
        >
          <StatusIcon className={cn("w-6 h-6", config.iconColor)} />
        </div>
        <div className="flex-1">
          <h3 className={cn("text-lg font-bold mb-1", config.textColor)}>
            {config.label}
          </h3>
          <p className="text-sm text-gray-600">
            {validationResult.summary || config.description}
          </p>
        </div>
        {validationResult.confidence_score > 0 && (
          <div className="text-right">
            <div className={cn("text-2xl font-bold", config.textColor)}>
              {validationResult.confidence_score}%
            </div>
            <div className="text-xs text-gray-500">Confidence</div>
          </div>
        )}
      </div>

      {/* Extracted Data */}
      {validationResult.extracted_data &&
        Object.keys(validationResult.extracted_data).length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
              Extracted Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationResult.extracted_data.vendor && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">
                      Vendor
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {validationResult.extracted_data.vendor}
                  </p>
                </div>
              )}
              {validationResult.extracted_data.total_amount && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">
                      Total Amount
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ${validationResult.extracted_data.total_amount}
                  </p>
                </div>
              )}
            </div>

            {validationResult.extracted_data.items &&
              validationResult.extracted_data.items.length > 0 && (
                <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">
                      Items Found
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {validationResult.extracted_data.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

      {/* Discrepancies */}
      {validationResult.discrepancies &&
        validationResult.discrepancies.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
              {validationStatus === "invalid" ? "Issues Found" : "Notes"}
            </h4>
            <div className="space-y-2">
              {validationResult.discrepancies.map((discrepancy, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-xl border-2",
                    validationStatus === "invalid"
                      ? "bg-white border-red-200"
                      : "bg-white border-amber-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={cn(
                        "w-5 h-5 shrink-0 mt-0.5",
                        validationStatus === "invalid"
                          ? "text-red-500"
                          : "text-amber-500"
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                        {discrepancy.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-700">
                        {discrepancy.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Error Message */}
      {validationResult.error && (
        <div className="mt-4 p-4 bg-white rounded-xl border-2 border-red-200">
          <p className="text-sm text-red-700 font-medium">
            Error: {validationResult.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceiptValidation;
