"use client";

import { useState } from "react";

import type { Locale, Localized } from "@/lib/i18n";
import { Badge, Button, Card, TrustLine } from "@/components/ui/primitives";

/**
 * Lead-magnet capture form — grafted onto the existing /api/lead pipeline
 * (same endpoint as ContactForm.tsx), tagged with source: "lead_magnet" so
 * the CRM can trace this origin distinctly (see route.ts). Email-only field
 * on purpose: name/message are derived client-side so the visitor is never
 * asked for more than an email address.
 *
 * Delivery is non-negotiable: the PDF button appears whether the CRM
 * ingestion succeeds or fails — the visitor never leaves empty-handed, even
 * if the lead capture itself had a technical hiccup.
 */

const CONTACT_EMAIL = "contact@fiscalplace.com";
const GUIDE_SLUG = "dossier-pret-60-minutes";
export const GUIDE_PDF_PATH = `/guides/${GUIDE_SLUG}.pdf`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Matches BUTTON_STYLES.primary in ui/primitives.tsx (kept local: primitives is read-only foundation). */
const DOWNLOAD_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-[6px] border border-brand bg-brand px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-deep hover:border-brand-deep";

interface FormCopy {
  emailLabel: string;
  emailPlaceholder: string;
  emailError: string;
  submit: string;
  sending: string;
  privacy: string;
  sent: { badge: string; title: string; body: string; download: string; back: string };
  failed: { badge: string; title: string; body: string; download: string; fallbackBefore: string; fallbackAfter: string; back: string };
}

const copy: Localized<FormCopy> = {
  fr: {
    emailLabel: "Votre email",
    emailPlaceholder: "vous@exemple.com",
    emailError: "Indiquez une adresse email valide.",
    submit: "Recevoir le guide (PDF)",
    sending: "Envoi en cours…",
    privacy: "Vos données restent confidentielles. Pas de spam.",
    sent: {
      badge: "Guide prêt",
      title: "Votre guide est prêt à télécharger",
      body: "Le bouton ci-dessous ouvre directement le PDF.",
      download: "Télécharger le guide (PDF)",
      back: "Recevoir avec une autre adresse",
    },
    failed: {
      badge: "Enregistrement échoué",
      title: "Une erreur technique a empêché l'enregistrement de votre demande",
      body: "Vos informations n'ont pas été transmises, mais voici tout de même votre guide : le téléchargement ne dépend pas de cette erreur.",
      download: "Télécharger le guide (PDF)",
      fallbackBefore: "Pour toute question, écrivez-nous directement à",
      fallbackAfter: ".",
      back: "Réessayer",
    },
  },
  en: {
    emailLabel: "Your email",
    emailPlaceholder: "you@example.com",
    emailError: "Enter a valid email address.",
    submit: "Get the guide (PDF)",
    sending: "Sending…",
    privacy: "Your data stays private. No spam.",
    sent: {
      badge: "Guide ready",
      title: "Your guide is ready to download",
      body: "The button below opens the PDF directly.",
      download: "Download the guide (PDF)",
      back: "Use a different address",
    },
    failed: {
      badge: "Saving failed",
      title: "A technical error prevented saving your request",
      body: "Your details were not recorded, but here is your guide anyway: the download does not depend on that error.",
      download: "Download the guide (PDF)",
      fallbackBefore: "For any question, write to us directly at",
      fallbackAfter: ".",
      back: "Try again",
    },
  },
};

type Status = "idle" | "sending" | "sent" | "failed";

export function LeadMagnetForm({
  locale,
  idPrefix = "lead-magnet",
  className = "",
}: {
  locale: Locale;
  idPrefix?: string;
  className?: string;
}) {
  const t = copy[locale];
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError(t.emailError);
      return;
    }
    setError(undefined);
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed.split("@")[0] || "Prospect",
          email: trimmed,
          source: "lead_magnet",
          message: `Téléchargement du guide "${GUIDE_SLUG}" demandé (locale: ${locale}).`,
        }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  function reset() {
    setStatus("idle");
    setEmail("");
    setError(undefined);
  }

  if (status === "sent" || status === "failed") {
    const c = status === "sent" ? t.sent : t.failed;
    return (
      <Card className={`animate-stamp p-5 sm:p-6 ${className}`}>
        <div role="status">
          <Badge tone={status === "sent" ? "gold" : "red"}>{c.badge}</Badge>
          <h3 className="mt-3 font-display text-xl font-semibold text-ink">{c.title}</h3>
          <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-mine">{c.body}</p>
          <div className="mt-4">
            <a href={GUIDE_PDF_PATH} download className={DOWNLOAD_BUTTON_CLASS}>
              {c.download}
            </a>
          </div>
          {status === "failed" && (
            <p className="mt-3 max-w-[56ch] text-[14px] leading-relaxed text-mine">
              {t.failed.fallbackBefore}{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-mono text-brand underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              {t.failed.fallbackAfter}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-4 cursor-pointer text-sm font-medium text-brand underline underline-offset-4"
          >
            {c.back}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-5 sm:p-6 ${className}`}>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor={`${idPrefix}-email`} className="mb-1.5 block text-sm font-medium text-ink">
          {t.emailLabel}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${idPrefix}-email-error` : undefined}
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink sm:flex-1"
          />
          <Button type="submit" disabled={status === "sending"} className="shrink-0">
            {status === "sending" ? t.sending : t.submit}
          </Button>
        </div>
        {error && (
          <p id={`${idPrefix}-email-error`} role="alert" className="mt-1.5 text-sm text-debit">
            {error}
          </p>
        )}
        <TrustLine text={t.privacy} className="mt-3" />
      </form>
    </Card>
  );
}
