import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref } from "@/lib/routes";
import { COUNTRIES, recoveryGap } from "@/data/countries";
import { PRICING, computeCommission } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * COST — reframes "how much does recovery cost" as "how much does inaction
 * cost", using the statute-of-limitations field already in @/data/countries
 * and the commission engine in @/config/pricing. No figure is restated by
 * hand; the worked example runs computeCommission() at module load.
 */

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

const yearsFr = (years: number) => `${years} an${years > 1 ? "s" : ""}`;
const yearsEn = (years: number) => `${years} year${years > 1 ? "s" : ""}`;

/** Countries ranked by shortest statute of limitations — the ones that expire first. */
const byUrgency = [...COUNTRIES].filter((c) => recoveryGap(c, "FR") > 0).sort((a, b) => a.sol.years - b.sol.years);
const shortest = byUrgency.slice(0, 5);

/* Worked example: 3,200 € recovered from a Swiss claim. */
const RECOVERED = 3_200;
const commission = computeCommission(RECOVERED);

const MISSED_DEADLINE_SLUG = {
  fr: "delai-de-prescription-depasse-que-faire",
  en: "missed-the-statute-of-limitations-what-now",
} as const;
const SOL_RANKING_SLUG = {
  fr: "classement-delais-prescription-par-pays",
  en: "statute-of-limitations-ranking-by-country",
} as const;
const COST_OF_RECOVERY_SLUG = {
  fr: "combien-coute-recuperation-withholding-tax",
  en: "cost-of-withholding-tax-recovery",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `On compare souvent le coût d'une récupération à zéro — comme si « ne rien faire » était une option neutre. Ce n'est pas le cas : chaque année, une partie de ce que vous auriez pu réclamer franchit sa date de prescription et disparaît définitivement. Le vrai calcul n'oppose pas « payer une commission » à « ne rien payer » : il oppose un trop-perçu qui s'éteint, silencieusement, à un trop-perçu récupéré moins une commission qui n'existe que sur ce qui est réellement encaissé.`,
  },
  { type: "h2", text: `Ce qui expire pendant que le dossier attend` },
  {
    type: "p",
    text: `Chaque pays de notre panel a son propre délai de prescription, et certains sont beaucoup plus courts qu'on ne l'imagine. Voici les cinq fenêtres les plus courtes parmi les pays où un écart existe réellement pour un résident de France :`,
  },
  {
    type: "table",
    caption: `Délais de prescription les plus courts du panel — données revues mi-2026, indicatives.`,
    headers: [`Pays`, `Délai pour agir`, `Écart récupérable`],
    rows: shortest.map((c) => [
      `${c.flag} ${c.name.fr}`,
      yearsFr(c.sol.years),
      `${pct(recoveryGap(c, "FR"), "fr")} du dividende brut`,
    ]),
  },
  {
    type: "p",
    text: `Deux ans, parfois trois : à cette échelle, « je m'en occuperai l'an prochain » revient souvent à renoncer purement et simplement à une ou deux années de dividendes déjà versés. Le détail complet, pays par pays, fait l'objet de [notre classement des délais de prescription](${articleHref("fr", SOL_RANKING_SLUG.fr)}).`,
  },
  { type: "h2", text: `Le calcul que « ne rien faire » élude` },
  {
    type: "p",
    text: `Prenons un exemple concret : ${eur(RECOVERED, "fr")} de trop-perçu identifié sur des dividendes suisses. Ne rien faire rapporte exactement ${eur(0, "fr")}. Engager la démarche, une fois la commission au succès appliquée sur le montant réellement recouvré, rapporte ceci :`,
  },
  {
    type: "table",
    caption: `Barème dégressif appliqué par tranche sur ${eur(RECOVERED, "fr")} récupérés — commission uniquement sur ce qui est effectivement recouvré.`,
    headers: [`Tranche`, `Taux`, `Commission sur la tranche`],
    rows: commission.breakdown.map((line) => [
      `${eur(line.from, "fr")} → ${eur(line.to, "fr")}`,
      pct(line.rate, "fr"),
      eur(line.fee, "fr"),
    ]),
  },
  {
    type: "ledger-example",
    withheldLabel: `Trop-perçu identifié`,
    withheldAmount: eur(RECOVERED, "fr"),
    owedLabel: `Commission au succès (barème dégressif)`,
    owedAmount: eur(commission.fee, "fr"),
    treatyRef: `Taux effectif : ${pct(commission.effectiveRate, "fr")}`,
    recoverLabel: `Net perçu si vous engagez la démarche`,
    recoverAmount: eur(commission.net, "fr"),
    footnote: `Contre ${eur(0, "fr")} de net perçu si le dossier n'est jamais déposé et que le délai de prescription s'écoule. Commission au succès uniquement : ${eur(PRICING.floorFee, "fr")} minimum par dossier abouti, jamais facturée si rien n'est récupéré, plafonnée à ${eur(PRICING.capFee, "fr")}.`,
  },
  {
    type: "p",
    text: `Ce n'est pas un argument marketing : c'est de l'arithmétique. Une commission prélevée uniquement sur un montant recouvré laisse toujours plus qu'un montant qui n'a jamais été réclamé. Le détail complet du barème — et les cas où faire soi-même reste préférable — se trouve dans [notre article sur le coût réel d'une récupération](${articleHref("fr", COST_OF_RECOVERY_SLUG.fr)}).`,
  },
  { type: "h2", text: `Pourquoi l'inaction coûte plus cher qu'elle n'en a l'air` },
  {
    type: "ul",
    items: [
      `**Le compteur ne se met pas en pause.** Un dividende versé aujourd'hui commence à courir vers sa date de prescription dès son versement, que vous ayez ou non commencé une démarche.`,
      `**L'historique s'accumule, mais ne se rattrape pas.** Attendre trois ans pour s'y mettre ne donne pas trois ans de trop-perçu à réclamer : les années les plus anciennes sont déjà prescrites, pays par pays, à des rythmes différents.`,
      `**Le coût de la préparation ne baisse pas avec le temps.** Rassembler des relevés de courtage vieux de plusieurs années est plus long et plus incertain que de traiter un dossier récent — sans que le montant récupérable augmente en proportion.`,
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `Et si le délai est déjà dépassé ?`,
    text: `Une fois la prescription atteinte dans le pays source, il n'existe en règle générale aucune voie de recours — [nous expliquons sans détour ce qui se passe alors](${articleHref("fr", MISSED_DEADLINE_SLUG.fr)}), plutôt que de laisser croire qu'une solution existe toujours.`,
  },
  { type: "h2", text: `Vos questions sur le coût de l'inaction` },
  {
    type: "faq",
    items: [
      {
        question: `Si mon montant est faible, vaut-il mieux ne rien faire ?`,
        answer: `Pas forcément « ne rien faire » — plutôt le faire vous-même. Sur un très petit montant et un seul pays, la commission minimale peut ne pas être la meilleure option : notre diagnostic gratuit le dit clairement quand c'est le cas, et [notre comparatif faire-soi-même](${articleHref("fr", COST_OF_RECOVERY_SLUG.fr)}) donne le seuil.`,
      },
      {
        question: `Le diagnostic initial coûte-t-il quelque chose ?`,
        answer: `Non : le diagnostic est gratuit, et c'est précisément lui qui vous dit si un dossier vaut la peine d'être engagé avant que vous n'ayez rien à perdre à vérifier.`,
      },
      {
        question: `Que se passe-t-il si le dossier n'aboutit pas ?`,
        answer: `Aucune commission n'est due : le principe « no win, no fee » s'applique intégralement. Le seul coût de l'inaction reste celui du trop-perçu qui, lui, continue de courir vers sa prescription pendant que vous hésitez.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculer ce que l'inaction me coûte`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Recovery cost is usually compared to zero — as if "doing nothing" were a neutral option. It isn't: every year, part of what you could have claimed crosses its statute-of-limitations date and disappears for good. The real comparison isn't "paying a commission" versus "paying nothing" — it's an over-withholding that quietly expires versus an over-withholding recovered, minus a commission that only exists on what is actually collected.`,
  },
  { type: "h2", text: `What expires while the file waits` },
  {
    type: "p",
    text: `Every country in our panel has its own statute of limitations, and some are far shorter than most investors assume. Here are the five shortest windows among countries with a genuine gap for a French resident:`,
  },
  {
    type: "table",
    caption: `Shortest statutes of limitations in the panel — data reviewed mid-2026, indicative.`,
    headers: [`Country`, `Time to act`, `Recoverable gap`],
    rows: shortest.map((c) => [
      `${c.flag} ${c.name.en}`,
      yearsEn(c.sol.years),
      `${pct(recoveryGap(c, "FR"), "en")} of the gross dividend`,
    ]),
  },
  {
    type: "p",
    text: `Two years, sometimes three: at that scale, "I'll deal with it next year" often means simply giving up one or two years of dividends already paid. The full breakdown, country by country, is in [our statute-of-limitations ranking](${articleHref("en", SOL_RANKING_SLUG.en)}).`,
  },
  { type: "h2", text: `The calculation "doing nothing" skips` },
  {
    type: "p",
    text: `Take a concrete example: ${eur(RECOVERED, "en")} of over-withholding identified on Swiss dividends. Doing nothing nets exactly ${eur(0, "en")}. Filing the claim, once the success fee is applied to the amount actually recovered, nets this:`,
  },
  {
    type: "table",
    caption: `Degressive tiers applied to ${eur(RECOVERED, "en")} recovered — commission only on what is actually collected.`,
    headers: [`Tier`, `Rate`, `Fee on this tier`],
    rows: commission.breakdown.map((line) => [
      `${eur(line.from, "en")} → ${eur(line.to, "en")}`,
      pct(line.rate, "en"),
      eur(line.fee, "en"),
    ]),
  },
  {
    type: "ledger-example",
    withheldLabel: `Over-withholding identified`,
    withheldAmount: eur(RECOVERED, "en"),
    owedLabel: `Success fee (degressive tiers)`,
    owedAmount: eur(commission.fee, "en"),
    treatyRef: `Effective rate: ${pct(commission.effectiveRate, "en")}`,
    recoverLabel: `Net proceeds if you file the claim`,
    recoverAmount: eur(commission.net, "en"),
    footnote: `Versus ${eur(0, "en")} net if the file is never opened and the statute of limitations runs out. Success fee only: ${eur(PRICING.floorFee, "en")} minimum per successful file, never charged if nothing is recovered, capped at ${eur(PRICING.capFee, "en")}.`,
  },
  {
    type: "p",
    text: `This isn't a marketing line — it's arithmetic. A commission charged only on a recovered amount always leaves more than an amount that was never claimed at all. The full pricing breakdown — and the cases where doing it yourself is still preferable — is in [our article on the real cost of a recovery claim](${articleHref("en", COST_OF_RECOVERY_SLUG.en)}).`,
  },
  { type: "h2", text: `Why inaction costs more than it looks` },
  {
    type: "ul",
    items: [
      `**The clock doesn't pause.** A dividend paid today starts running toward its statute-of-limitations date the moment it's paid, whether or not you've started a claim.`,
      `**History accumulates but doesn't get a grace period.** Waiting three years to start doesn't leave three years of over-withholding to claim: the oldest years are already time-barred, at different paces per country.`,
      `**Preparation cost doesn't drop over time.** Gathering multi-year-old brokerage statements is slower and less certain than handling a recent file — without the recoverable amount growing to match.`,
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `What if the deadline has already passed?`,
    text: `Once the statute of limitations is reached in the source country, there is generally no remaining recourse — [we explain plainly what happens then](${articleHref("en", MISSED_DEADLINE_SLUG.en)}), rather than implying a solution always exists.`,
  },
  { type: "h2", text: `Your questions on the cost of inaction` },
  {
    type: "faq",
    items: [
      {
        question: `If my amount is small, is it better to do nothing?`,
        answer: `Not necessarily "do nothing" — rather, do it yourself. On a very small amount and a single country, the minimum fee may not be the best option: our free diagnostic says so plainly when that's the case, and [our DIY comparison](${articleHref("en", COST_OF_RECOVERY_SLUG.en)}) gives the threshold.`,
      },
      {
        question: `Does the initial diagnostic cost anything?`,
        answer: `No: the diagnostic is free, and it's exactly what tells you whether a file is worth opening before you have anything to lose by checking.`,
      },
      {
        question: `What happens if the file doesn't succeed?`,
        answer: `No commission is due: the "no win, no fee" principle applies in full. The only real cost of inaction is the over-withholding itself, which keeps running toward its deadline while you hesitate.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculate what inaction is costing me`,
  },
];

export const trueCostOfDoingNothing: Article = {
  id: "true-cost-of-doing-nothing",
  slug: {
    fr: "vrai-cout-de-ne-rien-faire-retenue-a-la-source",
    en: "true-cost-of-doing-nothing-withholding-tax",
  },
  category: "cost",
  title: {
    fr: `Le vrai coût de ne rien faire face à la retenue à la source sur vos dividendes étrangers`,
    en: `The true cost of doing nothing about withholding tax on your foreign dividends`,
  },
  description: {
    fr: `« Ne rien faire » n'est pas gratuit : c'est un trop-perçu qui s'éteint à la date de prescription. Le calcul chiffré entre inaction, délais les plus courts du panel et commission au succès.`,
    en: `"Doing nothing" isn't free: it's an over-withholding that expires at the statute-of-limitations date. The numbers behind inaction, the panel's shortest deadlines, and the success fee.`,
  },
  updated: "2026-08-02",
  readingMinutes: 7,
  content: { fr: frContent, en: enContent },
  relatedCountries: shortest.map((c) => c.id),
};
