import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * REVIEWS — "PEA or standard brokerage account for foreign dividends?" Takes
 * a stance against the common sales pitch that a PEA is a strictly better
 * wrapper. All rates come from @/data/countries; the tax-credit mechanism
 * described (crédit d'impôt étranger on a CTO vs. no offsettable French tax
 * on a PEA) is general French tax mechanics, not a site-specific figure.
 */

const de = getCountryById("DE")!;
const ch = getCountryById("CH")!;
const be = getCountryById("BE")!;
const nl = getCountryById("NL")!;

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/* Worked German example: 1,000 € of gross German dividends. */
const DE_GROSS = 1_000;
const deWithheld = DE_GROSS * de.statutoryRate;
const deTreaty = DE_GROSS * treatyRateFor(de, "FR");
const deAboveTreaty = deWithheld - deTreaty;

const COST_OF_RECOVERY_SLUG = {
  fr: "combien-coute-recuperation-withholding-tax",
  en: "cost-of-withholding-tax-recovery",
} as const;
const DIY_SLUG = {
  fr: "faire-soi-meme-vs-deleguer-remboursement",
  en: "diy-vs-delegating-your-refund-claim",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Le PEA a une réputation méritée pour la fiscalité française : plus d'impôt sur le revenu ni de prélèvements sociaux sur les dividendes après cinq ans (hors prélèvements sociaux, qui restent dus). Ce qu'on vous dit rarement, c'est ce qu'il ne fait pas : **le PEA ne vous protège en rien de la retenue à la source prélevée à l'étranger**. Et pour un portefeuille riche en dividendes étrangers, cet angle mort peut coûter plus cher que l'avantage fiscal français ne rapporte.`,
  },
  { type: "h2", text: `Ce que le PEA change vraiment — et ce qu'il ne change pas` },
  {
    type: "p",
    text: `La retenue à la source est prélevée à la frontière du pays qui verse le dividende, avant même que l'argent n'atteigne votre compte-titres ou votre PEA. Cette retenue ne sait pas dans quelle enveloppe française vous logez vos titres : un dividende suisse retenu à ${pct(ch.statutoryRate, "fr")} l'est de la même façon, que le titre soit détenu en direct sur un compte-titres ordinaire (CTO) ou dans un PEA. L'exonération du PEA porte sur l'étage français de l'imposition — pas sur l'étage étranger.`,
  },
  { type: "h2", text: `Le vrai problème : pas de crédit d'impôt à l'intérieur d'un PEA` },
  {
    type: "p",
    text: `Sur un compte-titres ordinaire, la mécanique est bien rodée : le dividende étranger net est déclaré, la retenue supportée à l'étranger — dans la limite du taux conventionnel — ouvre droit à un **crédit d'impôt** imputable sur votre impôt français (déclaration annexe dédiée aux revenus de source étrangère). Concrètement, sur un CTO, la part de retenue correspondant au taux conventionnel (souvent 15 %) est neutralisée par ce crédit : vous l'avez payée à l'étranger, mais elle vient en déduction de ce que vous devez au fisc français sur ce même dividende.`,
  },
  {
    type: "p",
    text: `Sur un PEA, ce dividende n'entre dans aucune assiette d'impôt français à compenser : il est hors champ, pas différemment imposé. Sans impôt français sur ce revenu, il n'y a rien sur quoi imputer un crédit. **La part de retenue correspondant au taux conventionnel devient une perte sèche, structurellement irrécupérable** — ni par la voie fiscale française, ni par une demande à l'étranger, puisque ce taux est précisément celui que la convention autorise l'État de la source à prélever sur un résident de France. Ce n'est pas un trop-perçu ; c'est l'impôt normalement dû, simplement perdu pour l'investisseur en PEA faute de mécanisme de compensation.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu en Allemagne (${pct(de.statutoryRate, "fr")})`,
    withheldAmount: eur(deWithheld, "fr"),
    owedLabel: `Taux conventionnel résident FR (${pct(treatyRateFor(de, "FR"), "fr")})`,
    owedAmount: eur(deTreaty, "fr"),
    treatyRef: `Convention France–Allemagne`,
    recoverLabel: `Écart récupérable auprès du BZSt (quel que soit le compte)`,
    recoverAmount: eur(deAboveTreaty, "fr"),
    footnote: `Sur ${eur(DE_GROSS, "fr")} de dividendes allemands bruts. Cet écart se réclame de la même façon sur CTO et sur PEA. La différence entre les deux enveloppes porte uniquement sur les ${eur(deTreaty, "fr")} restants : neutralisés par un crédit d'impôt sur CTO, définitivement perdus sur PEA. Montants indicatifs, données revues mi-2026.`,
  },
  { type: "h2", text: `Ce que ça change en pratique pour votre demande` },
  {
    type: "table",
    caption: `Sort du dividende étranger selon l'enveloppe — hors cas où le pays source n'a rien à récupérer.`,
    headers: [`Tranche de retenue`, `Sur compte-titres (CTO)`, `Sur PEA`],
    rows: [
      [
        `Jusqu'au taux conventionnel`,
        `Neutralisée par un crédit d'impôt sur votre déclaration française`,
        `Perte définitive : aucune voie de recours, française ou étrangère`,
      ],
      [
        `Au-delà du taux conventionnel`,
        `Récupérable auprès de l'administration du pays source`,
        `Récupérable auprès de l'administration du pays source, à l'identique`,
      ],
    ],
  },
  {
    type: "p",
    text: `C'est pour cette raison que notre diagnostic pose systématiquement la question de l'enveloppe : sur un PEA, nous ne pouvons chiffrer et réclamer que la part au-delà du taux conventionnel — jamais le taux conventionnel lui-même, contrairement à ce qu'un CTO permet de neutraliser côté français. Le dire clairement évite une déception fréquente : « vous m'avez seulement récupéré une partie de ce qui a été retenu » n'est pas une limite de notre service, c'est une limite structurelle du PEA face à la fiscalité internationale.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Éligibilité du PEA : un filtre géographique qui compte aussi`,
    text: `En règle générale, un PEA « classique » ne peut détenir en direct que des titres de sociétés ayant leur siège dans l'Union européenne ou l'Espace économique européen — les actions américaines, suisses, canadiennes ou japonaises en direct en sont exclues (des ETF éligibles PEA peuvent répliquer une exposition plus large, selon des règles à vérifier avec votre courtier). Le comparatif de retenue ci-dessus vise donc surtout les dividendes européens logés en PEA : Allemagne, Belgique, Suisse (hors UE/EEE mais fréquemment citée en exemple), Pays-Bas, Italie…`,
  },
  { type: "h2", text: `Le cas où l'enveloppe ne change rien` },
  {
    type: "p",
    text: `Sur les pays où le taux statutaire correspond déjà au taux conventionnel — les [Pays-Bas](${countryHref("fr", nl.slug.fr)}) en sont l'exemple le plus net, avec ${pct(nl.statutoryRate, "fr")} retenus pour ${pct(treatyRateFor(nl, "FR"), "fr")} dus — la distinction PEA/CTO devient sans objet : il n'y a de toute façon rien à récupérer, sur aucune des deux enveloppes. À l'inverse, sur un pays à fort écart comme la Belgique (${pct(be.statutoryRate, "fr")} retenus, ${pct(treatyRateFor(be, "FR"), "fr")} dus), la perte structurelle du PEA sur la tranche conventionnelle devient significative dès que les montants grossissent.`,
  },
  { type: "h2", text: `Notre avis, sans détour` },
  {
    type: "p",
    text: `Le PEA reste pertinent pour un portefeuille dominé par des actions françaises ou par des valeurs de pays où l'écart de retenue est nul ou faible. Pour un portefeuille délibérément construit autour de gros payeurs de dividendes étrangers à écart élevé (Suisse, Belgique, Allemagne, pays nordiques), le calcul est plus fin qu'on ne le présente d'ordinaire : l'exonération française après cinq ans a un coût caché, permanent, qui n'apparaît sur aucun relevé annuel. Le bon réflexe n'est pas de renoncer au PEA, mais de le savoir avant de l'utiliser comme réceptacle principal de dividendes étrangers à forte fiscalité de source.`,
  },
  { type: "h2", text: `Vos questions sur PEA et retenue à la source` },
  {
    type: "faq",
    items: [
      {
        question: `Le PEA-PME change-t-il quelque chose à ce mécanisme ?`,
        answer: `Non : le PEA-PME suit la même logique fiscale française que le PEA classique — l'exonération porte sur l'imposition française, pas sur la retenue étrangère. Le même angle mort s'applique.`,
      },
      {
        question: `Puis-je réclamer la part conventionnelle plus tard, par exemple en clôturant mon PEA ?`,
        answer: `Non : la clôture du PEA ne rouvre aucun droit sur des dividendes déjà versés et déjà retenus au taux conventionnel. Ce n'est pas une question de calendrier mais d'absence structurelle de mécanisme de compensation pour ce revenu.`,
      },
      {
        question: `Un compte-titres est-il alors toujours préférable pour les dividendes étrangers ?`,
        answer: `Pas nécessairement — cela dépend de votre horizon, de votre taux d'imposition français sur les plus-values et de la part de dividendes étrangers à écart élevé dans le portefeuille. C'est un arbitrage, pas une évidence : [notre comparatif faire-soi-même ou déléguer](${articleHref("fr", DIY_SLUG.fr)}) et un diagnostic gratuit permettent de chiffrer votre cas précis.`,
      },
      {
        question: `Ce que vous récupérez sur un PEA vaut-il le coût de la démarche ?`,
        answer: `Cela dépend du montant au-delà du taux conventionnel et du nombre de pays concernés — voir [notre article sur le coût réel d'une récupération](${articleHref("fr", COST_OF_RECOVERY_SLUG.fr)}). Sur un seul petit dossier, faire soi-même se défend très bien.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier ce qui est récupérable sur mes dividendes`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `The PEA (Plan d'Épargne en Actions) has a well-earned reputation on the French side of taxation: no French income tax and no social levies on dividends after five years (social levies still apply). What rarely gets said is what it doesn't do: **a PEA offers zero protection against withholding tax levied abroad**. For a portfolio heavy in foreign dividends, that blind spot can cost more than the French tax break saves.`,
  },
  { type: "h2", text: `What the PEA actually changes — and what it doesn't` },
  {
    type: "p",
    text: `Withholding tax is levied at the border of the paying country, before the money ever reaches your French brokerage account or PEA. That withholding doesn't know which French wrapper holds your shares: a Swiss dividend withheld at ${pct(ch.statutoryRate, "en")} is withheld the same way whether the stock sits in a standard brokerage account (CTO) or inside a PEA. The PEA's exemption sits on the French side of taxation — not on the foreign side.`,
  },
  { type: "h2", text: `The real problem: no tax credit inside a PEA` },
  {
    type: "p",
    text: `On a standard brokerage account, the mechanics are well established: the net foreign dividend is declared, and the tax withheld abroad — up to the treaty rate — generates a **tax credit** offsettable against your French income tax (via the dedicated foreign-income schedule). In practice, on a CTO the treaty-rate slice of withholding (often 15%) is neutralised by that credit: you paid it abroad, but it comes off what you owe the French tax authority on that same dividend.`,
  },
  {
    type: "p",
    text: `On a PEA, that dividend sits in no French tax base to offset against: it is out of scope, not taxed differently. With no French tax on that income, there is nothing to credit against. **The treaty-rate slice of withholding becomes a structural, permanent loss** — not recoverable through French tax mechanics, nor through a foreign claim, since that rate is exactly what the treaty allows the source country to levy on a French resident. It isn't over-withholding; it is the tax genuinely owed, simply lost for PEA holders for lack of an offset mechanism.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld in Germany (${pct(de.statutoryRate, "en")})`,
    withheldAmount: eur(deWithheld, "en"),
    owedLabel: `Treaty rate for an FR resident (${pct(treatyRateFor(de, "FR"), "en")})`,
    owedAmount: eur(deTreaty, "en"),
    treatyRef: `France–Germany treaty`,
    recoverLabel: `Gap recoverable from the BZSt (either account type)`,
    recoverAmount: eur(deAboveTreaty, "en"),
    footnote: `On ${eur(DE_GROSS, "en")} of gross German dividends. This gap is claimable the same way on a CTO and a PEA. The difference between the two wrappers is only about the remaining ${eur(deTreaty, "en")}: offset by a tax credit on a CTO, permanently lost on a PEA. Indicative amounts, data reviewed mid-2026.`,
  },
  { type: "h2", text: `What this means in practice for your claim` },
  {
    type: "table",
    caption: `Fate of the foreign dividend by wrapper — excluding countries where there is nothing to recover at all.`,
    headers: [`Withholding slice`, `On a standard account (CTO)`, `On a PEA`],
    rows: [
      [
        `Up to the treaty rate`,
        `Offset by a tax credit on your French return`,
        `Permanent loss: no recourse, French or foreign`,
      ],
      [
        `Above the treaty rate`,
        `Recoverable from the source country's administration`,
        `Recoverable from the source country's administration, identically`,
      ],
    ],
  },
  {
    type: "p",
    text: `This is why our diagnostic always asks which wrapper holds the shares: on a PEA, we can only quantify and claim the slice above the treaty rate — never the treaty rate itself, unlike a CTO where the French side neutralises it. Saying so plainly avoids a common disappointment: "you only recovered part of what was withheld" is not a limit of our service — it is a structural limit of the PEA against international taxation.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `PEA eligibility is also a geographic filter`,
    text: `As a general rule, a standard PEA can only directly hold shares of companies headquartered in the EU or EEA — US, Swiss, Canadian or Japanese shares held directly are excluded (PEA-eligible ETFs may replicate broader exposure, subject to rules to confirm with your broker). The comparison above mainly concerns European dividends held in a PEA: Germany, Belgium, Switzerland (outside the EU/EEA but frequently cited), the Netherlands, Italy…`,
  },
  { type: "h2", text: `The case where the wrapper makes no difference` },
  {
    type: "p",
    text: `On countries where the statutory rate already matches the treaty rate — the [Netherlands](${countryHref("en", nl.slug.en)}) is the clearest example, with ${pct(nl.statutoryRate, "en")} withheld against ${pct(treatyRateFor(nl, "FR"), "en")} owed — the PEA/CTO distinction becomes moot: there is nothing to recover either way. Conversely, on a high-gap country like Belgium (${pct(be.statutoryRate, "en")} withheld, ${pct(treatyRateFor(be, "FR"), "en")} owed), the PEA's structural loss on the treaty slice becomes significant as amounts grow.`,
  },
  { type: "h2", text: `Our unfiltered take` },
  {
    type: "p",
    text: `The PEA still makes sense for a portfolio dominated by French shares or by countries with little or no withholding gap. For a portfolio deliberately built around large foreign dividend payers with a high gap (Switzerland, Belgium, Germany, the Nordics), the arithmetic is finer than usually presented: the French five-year exemption has a hidden, permanent cost that shows up on no annual statement. The right move isn't to abandon the PEA — it's to know this before using it as the main container for high-withholding foreign dividends.`,
  },
  { type: "h2", text: `Your questions on the PEA and withholding tax` },
  {
    type: "faq",
    items: [
      {
        question: `Does a PEA-PME change anything?`,
        answer: `No: a PEA-PME follows the same French tax logic as a standard PEA — the exemption sits on French taxation, not foreign withholding. The same blind spot applies.`,
      },
      {
        question: `Can I claim the treaty-rate slice later, say by closing my PEA?`,
        answer: `No: closing the PEA reopens no rights over dividends already paid and already withheld at the treaty rate. It isn't a timing issue — it's the structural absence of an offset mechanism for that income.`,
      },
      {
        question: `Is a standard brokerage account always better for foreign dividends, then?`,
        answer: `Not necessarily — it depends on your horizon, your French tax rate on capital gains, and how much of the portfolio sits in high-gap foreign dividends. It's a trade-off, not a given: [our DIY vs delegating comparison](${articleHref("en", DIY_SLUG.en)}) and a free diagnostic can quantify your specific case.`,
      },
      {
        question: `Is what you recover on a PEA worth the effort?`,
        answer: `It depends on the amount above the treaty rate and how many countries are involved — see [our article on the real cost of a recovery claim](${articleHref("en", COST_OF_RECOVERY_SLUG.en)}). On a single small file, doing it yourself holds up very well.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check what's recoverable on my dividends`,
  },
];

export const peaVsCtoForeignDividends: Article = {
  id: "pea-vs-cto-foreign-dividends",
  slug: {
    fr: "pea-ou-compte-titres-dividendes-etrangers",
    en: "pea-vs-brokerage-account-foreign-dividends",
  },
  category: "reviews",
  title: {
    fr: `PEA ou compte-titres pour vos dividendes étrangers : notre avis sans détour sur la retenue à la source`,
    en: `PEA or standard brokerage account for foreign dividends: our unfiltered take on withholding tax`,
  },
  description: {
    fr: `Le PEA exonère vos dividendes d'impôt français après cinq ans — mais il vous prive aussi, définitivement, du crédit d'impôt qui neutralise la retenue étrangère sur un compte-titres. Un coût caché que personne ne chiffre.`,
    en: `The PEA exempts your dividends from French tax after five years — but it also permanently costs you the tax credit that neutralises foreign withholding on a standard account. A hidden cost nobody quantifies.`,
  },
  updated: "2026-08-02",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["DE", "CH", "BE", "NL"],
};
