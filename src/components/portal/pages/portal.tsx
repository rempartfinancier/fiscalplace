"use client";

import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, claimHref } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { getPortalStrings } from "@/content/portal";
import {
  DEMO_ENTITIES,
  DEMO_USER,
  type DemoClaim,
  type DemoNotification,
} from "@/data/demo-portal";
import { getCountryById } from "@/data/countries";
import { usePortal, filterByEntity } from "@/components/portal/PortalContext";
import { stageIndex, TimelineCompact } from "@/components/ui/ClaimTimeline";
import { Badge, ButtonLink, Card, StatTile, TrustLine } from "@/components/ui/primitives";
import { ProgressGauge } from "@/components/ui/ledger";

/* ------------------------------------------------------------------ */
/* Local helpers (foundation files are read-only)                      */
/* ------------------------------------------------------------------ */

const URGENCY_MONTHS = 6;

/** A statute-of-limitations deadline is urgent when < 6 months away. */
function isUrgentDeadline(iso: string): boolean {
  const deadline = new Date(iso + "T12:00:00");
  const limit = new Date();
  limit.setMonth(limit.getMonth() + URGENCY_MONTHS);
  return deadline.getTime() <= limit.getTime();
}

function entityName(id: string, locale: Locale): string {
  const entity = DEMO_ENTITIES.find((e) => e.id === id);
  return entity ? entity.name[locale] : id;
}

function countryOf(claim: DemoClaim): { flag: string; name: Localized<string> } {
  const country = getCountryById(claim.countryId);
  return country
    ? { flag: country.flag, name: country.name }
    : { flag: "", name: { fr: claim.countryId, en: claim.countryId } };
}

/** Stages currently sitting with a foreign administration. */
const IN_PROGRESS_STAGES: DemoClaim["currentStage"][] = ["filed", "processing", "response"];

const KIND_TONE: Record<DemoNotification["kind"], "neutral" | "red" | "gold" | "green"> = {
  status: "neutral",
  deadline: "red",
  action: "gold",
  payment: "green",
};

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface DashboardCopy {
  metaTitle: string;
  metaDescription: string;
  greeting: (firstName: string) => string;
  sub: string;
  tiles: {
    identified: string;
    identifiedHint: (n: number) => string;
    inProgress: string;
    inProgressHint: (n: number) => string;
    recovered: string;
    recoveredHint: (n: number) => string;
    deadline: string;
    deadlineUrgent: string;
    deadlineNone: string;
  };
  actions: {
    title: string;
    cta: string;
  };
  claims: {
    title: string;
    lede: (n: number) => string;
    years: string;
    recoveredLabel: string;
    progressLabel: (step: number) => string;
    all: string;
  };
  notifications: {
    title: string;
    all: string;
    kinds: Record<DemoNotification["kind"], string>;
  };
  aside: {
    kicker: string;
    title: string;
    body: string;
  };
}

const copy: Localized<DashboardCopy> = {
  fr: {
    metaTitle: "Tableau de bord — Espace client FiscalPlace",
    metaDescription:
      "Suivez vos dossiers de récupération de retenue à la source : montants identifiés, dossiers en instruction, sommes récupérées et délais de prescription.",
    greeting: (firstName) => `Bonjour ${firstName}`,
    sub: "Votre grand livre, ligne à ligne : ce qui est identifié, ce qui est en instruction, ce qui est soldé.",
    tiles: {
      identified: "Identifié à récupérer",
      identifiedHint: (n) => `${n} dossier${n === 1 ? "" : "s"} ouvert${n === 1 ? "" : "s"}`,
      inProgress: "En instruction",
      inProgressHint: (n) =>
        `${n} dossier${n === 1 ? "" : "s"} déposé${n === 1 ? "" : "s"} auprès des administrations`,
      recovered: "Récupéré depuis le début",
      recoveredHint: (n) => `${n} dossier${n === 1 ? "" : "s"} soldé${n === 1 ? "" : "s"}`,
      deadline: "Prochaine prescription",
      deadlineUrgent: "moins de 6 mois",
      deadlineNone: "Aucun dossier ouvert",
    },
    actions: {
      title: "Actions requises",
      cta: "Traiter maintenant",
    },
    claims: {
      title: "Vos dossiers",
      lede: (n) => `${n} écriture${n === 1 ? "" : "s"} au registre pour cette vue.`,
      years: "Années fiscales",
      recoveredLabel: "Récupéré",
      progressLabel: (step) => `Avancement : étape ${step} sur 8`,
      all: "Tous les dossiers",
    },
    notifications: {
      title: "Dernières notifications",
      all: "Toutes les notifications",
      kinds: {
        status: "Statut",
        deadline: "Prescription",
        action: "Action",
        payment: "Paiement",
      },
    },
    aside: {
      kicker: "Simulateur",
      title: "Un autre portefeuille à tester ?",
      body: "Estimez en deux minutes le trop-perçu d'un autre portefeuille — le vôtre ou celui d'un proche. Sans e-mail, sans engagement, commission publique déjà déduite.",
    },
  },
  en: {
    metaTitle: "Dashboard — FiscalPlace client area",
    metaDescription:
      "Track your withholding-tax recovery claims: identified amounts, claims under review, sums recovered and statute-of-limitations deadlines.",
    greeting: (firstName) => `Hello ${firstName}`,
    sub: "Your ledger, line by line: what is identified, what is under review, what is settled.",
    tiles: {
      identified: "Identified for recovery",
      identifiedHint: (n) => `${n} open claim${n === 1 ? "" : "s"}`,
      inProgress: "Under review",
      inProgressHint: (n) => `${n} claim${n === 1 ? "" : "s"} filed with the administrations`,
      recovered: "Recovered to date",
      recoveredHint: (n) => `${n} settled claim${n === 1 ? "" : "s"}`,
      deadline: "Next filing deadline",
      deadlineUrgent: "under 6 months",
      deadlineNone: "No open claims",
    },
    actions: {
      title: "Action required",
      cta: "Handle it now",
    },
    claims: {
      title: "Your claims",
      lede: (n) => `${n} entr${n === 1 ? "y" : "ies"} in the ledger for this view.`,
      years: "Tax years",
      recoveredLabel: "Recovered",
      progressLabel: (step) => `Progress: step ${step} of 8`,
      all: "All claims",
    },
    notifications: {
      title: "Latest notifications",
      all: "All notifications",
      kinds: {
        status: "Status",
        deadline: "Deadline",
        action: "Action",
        payment: "Payment",
      },
    },
    aside: {
      kicker: "Simulator",
      title: "Another portfolio to test?",
      body: "Estimate another portfolio's over-withholding in two minutes — yours or a relative's. No email, no commitment, the public fee already deducted.",
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
  const common = getCommon(locale);
  const { claims, entityFilter, notifications } = usePortal();

  const visible = filterByEntity(claims, entityFilter);
  const open = visible.filter((c) => !c.outcome);
  const settled = visible.filter((c) => c.outcome);
  const inProgress = visible.filter((c) => IN_PROGRESS_STAGES.includes(c.currentStage));

  const identifiedSum = open.reduce((sum, c) => sum + c.recoverableEstimate, 0);
  const inProgressSum = inProgress.reduce((sum, c) => sum + c.recoverableEstimate, 0);
  const recoveredSum = settled.reduce((sum, c) => sum + (c.outcome?.recovered ?? 0), 0);

  const soonest = [...open].sort((a, b) => a.solDeadline.localeCompare(b.solDeadline))[0];
  const soonestUrgent = soonest ? isUrgentDeadline(soonest.solDeadline) : false;
  const soonestHint = soonest
    ? `${soonest.id} · ${countryOf(soonest).name[locale]}${
        soonestUrgent ? ` · ${t.tiles.deadlineUrgent}` : ""
      }`
    : undefined;

  const actionClaims = visible.filter((c) => c.actionRequired);
  const latestNotifications = [...notifications]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const fc = (n: number) => formatCurrency(n, locale);

  return (
    <div>
      {/* -------------------------------------------------------- */}
      {/* Discreet h1                                                */}
      {/* -------------------------------------------------------- */}
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {t.greeting(DEMO_USER.firstName)}
        </h1>
        <p className="mt-1 max-w-[62ch] text-[15px] leading-relaxed text-mine">{t.sub}</p>
      </header>

      {/* -------------------------------------------------------- */}
      {/* Actions required — always first when present               */}
      {/* -------------------------------------------------------- */}
      {actionClaims.length > 0 && (
        <section className="mt-6" aria-labelledby="dash-actions">
          <h2
            id="dash-actions"
            className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-gold-ink"
          >
            {t.actions.title} · {actionClaims.length}
          </h2>
          <div className="mt-3 grid gap-3">
            {actionClaims.map((claim) => {
              const country = countryOf(claim);
              return (
                <div
                  key={claim.id}
                  className="rounded-[6px] border border-gold/40 bg-tint-gold p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <div className="min-w-0 flex-1 basis-64">
                      <p className="font-mono text-xs uppercase tracking-wide text-gold-ink">
                        {claim.id} · {country.flag} {country.name[locale]}
                      </p>
                      <p className="mt-1 text-[15px] leading-relaxed text-ink">
                        {claim.actionRequired?.[locale]}
                      </p>
                    </div>
                    <ButtonLink href={claimHref(locale, claim.id)} variant="secondary">
                      {t.actions.cta}
                    </ButtonLink>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- */}
      {/* KPI tiles                                                  */}
      {/* -------------------------------------------------------- */}
      <section className="mt-6" aria-label={t.claims.title}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            value={fc(identifiedSum)}
            label={t.tiles.identified}
            hint={t.tiles.identifiedHint(open.length)}
            tone="gold"
          />
          <StatTile
            value={fc(inProgressSum)}
            label={t.tiles.inProgress}
            hint={t.tiles.inProgressHint(inProgress.length)}
            tone="brand"
          />
          <StatTile
            value={fc(recoveredSum)}
            label={t.tiles.recovered}
            hint={t.tiles.recoveredHint(settled.length)}
            tone="brand"
          />
          <StatTile
            value={soonest ? formatDate(soonest.solDeadline, locale) : "—"}
            label={t.tiles.deadline}
            hint={soonestHint ?? t.tiles.deadlineNone}
            tone={soonestUrgent ? "debit" : "ink"}
          />
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          {/* ---------------------------------------------------- */}
          {/* Claims grid                                            */}
          {/* ---------------------------------------------------- */}
          <section aria-labelledby="dash-claims">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 id="dash-claims" className="font-display text-xl font-semibold text-ink">
                  {t.claims.title}
                </h2>
                <p className="mt-0.5 text-sm text-mine">{t.claims.lede(visible.length)}</p>
              </div>
              <Link
                href={href(locale, "portalClaims")}
                className="text-sm font-medium text-brand underline-offset-4 hover:underline"
              >
                {t.claims.all} →
              </Link>
            </div>

            {visible.length === 0 ? (
              <Card className="mt-4 p-8 text-center">
                <p className="text-[15px] text-mine">{p.common.empty}</p>
                <div className="mt-4 flex justify-center">
                  <ButtonLink href={href(locale, "simulator")} variant="secondary">
                    {common.cta.simulate}
                  </ButtonLink>
                </div>
              </Card>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {visible.map((claim) => {
                  const country = countryOf(claim);
                  const step = stageIndex(claim.currentStage);
                  return (
                    <Card as="article" key={claim.id} className="flex flex-col p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 font-medium text-ink">
                          <span aria-hidden="true">{country.flag}</span>
                          {country.name[locale]}
                          <span className="font-mono text-xs text-mine">{claim.id}</span>
                        </p>
                        {entityFilter === "all" && (
                          <Badge tone="neutral">{entityName(claim.entityId, locale)}</Badge>
                        )}
                      </div>
                      {claim.actionRequired && (
                        <Badge tone="gold" className="mt-2 self-start">
                          {p.common.actionRequired}
                        </Badge>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-mine">{claim.securities}</p>
                      <p className="mt-1 font-mono text-xs text-mine">
                        {t.claims.years} {claim.taxYears}
                      </p>
                      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm text-mine">
                          {claim.outcome ? t.claims.recoveredLabel : p.common.recoverable}
                        </span>
                        <span
                          className={`font-mono text-lg font-medium ${
                            claim.outcome ? "text-brand" : "text-gold-ink"
                          }`}
                        >
                          {fc(claim.outcome?.recovered ?? claim.recoverableEstimate)}
                        </span>
                      </div>
                      <div className="mt-3">
                        <TimelineCompact currentStage={claim.currentStage} locale={locale} />
                      </div>
                      <ProgressGauge
                        className="mt-2"
                        progress={step / 7}
                        ariaLabel={t.claims.progressLabel(step + 1)}
                      />
                      <div className="mt-4 flex-1" />
                      <div className="border-t border-rule pt-3">
                        <Link
                          href={claimHref(locale, claim.id)}
                          className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
                        >
                          {p.common.viewClaim} →
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---------------------------------------------------- */}
          {/* Latest notifications                                   */}
          {/* ---------------------------------------------------- */}
          <section className="mt-10" aria-labelledby="dash-notifs">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="dash-notifs" className="font-display text-xl font-semibold text-ink">
                {t.notifications.title}
              </h2>
              <Link
                href={href(locale, "portalNotifications")}
                className="text-sm font-medium text-brand underline-offset-4 hover:underline"
              >
                {t.notifications.all} →
              </Link>
            </div>
            <Card className="mt-4">
              <ul>
                {latestNotifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex flex-wrap items-start gap-x-3 gap-y-1 border-b border-rule px-4 py-3 last:border-b-0"
                  >
                    <Badge tone={KIND_TONE[n.kind]}>{t.notifications.kinds[n.kind]}</Badge>
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="text-sm leading-relaxed text-ink">{n.body[locale]}</p>
                      <p className="mt-0.5 font-mono text-xs text-mine">
                        {formatDate(n.date, locale)}
                      </p>
                    </div>
                    {n.claimId && (
                      <Link
                        href={claimHref(locale, n.claimId)}
                        className="font-mono text-xs text-brand underline-offset-4 hover:underline"
                        aria-label={`${p.common.viewClaim} ${n.claimId}`}
                      >
                        {n.claimId} →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>

        {/* ------------------------------------------------------ */}
        {/* Context sidebar                                          */}
        {/* ------------------------------------------------------ */}
        <aside>
          <Card className="p-5">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.aside.kicker}
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold text-ink">{t.aside.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mine">{t.aside.body}</p>
            <ButtonLink href={href(locale, "simulator")} className="mt-4 w-full">
              {common.cta.simulate}
            </ButtonLink>
            <TrustLine text={common.trustLine} className="mt-2" />
          </Card>
        </aside>
      </div>
    </div>
  );
}
