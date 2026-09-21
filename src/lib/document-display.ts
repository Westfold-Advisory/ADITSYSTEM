import type { DocumentType, Documento } from "@/types/domain";

const TYPE_LABELS: Record<DocumentType, string> = {
  CV: "Currículum",
  FOTO: "Fotografía",
  IDENTIFICACION: "Identificación",
  OTRO: "Otro",
};

export function documentTypeLabel(type: DocumentType): string {
  return TYPE_LABELS[type];
}

const FORMAT_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "Imagen JPG",
  "image/png": "Imagen PNG",
  "image/webp": "Imagen WebP",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",
};

/** Etiqueta legible del formato de archivo; evita mostrar el tipo MIME crudo. */
export function formatDocumentFormat(mimeType: string): string {
  return (
    FORMAT_LABELS[mimeType] ??
    mimeType.split("/")[1]?.toUpperCase() ??
    "Archivo"
  );
}

export function formatDocumentSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDocumentDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function currentDocumentOfType(
  documents: Documento[],
  type: DocumentType,
): Documento | undefined {
  return documents.find((doc) => doc.type === type && doc.isCurrent);
}

/** Builds a private object key; never shown in the UI. */
export function buildPrivateObjectKey(
  personId: string,
  type: DocumentType,
  fileName: string,
): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const unique = crypto.randomUUID();
  return `personas/${personId}/${type.toLowerCase()}/${unique}/${sanitized || "archivo"}`;
}

export function documentSummaryLine(doc: Documento): string {
  return `${documentTypeLabel(doc.type)} · v${doc.version} · ${formatDocumentSize(doc.sizeBytes)}${doc.isCurrent ? " · vigente" : ""}`;
}
