import * as React from "react";
import type { ComponentProps } from "react";

void React;

import { roleLabel } from "@/lib/role-label";
import { cn } from "@/lib/utils";
import type { PersonRole } from "@/types/domain";

export function RoleChip({
  role,
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & { role: PersonRole }) {
  return (
    <span className={cn("ui-role-chip", className)} data-role={role} {...props}>
      {roleLabel(role)}
    </span>
  );
}
