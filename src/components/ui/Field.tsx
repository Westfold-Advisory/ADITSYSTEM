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

type LabelledControlProps = ComponentProps<"input"> &
  ComponentProps<"select"> &
  ComponentProps<"textarea">;

function isLabelledControl(
  child: ReactNode,
): child is React.ReactElement<LabelledControlProps> {
  return (
    isValidElement(child) &&
    typeof child.type === "string" &&
    (child.type === "input" ||
      child.type === "select" ||
      child.type === "textarea")
  );
}

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
      {isLabelledControl(children)
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
