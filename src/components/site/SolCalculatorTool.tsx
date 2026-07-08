"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { COUNTRIES, solDeadline, type CountryTaxProfile, type SolRule } from "@/data/countries";
import { ARTICLES } from "@/data/articles";
import { PRICING } from "@/config/pricing";
import { formatCurrency, formatDate, type Locale, type Localized } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { Badge, ButtonLink, Card, TrustLine } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ dates */

type Urgency = "comfortable" | "thisYear" | "urgent" | "expired";

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

function urgencyFor(daysLeft: number, monthsLeft: number): Urgency {
  if (daysLeft < 0) return "expired";
  if (monthsLeft < 6) return "urgent";
  if (monthsLeft < 12) return "thisYear";
  return "comfortable";
}

const URGENCY_TONE: Record<Urgency, "green" | "gold" | "red"> = {
  comfortable: "green",
  thisYear: "gold",
  urgent: "red",
  expired: "red",
};

function formatInt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB").format(n);
}

interface RowResult {
  country: CountryTaxProfile;
  deadlineIso: string;
  daysLeft: number;
  monthsLeft: number;
  urgency: Urgency;
}

/* ------------------------------------------------------------------- copy */

interface ToolCopy {
  loading: string;
  form: {
    legend: string;
    countryLabel: string;
    dateLabel: string;
    dateHint: string;
    futureDate: string;
  };
  result: {
    srTitle: string;
    deadlineLabel: string;
    remainingBefore: string;
    remainingAfterDays: (n: number) => string;
    monthsWord: (n: number) => string;
    expiredBefore: string;
    expiredAfter: (n: number) => string;
    disclaimer: string;
  };
  bar: {
    elapsed: string;
    remaining: string;
    aria: (pctElapsed: number) => string;
  };
  note: {
    verifyBadge: string;
    ruleExplained: Record<SolRule, (years: number) => string>;
  };
  badges: Record<Urgency, string>;
  badgesShort: Record<Urgency, string>;
  table: {
    title: (n: number) => string;
    ledeBefore: string;
    colCountry: string;
    colRule: string;
    colDeadline: string;
    colRemaining: string;
    colStatus: string;
    yearsUnit: string;
    daysShort: string;
    expiredShort: string;
    ruleShort: Record<SolRule, string>;
    verifyFootnote: string;
  };
  priority: {
    title: string;
    bodyBefore: string;
    bodyAfter: string;
    cta: string;
  };
  expired: {
    title: string;
    body: string;
    articleLink: string;
  };
  stillTime: string;
}

const copy: Localized<ToolCopy> = {
  fr: {
    loading: "Chargement du calculateur…",
    form: {
      legend: "Votre dividende",
      countryLabel: "Pays source du dividende",
      dateLabel: "Date de versement du dividende",
      dateHint: "La date exacte figure sur votre relevé de courtage, ligne par ligne.",
      futureDate:
        "La date de versement doit être passée : le compteur de prescription ne démarre qu'au versement.",
    },
    result: {
      srTitle: "Résultat : votre date limite de dépôt",
      deadlineLabel: "Date limite de dépôt",
      remainingBefore: "Il vous reste",
      remainingAfterDays: (n) =>
        n === 1 ? "jour pour déposer la demande" : "jours pour déposer la demande",
      monthsWord: () => "mois",
      expiredBefore: "Dépassé depuis",
      expiredAfter: (n) => (n === 1 ? "jour" : "jours"),
      disclaimer:
        "Règle simplifiée, à titre indicatif. Avant tout dépôt, nous recalculons la date exacte de votre dossier — et si elle est déjà passée, nous vous le disons au lieu de déposer.",
    },
    bar: {
      elapsed: "Temps écoulé",
      remaining: "Fenêtre restante",
      aria: (pct) => `${pct} % de la fenêtre de réclamation déjà écoulés`,
    },
    note: {
      verifyBadge: "Donnée à confirmer",
      ruleExplained: {
        "calendar-year-end": (years) =>
          `Décompte « fin d'année civile » : le compteur de ${years} ans ne démarre qu'au 31 décembre de l'année du versement. Un dividende de janvier et un dividende de décembre de la même année expirent donc le même jour.`,
        anniversary: (years) =>
          `Décompte « date anniversaire » : ${years} ans jour pour jour à compter du versement. Chaque ligne de dividende a sa propre date limite.`,
      },
    },
    badges: {
      comfortable: "Marge confortable",
      thisYear: "À déposer cette année",
      urgent: "Urgent — < 6 mois",
      expired: "Prescrit — recours impossible",
    },
    badgesShort: {
      comfortable: "Marge",
      thisYear: "Cette année",
      urgent: "Urgent",
      expired: "Prescrit",
    },
    table: {
      title: (n) => `La même date, dans les ${n} pays couverts`,
      ledeBefore: "Date limite de dépôt pour un dividende versé le",
      colCountry: "Pays",
      colRule: "Délai · règle",
      colDeadline: "Date limite",
      colRemaining: "Restant",
      colStatus: "Statut",
      yearsUnit: "ans",
      daysShort: "j",
      expiredShort: "prescrit",
      ruleShort: {
        "calendar-year-end": "fin d'année civile",
        anniversary: "date anniversaire",
      },
      verifyFootnote:
        "Donnée à confirmer selon votre situation — vérifiée dossier par dossier avant tout dépôt.",
    },
    priority: {
      title: "Fenêtre courte : traitement prioritaire",
      bodyBefore:
        "Votre date limite tombe dans moins de 6 mois. Le traitement prioritaire place votre dossier en tête de file : forfait de ",
      bodyAfter:
        " par dossier proche de la prescription, en plus de la commission au succès. Si notre vérification conclut que la date exacte est déjà dépassée, nous vous le disons avant d'engager la moindre démarche.",
      cta: "Ouvrir mon dossier en priorité",
    },
    expired: {
      title: "Prescrit : ce trop-perçu est perdu",
      body: "Passé la date limite, l'administration n'instruit plus la demande. L'argent retenu en trop est définitivement perdu — personne ne peut le récupérer, pas même nous, et méfiez-vous de quiconque vous promet le contraire. La bonne nouvelle, s'il y en a une : vos dividendes plus récents ont peut-être encore une fenêtre ouverte.",
      articleLink: "Lire : que faire quand un délai est dépassé ?",
    },
    stillTime:
      "Encore dans les temps. Prochaine étape : chiffrer ce que ce dividende peut vous rendre.",
  },
  en: {
    loading: "Loading the calculator…",
    form: {
      legend: "Your dividend",
      countryLabel: "Source country of the dividend",
      dateLabel: "Dividend payment date",
      dateHint: "The exact date is on your brokerage statement, line by line.",
      futureDate:
        "The payment date must be in the past: the limitation clock only starts at payment.",
    },
    result: {
      srTitle: "Result: your filing deadline",
      deadlineLabel: "Filing deadline",
      remainingBefore: "You have",
      remainingAfterDays: (n) => (n === 1 ? "day left to file the claim" : "days left to file the claim"),
      monthsWord: (n) => (n === 1 ? "month" : "months"),
      expiredBefore: "The deadline passed",
      expiredAfter: (n) => (n === 1 ? "day ago" : "days ago"),
      disclaimer:
        "Simplified rule, for guidance only. Before any filing we recompute your claim's exact deadline — and if it has already passed, we tell you instead of filing.",
    },
    bar: {
      elapsed: "Time elapsed",
      remaining: "Window left",
      aria: (pct) => `${pct}% of the claim window already elapsed`,
    },
    note: {
      verifyBadge: "To be confirmed",
      ruleExplained: {
        "calendar-year-end": (years) =>
          `"Calendar year-end" counting: the ${years}-year clock only starts on 31 December of the payment year. A January dividend and a December dividend from the same year therefore expire on the same day.`,
        anniversary: (years) =>
          `"Anniversary" counting: ${years} years to the day from payment. Each dividend line has its own deadline.`,
      },
    },
    badges: {
      comfortable: "Comfortable margin",
      thisYear: "File this year",
      urgent: "Urgent — under 6 months",
      expired: "Time-barred — no recourse",
    },
    badgesShort: {
      comfortable: "Margin",
      thisYear: "This year",
      urgent: "Urgent",
      expired: "Expired",
    },
    table: {
      title: (n) => `The same date, across all ${n} covered countries`,
      ledeBefore: "Filing deadline for a dividend paid on",
      colCountry: "Country",
      colRule: "Period · rule",
      colDeadline: "Deadline",
      colRemaining: "Left",
      colStatus: "Status",
      yearsUnit: "yrs",
      daysShort: "d",
      expiredShort: "expired",
      ruleShort: {
        "calendar-year-end": "calendar year-end",
        anniversary: "anniversary",
      },
      verifyFootnote:
        "To be confirmed for your situation — verified claim by claim before any filing.",
    },
    priority: {
      title: "Short window: priority handling",
      bodyBefore:
        "Your deadline falls in under 6 months. Priority handling moves your claim to the front of the queue: a flat fee of ",
      bodyAfter:
        " per claim close to its limitation deadline, on top of the success fee. If our verification finds the exact date has already passed, we tell you before starting anything.",
      cta: "Start my claim as a priority",
    },
    expired: {
      title: "Time-barred: this refund is gone",
      body: "Once the deadline has passed, the administration no longer processes the claim. The over-withheld money is permanently lost — nobody can recover it, not even us, and be wary of anyone who promises otherwise. The good news, if any: your more recent dividends may still have an open window.",
      articleLink: "Read: what to do when a deadline has passed",
    },
    stillTime: "Still within the window. Next step: put a number on what this dividend can give back.",
  },
};

/* -------------------------------------------------------------- component */

export function SolCalculatorTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const router = useRouter();

  const [countryId, setCountryId] = useState("CH");
  const [paymentDate, setPaymentDate] = useState("");
  /** Set client-side only (new Date() must never run during SSR rendering of results). */
  const [todayIso, setTodayIso] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setTodayIso(toIsoDate(now));
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    setPaymentDate((prev) => (prev === "" ? toIsoDate(twoYearsAgo) : prev));
  }, []);

  const isFuture = todayIso !== null && ISO_DATE.test(paymentDate) && paymentDate > todayIso;

  const computed = useMemo(() => {
    if (todayIso === null || !ISO_DATE.test(paymentDate) || paymentDate > todayIso) return null;
    const today = new Date(todayIso + "T12:00:00");
    const payment = new Date(paymentDate + "T12:00:00");

    const rows: RowResult[] = COUNTRIES.map((country) => {
      const deadline = solDeadline(country, paymentDate);
      const daysLeft = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
      const monthsLeft = monthsBetween(today, deadline);
      return {
        country,
        deadlineIso: toIsoDate(deadline),
        daysLeft,
        monthsLeft,
        urgency: urgencyFor(daysLeft, monthsLeft),
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);

    const selected = rows.find((r) => r.country.id === countryId) ?? rows[0];
    const deadline = new Date(selected.deadlineIso + "T12:00:00");
    const total = deadline.getTime() - payment.getTime();
    const gone = today.getTime() - payment.getTime();
    const elapsedPct =
      total <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((gone / total) * 100)));

    return { rows, selected, elapsedPct };
  }, [todayIso, paymentDate, countryId]);

  const missedDeadlineArticle = ARTICLES.find((a) => a.id === "missed-deadline");
  const priorityFee = formatCurrency(PRICING.fixedServices.priorityHandling, locale);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ form */}
      <Card className="p-5 sm:p-6">
        <form onSubmit={(e) => e.preventDefault()} aria-label={t.form.legend}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sol-country" className="mb-1.5 block text-sm font-medium text-ink">
                {t.form.countryLabel}
              </label>
              <select
                id="sol-country"
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
              <label htmlFor="sol-date" className="mb-1.5 block text-sm font-medium text-ink">
                {t.form.dateLabel}
              </label>
              <input
                id="sol-date"
                type="date"
                value={paymentDate}
                min="1990-01-01"
                max={todayIso ?? undefined}
                onChange={(e) => setPaymentDate(e.target.value)}
                aria-invalid={isFuture || undefined}
                aria-describedby="sol-date-hint"
                className="w-full rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-[15px] text-ink"
              />
              <p id="sol-date-hint" className="mt-1.5 text-xs text-mine">
                {t.form.dateHint}
              </p>
              {isFuture && (
                <p role="alert" className="mt-1.5 text-sm text-debit">
                  {t.form.futureDate}
                </p>
              )}
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
                {t.result.deadlineLabel} ·{" "}
                <span aria-hidden="true">{computed.selected.country.flag}</span>{" "}
                {computed.selected.country.name[locale]}
              </p>
              <span
                key={`${computed.selected.country.id}-${paymentDate}`}
                className="animate-stamp inline-flex"
              >
                <Badge tone={URGENCY_TONE[computed.selected.urgency]}>
                  {t.badges[computed.selected.urgency]}
                </Badge>
              </span>
            </div>

            <p
              className={`mt-3 font-mono text-3xl font-medium sm:text-4xl ${
                computed.selected.urgency === "expired" ? "text-debit" : "text-ink"
              }`}
            >
              {formatDate(computed.selected.deadlineIso, locale)}
            </p>

            {computed.selected.urgency === "expired" ? (
              <p className="mt-2 text-[15px] text-debit">
                {t.result.expiredBefore}{" "}
                <span className="font-mono font-medium">
                  {formatInt(Math.abs(computed.selected.daysLeft), locale)}
                </span>{" "}
                {t.result.expiredAfter(Math.abs(computed.selected.daysLeft))}.
              </p>
            ) : (
              <p className="mt-2 text-[15px] text-mine">
                {t.result.remainingBefore}{" "}
                <span className="font-mono font-medium text-ink">
                  {formatInt(computed.selected.daysLeft, locale)}
                </span>{" "}
                {t.result.remainingAfterDays(computed.selected.daysLeft)}
                {computed.selected.monthsLeft >= 1 && (
                  <>
                    {" "}
                    (≈{" "}
                    <span className="font-mono text-ink">{computed.selected.monthsLeft}</span>{" "}
                    {t.result.monthsWord(computed.selected.monthsLeft)})
                  </>
                )}
                .
              </p>
            )}

            {/* elapsed / remaining window bar — grey solid vs gold hatching */}
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
                <span>{formatDate(paymentDate, locale)}</span>
                <span>{formatDate(computed.selected.deadlineIso, locale)}</span>
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

            {/* country-specific rule note */}
            <div className="mt-6 rounded-[6px] border border-rule bg-paper p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink">
                  <span aria-hidden="true">{computed.selected.country.flag}</span>{" "}
                  {computed.selected.country.name[locale]}
                </p>
                {computed.selected.country.sol.verify && (
                  <Badge tone="gold">{t.note.verifyBadge}</Badge>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mine">
                {computed.selected.country.sol.notes[locale]}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mine">
                {t.note.ruleExplained[computed.selected.country.sol.rule](
                  computed.selected.country.sol.years,
                )}
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-mine">
                {common.labels.lastReviewed}{" "}
                {formatDate(computed.selected.country.lastReviewed, locale)}
              </p>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-mine">{t.result.disclaimer}</p>
          </Card>

          {/* ------------------------------------- urgency-dependent action */}
          {computed.selected.urgency === "expired" && (
            <Card className="border-debit/30 bg-tint-red p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-debit">{t.expired.title}</h3>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink">
                {t.expired.body}
              </p>
              {missedDeadlineArticle && (
                <p className="mt-3 text-[15px]">
                  <Link
                    href={articleHref(locale, missedDeadlineArticle.slug[locale])}
                    className="font-medium text-brand underline underline-offset-4"
                  >
                    {t.expired.articleLink}
                  </Link>
                </p>
              )}
              <div className="mt-4 flex flex-col items-start gap-2">
                <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
                <TrustLine text={common.trustLine} />
              </div>
            </Card>
          )}

          {computed.selected.urgency === "urgent" && (
            <Card className="border-gold/40 bg-tint-gold p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.priority.title}</h3>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink">
                {t.priority.bodyBefore}
                <span className="font-mono font-medium">{priorityFee}</span>
                {t.priority.bodyAfter}
              </p>
              <div className="mt-4 flex flex-col items-start gap-2">
                <ButtonLink href={href(locale, "serviceRecovery")}>{t.priority.cta}</ButtonLink>
                <TrustLine text={common.trustLine} />
              </div>
            </Card>
          )}

          {(computed.selected.urgency === "comfortable" ||
            computed.selected.urgency === "thisYear") && (
            <Card className="flex flex-col items-start gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] text-mine">{t.stillTime}</p>
              <ButtonLink variant="ghost" href={href(locale, "simulator")} className="shrink-0">
                {common.cta.simulate}
              </ButtonLink>
            </Card>
          )}

          {/* --------------------------------------------- all-country table */}
          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-xl font-semibold text-ink">
              {t.table.title(COUNTRIES.length)}
            </h3>
            <p className="mt-1 text-sm text-mine">
              {t.table.ledeBefore}{" "}
              <span className="font-mono text-ink">{formatDate(paymentDate, locale)}</span>
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-rule font-mono text-[11px] uppercase tracking-wide text-mine">
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t.table.colCountry}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t.table.colRule}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t.table.colDeadline}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t.table.colRemaining}
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      {t.table.colStatus}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {computed.rows.map((row) => {
                    const c = row.country;
                    const target = countryHref(locale, c.slug[locale]);
                    const isSelected = c.id === computed.selected.country.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => router.push(target)}
                        className={`cursor-pointer border-b border-rule transition-colors last:border-b-0 hover:bg-paper ${
                          isSelected ? "bg-paper/60" : ""
                        }`}
                      >
                        <td className="py-2.5 pr-4">
                          <Link
                            href={target}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-ink hover:text-brand hover:underline underline-offset-4 ${
                              isSelected ? "font-semibold" : "font-medium"
                            }`}
                          >
                            <span aria-hidden="true">{c.flag}</span> {c.name[locale]}
                          </Link>
                          {c.sol.verify && (
                            <span className="text-gold-ink" aria-hidden="true">
                              {" "}
                              *
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-mine">
                          {c.sol.years} {t.table.yearsUnit} · {t.table.ruleShort[c.sol.rule]}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-ink">
                          {formatDate(row.deadlineIso, locale)}
                        </td>
                        <td
                          className={`py-2.5 pr-4 font-mono ${
                            row.daysLeft < 0 ? "text-debit" : "text-ink"
                          }`}
                        >
                          {row.daysLeft >= 0
                            ? `${formatInt(row.daysLeft, locale)} ${t.table.daysShort}`
                            : t.table.expiredShort}
                        </td>
                        <td className="py-2.5">
                          <Badge tone={URGENCY_TONE[row.urgency]}>
                            {t.badgesShort[row.urgency]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-mine">
              <span className="text-gold-ink" aria-hidden="true">
                *
              </span>{" "}
              {t.table.verifyFootnote}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
