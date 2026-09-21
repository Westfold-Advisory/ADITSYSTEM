import * as React from "react";
import { useState, type FormEvent } from "react";

void React;

import { AuthApi, type LoginResponse } from "@/api/auth";
import { ApiClient } from "@/api/http";
import {
  loginFailureMessage,
  SESSION_EXPIRED_MESSAGE,
} from "@/lib/auth-messages";
import { getInstitutionConfig } from "@/config/institution";
import { InstitutionBrandMark } from "./InstitutionBrandMark";
import { InstitutionDeploymentIdentity } from "./InstitutionDeploymentIdentity";
import { LoginPrivacyCallout } from "./LoginPrivacyCallout";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/button";
import { Card } from "./ui/Card";
import { Field } from "./ui/Field";

export type LoginPageProps = {
  onLogin: (session: LoginResponse) => void;
  /** Mensaje inicial (p. ej. sesión expirada al volver del admin). */
  initialNotice?: string | null;
};

export function LoginPage({ onLogin, initialNotice = null }: LoginPageProps) {
  const institution = getInstitutionConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const error = submitError ?? initialNotice ?? null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      onLogin(await new AuthApi(new ApiClient()).login(email, password));
    } catch (loginError) {
      setSubmitError(loginFailureMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-page__card">
        <header className="login-page__header">
          <InstitutionBrandMark
            institution={institution}
            className="login-page__brand"
            logoClassName="login-page__logo"
            productClassName="login-page__product"
          />
          <InstitutionDeploymentIdentity
            institution={institution}
            className="login-page__institution-block"
            nameClassName="login-page__institution"
            taglineClassName="login-page__environment-tagline"
          />
          <h1 className="login-page__title">Acceso administrativo</h1>
          <p className="login-page__intro">
            Inicia sesión con una cuenta autorizada para administrar personas,
            eventos y la estructura organizacional.
          </p>
        </header>

        <form className="login-page__form" onSubmit={submit}>
          <Field label="Correo electrónico">
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Contraseña">
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && (
            <Alert
              tone={error === SESSION_EXPIRED_MESSAGE ? "warning" : "error"}
              title={
                error === SESSION_EXPIRED_MESSAGE
                  ? "Sesión finalizada"
                  : "No pudimos iniciar sesión"
              }
            >
              {error}
            </Alert>
          )}
          <Button
            className="login-page__submit"
            size="lg"
            status={isSubmitting ? "loading" : "idle"}
            type="submit"
          >
            Iniciar sesión
          </Button>
        </form>

        <LoginPrivacyCallout presentation={institution.loginPrivacy} />
      </Card>
    </div>
  );
}
