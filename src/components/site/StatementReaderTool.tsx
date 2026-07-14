"use client";

import { useMemo, useState } from "react";

import {
  COUNTRIES,
  getCountryById,
  RESIDENCES,
  RESIDENCE_LABELS,
  type Residence,
} from "@/data/countries";
import { SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import { formatCurrency, formatPercent, type Locale, type Localized } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { Badge, ButtonLink, Card, TrustLine } from "@/components/ui/primitives";
import { LedgerEntry } from "@/components/ui/ledger";
import {
  diagnoseById,
  parseStatement,
  type CountryEvidence,
  type DiagnosisStatus,
  type ParseResult,
} from "./statementParser";

/* ------------------------------------------------------------------- copy */

interface StatusCopy {
  badge: string;
  title: string;
  body: (v: { eff: string; treaty: string; statutory: string }) => string;
}

interface ToolCopy {
  paste: {
    label: string;
    placeholder: string;
    privacy: string;
    examplesLabel: string;
    exampleCh: string;
    exampleUs: string;
    detected: string;
    evidence: Record<CountryEvidence, string>;
    grossShort: string;
    withheldShort: string;
  };
  fields: {
    legend: string;
    country: string;
    countryUnknown: string;
    residence: string;
    gross: string;
    withheld: string;
    amountHint: (currency: string) => string;
  };
  missing: {
    title: string;
    country: string;
    gross: string;
    withheld: string;
  };
  statuses: Record<DiagnosisStatus, StatusCopy>;
  rateLine: (v: { treaty: string; statutory: string }) => string;
  countryNotes: Record<string, Partial<Record<DiagnosisStatus, string>>>;
  ledger: {
    withheld: (pct: string) => string;
    owed: (pct: string) => string;
    treatyRef: (country: string, residence: string) => string;
    recover: string;
    footnote: string;
  };
  excessNote: (amount: string) => string;
  smallClaim: (threshold: string) => string;
  warnings: {
    etfTitle: string;
    etfBody: string;
    adr: string;
    multipleIsins: string;
    uncovered: (prefix: string) => string;
  };
  ctas: {
    simulate: string;
    checker: string;
    deadlines: string;
  };
  disclaimer: string;
}

const copy: Localized<ToolCopy> = {
  fr: {
    paste: {
      label: "Collez une ligne de dividende de votre relevé",
      placeholder:
        "Exemple :\n15/05/2026 NOVARTIS AG — ISIN CH0012005267\nMontant brut : 350,00 CHF\nImpôt à la source : -122,50 CHF\nMontant net : 227,50 CHF",
      privacy:
        "L'analyse s'exécute entièrement dans votre navigateur : rien n'est envoyé à un serveur, rien n'est conservé.",
      examplesLabel: "Pas de relevé sous la main ? Essayez :",
      exampleCh: "Exemple suisse (35 %)",
      exampleUs: "Exemple américain (30 %)",
      detected: "Détecté",
      evidence: {
        isin: "via l'ISIN",
        name: "via le nom du pays",
        currency: "via la devise",
      },
      grossShort: "brut",
      withheldShort: "retenue",
    },
    fields: {
      legend: "Vérifiez et complétez",
      country: "Pays source du dividende",
      countryUnknown: "— Sélectionnez le pays —",
      residence: "Votre pays de résidence fiscale",
      gross: "Dividende brut",
      withheld: "Impôt retenu à la source",
      amountHint: (currency) => `En ${currency}, tel qu'il figure sur le relevé.`,
    },
    missing: {
      title: "Pour poser le diagnostic, il manque :",
      country: "le pays source (sélectionnez-le ci-dessus)",
      gross: "le montant brut du dividende",
      withheld: "le montant retenu (0 si rien n'a été prélevé)",
    },
    statuses: {
      treatyOk: {
        badge: "Taux conforme",
        title: "Le bon taux a été appliqué",
        body: ({ eff }) =>
          `Cette ligne a été retenue à ${eff}, soit le taux prévu par la convention pour votre résidence. Rien à récupérer ici — c'est exactement ce qui doit se passer, et personne ne devrait vous facturer quoi que ce soit dessus.`,
      },
      fullStatutory: {
        badge: "Trop-perçu détecté",
        title: "Retenue au taux plein : le trop-perçu est réel",
        body: ({ eff, treaty }) =>
          `${eff} ont été retenus alors que la convention n'autorise que ${treaty} pour votre résidence. La différence ne revient pas toute seule : elle se réclame auprès de l'administration du pays source, dans la limite du délai de prescription.`,
      },
      between: {
        badge: "Sur-prélèvement partiel",
        title: "Taux intermédiaire : un écart subsiste",
        body: ({ eff, treaty, statutory }) =>
          `${eff} retenus — entre le taux conventionnel (${treaty}) et le taux plein (${statutory}). L'écart au-delà du conventionnel se réclame ; la cause exacte (allègement partiel, chaîne d'intermédiaires) se vérifie au diagnostic du dossier.`,
      },
      aboveStatutory: {
        badge: "Au-delà du taux légal",
        title: "Plus que le taux légal : quelque chose s'est mêlé à la ligne",
        body: ({ eff, statutory }) =>
          `${eff} dépassent le taux statutaire du pays (${statutory}). Causes fréquentes : des frais mêlés à la même écriture, plusieurs lignes agrégées — ou un régime particulier du pays. La part au-delà du taux conventionnel reste réclamable ; le surplus au-delà du légal s'examine ligne à ligne.`,
      },
      belowTreaty: {
        badge: "Rien à réclamer",
        title: "Moins que le taux conventionnel : rien à récupérer",
        body: ({ eff, treaty }) =>
          `${eff} retenus, sous le taux conventionnel (${treaty}). Régime de faveur ou particularité du titre — il n'y a rien à réclamer par la voie conventionnelle sur cette ligne.`,
      },
      zeroWithheld: {
        badge: "Aucune retenue",
        title: "Rien n'a été prélevé sur cette ligne",
        body: ({ statutory }) =>
          `Aucune retenue alors que le taux par défaut du pays est ${statutory}. Explications possibles : un taux réduit à la source déjà en place, un dividende exonéré par nature, ou une ligne incomplète — vérifiez que le relevé montre bien le brut et l'impôt.`,
      },
      zeroCountry: {
        badge: "Normal : pays à 0 %",
        title: "Aucune retenue — c'est la règle dans ce pays",
        body: () =>
          `Ce pays ne prélève pas de retenue à la source sur les dividendes ordinaires. Si un montant a malgré tout disparu entre le brut et le net, cherchez des frais ou une distribution particulière (REIT) — pas un impôt récupérable.`,
      },
    },
    rateLine: ({ treaty, statutory }) =>
      `Taux conventionnel pour votre résidence : ${treaty} · taux statutaire du pays : ${statutory}.`,
    countryNotes: {
      US: {
        fullStatutory:
          "Signature américaine classique : aucun W-8BEN valide n'était en place chez ce courtier au moment du versement. Un formulaire valide ramène la retenue au taux conventionnel dès le prochain versement — et le trop-prélevé passé se réclame séparément.",
        treatyOk:
          "Votre W-8BEN est en place et fait son travail. Ne payez personne — nous compris — pour « récupérer » quoi que ce soit sur cette ligne.",
      },
      AU: {
        zeroWithheld:
          "Cas australien typique : les dividendes « fully franked » ne supportent aucune retenue — il n'y a rien à récupérer, et les crédits d'imputation ne sont pas remboursables aux non-résidents.",
      },
      GB: {
        aboveStatutory:
          "Sur une action britannique classique, rien ne devrait être retenu. Une retenue de 20 % signale une distribution immobilière de REIT (PID) — souvent réductible par convention — ou des frais déguisés en impôt.",
      },
      FI: {
        aboveStatutory:
          "Cas finlandais connu : 35 % s'appliquent quand le dépositaire n'a pas identifié l'investisseur. L'écart complet au-delà du taux conventionnel se récupère — pour un résident de France, la convention prévoit 0 %.",
      },
    },
    ledger: {
      withheld: (pct) => `Retenue appliquée (${pct})`,
      owed: (pct) => `Retenue conventionnelle (${pct})`,
      treatyRef: (country, residence) => `Convention ${country} · résident ${residence}`,
      recover: "Trop-perçu sur cette ligne",
      footnote: "Estimation sur cette seule ligne de dividende.",
    },
    excessNote: (amount) =>
      `Dont ${amount} au-delà du taux statutaire : cette part relève probablement de frais (dépositaire, change), pas de l'impôt — elle ne se récupère pas par la voie fiscale.`,
    smallClaim: (threshold) =>
      `Montant modeste : sous ≈ ${threshold} récupérables, notre commission plancher pèse lourd. Le bon réflexe est de grouper plusieurs lignes ou plusieurs années dans une même demande — le simulateur fait ce calcul.`,
    warnings: {
      etfTitle: "Ligne de fonds ou d'ETF détectée",
      etfBody:
        "Dans un fonds ou un ETF, c'est le fonds qui est juridiquement l'actionnaire : la retenue prélevée à son niveau ne vous appartient pas et ne peut pas être réclamée par vous. Ce diagnostic ne vaut que pour des titres détenus en direct.",
      adr: "Ligne ADR : les frais de dépositaire sont distincts de la retenue à la source et ne se récupèrent pas par la voie fiscale.",
      multipleIsins:
        "Plusieurs titres détectés dans le texte collé : analysez une seule ligne de dividende à la fois pour un diagnostic fiable.",
      uncovered: (prefix) =>
        `ISIN commençant par « ${prefix} » : ce pays est hors de notre panel actuel. Sélectionnez le pays manuellement si le titre distribue depuis une juridiction couverte, ou écrivez-nous.`,
    },
    ctas: {
      simulate: "Chiffrer sur tout mon portefeuille",
      checker: "Vérifier mon W-8BEN",
      deadlines: "Vérifier mes délais",
    },
    disclaimer:
      "Diagnostic indicatif, fondé sur les taux généraux de notre base pays (revue régulièrement). Chaque dossier est vérifié ligne à ligne avant tout dépôt.",
  },
  en: {
    paste: {
      label: "Paste a dividend line from your statement",
      placeholder:
        "Example:\n2026-06-11 MSFT(US5949181045) Cash Dividend USD 0.83 per Share 249.00\n2026-06-11 MSFT — US Tax -37.35",
      privacy:
        "The analysis runs entirely in your browser: nothing is sent to a server, nothing is stored.",
      examplesLabel: "No statement at hand? Try:",
      exampleCh: "Swiss example (35%)",
      exampleUs: "US example (30%)",
      detected: "Detected",
      evidence: {
        isin: "via the ISIN",
        name: "via the country name",
        currency: "via the currency",
      },
      grossShort: "gross",
      withheldShort: "withheld",
    },
    fields: {
      legend: "Check and complete",
      country: "Source country of the dividend",
      countryUnknown: "— Select the country —",
      residence: "Your country of tax residence",
      gross: "Gross dividend",
      withheld: "Tax withheld at source",
      amountHint: (currency) => `In ${currency}, as shown on the statement.`,
    },
    missing: {
      title: "To run the diagnosis, we still need:",
      country: "the source country (select it above)",
      gross: "the gross dividend amount",
      withheld: "the amount withheld (0 if nothing was withheld)",
    },
    statuses: {
      treatyOk: {
        badge: "Correct rate",
        title: "The right rate was applied",
        body: ({ eff }) =>
          `This line was withheld at ${eff} — the rate the treaty provides for your residence. Nothing to recover here: this is exactly what should happen, and nobody should charge you anything for it.`,
      },
      fullStatutory: {
        badge: "Over-withholding found",
        title: "Withheld at the full rate: the over-withholding is real",
        body: ({ eff, treaty }) =>
          `${eff} was withheld while the treaty allows only ${treaty} for your residence. The difference does not come back on its own: it must be claimed from the source country's administration, within the statute of limitations.`,
      },
      between: {
        badge: "Partial over-withholding",
        title: "Intermediate rate: a gap remains",
        body: ({ eff, treaty, statutory }) =>
          `${eff} withheld — between the treaty rate (${treaty}) and the full rate (${statutory}). The gap above the treaty rate is claimable; the exact cause (partial relief, intermediary chain) is verified at file diagnostic.`,
      },
      aboveStatutory: {
        badge: "Above the legal rate",
        title: "More than the legal rate: something else is mixed into the line",
        body: ({ eff, statutory }) =>
          `${eff} exceeds the country's statutory rate (${statutory}). Frequent causes: fees mixed into the same entry, several lines aggregated — or a special regime of the country. The portion above the treaty rate remains claimable; the excess above the legal rate is examined line by line.`,
      },
      belowTreaty: {
        badge: "Nothing to claim",
        title: "Below the treaty rate: nothing to recover",
        body: ({ eff, treaty }) =>
          `${eff} withheld, below the treaty rate (${treaty}). A favourable regime or a specificity of the security — there is nothing to claim through the treaty route on this line.`,
      },
      zeroWithheld: {
        badge: "Nothing withheld",
        title: "Nothing was withheld on this line",
        body: ({ statutory }) =>
          `No withholding although the country's default rate is ${statutory}. Possible explanations: relief at source already in place, a dividend exempt by nature, or an incomplete line — check that the statement shows both the gross and the tax.`,
      },
      zeroCountry: {
        badge: "Normal: 0% country",
        title: "No withholding — that is the rule in this country",
        body: () =>
          `This country levies no withholding tax on ordinary dividends. If an amount nonetheless vanished between gross and net, look for fees or a special distribution (REIT) — not a recoverable tax.`,
      },
    },
    rateLine: ({ treaty, statutory }) =>
      `Treaty rate for your residence: ${treaty} · country's statutory rate: ${statutory}.`,
    countryNotes: {
      US: {
        fullStatutory:
          "The classic American signature: no valid W-8BEN was on file with this broker at payment time. A valid form brings withholding down to the treaty rate from the very next payment — and the past over-withholding is claimed separately.",
        treatyOk:
          "Your W-8BEN is in place and doing its job. Don't pay anyone — us included — to 'recover' anything on this line.",
      },
      AU: {
        zeroWithheld:
          "The typical Australian case: fully franked dividends bear no withholding — there is nothing to recover, and franking credits are not refundable to non-residents.",
      },
      GB: {
        aboveStatutory:
          "On a standard UK share nothing should be withheld. A 20% withholding signals a REIT Property Income Distribution — often treaty-reducible — or fees disguised as tax.",
      },
      FI: {
        aboveStatutory:
          "A known Finnish case: 35% applies when the custodian has not identified the investor. The full gap above the treaty rate is recoverable — for a French resident, the treaty provides 0%.",
      },
    },
    ledger: {
      withheld: (pct) => `Withholding applied (${pct})`,
      owed: (pct) => `Treaty withholding (${pct})`,
      treatyRef: (country, residence) => `${country} treaty · ${residence} resident`,
      recover: "Over-withholding on this line",
      footnote: "Estimate for this single dividend line.",
    },
    excessNote: (amount) =>
      `Of which ${amount} sits above the statutory rate: that portion is most likely fees (custody, FX), not tax — it cannot be recovered through the tax route.`,
    smallClaim: (threshold) =>
      `Modest amount: below ≈ ${threshold} recoverable, our floor fee weighs heavily. The right move is to bundle several lines or several years into one claim — the simulator does that maths.`,
    warnings: {
      etfTitle: "Fund or ETF line detected",
      etfBody:
        "In a fund or ETF, the fund is legally the shareholder: withholding levied at its level does not belong to you and cannot be claimed by you. This diagnosis only holds for securities held directly.",
      adr: "ADR line: depositary fees are separate from withholding tax and cannot be recovered through the tax route.",
      multipleIsins:
        "Several securities detected in the pasted text: analyse one dividend line at a time for a reliable diagnosis.",
      uncovered: (prefix) =>
        `ISIN starting with "${prefix}": this country is outside our current panel. Select the country manually if the security distributes from a covered jurisdiction, or write to us.`,
    },
    ctas: {
      simulate: "Run it on my whole portfolio",
      checker: "Check my W-8BEN",
      deadlines: "Check my deadlines",
    },
    disclaimer:
      "Indicative diagnosis, based on the general rates of our country database (reviewed regularly). Every file is verified line by line before any filing.",
  },
};

/* ---------------------------------------------------------------- samples */

const SAMPLE_CH = `15/05/2026 COUPONS NOVARTIS AG — ISIN CH0012005267
Montant brut : 350,00 CHF
Impôt à la source : -122,50 CHF
Montant net : 227,50 CHF`;

const SAMPLE_US = `14/03/2026 APPLE INC US0378331005 Dividende USD 120,00
14/03/2026 APPLE INC US0378331005 Impôts sur dividende USD -36,00`;

const BADGE_TONE: Record<DiagnosisStatus, "green" | "gold" | "red" | "neutral"> = {
  treatyOk: "green",
  zeroCountry: "green",
  fullStatutory: "gold",
  between: "gold",
  aboveStatutory: "red",
  belowTreaty: "neutral",
  zeroWithheld: "neutral",
};

function toNumber(input: string): number | null {
  const s = input.replace(/[\s  ]/g, "").replace(",", ".");
  if (s === "") return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/* -------------------------------------------------------------- component */

export function StatementReaderTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const [pasted, setPasted] = useState("");
  const [parse, setParse] = useState<ParseResult | null>(null);
  const [countryId, setCountryId] = useState("");
  const [residence, setResidence] = useState<Residence>("FR");
  const [grossStr, setGrossStr] = useState("");
  const [withheldStr, setWithheldStr] = useState("");

  const applyText = (text: string) => {
    setPasted(text);
    const p = parseStatement(text);
    setParse(p);
    setCountryId(p.countryId ?? "");
    setGrossStr(p.gross !== null ? String(p.gross) : "");
    setWithheldStr(p.withheld !== null ? String(p.withheld) : "");
  };

  const gross = toNumber(grossStr);
  const withheld = toNumber(withheldStr);
  const currency = parse?.currency ?? "EUR";
  const country = countryId !== "" ? getCountryById(countryId) : undefined;

  const diagnosis = useMemo(() => {
    if (countryId === "" || gross === null || withheld === null || gross <= 0) return null;
    return diagnoseById(countryId, residence, gross, withheld);
  }, [countryId, residence, gross, withheld]);

  const fc = (n: number) => formatCurrency(n, locale, currency, 2);
  const pct = (r: number) => formatPercent(r, locale, 2);

  const missing: string[] = [];
  if (pasted.trim() !== "" && diagnosis === null) {
    if (countryId === "") missing.push(t.missing.country);
    if (gross === null || gross <= 0) missing.push(t.missing.gross);
    if (withheld === null) missing.push(t.missing.withheld);
  }

  const statusCopy = diagnosis !== null ? t.statuses[diagnosis.status] : null;
  const countryNote =
    diagnosis !== null && country !== undefined
      ? t.countryNotes[country.id]?.[diagnosis.status]
      : undefined;
  const showLedger = diagnosis !== null && diagnosis.recoverable > 0.005 && gross !== null;
  const smallClaim =
    diagnosis !== null &&
    diagnosis.recoverable > 0.005 &&
    diagnosis.recoverable < SMALL_CLAIM_ADVICE_THRESHOLD;

  const detectedParts: string[] = [];
  if (parse !== null) {
    if (parse.countryId !== null && parse.countryEvidence !== null) {
      const c = getCountryById(parse.countryId);
      if (c !== undefined) {
        detectedParts.push(`${c.flag} ${c.name[locale]} (${t.paste.evidence[parse.countryEvidence]})`);
      }
    }
    if (parse.currency !== null) detectedParts.push(parse.currency);
    if (parse.gross !== null) detectedParts.push(`${t.paste.grossShort} ${fc(parse.gross)}`);
    if (parse.withheld !== null) detectedParts.push(`${t.paste.withheldShort} ${fc(parse.withheld)}`);
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ paste */}
      <Card className="p-5 sm:p-6">
        <label htmlFor="reader-paste" className="mb-1.5 block text-sm font-medium text-ink">
          {t.paste.label}
        </label>
        <textarea
          id="reader-paste"
          value={pasted}
          onChange={(e) => applyText(e.target.value)}
          rows={5}
          placeholder={t.paste.placeholder}
          aria-describedby="reader-privacy"
          className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-[13px] leading-relaxed text-ink placeholder:text-mine/60"
        />
        <p id="reader-privacy" className="mt-2 text-xs text-mine">
          {t.paste.privacy}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-mine">{t.paste.examplesLabel}</span>
          <button
            type="button"
            onClick={() => applyText(SAMPLE_CH)}
            className="rounded-[6px] border border-rule bg-white px-2.5 py-1 font-mono text-xs text-ink transition-colors hover:border-brand hover:text-brand"
          >
            {t.paste.exampleCh}
          </button>
          <button
            type="button"
            onClick={() => applyText(SAMPLE_US)}
            className="rounded-[6px] border border-rule bg-white px-2.5 py-1 font-mono text-xs text-ink transition-colors hover:border-brand hover:text-brand"
          >
            {t.paste.exampleUs}
          </button>
        </div>
        {detectedParts.length > 0 && (
          <p className="mt-3 font-mono text-xs text-mine">
            <span className="uppercase tracking-wide">{t.paste.detected}</span> ·{" "}
            {detectedParts.join(" · ")}
          </p>
        )}
      </Card>

      {/* ----------------------------------------------------------- fields */}
      <Card className="p-5 sm:p-6">
        <form onSubmit={(e) => e.preventDefault()} aria-label={t.fields.legend}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="reader-country" className="mb-1.5 block text-sm font-medium text-ink">
                {t.fields.country}
              </label>
              <select
                id="reader-country"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
              >
                <option value="">{t.fields.countryUnknown}</option>
                {COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name[locale]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="reader-residence"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                {t.fields.residence}
              </label>
              <select
                id="reader-residence"
                value={residence}
                onChange={(e) => setResidence(e.target.value as Residence)}
                className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
              >
                {RESIDENCES.map((r) => (
                  <option key={r} value={r}>
                    {RESIDENCE_LABELS[r][locale]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reader-gross" className="mb-1.5 block text-sm font-medium text-ink">
                {t.fields.gross}
              </label>
              <input
                id="reader-gross"
                type="text"
                inputMode="decimal"
                value={grossStr}
                onChange={(e) => setGrossStr(e.target.value)}
                aria-describedby="reader-gross-hint"
                className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-[15px] text-ink"
              />
              <p id="reader-gross-hint" className="mt-1.5 text-xs text-mine">
                {t.fields.amountHint(currency)}
              </p>
            </div>
            <div>
              <label
                htmlFor="reader-withheld"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                {t.fields.withheld}
              </label>
              <input
                id="reader-withheld"
                type="text"
                inputMode="decimal"
                value={withheldStr}
                onChange={(e) => setWithheldStr(e.target.value)}
                className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-[15px] text-ink"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* --------------------------------------------------------- warnings */}
      {parse?.flags.multipleIsins && (
        <Card className="border-gold/40 bg-tint-gold p-4 sm:p-5">
          <p className="text-[15px] leading-relaxed text-ink">{t.warnings.multipleIsins}</p>
        </Card>
      )}
      {parse?.flags.etf && (
        <Card className="border-debit/30 bg-tint-red p-5 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-debit">{t.warnings.etfTitle}</h3>
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink">
            {t.warnings.etfBody}
          </p>
        </Card>
      )}
      {parse?.uncoveredIsinPrefix !== null && parse?.uncoveredIsinPrefix !== undefined && (
        <Card className="p-4 sm:p-5">
          <p className="text-[15px] leading-relaxed text-mine">
            {t.warnings.uncovered(parse.uncoveredIsinPrefix)}
          </p>
        </Card>
      )}
      {parse?.flags.adr && (
        <Card className="p-4 sm:p-5">
          <p className="text-[15px] leading-relaxed text-mine">{t.warnings.adr}</p>
        </Card>
      )}

      {/* --------------------------------------------------- missing fields */}
      {missing.length > 0 && (
        <Card className="p-5 sm:p-6">
          <p className="text-[15px] font-medium text-ink">{t.missing.title}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-mine">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* ---------------------------------------------------------- result */}
      {diagnosis !== null && statusCopy !== null && country !== undefined && (
        <>
          <Card className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                <span aria-hidden="true">{country.flag}</span> {country.name[locale]}
              </p>
              <span
                key={`${countryId}-${diagnosis.status}-${grossStr}-${withheldStr}`}
                className="animate-stamp inline-flex"
              >
                <Badge tone={BADGE_TONE[diagnosis.status]}>{statusCopy.badge}</Badge>
              </span>
            </div>
            <p
              className={`mt-3 font-mono text-3xl font-medium sm:text-4xl ${
                diagnosis.recoverable > 0.005 || diagnosis.status === "aboveStatutory"
                  ? "text-debit"
                  : "text-ink"
              }`}
            >
              {pct(diagnosis.effectiveRate)}
            </p>
            <p className="mt-1 font-mono text-[13px] text-mine">
              {t.rateLine({ treaty: pct(diagnosis.treatyRate), statutory: pct(diagnosis.statutoryRate) })}
            </p>
            <h3 className="mt-5 font-display text-xl font-semibold text-ink">{statusCopy.title}</h3>
            <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-mine">
              {statusCopy.body({
                eff: pct(diagnosis.effectiveRate),
                treaty: pct(diagnosis.treatyRate),
                statutory: pct(diagnosis.statutoryRate),
              })}
            </p>
            {countryNote !== undefined && (
              <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink">
                {countryNote}
              </p>
            )}
            {diagnosis.excessBeyondStatutory > 0.005 && (
              <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-mine">
                {t.excessNote(fc(diagnosis.excessBeyondStatutory))}
              </p>
            )}
            <p className="mt-4 text-[13px] leading-relaxed text-mine">{t.disclaimer}</p>
          </Card>

          {showLedger && gross !== null && withheld !== null && (
            <LedgerEntry
              withheldLabel={t.ledger.withheld(pct(diagnosis.effectiveRate))}
              withheldAmount={fc(-Math.min(withheld, gross * diagnosis.statutoryRate))}
              owedLabel={t.ledger.owed(pct(diagnosis.treatyRate))}
              owedAmount={fc(-gross * diagnosis.treatyRate)}
              treatyRef={t.ledger.treatyRef(country.name[locale], RESIDENCE_LABELS[residence][locale])}
              recoverLabel={t.ledger.recover}
              recoverAmount={fc(diagnosis.recoverable)}
              footnote={`${t.ledger.footnote} ${common.labels.illustrative}`}
            />
          )}

          {smallClaim && (
            <Card className="border-gold/40 bg-tint-gold p-4 sm:p-5">
              <p className="max-w-[70ch] text-[15px] leading-relaxed text-ink">
                {t.smallClaim(formatCurrency(SMALL_CLAIM_ADVICE_THRESHOLD, locale))}
              </p>
            </Card>
          )}

          <Card className="flex flex-col items-start gap-3 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              {diagnosis.recoverable > 0.005 ? (
                <>
                  <ButtonLink href={`${href(locale, "simulator")}?country=${country.id}`}>
                    {t.ctas.simulate}
                  </ButtonLink>
                  {country.id === "US" && (
                    <ButtonLink variant="ghost" href={href(locale, "w8benChecker")}>
                      {t.ctas.checker}
                    </ButtonLink>
                  )}
                  <ButtonLink variant="ghost" href={href(locale, "solCalculator")}>
                    {t.ctas.deadlines}
                  </ButtonLink>
                </>
              ) : (
                <ButtonLink variant="ghost" href={href(locale, "simulator")}>
                  {common.cta.simulate}
                </ButtonLink>
              )}
            </div>
            <TrustLine text={common.trustLine} />
          </Card>
        </>
      )}
    </div>
  );
}
