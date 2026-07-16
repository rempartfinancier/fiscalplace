import { formatCurrency, formatDate, type Locale, type Localized } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import {
  COUNTRIES,
  getCountryById,
  solDeadline,
  type CountryTaxProfile,
  type SolRule,
} from "@/data/countries";
import { PRICING } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * BEST — "Statute-of-limitations ranking by country".
 * Every deadline, counting rule and price below is computed from
 * @/data/countries and @/config/pricing at module load; nothing is restated
 * by hand. The example deadlines use solDeadline(), the same function that
 * powers the public calculator.
 */

const ca = getCountryById("CA")!;
const ch = getCountryById("CH")!;
const de = getCountryById("DE")!;
const ie = getCountryById("IE")!;
const at = getCountryById("AT")!;
const se = getCountryById("SE")!;
const be = getCountryById("BE")!;
const es = getCountryById("ES")!;
const fi = getCountryById("FI")!;
const no = getCountryById("NO")!;
const pt = getCountryById("PT")!;
const us = getCountryById("US")!;

/** Ranked from the shortest window to the most comfortable (auto-scales with the panel). */
const ranked: CountryTaxProfile[] = [...COUNTRIES].sort((a, b) => a.sol.years - b.sol.years);

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);

const RULE_LABEL: Localized<Record<SolRule, string>> = {
  fr: { "calendar-year-end": "Fin d'année civile", anniversary: "Date anniversaire" },
  en: { "calendar-year-end": "Calendar-year end", anniversary: "Anniversary date" },
};

const yearsLabel = (c: CountryTaxProfile, locale: Locale) =>
  locale === "fr" ? `${c.sol.years} ans` : `${c.sol.years} ${c.sol.years > 1 ? "years" : "year"}`;

/** Per-country footnote for the ranking table — aligned with sol.notes in @/data/countries. */
const TABLE_NOTES: Record<string, Localized<string>> = {
  CA: {
    fr: `Le plus court du panel — formulaire NR7-R, procédure papier`,
    en: `The panel's shortest — form NR7-R, paper procedure`,
  },
  US: {
    fr: `Règle simplifiée : le calcul exact dépend aussi de la date de la déclaration`,
    en: `Simplified rule: the exact computation also depends on the return filing date`,
  },
  CH: {
    fr: `Dépôt en ligne obligatoire depuis 2025 ; trois demandes max par an`,
    en: `Electronic filing mandatory since 2025; three claims max per year`,
  },
  NL: {
    fr: `À confirmer selon votre configuration — souvent rien à récupérer pour un particulier`,
    en: `To be confirmed for your case — often nothing to recover for an individual`,
  },
  DE: {
    fr: `Instruction souvent supérieure à 12 mois : ne pas déposer au dernier moment`,
    en: `Processing often exceeds 12 months: don't file at the last minute`,
  },
  IE: {
    fr: `Depuis la fin de l'année du versement ; exonération totale à la clé`,
    en: `From the end of the payment year; a full exemption at stake`,
  },
  GB: {
    fr: `Année fiscale britannique close le 5 avril — à confirmer ; ne concerne guère que les REIT`,
    en: `UK tax year ends 5 April — to be confirmed; in practice REITs only`,
  },
  AU: {
    fr: `Année fiscale australienne close le 30 juin — à confirmer ; selon le franking`,
    en: `Australian tax year ends 30 June — to be confirmed; franking-dependent`,
  },
  JP: {
    fr: `Décompte depuis le lendemain du versement ; procédure papier via agent payeur`,
    en: `Counted from the day after payment; paper procedure via the paying agent`,
  },
  AT: {
    fr: `L'un des délais les plus confortables d'Europe`,
    en: `One of Europe's most comfortable windows`,
  },
  SE: {
    fr: `À confirmer lors du diagnostic ; administration réputée réactive`,
    en: `To be confirmed at diagnostic stage; a famously responsive administration`,
  },
  IT: {
    fr: `48 mois date par date ; l'instruction la plus lente du panel — plusieurs années fréquentes`,
    en: `48 months, date by date; the panel's slowest processing — multi-year waits are common`,
  },
  ES: {
    fr: `Décompte lié à la période de dépôt du Modelo 210 — à confirmer`,
    en: `Count tied to the Modelo 210 filing window — to be confirmed`,
  },
  BE: {
    fr: `Décompte depuis le 1er janvier de l'année du prélèvement — les distraits y perdent un an`,
    en: `Counted from 1 January of the withholding year — the inattentive lose a year`,
  },
  DK: {
    fr: `Depuis le prélèvement — à confirmer ; documentation renforcée depuis les fraudes`,
    en: `From the withholding date — to be confirmed; tightened checks since the frauds`,
  },
  NO: {
    fr: `À confirmer ; le taux réduit à la source est une vraie option si documenté à l'avance`,
    en: `To be confirmed; relief at source is a real option when documented in advance`,
  },
  FI: {
    fr: `Les 3 années civiles suivant l'année du versement ; 0 % dû par un résident de France`,
    en: `The 3 calendar years after the payment year; 0% owed by a French resident`,
  },
  PT: {
    fr: `Aussi court que le Canada — la prévention (21-RFI) vaut mieux que la course`,
    en: `As short as Canada — prevention (21-RFI) beats the race`,
  },
  FR: {
    fr: `Jusqu'au 31 décembre de la 2e année suivante ; rien à récupérer dans le cas standard`,
    en: `Until 31 December of the 2nd following year; nothing to recover in the standard case`,
  },
};

const rankingRows = (locale: Locale): string[][] =>
  ranked.map((c) => [
    yearsLabel(c, locale),
    `${c.flag} [${c.name[locale]}](${countryHref(locale, c.slug[locale])})`,
    RULE_LABEL[locale][c.sol.rule],
    TABLE_NOTES[c.id][locale],
  ]);

/* Worked example: one dividend paid on 10 May 2024, two counting rules. */
const EXAMPLE_PAYMENT = "2024-05-10";
const isoOf = (d: Date) => d.toISOString().slice(0, 10);
const caDeadlineIso = isoOf(solDeadline(ca, EXAMPLE_PAYMENT)); // 31 Dec of year+2
const usDeadlineIso = isoOf(solDeadline(us, EXAMPLE_PAYMENT)); // payment date +3 years

/* The 31 December cliff: dividend years expiring at the end of CLIFF_YEAR. */
const CLIFF_YEAR = 2026;
const cliffCountries = [ca, pt, fi, ch, be, es, de, ie, at, se, no];
const cliffItems = (locale: Locale): string[] =>
  cliffCountries.map((c) =>
    locale === "fr"
      ? `**${c.name.fr}** : les dividendes de ${CLIFF_YEAR - c.sol.years}`
      : `**${c.name.en}**: dividends from ${CLIFF_YEAR - c.sol.years}`,
  );

/* Canonical slugs of sibling articles referenced below. */
const MISSED_DEADLINE_SLUG = {
  fr: "delai-de-prescription-depasse-que-faire",
  en: "missed-the-statute-of-limitations-what-now",
} as const;
const REJECTION_SLUG = {
  fr: "7-raisons-rejet-demande-remboursement",
  en: "7-reasons-withholding-refund-claims-get-rejected",
} as const;
const BEST_COUNTRIES_SLUG = {
  fr: "meilleurs-pays-recuperation-resident-francais",
  en: "best-countries-for-recovery-french-resident",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Un trop-perçu de retenue à la source ne vous attend pas indéfiniment : chaque pays fixe un délai de prescription au-delà duquel votre droit s'éteint — définitivement, sans recours ni exception. Ces délais vont du simple au plus du double : ${yearsLabel(ca, "fr")} au Canada ou au Portugal, ${yearsLabel(at, "fr")} en Autriche, en Suède, au Japon ou en Norvège. Voici le classement complet des ${COUNTRIES.length} pays couverts, les règles de décompte qui changent tout, et l'ordre dans lequel déposer quand plusieurs pays s'accumulent.`,
  },
  {
    type: "p",
    text: `Une précision qui vaut de l'argent avant le tableau : deux pays affichant le même nombre d'années peuvent donner des échéances éloignées de plusieurs mois, car tout dépend du **point de départ** du décompte.`,
  },
  { type: "h2", text: `Deux façons de compter : fin d'année civile ou date anniversaire` },
  {
    type: "p",
    text: `**Fin d'année civile** — la règle la plus répandue du panel : le délai court à partir du 31 décembre de l'année du dividende. Exemple calculé : un dividende canadien encaissé le ${formatDate(EXAMPLE_PAYMENT, "fr")} se prescrit le **${formatDate(caDeadlineIso, "fr")}**. Conséquence contre-intuitive : les dividendes de janvier et de décembre d'une même année meurent le même jour.`,
  },
  {
    type: "p",
    text: `**Date anniversaire** — le délai court depuis le versement lui-même (ou son lendemain au Japon). Le même dividende du ${formatDate(EXAMPLE_PAYMENT, "fr")}, version américaine, resterait réclamable jusqu'aux alentours du **${formatDate(usDeadlineIso, "fr")}** — règle simplifiée : aux États-Unis, le calcul exact dépend aussi de la date de dépôt de la déclaration. Chaque versement a alors sa propre échéance, étalée sur l'année.`,
  },
  { type: "h2", text: `Le classement, du couperet le plus court au plus confortable` },
  {
    type: "table",
    caption: `Délais de prescription pour une demande standard de remboursement — règles générales, indicatives. Données revues mi-2026.`,
    headers: [`Délai`, `Pays`, `Décompte`, `À savoir`],
    rows: rankingRows("fr"),
  },
  {
    type: "p",
    text: `À lire avec deux nuances. D'abord, les délais marqués « à confirmer » reposent sur des règles générales dont l'application dépend de votre configuration — c'est exactement ce que notre diagnostic vérifie avant tout dépôt. Ensuite, un long délai ne signifie pas un long potentiel : le Royaume-Uni et les Pays-Bas figurent dans ce classement par exhaustivité, mais [il n'y a en général rien à y récupérer pour un particulier](${articleHref("fr", BEST_COUNTRIES_SLUG.fr)}).`,
  },
  { type: "h2", text: `L'effet falaise du 31 décembre` },
  {
    type: "p",
    text: `Dans les pays à décompte « fin d'année civile », la prescription ne grignote pas votre droit jour après jour : elle le fauche par années entières. Au 31 décembre ${CLIFF_YEAR}, expirent d'un coup — en règle générale :`,
  },
  { type: "ul", items: cliffItems("fr") },
  {
    type: "p",
    text: `(Le Royaume-Uni et l'Australie suivent leurs années fiscales décalées — 5 avril et 30 juin — et les Pays-Bas comme la France relèvent du cas « rien à récupérer » pour la plupart des particuliers.) C'est pour cela que le quatrième trimestre est la haute saison du métier — et que déposer en novembre un dossier qui pouvait l'être en juin est le moyen le plus sûr de le faire traiter dans l'urgence.`,
  },
  { type: "h2", text: `Dans quel ordre déposer : la stratégie par urgence` },
  {
    type: "ol",
    items: [
      `**Le [Canada](${countryHref("fr", ca.slug.fr)}) et le [Portugal](${countryHref("fr", pt.slug.fr)}) d'abord, toujours.** Avec ${yearsLabel(ca, "fr")} après la fin de l'année civile, ce sont mécaniquement les premiers dossiers à mourir — et la procédure papier (NR7-R canadien, 22-RFI portugais) ajoute son propre délai de traitement.`,
      `**Puis tout ce qui expire au prochain 31 décembre.** Listez vos échéances exactes avec le [calculateur de prescription](${href("fr", "solCalculator")}) : une année de dividendes suisses, allemands ou irlandais peut tomber d'un bloc.`,
      `**Les États-Unis au fil de l'eau.** Le décompte à date anniversaire répartit les échéances sur l'année : traitez versement par versement — en gardant en tête que la plupart des cas américains sont préventifs (W-8BEN) plutôt que rétroactifs.`,
      `**Les pays à ${yearsLabel(at, "fr")} en dernier — mais pas en année 5.** Autriche, Suède, Japon et Norvège laissent du temps ; le consommer entièrement n'est pas gratuit : les justificatifs vieillissent, les comptes se ferment, et l'instruction s'ajoute au délai. Notre pratique : ne jamais viser volontairement la dernière année.`,
    ],
  },
  {
    type: "p",
    text: `Pour un dossier déjà proche de son échéance, le traitement prioritaire à ${eur(PRICING.fixedServices.priorityHandling, "fr")} fait passer la demande en tête de file — mais le meilleur traitement prioritaire reste le calendrier : les pièces d'un dossier, attestation de résidence en tête, ont leurs propres délais d'obtention que personne ne compresse.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Hors délai = perdu, point final`,
    text: `Aucun prestataire, aucun recours, aucune exception ne ressuscite un trop-perçu prescrit — c'est [le seul motif de rejet sans rattrapage possible](${articleHref("fr", REJECTION_SLUG.fr)}). Si vous pensez avoir dépassé une échéance, [notre article dédié](${articleHref("fr", MISSED_DEADLINE_SLUG.fr)}) détaille ce qui reste sauvable : les années non prescrites, et les autres pays du portefeuille.`,
  },
  { type: "h2", text: `Vos questions sur les délais de prescription` },
  {
    type: "faq",
    items: [
      {
        question: `Le délai court-il depuis la date du dividende ou depuis la fin de l'année ?`,
        answer: `Selon le pays : la plupart comptent depuis la fin de l'année civile du versement (Canada, Suisse, Allemagne, Irlande, Autriche, Suède, Finlande, Portugal…), d'autres depuis le versement lui-même (États-Unis en règle simplifiée, Italie, Danemark, Japon depuis le lendemain). C'est précisément cette règle, pays par pays, que le calculateur applique pour vous.`,
      },
      {
        question: `Puis-je encore déposer à quelques semaines de l'échéance ?`,
        answer: `Oui, tant que la demande part avant l'expiration — et le traitement prioritaire à ${eur(PRICING.fixedServices.priorityHandling, "fr")} existe pour cela. Soyez lucide sur la vraie contrainte : l'attestation de résidence visée par votre centre des impôts peut demander plusieurs semaines à elle seule. À un mois de l'échéance, c'est elle qui décide, pas nous.`,
      },
      {
        question: `Déposer avant l'échéance suffit-il, même si l'administration répond après ?`,
        answer: `En règle générale, oui : c'est la date de dépôt qui compte, pas la date de la décision. L'instruction peut ensuite durer des mois — souvent plus de douze en Allemagne — sans remettre en cause vos droits, à condition de répondre dans les temps aux éventuelles demandes de pièces complémentaires.`,
      },
      {
        question: `Les délais peuvent-ils changer ?`,
        answer: `Oui : ce sont des règles nationales, que chaque législateur peut modifier — la Suisse a bien rendu son dépôt électronique obligatoire en 2025. Les délais de cette page sont les règles générales revues mi-2026 ; certains cas particuliers (année fiscale décalée, statut spécifique) suivent d'autres décomptes, vérifiés au diagnostic.`,
      },
      {
        question: `Que devient un dossier déposé à temps mais rejeté pour une erreur ?`,
        answer: `Tant que le délai n'est pas expiré, un rejet formel se corrige par un redépôt : rien n'est perdu, sinon du temps. Le vrai danger est l'erreur commise en année limite, quand il ne reste plus de marge pour corriger — une raison de plus de ne pas viser la dernière année.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "solCalculator",
    label: `Calculer mes échéances exactes`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Over-withheld tax does not wait for you forever: every country sets a statute of limitations beyond which your right lapses — permanently, with no appeal and no exception. The windows range from short to more than double: ${yearsLabel(ca, "en")} in Canada or Portugal, ${yearsLabel(at, "en")} in Austria, Sweden, Japan or Norway. Here is the full ranking of all ${COUNTRIES.length} covered countries, the counting rules that change everything, and the order in which to file when several countries pile up.`,
  },
  {
    type: "p",
    text: `One money-saving clarification before the table: two countries showing the same number of years can produce deadlines months apart, because everything hinges on the **starting point** of the count.`,
  },
  { type: "h2", text: `Two ways of counting: calendar-year end vs anniversary date` },
  {
    type: "p",
    text: `**Calendar-year end** — the panel's most common rule: the clock starts on 31 December of the dividend year. A computed example: a Canadian dividend received on ${formatDate(EXAMPLE_PAYMENT, "en")} expires on **${formatDate(caDeadlineIso, "en")}**. The counter-intuitive consequence: January and December dividends of the same year die on the same day.`,
  },
  {
    type: "p",
    text: `**Anniversary date** — the clock runs from the payment itself (or the day after, in Japan). The same ${formatDate(EXAMPLE_PAYMENT, "en")} dividend, US version, would remain claimable until around **${formatDate(usDeadlineIso, "en")}** — simplified rule: in the US, the exact computation also depends on when the return was filed. Each payment then carries its own deadline, spread across the year.`,
  },
  { type: "h2", text: `The ranking, from the sharpest guillotine to the most comfortable` },
  {
    type: "table",
    caption: `Statutes of limitations for a standard refund claim — general, indicative rules. Data reviewed in mid-2026.`,
    headers: [`Window`, `Country`, `Counting rule`, `Worth knowing`],
    rows: rankingRows("en"),
  },
  {
    type: "p",
    text: `Read it with two caveats. First, the windows marked "to be confirmed" rest on general rules whose application depends on your configuration — exactly what our diagnostic verifies before anything is filed. Second, a long window does not mean a large potential: the United Kingdom and the Netherlands appear for completeness, but [there is generally nothing there to recover for an individual](${articleHref("en", BEST_COUNTRIES_SLUG.en)}).`,
  },
  { type: "h2", text: `The 31 December cliff` },
  {
    type: "p",
    text: `In calendar-year-end countries, the statute doesn't nibble at your right day by day: it mows it down in whole years. On 31 December ${CLIFF_YEAR}, all of the following expire at once — as a general rule:`,
  },
  { type: "ul", items: cliffItems("en") },
  {
    type: "p",
    text: `(The UK and Australia follow their shifted tax years — 5 April and 30 June — and the Netherlands, like France, mostly falls under "nothing to recover" for individuals.) This is why the fourth quarter is the trade's high season — and why filing in November what could have been filed in June is the surest way to have it handled in a rush.`,
  },
  { type: "h2", text: `In what order to file: the urgency strategy` },
  {
    type: "ol",
    items: [
      `**[Canada](${countryHref("en", ca.slug.en)}) and [Portugal](${countryHref("en", pt.slug.en)}) first, always.** With ${yearsLabel(ca, "en")} after the end of the calendar year, they are mechanically the first files to die — and the paper procedures (Canada's NR7-R, Portugal's 22-RFI) add their own processing time.`,
      `**Then everything expiring next 31 December.** List your exact dates with the [deadline calculator](${href("en", "solCalculator")}): a whole year of Swiss, German or Irish dividends can drop off in one block.`,
      `**The United States as you go.** Anniversary counting spreads deadlines across the year: handle payment by payment — bearing in mind most US cases are preventive (W-8BEN) rather than retroactive.`,
      `**The ${yearsLabel(at, "en")} countries last — but not in year five.** Austria, Sweden, Japan and Norway leave time; using all of it isn't free: evidence ages, accounts close, and processing time stacks on top. Our practice: never deliberately aim for the final year.`,
    ],
  },
  {
    type: "p",
    text: `For a claim already close to its deadline, priority handling at ${eur(PRICING.fixedServices.priorityHandling, "en")} moves it to the front of the queue — but the best priority handling is still the calendar: a file's documents, the stamped residence certificate first among them, have lead times of their own that nobody can compress.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Past the deadline = gone, full stop`,
    text: `No provider, no appeal, no exception resurrects an expired over-withholding — it is [the one rejection ground with no cure](${articleHref("en", REJECTION_SLUG.en)}). If you think you've missed a deadline, [our dedicated article](${articleHref("en", MISSED_DEADLINE_SLUG.en)}) walks through what remains salvageable: the non-expired years, and the portfolio's other countries.`,
  },
  { type: "h2", text: `Your questions about claim deadlines` },
  {
    type: "faq",
    items: [
      {
        question: `Does the clock run from the dividend date or from the end of the year?`,
        answer: `It depends on the country: most count from the end of the calendar year of payment (Canada, Switzerland, Germany, Ireland, Austria, Sweden, Finland, Portugal…), others from the payment itself (the US under the simplified rule, Italy, Denmark, Japan from the day after). That country-by-country rule is exactly what the calculator applies for you.`,
      },
      {
        question: `Can I still file a few weeks before the deadline?`,
        answer: `Yes, as long as the claim goes out before expiry — priority handling at ${eur(PRICING.fixedServices.priorityHandling, "en")} exists for precisely that. Be clear-eyed about the real constraint, though: the residence certificate stamped by your tax office can take several weeks on its own. One month out, that document sets the pace, not us.`,
      },
      {
        question: `Is filing before the deadline enough, even if the administration replies after it?`,
        answer: `As a general rule, yes: what counts is the filing date, not the decision date. Processing can then run for months — often more than twelve in Germany — without affecting your rights, provided you answer any requests for additional documents in time.`,
      },
      {
        question: `Can the deadlines change?`,
        answer: `Yes: these are national rules, and any legislature can amend them — Switzerland did make electronic filing mandatory in 2025. The windows on this page are the general rules as reviewed in mid-2026; some special cases (shifted tax years, specific statuses) follow different counts, checked at diagnostic stage.`,
      },
      {
        question: `What happens to a claim filed on time but rejected over an error?`,
        answer: `As long as the window is open, a formal rejection is cured by refiling: nothing is lost but time. The real danger is an error made in the final year, when no margin is left to correct it — one more reason never to aim for year five.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "solCalculator",
    label: `Compute my exact deadlines`,
  },
];

export const solRankingByCountry: Article = {
  id: "sol-ranking-by-country",
  slug: {
    fr: "classement-delais-prescription-par-pays",
    en: "statute-of-limitations-ranking-by-country",
  },
  category: "best",
  title: {
    fr: "Prescription : le classement des délais pour réclamer, pays par pays",
    en: "Statute of limitations: how long you have to claim, ranked by country",
  },
  description: {
    fr: `Du Canada et du Portugal (${ca.sol.years} ans seulement) à l'Autriche, la Suède, le Japon et la Norvège (${at.sol.years} ans), le classement complet des délais de prescription des ${COUNTRIES.length} pays couverts — avec les deux règles de décompte, l'effet falaise du 31 décembre et l'ordre de dépôt qui en découle.`,
    en: `From Canada and Portugal (only ${ca.sol.years} years) to Austria, Sweden, Japan and Norway (${at.sol.years} years): claim deadlines ranked across all ${COUNTRIES.length} covered countries — with both counting rules, the 31 December cliff, and the filing order that follows.`,
  },
  updated: "2025-11-18",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: [
    "CA",
    "PT",
    "US",
    "CH",
    "DK",
    "FI",
    "NL",
    "DE",
    "IE",
    "GB",
    "AU",
    "BE",
    "ES",
    "IT",
    "JP",
    "AT",
    "SE",
    "NO",
    "FR",
  ],
};
