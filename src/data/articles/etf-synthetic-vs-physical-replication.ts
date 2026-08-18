import { formatPercent, type Locale } from "@/lib/i18n";
import { articleHref } from "@/lib/routes";
import { getCountryById } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "Synthetic vs physical replication ETFs: the withholding
 * you'll never see on your statement". Distinct axis from
 * `etf-domicile-ireland-vs-us` (domicile of the fund) — this one is about
 * the fund's *replication method* (physical holdings vs total-return swap).
 * Neither case is a FiscalPlace claim: physical funds are their own treaty
 * claimant (same point as the domicile article, referenced rather than
 * repeated); synthetic funds simply never suffer the withholding to begin
 * with. The 871(m)/HIRE Act mechanism and the ~20-25bp S&P 500 performance
 * gap are sourced facts (justETF, Invesco, Amundi, Bogleheads), phrased with
 * "en règle générale" / "à vérifier selon l'indice" per the site's
 * anti-fabrication guardrails since eligibility depends on the specific
 * index's liquidity/diversification tests, not a number in our database.
 */

const us = getCountryById("US")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 2);

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Deux ETF qui répliquent le même indice S&P 500, avec le même TER affiché, peuvent afficher une performance annualisée différente de 0,20 à 0,25 point sur plusieurs années — sans qu'aucune ligne de frais ne l'explique. La cause n'est ni le domicile du fonds, ni sa qualité de gestion : c'est sa **méthode de réplication**. Un ETF qui détient réellement les actions sous-jacentes encaisse des dividendes déjà amputés d'une retenue à la source ; un ETF qui réplique l'indice via un contrat de swap peut, dans certains cas, y échapper presque entièrement. Voici le mécanisme vérifié — et pourquoi, dans les deux cas, il ne s'agit d'un dossier récupérable pour personne.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Ce que cet article n'est pas`,
    text: `Ceci n'est pas un conseil en investissement ni une recommandation de choisir un ETF synthétique plutôt que physique : ces derniers comportent d'autres arbitrages (risque de contrepartie notamment) qui dépassent le sujet fiscal traité ici, et FiscalPlace ne fournit pas de conseil financier personnalisé. C'est une explication d'un mécanisme, pour lire une fiche produit en connaissance de cause.`,
  },
  { type: "h2", text: `Réplication physique : le fonds subit la retenue, exactement comme vous le feriez` },
  {
    type: "p",
    text: `Un ETF à réplication physique achète réellement les actions de l'indice qu'il suit. S'il détient des actions américaines, il encaisse leurs dividendes déjà amputés de la retenue à la source américaine — selon son propre domicile fiscal, généralement ${pct(0.15, "fr")} pour un fonds UCITS irlandais (le cas le plus répandu en Europe) ou jusqu'à ${pct(us.statutoryRate, "fr")} pour un fonds domicilié ailleurs. Ce mécanisme, et pourquoi il n'est récupérable par personne dans ce cas, fait l'objet d'un article dédié : [ETF domicilié en Irlande ou aux États-Unis](${articleHref("fr", "etf-domicile-irlande-ou-etats-unis")}). Le point à retenir ici : quel que soit le domicile, un fonds à réplication **physique** paie cette retenue en tant que bénéficiaire effectif reconnu par les conventions fiscales — pas vous, jamais vous.`,
  },
  { type: "h2", text: `Réplication synthétique : le fonds ne détient pas les actions, un swap lui verse le rendement` },
  {
    type: "p",
    text: `Un ETF à réplication synthétique ne détient pas — ou pas directement — les titres de l'indice qu'il affiche. Il conclut un contrat d'échange (« total return swap ») avec une contrepartie, le plus souvent une grande banque d'investissement : celle-ci s'engage à lui verser la performance totale de l'indice, dividendes compris, en échange d'une commission de swap et du rendement d'un panier de garantie (collatéral) détenu par le fonds. Aucune action américaine ne transite jamais par le bilan du fonds — donc, en principe, aucune retenue à la source américaine n'est prélevée sur le chemin.`,
  },
  {
    type: "callout",
    tone: "example",
    title: `La règle américaine qui rend cela possible`,
    text: `Aux États-Unis, la section 871(m) de l'Internal Revenue Code (introduite par le HIRE Act de 2010) impose en principe une retenue sur les paiements assimilés à des dividendes versés dans le cadre d'un swap — mais exempte les swaps adossés à un indice suffisamment large et liquide (répondant à des critères de diversification et de profondeur de marché à terme). En règle générale, un swap sur un indice large comme le S&P 500 entre dans cette exemption ; un swap construit sur un panier étroit ou peu liquide peut ne pas en bénéficier. Le traitement exact dépend de l'indice précis et peut évoluer avec la réglementation américaine — à vérifier fonds par fonds, ce n'est pas une règle universelle pour « tout ETF synthétique ».`,
  },
  {
    type: "p",
    text: `Dans le cas où l'exemption s'applique, un ETF synthétique peut ainsi capter une part nettement plus proche de 100 % du rendement brut de l'indice, dividendes compris, là où un fonds physique domicilié en Europe plafonne structurellement autour de 85 % sur la seule composante dividendes de source américaine (l'écart correspondant à la retenue de ${pct(0.15, "fr")} évoquée plus haut).`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Pourquoi ce n'est un dossier FiscalPlace dans aucun des deux cas`,
    text: `Côté physique : la retenue existe, mais c'est le fonds — pas vous — qui est le bénéficiaire effectif reconnu par le traité fiscal ; personne ne peut déposer de demande en votre nom (détail dans l'article sur le domicile des ETF). Côté synthétique : il n'y a tout simplement rien à récupérer, puisque rien n'a été retenu — l'avantage vient d'une exemption structurelle au niveau du swap, pas d'un trop-perçu qui vous reviendrait. Dans les deux cas, la retenue (ou son absence) est un paramètre de construction du produit, invisible sur votre relevé de courtier et déjà reflété dans la performance historique publiée du fonds.`,
  },
  { type: "h2", text: `Le vrai prix de l'avantage synthétique : ce que le gain en dividendes ne montre pas` },
  {
    type: "p",
    text: `Un ETF synthétique n'est pas gratuit pour autant. Il facture généralement une commission de swap, distincte du TER affiché, et surtout il expose l'investisseur à un **risque de contrepartie** : si la banque contrepartie du swap fait défaut, le fonds pourrait ne pas recevoir la performance promise. La réglementation UCITS encadre ce risque — exposition à une seule contrepartie plafonnée, collatéralisation du swap, et la plupart des grands émetteurs utilisent aujourd'hui plusieurs contreparties en parallèle plutôt qu'une seule — mais ce risque reste structurellement différent de celui d'un fonds physique, qui détient directement les titres sous-jacents. Comparer deux ETF sur le seul écart de performance lié aux dividendes, sans regarder ces deux points, donne une image incomplète.`,
  },
  { type: "h2", text: `Tableau récapitulatif` },
  {
    type: "table",
    caption: `Pour un ETF exposé à des actions américaines, quel que soit son domicile.`,
    headers: [``, `Réplication physique`, `Réplication synthétique`],
    rows: [
      [`Détient les actions sous-jacentes ?`, `Oui, directement`, `Non — expose via un contrat de swap`],
      [`Retenue US sur les dividendes sous-jacents`, `Oui — jusqu'à ${pct(us.statutoryRate, "fr")}, généralement ${pct(0.15, "fr")} si le fonds est domicilié en Irlande`, `Généralement évitée pour un swap sur indice large et liquide (à vérifier selon l'indice)`],
      [`Visible sur votre relevé personnel ?`, `Non — absorbée dans la valeur liquidative`, `Sans objet — rien n'est prélevé`],
      [`Récupérable via FiscalPlace ?`, `Non — le fonds est le bénéficiaire effectif du traité, pas vous`, `Non — rien n'a été retenu, il n'existe rien à récupérer`],
      [`Coût ou risque spécifique à surveiller`, `Aucun coût caché lié à la retenue au-delà du TER`, `Commission de swap distincte du TER, risque de contrepartie encadré par la réglementation UCITS`],
    ],
  },
  { type: "h2", text: `Vos questions sur la réplication des ETF` },
  {
    type: "faq",
    items: [
      {
        question: `FiscalPlace peut-il m'aider si mon ETF physique a subi une retenue à la source ?`,
        answer: `Non — dans aucun cas où c'est le fonds, et non vous, qui détient les titres. Voir l'article sur le [domicile des ETF](${articleHref("fr", "etf-domicile-irlande-ou-etats-unis")}) pour le détail du mécanisme et la seule exception (un ETF domicilié aux États-Unis détenu en direct sans W-8BEN valide, traité comme une action ordinaire).`,
      },
      {
        question: `Un ETF synthétique est-il toujours plus avantageux fiscalement qu'un ETF physique ?`,
        answer: `Sur la seule composante retenue à la source, souvent oui pour une exposition aux actions américaines via un indice large — mais ce n'est pas garanti pour tout indice, et l'avantage doit se comparer à la commission de swap et au risque de contrepartie, pas seulement à l'écart de performance passé.`,
      },
      {
        question: `Comment savoir si mon ETF est à réplication physique ou synthétique ?`,
        answer: `L'information figure dans le KIID/PRIIPs KID et la fiche produit de l'émetteur, généralement dans les premières lignes de la description de la méthode de réplication ; les fonds synthétiques mentionnent explicitement un « swap » ou une réplication « indirecte » ou « optimisée par swap ».`,
      },
      {
        question: `Cet avantage fiscal des ETF synthétiques est-il un abus ou un montage limite ?`,
        answer: `Non : c'est un mécanisme documenté, encadré par la réglementation américaine elle-même (section 871(m) et son exemption pour les indices larges et liquides) et par la réglementation UCITS côté européen pour le risque de contrepartie. Ce n'est pas comparable aux montages d'arbitrage de dividendes (« CumCum/CumEx ») visés par les renforcements anti-abus récents, qui concernent des schémas différents.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier mes titres détenus en direct`,
    note: `Le simulateur s'applique à vos actions et ETF détenus en direct — pas aux titres détenus à l'intérieur d'un fonds, physique ou synthétique.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Two ETFs tracking the same S&P 500 index, with the same headline TER, can show a 0.20 to 0.25 percentage point difference in annualized return over several years — with no fee line explaining it. The cause is neither the fund's domicile nor its management quality: it's its **replication method**. An ETF that actually holds the underlying shares receives dividends already reduced by withholding tax; an ETF that replicates the index through a swap contract can, in some cases, largely avoid it. Here is the verified mechanism — and why, either way, it isn't a recoverable claim for anyone.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What this article is not`,
    text: `This is not investment advice, nor a recommendation to pick a synthetic ETF over a physical one: synthetic funds carry other trade-offs (notably counterparty risk) beyond the tax point covered here, and FiscalPlace does not provide personalized financial advice. It is an explanation of a mechanism, so you can read a fund factsheet with a clearer picture.`,
  },
  { type: "h2", text: `Physical replication: the fund bears the withholding, exactly as you would` },
  {
    type: "p",
    text: `A physically-replicating ETF genuinely buys the shares of the index it tracks. If it holds US shares, it receives their dividends already reduced by US withholding tax — depending on its own tax domicile, typically ${pct(0.15, "en")} for an Irish-domiciled UCITS fund (the most common case in Europe) or up to ${pct(us.statutoryRate, "en")} for a fund domiciled elsewhere. This mechanism, and why it's not recoverable by anyone in this case, is covered in a dedicated article: [ETF domicile: Ireland or the United States](${articleHref("en", "etf-domicile-ireland-or-united-states")}). The point to take from it here: regardless of domicile, a **physically**-replicating fund pays this withholding as the treaty-recognized beneficial owner — not you, ever.`,
  },
  { type: "h2", text: `Synthetic replication: the fund doesn't hold the shares, a swap pays it the return` },
  {
    type: "p",
    text: `A synthetically-replicating ETF doesn't hold — or not directly — the securities of the index it displays. It enters into a total return swap with a counterparty, usually a large investment bank: the counterparty agrees to pay the fund the index's total return, dividends included, in exchange for a swap fee and the return on a collateral basket held by the fund. No US shares ever pass through the fund's balance sheet — so, in principle, no US withholding tax gets deducted along the way.`,
  },
  {
    type: "callout",
    tone: "example",
    title: `The US rule that makes this possible`,
    text: `In the United States, section 871(m) of the Internal Revenue Code (introduced by the 2010 HIRE Act) generally imposes withholding on dividend-equivalent payments made under a swap — but exempts swaps referencing an index that is sufficiently broad and liquid (meeting diversification and futures-market-depth tests). As a general rule, a swap on a broad index like the S&P 500 falls within this exemption; a swap built on a narrow or illiquid basket may not. The exact treatment depends on the specific index and can shift with US regulation — worth checking fund by fund, not a blanket rule for "any synthetic ETF."`,
  },
  {
    type: "p",
    text: `Where the exemption applies, a synthetic ETF can capture a share of the index's gross return, dividends included, much closer to 100% — versus a European-domiciled physical fund structurally capped at roughly 85% on the US-dividend component alone (the gap matching the ${pct(0.15, "en")} withholding mentioned above).`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Why this isn't a FiscalPlace claim either way`,
    text: `On the physical side: the withholding exists, but the fund — not you — is the treaty-recognized beneficial owner; nobody can file a claim on your behalf (detail in the ETF domicile article). On the synthetic side: there's simply nothing to recover, since nothing was withheld — the advantage comes from a structural exemption at the swap level, not from an over-withholding owed back to you. Either way, the withholding (or its absence) is a product-construction parameter, invisible on your broker statement and already reflected in the fund's published historical performance.`,
  },
  { type: "h2", text: `The real price of the synthetic advantage: what the dividend gain doesn't show` },
  {
    type: "p",
    text: `A synthetic ETF isn't free, though. It typically charges a swap fee, separate from the headline TER, and — more importantly — exposes the investor to **counterparty risk**: if the bank on the other side of the swap defaults, the fund might not receive the promised return. UCITS rules constrain this risk — exposure to a single counterparty is capped, the swap is collateralized, and most major issuers now spread exposure across several counterparties rather than one — but this risk remains structurally different from a physical fund, which holds the underlying securities directly. Comparing two ETFs purely on the dividend-related performance gap, without looking at these two points, gives an incomplete picture.`,
  },
  { type: "h2", text: `Summary table` },
  {
    type: "table",
    caption: `For an ETF with US-equity exposure, regardless of domicile.`,
    headers: [``, `Physical replication`, `Synthetic replication`],
    rows: [
      [`Holds the underlying shares?`, `Yes, directly`, `No — gains exposure via a swap contract`],
      [`US withholding on underlying dividends`, `Yes — up to ${pct(us.statutoryRate, "en")}, typically ${pct(0.15, "en")} for an Ireland-domiciled fund`, `Generally avoided for a swap on a broad, liquid index (check per index)`],
      [`Visible on your personal statement?`, `No — absorbed into net asset value`, `Not applicable — nothing is deducted`],
      [`Recoverable via FiscalPlace?`, `No — the fund is the treaty beneficial owner, not you`, `No — nothing was withheld, there's nothing to recover`],
      [`Specific cost or risk to watch`, `No hidden cost beyond the TER related to withholding`, `Swap fee separate from the TER, counterparty risk constrained by UCITS rules`],
    ],
  },
  { type: "h2", text: `Your questions about ETF replication` },
  {
    type: "faq",
    items: [
      {
        question: `Can FiscalPlace help if my physical ETF suffered withholding tax?`,
        answer: `No — not in any case where the fund, not you, holds the securities. See the [ETF domicile article](${articleHref("en", "etf-domicile-ireland-or-united-states")}) for the full mechanism and the one exception (a US-domiciled ETF held directly with no valid W-8BEN, treated like an ordinary share).`,
      },
      {
        question: `Is a synthetic ETF always more tax-efficient than a physical one?`,
        answer: `On the withholding-tax component alone, often yes for US-equity exposure through a broad index — but it isn't guaranteed for every index, and the advantage should be weighed against the swap fee and counterparty risk, not just the historical performance gap.`,
      },
      {
        question: `How do I know if my ETF uses physical or synthetic replication?`,
        answer: `It's stated in the KIID/PRIIPs KID and the issuer's factsheet, usually in the first lines describing the replication method; synthetic funds explicitly mention a "swap" or "indirect" / "swap-based" replication.`,
      },
      {
        question: `Is this tax advantage for synthetic ETFs some kind of abuse or grey-area scheme?`,
        answer: `No: it's a documented mechanism, governed by US regulation itself (section 871(m) and its exemption for broad, liquid indices) and by UCITS rules on the European side for counterparty risk. It isn't comparable to dividend-arbitrage schemes ("cum-cum"/"cum-ex") targeted by recent anti-abuse tightening, which involve different setups.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check my directly-held shares`,
    note: `The simulator applies to shares and ETFs you hold directly — not to securities held inside a fund, physical or synthetic.`,
  },
];

export const etfSyntheticVsPhysicalReplication: Article = {
  id: "etf-synthetic-vs-physical-replication",
  slug: {
    fr: "etf-replication-synthetique-ou-physique",
    en: "etf-synthetic-or-physical-replication",
  },
  category: "problems",
  title: {
    fr: "ETF à réplication synthétique ou physique : la retenue à la source que votre relevé ne montrera jamais",
    en: "Synthetic vs physical replication ETFs: the withholding tax your statement will never show",
  },
  description: {
    fr: "Un ETF physique subit la retenue à la source sur ses dividendes sous-jacents ; un ETF synthétique, adossé à un swap, peut l'éviter presque entièrement. Le mécanisme vérifié (section 871(m), HIRE Act), son vrai coût, et pourquoi ce n'est un dossier récupérable dans aucun des deux cas.",
    en: "A physical ETF bears withholding tax on its underlying dividends; a synthetic, swap-based ETF can largely avoid it. The verified mechanism (section 871(m), HIRE Act), its real cost, and why it isn't a recoverable claim either way.",
  },
  updated: "2026-08-14",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US"],
};
