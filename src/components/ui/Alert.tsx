import * as React from "react";
import type { ComponentProps, ReactNode } from "react";

void React;

import { cn } from "@/lib/utils";

export function Alert({
  tone = "info",
  title,
  children,
  className,
  ...props
}: ComponentProps<"div"> & {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("ui-alert", `ui-alert--${tone}`, className)}
      role={tone === "error" ? "alert" : "status"}
      {...props}
    >
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
