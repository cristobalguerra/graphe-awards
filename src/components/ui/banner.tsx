"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "./button";

const bannerVariants = cva(
  "relative overflow-hidden rounded-full border shadow-lg text-sm",
  {
    variants: {
      variant: {
        default: "bg-white/[0.05] border-white/[0.1] text-white",
        success: "bg-green-900/20 border-green-800 text-green-100",
        warning: "bg-amber-900/20 border-amber-800 text-amber-100",
        info: "bg-blue-900/20 border-blue-800 text-blue-100",
        premium: "bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800 text-purple-100",
        gradient: "bg-white/[0.05] border-white/[0.1] text-white",
      },
      size: {
        default: "py-1.5 px-4",
        sm: "text-xs py-1 px-3",
        lg: "text-lg py-4 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type BannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants> & {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    showShade?: boolean;
    show?: boolean;
    onHide?: () => void;
    action?: React.ReactNode;
    closable?: boolean;
    autoHide?: number;
  };

export function Banner({
  variant = "default",
  size = "default",
  title,
  description,
  icon,
  showShade = false,
  show,
  onHide,
  action,
  closable = false,
  className,
  autoHide,
  ...props
}: BannerProps) {
  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        onHide?.();
      }, autoHide);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onHide]);

  if (!show) return null;

  return (
    <div
      className={cn(bannerVariants({ variant, size }), className)}
      role="status"
      {...props}
    >
      {showShade && (
        <div className="absolute inset-0 -z-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center">
              <p className="truncate font-semibold">{title}</p>
            </div>
            {description && <p className="text-xs opacity-80">{description}</p>}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {action && action}
          {closable && (
            <Button onClick={onHide} size="icon" variant="ghost" className="h-8 w-8 rounded-full">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
