"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { getPortalStrings } from "@/content/portal";
import {
  DEMO_ENTITIES,
  DEMO_INVOICES,
  type DemoClaim,
  type DemoInvoice,
} from "@/data/demo-portal";
import { PRICING, computeCommission } from "@/config/pricing";
import { usePortal, filterByEntity } from "@/components/portal/PortalContext";
import { Badge, Button, ButtonLink, Card, TrustLine } from "@/components/ui/primitives";
import { DoubleRule, LedgerLine } from "@/components/ui/ledger";

/* ------------------------------------------------------------------ */
/* Local helpers (foundation files are read-only)                      */
/* ------------------------------------------------------------------ */

function entityName(id: string, locale: Locale): string {
  const entity = DEMO_ENTITIES.find((e) => e.id === id);
  return entity ? entity.name[locale] : id;
}

/** The settled claim an invoice bills, resolved from the claim id cited in its label. */
function settledClaimFor(invoice: DemoInvoice, claims: DemoClaim[]): DemoClaim | undefined {
  return claims.find((c) => c.outcome && invoice.label.fr.includes(c.id));
}

/** Named UI states for mocked actions — no alert(), one notice at a time. */
type BillingNotice = { kind: "invoice-pdf"; invoiceId: string } | { kind: "payment-method" };

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface BillingCopy {
  metaTitle: string;
  metaDescription: string;
  lede: { before: string; link: string; after: string };
  count: (n: number) => string;
  table: {
    caption: string;
    cols: {
      number: string;
      date: string;
      label: string;
      amount: string;
      status: string;
      actions: string;
    };
  };
  status: { paid: string; deducted: string };
  pdfUnavailable: string;
  detail: {
    toggle: string;
    total: string;
    settleTitle: (claimId: string) => string;
    recovered: string;
    fee: string;
    feeSub: (rate: string) => string;
    disbursements: string;
    net: (date: string) => string;
    note: string;
  };
  tableNote: string;
  payment: {
    title: string;
    method: string;
    body: string;
    edit: string;
    editUnavailable: string;
  };
  model: {
    kicker: string;
    title: string;
    body: (floor: string, cap: string) => string;
    cta: string;
  };
}

const copy: Localized<BillingCopy> = {
  fr: {
    metaTitle: "Facturation — Espace client FiscalPlace",
    metaDescription:
      "Vos factures FiscalPlace : commissions au succès déduites des versements, services à prix fixe, débours à prix coûtant. Détail ligne à ligne.",
    lede: {
      before:
        "Vous n'êtes facturé qu'au succès : la commission est déduite du versement, jamais demandée d'avance — le modèle complet est expliqué sur ",
      link: "comment nous sommes payés",
      after: ".",
    },
    count: (n) => `${n} facture${n === 1 ? "" : "s"} au registre pour cette vue.`,
    table: {
      caption: "Factures : numéro, date, libellé, montant, statut et téléchargement",
      cols: {
        number: "Facture",
        date: "Date",
        label: "Libellé",
        amount: "Montant",
        status: "Statut",
        actions: "Actions",
      },
    },
    status: { paid: "Payée", deducted: "Déduite du versement" },
    pdfUnavailable: "PDF de démonstration non disponible",
    detail: {
      toggle: "Voir le détail des lignes",
      total: "Total facture",
      settleTitle: (claimId) => `Du remboursement au versement net — dossier ${claimId}`,
      recovered: "Trop-perçu récupéré",
      fee: "Commission au succès",
      feeSub: (rate) => `Taux effectif ${rate} · grille publique`,
      disbursements: "Débours refacturés à prix coûtant",
      net: (date) => `Net versé le ${date}`,
      note: "Le net vous est viré directement : cette facture a été déduite du versement, rien n'a été prélevé sur votre moyen de paiement.",
    },
    tableNote:
      "Montants en euros. Les commissions suivent la grille publique en vigueur au jour du versement ; les débours sont refacturés à prix coûtant, ligne à ligne.",
    payment: {
      title: "Moyen de paiement",
      method: "[MOYEN DE PAIEMENT DE DÉMONSTRATION]",
      body: "Cette carte ne sert qu'aux services à prix fixe et à l'abonnement de suivi. La commission au succès, elle, est déduite du versement : elle ne passe jamais par ce moyen de paiement.",
      edit: "Modifier",
      editUnavailable: "Modification indisponible en démonstration",
    },
    model: {
      kicker: "Le modèle",
      title: "Pas de récupération, pas de facture",
      body: (floor, cap) =>
        `Commission dégressive par tranches marginales, uniquement sur les montants effectivement récupérés : minimum ${floor} par dossier abouti, plafond ${cap} par dossier, et zéro frais si la démarche n'aboutit pas.`,
      cta: "Comment nous sommes payés",
    },
  },
  en: {
    metaTitle: "Billing — FiscalPlace client area",
    metaDescription:
      "Your FiscalPlace invoices: success fees deducted from payouts, fixed-fee services, disbursements at cost. Line-by-line detail.",
    lede: {
      before:
        "You are only billed on success: the fee is deducted from the payout, never charged upfront — the full model is explained on ",
      link: "how we get paid",
      after: ".",
    },
    count: (n) => `${n} invoice${n === 1 ? "" : "s"} in the ledger for this view.`,
    table: {
      caption: "Invoices: number, date, description, amount, status and download",
      cols: {
        number: "Invoice",
        date: "Date",
        label: "Description",
        amount: "Amount",
        status: "Status",
        actions: "Actions",
      },
    },
    status: { paid: "Paid", deducted: "Deducted from payout" },
    pdfUnavailable: "Demo PDF not available",
    detail: {
      toggle: "View line detail",
      total: "Invoice total",
      settleTitle: (claimId) => `From refund to net payout — claim ${claimId}`,
      recovered: "Over-withholding recovered",
      fee: "Success fee",
      feeSub: (rate) => `Effective rate ${rate} · public grid`,
      disbursements: "Disbursements at cost",
      net: (date) => `Net paid out on ${date}`,
      note: "The net amount is wired straight to you: this invoice was deducted from the payout — nothing was charged to your payment method.",
    },
    tableNote:
      "Amounts in euros. Fees follow the public grid in force on the payout date; disbursements are re-invoiced at cost, line by line.",
    payment: {
      title: "Payment method",
      method: "[DEMO PAYMENT METHOD]",
      body: "This card is only used for fixed-fee services and the monitoring subscription. The success fee is deducted from the payout: it never touches this payment method.",
      edit: "Edit",
      editUnavailable: "Editing not available in the demo",
    },
    model: {
      kicker: "The model",
      title: "No recovery, no invoice",
      body: (floor, cap) =>
        `A degressive fee by marginal tranche, charged only on amounts actually recovered: ${floor} minimum per successful claim, capped at ${cap} per claim — and nothing at all if the claim fails.`,
      cta: "How we get paid",
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
  const { claims, entityFilter } = usePortal();
  const [notice, setNotice] = useState<BillingNotice | null>(null);

  const visible = [...filterByEntity(DEMO_INVOICES, entityFilter)].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const fc2 = (n: number) => formatCurrency(n, locale, PRICING.currency, 2);
  const fc0 = (n: number) => formatCurrency(n, locale, PRICING.currency);

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">{p.nav.billing}</h1>
        <p className="mt-1 max-w-[72ch] text-[15px] leading-relaxed text-mine">
          {t.lede.before}
          <Link
            href={href(locale, "howWeGetPaid")}
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            {t.lede.link}
          </Link>
          {t.lede.after}
        </p>
        <p className="mt-1 text-sm text-mine">{t.count(visible.length)}</p>
      </header>

      {/* -------------------------------------------------------- */}
      {/* Invoices                                                   */}
      {/* -------------------------------------------------------- */}
      {visible.length === 0 ? (
        <Card className="mt-6 p-8 text-center">
          <p className="text-[15px] text-mine">{p.common.empty}</p>
        </Card>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-[6px] border border-rule">
            <table className="w-full min-w-[820px] border-collapse bg-white text-left text-[15px]">
              <caption className="sr-only">{t.table.caption}</caption>
              <thead>
                <tr className="border-b border-rule">
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.table.cols.number}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.table.cols.date}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.table.cols.label}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.table.cols.amount}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.table.cols.status}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">{t.table.cols.actions}</span>
                  </th>
                </tr>
              </thead>
              {visible.map((invoice) => {
                const claim = settledClaimFor(invoice, claims);
                const outcome = claim?.outcome;
                const effectiveRate = outcome
                  ? formatPercent(computeCommission(outcome.recovered).effectiveRate, locale)
                  : null;
                return (
                  <tbody key={invoice.id}>
                    <tr>
                      <th scope="row" className="px-4 py-3 font-mono text-sm font-normal text-ink">
                        {invoice.number}
                      </th>
                      <td className="px-4 py-3 font-mono text-sm whitespace-nowrap text-mine">
                        {formatDate(invoice.date, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block text-ink">{invoice.label[locale]}</span>
                        {entityFilter === "all" && (
                          <Badge tone="neutral" className="mt-1">
                            {entityName(invoice.entityId, locale)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-ink">
                        {fc2(invoice.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {invoice.status === "paid" ? (
                          <Badge tone="green">{t.status.paid}</Badge>
                        ) : (
                          <Badge tone="neutral">{t.status.deducted}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          className="px-3 py-1.5 text-sm"
                          onClick={() => setNotice({ kind: "invoice-pdf", invoiceId: invoice.id })}
                        >
                          {p.common.download}
                        </Button>
                        {notice?.kind === "invoice-pdf" && notice.invoiceId === invoice.id && (
                          <p role="status" className="mt-1.5 font-mono text-[11px] text-mine">
                            {t.pdfUnavailable}
                          </p>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="border-b border-rule px-4 pb-4 pt-0">
                        <details>
                          <summary className="cursor-pointer py-1 text-sm font-medium text-brand underline-offset-4 hover:underline">
                            {t.detail.toggle}
                          </summary>
                          <div className="mt-2 max-w-xl rounded-[6px] border border-rule bg-paper p-4">
                            {invoice.lines.map((line, i) => (
                              <LedgerLine key={i} label={line.label[locale]} amount={fc2(line.amount)} />
                            ))}
                            <div className="my-2 border-t border-rule" aria-hidden="true" />
                            <LedgerLine label={t.detail.total} amount={fc2(invoice.amount)} bold />
                            <DoubleRule className="mt-2" />

                            {outcome && claim && (
                              <div className="mt-5 rounded-[6px] border border-rule bg-white p-4">
                                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                                  {t.detail.settleTitle(claim.id)}
                                </p>
                                <div className="mt-2">
                                  <LedgerLine
                                    label={t.detail.recovered}
                                    amount={fc2(outcome.recovered)}
                                    tone="brand"
                                  />
                                  <LedgerLine
                                    label={t.detail.fee}
                                    amount={`− ${fc2(outcome.fee)}`}
                                    tone="mine"
                                    sub={effectiveRate ? t.detail.feeSub(effectiveRate) : undefined}
                                  />
                                  <LedgerLine
                                    label={t.detail.disbursements}
                                    amount={`− ${fc2(outcome.disbursements)}`}
                                    tone="mine"
                                  />
                                  <div className="my-2 border-t border-rule" aria-hidden="true" />
                                  <LedgerLine
                                    label={t.detail.net(formatDate(outcome.paidOn, locale))}
                                    amount={fc2(outcome.netPaid)}
                                    highlight
                                    bold
                                  />
                                  <DoubleRule className="mt-2" />
                                </div>
                                <p className="mt-3 text-[13px] leading-relaxed text-mine">
                                  {t.detail.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </div>
          <p className="mt-3 max-w-[85ch] text-[13px] leading-relaxed text-mine">{t.tableNote}</p>
        </>
      )}

      {/* -------------------------------------------------------- */}
      {/* Payment method (mocked)                                    */}
      {/* -------------------------------------------------------- */}
      <section className="mt-10" aria-labelledby="billing-payment">
        <h2 id="billing-payment" className="font-display text-xl font-semibold text-ink">
          {t.payment.title}
        </h2>
        <Card className="mt-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 basis-64">
              <p className="font-mono text-sm text-ink">{t.payment.method} •••• 4242</p>
              <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-mine">
                {t.payment.body}
              </p>
            </div>
            <div className="text-right">
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                onClick={() => setNotice({ kind: "payment-method" })}
              >
                {t.payment.edit}
              </Button>
              {notice?.kind === "payment-method" && (
                <p role="status" className="mt-1.5 font-mono text-[11px] text-mine">
                  {t.payment.editUnavailable}
                </p>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* -------------------------------------------------------- */}
      {/* Model recap + CTA                                          */}
      {/* -------------------------------------------------------- */}
      <section className="mt-10" aria-labelledby="billing-model">
        <Card className="p-5 sm:p-6">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.model.kicker}
          </p>
          <h2 id="billing-model" className="mt-2 font-display text-xl font-semibold text-ink">
            {t.model.title}
          </h2>
          <p className="mt-2 max-w-[72ch] text-[15px] leading-relaxed text-mine">
            {t.model.body(fc0(PRICING.floorFee), fc0(PRICING.capFee))}
          </p>
          <div className="mt-4">
            <ButtonLink href={href(locale, "howWeGetPaid")}>{t.model.cta}</ButtonLink>
          </div>
          <TrustLine text={common.trustLine} className="mt-2" />
        </Card>
      </section>
    </div>
  );
}
