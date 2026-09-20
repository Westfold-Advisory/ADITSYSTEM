import {
  formatPrivacyEffectiveDate,
  getPrivacyNotice,
  type PrivacyNoticeKind,
} from "@/content/legal";

type PrivacyNoticePageProps = {
  kind: PrivacyNoticeKind;
};

export function PrivacyNoticePage({ kind }: PrivacyNoticePageProps) {
  const notice = getPrivacyNotice(kind);
  const otherKind = kind === "integral" ? "simplificado" : "integral";
  const otherHref =
    otherKind === "simplificado" ? "/privacidad/simplificado" : "/privacidad";
  const otherLabel =
    otherKind === "simplificado"
      ? "Ver aviso simplificado"
      : "Ver aviso integral";

  return (
    <div className="privacy-notice-page" aria-labelledby="privacy-notice-title">
      <div className="privacy-notice-banner" role="note">
        <strong>LEGAL REVIEW REQUIRED.</strong> Este aviso es un borrador
        estructural con placeholders. No sustituye asesoría jurídica ni
        publicación oficial.
      </div>

      <header className="privacy-notice-header">
        <p className="eyebrow">Privacidad</p>
        <h1 id="privacy-notice-title">{notice.title}</h1>
        <p className="privacy-notice-meta">
          Versión {notice.version} · Vigente desde{" "}
          <time dateTime={notice.effectiveDate}>
            {formatPrivacyEffectiveDate(notice.effectiveDate)}
          </time>
        </p>
        <p className="privacy-notice-summary">{notice.summary}</p>
        <p className="privacy-notice-alt">
          <a href={otherHref}>{otherLabel}</a>
        </p>
      </header>

      {notice.sections.map((section, index) => (
        <section
          key={section.id}
          className="privacy-notice-section"
          aria-labelledby={`privacy-section-${section.id}`}
        >
          <h2 id={`privacy-section-${section.id}`}>
            {index + 1}. {section.title}
            {section.placeholder ? (
              <span className="privacy-placeholder-tag">
                {" "}
                (contenido pendiente)
              </span>
            ) : null}
          </h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
