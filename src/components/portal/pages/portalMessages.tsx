"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { getPortalStrings } from "@/content/portal";
import { DEMO_MESSAGES, STAGE_LABELS } from "@/data/demo-portal";
import { getCountryById } from "@/data/countries";
import { usePortal } from "@/components/portal/PortalContext";
import { Badge, Button } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Local helpers (foundation files are read-only)                      */
/* ------------------------------------------------------------------ */

type SuggestionId = "swiss" | "payment" | "missing";

interface LocalMessage {
  id: string;
  from: "client" | "assistant";
  date: string;
  body: string;
}

/** Simulated assistant latency for the demo auto-reply. */
const REPLY_DELAY_MS = 1_100;

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface MessagesCopy {
  metaTitle: string;
  metaDescription: string;
  title: string;
  sub: string;
  banner: {
    text: string;
    faqLink: string;
  };
  badges: {
    assistant: string;
    team: string;
  };
  you: string;
  assistantName: string;
  threadLabel: string;
  typing: string;
  suggestionsLabel: string;
  suggestions: { id: SuggestionId; label: string }[];
  composer: {
    label: string;
    placeholder: string;
    demoNote: string;
  };
  replies: {
    swiss: (id: string, stage: string, filedDate: string | null) => string;
    payment: string;
    missing: (items: string[]) => string;
    missingNone: string;
    generic: string;
    footer: string;
  };
}

const copy: Localized<MessagesCopy> = {
  fr: {
    metaTitle: "Messages — Espace client FiscalPlace",
    metaDescription:
      "Posez vos questions : l'assistant répond immédiatement aux sujets couverts par la FAQ, un membre de l'équipe reprend la main dès que nécessaire.",
    title: "Messages",
    sub: "Vos échanges avec FiscalPlace, conservés au même endroit que vos dossiers — chaque réponse reste consultable.",
    banner: {
      text: "Premier niveau assuré par notre assistant : les questions déjà couvertes par la FAQ obtiennent une réponse immédiate ; un membre de l'équipe reprend la main dès que nécessaire.",
      faqLink: "Consulter la FAQ",
    },
    badges: {
      assistant: "Assistant IA",
      team: "Équipe",
    },
    you: "Vous",
    assistantName: "Assistant FiscalPlace",
    threadLabel: "Fil de discussion",
    typing: "L'assistant rédige une réponse…",
    suggestionsLabel: "Questions fréquentes",
    suggestions: [
      { id: "swiss", label: "Où en est mon dossier suisse ?" },
      { id: "payment", label: "Quand serai-je payé ?" },
      { id: "missing", label: "Quels documents manquent ?" },
    ],
    composer: {
      label: "Votre message",
      placeholder: "Écrivez votre question…",
      demoNote: "Démo : votre message reste dans ce navigateur, rien n'est transmis.",
    },
    replies: {
      swiss: (id, stage, filedDate) =>
        `Votre dossier suisse ${id} est à l'étape « ${stage} »${
          filedDate ? `, déposé auprès de l'AFC le ${filedDate}` : ""
        }. Chaque étape et les fourchettes de délai constatées sont visibles sur la page du dossier ; nous relançons l'administration automatiquement si nécessaire.`,
      payment:
        "L'ordre est toujours le même : l'administration rembourse, notre commission est déduite à ce moment-là — jamais avant — puis le net vous est reversé. La facture détaillée, débours compris, apparaît dans l'onglet Facturation.",
      missing: (items) =>
        `${items.length} dossier${items.length > 1 ? "s" : ""} attend${
          items.length > 1 ? "ent" : ""
        } une action de votre part : ${items.join(
          ", ",
        )}. Le détail de la pièce attendue figure sur la page de chaque dossier.`,
      missingNone:
        "Bonne nouvelle : aucune pièce n'est attendue de votre part sur vos dossiers ouverts. Nous vous notifions dès que cela change.",
      generic:
        "Bien reçu. Je suis l'assistant de premier niveau : si votre question est déjà couverte par la FAQ, la réponse y est immédiate ; sinon, je la transmets à l'équipe.",
      footer:
        "— Réponse automatique de démonstration : rien n'a été réellement transmis. Pour une reprise humaine, dites-le simplement : un membre de l'équipe vous répond sous 1 jour ouvré.",
    },
  },
  en: {
    metaTitle: "Messages — FiscalPlace client area",
    metaDescription:
      "Ask your questions: the assistant answers FAQ-covered topics instantly, and a team member takes over whenever needed.",
    title: "Messages",
    sub: "Your conversations with FiscalPlace, kept in the same place as your claims — every answer stays on record.",
    banner: {
      text: "First-line support is handled by our assistant: questions already covered by the FAQ get an instant answer; a team member takes over whenever needed.",
      faqLink: "Browse the FAQ",
    },
    badges: {
      assistant: "AI assistant",
      team: "Team",
    },
    you: "You",
    assistantName: "FiscalPlace Assistant",
    threadLabel: "Conversation thread",
    typing: "The assistant is writing a reply…",
    suggestionsLabel: "Frequent questions",
    suggestions: [
      { id: "swiss", label: "Where does my Swiss claim stand?" },
      { id: "payment", label: "When will I get paid?" },
      { id: "missing", label: "Which documents are missing?" },
    ],
    composer: {
      label: "Your message",
      placeholder: "Type your question…",
      demoNote: "Demo: your message stays in this browser, nothing is transmitted.",
    },
    replies: {
      swiss: (id, stage, filedDate) =>
        `Your Swiss claim ${id} is at the “${stage}” stage${
          filedDate ? `, filed with the Swiss FTA on ${filedDate}` : ""
        }. Every step and the observed processing ranges are visible on the claim page; we chase the administration automatically when needed.`,
      payment:
        "The order never changes: the administration refunds, our fee is deducted at that moment — never before — and the net is paid out to you. The detailed invoice, disbursements included, appears in the Billing tab.",
      missing: (items) =>
        `${items.length} claim${items.length > 1 ? "s" : ""} ${
          items.length > 1 ? "are" : "is"
        } waiting on an action from you: ${items.join(
          ", ",
        )}. The exact document expected is detailed on each claim's page.`,
      missingNone:
        "Good news: nothing is expected from you on your open claims. We will notify you the moment that changes.",
      generic:
        "Received. I am the first-line assistant: if your question is already covered by the FAQ, the answer is there instantly; otherwise I pass it on to the team.",
      footer:
        "— Automated demo reply: nothing was actually transmitted. For a human follow-up, just say so: a team member replies within 1 business day.",
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
/* Message bubble                                                      */
/* ------------------------------------------------------------------ */

function MessageBubble({
  from,
  author,
  date,
  body,
  locale,
  badges,
}: {
  from: "client" | "assistant" | "team";
  author: string;
  date: string;
  body: string;
  locale: Locale;
  badges: MessagesCopy["badges"];
}) {
  const isClient = from === "client";
  return (
    <li className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-[6px] border bg-white p-4 sm:max-w-[75%] ${
          isClient ? "border-brand" : "border-rule"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {from === "assistant" && <Badge tone="gold">{badges.assistant}</Badge>}
          {from === "team" && <Badge tone="green">{badges.team}</Badge>}
          <span className="font-mono text-[11px] text-mine">
            {author} · {formatDate(date, locale)}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">{body}</p>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const p = getPortalStrings(locale);
  const { claims } = usePortal();

  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const timersRef = useRef<number[]>([]);
  const counterRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (localMessages.length > 0 || pendingCount > 0) {
      endRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [localMessages, pendingCount]);

  /** Canned demo reply — grounded in the demo claims, never a promise. */
  const buildReply = (suggestionId: SuggestionId | null): string => {
    let base: string;
    if (suggestionId === "swiss") {
      const swiss = claims.find((c) => c.countryId === "CH");
      const filed = swiss?.history.find((h) => h.stage === "filed");
      base = swiss
        ? t.replies.swiss(
            swiss.id,
            STAGE_LABELS[swiss.currentStage][locale],
            filed ? formatDate(filed.date, locale) : null,
          )
        : t.replies.generic;
    } else if (suggestionId === "payment") {
      base = t.replies.payment;
    } else if (suggestionId === "missing") {
      const waiting = claims.filter((c) => c.actionRequired && !c.outcome);
      base =
        waiting.length > 0
          ? t.replies.missing(
              waiting.map(
                (c) => `${c.id} (${getCountryById(c.countryId)?.name[locale] ?? c.countryId})`,
              ),
            )
          : t.replies.missingNone;
    } else {
      base = t.replies.generic;
    }
    return `${base}\n${t.replies.footer}`;
  };

  const send = (text: string, suggestionId: SuggestionId | null) => {
    const body = text.trim();
    if (!body) return;
    const today = new Date().toISOString().slice(0, 10);
    setLocalMessages((prev) => [
      ...prev,
      { id: `local-${++counterRef.current}`, from: "client", date: today, body },
    ]);
    setDraft("");
    setPendingCount((n) => n + 1);
    const reply = buildReply(suggestionId);
    const timer = window.setTimeout(() => {
      setLocalMessages((prev) => [
        ...prev,
        { id: `local-${++counterRef.current}`, from: "assistant", date: today, body: reply },
      ]);
      setPendingCount((n) => n - 1);
    }, REPLY_DELAY_MS);
    timersRef.current.push(timer);
  };

  return (
    <div>
      {/* -------------------------------------------------------- */}
      {/* Heading                                                    */}
      {/* -------------------------------------------------------- */}
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">{t.title}</h1>
        <p className="mt-1 max-w-[62ch] text-[15px] leading-relaxed text-mine">{t.sub}</p>
      </header>

      {/* -------------------------------------------------------- */}
      {/* Permanent first-line banner                                */}
      {/* -------------------------------------------------------- */}
      <div className="mt-6 rounded-[6px] border border-gold/40 bg-tint-gold p-4">
        <Badge tone="gold">{t.badges.assistant}</Badge>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {t.banner.text}{" "}
          <Link
            href={href(locale, "faq")}
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            {t.banner.faqLink} →
          </Link>
        </p>
      </div>

      {/* -------------------------------------------------------- */}
      {/* Thread                                                     */}
      {/* -------------------------------------------------------- */}
      <section className="mt-6" aria-label={t.threadLabel}>
        <div role="log" aria-live="polite">
          <ul className="flex flex-col gap-3">
            {DEMO_MESSAGES.map((m) => (
              <MessageBubble
                key={m.id}
                from={m.from}
                author={m.authorLabel[locale]}
                date={m.date}
                body={m.body[locale]}
                locale={locale}
                badges={t.badges}
              />
            ))}
            {localMessages.map((m) => (
              <MessageBubble
                key={m.id}
                from={m.from}
                author={m.from === "client" ? t.you : t.assistantName}
                date={m.date}
                body={m.body}
                locale={locale}
                badges={t.badges}
              />
            ))}
          </ul>
          {pendingCount > 0 && (
            <p className="mt-3 font-mono text-xs text-mine" role="status">
              {t.typing}
            </p>
          )}
        </div>
        <div ref={endRef} aria-hidden="true" />
      </section>

      {/* -------------------------------------------------------- */}
      {/* Suggestions + composer                                     */}
      {/* -------------------------------------------------------- */}
      <section className="mt-6" aria-label={t.composer.label}>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
          {t.suggestionsLabel}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {t.suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => send(s.label, s.id)}
              className="cursor-pointer rounded-[6px] border border-rule bg-white px-3 py-1.5 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft, null);
          }}
        >
          <label htmlFor="fp-message" className="sr-only">
            {t.composer.label}
          </label>
          <textarea
            id="fp-message"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.composer.placeholder}
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-mine focus:border-brand focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-mine">{t.composer.demoNote}</p>
            <Button type="submit" disabled={!draft.trim()}>
              {p.common.send}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
