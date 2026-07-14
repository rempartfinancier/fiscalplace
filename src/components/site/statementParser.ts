import {
  COUNTRIES,
  getCountryById,
  treatyRateFor,
  type CountryTaxProfile,
  type Residence,
} from "@/data/countries";

/**
 * STATEMENT PARSER — pure, locale-agnostic engine behind the statement-reader
 * tool. Everything runs in the browser: no text ever leaves the page.
 *
 * Two stages, deliberately separated so each is testable on its own:
 *  1. parseStatement(text)  — best-effort extraction of country / currency /
 *     gross / withheld / net from a pasted brokerage-statement excerpt. The UI
 *     always exposes the extracted fields for manual correction: parsing is
 *     assistance, never a gate.
 *  2. diagnose(...)         — compares the effective withholding rate against
 *     the statutory and treaty rates from @/data/countries and classifies the
 *     line. Pure arithmetic on the single source of truth.
 */

/* ------------------------------------------------------------------ types */

export type CountryEvidence = "isin" | "name" | "currency";
export type AmountEvidence = "label" | "reconciled" | "ratio" | "percent" | "net-label";

export interface ParseResult {
  countryId: string | null;
  countryEvidence: CountryEvidence | null;
  /** ISIN prefix seen but outside the covered panel (e.g. LU fund). */
  uncoveredIsinPrefix: string | null;
  currency: string | null;
  gross: number | null;
  withheld: number | null;
  net: number | null;
  grossEvidence: AmountEvidence | null;
  withheldEvidence: AmountEvidence | null;
  /** Withholding-plausible percentage literally present in the text (0–1). */
  percentInText: number | null;
  flags: {
    etf: boolean;
    adr: boolean;
    multipleIsins: boolean;
  };
}

export type DiagnosisStatus =
  | "treatyOk" // effective rate ≈ treaty rate: nothing to recover
  | "fullStatutory" // withheld at the full default rate: the classic over-withholding
  | "between" // between treaty and statutory: partial over-withholding
  | "aboveStatutory" // more than the statutory rate: fees mixed in, or a special regime
  | "belowTreaty" // less than the treaty rate: special regime, nothing to recover
  | "zeroWithheld" // nothing withheld in a country that normally withholds
  | "zeroCountry"; // country withholds nothing on ordinary dividends (UK)

export interface Diagnosis {
  status: DiagnosisStatus;
  effectiveRate: number;
  statutoryRate: number;
  treatyRate: number;
  /** Estimated recoverable over-withholding, capped at the statutory layer. */
  recoverable: number;
  /** Portion withheld beyond the statutory rate (likely fees), 0 if none. */
  excessBeyondStatutory: number;
}

/* ------------------------------------------------------- text normalisation */

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Matches an ISIN anywhere in text; group 1 is the 2-letter country prefix. */
const ISIN_RE = /\b([A-Z]{2})[A-Z0-9]{9}\d\b/g;

/* --------------------------------------------------------------- countries */

/** ISIN prefixes that identify a covered source country directly. */
const PANEL_IDS = new Set(COUNTRIES.map((c) => c.id));

/** Free-text aliases per country (normalised, lowercase). */
const NAME_ALIASES: Record<string, string[]> = {
  US: ["etats-unis", "united states", "usa", "amerique", "americain"],
  CH: ["suisse", "switzerland", "schweiz", "svizzera"],
  DE: ["allemagne", "germany", "deutschland"],
  GB: ["royaume-uni", "united kingdom", "grande-bretagne", "angleterre"],
  NL: ["pays-bas", "netherlands", "nederland", "hollande"],
  CA: ["canada"],
  JP: ["japon", "japan"],
  AU: ["australie", "australia"],
  IE: ["irlande", "ireland"],
  AT: ["autriche", "austria", "osterreich"],
  SE: ["suede", "sweden", "sverige"],
  IT: ["italie", "italy", "italia"],
  ES: ["espagne", "spain", "espana"],
  BE: ["belgique", "belgium", "belgie"],
  DK: ["danemark", "denmark", "danmark"],
  NO: ["norvege", "norway", "norge"],
  FI: ["finlande", "finland", "suomi"],
  PT: ["portugal"],
  FR: ["france"],
};

/** Currencies that identify a single panel country. */
const CURRENCY_COUNTRY: Record<string, string> = {
  CHF: "CH",
  SEK: "SE",
  NOK: "NO",
  DKK: "DK",
  JPY: "JP",
  CAD: "CA",
  AUD: "AU",
};

const CURRENCY_CODES = [
  "USD",
  "EUR",
  "CHF",
  "GBP",
  "SEK",
  "NOK",
  "DKK",
  "CAD",
  "AUD",
  "JPY",
  "GBX",
];

/* ----------------------------------------------------------------- amounts */

interface AmountToken {
  value: number;
  index: number;
  /** Normalised text window preceding the amount (labels live here). */
  before: string;
  negative: boolean;
}

/**
 * Monetary amounts: thousands groups with a consistent separator, optional
 * 1–2 decimals. Rejects years/dates ("2026", "15/05/2026") via boundaries.
 */
const AMOUNT_RE =
  /(?<![\d.,])[-−–]?\s?\d{1,3}(?:([   .,'])\d{3})*(?:[.,]\d{1,2})?(?!\d)(?!\s?%)/g;

const PER_SHARE_RE = /(per\s+share|par\s+action|per\s+unit|\/\s?action|je\s+aktie|p\/share)/;

function parseAmountString(raw: string): { value: number; negative: boolean } | null {
  const negative = /[-−–]/.test(raw);
  let s = raw.replace(/[-−–\s  ']/g, "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) {
    // French style: dots are thousands, last comma is the decimal mark.
    s = s.replace(/\./g, "");
    s = s.slice(0, lastComma).replace(/,/g, "") + "." + s.slice(lastComma + 1);
  } else if (lastDot > lastComma) {
    s = s.replace(/,/g, "");
  }
  const value = Number.parseFloat(s);
  if (!Number.isFinite(value)) return null;
  return { value: Math.abs(value), negative };
}

function extractAmounts(text: string): AmountToken[] {
  const tokens: AmountToken[] = [];
  const norm = normalize(text);
  for (const match of text.matchAll(AMOUNT_RE)) {
    const raw = match[0];
    const index = match.index ?? 0;
    const parsed = parseAmountString(raw);
    if (parsed === null) continue;
    // A decimal part or an adjacent currency token is required: this is what
    // separates money from quantities, dates and reference numbers.
    const hasDecimals = /[.,]\d{1,2}$/.test(raw.trim());
    const after = text.slice(index + raw.length, index + raw.length + 6);
    const beforeRaw = text.slice(Math.max(0, index - 6), index);
    const nearCurrency =
      new RegExp(`^\\s?(${CURRENCY_CODES.join("|")})\\b`, "i").test(after.trim()) ||
      /[€$£¥]\s?$/.test(beforeRaw) ||
      /^\s?[€$£¥]/.test(after);
    if (!hasDecimals && !nearCurrency) continue;
    const before = norm.slice(Math.max(0, index - 48), index);
    // Per-share unit amounts describe the coupon, not the line totals. Only
    // the immediate neighbourhood counts: a "per share" further away in the
    // same line must not disqualify the line's totals.
    const beforeNear = norm.slice(Math.max(0, index - 18), index);
    const afterNear = norm.slice(index + raw.length, index + raw.length + 18);
    if (PER_SHARE_RE.test(beforeNear) || PER_SHARE_RE.test(afterNear)) continue;
    tokens.push({ value: parsed.value, index, before, negative: parsed.negative });
  }
  return tokens;
}

/* ------------------------------------------------------------ label windows */

const TAX_WORDS = /(retenue|impot|imp\.|withhold|quellensteuer|kildeskat|kupongskatt|prelev|a la source|source|\btax\b|\bwht\b)/;
const GROSS_WORDS = /(brut|gross|montant du coupon|dividende de|coupon de)/;
const NET_WORDS = /\bnet\b/;

function approxEqual(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol;
}

/* ------------------------------------------------------------------- parse */

export function parseStatement(text: string): ParseResult {
  const result: ParseResult = {
    countryId: null,
    countryEvidence: null,
    uncoveredIsinPrefix: null,
    currency: null,
    gross: null,
    withheld: null,
    net: null,
    grossEvidence: null,
    withheldEvidence: null,
    percentInText: null,
    flags: { etf: false, adr: false, multipleIsins: false },
  };
  if (text.trim().length < 3) return result;
  const norm = normalize(text);

  /* Flags -------------------------------------------------------------- */
  result.flags.etf = /\b(etf|ucits|sicav|fcp|tracker)\b/.test(norm);
  result.flags.adr = /\badr\b/.test(norm);

  /* Country: ISIN first (the strongest evidence brokers all print) ------ */
  const isinPrefixes = new Set<string>();
  for (const m of text.toUpperCase().matchAll(ISIN_RE)) {
    isinPrefixes.add(m[1]);
  }
  const covered = [...isinPrefixes].filter((p) => PANEL_IDS.has(p));
  const uncovered = [...isinPrefixes].filter((p) => !PANEL_IDS.has(p));
  if (isinPrefixes.size > 1) result.flags.multipleIsins = true;
  if (covered.length > 0) {
    result.countryId = covered[0];
    result.countryEvidence = "isin";
  } else if (uncovered.length > 0) {
    result.uncoveredIsinPrefix = uncovered[0];
  }

  /* Country by name, then by unambiguous currency ----------------------- */
  if (result.countryId === null) {
    outer: for (const country of COUNTRIES) {
      const candidates = [
        normalize(country.name.fr),
        normalize(country.name.en),
        ...(NAME_ALIASES[country.id] ?? []),
      ];
      for (const candidate of candidates) {
        if (norm.includes(candidate)) {
          result.countryId = country.id;
          result.countryEvidence = "name";
          break outer;
        }
      }
    }
  }

  /* Currency ------------------------------------------------------------ */
  for (const code of CURRENCY_CODES) {
    if (new RegExp(`\\b${code}\\b`, "i").test(text)) {
      result.currency = code === "GBX" ? "GBP" : code;
      break;
    }
  }
  if (result.currency === null) {
    if (text.includes("€")) result.currency = "EUR";
    else if (/US\$|\$/.test(text)) result.currency = "USD";
    else if (text.includes("£")) result.currency = "GBP";
    else if (text.includes("¥")) result.currency = "JPY";
  }
  if (result.countryId === null && result.currency !== null) {
    const byCurrency = CURRENCY_COUNTRY[result.currency];
    if (byCurrency !== undefined) {
      result.countryId = byCurrency;
      result.countryEvidence = "currency";
    }
  }

  /* Percentage present in the text (5–45% is withholding territory) ----- */
  for (const m of text.matchAll(/(\d{1,2}(?:[.,]\d{1,3})?)\s?%/g)) {
    const pct = Number.parseFloat(m[1].replace(",", ".")) / 100;
    if (pct >= 0.05 && pct <= 0.45) {
      result.percentInText = pct;
      break;
    }
  }

  /* Amounts -------------------------------------------------------------- */
  const tokens = extractAmounts(text);
  // Deduplicate repeated identical values (brokers repeat the gross line).
  const unique: AmountToken[] = [];
  for (const token of tokens) {
    if (!unique.some((u) => approxEqual(u.value, token.value, 0.005))) unique.push(token);
  }

  const labelled = {
    gross: unique.filter((t) => GROSS_WORDS.test(t.before)),
    tax: unique.filter((t) => TAX_WORDS.test(t.before)),
    net: unique.filter((t) => NET_WORDS.test(t.before) && !GROSS_WORDS.test(t.before)),
  };

  let gross: number | null = null;
  let withheld: number | null = null;
  let net: number | null = null;

  if (labelled.gross.length > 0) {
    gross = Math.max(...labelled.gross.map((t) => t.value));
    result.grossEvidence = "label";
  }
  if (labelled.tax.length > 0) {
    // Among tax-labelled amounts prefer one at a plausible rate of the gross.
    const sorted = [...labelled.tax].sort((a, b) => b.value - a.value);
    const plausible =
      gross !== null
        ? sorted.find((t) => t.value / (gross as number) > 0.03 && t.value / (gross as number) <= 0.5)
        : undefined;
    withheld = (plausible ?? sorted[0]).value;
    result.withheldEvidence = "label";
  }
  if (labelled.net.length > 0) {
    net = Math.max(...labelled.net.map((t) => t.value));
  }

  /* Reconciliation: gross ≈ net + tax fills any missing member ----------- */
  const values = unique.map((t) => t.value).sort((a, b) => b - a);
  if (gross === null || withheld === null) {
    outer: for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values.length; j++) {
        for (let k = j + 1; k < values.length; k++) {
          if (i === j || i === k) continue;
          const tol = Math.max(0.03, values[i] * 0.002);
          if (approxEqual(values[i], values[j] + values[k], tol)) {
            const [big, small] = values[j] >= values[k] ? [values[j], values[k]] : [values[k], values[j]];
            if (gross === null) {
              gross = values[i];
              result.grossEvidence = "reconciled";
            }
            if (approxEqual(values[i], gross, 0.01) && withheld === null) {
              withheld = small;
              net = big;
              result.withheldEvidence = "reconciled";
            }
            break outer;
          }
        }
      }
    }
  }

  /* Pair heuristics when reconciliation found nothing --------------------- */
  if (gross !== null && withheld === null) {
    if (net !== null && net < gross) {
      withheld = gross - net;
      result.withheldEvidence = "net-label";
    } else {
      const candidate = unique
        .map((t) => t.value)
        .filter((v) => !approxEqual(v, gross as number, 0.005))
        .find((v) => {
          const r = v / (gross as number);
          return r > 0.03 && r <= 0.5;
        });
      if (candidate !== undefined) {
        withheld = candidate;
        result.withheldEvidence = "ratio";
      } else {
        const netCandidate = unique
          .map((t) => t.value)
          .filter((v) => !approxEqual(v, gross as number, 0.005))
          .find((v) => {
            const r = v / (gross as number);
            return r > 0.5 && r < 0.995;
          });
        if (netCandidate !== undefined) {
          net = netCandidate;
          withheld = gross - netCandidate;
          result.withheldEvidence = "ratio";
        }
      }
    }
  }
  if (gross === null && withheld !== null) {
    // A labelled withholding without a labelled gross: the gross is the
    // largest amount that puts the withholding at a plausible rate.
    const candidate = values.find((v) => {
      const r = (withheld as number) / v;
      return r > 0.03 && r <= 0.5;
    });
    if (candidate !== undefined) {
      gross = candidate;
      result.grossEvidence = "ratio";
    }
  }
  if (gross === null && withheld === null && values.length >= 2) {
    const [big, small] = [values[0], values[values.length - 1]];
    const r = small / big;
    if (r <= 0.45) {
      gross = big;
      withheld = small;
      result.grossEvidence = "ratio";
      result.withheldEvidence = "ratio";
    } else if (r >= 0.55 && r < 0.995) {
      gross = big;
      net = small;
      withheld = big - small;
      result.grossEvidence = "ratio";
      result.withheldEvidence = "ratio";
    }
  }
  if (gross === null && values.length === 1 && result.percentInText !== null) {
    gross = values[0];
    result.grossEvidence = "ratio";
  }

  /* Percent in text can supply the withholding when amounts are missing --- */
  if (gross !== null && withheld === null && result.percentInText !== null) {
    withheld = gross * result.percentInText;
    result.withheldEvidence = "percent";
  }

  /* Sanity -------------------------------------------------------------- */
  if (gross !== null && withheld !== null && withheld >= gross) {
    if (net === null) {
      // Likely mislabelled: the bigger figure is the gross.
      const swap = withheld;
      withheld = gross;
      gross = swap;
    } else {
      withheld = null;
      result.withheldEvidence = null;
    }
  }

  result.gross = gross !== null ? Math.round(gross * 100) / 100 : null;
  result.withheld = withheld !== null ? Math.round(withheld * 100) / 100 : null;
  result.net = net !== null ? Math.round(net * 100) / 100 : null;
  return result;
}

/* ---------------------------------------------------------------- diagnose */

/** Absolute tolerance on the effective rate: absorbs cent rounding. */
const RATE_TOL = 0.012;

export function diagnose(
  country: CountryTaxProfile,
  residence: Residence,
  gross: number,
  withheld: number,
): Diagnosis | null {
  if (!Number.isFinite(gross) || !Number.isFinite(withheld) || gross <= 0 || withheld < 0) {
    return null;
  }
  const effectiveRate = withheld / gross;
  const statutoryRate = country.statutoryRate;
  const treatyRate = treatyRateFor(country, residence);
  const recoverable = Math.max(0, Math.min(withheld, gross * statutoryRate) - gross * treatyRate);
  const excessBeyondStatutory = Math.max(0, withheld - gross * statutoryRate);

  let status: DiagnosisStatus;
  if (statutoryRate === 0) {
    status = effectiveRate <= RATE_TOL ? "zeroCountry" : "aboveStatutory";
  } else if (effectiveRate <= 0.005) {
    status = "zeroWithheld";
  } else if (Math.abs(effectiveRate - treatyRate) <= RATE_TOL) {
    status = "treatyOk";
  } else if (effectiveRate > statutoryRate + RATE_TOL) {
    status = "aboveStatutory";
  } else if (effectiveRate >= statutoryRate - RATE_TOL) {
    status = "fullStatutory";
  } else if (effectiveRate > treatyRate) {
    status = "between";
  } else {
    status = "belowTreaty";
  }

  return { status, effectiveRate, statutoryRate, treatyRate, recoverable, excessBeyondStatutory };
}

/** Convenience wrapper for the UI: resolves the country id first. */
export function diagnoseById(
  countryId: string,
  residence: Residence,
  gross: number,
  withheld: number,
): Diagnosis | null {
  const country = getCountryById(countryId);
  if (country === undefined) return null;
  return diagnose(country, residence, gross, withheld);
}

/* -------------------------------------------------------------- documents */

export interface StatementLine {
  /** Raw text window this record was extracted from — shown for transparency. */
  sourceText: string;
  parsed: ParseResult;
}

/** Lines of context kept before/after an ISIN when carving out its block. */
const LINES_BEFORE = 2;
const LINES_AFTER = 4;

/** A same-ISIN hit within this many lines of the previous one may complete the same entry. */
const SAME_ISIN_MERGE_GAP = 2;

function isComplete(p: ParseResult): boolean {
  return p.countryId !== null && p.gross !== null && p.withheld !== null;
}

/**
 * Full-document extraction: a real statement (CSV export, PDF text dump,
 * annual tax report) lists many dividends, not one. Every ISIN occurrence in
 * the text is a candidate anchor, resolved with a "solo first, merge only if
 * needed" strategy:
 *  1. Try the ISIN's own small window alone, run through the same
 *     single-block `parseStatement()` used for manual paste. A self-
 *     contained CSV/table row (ISIN + amounts all on one line) resolves
 *     right here — this is the common case, and it is what keeps ten
 *     dividends on the same stock as ten separate rows instead of one.
 *  2. Only if that window alone is incomplete (e.g. the amount and the tax
 *     sit on two separate lines, as IBKR-style exports do, with the ISIN
 *     repeated on both) AND the very next ISIN hit is the identical ISIN
 *     close by, merge the two into one window and retry. This is what
 *     completes a split entry without merging unrelated repeats of the same
 *     stock far apart in the document.
 * Either way, blocks are clipped at neighbouring hits so entries never
 * bleed into each other.
 */
export function parseMultipleStatements(text: string): StatementLine[] {
  const lines = text.split("\n");
  if (lines.length === 0) return [];

  let offset = 0;
  const lineStartOffsets = lines.map((line) => {
    const start = offset;
    offset += line.length + 1;
    return start;
  });

  function lineIndexForOffset(charIndex: number): number {
    let lo = 0;
    let hi = lineStartOffsets.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (lineStartOffsets[mid] <= charIndex) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  const hits: { isin: string; line: number }[] = [];
  for (const m of text.toUpperCase().matchAll(ISIN_RE)) {
    hits.push({ isin: m[0], line: lineIndexForOffset(m.index ?? 0) });
  }
  if (hits.length === 0) return [];

  function windowText(firstLine: number, lastLine: number, prevBoundary: number, nextBoundary: number): string {
    const start = Math.max(0, firstLine - LINES_BEFORE, prevBoundary + 1);
    const end = Math.min(lines.length, lastLine + LINES_AFTER + 1, nextBoundary);
    return lines.slice(start, end).join("\n");
  }

  const results: StatementLine[] = [];
  let i = 0;
  while (i < hits.length) {
    const hit = hits[i];
    const prevBoundary = i > 0 ? hits[i - 1].line : -1;
    const nextHitLine = i < hits.length - 1 ? hits[i + 1].line : lines.length;

    const soloText = windowText(hit.line, hit.line, prevBoundary, nextHitLine);
    const soloParsed = parseStatement(soloText);
    if (isComplete(soloParsed)) {
      results.push({ sourceText: soloText, parsed: soloParsed });
      i += 1;
      continue;
    }

    const next = hits[i + 1];
    if (next && next.isin === hit.isin && next.line - hit.line <= SAME_ISIN_MERGE_GAP) {
      const afterNextBoundary = i + 2 < hits.length ? hits[i + 2].line : lines.length;
      const mergedText = windowText(hit.line, next.line, prevBoundary, afterNextBoundary);
      const mergedParsed = parseStatement(mergedText);
      if (isComplete(mergedParsed)) {
        results.push({ sourceText: mergedText, parsed: mergedParsed });
      }
      i += 2;
      continue;
    }

    // Nothing diagnosable for this hit alone or merged with its neighbour —
    // header rows, dates-only lines, a reference to an unrelated ISIN.
    i += 1;
  }
  return results;
}
