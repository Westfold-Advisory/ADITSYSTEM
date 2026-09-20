import * as React from "react";
import type { ComponentProps } from "react";

void React;

import { cn } from "@/lib/utils";
import type { PersonStatus } from "@/types/domain";

import { personStatusLabels, personStatusSlug } from "./person-status-labels";

export type PersonStatusBadgeProps = Omit<
  ComponentProps<"span">,
  "children"
> & {
  status: PersonStatus;
};

export function PersonStatusBadge({
  status,
  className,
  ...props
}: PersonStatusBadgeProps) {
  return (
    <span
      className={cn(
        "person-status-badge",
        `person-status-badge--${personStatusSlug(status)}`,
        className,
      )}
      {...props}
    >
      {personStatusLabels[status]}
    </span>
  );
}
