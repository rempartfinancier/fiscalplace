"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { COUNTRIES } from "@/data/countries";
import { simulate, SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import { PRICING } from "@/config/pricing";
import {
  formatCurrency,
  formatPercent,
  type Locale,
  type Localized,
} from "@/lib/i18n";
import { getCommon } from "@/content/common";
import { href, countryHref } from "@/lib/routes";
import { LedgerLine, DoubleRule } from "@/components/ui/ledger";

/**
 * The hero IS the simulator: country + gross dividends recompose a live
 * Écriture soldée (LedgerLine/DoubleRule). Residence is fixed to FR here for
 * simplicity — the full simulator lets visitors refine it.
 */

interface SimCopy {
  kicker: string;
  countryLabel: string;
  grossLabel: string;
  statutorySub: (iso: string, pct: string) => string;
  treatySub: (iso: string, pct: string) => string;
  feeLine: (fee: string, net: string) => string;
  nothingGB: string;
  nothingNL: (pct: string) => string;
  nothingGeneric: string;
  countrySheet: (name: string) => string;
  smallNote: (threshold: string, floor: string) => string;
  residenceNote: string;
  refine: string;
}

const copy: Localized<SimCopy> = {
  fr: {
    kicker: "Simulation express · résident fiscal France",
    countryLabel: "Pays source des dividendes",
    grossLabel: "Dividendes bruts annuels (€)",
    statutorySub: (iso, pct) => `Taux statutaire ${iso} · ${pct}`,
    treatySub: (iso, pct) => `CDI FR-${iso} · ${pct}`,
    feeLine: (fee, net) =>
      `Commission si succès : ${fee} · net pour vous : ${net}`,
    nothingGB:
      "Le Royaume-Uni ne prélève pas de retenue à la source sur les dividendes ordinaires : il n'y a rien à récupérer, et on préfère vous le dire gratuitement.",
    nothingNL: (pct) =>
      `Le taux néerlandais de ${pct} correspond déjà au taux conventionnel pour un résident de France : en général, rien à récupérer. On vous le dit plutôt que de vendre un dossier vide.`,
    nothingGeneric:
      "Au taux affiché, la retenue prélevée correspond déjà à ce que la convention autorise : rien à récupérer sur ce profil.",
    countrySheet: (name) => `Voir la fiche ${name}`,
    smallNote: (threshold, floor) =>
      `Trop-perçu inférieur à ${threshold} : notre commission plancher de ${floor} absorberait l'essentiel du gain. Conseil honnête : regroupez plusieurs années de dividendes avant de déposer.`,
    residenceNote: "Résidence fiscale : France (fixée ici pour aller vite).",
    refine: "Affiner sur le simulateur complet",
  },
  en: {
    kicker: "Instant estimate · French tax resident",
    countryLabel: "Dividend source country",
    grossLabel: "Annual gross dividends (€)",
    statutorySub: (iso, pct) => `Statutory rate ${iso} · ${pct}`,
    treatySub: (iso, pct) => `FR-${iso} tax treaty · ${pct}`,
    feeLine: (fee, net) => `Fee on success: ${fee} · net to you: ${net}`,
    nothingGB:
      "The United Kingdom levies no withholding tax on ordinary dividends: there is nothing to recover, and we would rather tell you that for free.",
    nothingNL: (pct) =>
      `The Dutch ${pct} rate already matches the treaty rate for a French resident: generally nothing to recover. We say so instead of selling you an empty claim.`,
    nothingGeneric:
      "At the rate shown, the tax withheld already matches what the treaty allows: nothing to recover on this profile.",
    countrySheet: (name) => `See the ${name} guide`,
    smallNote: (threshold, floor) =>
      `Over-withholding below ${threshold}: our ${floor} minimum fee would absorb most of the gain. Honest advice: pool several years of dividends before filing.`,
    residenceNote: "Tax residence: France (fixed here to keep things quick).",
    refine: "Refine in the full simulator",
  },
};

const DEFAULT_COUNTRY_ID = "CH";
const DEFAULT_GROSS = "10000";

export function HeroSimulator({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const selectId = useId();
  const inputId = useId();
  const [countryId, setCountryId] = useState(DEFAULT_COUNTRY_ID);
  const [grossRaw, setGrossRaw] = useState(DEFAULT_GROSS);

  const country = COUNTRIES.find((c) => c.id === countryId) ?? COUNTRIES[0];
  const gross = Math.max(0, Number(grossRaw) || 0);
  const r = simulate({ country, residence: "FR", grossDividend: gross });

  return (
    <div className="rounded-[6px] border border-rule bg-white p-5 shadow-float sm:p-6">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
        {t.kicker}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={selectId}
            className="mb-1 block text-[13px] font-medium text-ink"
          >
            {t.countryLabel}
          </label>
          <select
            id={selectId}
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
          >
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name[locale]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={inputId}
            className="mb-1 block text-[13px] font-medium text-ink"
          >
            {t.grossLabel}
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={grossRaw}
            onChange={(e) => setGrossRaw(e.target.value)}
            className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-[15px] text-ink"
          />
        </div>
      </div>

      <div aria-live="polite" className="mt-5">
        <div key={country.id} className="animate-settle">
          <LedgerLine
            label={common.labels.withheld}
            amount={formatCurrency(r.withheld, locale)}
            tone="debit"
            sub={t.statutorySub(country.id, formatPercent(r.statutoryRate, locale, 3))}
          />
          <LedgerLine
            label={common.labels.owedByTreaty}
            amount={formatCurrency(r.treatyDue, locale)}
            tone="brand"
            sub={t.treatySub(country.id, formatPercent(r.treatyRate, locale, 3))}
          />
          <div className="my-2 border-t border-rule" aria-hidden="true" />
          {r.nothingToRecover ? (
            <LedgerLine
              label={common.labels.overWithholding}
              amount={formatCurrency(0, locale)}
              tone="mine"
              bold
            />
          ) : (
            <LedgerLine
              label={common.labels.overWithholding}
              amount={formatCurrency(r.recoverable, locale)}
              tone="ink"
              highlight
              bold
            />
          )}
          <DoubleRule className="mt-3" />

          {!r.nothingToRecover && !r.smallClaim && r.recoverable > 0 && (
            <p className="mt-3 font-mono text-[13px] text-mine">
              {t.feeLine(
                formatCurrency(r.commission.fee, locale),
                formatCurrency(r.netToClient, locale),
              )}
            </p>
          )}

          {r.nothingToRecover && (
            <div className="mt-3 rounded-[4px] bg-tint-green p-3 text-[13px] leading-relaxed text-ink">
              {country.id === "GB"
                ? t.nothingGB
                : country.id === "NL"
                  ? t.nothingNL(formatPercent(r.statutoryRate, locale))
                  : t.nothingGeneric}{" "}
              <Link
                href={countryHref(locale, country.slug[locale])}
                className="font-medium text-brand underline underline-offset-2"
              >
                {t.countrySheet(country.name[locale])}
              </Link>
            </div>
          )}

          {r.smallClaim && (
            <div className="mt-3 rounded-[4px] bg-tint-gold p-3 text-[13px] leading-relaxed text-ink">
              {t.smallNote(
                formatCurrency(SMALL_CLAIM_ADVICE_THRESHOLD, locale),
                formatCurrency(PRICING.floorFee, locale),
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-mine">
        {common.labels.illustrative} {t.residenceNote}{" "}
        <Link
          href={href(locale, "simulator")}
          className="text-brand underline underline-offset-2"
        >
          {t.refine}
        </Link>
      </p>
    </div>
  );
}
