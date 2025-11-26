import React from "react";
import { cn } from "../../lib/utils";
import { RequestStatus } from "../../types";

interface BadgeProps {
  status: RequestStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles: Record<RequestStatus, string> = {
    PENDING:
      "bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/10",
    APPROVED:
      "bg-[#ccff00]/20 text-green-900 border-[#ccff00]/40 ring-green-600/20",
    REJECTED: "bg-red-50 text-red-700 border-red-100 ring-red-500/10",
  };

  const normalizedStatus = status.toUpperCase() as RequestStatus;
  const label = status.replace("_", " ");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset border",
        styles[normalizedStatus] || "bg-gray-50 text-gray-600 ring-gray-500/10"
      )}
    >
      {label}
    </span>
  );
};
