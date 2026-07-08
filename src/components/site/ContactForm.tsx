"use client";

import { useState } from "react";

import type { Locale, Localized } from "@/lib/i18n";
import { getCommon } from "@/content/common";
import { Badge, Button, Card, TrustLine } from "@/components/ui/primitives";

/**
 * Contact form — client component. Submission is mocked for launch (no
 * backend): validation runs, then a confirmation panel is shown, carrying
 * the same action name as the submit button ("Message envoyé" / "Message
 * sent") plus the direct-email fallback so nobody is left without a route.
 */

type SubjectKey = "claim" | "partner" | "press" | "other";

const SUBJECT_KEYS: SubjectKey[] = ["claim", "partner", "press", "other"];

const CONTACT_EMAIL = "contact@fiscalplace.com";

interface FormCopy {
  fields: {
    name: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    subject: { label: string; options: Record<SubjectKey, string> };
    message: { label: string; placeholder: string; hint: string };
  };
  errors: {
    name: string;
    email: string;
    message: string;
    summary: string;
  };
  submit: string;
  sent: {
    badge: string;
    title: string;
    bodyBefore: string;
    bodyAfter: string;
    subjectLine: string;
    fallbackBefore: string;
    fallbackAfter: string;
    again: string;
  };
}

const copy: Localized<FormCopy> = {
  fr: {
    fields: {
      name: { label: "Votre nom", placeholder: "Prénom et nom" },
      email: { label: "Votre email", placeholder: "vous@exemple.com" },
      subject: {
        label: "Sujet",
        options: {
          claim: "Question sur un dossier",
          partner: "Partenariat CGP / gestion de patrimoine",
          press: "Presse",
          other: "Autre",
        },
      },
      message: {
        label: "Votre message",
        placeholder:
          "Plus votre question est précise (pays, montants, période), plus notre première réponse sera utile.",
        hint: "Ne joignez aucun document ici : si un dossier s'ouvre, tout passe par l'espace client chiffré.",
      },
    },
    errors: {
      name: "Indiquez votre nom pour que nous sachions à qui répondre.",
      email: "Indiquez une adresse email valide : c'est là que la réponse arrivera.",
      message: "Écrivez au moins une phrase — même courte, mais une vraie question.",
      summary: "Le formulaire contient des erreurs : corrigez les champs signalés ci-dessus.",
    },
    submit: "Envoyer le message",
    sent: {
      badge: "Envoyé",
      title: "Message envoyé",
      bodyBefore: "Nous vous répondons sous 2 jours ouvrés à",
      bodyAfter:
        "— une vraie réponse, pas un accusé de réception automatique. Si la question dépasse notre périmètre, nous vous le dirons aussi.",
      subjectLine: "Sujet",
      fallbackBefore: "Pas de réponse sous 2 jours ouvrés ? Écrivez directement à",
      fallbackAfter: "et mentionnez ce premier message.",
      again: "Envoyer un autre message",
    },
  },
  en: {
    fields: {
      name: { label: "Your name", placeholder: "First and last name" },
      email: { label: "Your email", placeholder: "you@example.com" },
      subject: {
        label: "Subject",
        options: {
          claim: "Question about a claim",
          partner: "Partnership (wealth managers / advisers)",
          press: "Press",
          other: "Other",
        },
      },
      message: {
        label: "Your message",
        placeholder:
          "The more precise your question (country, amounts, period), the more useful our first reply will be.",
        hint: "Do not attach documents here: if a claim opens, everything goes through the encrypted client area.",
      },
    },
    errors: {
      name: "Tell us your name so we know who to reply to.",
      email: "Enter a valid email address: that is where the reply will land.",
      message: "Write at least one sentence — short is fine, but make it a real question.",
      summary: "The form has errors: please fix the highlighted fields above.",
    },
    submit: "Send the message",
    sent: {
      badge: "Sent",
      title: "Message sent",
      bodyBefore: "We will reply within 2 business days at",
      bodyAfter:
        "— a real answer, not an automated acknowledgement. If your question is outside our scope, we will say that too.",
      subjectLine: "Subject",
      fallbackBefore: "No reply within 2 business days? Email us directly at",
      fallbackAfter: "and mention this first message.",
      again: "Send another message",
    },
  },
};

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<SubjectKey>("claim");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (name.trim().length === 0) next.name = t.errors.name;
    if (!EMAIL_RE.test(email.trim())) next.email = t.errors.email;
    if (message.trim().length < 10) next.message = t.errors.message;
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
    setMessage("");
    setErrors({});
  }

  if (submitted) {
    return (
      <div role="status" className="animate-stamp rounded-[6px] border border-rule bg-white p-5 sm:p-8">
        <Badge tone="green">{t.sent.badge}</Badge>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">{t.sent.title}</h2>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-mine">
          {t.sent.bodyBefore} <span className="font-mono text-ink">{email.trim()}</span>{" "}
          {t.sent.bodyAfter}
        </p>
        <p className="mt-3 font-mono text-[13px] text-mine">
          {t.sent.subjectLine} · {t.fields.subject.options[subject]}
        </p>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-mine">
          {t.sent.fallbackBefore}{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-brand underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          {t.sent.fallbackAfter}
        </p>
        <div className="mt-5">
          <Button variant="secondary" onClick={reset}>
            {t.sent.again}
          </Button>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card className="p-5 sm:p-8">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
              {t.fields.name.label}
            </label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.fields.name.placeholder}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
            />
            {errors.name && (
              <p id="contact-name-error" role="alert" className="mt-1.5 text-sm text-debit">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
              {t.fields.email.label}
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.fields.email.placeholder}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
            />
            {errors.email && (
              <p id="contact-email-error" role="alert" className="mt-1.5 text-sm text-debit">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-ink">
            {t.fields.subject.label}
          </label>
          <select
            id="contact-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value as SubjectKey)}
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
          >
            {SUBJECT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t.fields.subject.options[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
            {t.fields.message.label}
          </label>
          <textarea
            id="contact-message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.fields.message.placeholder}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message ? "contact-message-error contact-message-hint" : "contact-message-hint"
            }
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
          />
          <p id="contact-message-hint" className="mt-1.5 text-xs text-mine">
            {t.fields.message.hint}
          </p>
          {errors.message && (
            <p id="contact-message-error" role="alert" className="mt-1.5 text-sm text-debit">
              {errors.message}
            </p>
          )}
        </div>

        {hasErrors && (
          <p role="alert" className="mt-4 text-sm text-debit">
            {t.errors.summary}
          </p>
        )}

        <div className="mt-5 flex flex-col items-start gap-2">
          <Button type="submit">{t.submit}</Button>
          <TrustLine text={common.trustLine} />
        </div>
      </form>
    </Card>
  );
}
