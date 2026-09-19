import * as React from "react";
import type { ComponentProps } from "react";

void React;

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"article">) {
  return <article className={cn("ui-card", className)} {...props} />;
}
