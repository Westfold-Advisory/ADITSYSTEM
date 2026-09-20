import * as React from "react";
import type { ComponentProps } from "react";

void React;

import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/events";

import { eventStatusLabels, eventStatusSlug } from "./event-labels";

export type EventStatusBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  status: EventStatus;
};

export function EventStatusBadge({
  status,
  className,
  ...props
}: EventStatusBadgeProps) {
  const label = eventStatusLabels[status];
  return (
    <span
      className={cn(
        "public-event-status",
        `public-event-status--${eventStatusSlug(status)}`,
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}
