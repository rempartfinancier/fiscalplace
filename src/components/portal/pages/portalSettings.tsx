"use client";

import { useState } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { getPortalStrings } from "@/content/portal";
import { DEMO_USER, type DemoNotification } from "@/data/demo-portal";
import { usePortal } from "@/components/portal/PortalContext";
import { Badge, Button, ButtonLink, Card } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Local helpers (foundation files are read-only)                      */
/* ------------------------------------------------------------------ */

/** Masked demo IBAN — matches the "account ending ••42" used in demo notifications. */
const MASKED_IBAN = "FR•• •••• •••• ••42";

type NotifKind = DemoNotification["kind"];
const NOTIF_KINDS: NotifKind[] = ["status", "deadline", "action", "payment"];

/** Named UI states for mocked actions — no alert(), one notice at a time. */
type SettingsNotice = "password" | "iban" | null;

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface SettingsCopy {
  metaTitle: string;
  metaDescription: string;
  lede: string;
  profile: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    kyc: string;
    note: string;
  };
  language: {
    title: string;
    body: string;
    fr: string;
    en: string;
    current: string;
  };
  notifications: {
    title: string;
    body: string;
    items: Record<NotifKind, { label: string; desc: string }>;
    note: string;
  };
  security: {
    title: string;
    twoFa: {
      label: string;
      desc: string;
      on: string;
      off: string;
      enable: string;
      disable: string;
      note: string;
    };
    password: { label: string; desc: string; button: string; unavailable: string };
  };
  payout: {
    title: string;
    body: string;
    ibanLabel: string;
    placeholder: string;
    edit: string;
    unavailable: string;
  };
  exit: { title: string; body: string };
}

const copy: Localized<SettingsCopy> = {
  fr: {
    metaTitle: "Paramètres — Espace client FiscalPlace",
    metaDescription:
      "Profil, langue, notifications, sécurité et coordonnées de versement du compte de démonstration FiscalPlace.",
    lede: "Les réglages du compte de démonstration : tout se modifie localement, rien n'est enregistré côté serveur.",
    profile: {
      title: "Profil",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      kyc: "Identité vérifiée — démo",
      note: "Profil fictif : les champs sont verrouillés dans la démonstration.",
    },
    language: {
      title: "Langue",
      body: "L'interface, les documents générés et les e-mails suivent la langue choisie.",
      fr: "Français",
      en: "English",
      current: "Langue actuelle",
    },
    notifications: {
      title: "Notifications par e-mail",
      body: "Choisissez ce qui déclenche un e-mail — le fil complet reste visible dans l'espace client.",
      items: {
        status: {
          label: "Statut de dossier",
          desc: "Un e-mail à chaque changement d'étape : déposé, en instruction, réponse de l'administration.",
        },
        deadline: {
          label: "Alerte prescription",
          desc: "Prévenez-moi quand un délai de dépôt approche, avant qu'un dossier ne se prescrive.",
        },
        action: {
          label: "Message reçu ou action requise",
          desc: "Quand l'équipe vous écrit ou qu'un dossier attend votre signature ou un document.",
        },
        payment: {
          label: "Versement effectué",
          desc: "Confirmation dès qu'un remboursement net est viré sur votre compte.",
        },
      },
      note: "Préférences locales à la démonstration — non conservées.",
    },
    security: {
      title: "Sécurité",
      twoFa: {
        label: "Double authentification (2FA)",
        desc: "En production : un code à usage unique, généré par votre application d'authentification, est demandé à chaque connexion et avant toute modification des coordonnées de versement.",
        on: "2FA activée",
        off: "2FA désactivée",
        enable: "Activer la 2FA",
        disable: "Désactiver la 2FA",
        note: "Réglage local à la démonstration.",
      },
      password: {
        label: "Mot de passe",
        desc: "En production : modification avec confirmation par e-mail et déconnexion des autres sessions.",
        button: "Changer le mot de passe",
        unavailable: "Indisponible en démonstration : ce compte fictif n'a pas de mot de passe réel.",
      },
    },
    payout: {
      title: "Coordonnées de versement",
      body: "Le compte sur lequel vos remboursements nets sont versés. En production, toute modification est confirmée par 2FA et revérifiée avant le versement suivant.",
      ibanLabel: "IBAN de versement",
      placeholder: "[COORDONNÉES BANCAIRES RÉELLES GÉRÉES APRÈS KYC EN PRODUCTION]",
      edit: "Modifier",
      unavailable: "Modification indisponible en démonstration",
    },
    exit: {
      title: "Quitter la démonstration",
      body: "Vous reviendrez à l'écran d'entrée de la démo. Les réglages locaux de cette page (notifications, 2FA) ne sont pas conservés.",
    },
  },
  en: {
    metaTitle: "Settings — FiscalPlace client area",
    metaDescription:
      "Profile, language, notifications, security and payout details of the FiscalPlace demo account.",
    lede: "The demo account's settings: everything changes locally, nothing is saved server-side.",
    profile: {
      title: "Profile",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      kyc: "Identity verified — demo",
      note: "Fictitious profile: fields are locked in the demo.",
    },
    language: {
      title: "Language",
      body: "The interface, generated documents and emails follow the chosen language.",
      fr: "Français",
      en: "English",
      current: "Current language",
    },
    notifications: {
      title: "Email notifications",
      body: "Choose what triggers an email — the full feed stays visible in the client area.",
      items: {
        status: {
          label: "Claim status",
          desc: "An email at every stage change: filed, under review, administration response.",
        },
        deadline: {
          label: "Deadline alert",
          desc: "Warn me when a filing deadline approaches, before a claim expires.",
        },
        action: {
          label: "Message received or action required",
          desc: "When the team writes to you or a claim is waiting for your signature or a document.",
        },
        payment: {
          label: "Payout made",
          desc: "Confirmation as soon as a net refund is wired to your account.",
        },
      },
      note: "Preferences are local to the demo — not saved.",
    },
    security: {
      title: "Security",
      twoFa: {
        label: "Two-factor authentication (2FA)",
        desc: "In production: a one-time code from your authenticator app is required at every login and before any change to your payout details.",
        on: "2FA enabled",
        off: "2FA disabled",
        enable: "Enable 2FA",
        disable: "Disable 2FA",
        note: "Setting is local to the demo.",
      },
      password: {
        label: "Password",
        desc: "In production: change confirmed by email, with other sessions logged out.",
        button: "Change password",
        unavailable: "Not available in the demo: this fictitious account has no real password.",
      },
    },
    payout: {
      title: "Payout details",
      body: "The account your net refunds are wired to. In production, any change is confirmed with 2FA and re-verified before the next payout.",
      ibanLabel: "Payout IBAN",
      placeholder: "[REAL BANK DETAILS MANAGED AFTER KYC IN PRODUCTION]",
      edit: "Edit",
      unavailable: "Editing not available in the demo",
    },
    exit: {
      title: "Exit the demo",
      body: "You will return to the demo entry screen. This page's local settings (notifications, 2FA) are not kept.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const p = getPortalStrings(locale);
  const { exit } = usePortal();

  const [prefs, setPrefs] = useState<Record<NotifKind, boolean>>({
    status: true,
    deadline: true,
    action: true,
    payment: true,
  });
  const [twoFa, setTwoFa] = useState(false);
  const [notice, setNotice] = useState<SettingsNotice>(null);

  const languages: { locale: Locale; label: string }[] = [
    { locale: "fr", label: t.language.fr },
    { locale: "en", label: t.language.en },
  ];

  const inputClass =
    "mt-1 w-full rounded-[6px] border border-rule bg-paper px-3 py-2 text-[15px] text-mine";

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">{p.nav.settings}</h1>
        <p className="mt-1 max-w-[68ch] text-[15px] leading-relaxed text-mine">{t.lede}</p>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------------ */}
        {/* Profile                                                  */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="set-profile" className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="set-profile" className="font-display text-xl font-semibold text-ink">
              {t.profile.title}
            </h2>
            {DEMO_USER.kycStatus === "verified" && <Badge tone="green">{t.profile.kyc}</Badge>}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-firstname" className="block text-sm font-medium text-ink">
                {t.profile.firstName}
              </label>
              <input
                id="set-firstname"
                type="text"
                value={DEMO_USER.firstName}
                disabled
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="set-lastname" className="block text-sm font-medium text-ink">
                {t.profile.lastName}
              </label>
              <input
                id="set-lastname"
                type="text"
                value={DEMO_USER.lastName}
                disabled
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="set-email" className="block text-sm font-medium text-ink">
                {t.profile.email}
              </label>
              <input
                id="set-email"
                type="email"
                value={DEMO_USER.email}
                disabled
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
          <p className="mt-3 font-mono text-[12px] text-mine">{t.profile.note}</p>
        </Card>

        {/* ------------------------------------------------------ */}
        {/* Language                                                 */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="set-language" className="p-5">
          <h2 id="set-language" className="font-display text-xl font-semibold text-ink">
            {t.language.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mine">{t.language.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {languages.map((lang) => {
              const current = lang.locale === locale;
              return (
                <span key={lang.locale} className="inline-flex items-center gap-2">
                  <ButtonLink href={href(lang.locale, "portalSettings")} variant="secondary">
                    {lang.label}
                  </ButtonLink>
                  {current && <Badge tone="green">{t.language.current}</Badge>}
                </span>
              );
            })}
          </div>
        </Card>

        {/* ------------------------------------------------------ */}
        {/* Notifications                                            */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="set-notifs" className="p-5">
          <h2 id="set-notifs" className="font-display text-xl font-semibold text-ink">
            {t.notifications.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mine">{t.notifications.body}</p>
          <fieldset className="mt-4">
            <legend className="sr-only">{t.notifications.title}</legend>
            <div className="grid gap-3">
              {NOTIF_KINDS.map((kind) => (
                <label
                  key={kind}
                  htmlFor={`pref-${kind}`}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id={`pref-${kind}`}
                    type="checkbox"
                    checked={prefs[kind]}
                    onChange={() => setPrefs((prev) => ({ ...prev, [kind]: !prev[kind] }))}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand"
                  />
                  <span>
                    <span className="block text-[15px] font-medium text-ink">
                      {t.notifications.items[kind].label}
                    </span>
                    <span className="block text-[13px] leading-relaxed text-mine">
                      {t.notifications.items[kind].desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-4 font-mono text-[12px] text-mine">{t.notifications.note}</p>
        </Card>

        {/* ------------------------------------------------------ */}
        {/* Security                                                 */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="set-security" className="p-5">
          <h2 id="set-security" className="font-display text-xl font-semibold text-ink">
            {t.security.title}
          </h2>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 basis-56">
              <p className="text-[15px] font-medium text-ink">{t.security.twoFa.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-mine">{t.security.twoFa.desc}</p>
              <p className="mt-2 font-mono text-[12px] text-mine">{t.security.twoFa.note}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge tone={twoFa ? "green" : "neutral"}>
                {twoFa ? t.security.twoFa.on : t.security.twoFa.off}
              </Badge>
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                aria-pressed={twoFa}
                onClick={() => setTwoFa((v) => !v)}
              >
                {twoFa ? t.security.twoFa.disable : t.security.twoFa.enable}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-rule pt-4">
            <div className="min-w-0 flex-1 basis-56">
              <p className="text-[15px] font-medium text-ink">{t.security.password.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-mine">
                {t.security.password.desc}
              </p>
            </div>
            <div className="text-right">
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                onClick={() => setNotice("password")}
              >
                {t.security.password.button}
              </Button>
              {notice === "password" && (
                <p role="status" className="mt-1.5 max-w-56 font-mono text-[11px] text-mine">
                  {t.security.password.unavailable}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ------------------------------------------------------ */}
        {/* Payout details                                           */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="set-payout" className="p-5">
          <h2 id="set-payout" className="font-display text-xl font-semibold text-ink">
            {t.payout.title}
          </h2>
          <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-mine">{t.payout.body}</p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-[6px] border border-rule bg-paper p-4">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wide text-mine">
                {t.payout.ibanLabel}
              </p>
              <p className="mt-1 font-mono text-lg text-ink">{MASKED_IBAN}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-mine">
                {t.payout.placeholder}
              </p>
            </div>
            <div className="text-right">
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                onClick={() => setNotice("iban")}
              >
                {t.payout.edit}
              </Button>
              {notice === "iban" && (
                <p role="status" className="mt-1.5 max-w-56 font-mono text-[11px] text-mine">
                  {t.payout.unavailable}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ------------------------------------------------------ */}
        {/* Exit demo                                                */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="set-exit" className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1 basis-64">
              <h2 id="set-exit" className="font-display text-xl font-semibold text-ink">
                {t.exit.title}
              </h2>
              <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-mine">{t.exit.body}</p>
            </div>
            <Button variant="secondary" onClick={exit}>
              {p.nav.logout}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
