"use client";

import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, claimHref } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { getPortalStrings } from "@/content/portal";
import { DEMO_ENTITIES, STAGE_LABELS, type DemoClaim } from "@/data/demo-portal";
import { getCountryById } from "@/data/countries";
import { usePortal, filterByEntity } from "@/components/portal/PortalContext";
import { stageIndex } from "@/components/ui/ClaimTimeline";
import { Badge, ButtonLink, Card } from "@/components/ui/primitives";
import { DoubleRule, ProgressGauge } from "@/components/ui/ledger";

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

/** Displayed amount: actual recovery for settled claims, estimate otherwise. */
function claimAmount(claim: DemoClaim): number {
  return claim.outcome?.recovered ?? claim.recoverableEstimate;
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface ClaimsCopy {
  metaTitle: string;
  metaDescription: string;
  lede: (n: number) => string;
  caption: string;
  cols: {
    id: string;
    entity: string;
    country: string;
    stage: string;
    amount: string;
    deadline: string;
    progress: string;
    link: string;
  };
  paidOut: string;
  urgent: string;
  total: (n: number) => string;
  note: string;
  progressLabel: (step: number) => string;
}

const copy: Localized<ClaimsCopy> = {
  fr: {
    metaTitle: "Dossiers — Espace client FiscalPlace",
    metaDescription:
      "Tous vos dossiers de récupération de retenue à la source : étape en cours, montants estimés ou récupérés, délais de prescription.",
    lede: (n) => `${n} dossier${n === 1 ? "" : "s"} au registre pour cette vue.`,
    caption:
      "Liste des dossiers de récupération : entité, pays, étape, montant, prescription et avancement",
    cols: {
      id: "Dossier",
      entity: "Entité",
      country: "Pays",
      stage: "Étape",
      amount: "Montant",
      deadline: "Prescription",
      progress: "Avancement",
      link: "Détail",
    },
    paidOut: "Remboursé",
    urgent: "< 6 mois",
    total: (n) => `Total — ${n} dossier${n === 1 ? "" : "s"}`,
    note: "Montants en euros : potentiel estimé pour les dossiers ouverts, montant effectivement récupéré pour les dossiers soldés.",
    progressLabel: (step) => `Avancement : étape ${step} sur 8`,
  },
  en: {
    metaTitle: "Claims — FiscalPlace client area",
    metaDescription:
      "All your withholding-tax recovery claims: current stage, estimated or recovered amounts, statute-of-limitations deadlines.",
    lede: (n) => `${n} claim${n === 1 ? "" : "s"} in the ledger for this view.`,
    caption:
      "List of recovery claims: entity, country, stage, amount, deadline and progress",
    cols: {
      id: "Claim",
      entity: "Entity",
      country: "Country",
      stage: "Stage",
      amount: "Amount",
      deadline: "Deadline",
      progress: "Progress",
      link: "Detail",
    },
    paidOut: "Paid out",
    urgent: "< 6 months",
    total: (n) => `Total — ${n} claim${n === 1 ? "" : "s"}`,
    note: "Amounts in euros: estimated potential for open claims, amount actually recovered for settled ones.",
    progressLabel: (step) => `Progress: step ${step} of 8`,
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
  const { claims, entityFilter } = usePortal();

  const visible = filterByEntity(claims, entityFilter);
  const total = visible.reduce((sum, c) => sum + claimAmount(c), 0);
  const fc = (n: number) => formatCurrency(n, locale);

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">{p.nav.claims}</h1>
        <p className="mt-1 text-[15px] text-mine">{t.lede(visible.length)}</p>
      </header>

      {visible.length === 0 ? (
        <Card className="mt-6 p-8 text-center">
          <p className="text-[15px] text-mine">{p.common.empty}</p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href={href(locale, "simulator")} variant="secondary">
              {common.cta.simulate}
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-[6px] border border-rule">
            <table className="w-full min-w-[860px] border-collapse bg-white text-left text-[15px]">
              <caption className="sr-only">{t.caption}</caption>
              <thead>
                <tr className="border-b border-rule">
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.cols.id}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.cols.entity}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.cols.country}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.cols.stage}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.cols.amount}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.cols.deadline}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.cols.progress}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">{t.cols.link}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((claim) => {
                  const country = getCountryById(claim.countryId);
                  const step = stageIndex(claim.currentStage);
                  const urgent = !claim.outcome && isUrgentDeadline(claim.solDeadline);
                  return (
                    <tr key={claim.id} className="border-b border-rule hover:bg-paper">
                      <th scope="row" className="px-4 py-3 font-mono text-sm font-normal text-ink">
                        {claim.id}
                      </th>
                      <td className="px-4 py-3 text-sm text-mine">
                        {entityName(claim.entityId, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 whitespace-nowrap text-ink">
                          <span aria-hidden="true">{country?.flag}</span>
                          {country ? country.name[locale] : claim.countryId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {claim.currentStage === "paidOut" ? (
                          <Badge tone="green" className="animate-stamp">
                            {t.paidOut}
                          </Badge>
                        ) : claim.actionRequired ? (
                          <div>
                            <Badge tone="gold">{STAGE_LABELS[claim.currentStage][locale]}</Badge>
                            <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-gold-ink">
                              {p.common.actionRequired}
                            </p>
                          </div>
                        ) : (
                          <Badge tone="neutral">{STAGE_LABELS[claim.currentStage][locale]}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-mono ${claim.outcome ? "text-brand" : "text-gold-ink"}`}
                        >
                          {fc(claimAmount(claim))}
                        </span>
                        <span className="block font-mono text-[11px] uppercase tracking-wide text-mine">
                          {claim.outcome ? common.labels.settled : common.labels.potential}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-sm whitespace-nowrap ${
                            claim.outcome ? "text-mine" : "text-ink"
                          }`}
                        >
                          {formatDate(claim.solDeadline, locale)}
                        </span>
                        {urgent && (
                          <Badge tone="red" className="mt-1 block w-fit">
                            {t.urgent}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block w-24">
                          <ProgressGauge
                            progress={step / 7}
                            ariaLabel={t.progressLabel(step + 1)}
                          />
                        </span>
                        <span className="mt-1 block font-mono text-[11px] text-mine">
                          {step + 1}/8
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={claimHref(locale, claim.id)}
                          className="whitespace-nowrap text-sm font-medium text-brand underline-offset-4 hover:underline"
                          aria-label={`${p.common.viewClaim} ${claim.id}`}
                        >
                          {p.common.viewClaim} →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-paper">
                  <th
                    scope="row"
                    colSpan={4}
                    className="px-4 py-4 text-left text-[15px] font-medium text-ink"
                  >
                    {t.total(visible.length)}
                  </th>
                  <td className="px-4 py-4 text-right align-top">
                    <span className="font-mono text-lg font-semibold text-ink">{fc(total)}</span>
                    <DoubleRule className="mt-1.5" />
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 max-w-[85ch] text-[13px] leading-relaxed text-mine">
            {t.note} {common.labels.illustrative}
          </p>
        </>
      )}
    </div>
  );
}
