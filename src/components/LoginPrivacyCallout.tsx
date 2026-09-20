import * as React from "react";
import type { LoginPrivacyPresentation } from "@/config/institution";

void React;

export type LoginPrivacyCalloutProps = {
  presentation: LoginPrivacyPresentation;
  className?: string;
};

export function LoginPrivacyCallout({
  presentation,
  className = "login-privacy-callout",
}: LoginPrivacyCalloutProps) {
  return (
    <section className={className} aria-labelledby="login-privacy-heading">
      <h2 id="login-privacy-heading" className="login-privacy-callout__heading">
        {presentation.heading}
      </h2>
      {presentation.paragraphs.map((paragraph) => (
        <p key={paragraph} className="login-privacy-callout__body">
          {paragraph}
        </p>
      ))}
      <p className="login-privacy-callout__cta">
        <a href={presentation.cta.href}>{presentation.cta.label}</a>
      </p>
    </section>
  );
}
