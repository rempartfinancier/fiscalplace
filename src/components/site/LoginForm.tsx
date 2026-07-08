"use client";

import { useState } from "react";

import type { Locale, Localized } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { Badge, Button, ButtonLink, Card, TrustLine } from "@/components/ui/primitives";

/**
 * Login form — client component. There is no auth backend at launch: the form
 * validates, then honestly explains that real accounts are not open yet
 * [OUVERTURE DES COMPTES RÉELS À LA MISE EN PRODUCTION] and routes the visitor
 * to the public demo instead of leaving a dead end.
 */

interface FormCopy {
  fields: {
    email: { label: string; placeholder: string };
    password: { label: string; placeholder: string };
  };
  errors: {
    email: string;
    password: string;
  };
  submit: string;
  notOpen: {
    badge: string;
    title: string;
    body: string;
    placeholder: string;
    demoNote: string;
    demoCta: string;
    back: string;
  };
}

const copy: Localized<FormCopy> = {
  fr: {
    fields: {
      email: { label: "Votre email", placeholder: "vous@exemple.com" },
      password: { label: "Votre mot de passe", placeholder: "••••••••" },
    },
    errors: {
      email: "Indiquez une adresse email valide.",
      password: "Indiquez votre mot de passe.",
    },
    submit: "Se connecter",
    notOpen: {
      badge: "Pas encore ouvert",
      title: "Les connexions ouvriront avec les premiers dossiers",
      body: "Ce formulaire fonctionne, mais aucun compte client réel n'existe encore : la création de comptes ouvrira à la mise en production, en même temps que les premiers dossiers.",
      placeholder: "[OUVERTURE DES COMPTES RÉELS À LA MISE EN PRODUCTION]",
      demoNote:
        "En attendant, le compte de démonstration montre exactement ce que vous verrez une fois connecté — dossiers, documents, messages, facturation — avec des données fictives.",
      demoCta: "Explorer le compte de démonstration",
      back: "Revenir au formulaire",
    },
  },
  en: {
    fields: {
      email: { label: "Your email", placeholder: "you@example.com" },
      password: { label: "Your password", placeholder: "••••••••" },
    },
    errors: {
      email: "Enter a valid email address.",
      password: "Enter your password.",
    },
    submit: "Log in",
    notOpen: {
      badge: "Not open yet",
      title: "Logins will open with the first claims",
      body: "This form works, but no real client account exists yet: account creation opens at go-live, together with the first claims.",
      placeholder: "[REAL ACCOUNT OPENING AT PRODUCTION LAUNCH]",
      demoNote:
        "In the meantime, the demo account shows exactly what you will see once logged in — claims, documents, messages, billing — with fictitious data.",
      demoCta: "Explore the demo account",
      back: "Back to the form",
    },
  },
};

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = t.errors.email;
    if (password.length === 0) next.password = t.errors.password;
    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
  }

  function reset() {
    setSubmitted(false);
    setPassword("");
    setErrors({});
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="animate-stamp rounded-[6px] border border-rule bg-white p-5 sm:p-8"
      >
        <Badge tone="gold">{t.notOpen.badge}</Badge>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          {t.notOpen.title}
        </h2>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-mine">
          {t.notOpen.body}
        </p>
        <p className="mt-2 font-mono text-xs text-mine">{t.notOpen.placeholder}</p>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-mine">
          {t.notOpen.demoNote}
        </p>
        <div className="mt-5 flex flex-col items-start gap-2">
          <ButtonLink href={href(locale, "portal")}>{t.notOpen.demoCta}</ButtonLink>
          <TrustLine text={common.trustLine} />
        </div>
        <div className="mt-4">
          <Button variant="secondary" onClick={reset}>
            {t.notOpen.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-5 sm:p-8">
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink">
            {t.fields.email.label}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.fields.email.placeholder}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="mt-1.5 text-sm text-debit">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            {t.fields.password.label}
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.fields.password.placeholder}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
          />
          {errors.password && (
            <p id="login-password-error" role="alert" className="mt-1.5 text-sm text-debit">
              {errors.password}
            </p>
          )}
        </div>

        <div className="mt-5">
          <Button type="submit">{t.submit}</Button>
        </div>
      </form>
    </Card>
  );
}
