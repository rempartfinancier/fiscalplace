"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getCountryById,
  RESIDENCES,
  RESIDENCE_LABELS,
  treatyRateFor,
  type Residence,
} from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { formatCurrency, formatDate, formatPercent, type Locale, type Localized } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { Badge, ButtonLink, Card, TrustLine } from "@/components/ui/primitives";
import { LedgerEntry } from "@/components/ui/ledger";

/* ------------------------------------------------------------------ dates */

type W8Status = "valid" | "renewSoon" | "expired";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole calendar months between two dates (floored). */
function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return months;
}

/** IRS rule: a W-8BEN lapses on 31 December of the 3rd calendar year after signature. */
function w8benExpiryIso(signatureIso: string): string {
  const year = Number(signatureIso.slice(0, 4));
  return `${year + 3}-12-31`;
}

function statusFor(daysLeft: number, monthsLeft: number): W8Status {
  if (daysLeft < 0) return "expired";
  if (monthsLeft < 12) return "renewSoon";
  return "valid";
}

const STATUS_TONE: Record<W8Status, "green" | "gold" | "red"> = {
  valid: "green",
  renewSoon: "gold",
  expired: "red",
};

function formatInt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB").format(n);
}

/** Illustration constant — the rates themselves come from @/data/countries. */
const EXAMPLE_GROSS_USD = 1_000;

/* ------------------------------------------------------------------- copy */

interface ToolCopy {
  loading: string;
  form: {
    legend: string;
    dateLabel: string;
    dateHint: string;
    residenceLabel: string;
    residenceHint: string;
    futureDate: string;
  };
  result: {
    srTitle: string;
    expiryLabel: string;
    remainingBefore: string;
    remainingAfterDays: (n: number) => string;
    monthsWord: (n: number) => string;
    expiredBefore: string;
    expiredAfter: (n: number) => string;
    ruleNote: string;
    disclaimer: string;
  };
  bar: {
    elapsed: string;
    remaining: string;
    aria: (pctElapsed: number) => string;
  };
  badges: Record<W8Status, string>;
  ledger: {
    withheld: (pct: string) => string;
    owed: (pct: string) => string;
    treatyRef: (residence: string) => string;
    recover: string;
    footnote: (gross: string) => string;
  };
  expired: {
    title: string;
    body: (statutoryPct: string, treatyPct: string) => string;
    recoveryNote: (years: number) => string;
    ctaRedo: string;
    ctaRecover: string;
    solLink: string;
  };
  renewSoon: {
    title: string;
    body: (price: string) => string;
    cta: string;
  };
  valid: {
    title: string;
    body: string;
    changeNote: string;
    cta: string;
  };
  neverSigned: {
    title: string;
    body: (statutoryPct: string, treatyPct: string) => string;
    cta: string;
  };
}

const copy: Localized<ToolCopy> = {
  fr: {
    loading: "Chargement du vérificateur…",
    form: {
      legend: "Votre W-8BEN",
      dateLabel: "Date de signature du formulaire",
      dateHint:
        "Elle figure en partie III du formulaire, ou dans les documents fiscaux de votre espace client courtier.",
      residenceLabel: "Votre pays de résidence fiscale",
      residenceHint: "Détermine le taux conventionnel que le formulaire sécurise.",
      futureDate: "La date de signature doit être passée : un formulaire ne se vérifie qu'une fois signé.",
    },
    result: {
      srTitle: "Résultat : la validité de votre W-8BEN",
      expiryLabel: "Valable jusqu'au",
      remainingBefore: "Il reste",
      remainingAfterDays: (n) => (n === 1 ? "jour de validité" : "jours de validité"),
      monthsWord: () => "mois",
      expiredBefore: "Expiré depuis",
      expiredAfter: (n) => (n === 1 ? "jour" : "jours"),
      ruleNote:
        "Règle IRS : sauf changement de situation, un W-8BEN reste valable jusqu'au 31 décembre de la 3e année civile suivant sa signature. Signé un 15 mars 2026, il expire le 31 décembre 2029.",
      disclaimer:
        "Vérification indicative, fondée sur la règle générale de validité. Un changement de situation (déménagement, changement de résidence fiscale, changement de statut) rend le formulaire caduc avant cette date — un nouveau doit alors être remis sous 30 jours.",
    },
    bar: {
      elapsed: "Validité écoulée",
      remaining: "Validité restante",
      aria: (pct) => `${pct} % de la période de validité déjà écoulés`,
    },
    badges: {
      valid: "Valide",
      renewSoon: "À renouveler — < 12 mois",
      expired: "Expiré — taux plein appliqué",
    },
    ledger: {
      withheld: (pct) => `Retenue sans W-8BEN valide (${pct})`,
      owed: (pct) => `Retenue avec W-8BEN valide (${pct})`,
      treatyRef: (residence) => `Convention États-Unis · résident ${residence}`,
      recover: "Préservé chaque année",
      footnote: (gross) =>
        `Ce que le formulaire sécurise, pour ${gross} de dividendes américains bruts par an.`,
    },
    expired: {
      title: "Formulaire expiré : le taux plein est revenu, en silence",
      body: (statutoryPct, treatyPct) =>
        `Depuis l'expiration, votre courtier applique très probablement ${statutoryPct} à chaque dividende américain au lieu de ${treatyPct}. Personne ne vous a prévenu : c'est le fonctionnement normal, pas une erreur. Deux démarches réparent la situation — l'une pour l'avenir, l'autre pour le passé.`,
      recoveryNote: (years) =>
        `Le trop-prélevé depuis l'expiration se récupère auprès de l'administration américaine, dans la limite du délai de prescription — en règle générale ${years} ans à compter de chaque prélèvement.`,
      ctaRedo: "Refaire mon W-8BEN",
      ctaRecover: "Récupérer le trop-prélevé",
      solLink: "Vérifier mes délais de prescription",
    },
    renewSoon: {
      title: "Encore valide, mais l'échéance approche",
      body: (price) =>
        `Un renouvellement signé avant l'échéance évite tout passage par le taux plein : le nouveau formulaire remplace l'ancien sans interruption. Faites-le vous-même dès maintenant, ou confiez-nous la préparation (forfait ${price}, rappel d'échéance inclus pour la prochaine fois).`,
      cta: "Préparer mon renouvellement",
    },
    valid: {
      title: "Rien à faire sur ce formulaire",
      body: "Votre W-8BEN est en cours de validité : vos dividendes américains tombent au taux conventionnel, et c'est exactement le but. Notez l'échéance quelque part — aucun courtier n'est tenu de vous prévenir avant l'expiration.",
      changeNote:
        "Un point de vigilance tout de même : un déménagement ou un changement de résidence fiscale rend le formulaire caduc immédiatement, avec 30 jours pour en remettre un à jour.",
      cta: "Pendant ce temps : chiffrer le reste du portefeuille",
    },
    neverSigned: {
      title: "Jamais signé de W-8BEN ? Le test en une minute",
      body: (statutoryPct, treatyPct) =>
        `Ouvrez votre dernier relevé et cherchez un dividende américain : s'il est amputé de ${statutoryPct}, aucun W-8BEN valide n'est en place chez cet établissement — et chaque versement y laisse la différence avec les ${treatyPct} conventionnels. Beaucoup de courtiers l'intègrent à l'ouverture de compte sans le dire : la date de signature se retrouve dans vos documents fiscaux en ligne.`,
      cta: "Mettre un W-8BEN en place",
    },
  },
  en: {
    loading: "Loading the checker…",
    form: {
      legend: "Your W-8BEN",
      dateLabel: "Form signature date",
      dateHint:
        "It appears in Part III of the form, or in the tax documents of your broker's client area.",
      residenceLabel: "Your country of tax residence",
      residenceHint: "Determines the treaty rate the form secures.",
      futureDate: "The signature date must be in the past: a form can only be checked once signed.",
    },
    result: {
      srTitle: "Result: your W-8BEN's validity",
      expiryLabel: "Valid until",
      remainingBefore: "It has",
      remainingAfterDays: (n) => (n === 1 ? "day of validity left" : "days of validity left"),
      monthsWord: (n) => (n === 1 ? "month" : "months"),
      expiredBefore: "Expired",
      expiredAfter: (n) => (n === 1 ? "day ago" : "days ago"),
      ruleNote:
        "IRS rule: absent a change in circumstances, a W-8BEN remains valid until 31 December of the 3rd calendar year after signature. Signed on 15 March 2026, it expires on 31 December 2029.",
      disclaimer:
        "Indicative check, based on the general validity rule. A change in circumstances (moving abroad, a new tax residence, a change of status) voids the form before that date — a new one must then be provided within 30 days.",
    },
    bar: {
      elapsed: "Validity used",
      remaining: "Validity left",
      aria: (pct) => `${pct}% of the validity period already elapsed`,
    },
    badges: {
      valid: "Valid",
      renewSoon: "Renew — under 12 months",
      expired: "Expired — full rate applies",
    },
    ledger: {
      withheld: (pct) => `Withheld without a valid W-8BEN (${pct})`,
      owed: (pct) => `Withheld with a valid W-8BEN (${pct})`,
      treatyRef: (residence) => `US treaty · ${residence} resident`,
      recover: "Kept in your pocket, every year",
      footnote: (gross) => `What the form secures, per ${gross} of gross US dividends a year.`,
    },
    expired: {
      title: "Expired form: the full rate is back, silently",
      body: (statutoryPct, treatyPct) =>
        `Since the expiry, your broker has most likely been applying ${statutoryPct} to every US dividend instead of ${treatyPct}. Nobody warned you: that is how the system works, not a mistake. Two steps repair the situation — one for the future, one for the past.`,
      recoveryNote: (years) =>
        `The over-withholding since expiry can be recovered from the US administration, within the statute of limitations — as a general rule ${years} years from each withholding.`,
      ctaRedo: "Redo my W-8BEN",
      ctaRecover: "Recover the over-withholding",
      solLink: "Check my claim deadlines",
    },
    renewSoon: {
      title: "Still valid, but the deadline is closing in",
      body: (price) =>
        `A renewal signed before the deadline avoids any spell at the full rate: the new form replaces the old one with no interruption. Do it yourself now, or let us prepare it (fixed fee ${price}, expiry reminder included for next time).`,
      cta: "Prepare my renewal",
    },
    valid: {
      title: "Nothing to do on this form",
      body: "Your W-8BEN is in force: your US dividends land at the treaty rate, which is exactly the point. Note the expiry date somewhere — no broker is obliged to warn you before it lapses.",
      changeNote:
        "One caveat all the same: moving abroad or changing tax residence voids the form immediately, with 30 days to provide an updated one.",
      cta: "Meanwhile: put a figure on the rest of the portfolio",
    },
    neverSigned: {
      title: "Never signed a W-8BEN? The one-minute test",
      body: (statutoryPct, treatyPct) =>
        `Open your latest statement and find a US dividend: if it is docked by ${statutoryPct}, no valid W-8BEN is on file with that institution — and every payment leaves the gap with the ${treatyPct} treaty rate on the table. Many brokers embed the form at account opening without saying so: the signature date sits in your online tax documents.`,
      cta: "Put a W-8BEN in place",
    },
  },
};

/* -------------------------------------------------------------- component */

export function W8benCheckerTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const us = getCountryById("US")!;

  const [signatureDate, setSignatureDate] = useState("");
  const [residence, setResidence] = useState<Residence>("FR");
  /** Set client-side only (new Date() must never run during SSR rendering of results). */
  const [todayIso, setTodayIso] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setTodayIso(toIsoDate(now));
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    setSignatureDate((prev) => (prev === "" ? toIsoDate(twoYearsAgo) : prev));
  }, []);

  const isFuture = todayIso !== null && ISO_DATE.test(signatureDate) && signatureDate > todayIso;

  const computed = useMemo(() => {
    if (todayIso === null || !ISO_DATE.test(signatureDate) || signatureDate > todayIso) return null;
    const today = new Date(todayIso + "T12:00:00");
    const signature = new Date(signatureDate + "T12:00:00");
    const expiryIso = w8benExpiryIso(signatureDate);
    const expiry = new Date(expiryIso + "T12:00:00");

    const daysLeft = Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
    const monthsLeft = monthsBetween(today, expiry);
    const status = statusFor(daysLeft, monthsLeft);

    const total = expiry.getTime() - signature.getTime();
    const gone = today.getTime() - signature.getTime();
    const elapsedPct =
      total <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((gone / total) * 100)));

    return { expiryIso, daysLeft, monthsLeft, status, elapsedPct };
  }, [todayIso, signatureDate]);

  const statutoryRate = us.statutoryRate;
  const treatyRate = treatyRateFor(us, residence);
  const pStatutory = formatPercent(statutoryRate, locale);
  const pTreaty = formatPercent(treatyRate, locale);
  const usd = (n: number) => formatCurrency(n, locale, "USD");
  const w8benPrice = formatCurrency(PRICING.fixedServices.w8ben, locale);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ form */}
      <Card className="p-5 sm:p-6">
        <form onSubmit={(e) => e.preventDefault()} aria-label={t.form.legend}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="w8-date" className="mb-1.5 block text-sm font-medium text-ink">
                {t.form.dateLabel}
              </label>
              <input
                id="w8-date"
                type="date"
                value={signatureDate}
                min="2000-01-01"
                max={todayIso ?? undefined}
                onChange={(e) => setSignatureDate(e.target.value)}
                aria-invalid={isFuture || undefined}
                aria-describedby="w8-date-hint"
                className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-[15px] text-ink"
              />
              <p id="w8-date-hint" className="mt-1.5 text-xs text-mine">
                {t.form.dateHint}
              </p>
              {isFuture && (
                <p role="alert" className="mt-1.5 text-sm text-debit">
                  {t.form.futureDate}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="w8-residence" className="mb-1.5 block text-sm font-medium text-ink">
                {t.form.residenceLabel}
              </label>
              <select
                id="w8-residence"
                value={residence}
                onChange={(e) => setResidence(e.target.value as Residence)}
                aria-describedby="w8-residence-hint"
                className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
              >
                {RESIDENCES.map((r) => (
                  <option key={r} value={r}>
                    {RESIDENCE_LABELS[r][locale]}
                  </option>
                ))}
              </select>
              <p id="w8-residence-hint" className="mt-1.5 text-xs text-mine">
                {t.form.residenceHint}
              </p>
            </div>
          </div>
        </form>
      </Card>

      {computed === null && !isFuture && (
        <Card className="p-8 text-center">
          <p className="font-mono text-sm text-mine">{t.loading}</p>
        </Card>
      )}

      {computed !== null && (
        <>
          {/* -------------------------------------------------- main result */}
          <Card className="p-5 sm:p-8">
            <h2 className="sr-only">{t.result.srTitle}</h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                {t.result.expiryLabel}
              </p>
              <span key={`${signatureDate}-${computed.status}`} className="animate-stamp inline-flex">
                <Badge tone={STATUS_TONE[computed.status]}>{t.badges[computed.status]}</Badge>
              </span>
            </div>

            <p
              className={`mt-3 font-mono text-3xl font-medium sm:text-4xl ${
                computed.status === "expired" ? "text-debit" : "text-ink"
              }`}
            >
              {formatDate(computed.expiryIso, locale)}
            </p>

            {computed.status === "expired" ? (
              <p className="mt-2 text-[15px] text-debit">
                {t.result.expiredBefore}{" "}
                <span className="font-mono font-medium">
                  {formatInt(Math.abs(computed.daysLeft), locale)}
                </span>{" "}
                {t.result.expiredAfter(Math.abs(computed.daysLeft))}.
              </p>
            ) : (
              <p className="mt-2 text-[15px] text-mine">
                {t.result.remainingBefore}{" "}
                <span className="font-mono font-medium text-ink">
                  {formatInt(computed.daysLeft, locale)}
                </span>{" "}
                {t.result.remainingAfterDays(computed.daysLeft)}
                {computed.monthsLeft >= 1 && (
                  <>
                    {" "}
                    (≈ <span className="font-mono text-ink">{computed.monthsLeft}</span>{" "}
                    {t.result.monthsWord(computed.monthsLeft)})
                  </>
                )}
                .
              </p>
            )}

            {/* elapsed / remaining validity bar — grey solid vs gold hatching */}
            <div className="mt-6">
              <div
                className="relative h-3 w-full overflow-hidden rounded-[2px] border border-rule bg-white"
                role="img"
                aria-label={t.bar.aria(computed.elapsedPct)}
              >
                <span
                  className="absolute inset-y-0 left-0 bg-rule"
                  style={{ width: `${computed.elapsedPct}%` }}
                />
                {computed.elapsedPct < 100 && (
                  <span
                    className="hatch-gold absolute inset-y-0"
                    style={{ left: `${computed.elapsedPct}%`, right: 0 }}
                  />
                )}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-3 font-mono text-[11px] text-mine">
                <span>{formatDate(signatureDate, locale)}</span>
                <span>{formatDate(computed.expiryIso, locale)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-mine">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-[2px] border border-rule bg-rule"
                  />
                  {t.bar.elapsed}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="hatch-gold inline-block h-2.5 w-2.5 rounded-[2px] border border-rule bg-white"
                  />
                  {t.bar.remaining}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-[6px] border border-rule bg-paper p-4">
              <p className="text-sm leading-relaxed text-mine">{t.result.ruleNote}</p>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-mine">{t.result.disclaimer}</p>
          </Card>

          {/* ------------------------------------------------------- stakes */}
          <LedgerEntry
            withheldLabel={t.ledger.withheld(pStatutory)}
            withheldAmount={usd(-EXAMPLE_GROSS_USD * statutoryRate)}
            owedLabel={t.ledger.owed(pTreaty)}
            owedAmount={usd(-EXAMPLE_GROSS_USD * treatyRate)}
            treatyRef={t.ledger.treatyRef(RESIDENCE_LABELS[residence][locale])}
            recoverLabel={t.ledger.recover}
            recoverAmount={usd(EXAMPLE_GROSS_USD * (statutoryRate - treatyRate))}
            footnote={`${t.ledger.footnote(usd(EXAMPLE_GROSS_USD))} ${common.labels.illustrative}`}
          />

          {/* ------------------------------------- status-dependent action */}
          {computed.status === "expired" && (
            <Card className="border-debit/30 bg-tint-red p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-debit">{t.expired.title}</h3>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink">
                {t.expired.body(pStatutory, pTreaty)}
              </p>
              <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink">
                {t.expired.recoveryNote(us.sol.years)}{" "}
                <a
                  href={href(locale, "solCalculator")}
                  className="font-medium text-brand underline underline-offset-4"
                >
                  {t.expired.solLink}
                </a>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ButtonLink href={href(locale, "serviceW8ben")}>{t.expired.ctaRedo}</ButtonLink>
                <ButtonLink variant="ghost" href={href(locale, "serviceRecovery")}>
                  {t.expired.ctaRecover}
                </ButtonLink>
              </div>
              <TrustLine text={common.trustLine} className="mt-3" />
            </Card>
          )}

          {computed.status === "renewSoon" && (
            <Card className="border-gold/40 bg-tint-gold p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.renewSoon.title}</h3>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink">
                {t.renewSoon.body(w8benPrice)}
              </p>
              <div className="mt-4 flex flex-col items-start gap-2">
                <ButtonLink href={href(locale, "serviceW8ben")}>{t.renewSoon.cta}</ButtonLink>
                <TrustLine text={common.trustLine} />
              </div>
            </Card>
          )}

          {computed.status === "valid" && (
            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.valid.title}</h3>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-mine">
                {t.valid.body}
              </p>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-mine">
                {t.valid.changeNote}
              </p>
              <div className="mt-4">
                <ButtonLink variant="ghost" href={href(locale, "simulator")}>
                  {t.valid.cta}
                </ButtonLink>
              </div>
            </Card>
          )}

          {/* ------------------------------------------------ never signed */}
          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-xl font-semibold text-ink">{t.neverSigned.title}</h3>
            <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-mine">
              {t.neverSigned.body(pStatutory, pTreaty)}
            </p>
            <div className="mt-4">
              <ButtonLink variant="ghost" href={href(locale, "serviceW8ben")}>
                {t.neverSigned.cta}
              </ButtonLink>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
