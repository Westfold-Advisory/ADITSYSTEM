import * as React from "react";
import type { ComponentProps, ReactNode } from "react";

void React;

import { cn } from "@/lib/utils";

export type MetricGridItem = {
  id?: string;
  label: string;
  value: ReactNode;
};

export function MetricGrid({
  items,
  columns = 3,
  className,
  ...props
}: Omit<ComponentProps<"dl">, "children"> & {
  items: readonly MetricGridItem[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <dl
      className={cn("ui-metric-grid", className)}
      data-columns={String(columns)}
      {...props}
    >
      {items.map((item) => (
        <div key={item.id ?? item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
