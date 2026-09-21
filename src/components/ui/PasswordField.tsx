import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";

export function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete = "new-password",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const toggleLabel = visible ? "Ocultar" : "Mostrar";

  const copy = async () => {
    setCopyFeedback(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback("Contraseña copiada al portapapeles.");
    } catch {
      setCopyFeedback("No pudimos copiar al portapapeles.");
    }
  };

  return (
    <Field label={label} error={error}>
      <div className="password-field-row">
        <input
          id={id}
          className="ui-control"
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="password-field-actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`${toggleLabel} ${label.toLowerCase()}`}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {toggleLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Copiar ${label.toLowerCase()}`}
            disabled={!value}
            onClick={() => void copy()}
          >
            Copiar
          </Button>
        </div>
      </div>
      {copyFeedback ? (
        <p
          className={
            copyFeedback.includes("No pudimos")
              ? "ui-field-error"
              : "ui-field-hint"
          }
          role="status"
        >
          {copyFeedback}
        </p>
      ) : null}
    </Field>
  );
}
