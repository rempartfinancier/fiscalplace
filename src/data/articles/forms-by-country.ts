import type { Locale, Localized } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { COUNTRIES, DATA_VERSION, type CountryTaxProfile, type SolRule } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * BEST — "The right refund form, country by country". The reference table is
 * generated from @/data/countries at module load and therefore scales
 * automatically as the country panel grows; nothing is restated by hand.
 */

const RULE_SHORT: Localized<Record<SolRule, string>> = {
  fr: { "calendar-year-end": "fin d'année civile", anniversary: "date anniversaire" },
  en: { "calendar-year-end": "calendar year-end", anniversary: "anniversary" },
};

const yesNo: Localized<(v: boolean) => string> = {
  fr: (v) => (v ? "En ligne" : "Papier"),
  en: (v) => (v ? "Online" : "Paper"),
};

const yearsShort = (c: CountryTaxProfile, locale: Locale) =>
  locale === "fr" ? `${c.sol.years} ans` : `${c.sol.years} yr${c.sol.years > 1 ? "s" : ""}`;

/** Panel ordered by name for the reference table (stable, scan-friendly). */
const ordered = (locale: Locale): CountryTaxProfile[] =>
  [...COUNTRIES].sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale));

const tableRows = (locale: Locale): string[][] =>
  ordered(locale).map((c) => [
    `${c.flag} [${c.name[locale]}](${countryHref(locale, c.slug[locale])})`,
    c.refundForm[locale],
    c.authority[locale],
    `${yearsShort(c, locale)} · ${RULE_SHORT[locale][c.sol.rule]}${c.sol.verify ? " *" : ""}`,
    yesNo[locale](c.onlineFiling),
  ]);

const N = COUNTRIES.length;
const N_ONLINE = COUNTRIES.filter((c) => c.onlineFiling).length;
const N_PAPER = N - N_ONLINE;

/** Canonical slugs of sibling articles referenced below. */
const SOL_RANKING_SLUG = {
  fr: "classement-delais-prescription-par-pays",
  en: "statute-of-limitations-ranking-by-country",
} as const;
const REJECTION_SLUG = {
  fr: "7-raisons-rejet-demande-remboursement",
  en: "7-reasons-withholding-refund-claims-get-rejected",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Chaque administration fiscale a son formulaire, son canal de dépôt et son vocabulaire : Modelo 210 espagnol, formulaire 83 suisse, NR7-R canadien, 276 Div.-Aut. belge, couple 5000/5001 français… Ce tableau est notre référence interne, publiée telle quelle : le bon document, la bonne autorité et le bon canal pour chacun des ${N} pays couverts. Tous ces formulaires sont **gratuits** auprès des administrations — les connaître, c'est déjà pouvoir faire seul.`,
  },
  { type: "h2", text: `Le tableau de référence` },
  {
    type: "table",
    caption: `Formulaires et autorités pour une demande standard de remboursement de retenue à la source sur dividendes — base pays version ${DATA_VERSION}, règles générales indicatives. * = délai à confirmer selon votre situation.`,
    headers: [`Pays`, `Formulaire`, `Autorité`, `Délai · décompte`, `Canal`],
    rows: tableRows("fr"),
  },
  {
    type: "p",
    text: `Trois lectures utiles de ce tableau. Le **délai** est traité en détail dans [le classement des prescriptions](${articleHref("fr", SOL_RANKING_SLUG.fr)}) — c'est la colonne qui décide de l'ordre de vos dépôts. Le **canal** partage le panel en deux mondes : ${N_ONLINE} administrations acceptent un dépôt en ligne, ${N_PAPER} exigent encore du papier — et le papier ajoute ses propres délais de traitement. Le **formulaire**, lui, n'est jamais la difficulté réelle : ce sont ses annexes qui font échouer les dossiers.`,
  },
  { type: "h2", text: `Le formulaire n'est que la partie visible` },
  {
    type: "p",
    text: `Aucune administration ne rembourse sur la foi d'un formulaire bien rempli. Ce qui fait la décision, ce sont les pièces jointes — et elles se ressemblent d'un pays à l'autre :`,
  },
  {
    type: "ul",
    items: [
      `**Le certificat de résidence fiscale**, visé par votre centre des impôts, souvent sur le formulaire du pays source lui-même (l'Allemagne et le Japon y tiennent particulièrement). C'est la pièce la plus longue à obtenir : comptez plusieurs semaines.`,
      `**La preuve des dividendes et de la retenue** : relevés, tax vouchers, attestations du dépositaire. Certains pays (Allemagne en tête) exigent la chaîne de détention complète.`,
      `**La preuve de détention à la date du versement** — le point que les fraudes au remboursement ont rendu incontournable, au Danemark et ailleurs.`,
      `**Un mandat de représentation**, si un tiers dépose pour vous.`,
    ],
  },
  {
    type: "p",
    text: `Bonne nouvelle : ces pièces se **mutualisent**. Un portefeuille à quatre pays ne demande pas quatre dossiers complets, mais un socle commun décliné quatre fois — c'est précisément là que la délégation devient rentable, et c'est [la première cause de rejet](${articleHref("fr", REJECTION_SLUG.fr)}) quand une pièce manque.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Les millésimes comptent`,
    text: `Les administrations font évoluer leurs formulaires, et plusieurs rejettent les versions périmées. Avant tout dépôt, téléchargez la version en vigueur sur le site officiel de l'autorité indiquée dans le tableau — jamais depuis un site tiers, encore moins payant. Nos données sont versionnées (${DATA_VERSION}) et revues régulièrement, mais le millésime du formulaire se vérifie le jour du dépôt.`,
  },
  { type: "h2", text: `Vos questions sur les formulaires` },
  {
    type: "faq",
    items: [
      {
        question: `Puis-je télécharger ces formulaires moi-même ?`,
        answer: `Oui, tous — et gratuitement, sur les sites officiels des administrations listées dans le tableau. Méfiez-vous des sites qui font payer le téléchargement d'un document public. Si vous faites la démarche seul, notre seul conseil ferme : vérifiez le délai de prescription avant d'investir du temps dans le dossier.`,
      },
      {
        question: `Pourquoi le formulaire américain de récupération n'est-il pas le W-8BEN ?`,
        answer: `Parce que le W-8BEN est préventif : il obtient le bon taux sur les versements futurs, mais ne rembourse rien rétroactivement. La récupération américaine a posteriori passe par une déclaration dédiée auprès de l'IRS (1040-NR) — deux démarches distinctes, deux formulaires, et la confusion entre les deux est l'une des erreurs les plus fréquentes que nous voyons.`,
      },
      {
        question: `Un seul certificat de résidence suffit-il pour plusieurs pays ?`,
        answer: `Non : chaque administration veut son exemplaire, souvent sur son propre modèle, parfois avec une exigence de fraîcheur (moins d'un an). En pratique, on demande plusieurs exemplaires visés en une fois à son centre des impôts — c'est le genre de friction que nous absorbons dans un dossier délégué.`,
      },
      {
        question: `Mon pays source ne figure pas dans le tableau : que faire ?`,
        answer: `Le panel couvre les ${N} marchés les plus détenus par nos clients, et il s'étend régulièrement — la base est versionnée. Pour un pays hors panel, le principe reste le même (convention, formulaire, certificat de résidence, délai) : écrivez-nous, nous vous dirons honnêtement si nous pouvons le traiter ou pas encore.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Chiffrer avant de remplir quoi que ce soit`,
    note: `Le simulateur vous dit d'abord si le dossier en vaut la peine — gratuit, sans compte.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Every tax administration has its own form, filing channel and vocabulary: Spain's Modelo 210, Switzerland's Form 83, Canada's NR7-R, Belgium's 276 Div.-Aut., France's 5000/5001 pair… This table is our internal reference, published as is: the right document, the right authority and the right channel for each of the ${N} covered countries. All of these forms are **free** from the administrations — knowing them already means being able to do it yourself.`,
  },
  { type: "h2", text: `The reference table` },
  {
    type: "table",
    caption: `Forms and authorities for a standard dividend withholding-tax refund claim — country database version ${DATA_VERSION}, general indicative rules. * = deadline to be confirmed for your situation.`,
    headers: [`Country`, `Form`, `Authority`, `Window · counting`, `Channel`],
    rows: tableRows("en"),
  },
  {
    type: "p",
    text: `Three useful readings of this table. The **window** is covered in depth in [the statute-of-limitations ranking](${articleHref("en", SOL_RANKING_SLUG.en)}) — it is the column that decides your filing order. The **channel** splits the panel into two worlds: ${N_ONLINE} administrations accept online filing, ${N_PAPER} still require paper — and paper adds its own processing time. The **form** itself is never the real difficulty: its attachments are what sink files.`,
  },
  { type: "h2", text: `The form is only the visible part` },
  {
    type: "p",
    text: `No administration refunds on the strength of a well-completed form alone. What drives the decision is the supporting evidence — and it looks similar from one country to the next:`,
  },
  {
    type: "ul",
    items: [
      `**The certificate of tax residence**, stamped by your tax office, often on the source country's own form (Germany and Japan are particular about this). It is the slowest document to obtain: allow several weeks.`,
      `**Evidence of the dividends and the withholding**: statements, tax vouchers, custodian attestations. Some countries (Germany first among them) require the full chain of custody.`,
      `**Proof of holding on the payment date** — the point the refund frauds made non-negotiable, in Denmark and elsewhere.`,
      `**A representation mandate**, if a third party files for you.`,
    ],
  },
  {
    type: "p",
    text: `The good news: these documents **pool**. A four-country portfolio does not require four full files, but one common base declined four times — precisely where delegating becomes worthwhile, and [the leading cause of rejection](${articleHref("en", REJECTION_SLUG.en)}) when a document is missing.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Form versions matter`,
    text: `Administrations update their forms, and several reject outdated versions. Before any filing, download the current version from the official site of the authority listed in the table — never from a third-party site, let alone a paying one. Our data is versioned (${DATA_VERSION}) and reviewed regularly, but the form's vintage is checked on filing day.`,
  },
  { type: "h2", text: `Your questions about the forms` },
  {
    type: "faq",
    items: [
      {
        question: `Can I download these forms myself?`,
        answer: `Yes, all of them — free of charge, from the official sites of the administrations listed in the table. Beware of websites charging for a public document. If you go it alone, our one firm piece of advice: check the statute of limitations before investing time in the file.`,
      },
      {
        question: `Why isn't the US recovery form the W-8BEN?`,
        answer: `Because the W-8BEN is preventive: it secures the right rate on future payments but refunds nothing retroactively. After-the-fact US recovery goes through a dedicated return filed with the IRS (1040-NR) — two separate procedures, two forms, and confusing them is one of the most frequent mistakes we see.`,
      },
      {
        question: `Is one residence certificate enough for several countries?`,
        answer: `No: each administration wants its own copy, often on its own template, sometimes with a freshness requirement (under a year). In practice you request several stamped copies from your tax office in one go — the kind of friction we absorb in a delegated file.`,
      },
      {
        question: `My source country is not in the table: what now?`,
        answer: `The panel covers the ${N} markets our clients hold most, and it extends regularly — the database is versioned. For a country outside the panel the principle is the same (treaty, form, residence certificate, deadline): write to us and we will tell you honestly whether we can handle it, or not yet.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Put a figure on it before filling anything in`,
    note: `The simulator first tells you whether the file is worth it — free, no account.`,
  },
];

export const formsByCountry: Article = {
  id: "forms-by-country",
  slug: {
    fr: "formulaires-remboursement-par-pays",
    en: "refund-forms-by-country",
  },
  category: "best",
  title: {
    fr: `Le bon formulaire de remboursement, pays par pays : le tableau de référence`,
    en: `The right refund form, country by country: the reference table`,
  },
  description: {
    fr: `Modelo 210, formulaire 83, NR7-R, 276 Div.-Aut., 5000/5001… Le formulaire, l'autorité, le délai et le canal de dépôt pour les ${N} pays couverts — tous gratuits auprès des administrations, tableau mis à jour avec notre base pays.`,
    en: `Modelo 210, Form 83, NR7-R, 276 Div.-Aut., 5000/5001… The form, the authority, the window and the filing channel for all ${N} covered countries — all free from the administrations, table updated with our country database.`,
  },
  updated: "2025-12-16",
  readingMinutes: 7,
  content: { fr: frContent, en: enContent },
  relatedCountries: COUNTRIES.map((c) => c.id),
};
