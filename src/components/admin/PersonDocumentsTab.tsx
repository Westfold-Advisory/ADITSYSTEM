import { useEffect, useId, useState, type FormEvent } from "react";

import type { DomainApi } from "@/api/domain";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/AsyncState";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/Field";
import {
  buildPrivateObjectKey,
  currentDocumentOfType,
  documentSummaryLine,
  documentTypeLabel,
  formatDocumentDate,
} from "@/lib/document-display";
import {
  DOCUMENT_TYPES,
  type DocumentType,
  type Documento,
} from "@/types/domain";

import { apiErrorMessage } from "./person-display";

function DocumentRecord({ doc }: { doc: Documento }) {
  return (
    <article className="document-record">
      <h4>{doc.title}</h4>
      <p className="document-meta">{documentSummaryLine(doc)}</p>
      <p className="document-meta">
        {doc.mimeType} · registrado el {formatDocumentDate(doc.createdAt)}
      </p>
    </article>
  );
}

function PhotoSlot({ photo }: { photo: Documento | undefined }) {
  if (!photo) {
    return (
      <div className="document-photo-slot document-photo-slot--empty">
        <p>Sin fotografía vigente.</p>
        <p className="document-meta">
          Registra una fotografía para vincular la imagen oficial de la persona.
        </p>
      </div>
    );
  }
  return (
    <div className="document-photo-slot">
      <div className="document-photo-placeholder" aria-hidden="true">
        {photo.mimeType.startsWith("image/") ? "IMG" : "DOC"}
      </div>
      <DocumentRecord doc={photo} />
      <p className="document-meta">
        Vista previa no disponible: el archivo permanece en almacenamiento
        privado.
      </p>
    </div>
  );
}

function DocumentRegistrationForm({
  personId,
  api,
  defaultType,
  onRegistered,
  onCancel,
}: {
  personId: string;
  api: DomainApi;
  defaultType?: DocumentType;
  onRegistered: (doc: Documento) => void;
  onCancel: () => void;
}) {
  const formId = useId();
  const [type, setType] = useState<DocumentType>(defaultType ?? "OTRO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Selecciona un archivo para registrar la metadata.");
      return;
    }
    if (!title.trim()) {
      setError("Indica un título para el documento.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const doc = await api.registerDocument(personId, {
        type,
        title: title.trim(),
        description: description.trim() || null,
        s3Key: buildPrivateObjectKey(personId, type, file.name),
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      onRegistered(doc);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      id={formId}
      className="document-register-form domain-form"
      onSubmit={submit}
      aria-label="Registrar documento"
    >
      <div>
        <h3>Registrar documento</h3>
        <p className="form-intro">
          Captura la metadata del archivo. La clave de almacenamiento se genera
          de forma privada; no se muestra en pantalla. La carga del binario a S3
          se completará en un flujo posterior.
        </p>
      </div>
      <div className="event-form-grid">
        <Field label="Tipo">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as DocumentType)}
          >
            {DOCUMENT_TYPES.map((option) => (
              <option key={option} value={option}>
                {documentTypeLabel(option)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Título">
          <input
            required
            maxLength={255}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Archivo"
        hint="Se usarán nombre, tipo MIME y tamaño. El contenido no se envía aún al servidor."
      >
        <input
          type="file"
          required
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </Field>
      <Field label="Descripción (opcional)">
        <textarea
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      {error && (
        <Alert tone="error" title="No se pudo registrar">
          {error}
        </Alert>
      )}
      <div className="event-form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Registrando…" : "Registrar metadata"}
        </Button>
      </div>
    </form>
  );
}

export function PersonDocumentsTab({
  api,
  personId,
  canRegister,
  registerOpen,
  onRegisterOpenChange,
}: {
  api: DomainApi;
  personId: string;
  canRegister: boolean;
  registerOpen: boolean;
  onRegisterOpenChange: (open: boolean) => void;
}) {
  const [documents, setDocuments] = useState<Documento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void api
      .listDocuments(personId)
      .then((items) => {
        if (!cancelled) setDocuments(items);
      })
      .catch((reason) => {
        if (!cancelled) setError(apiErrorMessage(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [api, personId, attempt]);

  useEffect(() => {
    if (!registerOpen) return;
    setSuccessMessage(null);
  }, [registerOpen]);

  if (documents === null && !error) {
    return <LoadingState label="Cargando documentos…" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setDocuments(null);
          setError(null);
          setAttempt((value) => value + 1);
        }}
      />
    );
  }

  const items = documents ?? [];
  const currentPhoto = currentDocumentOfType(items, "FOTO");
  const currentCv = currentDocumentOfType(items, "CV");
  const currentId = currentDocumentOfType(items, "IDENTIFICACION");
  const history = items.filter(
    (doc) =>
      doc.type === "OTRO" ||
      !doc.isCurrent ||
      (doc.type !== "FOTO" &&
        doc.type !== "CV" &&
        doc.type !== "IDENTIFICACION"),
  );

  const handleRegistered = (doc: Documento) => {
    setDocuments((current) => {
      const next = current ? [...current] : [];
      const retired = next.map((item) =>
        item.type === doc.type && item.isCurrent
          ? { ...item, isCurrent: false }
          : item,
      );
      return [doc, ...retired.filter((item) => item.id !== doc.id)];
    });
    setSuccessMessage(`Se registró “${doc.title}”.`);
    onRegisterOpenChange(false);
  };

  return (
    <div className="person-documents-tab">
      <p className="form-intro">
        Fotografía, currículum e identificación versionados. Solo se muestra
        metadata autorizada; las rutas de almacenamiento privado no aparecen en
        la interfaz.
      </p>

      {successMessage && (
        <Alert tone="success" title="Documento registrado">
          {successMessage}
        </Alert>
      )}

      {registerOpen && canRegister ? (
        <DocumentRegistrationForm
          personId={personId}
          api={api}
          defaultType={currentPhoto ? "OTRO" : "FOTO"}
          onRegistered={handleRegistered}
          onCancel={() => onRegisterOpenChange(false)}
        />
      ) : null}

      <section className="document-section" aria-labelledby="doc-photo-heading">
        <h3 id="doc-photo-heading">Fotografía vigente</h3>
        <PhotoSlot photo={currentPhoto} />
        {canRegister && !currentPhoto && !registerOpen && (
          <Button variant="outline" onClick={() => onRegisterOpenChange(true)}>
            Registrar fotografía
          </Button>
        )}
      </section>

      <section className="document-section" aria-labelledby="doc-cv-heading">
        <h3 id="doc-cv-heading">Currículum vigente</h3>
        {currentCv ? (
          <DocumentRecord doc={currentCv} />
        ) : (
          <EmptyState
            actionLabel={canRegister ? "Registrar currículum" : undefined}
            onAction={
              canRegister ? () => onRegisterOpenChange(true) : undefined
            }
          >
            No hay currículum vigente para esta persona.
          </EmptyState>
        )}
      </section>

      <section className="document-section" aria-labelledby="doc-id-heading">
        <h3 id="doc-id-heading">Identificación vigente</h3>
        {currentId ? (
          <DocumentRecord doc={currentId} />
        ) : (
          <EmptyState>No hay identificación vigente registrada.</EmptyState>
        )}
      </section>

      <section
        className="document-section"
        aria-labelledby="doc-history-heading"
      >
        <h3 id="doc-history-heading">Historial y otros documentos</h3>
        {history.length === 0 ? (
          <EmptyState>
            {items.length === 0
              ? "Esta persona aún no tiene documentos registrados en el sistema."
              : "No hay versiones anteriores ni documentos adicionales."}
          </EmptyState>
        ) : (
          <ul className="document-list">
            {history.map((doc) => (
              <li key={doc.id}>
                <DocumentRecord doc={doc} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
