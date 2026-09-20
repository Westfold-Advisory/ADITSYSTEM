import { privacyNoticeIntegral } from "./privacy-notice-integral";
import { privacyNoticeSimplificado } from "./privacy-notice-simplificado";
import type { PrivacyNoticeContent, PrivacyNoticeKind } from "./types";

export type {
  PrivacyNoticeContent,
  PrivacyNoticeKind,
  PrivacyNoticeSection,
} from "./types";

const byKind: Record<PrivacyNoticeKind, PrivacyNoticeContent> = {
  integral: privacyNoticeIntegral,
  simplificado: privacyNoticeSimplificado,
};

export function getPrivacyNotice(
  kind: PrivacyNoticeKind,
): PrivacyNoticeContent {
  return byKind[kind];
}

export function formatPrivacyEffectiveDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
