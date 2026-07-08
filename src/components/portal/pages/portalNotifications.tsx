"use client";

import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, claimHref } from "@/lib/routes";
import { getPortalStrings } from "@/content/portal";
import { usePortal } from "@/components/portal/PortalContext";
import type { DemoNotification } from "@/data/demo-portal";
import { Badge, Button, ButtonLink, Card } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface NotificationsCopy {
  metaTitle: string;
  metaDescription: string;
  title: string;
  markAllRead: string;
  unreadStatus: (n: number) => string;
  kinds: Record<DemoNotification["kind"], string>;
  unreadLabel: string;
  empty: string;
  channels: {
    title: string;
    body: string;
    smsNote: string;
    manage: string;
  };
}

const copy: Localized<NotificationsCopy> = {
  fr: {
    metaTitle: "Notifications — Espace client FiscalPlace",
    metaDescription:
      "Chaque étape franchie, échéance qui approche, action attendue et versement effectué : le fil de vos dossiers, ici et par e-mail.",
    title: "Notifications",
    markAllRead: "Tout marquer comme lu",
    unreadStatus: (n) =>
      n === 0
        ? "Tout est lu."
        : n === 1
          ? "1 notification non lue."
          : `${n} notifications non lues.`,
    kinds: {
      status: "Étape",
      deadline: "Échéance",
      action: "Action",
      payment: "Versement",
    },
    unreadLabel: "Non lue",
    empty:
      "Aucune notification pour l'instant. Dès qu'un de vos dossiers bouge — étape franchie, document attendu, versement — vous le verrez ici et par e-mail.",
    channels: {
      title: "Comment vous êtes prévenu",
      body: "Chaque notification affichée ici vous est aussi envoyée par e-mail, au moment où l'événement se produit : vous n'avez jamais besoin de venir vérifier « au cas où ».",
      smsNote:
        "En option, une alerte SMS peut être activée pour les échéances critiques — typiquement un délai de prescription qui approche. Ni démarchage ni newsletter : uniquement l'état de vos dossiers.",
      manage: "Gérer mes préférences de notification",
    },
  },
  en: {
    metaTitle: "Notifications — FiscalPlace client area",
    metaDescription:
      "Every stage reached, deadline approaching, action awaited and payout made: your claims' feed, here and by email.",
    title: "Notifications",
    markAllRead: "Mark all as read",
    unreadStatus: (n) =>
      n === 0
        ? "All caught up."
        : n === 1
          ? "1 unread notification."
          : `${n} unread notifications.`,
    kinds: {
      status: "Stage",
      deadline: "Deadline",
      action: "Action",
      payment: "Payout",
    },
    unreadLabel: "Unread",
    empty:
      "No notifications yet. The moment one of your claims moves — a stage reached, a document awaited, a payout — you will see it here and by email.",
    channels: {
      title: "How you are notified",
      body: "Every notification shown here is also emailed to you the moment the event happens: you never need to check back “just in case”.",
      smsNote:
        "Optionally, an SMS alert can be enabled for critical deadlines — typically an approaching statute of limitations. No prospecting, no newsletter: only the state of your claims.",
      manage: "Manage my notification preferences",
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

/** Semantic tone per notification kind — the site-wide chromatic grammar. */
const KIND_TONES: Record<DemoNotification["kind"], "neutral" | "red" | "gold" | "green"> = {
  status: "neutral",
  deadline: "red",
  action: "gold",
  payment: "green",
};

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const p = getPortalStrings(locale);
  const { notifications, markAllRead } = usePortal();

  const sorted = [...notifications].sort((a, b) => b.date.localeCompare(a.date));
  const unread = sorted.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{t.title}</h1>
          <p aria-live="polite" className="mt-1 font-mono text-[13px] text-mine">
            {t.unreadStatus(unread)}
          </p>
        </div>
        <Button variant="secondary" onClick={markAllRead} disabled={unread === 0}>
          {t.markAllRead}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card className="mt-6 p-6">
          <p className="text-[15px] leading-relaxed text-mine">{t.empty}</p>
        </Card>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {sorted.map((n) => (
            <li
              key={n.id}
              className={`rounded-[6px] border border-rule p-4 ${
                n.read ? "bg-paper" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.read ? "bg-transparent" : "bg-brand"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={KIND_TONES[n.kind]}>{t.kinds[n.kind]}</Badge>
                    <time dateTime={n.date} className="font-mono text-xs text-mine">
                      {formatDate(n.date, locale)}
                    </time>
                    {!n.read && <span className="sr-only">{t.unreadLabel}</span>}
                  </div>
                  <p
                    className={`mt-1.5 text-[15px] leading-relaxed ${
                      n.read ? "text-mine" : "text-ink"
                    }`}
                  >
                    {n.body[locale]}
                  </p>
                  {n.claimId && (
                    <Link
                      href={claimHref(locale, n.claimId)}
                      className="mt-1.5 inline-block text-[14px] font-medium text-brand underline-offset-4 hover:underline"
                    >
                      {p.common.viewClaim} <span className="font-mono">{n.claimId}</span> →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Card className="mt-8 p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-ink">{t.channels.title}</h2>
        <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-mine">
          {t.channels.body}
        </p>
        <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-mine">
          {t.channels.smsNote}
        </p>
        <div className="mt-4">
          <ButtonLink variant="secondary" href={href(locale, "portalSettings")}>
            {t.channels.manage}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
