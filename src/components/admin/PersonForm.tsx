import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import {
  isAuthenticatableRole,
  validateEmailForRole,
  validatePasswordFields,
  type PersonCreateOption,
} from "@/lib/person-provisioning";
import type { Person, PersonInput, PersonProvisionInput } from "@/types/domain";

import { RoleChip } from "@/components/ui/RoleChip";

import { apiErrorMessage, nameOf, roleLabel } from "./person-display";

const empty: PersonInput = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
};

export function PersonForm({
  mode,
  createOptions,
  initialCreateOption,
  parent,
  initialValues = empty,
  submitLabel = "Guardar",
  onSaveCreate,
  onSaveUpdate,
  onCancel,
}: {
  mode: "create" | "edit";
  createOptions?: PersonCreateOption[];
  initialCreateOption?: PersonCreateOption;
  parent: Person;
  initialValues?: PersonInput;
  submitLabel?: string;
  onSaveCreate?: (
    input: PersonProvisionInput,
    option: PersonCreateOption,
  ) => Promise<void>;
  onSaveUpdate?: (input: PersonInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PersonInput>(initialValues);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedOptionKey, setSelectedOptionKey] = useState(
    initialCreateOption
      ? `${initialCreateOption.role}:${initialCreateOption.parentId ?? "root"}`
      : "",
  );
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const optionByKey = useMemo(() => {
    const map = new Map<string, PersonCreateOption>();
    for (const option of createOptions ?? []) {
      map.set(`${option.role}:${option.parentId ?? "root"}`, option);
    }
    return map;
  }, [createOptions]);

  const selectedOption =
    mode === "create"
      ? (optionByKey.get(selectedOptionKey) ?? initialCreateOption ?? null)
      : null;

  const role = mode === "edit" ? parent.role : selectedOption?.role;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setError(null);

    if (mode === "edit") {
      setSaving(true);
      try {
        await onSaveUpdate?.(values);
        setValues(empty);
      } catch (reason) {
        setError(apiErrorMessage(reason));
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!selectedOption || !role) {
      setError("Selecciona un tipo de registro válido.");
      return;
    }

    const nextErrors: typeof fieldErrors = {};
    if (isAuthenticatableRole(role)) {
      const emailError = validateEmailForRole(email, role);
      if (emailError) nextErrors.email = emailError;
      Object.assign(
        nextErrors,
        validatePasswordFields({
          password,
          confirmPassword,
          requirePassword: true,
        }),
      );
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await onSaveCreate?.(
        {
          ...values,
          email: isAuthenticatableRole(role) ? email.trim() : undefined,
          password: isAuthenticatableRole(role) ? password : undefined,
        },
        selectedOption,
      );
      setValues(empty);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  const parentLabel =
    mode === "create" && selectedOption?.parentPerson
      ? nameOf(selectedOption.parentPerson)
      : mode === "create" && selectedOption?.parentId === null
        ? "Raíz del sistema"
        : nameOf(parent);

  return (
    <form
      className="domain-form"
      onSubmit={submit}
      aria-label={
        mode === "create" && role
          ? `Registrar ${roleLabel(role)}`
          : "Editar datos personales"
      }
    >
      <div>
        <h2>
          {mode === "create" ? "Registrar" : "Editar"}{" "}
          {role ? roleLabel(role) : "persona"}
        </h2>
        <p className="form-intro">
          {mode === "create"
            ? `Se agregará bajo ${parentLabel}. No necesitas capturar un identificador.`
            : "Actualiza los datos personales visibles en la ficha."}
        </p>
      </div>

      {mode === "create" && createOptions && createOptions.length > 1 ? (
        <Field label="Tipo de registro">
          <select
            className="ui-control"
            value={selectedOptionKey}
            onChange={(event) => setSelectedOptionKey(event.target.value)}
          >
            {createOptions.map((option) => {
              const key = `${option.role}:${option.parentId ?? "root"}`;
              const parentSuffix = option.parentPerson
                ? ` · bajo ${nameOf(option.parentPerson)}`
                : " · raíz";
              return (
                <option key={key} value={key}>
                  {roleLabel(option.role)}
                  {parentSuffix}
                </option>
              );
            })}
          </select>
        </Field>
      ) : null}

      {role ? (
        <div className="form-section">
          <p className="eyebrow">Tipo de registro</p>
          <RoleChip role={role} />
        </div>
      ) : null}

      <p className="eyebrow">Datos personales</p>
      <div className="event-form-grid">
        <Field label="Nombre">
          <input
            required
            maxLength={120}
            value={values.nombre}
            onChange={(e) => setValues({ ...values, nombre: e.target.value })}
          />
        </Field>
        <Field label="Apellido paterno">
          <input
            required
            maxLength={120}
            value={values.apellidoPaterno}
            onChange={(e) =>
              setValues({ ...values, apellidoPaterno: e.target.value })
            }
          />
        </Field>
        <Field label="Apellido materno">
          <input
            required
            maxLength={120}
            value={values.apellidoMaterno}
            onChange={(e) =>
              setValues({ ...values, apellidoMaterno: e.target.value })
            }
          />
        </Field>
        <Field label="Teléfono">
          <input
            required
            maxLength={30}
            value={values.telefono}
            onChange={(e) => setValues({ ...values, telefono: e.target.value })}
          />
        </Field>
      </div>

      {mode === "create" && role && isAuthenticatableRole(role) ? (
        <div className="form-section">
          <p className="eyebrow">Acceso al sistema</p>
          <p className="form-intro">
            El usuario iniciará sesión con correo electrónico y contraseña.
          </p>
          <div className="event-form-grid">
            <Field label="Correo electrónico" error={fieldErrors.email}>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>
          <PasswordField
            label="Contraseña"
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
        </div>
      ) : null}

      {error && (
        <p className="request-message error" role="alert">
          {error}
        </p>
      )}
      <div className="event-form-actions">
        <Button status={saving ? "loading" : "idle"} type="submit">
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
