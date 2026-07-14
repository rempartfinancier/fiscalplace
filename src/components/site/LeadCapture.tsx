"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

import type { Locale, Localized } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { Badge, Button } from "@/components/ui/primitives";

/**
 * LEAD CAPTURE — ephemeral modal shown whenever a visitor tries to act on
 * something the site cannot yet do for real (open a claim online, log in to
 * a real account). Rather than dumping them into the demo silently, it
 * collects a precise, pre-filled request and posts it through the same
 * `/api/lead` pipeline as the contact page — honestly labelled as beta, with
 * a human follow-up promised.
 *
 * Mounted once in MarketingChrome; any client component in the marketing
 * tree can call `useLeadCapture().openLeadCapture(...)`. Server components
 * (most service pages) go through `LeadCaptureButton` instead.
 */

export interface LeadCaptureRequest {
  kind: "service" | "login";
  /** Short, already-localized label: "Formulaire W-8BEN", "Connexion à l'espace client"… */
  serviceLabel: string;
  /** Optional precise context shown to the visitor and sent as-is: simulated figures, etc. */
  detail?: string;
}

interface LeadCaptureContextValue {
  openLeadCapture: (request: LeadCaptureRequest) => void;
}

const LeadCaptureContext = createContext<LeadCaptureContextValue | null>(null);

export function useLeadCapture(): LeadCaptureContextValue {
  const ctx = useContext(LeadCaptureContext);
  if (ctx === null) {
    throw new Error("useLeadCapture must be used within LeadCaptureProvider");
  }
  return ctx;
}

/* ------------------------------------------------------------------- copy */

interface ModalCopy {
  betaBadge: string;
  close: string;
  title: { service: (label: string) => string; login: string };
  intro: { service: string; login: string };
  detailLabel: string;
  demoLink: string;
  fields: {
    name: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    note: { label: string; placeholder: string };
  };
  errors: { name: string; email: string; summary: string };
  submit: string;
  sending: string;
  humanNote: string;
  sent: { badge: string; title: string; body: (label: string) => string; close: string };
  failed: {
    badge: string;
    title: string;
    body: string;
    fallbackBefore: string;
    fallbackAfter: string;
    back: string;
  };
}

const copy: Localized<ModalCopy> = {
  fr: {
    betaBadge: "Service en ligne · Version bêta",
    close: "Fermer",
    title: {
      service: (label) => `Une question sur : ${label}`,
      login: "Accéder à votre espace client",
    },
    intro: {
      service:
        "L'ouverture de dossier en ligne est encore en version bêta. Cette demande n'ouvre pas un dossier automatiquement : elle nous prévient, et nous la traitons manuellement, dans les plus brefs délais.",
      login:
        "La connexion en ligne est encore en version bêta : aucun compte réel n'est ouvert pour l'instant. Laissez-nous vos coordonnées, nous revenons vers vous manuellement pour vous donner accès, dans les plus brefs délais.",
    },
    detailLabel: "Ce que nous transmettrons avec votre demande",
    demoLink: "Ou explorez d'abord le compte de démonstration, sans inscription →",
    fields: {
      name: { label: "Votre nom", placeholder: "Prénom et nom" },
      email: { label: "Votre email", placeholder: "vous@exemple.com" },
      note: {
        label: "Précisions (optionnel)",
        placeholder: "Pays, montants, période, urgence — tout ce qui nous aide à répondre juste du premier coup.",
      },
    },
    errors: {
      name: "Indiquez votre nom pour que nous sachions à qui répondre.",
      email: "Indiquez une adresse email valide : c'est là que la réponse arrivera.",
      summary: "Corrigez les champs signalés ci-dessus.",
    },
    submit: "Envoyer ma demande",
    sending: "Envoi en cours…",
    humanNote: "Traitée manuellement par un humain, pas par un robot.",
    sent: {
      badge: "Demande transmise",
      title: "C'est envoyé",
      body: (label) =>
        `Nous avons bien reçu votre demande concernant « ${label} ». Un humain la traite manuellement et revient vers vous dans les plus brefs délais.`,
      close: "Fermer",
    },
    failed: {
      badge: "Échec de l'envoi",
      title: "Cette demande n'a pas pu être transmise",
      body: "Une erreur technique a empêché l'envoi. Vos informations n'ont pas été perdues, mais rien n'a été transmis.",
      fallbackBefore: "Pour nous contacter dès maintenant, écrivez directement à",
      fallbackAfter: "en précisant votre sujet.",
      back: "Revenir au formulaire",
    },
  },
  en: {
    betaBadge: "Online service · Beta",
    close: "Close",
    title: {
      service: (label) => `A question about: ${label}`,
      login: "Access your client area",
    },
    intro: {
      service:
        "Opening a claim online is still in beta. This request does not open a file automatically: it notifies us, and we handle it manually, as quickly as possible.",
      login:
        "Client-area login is still in beta: no real account is open yet. Leave us your details and we'll get back to you manually to grant access, as quickly as possible.",
    },
    detailLabel: "What we'll pass along with your request",
    demoLink: "Or explore the demo account first, no sign-up →",
    fields: {
      name: { label: "Your name", placeholder: "First and last name" },
      email: { label: "Your email", placeholder: "you@example.com" },
      note: {
        label: "Details (optional)",
        placeholder: "Country, amounts, period, urgency — anything that helps us reply correctly first time.",
      },
    },
    errors: {
      name: "Tell us your name so we know who to reply to.",
      email: "Enter a valid email address: that is where the reply will land.",
      summary: "Please fix the highlighted fields above.",
    },
    submit: "Send my request",
    sending: "Sending…",
    humanNote: "Handled manually by a person, not a bot.",
    sent: {
      badge: "Request sent",
      title: "It's sent",
      body: (label) =>
        `We've received your request about "${label}". A person handles it manually and will get back to you as quickly as possible.`,
      close: "Close",
    },
    failed: {
      badge: "Delivery failed",
      title: "This request could not be sent",
      body: "A technical error prevented delivery. Your details were not lost, but nothing was sent.",
      fallbackBefore: "To reach us right now, email us directly at",
      fallbackAfter: "with your subject.",
      back: "Back to the form",
    },
  },
};

const CONTACT_EMAIL = "contact@fiscalplace.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------- provider */

export function LeadCaptureProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [request, setRequest] = useState<LeadCaptureRequest | null>(null);

  return (
    <LeadCaptureContext.Provider value={{ openLeadCapture: setRequest }}>
      {children}
      {request !== null && (
        <LeadCaptureModal locale={locale} request={request} onClose={() => setRequest(null)} />
      )}
    </LeadCaptureContext.Provider>
  );
}

/* ----------------------------------------------------------------- modal */

interface FieldErrors {
  name?: string;
  email?: string;
}

function LeadCaptureModal({
  locale,
  request,
  onClose,
}: {
  locale: Locale;
  request: LeadCaptureRequest;
  onClose: () => void;
}) {
  const t = copy[locale];
  const titleId = "lead-capture-title";
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  useEffect(() => {
    nameRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (name.trim().length === 0) next.name = t.errors.name;
    if (!EMAIL_RE.test(email.trim())) next.email = t.errors.email;
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    const lines = [
      `Contexte : ${request.serviceLabel} (${request.kind === "login" ? "connexion" : "service"})`,
      request.detail ? `Détail : ${request.detail}` : null,
      note.trim() ? `Message du visiteur : ${note.trim()}` : null,
      "(Formulaire éphémère — service en ligne bêta, à traiter manuellement)",
    ].filter((line): line is string => line !== null);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: request.serviceLabel,
          message: lines.join("\n"),
        }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  function backToForm() {
    setStatus("idle");
  }

  const title =
    request.kind === "login" ? t.title.login : t.title.service(request.serviceLabel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-settle max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[6px] border border-rule bg-white p-5 shadow-float sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <Badge tone="gold">{t.betaBadge}</Badge>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-[6px] px-2 py-1 text-mine transition-colors hover:bg-paper hover:text-ink"
          >
            ×
          </button>
        </div>

        {status === "sent" || status === "failed" ? (
          <div role="status">
            <h2 id={titleId} className="mt-4 font-display text-2xl font-semibold text-ink">
              {status === "sent" ? t.sent.title : t.failed.title}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mine">
              {status === "sent" ? t.sent.body(request.serviceLabel) : t.failed.body}
            </p>
            {status === "failed" && (
              <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mine">
                {t.failed.fallbackBefore}{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-mono text-brand underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                {t.failed.fallbackAfter}
              </p>
            )}
            <div className="mt-5 flex gap-3">
              {status === "failed" && (
                <Button variant="secondary" onClick={backToForm}>
                  {t.failed.back}
                </Button>
              )}
              <Button onClick={onClose}>
                {status === "sent" ? t.sent.close : t.close}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 id={titleId} className="mt-4 font-display text-xl font-semibold text-ink sm:text-2xl">
              {title}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mine">
              {request.kind === "login" ? t.intro.login : t.intro.service}
            </p>

            {request.detail && (
              <div className="mt-3 rounded-[6px] border border-rule bg-paper p-3">
                <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-mine">
                  {t.detailLabel}
                </p>
                <p className="mt-1 font-mono text-[13px] text-ink">{request.detail}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lead-name" className="mb-1.5 block text-sm font-medium text-ink">
                    {t.fields.name.label}
                  </label>
                  <input
                    id="lead-name"
                    ref={nameRef}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fields.name.placeholder}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "lead-name-error" : undefined}
                    className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
                  />
                  {errors.name && (
                    <p id="lead-name-error" role="alert" className="mt-1.5 text-sm text-debit">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium text-ink">
                    {t.fields.email.label}
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.fields.email.placeholder}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "lead-email-error" : undefined}
                    className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
                  />
                  {errors.email && (
                    <p id="lead-email-error" role="alert" className="mt-1.5 text-sm text-debit">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="lead-note" className="mb-1.5 block text-sm font-medium text-ink">
                  {t.fields.note.label}
                </label>
                <textarea
                  id="lead-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.fields.note.placeholder}
                  className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
                />
              </div>

              {Object.keys(errors).length > 0 && (
                <p role="alert" className="mt-3 text-sm text-debit">
                  {t.errors.summary}
                </p>
              )}

              <div className="mt-5 flex flex-col items-start gap-2">
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? t.sending : t.submit}
                </Button>
                <p className="font-mono text-[12px] text-mine">{t.humanNote}</p>
              </div>
            </form>

            {request.kind === "login" && (
              <div className="mt-4 border-t border-rule pt-4">
                <Link
                  href={href(locale, "portal")}
                  onClick={onClose}
                  className="text-[14px] font-medium text-brand hover:underline underline-offset-4"
                >
                  {t.demoLink}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
