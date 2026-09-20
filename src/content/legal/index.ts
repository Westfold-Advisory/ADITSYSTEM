import { getInstitutionConfig } from "@/config/institution";
import { buildPrivacyNotice } from "./build-privacy-notice";
import type { PrivacyNoticeContent, PrivacyNoticeKind } from "./types";

export type {
  PrivacyNoticeContent,
  PrivacyNoticeKind,
  PrivacyNoticeSection,
} from "./types";

export { buildPrivacyNotice } from "./build-privacy-notice";
export { buildLegalNotice } from "./build-legal-notice";
export type { LegalNoticeContent } from "./build-legal-notice";

export function getPrivacyNotice(
  kind: PrivacyNoticeKind,
  institution = getInstitutionConfig(),
): PrivacyNoticeContent {
  return buildPrivacyNotice(kind, institution);
}

export function formatPrivacyEffectiveDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
