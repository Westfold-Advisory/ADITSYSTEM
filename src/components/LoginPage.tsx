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
import { privacyNoticeSimplificado } from "@/content/legal/privacy-notice-simplificado";
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
  const [error, setError] = useState<string | null>(initialNotice);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      onLogin(await new AuthApi(new ApiClient()).login(email, password));
    } catch (loginError) {
      setError(loginFailureMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-page__card">
        <header className="login-page__header">
          <p className="login-page__product">{institution.productName}</p>
          <p className="login-page__institution">
            {institution.institutionName}
          </p>
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

        <p className="login-page__privacy">
          {privacyNoticeSimplificado.summary}{" "}
          <a href={institution.privacySummaryPath}>
            Leer resumen de privacidad
          </a>
          {" · "}
          <a href={institution.privacyIntegralPath}>Aviso integral</a>
        </p>
      </Card>
    </div>
  );
}
