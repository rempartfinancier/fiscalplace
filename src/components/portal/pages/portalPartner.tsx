"use client";

import { useEffect, useState } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { PRICING } from "@/config/pricing";
import { DEMO_REFERRALS, DEMO_USER, STAGE_LABELS } from "@/data/demo-portal";
import { getCommon } from "@/content/common";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  StatTile,
  TrustLine,
} from "@/components/ui/primitives";
import { DoubleRule, ProgressGauge } from "@/components/ui/ledger";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface PartnerCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  intro: (share: string) => string;
  stats: {
    referrals: string;
    referralsHint: (claims: number) => string;
    recovered: string;
    recoveredHint: string;
    commissions: string;
    commissionsHint: (share: string) => string;
  };
  referral: {
    title: string;
    body: string;
    codeLabel: string;
    linkLabel: string;
    copy: string;
    copied: string;
  };
  table: {
    title: string;
    caption: string;
    colClient: string;
    colJoined: string;
    colClaims: string;
    colRecovered: string;
    colCommission: string;
    total: string;
    formulaNote: (share: string) => string;
    zeroNote: string;
  };
  payout: {
    title: string;
    body: string;
    placeholder: string;
  };
  whiteLabel: {
    title: string;
    body: string;
    mockLogo: string;
    mockOperated: string;
    cta: string;
  };
  ethics: {
    badge: string;
    body: (share: string) => string;
  };
}

const copy: Localized<PartnerCopy> = {
  fr: {
    metaTitle: "Espace partenaire — FiscalPlace",
    metaDescription:
      "Le suivi de vos apports en un écran : filleuls, dossiers, montants récupérés et rétrocessions de votre cabinet.",
    kicker: "Programme partenaire · CGP",
    title: "Votre espace partenaire",
    intro: (share) =>
      `Votre cabinet apporte les dossiers, FiscalPlace opère la récupération de bout en bout, et vous suivez tout ici. Sur chaque commission effectivement encaissée, ${share} reviennent à votre cabinet — sans jamais renchérir la facture de votre client.`,
    stats: {
      referrals: "Filleuls actifs",
      referralsHint: (claims) => `${claims} dossiers ouverts au total`,
      recovered: "Récupéré cumulé",
      recoveredHint: "pour vos clients, toutes administrations confondues",
      commissions: "Commissions générées",
      commissionsHint: (share) => `rétrocession = ${share} × commission encaissée`,
    },
    referral: {
      title: "Votre lien de parrainage",
      body: "Chaque client qui ouvre son dossier via ce lien est rattaché à votre cabinet, automatiquement et dès le diagnostic gratuit.",
      codeLabel: "Code partenaire",
      linkLabel: "Lien à partager",
      copy: "Copier le lien",
      copied: "Lien copié",
    },
    table: {
      title: "Vos filleuls",
      caption: "Filleuls du cabinet : date d'arrivée, dossiers, montants récupérés et rétrocessions",
      colClient: "Client",
      colJoined: "Depuis le",
      colClaims: "Dossiers",
      colRecovered: "Récupéré",
      colCommission: "Rétrocession",
      total: "Total",
      formulaNote: (share) =>
        `Rétrocession = ${share} × commission FiscalPlace effectivement encaissée (barème public).`,
      zeroNote:
        "Une ligne à 0 € n'est pas une anomalie : tant qu'un dossier n'a pas abouti, personne ne paie rien — ni votre client, ni vous. Le « no win, no fee » vaut aussi pour les rétrocessions.",
    },
    payout: {
      title: "Versement des rétrocessions",
      body: "Les rétrocessions sont versées trimestriellement, sur présentation de votre facture, une fois les commissions correspondantes effectivement encaissées par FiscalPlace. Aucune avance, aucun minimum caché.",
      placeholder: "[MODALITÉS DE FACTURATION PARTENAIRE À VALIDER]",
    },
    whiteLabel: {
      title: "Marque blanche : votre identité, nos écrans",
      body: "Le même portail de suivi, présenté aux couleurs de votre cabinet : vos clients suivent leurs dossiers chez vous, FiscalPlace opère en coulisses.",
      mockLogo: "[LOGO DU CABINET]",
      mockOperated: "opéré par FiscalPlace",
      cta: "Découvrir l'offre marque blanche",
    },
    ethics: {
      badge: "Déontologie",
      body: (share) =>
        `Votre client final voit exactement la même grille tarifaire publique qu'un client direct — pas un euro de plus. Votre rétrocession de ${share} est prélevée sur notre commission, jamais ajoutée à sa facture. Vous pouvez lui montrer la page tarifs : elle dit tout.`,
    },
  },
  en: {
    metaTitle: "Partner area — FiscalPlace",
    metaDescription:
      "Your referral activity on one screen: clients, claims, amounts recovered and your firm's commissions.",
    kicker: "Partner programme · Wealth advisers",
    title: "Your partner area",
    intro: (share) =>
      `Your firm brings the cases, FiscalPlace runs the recovery end to end, and you track everything here. On every fee actually collected, ${share} goes back to your firm — without ever adding a cent to your client's bill.`,
    stats: {
      referrals: "Active referrals",
      referralsHint: (claims) => `${claims} claims opened in total`,
      recovered: "Cumulative recovered",
      recoveredHint: "for your clients, all administrations combined",
      commissions: "Commissions generated",
      commissionsHint: (share) => `referral share = ${share} × fee collected`,
    },
    referral: {
      title: "Your referral link",
      body: "Every client who opens their claim through this link is attached to your firm, automatically and from the free diagnostic onwards.",
      codeLabel: "Partner code",
      linkLabel: "Link to share",
      copy: "Copy link",
      copied: "Link copied",
    },
    table: {
      title: "Your referrals",
      caption: "Firm referrals: joining date, claims, amounts recovered and referral commissions",
      colClient: "Client",
      colJoined: "Since",
      colClaims: "Claims",
      colRecovered: "Recovered",
      colCommission: "Commission",
      total: "Total",
      formulaNote: (share) =>
        `Referral commission = ${share} × FiscalPlace fee actually collected (public grid).`,
      zeroNote:
        "A €0 line is not an anomaly: until a claim succeeds, nobody pays anything — neither your client nor you. “No win, no fee” applies to referral commissions too.",
    },
    payout: {
      title: "Commission payouts",
      body: "Referral commissions are paid quarterly, against your invoice, once the corresponding fees have actually been collected by FiscalPlace. No advance, no hidden minimum.",
      placeholder: "[PARTNER INVOICING TERMS TO BE CONFIRMED]",
    },
    whiteLabel: {
      title: "White label: your identity, our screens",
      body: "The same tracking portal, presented under your firm's brand: your clients follow their claims with you, FiscalPlace operates behind the scenes.",
      mockLogo: "[YOUR FIRM'S LOGO]",
      mockOperated: "operated by FiscalPlace",
      cta: "Explore the white-label offer",
    },
    ethics: {
      badge: "Professional ethics",
      body: (share) =>
        `Your end client sees exactly the same public fee grid as a direct client — not one euro more. Your ${share} share comes out of our fee, never added to their invoice. You can show them the pricing page: it says it all.`,
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
  const common = getCommon(locale);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 4000);
    return () => window.clearTimeout(id);
  }, [copied]);

  /* Figures — all derived from demo data + pricing config, never restated. */
  const share = formatPercent(PRICING.partnerRevShare, locale);
  const totalClaims = DEMO_REFERRALS.reduce((sum, r) => sum + r.claims, 0);
  const totalRecovered = DEMO_REFERRALS.reduce((sum, r) => sum + r.recovered, 0);
  const totalCommission = DEMO_REFERRALS.reduce((sum, r) => sum + r.commission, 0);
  const fc = (n: number) => formatCurrency(n, locale, PRICING.currency);
  const fc2 = (n: number) => formatCurrency(n, locale, PRICING.currency, 2);

  const referralPath = `fiscalplace.com/r/${DEMO_USER.partnerCode}`;

  async function copyLink() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(`https://${referralPath}`);
      setCopied(true);
    } catch {
      /* Silent fallback: the visible link stays selectable by hand. */
    }
  }

  return (
    <div>
      {/* Header */}
      <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
        {t.kicker}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{t.title}</h1>
      <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-mine">
        {t.intro(share)}
      </p>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          value={String(DEMO_REFERRALS.length)}
          label={t.stats.referrals}
          hint={t.stats.referralsHint(totalClaims)}
        />
        <StatTile
          value={fc(totalRecovered)}
          label={t.stats.recovered}
          hint={t.stats.recoveredHint}
          tone="brand"
        />
        <StatTile
          value={fc2(totalCommission)}
          label={t.stats.commissions}
          hint={t.stats.commissionsHint(share)}
          tone="brand"
        />
      </div>

      {/* Referral link */}
      <Card className="mt-8 p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-ink">{t.referral.title}</h2>
        <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-mine">
          {t.referral.body}
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8">
          <div>
            <dt className="font-mono text-xs font-medium uppercase tracking-wide text-mine">
              {t.referral.codeLabel}
            </dt>
            <dd className="mt-1 font-mono text-lg text-ink">{DEMO_USER.partnerCode}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-medium uppercase tracking-wide text-mine">
              {t.referral.linkLabel}
            </dt>
            <dd className="mt-1 flex flex-wrap items-center gap-3">
              <code className="rounded-[4px] border border-rule bg-paper px-2.5 py-1.5 font-mono text-sm text-ink">
                {referralPath}
              </code>
              <Button variant="secondary" onClick={copyLink}>
                {t.referral.copy}
              </Button>
              <span aria-live="polite" className="font-mono text-[13px] text-brand">
                {copied ? t.referral.copied : ""}
              </span>
            </dd>
          </div>
        </dl>
      </Card>

      {/* Referrals table */}
      <h2 className="mt-8 font-display text-xl font-semibold text-ink">{t.table.title}</h2>
      <div className="mt-4 overflow-x-auto rounded-[6px] border border-rule bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
          <caption className="sr-only">{t.table.caption}</caption>
          <thead>
            <tr className="border-b border-rule">
              <th
                scope="col"
                className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
              >
                {t.table.colClient}
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
              >
                {t.table.colJoined}
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
              >
                {t.table.colClaims}
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
              >
                {t.table.colRecovered}
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
              >
                {t.table.colCommission}
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_REFERRALS.map((r) => (
              <tr key={r.client.fr} className="border-b border-rule">
                <th scope="row" className="px-4 py-3 font-normal text-ink">
                  {r.client[locale]}
                </th>
                <td className="px-4 py-3 font-mono text-mine">{formatDate(r.joined, locale)}</td>
                <td className="px-4 py-3 font-mono text-ink">{r.claims}</td>
                <td className="px-4 py-3 font-mono text-brand">{fc(r.recovered)}</td>
                <td className="px-4 py-3 font-mono text-ink">{fc2(r.commission)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium text-ink">
                {t.table.total}
              </th>
              <td className="px-4 py-3" />
              <td className="px-4 py-3 font-mono font-semibold text-ink">{totalClaims}</td>
              <td className="px-4 py-3 font-mono font-semibold text-brand">
                {fc(totalRecovered)}
              </td>
              <td className="px-4 py-3 font-mono font-semibold text-ink">
                {fc2(totalCommission)}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="px-4 pb-4">
          <DoubleRule />
          <p className="mt-3 font-mono text-xs text-mine">{t.table.formulaNote(share)}</p>
          <p className="mt-2 max-w-[80ch] text-[13px] leading-relaxed text-mine">
            {t.table.zeroNote}
          </p>
        </div>
      </div>

      {/* Payouts + ethics */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-ink">{t.payout.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-mine">{t.payout.body}</p>
          <p className="mt-3 inline-block rounded-[4px] bg-tint-gold px-2.5 py-1 font-mono text-xs text-gold-ink">
            {t.payout.placeholder}
          </p>
        </Card>
        <Card className="p-5 sm:p-6">
          <Badge tone="neutral">{t.ethics.badge}</Badge>
          <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.ethics.body(share)}</p>
        </Card>
      </div>

      {/* White-label preview */}
      <Card className="mt-8 p-5 sm:p-6">
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{t.whiteLabel.title}</h2>
            <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-mine">
              {t.whiteLabel.body}
            </p>
            <div className="mt-5">
              <ButtonLink href={href(locale, "whiteLabel")}>{t.whiteLabel.cta}</ButtonLink>
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
          {/* Miniature mockup — decorative preview of the co-branded portal. */}
          <div className="rounded-[6px] border border-rule bg-paper p-3">
            <div className="flex items-center justify-between gap-2 rounded-t-[4px] border border-rule bg-white px-3 py-2">
              <span className="rounded-[4px] border border-dashed border-rule bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-mine">
                {t.whiteLabel.mockLogo}
              </span>
              <span className="font-mono text-[10px] text-mine">{t.whiteLabel.mockOperated}</span>
            </div>
            <div className="rounded-b-[4px] border-x border-b border-rule bg-white px-3 py-3" aria-hidden="true">
              <p className="font-mono text-[11px] text-mine">{STAGE_LABELS.processing[locale]}</p>
              <ProgressGauge progress={0.6} className="mt-1" />
              <p className="mt-3 font-mono text-[11px] text-mine">
                {STAGE_LABELS.paidOut[locale]}
              </p>
              <ProgressGauge progress={1} className="mt-1" />
              <DoubleRule className="mt-3" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
