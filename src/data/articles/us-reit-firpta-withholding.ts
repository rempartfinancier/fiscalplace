import { formatPercent, type Locale } from "@/lib/i18n";
import { articleHref } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "US REITs: the withholding that isn't the usual 15%." Realty
 * Income, Prologis, Simon Property... are common in French portfolios for
 * their yield. Two distinct US withholding regimes apply to their
 * distributions: ordinary dividends (standard 30%/15% FDAP mechanism,
 * same as any US stock — a normal FiscalPlace case) and capital gain
 * distributions attributable to the REIT's sale of US real property,
 * governed by FIRPTA (IRC §897(h)) and NOT reduced by the France-US
 * treaty. Verified externally (IRS FIRPTA guidance, Congress.gov CRS
 * reports, The Tax Adviser): 21% FIRPTA withholding rate on such
 * distributions since Jan 1, 2018 (tied to the corporate rate), and the
 * PATH Act 2015 safe harbor exempting a shareholder who held ≤10% of a
 * class of stock regularly traded on a US exchange, during the 1-year
 * period before the distribution, from FIRPTA characterization — which
 * covers the near-totality of individual retail holders in listed REITs.
 * The real trap for a retail investor is not the rate itself but not
 * knowing which regime applied to which portion of a distribution, since
 * French broker statements rarely break this out the way the US-side
 * 1099-DIV/1042-S boxes do. Distinct from `broker-wont-tell-you` (general
 * broker-statement literacy) and `nothing-to-recover` (UK REIT PIDs) —
 * both cited in support rather than duplicated.
 */

const us = getCountryById("US")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 2);

const BROKER_SLUG = {
  fr: "retenue-a-la-source-ce-que-votre-courtier-ne-dit-pas",
  en: "withholding-tax-what-your-broker-wont-tell-you",
} as const;
const NOTHING_TO_RECOVER_SLUG = {
  fr: "pays-ou-rien-a-recuperer",
  en: "countries-with-nothing-to-recover",
} as const;
const W8BEN_SLUG = {
  fr: "w-8ben-mode-demploi",
  en: "w-8ben-explained",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Realty Income, Prologis, Simon Property Group, American Tower : les REIT (« Real Estate Investment Trusts ») américains figurent parmi les valeurs à dividende les plus détenues par les investisseurs français, pour leur rendement régulier et souvent élevé. Mais toutes les lignes d'une distribution de REIT ne subissent pas la même retenue à la source — et la différence ne tient ni au hasard, ni à une erreur de votre courtier, mais à un mécanisme fiscal américain distinct de celui des actions ordinaires : la loi FIRPTA (Foreign Investment in Real Property Tax Act).`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Ce que cet article n'est pas`,
    text: `Ceci n'est pas un conseil en investissement ni une recommandation de détenir ou d'éviter les REIT américains : ce sont des supports comme d'autres, avec leurs propres arbitrages de rendement et de risque, hors du champ de FiscalPlace. C'est une explication d'un mécanisme fiscal, pour comprendre une ligne de relevé avant d'en tirer une conclusion hâtive.`,
  },
  { type: "h2", text: `Deux distributions, deux régimes fiscaux américains` },
  {
    type: "p",
    text: `Un REIT distribue en réalité deux types de revenus, sous une même étiquette « dividende » sur la plupart des relevés de courtage français. Côté américain, la distinction est pourtant nette — elle figure sur les formulaires 1099-DIV et 1042-S émis par l'agent payeur, mais rarement retranscrite telle quelle par les courtiers européens.`,
  },
  { type: "h3", text: `Le dividende ordinaire : le mécanisme que vous connaissez déjà` },
  {
    type: "p",
    text: `La part de la distribution qui provient des loyers encaissés et du résultat d'exploitation du REIT est un revenu ordinaire (« FDAP income ») : elle suit exactement le même régime qu'un dividende Apple ou Coca-Cola. Retenue statutaire de ${pct(us.statutoryRate, "fr")}, ramenée à ${pct(treatyRateFor(us, "FR"), "fr")} pour un résident de France si un W-8BEN valide est enregistré chez le courtier au moment du versement (relief at source). Rien de spécifique aux REIT ici — [le mécanisme W-8BEN est détaillé dans son propre article](${articleHref("fr", W8BEN_SLUG.fr)}).`,
  },
  { type: "h3", text: `La distribution en capital liée à la vente d'un immeuble : le terrain FIRPTA` },
  {
    type: "p",
    text: `Quand un REIT vend un immeuble avec plus-value et reverse cette plus-value à ses actionnaires sous forme de « capital gain distribution », le régime change radicalement : cette part est traitée par la loi FIRPTA comme si vous aviez vous-même vendu un bien immobilier américain. En règle générale, la retenue applicable à ce type de distribution est de ${pct(0.21, "fr")} — un taux aligné sur l'impôt sur les sociétés américain depuis 2018 (contre ${pct(0.35, "fr")} auparavant) — et surtout, à la différence du dividende ordinaire, **cette composante n'est en règle générale pas réductible par la convention fiscale franco-américaine** : les conventions réservent généralement l'imposition des plus-values immobilières au pays où se situe le bien, quel que soit le pays de résidence du porteur.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Pourquoi ce n'est pas un dossier récupérable pour cette composante`,
    text: `Si une distribution de REIT a bien été correctement caractérisée comme un « capital gain distribution » FIRPTA et retenue en conséquence, il n'y a rien d'anormal à corriger : c'est le taux prévu par la loi américaine pour ce type précis de revenu, hors du champ que la convention franco-américaine réduit. Ce n'est ni une erreur de courtier, ni un trop-perçu — contrairement à la part ordinaire de la même distribution, qui reste un dossier standard si le taux plein de ${pct(us.statutoryRate, "fr")} s'est appliqué à tort.`,
  },
  { type: "h2", text: `Le garde-fou qui protège la quasi-totalité des petits porteurs` },
  {
    type: "p",
    text: `La loi américaine prévoit une exception significative, introduite par le PATH Act de 2015 : pour un REIT dont l'action est régulièrement négociée sur un marché boursier organisé américain (le cas de tous les grands REIT cotés qu'un particulier français détient via son courtier), une distribution en capital **n'est pas traitée comme un gain FIRPTA** dès lors que l'actionnaire n'a détenu, à aucun moment durant l'année précédant la distribution, plus de 10 % de la catégorie d'actions concernée. En pratique, un particulier détenant quelques dizaines ou centaines de titres Realty Income ou Prologis via son compte-titres est très largement sous ce seuil : pour lui, cette composante ne devrait, en règle générale, subir aucune retenue FIRPTA — elle est alors traitée comme un gain en capital ordinaire, en principe non imposé aux États-Unis pour un non-résident sans présence physique significative sur le sol américain.`,
  },
  {
    type: "p",
    text: `Le vrai terrain à risque se trouve ailleurs : les REIT **non cotés** (« non-traded REITs », parfois proposés via des structures de gestion privée ou des SCPI américaines) ne bénéficient pas de cette exception de marché organisé, quelle que soit la taille de la participation. Sur ces supports, la retenue FIRPTA de ${pct(0.21, "fr")} sur la composante « capital gain » s'applique sans le filet de sécurité des 10 %, et ne se réduit pas par convention.`,
  },
  { type: "h2", text: `Le piège concret : une ligne, deux régimes, aucune distinction sur votre relevé` },
  {
    type: "p",
    text: `Le problème n'est presque jamais le taux en lui-même — il est documenté et légitime dans les deux cas. Le problème est qu'un relevé de courtage français agrège en général la distribution en une seule ligne « dividende » avec un seul montant retenu, sans reproduire la ventilation américaine entre revenu ordinaire et gain en capital que porterait un 1042-S. Deux erreurs symétriques en découlent : croire que **toute** la retenue subie sur un REIT est un trop-perçu récupérable à 15 % (faux si une partie est un gain FIRPTA légitimement non réductible), ou à l'inverse abandonner tout espoir de récupération sur un REIT parce qu'« il y a du FIRPTA dedans » (faux pour la part ordinaire, qui reste un dossier normal). Le seul moyen de trancher est de remonter au détail par nature de distribution — annoncé par l'émetteur du REIT lui-même en début d'année suivante (souvent via un communiqué « tax treatment of distributions ») ou sur le 1042-S si le courtier le transmet.`,
  },
  { type: "h2", text: `Tableau récapitulatif` },
  {
    type: "table",
    caption: `Pour un particulier résident de France détenant un REIT américain coté via son compte-titres — données revues août 2026.`,
    headers: [``, `Dividende ordinaire`, `Distribution en capital (FIRPTA)`],
    rows: [
      [`Nature du revenu`, `Loyers / résultat d'exploitation du REIT`, `Plus-value de cession d'un immeuble par le REIT`],
      [
        `Retenue statutaire`,
        `${pct(us.statutoryRate, "fr")}`,
        `En règle générale ${pct(0.21, "fr")} si caractérisé comme gain FIRPTA`,
      ],
      [
        `Réductible par la convention FR-US ?`,
        `Oui — ${pct(treatyRateFor(us, "FR"), "fr")} avec un W-8BEN valide`,
        `Non, en règle générale — sauf application de l'exception « marché organisé + 10 % »`,
      ],
      [
        `Cas d'un petit porteur, REIT coté`,
        `Mécanisme standard, identique à toute action US`,
        `En règle générale hors du champ FIRPTA (exception PATH Act 2015) — rien à retenir à ce titre`,
      ],
      [
        `Récupérable via FiscalPlace ?`,
        `Oui, si le taux plein s'est appliqué malgré un W-8BEN valide`,
        `Seulement en cas d'application erronée de la retenue FIRPTA malgré l'exception applicable — diagnostic nécessaire`,
      ],
    ],
  },
  { type: "h2", text: `Vos questions sur les REIT et la retenue à la source` },
  {
    type: "faq",
    items: [
      {
        question: `Comment savoir si une distribution de REIT que j'ai reçue contenait du gain FIRPTA ?`,
        answer: `L'émetteur du REIT publie chaque année, généralement en janvier, un communiqué « tax treatment of distributions » qui ventile chaque versement de l'année précédente entre revenu ordinaire, gain en capital et retour de capital. C'est la source la plus fiable — plus fiable que le relevé agrégé de votre courtier.`,
      },
      {
        question: `Si je détiens un REIT via un ETF, ce mécanisme s'applique-t-il à moi ?`,
        answer: `Non : dans un ETF ou un fonds, c'est le fonds qui est actionnaire du REIT sous-jacent, pas vous directement. La retenue éventuellement subie l'est au niveau du fonds et ne vous est ni imputable ni récupérable par vous — un sujet distinct, traité dans l'article sur le domicile des ETF.`,
      },
      {
        question: `Un REIT non coté peut-il quand même convenir à un particulier français ?`,
        answer: `C'est une question de choix d'investissement, hors du champ fiscal traité ici — FiscalPlace ne recommande pas de support en particulier. Ce qu'on peut dire factuellement : l'absence d'exception de marché organisé sur les REIT non cotés change la donne fiscale sur la composante gain en capital, un point à connaître avant de comparer un rendement affiché à un autre.`,
      },
      {
        question: `Le taux FIRPTA de 21 % peut-il changer ?`,
        answer: `Oui : ce taux est aligné sur le taux d'impôt sur les sociétés fédéral américain, lui-même modifiable par la loi fiscale américaine. Ce chiffre est présenté comme indicatif, à date de revue août 2026, et se vérifie fonds par fonds et dossier par dossier avant tout dépôt.`,
      },
    ],
  },
  {
    type: "p",
    text: `Le réflexe utile reste celui-ci : ne jamais assimiler une retenue REIT à une simple ligne « dividende américain » sans vérifier sa nature. [Notre article sur la lecture de relevé de courtage](${articleHref("fr", BROKER_SLUG.fr)}) et [le classement des cas où il n'y a rien à récupérer](${articleHref("fr", NOTHING_TO_RECOVER_SLUG.fr)}) complètent utilement cette lecture.`,
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier mes distributions de REIT`,
    note: `Le simulateur traite la part ordinaire de vos distributions ; la part gain en capital nécessite un diagnostic dédié.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Realty Income, Prologis, Simon Property Group, American Tower: US REITs (Real Estate Investment Trusts) are among the most widely held dividend stocks in French portfolios, prized for their regular and often high yield. But not every line of a REIT distribution suffers the same withholding — and the difference isn't random, nor a broker error, but a distinct US tax mechanism from ordinary shares: the Foreign Investment in Real Property Tax Act (FIRPTA).`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What this article is not`,
    text: `This is not investment advice, nor a recommendation to hold or avoid US REITs: they are a security type like any other, with their own return and risk trade-offs outside FiscalPlace's scope. It is an explanation of a tax mechanism, so you can read a statement line correctly before drawing a hasty conclusion.`,
  },
  { type: "h2", text: `Two distributions, two US tax regimes` },
  {
    type: "p",
    text: `A REIT actually distributes two types of income, bundled under a single "dividend" label on most French brokerage statements. On the US side, the distinction is clear-cut — it appears on the 1099-DIV and 1042-S forms issued by the paying agent, but is rarely passed through by European brokers.`,
  },
  { type: "h3", text: `The ordinary dividend: the mechanism you already know` },
  {
    type: "p",
    text: `The portion of the distribution funded by rental income and the REIT's operating results is ordinary FDAP income: it follows exactly the same regime as an Apple or Coca-Cola dividend. Statutory withholding of ${pct(us.statutoryRate, "en")}, cut to ${pct(treatyRateFor(us, "FR"), "en")} for a French resident if a valid W-8BEN is on file with the broker at payment time (relief at source). Nothing REIT-specific here — [the W-8BEN mechanism has its own dedicated article](${articleHref("en", W8BEN_SLUG.en)}).`,
  },
  { type: "h3", text: `The capital gain distribution tied to a property sale: FIRPTA territory` },
  {
    type: "p",
    text: `When a REIT sells a building at a gain and passes that gain through to shareholders as a "capital gain distribution," the regime changes entirely: FIRPTA treats this portion as if you had personally sold a US real property interest. As a general rule, withholding on this type of distribution runs at ${pct(0.21, "en")} — a rate tied to the US corporate tax rate since 2018 (down from ${pct(0.35, "en")} before) — and, unlike the ordinary dividend, **this component is generally not reducible under the France-US tax treaty**: treaties typically reserve taxation of real property gains to the country where the property sits, regardless of the holder's residence.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Why this isn't a recoverable claim for this component`,
    text: `If a REIT distribution was correctly characterized as a FIRPTA capital gain distribution and withheld accordingly, there is nothing anomalous to correct: it is the rate US law provides for this specific type of income, outside the scope the France-US treaty reduces. It is neither a broker error nor an over-withholding — unlike the ordinary portion of the same distribution, which remains a standard case if the full ${pct(us.statutoryRate, "en")} rate was wrongly applied.`,
  },
  { type: "h2", text: `The safe harbor that protects nearly every small holder` },
  {
    type: "p",
    text: `US law provides a significant exception, introduced by the 2015 PATH Act: for a REIT whose stock is regularly traded on an established US securities market (the case for every large listed REIT a French individual holds through a broker), a capital gain distribution **is not treated as FIRPTA gain** as long as the shareholder did not own more than 10% of the relevant class of stock at any time during the year preceding the distribution. In practice, an individual holding a few dozen or a few hundred Realty Income or Prologis shares through a brokerage account is comfortably below that threshold: for them, this component generally shouldn't suffer any FIRPTA withholding at all — it is instead treated as an ordinary capital gain, in principle not taxed by the US for a non-resident without significant physical presence there.`,
  },
  {
    type: "p",
    text: `The real risk sits elsewhere: **non-traded REITs** (sometimes offered through private wealth structures or US-style non-listed property vehicles) do not benefit from this organized-market exception, regardless of stake size. On these vehicles, the ${pct(0.21, "en")} FIRPTA withholding on the capital-gain component applies without the 10% safety net, and is not treaty-reducible.`,
  },
  { type: "h2", text: `The real trap: one line, two regimes, no distinction on your statement` },
  {
    type: "p",
    text: `The problem is almost never the rate itself — it is documented and legitimate either way. The problem is that a French brokerage statement generally bundles the distribution into a single "dividend" line with one withheld amount, without reproducing the US-side split between ordinary income and capital gain that a 1042-S would show. Two mirror-image mistakes follow: assuming **all** the withholding on a REIT is a recoverable over-withholding at 15% (wrong if part is a legitimately non-reducible FIRPTA gain), or conversely giving up on any recovery from a REIT because "there's FIRPTA in it" (wrong for the ordinary portion, which remains a normal case). The only way to settle it is to trace the breakdown by distribution type — published by the REIT issuer itself early the following year (often via a "tax treatment of distributions" release) or on the 1042-S if the broker passes it through.`,
  },
  { type: "h2", text: `Summary table` },
  {
    type: "table",
    caption: `For a French individual holding a listed US REIT through a brokerage account — data reviewed August 2026.`,
    headers: [``, `Ordinary dividend`, `Capital gain distribution (FIRPTA)`],
    rows: [
      [`Nature of the income`, `Rental income / REIT operating results`, `Gain from the REIT's sale of a property`],
      [
        `Statutory withholding`,
        `${pct(us.statutoryRate, "en")}`,
        `Generally ${pct(0.21, "en")} if characterized as FIRPTA gain`,
      ],
      [
        `Reducible under the FR-US treaty?`,
        `Yes — ${pct(treatyRateFor(us, "FR"), "en")} with a valid W-8BEN`,
        `Generally no — unless the "organized market + 10%" exception applies`,
      ],
      [
        `Case of a small holder, listed REIT`,
        `Standard mechanism, identical to any US share`,
        `Generally outside FIRPTA scope (2015 PATH Act exception) — nothing to flag here`,
      ],
      [
        `Recoverable via FiscalPlace?`,
        `Yes, if the full rate applied despite a valid W-8BEN`,
        `Only if FIRPTA withholding was wrongly applied despite the exception — needs a dedicated diagnostic`,
      ],
    ],
  },
  { type: "h2", text: `Your questions about REITs and withholding tax` },
  {
    type: "faq",
    items: [
      {
        question: `How do I know if a REIT distribution I received included FIRPTA gain?`,
        answer: `The REIT issuer publishes a "tax treatment of distributions" release each year, usually in January, breaking down every prior-year payment between ordinary income, capital gain and return of capital. That's a more reliable source than your broker's bundled statement line.`,
      },
      {
        question: `If I hold a REIT through an ETF, does this mechanism apply to me?`,
        answer: `No: in an ETF or fund, the fund is the shareholder of the underlying REIT, not you directly. Any withholding suffered happens at the fund level and is neither attributable to you nor recoverable by you — a separate topic, covered in the ETF domicile article.`,
      },
      {
        question: `Can a non-traded REIT still make sense for a French individual?`,
        answer: `That's an investment choice question, outside the tax scope covered here — FiscalPlace does not recommend specific securities. What can be said factually: the absence of the organized-market exception on non-traded REITs changes the tax picture on the capital-gain component, worth knowing before comparing one headline yield to another.`,
      },
      {
        question: `Can the 21% FIRPTA rate change?`,
        answer: `Yes: it is tied to the US federal corporate tax rate, itself subject to change under US tax law. This figure is presented as indicative, reviewed as of August 2026, and should be re-checked fund by fund and file by file before anything is filed.`,
      },
    ],
  },
  {
    type: "p",
    text: `The useful habit stays the same: never treat a REIT withholding line as a plain "US dividend" without checking its nature first. [Our guide to reading a brokerage statement](${articleHref("en", BROKER_SLUG.en)}) and [the ranking of cases with nothing to recover](${articleHref("en", NOTHING_TO_RECOVER_SLUG.en)}) usefully round this out.`,
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check my REIT distributions`,
    note: `The simulator handles the ordinary-dividend portion of your distributions; the capital-gain portion needs a dedicated diagnostic.`,
  },
];

export const usReitFirptaWithholding: Article = {
  id: "us-reit-firpta-withholding",
  slug: {
    fr: "reit-americains-piege-retenue-firpta",
    en: "us-reits-firpta-withholding-trap",
  },
  category: "problems",
  title: {
    fr: "REIT américains : pourquoi la retenue à la source n'est pas toujours celle que vous croyez",
    en: "US REITs: why the withholding tax isn't always the one you think",
  },
  description: {
    fr: "Realty Income, Prologis, Simon Property Group : les REIT américains distribuent deux types de revenus soumis à deux régimes de retenue distincts. Le mécanisme FIRPTA vérifié, l'exception qui protège la plupart des petits porteurs, et pourquoi une seule ligne de relevé peut cacher deux réalités fiscales.",
    en: "Realty Income, Prologis, Simon Property Group: US REITs distribute two types of income under two distinct withholding regimes. The verified FIRPTA mechanism, the exception that protects most small holders, and why a single statement line can hide two different tax realities.",
  },
  updated: "2026-08-18",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US"],
};
