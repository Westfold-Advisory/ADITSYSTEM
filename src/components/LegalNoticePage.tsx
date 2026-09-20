import { getInstitutionConfig } from "@/config/institution";
import { buildLegalNotice, formatPrivacyEffectiveDate } from "@/content/legal";
import { DemoEnvironmentBanner } from "./DemoEnvironmentBanner";

export function LegalNoticePage() {
  const institution = getInstitutionConfig();
  const notice = buildLegalNotice(institution);

  return (
    <div className="legal-notice-page" aria-labelledby="legal-notice-title">
      {institution.demoDisclaimer ? (
        <DemoEnvironmentBanner disclaimer={institution.demoDisclaimer} />
      ) : null}

      <header className="legal-notice-header">
        <p className="eyebrow">Legal</p>
        <h1 id="legal-notice-title">{notice.title}</h1>
        <p className="legal-notice-meta">
          Versión {notice.version} · Vigente desde{" "}
          <time dateTime={notice.effectiveDate}>
            {formatPrivacyEffectiveDate(notice.effectiveDate)}
          </time>
        </p>
        <p className="legal-notice-summary">{notice.summary}</p>
      </header>

      {notice.sections.map((section, index) => (
        <section
          key={section.id}
          className="legal-notice-section"
          aria-labelledby={`legal-section-${section.id}`}
        >
          <h2 id={`legal-section-${section.id}`}>
            {index + 1}. {section.title}
          </h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
