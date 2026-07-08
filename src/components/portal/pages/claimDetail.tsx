"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { getPortalStrings } from "@/content/portal";
import {
  DEMO_DOCUMENTS,
  DEMO_ENTITIES,
  STAGE_LABELS,
  type DemoClaim,
  type DemoDocument,
} from "@/data/demo-portal";
import {
  getCountryById,
  treatyRateFor,
  RESIDENCES,
  type Residence,
} from "@/data/countries";
import { usePortal } from "@/components/portal/PortalContext";
import { TimelineVertical } from "@/components/ui/ClaimTimeline";
import { Badge, Button, ButtonLink, Card, TrustLine } from "@/components/ui/primitives";
import { LedgerLine, DoubleRule } from "@/components/ui/ledger";

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

/** Share of the limitation window already elapsed (claim opening → deadline). */
function elapsedShare(startIso: string, deadlineIso: string): number {
  const start = new Date(startIso + "T12:00:00").getTime();
  const end = new Date(deadlineIso + "T12:00:00").getTime();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
}

const DOC_STATUS_TONE: Record<DemoDocument["status"], "green" | "gold" | "neutral"> = {
  extracted: "green",
  processing: "neutral",
  "needs-review": "gold",
};

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface DetailCopy {
  metaDescription: (id: string, country: string) => string;
  header: {
    years: string;
  };
  paidOut: string;
  ledger: {
    kickerOutcome: string;
    kickerEstimate: string;
    recovered: string;
    fee: string;
    feeSub: string;
    disbursements: string;
    net: string;
    paidOn: (date: string) => string;
    invoiceLink: string;
    estimateNote: string;
    gridLink: string;
  };
  timeline: {
    title: string;
  };
  action: {
    docsCta: string;
    mandateCta: string;
  };
  sign: {
    title: string;
    kicker: (id: string) => string;
    intro: string;
    fields: {
      object: string;
      authority: string;
      fees: string;
      revocation: string;
      scope: string;
    };
    objectValue: (years: string, entity: string) => string;
    feesValue: string;
    revocationValue: string;
    scopeValue: string;
    gridLink: string;
    checkbox: string;
    codeLabel: string;
    codeHint: string;
    cta: string;
    confirmedTitle: string;
    confirmed: (date: string, authority: string) => string;
  };
  docs: {
    title: string;
    empty: string;
    uploadCta: string;
    uploadedOn: string;
    status: Record<DemoDocument["status"], string>;
  };
  sol: {
    title: string;
    urgent: string;
    openedOn: string;
    deadlineOn: string;
    barLabel: (pct: number) => string;
    settledNote: string;
  };
}

const copy: Localized<DetailCopy> = {
  fr: {
    metaDescription: (id, country) =>
      `Suivi du dossier ${id} (${country}) : écriture, étapes, documents et prescription — espace client de démonstration FiscalPlace.`,
    header: {
      years: "Années fiscales",
    },
    paidOut: "Remboursé",
    ledger: {
      kickerOutcome: "Écriture soldée",
      kickerEstimate: "Écriture ouverte — estimation",
      recovered: "Remboursement reçu de l'administration",
      fee: "Commission FiscalPlace",
      feeSub: "Commission au succès · grille publique",
      disbursements: "Débours refacturés à prix coûtant",
      net: "Net versé pour vous",
      paidOn: (date) => `Net versé le ${date}. Le détail ligne à ligne figure sur votre facture.`,
      invoiceLink: "Voir la facturation",
      estimateNote:
        "Estimation en contre-valeur euro, établie à partir de vos relevés. Chaque montant est vérifié pièce par pièce avant dépôt — le montant définitif est celui de la décision de l'administration.",
      gridLink: "Voir la grille tarifaire",
    },
    timeline: {
      title: "Suivi du dossier",
    },
    action: {
      docsCta: "Déposer le document manquant",
      mandateCta: "Signer le mandat ci-dessous ↓",
    },
    sign: {
      title: "Signature du mandat",
      kicker: (id) => `Mandat de représentation · ${id}`,
      intro:
        "Lisez le résumé ci-dessous, cochez la case, puis confirmez avec le code reçu par SMS. La signature prend moins d'une minute.",
      fields: {
        object: "Objet",
        authority: "Administration visée",
        fees: "Rémunération",
        revocation: "Révocation",
        scope: "Portée",
      },
      objectValue: (years, entity) =>
        `Mandat donné à FiscalPlace pour préparer, déposer et suivre la demande de remboursement de retenue à la source sur dividendes — années fiscales ${years} — au nom de ${entity}.`,
      feesValue:
        "Commission au succès selon la grille tarifaire publique, prélevée uniquement sur les montants effectivement remboursés. Rien n'est facturé si le dossier n'aboutit pas.",
      revocationValue:
        "Révocable à tout moment par notification écrite, sans frais tant que le dossier n'a pas été déposé auprès de l'administration.",
      scopeValue:
        "Ce mandat couvre uniquement les démarches de remboursement décrites ci-dessus. Il ne donne aucun accès à vos comptes-titres ni à vos comptes bancaires.",
      gridLink: "Consulter la grille tarifaire",
      checkbox: "J'ai lu le résumé du mandat ci-dessus et j'en accepte les termes.",
      codeLabel: "Code de confirmation reçu par SMS",
      codeHint: "Démo : n'importe quel code à 6 chiffres est accepté.",
      cta: "Signer le mandat",
      confirmedTitle: "Mandat signé",
      confirmed: (date, authority) =>
        `Mandat signé le ${date}. Votre dossier passe maintenant au dépôt : nous générons les formulaires officiels et les transmettons à ${authority}. Chaque étape s'affichera ici, et vous serez notifié au moindre changement.`,
    },
    docs: {
      title: "Documents liés",
      empty: "Aucun document n'est encore lié à ce dossier.",
      uploadCta: "Déposer un document",
      uploadedOn: "Déposé le",
      status: {
        extracted: "Données extraites",
        processing: "En traitement",
        "needs-review": "À vérifier",
      },
    },
    sol: {
      title: "Prescription",
      urgent: "< 6 mois",
      openedOn: "Dossier ouvert le",
      deadlineOn: "Prescription le",
      barLabel: (pct) => `${pct} % du délai de prescription est écoulé`,
      settledNote: "Dossier soldé : la prescription n'a plus d'incidence sur cette écriture.",
    },
  },
  en: {
    metaDescription: (id, country) =>
      `Tracking of claim ${id} (${country}): ledger entry, stages, documents and deadline — FiscalPlace demo client area.`,
    header: {
      years: "Tax years",
    },
    paidOut: "Paid out",
    ledger: {
      kickerOutcome: "Entry settled",
      kickerEstimate: "Open entry — estimate",
      recovered: "Refund received from the administration",
      fee: "FiscalPlace fee",
      feeSub: "Success fee · public grid",
      disbursements: "Disbursements at cost",
      net: "Net paid to you",
      paidOn: (date) => `Net paid on ${date}. The line-by-line detail is on your invoice.`,
      invoiceLink: "View billing",
      estimateNote:
        "Estimate in euro counter-value, built from your statements. Every amount is verified document by document before filing — the final figure is the one on the administration's decision.",
      gridLink: "See the fee schedule",
    },
    timeline: {
      title: "Claim timeline",
    },
    action: {
      docsCta: "Upload the missing document",
      mandateCta: "Sign the mandate below ↓",
    },
    sign: {
      title: "Mandate signature",
      kicker: (id) => `Representation mandate · ${id}`,
      intro:
        "Read the summary below, tick the box, then confirm with the code received by SMS. Signing takes less than a minute.",
      fields: {
        object: "Object",
        authority: "Administration addressed",
        fees: "Remuneration",
        revocation: "Revocation",
        scope: "Scope",
      },
      objectValue: (years, entity) =>
        `Mandate given to FiscalPlace to prepare, file and follow up the withholding-tax refund claim on dividends — tax years ${years} — on behalf of ${entity}.`,
      feesValue:
        "Success fee per the public fee schedule, charged only on amounts actually refunded. Nothing is billed if the claim fails.",
      revocationValue:
        "Revocable at any time by written notice, free of charge as long as the claim has not been filed with the administration.",
      scopeValue:
        "This mandate covers only the refund procedures described above. It grants no access to your brokerage or bank accounts.",
      gridLink: "See the fee schedule",
      checkbox: "I have read the mandate summary above and accept its terms.",
      codeLabel: "Confirmation code received by SMS",
      codeHint: "Demo: any 6-digit code is accepted.",
      cta: "Sign the mandate",
      confirmedTitle: "Mandate signed",
      confirmed: (date, authority) =>
        `Mandate signed on ${date}. Your claim now moves to filing: we generate the official forms and submit them to ${authority}. Every step will show here, and you will be notified of any change.`,
    },
    docs: {
      title: "Linked documents",
      empty: "No document is linked to this claim yet.",
      uploadCta: "Upload a document",
      uploadedOn: "Uploaded on",
      status: {
        extracted: "Data extracted",
        processing: "Processing",
        "needs-review": "Needs review",
      },
    },
    sol: {
      title: "Statute of limitations",
      urgent: "< 6 months",
      openedOn: "Claim opened on",
      deadlineOn: "Expires on",
      barLabel: (pct) => `${pct}% of the limitation period has elapsed`,
      settledNote: "Claim settled: the limitation period no longer affects this entry.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getClaimMeta(locale: Locale, claim: DemoClaim): PageMeta {
  const t = copy[locale];
  const p = getPortalStrings(locale);
  const country = getCountryById(claim.countryId);
  const countryName = country ? country.name[locale] : claim.countryId;
  return {
    title: `${p.common.claim} ${claim.id} — ${countryName}`,
    description: t.metaDescription(claim.id, countryName),
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ClaimDetailPage({ locale, claim }: { locale: Locale; claim: DemoClaim }) {
  const t = copy[locale];
  const p = getPortalStrings(locale);
  const common = getCommon(locale);
  const { claims, signClaim } = usePortal();

  /* The prop is the static build-time claim: read the live version from
     the portal context so a signature is reflected immediately. */
  const live = claims.find((c) => c.id === claim.id) ?? claim;

  const [accepted, setAccepted] = useState(false);
  const [code, setCode] = useState("");
  const [justSigned, setJustSigned] = useState(false);

  const country = getCountryById(live.countryId);
  const countryName = country ? country.name[locale] : live.countryId;
  const authority = country ? country.authority[locale] : countryName;
  const entity = DEMO_ENTITIES.find((e) => e.id === live.entityId);
  const entityLabel = entity ? entity.name[locale] : live.entityId;

  const residence: Residence =
    entity && (RESIDENCES as readonly string[]).includes(entity.residence)
      ? (entity.residence as Residence)
      : "OTHER";
  const statutoryRate = country?.statutoryRate ?? 0;
  const treatyRate = country ? treatyRateFor(country, residence) : 0;

  const fc = (n: number, digits = 0) => formatCurrency(n, locale, "EUR", digits);
  const todayIso = new Date().toISOString().slice(0, 10);

  const docs = DEMO_DOCUMENTS.filter((d) => d.claimId === live.id);
  const openedOn = live.history[0]?.date ?? todayIso;
  const urgent = !live.outcome && isUrgentDeadline(live.solDeadline);
  const solPct = Math.round(elapsedShare(openedOn, live.solDeadline) * 100);

  const codeOk = /^\d{6}$/.test(code);
  const canSign = accepted && codeOk;
  const showCeremony = live.currentStage === "mandate" || justSigned;

  const stageBadge =
    live.currentStage === "paidOut" ? (
      <Badge tone="green" className="animate-stamp">
        {t.paidOut}
      </Badge>
    ) : live.actionRequired ? (
      <Badge tone="gold">{STAGE_LABELS[live.currentStage][locale]}</Badge>
    ) : (
      <Badge tone="neutral">{STAGE_LABELS[live.currentStage][locale]}</Badge>
    );

  const mandateRows: { dt: string; dd: ReactNode }[] = [
    { dt: t.sign.fields.object, dd: t.sign.objectValue(live.taxYears, entityLabel) },
    { dt: t.sign.fields.authority, dd: `${authority} — ${countryName}` },
    {
      dt: t.sign.fields.fees,
      dd: (
        <>
          {t.sign.feesValue}{" "}
          <Link
            href={href(locale, "pricing")}
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            {t.sign.gridLink}
          </Link>
        </>
      ),
    },
    { dt: t.sign.fields.revocation, dd: t.sign.revocationValue },
    { dt: t.sign.fields.scope, dd: t.sign.scopeValue },
  ];

  return (
    <div>
      {/* -------------------------------------------------------- */}
      {/* Header                                                     */}
      {/* -------------------------------------------------------- */}
      <Link
        href={href(locale, "portalClaims")}
        className="text-sm font-medium text-brand underline-offset-4 hover:underline"
      >
        ← {p.common.back}
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {p.common.claim} <span className="font-mono text-[0.92em]">{live.id}</span>
          </h1>
          {stageBadge}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[15px] text-mine">
          <span className="flex items-center gap-2 font-medium text-ink">
            <span aria-hidden="true">{country?.flag}</span>
            {countryName}
          </span>
          <Badge tone="neutral">{entityLabel}</Badge>
          <span className="font-mono text-sm">
            {t.header.years} {live.taxYears}
          </span>
        </p>
        <p className="mt-1 text-sm text-mine">{live.securities}</p>
      </header>

      {/* -------------------------------------------------------- */}
      {/* Action required                                            */}
      {/* -------------------------------------------------------- */}
      {live.actionRequired && (
        <div className="mt-6 rounded-[6px] border border-gold/40 bg-tint-gold p-4 sm:p-5">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-gold-ink">
            {p.common.actionRequired}
          </p>
          <p className="mt-1 max-w-[70ch] text-[15px] leading-relaxed text-ink">
            {live.actionRequired[locale]}
          </p>
          <div className="mt-3">
            {live.currentStage === "mandate" ? (
              <a
                href="#mandate-signature"
                className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
              >
                {t.action.mandateCta}
              </a>
            ) : (
              <ButtonLink href={href(locale, "portalDocuments")} variant="secondary">
                {t.action.docsCta}
              </ButtonLink>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* Ledger + timeline                                          */}
      {/* -------------------------------------------------------- */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <div className="grid gap-6">
          {live.outcome ? (
            /* Settled entry: the double rule and the stamp. */
            <div className="rounded-[6px] border border-rule bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                  {t.ledger.kickerOutcome}
                </p>
                <Badge tone="green" className="animate-stamp">
                  {t.paidOut}
                </Badge>
              </div>
              <div className="mt-3">
                <LedgerLine
                  label={t.ledger.recovered}
                  amount={fc(live.outcome.recovered, 2)}
                  tone="brand"
                />
                <LedgerLine
                  label={t.ledger.fee}
                  amount={fc(-live.outcome.fee, 2)}
                  tone="debit"
                  sub={t.ledger.feeSub}
                />
                <LedgerLine
                  label={t.ledger.disbursements}
                  amount={fc(-live.outcome.disbursements, 2)}
                  tone="debit"
                />
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                <LedgerLine
                  label={t.ledger.net}
                  amount={fc(live.outcome.netPaid, 2)}
                  tone="ink"
                  highlight
                  bold
                />
                <DoubleRule className="mt-3" />
                <p className="mt-3 text-[13px] leading-relaxed text-mine">
                  {t.ledger.paidOn(formatDate(live.outcome.paidOn, locale))}
                </p>
                <p className="mt-2">
                  <Link
                    href={href(locale, "portalBilling")}
                    className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                  >
                    {t.ledger.invoiceLink} →
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* Open entry: statutory vs treaty, the gap still hatched. */
            <div className="rounded-[6px] border border-rule bg-white p-5 sm:p-6">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                {t.ledger.kickerEstimate}
              </p>
              <div className="mt-3">
                <LedgerLine
                  label={common.labels.grossDividends}
                  amount={fc(live.grossDividends)}
                  tone="ink"
                />
                <LedgerLine
                  label={`${common.labels.withheld} (${formatPercent(statutoryRate, locale, 3)})`}
                  amount={fc(live.grossDividends * statutoryRate)}
                  tone="debit"
                />
                <LedgerLine
                  label={`${common.labels.owedByTreaty} (${formatPercent(treatyRate, locale, 3)})`}
                  amount={fc(live.grossDividends * treatyRate)}
                  tone="brand"
                  sub={`${common.labels.treatyRef} ${residence}–${live.countryId} · ${formatPercent(treatyRate, locale, 3)}`}
                />
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                <LedgerLine
                  label={common.labels.overWithholding}
                  amount={fc(live.recoverableEstimate)}
                  tone="ink"
                  highlight
                  bold
                />
                {/* No double rule: this entry is not settled yet. */}
                <p className="mt-3 text-[13px] leading-relaxed text-mine">
                  {t.ledger.estimateNote}
                </p>
                <p className="mt-2">
                  <Link
                    href={href(locale, "pricing")}
                    className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                  >
                    {t.ledger.gridLink} →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* Statute of limitations                                 */}
          {/* ---------------------------------------------------- */}
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-ink">{t.sol.title}</h2>
              {urgent && <Badge tone="red">{t.sol.urgent}</Badge>}
            </div>
            {live.outcome ? (
              <p className="mt-2 text-sm leading-relaxed text-mine">{t.sol.settledNote}</p>
            ) : (
              <>
                <div
                  className="relative mt-4 h-2 w-full overflow-hidden rounded-[2px] border border-rule bg-white"
                  role="img"
                  aria-label={t.sol.barLabel(solPct)}
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-rule"
                    style={{ width: `${solPct}%` }}
                  />
                  <span
                    className="absolute inset-y-0 hatch-gold"
                    style={{ left: `${solPct}%`, right: 0 }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono text-xs text-mine">
                  <span>
                    {t.sol.openedOn} {formatDate(openedOn, locale)}
                  </span>
                  <span className={urgent ? "font-medium text-debit" : ""}>
                    {t.sol.deadlineOn} {formatDate(live.solDeadline, locale)}
                  </span>
                </div>
              </>
            )}
            {country && (
              <p className="mt-3 max-w-[70ch] text-[13px] leading-relaxed text-mine">
                {country.sol.notes[locale]}
              </p>
            )}
          </Card>
        </div>

        {/* ------------------------------------------------------ */}
        {/* Vertical timeline                                        */}
        {/* ------------------------------------------------------ */}
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">{t.timeline.title}</h2>
          <div className="mt-5">
            <TimelineVertical
              currentStage={live.currentStage}
              history={live.history}
              locale={locale}
            />
          </div>
        </Card>
      </div>

      {/* -------------------------------------------------------- */}
      {/* Mandate signature ceremony                                 */}
      {/* -------------------------------------------------------- */}
      {showCeremony && (
        <section id="mandate-signature" className="mt-10" aria-labelledby="sign-title">
          <h2 id="sign-title" className="font-display text-xl font-semibold text-ink">
            {t.sign.title}
          </h2>

          {justSigned ? (
            <div className="mt-4 rounded-[6px] border border-brand/30 bg-tint-green p-5 sm:p-6">
              <Badge tone="green" className="animate-stamp">
                {p.common.signed}
              </Badge>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {t.sign.confirmedTitle}
              </h3>
              <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-ink">
                {t.sign.confirmed(formatDate(todayIso, locale), authority)}
              </p>
            </div>
          ) : (
            <Card className="mt-4 p-5 sm:p-6">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                {t.sign.kicker(live.id)}
              </p>
              <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-mine">
                {t.sign.intro}
              </p>

              <dl className="mt-4 space-y-3 rounded-[6px] border border-rule bg-paper p-4 sm:p-5">
                {mandateRows.map((row) => (
                  <div key={row.dt}>
                    <dt className="font-mono text-[11px] font-medium uppercase tracking-wide text-mine">
                      {row.dt}
                    </dt>
                    <dd className="mt-0.5 max-w-[75ch] text-[15px] leading-relaxed text-ink">
                      {row.dd}
                    </dd>
                  </div>
                ))}
              </dl>

              <form
                className="mt-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!canSign) return;
                  signClaim(live.id);
                  setJustSigned(true);
                }}
              >
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand"
                  />
                  <span className="text-[15px] leading-relaxed text-ink">{t.sign.checkbox}</span>
                </label>

                <div className="mt-4">
                  <label htmlFor="mandate-sms-code" className="block text-sm font-medium text-ink">
                    {t.sign.codeLabel}
                  </label>
                  <input
                    id="mandate-sms-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="······"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    aria-describedby="mandate-sms-hint"
                    className="mt-1 w-44 rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-lg tracking-[0.3em] text-ink"
                  />
                  <p id="mandate-sms-hint" className="mt-1 font-mono text-xs text-mine">
                    {t.sign.codeHint}
                  </p>
                </div>

                <div className="mt-5">
                  <Button type="submit" disabled={!canSign}>
                    {t.sign.cta}
                  </Button>
                  <TrustLine text={common.trustLine} className="mt-2" />
                </div>
              </form>
            </Card>
          )}
        </section>
      )}

      {/* -------------------------------------------------------- */}
      {/* Linked documents                                           */}
      {/* -------------------------------------------------------- */}
      <section className="mt-10" aria-labelledby="docs-title">
        <h2 id="docs-title" className="font-display text-xl font-semibold text-ink">
          {t.docs.title}
          {docs.length > 0 && (
            <span className="ml-2 font-mono text-sm font-normal text-mine">{docs.length}</span>
          )}
        </h2>

        {docs.length === 0 ? (
          <Card className="mt-4 p-6">
            <p className="text-[15px] text-mine">{t.docs.empty}</p>
            <div className="mt-3">
              <ButtonLink href={href(locale, "portalDocuments")} variant="secondary">
                {t.docs.uploadCta}
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {docs.map((doc) => (
              <Card as="article" key={doc.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 break-all font-mono text-sm text-ink">{doc.name}</p>
                  <Badge tone={DOC_STATUS_TONE[doc.status]}>{t.docs.status[doc.status]}</Badge>
                </div>
                <p className="mt-1 text-[13px] text-mine">
                  {doc.kind[locale]} ·{" "}
                  <span className="font-mono">
                    {t.docs.uploadedOn} {formatDate(doc.uploadedOn, locale)}
                  </span>
                </p>
                {doc.extraction && (
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-rule pt-3">
                    {doc.extraction.map((entry) => (
                      <div
                        key={entry.field[locale]}
                        className="flex flex-wrap items-baseline justify-between gap-x-3"
                      >
                        <dt className="font-mono text-[11px] uppercase tracking-wide text-mine">
                          {entry.field[locale]}
                        </dt>
                        <dd className="font-mono text-sm text-ink">{entry.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- */}
      {/* Back to list                                               */}
      {/* -------------------------------------------------------- */}
      <div className="mt-10">
        <ButtonLink href={href(locale, "portalClaims")} variant="secondary">
          ← {p.common.back}
        </ButtonLink>
      </div>
    </div>
  );
}
