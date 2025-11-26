import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  action,
}) => (
  <div
    className={cn(
      "bg-white rounded-xl border border-gray-100 shadow-[0_2px_20px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
      className
    )}
  >
    {title && (
      <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
        <h3 className="font-semibold text-lg text-[#111] tracking-tight">
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);
