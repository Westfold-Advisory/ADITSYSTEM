import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";
import type { Person, PersonInput } from "@/types/domain";

import { apiErrorMessage, nameOf, roleLabel } from "./person-display";

const empty: PersonInput = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
};

export function PersonForm({
  role,
  parent,
  initialValues = empty,
  submitLabel = "Guardar",
  onSave,
  onCancel,
}: {
  role: Person["role"];
  parent: Person;
  initialValues?: PersonInput;
  submitLabel?: string;
  onSave: (input: PersonInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PersonInput>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      setValues(empty);
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
      aria-label={`Registrar ${roleLabel(role)}`}
    >
      <div>
        <h2>
          {submitLabel === "Guardar" ? "Registrar" : "Editar"} {roleLabel(role)}
        </h2>
        <p className="form-intro">
          Se agregará bajo {nameOf(parent)}. No necesitas capturar un
          identificador.
        </p>
      </div>
      <div className="form-section">
        <p className="eyebrow">Tipo de registro</p>
        <span className="role-chip" data-role={role}>
          {roleLabel(role)}
        </span>
      </div>
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
