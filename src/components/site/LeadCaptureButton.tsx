"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/primitives";
import { useLeadCapture } from "./LeadCapture";

/**
 * Drop-in replacement for `ButtonLink` on server-rendered marketing pages:
 * same visual styling (shares Button's classes), but opens the lead-capture
 * modal instead of navigating to the (not-yet-real) portal onboarding.
 */
export function LeadCaptureButton({
  children,
  serviceLabel,
  detail,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  serviceLabel: string;
  detail?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const { openLeadCapture } = useLeadCapture();
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => openLeadCapture({ kind: "service", serviceLabel, detail })}
    >
      {children}
    </Button>
  );
}
