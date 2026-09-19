import * as React from "react";
import {
  cloneElement,
  isValidElement,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";

void React;

import { cn } from "@/lib/utils";

type FieldProps = ComponentProps<"div"> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({
  label,
  hint,
  error,
  children,
  className,
  ...props
}: FieldProps) {
  const id = useId();
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("ui-field", className)} {...props}>
      <label htmlFor={id}>{label}</label>
      {isValidElement<ComponentProps<"input">>(children)
        ? cloneElement(children, {
            id: children.props.id ?? id,
            "aria-describedby":
              children.props["aria-describedby"] ?? descriptionId,
            "aria-invalid": Boolean(error) || children.props["aria-invalid"],
            className: cn("ui-control", children.props.className),
          })
        : children}
      {error ? (
        <p id={`${id}-error`} className="ui-field-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="ui-field-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
