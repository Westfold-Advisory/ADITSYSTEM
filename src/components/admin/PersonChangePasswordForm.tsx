import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/PasswordField";
import { validatePasswordFields } from "@/lib/person-provisioning";

import { apiErrorMessage } from "./person-display";

export function PersonChangePasswordForm({
  personName,
  onSubmit,
  onCancel,
}: {
  personName: string;
  onSubmit: (newPassword: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validatePasswordFields({
      password,
      confirmPassword,
      requirePassword: true,
    });
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit(password.trim());
      setPassword("");
      setConfirmPassword("");
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="domain-form"
      onSubmit={submit}
      aria-label={`Cambiar contraseña de ${personName}`}
    >
      <div>
        <h2>Cambiar contraseña</h2>
        <p className="form-intro">
          Define una nueva contraseña para {personName}. No es posible ver la
          contraseña actual almacenada.
        </p>
      </div>
      <PasswordField
        label="Nueva contraseña"
        value={password}
        onChange={setPassword}
        error={fieldErrors.password}
      />
      <PasswordField
        label="Confirmar contraseña"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={fieldErrors.confirmPassword}
      />
      {error ? (
        <p className="request-message error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="event-form-actions">
        <Button status={saving ? "loading" : "idle"} type="submit">
          Guardar contraseña
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
