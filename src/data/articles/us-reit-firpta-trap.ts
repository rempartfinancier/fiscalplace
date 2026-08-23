import { formatPercent, type Locale } from "@/lib/i18n";
import { articleHref } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "US REITs: the FIRPTA capital-gain trap no treaty reduces —
 * and why it almost never hits a retail investor". Verified via web search
 * (IRS FIRPTA withholding pages, 26 U.S. Code §897(h)/(k) on Cornell LII,
 * PATH Act 2015 threshold change): ordinary REIT dividends are FDAP income
 * (30% statutory / 15% treaty, same W-8BEN mechanism as any US dividend);
 * capital gain distributions attributable to a REIT's sale of US real
 * property are instead §897 gain, withheld at 21% under §1445(e)(6) and
 * NOT treaty-reducible — unless the shareholder held ≤10% of a class of a
 * *publicly traded* REIT during the 1-year period before the distribution
 * (§897(k), threshold raised from 5% to 10% by the PATH Act), in which case
 * it reverts to ordinary-dividend (FDAP) treatment. Distinct from the UK
 * REIT PID mentions in `broker-wont-tell-you`/`nothing-to-recover`/
 * `best-countries-french-resident` (different country, different mechanism
 * — cited, not repeated). The FIRPTA-taxed scenario is explicitly framed as
 * NOT a FiscalPlace treaty-refund case (it's a real US income tax return,
 * not an over-withholding claim), per the site's scope guardrail.
 */

const us = getCountryById("US")!;
const usTreaty = treatyRateFor(us, "FR");

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 2);

const FIRPTA_WITHHOLDING_RATE = 0.21;
const FIRPTA_OWNERSHIP_THRESHOLD = 0.1;

const IRS_FIRPTA_URL = "https://www.irs.gov/individuals/international-taxpayers/firpta-withholding";

/** Canonical slugs of sibling articles referenced here. */
const W8BEN_SLUG = { fr: "w-8ben-mode-demploi", en: "w-8ben-explained" };
const BROKER_SLUG = {
  fr: "retenue-a-la-source-ce-que-votre-courtier-ne-dit-pas",
  en: "withholding-tax-what-your-broker-wont-tell-you",
};

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `« Les REIT américains, ne touchez pas à ça, la retenue à la source est un piège » — l'idée circule sur les forums d'investisseurs, souvent sans distinguer deux mécanismes pourtant très différents. L'un concerne les dividendes ordinaires d'un REIT (Realty Income, Prologis, un ETF comme VNQ...) : ils suivent exactement la même règle que n'importe quelle action américaine, ${pct(us.statutoryRate, "fr")} ramenés à ${pct(usTreaty, "fr")} avec un W-8BEN valide. L'autre concerne une part bien plus rare de la distribution — celle liée à la vente d'un bien immobilier par le fonds — et c'est là que la convention fiscale franco-américaine perd toute prise. Voici où passe la vraie limite, et pourquoi elle ne concerne presque jamais un particulier qui achète ses parts en direct chez un courtier.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Ce que cet article n'est pas`,
    text: `Ceci n'est ni un conseil en investissement ni une recommandation d'acheter ou d'éviter les REIT américains : FiscalPlace ne fournit pas de conseil financier personnalisé. C'est une explication d'un mécanisme fiscal, pour distinguer un vrai risque d'une peur mal ciblée.`,
  },
  { type: "h2", text: `Deux retenues très différentes se cachent sous le même mot « REIT »` },
  {
    type: "p",
    text: `Un REIT (Real Estate Investment Trust) verse deux types de distributions à ses actionnaires, taxées différemment côté américain :`,
  },
  {
    type: "ul",
    items: [
      `**Les dividendes ordinaires**, issus des loyers encaissés par le fonds. Ce sont des revenus « FDAP » (Fixed, Determinable, Annual or Periodical) — exactement la même catégorie que le dividende d'Apple ou de Coca-Cola : ${pct(us.statutoryRate, "fr")} de retenue au taux plein, ${pct(usTreaty, "fr")} avec un W-8BEN valide déposé chez le courtier, récupérable par réclamation a posteriori sinon.`,
      `**Les distributions de plus-value (« capital gain dividends »)**, issues de la vente par le fonds d'un bien immobilier américain sous-jacent. Ces distributions ne sont pas un revenu FDAP : elles sont traitées comme une plus-value immobilière américaine directement réalisée par vous — le mécanisme FIRPTA (Foreign Investment in Real Property Tax Act).`,
  ],
  },
  { type: "h2", text: `FIRPTA : pourquoi la convention fiscale ne réduit rien sur cette part` },
  {
    type: "p",
    text: `Quand une distribution est requalifiée en plus-value FIRPTA (article 897 de l'Internal Revenue Code), elle sort du régime des dividendes : elle est imposée comme un revenu effectivement rattaché à une activité américaine (« ECI »), au barème américain applicable, et non au taux plafond conventionnel de ${pct(usTreaty, "fr")}. Le REIT est tenu de retenir ${pct(FIRPTA_WITHHOLDING_RATE, "fr")} sur cette part au moment du versement — un taux fixé par la loi américaine elle-même (article 1445(e)(6)), qu'aucun W-8BEN ne peut faire baisser. [La page FIRPTA de l'IRS](${IRS_FIRPTA_URL}) détaille ce mécanisme. En théorie, le bénéficiaire doit ensuite déposer une déclaration de revenus américaine (formulaire 1040-NR) pour régulariser sa situation réelle sur cette plus-value.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Ce n'est pas un dossier FiscalPlace`,
    text: `Une retenue FIRPTA sur une plus-value réellement due n'est pas un trop-perçu au sens où nous l'entendons ailleurs sur ce site : ce n'est pas l'écart entre un taux plein appliqué par erreur et un taux conventionnel plus bas, c'est un impôt américain réel sur un gain en capital, qui suppose une déclaration de revenus américaine complète — pas une simple demande de remboursement de trop-perçu. Ce sujet dépasse le périmètre de notre service et relève d'un fiscaliste compétent en droit fiscal américain.`,
  },
  { type: "h2", text: `L'exception qui protège presque tout particulier : le seuil de 10 %` },
  {
    type: "p",
    text: `La loi américaine prévoit une exception large, souvent absente des articles qui agitent la peur FIRPTA sans la nuancer : pour un REIT coté (« publicly traded », c'est-à-dire régulièrement échangé sur un marché organisé — le cas de la quasi-totalité des REIT accessibles via un courtier européen), une distribution de plus-value n'est **pas** requalifiée en gain FIRPTA si l'actionnaire n'a détenu, à aucun moment durant les 12 mois précédant le versement, plus de ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "fr")} d'une catégorie d'actions du fonds. Dans ce cas, la distribution retrouve le traitement ordinaire vu plus haut : ${pct(us.statutoryRate, "fr")} ramenés à ${pct(usTreaty, "fr")} par convention, via le même W-8BEN que pour n'importe quel dividende. Ce seuil, relevé de 5 % à 10 % par une loi de 2015 (le PATH Act), reste la même règle en vigueur en 2026.`,
  },
  {
    type: "p",
    text: `Concrètement : un particulier qui détient quelques dizaines ou centaines de parts de Realty Income, Prologis ou d'un ETF comme VNQ, via un compte-titres classique, est à des ordres de grandeur du seuil de ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "fr")} d'un REIT coté — souvent capitalisé plusieurs dizaines de milliards de dollars. Le régime FIRPTA à ${pct(FIRPTA_WITHHOLDING_RATE, "fr")} ne s'applique tout simplement pas à sa situation, quelle que soit la part de la distribution issue d'une vente immobilière.`,
  },
  { type: "h2", text: `Qui est vraiment concerné` },
  {
    type: "ul",
    items: [
      `**Les REIT non cotés** (« non-traded REIT »), parfois commercialisés par des gestionnaires de patrimoine sous forme de fonds fermés ou de véhicules d'investissement immobilier privés : l'exception des 10 % suppose un titre régulièrement échangé sur un marché organisé, ce qui n'est pas leur cas — la retenue FIRPTA plein taux s'applique dès la première part de plus-value distribuée.`,
      `**Une position exceptionnellement concentrée** sur un REIT coté à très faible capitalisation, où détenir plus de ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "fr")} d'une catégorie d'actions resterait matériellement possible pour un particulier — un cas de figure rare mais pas théorique en dehors des grands REIT indiciels.`,
      `**Une société ou une structure** (SCI, holding) détenant les titres plutôt qu'une personne physique en direct — l'analyse du seuil de 10 % et du statut FIRPTA se fait alors différemment et sort du cadre de cet article.`,
    ],
  },
  { type: "h2", text: `Comment vérifier ce qui vous concerne réellement` },
  {
    type: "p",
    text: `Un courtier américain fournit, sur le formulaire 1099-DIV, une case dédiée (« Section 897 gain ») qui isole précisément la part FIRPTA d'une distribution — un repère fiable si votre compte en dispose. Un courtier européen ne détaille pas toujours cette ventilation de façon aussi lisible : si une ligne REIT américaine affiche une retenue sensiblement supérieure à ${pct(usTreaty, "fr")} malgré un W-8BEN valide et à jour, la première hypothèse à vérifier reste une erreur de taux ordinaire — [la méthode de lecture de relevé détaillée ici](${articleHref("fr", BROKER_SLUG.fr)}) s'applique de la même façon. Le réflexe FIRPTA ne devient pertinent que pour un REIT non coté, ou une position dont la taille se rapproche réellement du seuil de ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "fr")} — deux situations à signaler explicitement à un fiscaliste plutôt qu'à traiter en autonomie.`,
  },
  { type: "h2", text: `Tableau récapitulatif` },
  {
    type: "table",
    caption: `Pour un particulier résident fiscal de France détenant un REIT américain en direct.`,
    headers: [``, `Dividende ordinaire (loyers)`, `Plus-value FIRPTA (REIT non coté ou > 10 %)`, `Plus-value « exception 10 % » (REIT coté, position courante)`],
    rows: [
      [`Nature du revenu côté US`, `FDAP (revenu de dividende)`, `Gain effectivement rattaché (§897)`, `FDAP (traité comme un dividende ordinaire)`],
      [`Taux de retenue`, `${pct(us.statutoryRate, "fr")} sans W-8BEN, ${pct(usTreaty, "fr")} avec`, `${pct(FIRPTA_WITHHOLDING_RATE, "fr")}, fixé par la loi américaine`, `${pct(us.statutoryRate, "fr")} sans W-8BEN, ${pct(usTreaty, "fr")} avec`],
      [`Réductible par convention ?`, `Oui, via W-8BEN`, `Non`, `Oui, via W-8BEN`],
      [`Démarche si sur-retenue`, `Réclamation de trop-perçu (dossier FiscalPlace)`, `Déclaration 1040-NR — hors périmètre FiscalPlace`, `Réclamation de trop-perçu (dossier FiscalPlace)`],
    ],
  },
  { type: "h2", text: `Vos questions sur les REIT américains` },
  {
    type: "faq",
    items: [
      {
        question: `Dois-je éviter les REIT américains à cause de FIRPTA ?`,
        answer: `Ce n'est pas ce que dit ce mécanisme : pour un REIT coté détenu en position courante, l'exception des ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "fr")} s'applique dans l'immense majorité des cas, et vous restez dans le même régime que n'importe quel dividende américain. FiscalPlace ne recommande ni ne déconseille un choix d'investissement — seulement de vérifier le mécanisme applicable à votre situation avant de trancher.`,
      },
      {
        question: `Mon W-8BEN protège-t-il aussi la part plus-value FIRPTA ?`,
        answer: `Non : le W-8BEN réduit le taux sur les revenus FDAP (dividendes ordinaires). Il n'a aucun effet sur une distribution requalifiée en gain FIRPTA, dont le taux de ${pct(FIRPTA_WITHHOLDING_RATE, "fr")} est fixé par la loi américaine indépendamment de tout traité fiscal. Voir [notre guide du W-8BEN](${articleHref("fr", W8BEN_SLUG.fr)}) pour ce qu'il couvre réellement.`,
      },
      {
        question: `Comment savoir si un REIT donné est « coté » au sens de cette exception ?`,
        answer: `Un REIT acheté comme une action ordinaire via un courtier — coté sur le NYSE, le Nasdaq ou négocié via un ETF indiciel — répond en pratique au critère. Un doute ne se lève qu'au cas par cas avec un fiscaliste, en particulier pour un véhicule proposé hors marché coté (fonds fermé, SCPI américaine, montage patrimonial).`,
      },
      {
        question: `FiscalPlace peut-il m'aider si une distribution FIRPTA a été retenue à ${pct(FIRPTA_WITHHOLDING_RATE, "fr")} ?`,
        answer: `Non — ce cas relève d'une déclaration de revenus américaine réelle (formulaire 1040-NR), pas d'une demande de remboursement de trop-perçu conventionnel. Nous vous le disons clairement plutôt que de vous laisser croire à un dossier que nous ne traitons pas.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier la retenue sur mes REIT américains`,
    note: `Le simulateur couvre l'écart de taux sur les dividendes ordinaires — pas une distribution déjà requalifiée en gain FIRPTA, qui relève d'une déclaration américaine distincte.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `"Stay away from US REITs, the withholding tax is a trap" — the claim circulates on investor forums, usually without separating two genuinely different mechanisms. One covers a REIT's ordinary dividends (Realty Income, Prologis, an ETF like VNQ...): they follow the exact same rule as any US stock, ${pct(us.statutoryRate, "en")} cut to ${pct(usTreaty, "en")} with a valid W-8BEN. The other covers a much rarer slice of the distribution — the part tied to the fund's sale of a US property — and that's where the France-US tax treaty stops helping at all. Here's exactly where the real line sits, and why it almost never touches a retail investor buying shares directly through a broker.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What this article is not`,
    text: `This is not investment advice, nor a recommendation to buy or avoid US REITs: FiscalPlace does not provide personalized financial advice. It's an explanation of a tax mechanism, to tell a real risk apart from a misdirected fear.`,
  },
  { type: "h2", text: `Two very different withholdings hide under the same word "REIT"` },
  {
    type: "p",
    text: `A REIT (Real Estate Investment Trust) pays its shareholders two kinds of distributions, taxed differently on the US side:`,
  },
  {
    type: "ul",
    items: [
      `**Ordinary dividends**, sourced from rental income the fund collects. These are "FDAP" income (Fixed, Determinable, Annual or Periodical) — the exact same category as an Apple or Coca-Cola dividend: ${pct(us.statutoryRate, "en")} at the full statutory rate, ${pct(usTreaty, "en")} with a valid W-8BEN on file with your broker, recoverable after the fact otherwise.`,
      `**Capital gain distributions**, sourced from the fund's sale of an underlying US property. These aren't FDAP income at all: they're treated as a US real property gain realized directly by you — the FIRPTA (Foreign Investment in Real Property Tax Act) mechanism.`,
    ],
  },
  { type: "h2", text: `FIRPTA: why the tax treaty reduces nothing on this part` },
  {
    type: "p",
    text: `When a distribution is recharacterized as FIRPTA gain (Internal Revenue Code section 897), it leaves the dividend regime entirely: it's taxed as income effectively connected with a US trade or business ("ECI"), at the applicable US rate — not at the treaty-capped ${pct(usTreaty, "en")}. The REIT must withhold ${pct(FIRPTA_WITHHOLDING_RATE, "en")} on that portion at the time of payment — a rate set by US law itself (section 1445(e)(6)), which no W-8BEN can lower. [The IRS's FIRPTA page](${IRS_FIRPTA_URL}) covers this mechanism in detail. In theory, the recipient must then file a US tax return (Form 1040-NR) to settle their actual liability on that gain.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `This isn't a FiscalPlace case`,
    text: `A FIRPTA withholding on a genuinely owed capital gain isn't an over-withholding in the sense we use elsewhere on this site: it isn't the gap between a wrongly applied full rate and a lower treaty rate — it's real US tax on a capital gain, requiring a full US income tax return, not a treaty refund claim. This falls outside our service's scope and calls for a tax professional versed in US tax law.`,
  },
  { type: "h2", text: `The exception that protects almost every retail investor: the 10% threshold` },
  {
    type: "p",
    text: `US law carries a broad exception, often missing from articles that raise the FIRPTA alarm without nuance: for a publicly traded REIT — regularly traded on an established securities market, which covers the vast majority of REITs accessible through a European broker — a capital gain distribution is **not** recharacterized as FIRPTA gain if the shareholder held no more than ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "en")} of a class of the fund's stock at any time during the 12 months before the distribution. In that case, the distribution reverts to the ordinary treatment above: ${pct(us.statutoryRate, "en")} cut to ${pct(usTreaty, "en")} by treaty, through the same W-8BEN as any other dividend. This threshold, raised from 5% to 10% by a 2015 law (the PATH Act), remains the rule in effect in 2026.`,
  },
  {
    type: "p",
    text: `In practice: a retail investor holding a few dozen or hundred shares of Realty Income, Prologis, or an ETF like VNQ, through an ordinary brokerage account, sits orders of magnitude below the ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "en")} threshold of a publicly traded REIT — often capitalized at tens of billions of dollars. The ${pct(FIRPTA_WITHHOLDING_RATE, "en")} FIRPTA regime simply doesn't apply to their situation, whatever share of the distribution came from a property sale.`,
  },
  { type: "h2", text: `Who is genuinely affected` },
  {
    type: "ul",
    items: [
      `**Non-traded REITs**, sometimes marketed by wealth managers as closed-end funds or private real estate investment vehicles: the 10% exception requires a stock regularly traded on an established securities market, which these aren't — full-rate FIRPTA withholding applies from the very first capital gain distribution.`,
      `**An unusually concentrated position** in a small-cap, publicly traded REIT, where holding more than ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "en")} of a class of shares would remain materially possible for a retail investor — a rare but non-theoretical case outside the large index REITs.`,
      `**A company or structure** (a holding vehicle, a civil real estate company) holding the shares rather than an individual holding them directly — the 10% threshold and FIRPTA analysis then work differently, and fall outside the scope of this article.`,
    ],
  },
  { type: "h2", text: `How to check what actually applies to you` },
  {
    type: "p",
    text: `A US broker's Form 1099-DIV includes a dedicated box ("Section 897 gain") that isolates the FIRPTA portion of a distribution precisely — a reliable marker if your account provides one. A European broker doesn't always break this out as clearly: if a US REIT line shows withholding noticeably above ${pct(usTreaty, "en")} despite a valid, current W-8BEN, the first hypothesis to check is still an ordinary rate error — [the statement-reading walkthrough here](${articleHref("en", BROKER_SLUG.en)}) applies the same way. The FIRPTA question only becomes relevant for a non-traded REIT, or a position whose size genuinely approaches the ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "en")} threshold — two situations worth flagging explicitly to a tax professional rather than handling on your own.`,
  },
  { type: "h2", text: `Summary table` },
  {
    type: "table",
    caption: `For a French tax resident individual holding a US REIT directly.`,
    headers: [``, `Ordinary dividend (rental income)`, `FIRPTA gain (non-traded REIT or > 10%)`, `"10% exception" gain (publicly traded REIT, ordinary position)`],
    rows: [
      [`Nature of the income on the US side`, `FDAP (dividend income)`, `Effectively connected gain (§897)`, `FDAP (treated as an ordinary dividend)`],
      [`Withholding rate`, `${pct(us.statutoryRate, "en")} without a W-8BEN, ${pct(usTreaty, "en")} with one`, `${pct(FIRPTA_WITHHOLDING_RATE, "en")}, set by US law`, `${pct(us.statutoryRate, "en")} without a W-8BEN, ${pct(usTreaty, "en")} with one`],
      [`Treaty-reducible?`, `Yes, via a W-8BEN`, `No`, `Yes, via a W-8BEN`],
      [`Path if over-withheld`, `Over-withholding refund claim (a FiscalPlace case)`, `Form 1040-NR return — outside FiscalPlace's scope`, `Over-withholding refund claim (a FiscalPlace case)`],
    ],
  },
  { type: "h2", text: `Your questions about US REITs` },
  {
    type: "faq",
    items: [
      {
        question: `Should I avoid US REITs because of FIRPTA?`,
        answer: `That's not what this mechanism says: for a publicly traded REIT held in an ordinary position, the ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "en")} exception applies in the vast majority of cases, and you stay in the same regime as any US dividend. FiscalPlace neither recommends nor discourages an investment choice — only checking which mechanism actually applies to your situation before deciding.`,
      },
      {
        question: `Does my W-8BEN also protect the FIRPTA capital-gain portion?`,
        answer: `No: a W-8BEN reduces the rate on FDAP income (ordinary dividends). It has no effect on a distribution recharacterized as FIRPTA gain, whose ${pct(FIRPTA_WITHHOLDING_RATE, "en")} rate is set by US law independently of any tax treaty. See [our W-8BEN guide](${articleHref("en", W8BEN_SLUG.en)}) for what it actually covers.`,
      },
      {
        question: `How do I know if a given REIT is "publicly traded" for this exception?`,
        answer: `A REIT bought like an ordinary stock through a broker — listed on the NYSE, Nasdaq, or traded via an index ETF — meets the criterion in practice. Genuine doubt only gets resolved case by case with a tax professional, particularly for a vehicle offered outside the listed market (a closed-end fund, a non-traded real estate vehicle, a wealth-planning structure).`,
      },
      {
        question: `Can FiscalPlace help if a distribution was withheld at ${pct(FIRPTA_WITHHOLDING_RATE, "en")} under FIRPTA?`,
        answer: `No — that case calls for an actual US income tax return (Form 1040-NR), not a treaty over-withholding refund claim. We'd rather tell you plainly than let you assume we handle a case we don't.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check the withholding on my US REITs`,
    note: `The simulator covers the rate gap on ordinary dividends — not a distribution already recharacterized as FIRPTA gain, which calls for a separate US tax return.`,
  },
];

export const usReitFirptaTrap: Article = {
  id: "us-reit-firpta-trap",
  slug: {
    fr: "reit-americains-piege-firpta",
    en: "us-reits-firpta-trap",
  },
  category: "problems",
  title: {
    fr: `REIT américains : le vrai piège FIRPTA à ${pct(FIRPTA_WITHHOLDING_RATE, "fr")} — et pourquoi il ne vous concerne presque jamais`,
    en: `US REITs: the real FIRPTA ${pct(FIRPTA_WITHHOLDING_RATE, "en")} trap — and why it almost never applies to you`,
  },
  description: {
    fr: `Une distribution de plus-value d'un REIT américain peut être retenue à ${pct(FIRPTA_WITHHOLDING_RATE, "fr")}, sans réduction conventionnelle possible — sauf pour la quasi-totalité des particuliers, protégés par l'exception des ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "fr")} sur les REIT cotés. Le mécanisme vérifié, et qui est vraiment concerné.`,
    en: `A US REIT's capital gain distribution can be withheld at ${pct(FIRPTA_WITHHOLDING_RATE, "en")}, with no treaty reduction possible — except that almost every retail investor is protected by the ${pct(FIRPTA_OWNERSHIP_THRESHOLD, "en")} exception on publicly traded REITs. The verified mechanism, and who is genuinely affected.`,
  },
  updated: "2026-08-21",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US"],
};
