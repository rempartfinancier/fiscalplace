"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  type Locale,
  type Localized,
} from "@/lib/i18n";
import { countryHref, href } from "@/lib/routes";
import {
  COUNTRIES,
  RESIDENCES,
  RESIDENCE_LABELS,
  getCountryById,
  recoveryGap,
  type CountryTaxProfile,
  type Residence,
} from "@/data/countries";
import { simulate, SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import { ButtonLink, Card, TrustLine } from "@/components/ui/primitives";
import { DoubleRule, LedgerEntry, LedgerLine } from "@/components/ui/ledger";
import { LeadCaptureButton } from "./LeadCaptureButton";

const LEAD_SERVICE_LABEL: Localized<string> = {
  fr: "Simulateur — ouverture de dossier",
  en: "Simulator — opening a claim",
};

/**
 * The public refund simulator — self-service tool #1.
 * Pure presentation over simulate() / computeCommission(): no figure lives here.
 * Pre-fill (?country=XX) is read from window.location after mount so the
 * component never suspends (no Suspense boundary needed).
 */

interface ToolCopy {
  form: {
    sourceLabel: string;
    residenceLabel: string;
    amountLabel: string;
    amountHint: string;
    presetsLabel: string;
  };
  results: {
    heading: string;
    emptyAmount: string;
    treatyRefPrefix: string;
    treatyRefGeneric: string;
    footnote: string;
  };
  commission: {
    heading: string;
    intro: string;
    colFrom: string;
    colTo: string;
    colRate: string;
    colFee: string;
    floorNote: string;
    capNote: string;
    institutionalNote: string;
    recoveredLine: string;
    feeLine: string;
    effectiveRatePrefix: string;
    netLine: string;
  };
  nothing: {
    heading: string;
    body: string;
    whyTitle: string;
    alternativesTitle: string;
    altAria: string;
  };
  sameCountry: {
    heading: string;
    body: string;
    pick: string;
  };
  small: {
    heading: string;
    body: string;
  };
  sol: {
    heading: string;
    yearsUnit: string;
    tip: string;
    calcLink: string;
  };
  countryLinkLabel: string;
}

const copy: Localized<ToolCopy> = {
  fr: {
    form: {
      sourceLabel: "Pays source des dividendes",
      residenceLabel: "Votre pays de résidence fiscale",
      amountLabel: "Dividendes bruts annuels (en euros)",
      amountHint:
        "Montant annuel. Chaque année non prescrite se récupère aussi : elles se cumulent dans un même dossier.",
      presetsLabel: "Montants rapides",
    },
    results: {
      heading: "Votre estimation, ligne à ligne",
      emptyAmount:
        "Saisissez un montant brut (ou choisissez un montant rapide) pour lancer le calcul.",
      treatyRefPrefix: "CONVENTION",
      treatyRefGeneric: "CONVENTION BILATÉRALE APPLICABLE",
      footnote:
        "Écart récupérable : {gap} du montant brut — cas général d'un investisseur particulier en portefeuille.",
    },
    commission: {
      heading: "Notre commission, tranche par tranche",
      intro:
        "Grille dégressive et marginale, comme un barème d'impôt : chaque tranche du montant récupéré paie son propre taux. Et elle ne s'applique qu'à ce qui est effectivement récupéré — zéro récupération, zéro commission.",
      colFrom: "De",
      colTo: "À",
      colRate: "Taux",
      colFee: "Commission",
      floorNote:
        "Plancher appliqué : quel que soit le calcul par tranches, la commission d'un dossier abouti ne descend pas sous {floor}. Elle n'est facturée qu'en cas de récupération effective.",
      capNote:
        "Plafond appliqué : la commission est plafonnée à {cap} par dossier, quel que soit le montant récupéré au-delà.",
      institutionalNote:
        "Au-delà de {threshold} récupérés, une tarification volume (family office, institutionnel) est établie sur devis.",
      recoveredLine: "Trop-perçu récupéré (estimation)",
      feeLine: "Commission au succès",
      effectiveRatePrefix: "Taux effectif",
      netLine: "Net pour vous",
    },
    nothing: {
      heading: "Rien à récupérer ici — et on préfère vous le dire",
      body: "Pour {country}, le taux prélevé sur les dividendes ordinaires ({statutory}) ne dépasse pas le taux conventionnel ({treaty}) : il n'y a en général pas de trop-perçu à réconcilier. Ouvrir un dossier ne vous rapporterait rien, donc nous ne vous le proposons pas.",
      whyTitle: "Pourquoi ?",
      alternativesTitle:
        "Là où il y a réellement un trop-perçu à aller chercher (écart récupérable sur le brut) :",
      altAria: "Simuler avec ce pays source",
    },
    sameCountry: {
      heading: "Cas non applicable : vous résidez dans le pays source",
      body: "Quand le pays de résidence et le pays source sont identiques, la retenue ne relève plus d'une convention entre deux États : elle se régularise via votre fiscalité domestique (déclaration locale, imputation ou remboursement national). Ce n'est pas une démarche conventionnelle — donc pas notre métier, et nous préférons vous le dire plutôt que d'ouvrir un dossier inutile.",
      pick: "Choisissez un autre pays source pour voir un vrai potentiel :",
    },
    small: {
      heading: "Petit dossier : lisez ceci avant d'ouvrir quoi que ce soit",
      body: "En dessous d'environ {threshold} récupérables, notre plancher de {floor} mange l'essentiel du gain — on préfère vous le dire. Pour un petit montant isolé, la démarche en direct (DIY) peut suffire ; sinon, groupez plusieurs années de dividendes dans un même dossier pour repasser au-dessus du seuil.",
    },
    sol: {
      heading: "Jusqu'à quand pouvez-vous réclamer ?",
      yearsUnit: "ans",
      tip: "Le montant simulé couvre une seule année. Chaque année encore dans les délais se réclame aussi et se cumule dans le même dossier : sur {years} ans de dividendes comparables, le potentiel se multiplie d'autant.",
      calcLink: "Calculer mes dates exactes de prescription",
    },
    countryLinkLabel: "Lire la fiche {country}",
  },
  en: {
    form: {
      sourceLabel: "Source country of the dividends",
      residenceLabel: "Your country of tax residence",
      amountLabel: "Annual gross dividends (in euros)",
      amountHint:
        "One year's amount. Every year still within the deadline can be recovered too: they bundle into a single claim.",
      presetsLabel: "Quick amounts",
    },
    results: {
      heading: "Your estimate, line by line",
      emptyAmount: "Enter a gross amount (or pick a quick amount) to run the numbers.",
      treatyRefPrefix: "TREATY",
      treatyRefGeneric: "APPLICABLE BILATERAL TREATY",
      footnote:
        "Recoverable gap: {gap} of the gross amount — general case for an individual portfolio investor.",
    },
    commission: {
      heading: "Our fee, bracket by bracket",
      intro:
        "A degressive, marginal grid — like income-tax brackets: each slice of the recovered amount is charged at its own rate. And it only applies to what is actually recovered — no recovery, no fee.",
      colFrom: "From",
      colTo: "To",
      colRate: "Rate",
      colFee: "Fee",
      floorNote:
        "Floor applied: whatever the bracket maths says, the fee on a successful claim never goes below {floor}. It is only ever charged when money is actually recovered.",
      capNote:
        "Cap applied: the fee is capped at {cap} per claim, however much is recovered beyond that.",
      institutionalNote:
        "Above {threshold} recovered, volume pricing (family office, institutional) is quoted individually.",
      recoveredLine: "Over-withholding recovered (estimate)",
      feeLine: "Success fee",
      effectiveRatePrefix: "Effective rate",
      netLine: "Net to you",
    },
    nothing: {
      heading: "Nothing to recover here — and we would rather tell you",
      body: "For {country}, the rate withheld on ordinary dividends ({statutory}) does not exceed the treaty rate ({treaty}): there is generally no over-withholding to reconcile. Opening a claim would earn you nothing, so we are not going to suggest one.",
      whyTitle: "Why?",
      alternativesTitle:
        "Where there genuinely is over-withholding to go after (recoverable gap on the gross):",
      altAria: "Simulate with this source country",
    },
    sameCountry: {
      heading: "Not applicable: you live in the source country",
      body: "When the residence country and the source country are the same, the withholding no longer falls under a treaty between two states: it is settled through your domestic tax system (local return, credit or national refund). That is not a treaty-refund procedure — so it is not our job, and we would rather say so than open a pointless claim.",
      pick: "Pick another source country to see real potential:",
    },
    small: {
      heading: "Small claim: read this before opening anything",
      body: "Below roughly {threshold} recoverable, our {floor} floor fee eats most of the gain — we would rather tell you. For a small one-off amount, doing it yourself may be enough; otherwise, bundle several years of dividends into one claim to get back above the threshold.",
    },
    sol: {
      heading: "How long do you have to claim?",
      yearsUnit: "years",
      tip: "The simulated amount covers a single year. Every year still within the deadline can be claimed too, bundled into the same file: with {years} years of comparable dividends, the potential multiplies accordingly.",
      calcLink: "Work out my exact deadlines",
    },
    countryLinkLabel: "Read the {country} guide",
  },
};

const PRESETS = [1_000, 5_000, 20_000, 100_000] as const;
const DEFAULT_COUNTRY_ID = "CH";
const DEFAULT_GROSS = "5000";

const FIELD_CLASS =
  "mt-1.5 h-11 w-full rounded-[6px] border border-rule bg-white px-3 text-[15px] text-ink focus:border-brand";

/** Alternative source countries with a real recoverable gap for this residence. */
function alternativesFor(current: CountryTaxProfile, residence: Residence): CountryTaxProfile[] {
  return COUNTRIES.filter(
    (c) => c.id !== current.id && c.id !== residence && recoveryGap(c, residence) > 0,
  )
    .sort((a, b) => recoveryGap(b, residence) - recoveryGap(a, residence))
    .slice(0, 5);
}

function CountryChips({
  locale,
  current,
  residence,
  onPick,
  ariaLabel,
}: {
  locale: Locale;
  current: CountryTaxProfile;
  residence: Residence;
  onPick: (id: string) => void;
  ariaLabel: string;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {alternativesFor(current, residence).map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onPick(c.id)}
            aria-label={`${ariaLabel} : ${c.name[locale]}`}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[6px] border border-rule bg-white px-3 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <span aria-hidden="true">{c.flag}</span>
            {c.name[locale]}
            <span className="font-mono text-[13px] text-gold-ink">
              +{formatPercent(recoveryGap(c, residence), locale, 1)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function SimulatorTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const [countryId, setCountryId] = useState<string>(DEFAULT_COUNTRY_ID);
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("country")?.toUpperCase() ?? "";
    if (getCountryById(param)) setCountryId(param);
  }, []);
  const [residence, setResidence] = useState<Residence>("FR");
  const [grossInput, setGrossInput] = useState<string>(DEFAULT_GROSS);

  const country = getCountryById(countryId) ?? COUNTRIES[0];
  const gross = Math.max(0, Number(grossInput) || 0);
  const result = simulate({ country, residence, grossDividend: gross });
  const sameCountry = residence !== "OTHER" && residence === country.id;

  const floorFmt = formatCurrency(PRICING.floorFee, locale);
  const capFmt = formatCurrency(PRICING.capFee, locale);

  const treatyRef =
    residence === "OTHER"
      ? `${t.results.treatyRefGeneric} · ${formatPercent(result.treatyRate, locale, 3)}`
      : `${t.results.treatyRefPrefix} ${residence}-${country.id} · ${formatPercent(result.treatyRate, locale, 3)}`;

  const leadDetail =
    locale === "fr"
      ? `Pays source : ${country.name.fr} · Résidence : ${RESIDENCE_LABELS[residence].fr} · Dividendes bruts simulés : ${formatCurrency(gross, locale)} · Trop-perçu estimé : ${formatCurrency(result.recoverable, locale)} (net après commission : ${formatCurrency(result.netToClient, locale)})`
      : `Source country: ${country.name.en} · Residence: ${RESIDENCE_LABELS[residence].en} · Simulated gross dividends: ${formatCurrency(gross, locale)} · Estimated over-withholding: ${formatCurrency(result.recoverable, locale)} (net after fee: ${formatCurrency(result.netToClient, locale)})`;

  return (
    <section aria-label={t.results.heading}>
      {/* ——— Inputs ——— */}
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sim-source" className="block text-sm font-medium text-ink">
              {t.form.sourceLabel}
            </label>
            <select
              id="sim-source"
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className={FIELD_CLASS}
            >
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name[locale]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sim-residence" className="block text-sm font-medium text-ink">
              {t.form.residenceLabel}
            </label>
            <select
              id="sim-residence"
              value={residence}
              onChange={(e) => setResidence(e.target.value as Residence)}
              className={FIELD_CLASS}
            >
              {RESIDENCES.map((r) => (
                <option key={r} value={r}>
                  {RESIDENCE_LABELS[r][locale]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="sim-gross" className="block text-sm font-medium text-ink">
            {t.form.amountLabel}
          </label>
          <input
            id="sim-gross"
            type="number"
            min={0}
            step={100}
            inputMode="decimal"
            value={grossInput}
            onChange={(e) => setGrossInput(e.target.value)}
            className={`${FIELD_CLASS} font-mono`}
          />
          <div
            role="group"
            aria-label={t.form.presetsLabel}
            className="mt-2.5 flex flex-wrap gap-2"
          >
            {PRESETS.map((p) => {
              const active = gross === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setGrossInput(String(p))}
                  className={`h-9 cursor-pointer rounded-[6px] border px-3 font-mono text-sm transition-colors ${
                    active
                      ? "border-brand bg-tint-green text-brand"
                      : "border-rule bg-white text-mine hover:border-brand hover:text-brand"
                  }`}
                >
                  {formatCurrency(p, locale)}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-mine">{t.form.amountHint}</p>
        </div>
      </Card>

      {/* ——— Live result ——— */}
      <div aria-live="polite" className="mt-8 space-y-6">
        {sameCountry ? (
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {t.sameCountry.heading}
            </h2>
            <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
              {t.sameCountry.body}
            </p>
            <p className="mt-4 text-sm font-medium text-ink">{t.sameCountry.pick}</p>
            <div className="mt-2">
              <CountryChips
                locale={locale}
                current={country}
                residence={residence}
                onPick={setCountryId}
                ariaLabel={t.nothing.altAria}
              />
            </div>
          </Card>
        ) : result.nothingToRecover ? (
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">{t.nothing.heading}</h2>
            <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
              {t.nothing.body
                .replace("{country}", country.name[locale])
                .replace("{statutory}", formatPercent(result.statutoryRate, locale, 3))
                .replace("{treaty}", formatPercent(result.treatyRate, locale, 3))}
            </p>
            <div className="mt-4 border-l-2 border-rule pl-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-mine">
                {t.nothing.whyTitle}
              </p>
              <p className="mt-1 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                {country.specifics[locale][0]}
              </p>
            </div>
            <p className="mt-5">
              <Link
                href={countryHref(locale, country.slug[locale])}
                className="text-[15px] font-medium text-brand underline underline-offset-4"
              >
                {t.countryLinkLabel.replace("{country}", country.name[locale])}
              </Link>
            </p>
            <p className="mt-6 text-sm font-medium text-ink">{t.nothing.alternativesTitle}</p>
            <div className="mt-2">
              <CountryChips
                locale={locale}
                current={country}
                residence={residence}
                onPick={setCountryId}
                ariaLabel={t.nothing.altAria}
              />
            </div>
          </Card>
        ) : gross <= 0 ? (
          <Card className="p-5 sm:p-6">
            <p className="font-mono text-sm text-mine">{t.results.emptyAmount}</p>
          </Card>
        ) : (
          <>
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                {t.results.heading}
              </h2>
              <p className="mt-1 font-mono text-[12px] uppercase tracking-wide text-mine">
                <span aria-hidden="true">{country.flag} </span>
                {country.name[locale]} → {RESIDENCE_LABELS[residence][locale]}
              </p>
            </div>

            <LedgerEntry
              key={`${country.id}-${residence}-${gross}`}
              animate
              withheldLabel={`${common.labels.withheld} (${formatPercent(result.statutoryRate, locale, 3)})`}
              withheldAmount={formatCurrency(result.withheld, locale)}
              owedLabel={common.labels.owedByTreaty}
              owedAmount={formatCurrency(result.treatyDue, locale)}
              treatyRef={treatyRef}
              recoverLabel={common.labels.overWithholding}
              recoverAmount={formatCurrency(result.recoverable, locale)}
              footnote={t.results.footnote.replace(
                "{gap}",
                formatPercent(result.gap, locale, 3),
              )}
            />

            {result.smallClaim && (
              <div className="rounded-[6px] border border-gold/40 bg-tint-gold p-5">
                <h3 className="font-display text-lg font-semibold text-gold-ink">
                  {t.small.heading}
                </h3>
                <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-ink">
                  {t.small.body
                    .replace(
                      "{threshold}",
                      formatCurrency(SMALL_CLAIM_ADVICE_THRESHOLD, locale),
                    )
                    .replace("{floor}", floorFmt)}
                </p>
              </div>
            )}

            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.commission.heading}
              </h3>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                {t.commission.intro}
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rule text-left font-mono text-[11px] uppercase tracking-wide text-mine">
                      <th scope="col" className="py-2 pr-4 font-medium">
                        {t.commission.colFrom}
                      </th>
                      <th scope="col" className="py-2 pr-4 font-medium">
                        {t.commission.colTo}
                      </th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">
                        {t.commission.colRate}
                      </th>
                      <th scope="col" className="py-2 text-right font-medium">
                        {t.commission.colFee}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.commission.breakdown.map((line) => (
                      <tr key={line.from} className="border-b border-rule last:border-b-0">
                        <td className="py-2 pr-4 font-mono text-ink">
                          {formatCurrency(line.from, locale)}
                        </td>
                        <td className="py-2 pr-4 font-mono text-ink">
                          {formatCurrency(line.to, locale)}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-ink">
                          {formatPercent(line.rate, locale, 0)}
                        </td>
                        <td className="py-2 text-right font-mono text-ink">
                          {formatCurrency(line.fee, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.commission.floorApplied && (
                <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-mine">
                  {t.commission.floorNote.replace("{floor}", floorFmt)}
                </p>
              )}
              {result.commission.capApplied && (
                <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-mine">
                  {t.commission.capNote.replace("{cap}", capFmt)}
                </p>
              )}
              {result.recoverable > PRICING.institutionalThreshold && (
                <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-mine">
                  {t.commission.institutionalNote.replace(
                    "{threshold}",
                    formatCurrency(PRICING.institutionalThreshold, locale),
                  )}
                </p>
              )}

              <div className="mt-5">
                <LedgerLine
                  label={t.commission.recoveredLine}
                  amount={formatCurrency(result.recoverable, locale)}
                  tone="gold"
                />
                <LedgerLine
                  label={t.commission.feeLine}
                  amount={`− ${formatCurrency(result.commission.fee, locale)}`}
                  tone="mine"
                  sub={`${t.commission.effectiveRatePrefix} · ${formatPercent(result.commission.effectiveRate, locale, 1)}`}
                />
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                <LedgerLine
                  label={t.commission.netLine}
                  amount={formatCurrency(result.netToClient, locale)}
                  highlight
                  bold
                />
                <DoubleRule className="mt-3" />
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.sol.heading}</h3>
              <p className="mt-2 font-mono text-2xl font-medium text-ink">
                {country.sol.years} {t.sol.yearsUnit}
              </p>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                {country.sol.notes[locale]}
              </p>
              <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                {t.sol.tip.replace("{years}", String(country.sol.years))}
              </p>
              <p className="mt-4">
                <Link
                  href={href(locale, "solCalculator")}
                  className="text-[15px] font-medium text-brand underline underline-offset-4"
                >
                  {t.sol.calcLink}
                </Link>
              </p>
            </Card>

            <div>
              <p className="font-mono text-[12px] text-mine">{common.labels.illustrative}</p>
              <p className="mt-1 font-mono text-[12px] text-mine">
                {common.labels.lastReviewed} {formatDate(country.lastReviewed, locale)}
              </p>
            </div>

            <div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <LeadCaptureButton serviceLabel={LEAD_SERVICE_LABEL[locale]} detail={leadDetail}>
                  {common.cta.openAccount}
                </LeadCaptureButton>
                <ButtonLink
                  variant="ghost"
                  href={countryHref(locale, country.slug[locale])}
                >
                  {t.countryLinkLabel.replace("{country}", country.name[locale])} →
                </ButtonLink>
              </div>
              <TrustLine text={common.trustLine} className="mt-3" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
