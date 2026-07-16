import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { countryHref, href } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — "ETF domicile: Ireland vs the United States". A genuinely
 * distinct topic from the rest of the site: fund-level withholding baked
 * into NAV is, in the Ireland case, structurally NOT a FiscalPlace claim —
 * no line item ever reaches the investor's statement, and the fund (not the
 * investor) was the treaty claimant. The one case that IS in scope (a
 * US-domiciled ETF held directly, no valid W-8BEN) is mechanically identical
 * to the existing US country profile — no new rate is introduced, only
 * `treatyRateFor(us, "FR")` / `us.statutoryRate` already in the database.
 * The US estate-tax aside is flagged as general information, not advice,
 * consistent with the site-wide ban on personalized investment guidance.
 */

const us = getCountryById("US")!;
const ie = getCountryById("IE")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);
const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);

const EXAMPLE_GROSS = 1_000;
const exampleWithheldFull = EXAMPLE_GROSS * us.statutoryRate;
const exampleOwed = EXAMPLE_GROSS * treatyRateFor(us, "FR");
const exampleRecoverable = EXAMPLE_GROSS * (us.statutoryRate - treatyRateFor(us, "FR"));

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Deux ETF qui répliquent le même indice S&P 500 peuvent afficher, après plusieurs années, une performance nette différente — sans que les frais de gestion l'expliquent entièrement. Le domicile juridique du fonds (Irlande ou États-Unis, le plus souvent) détermine une partie de la retenue à la source appliquée aux dividendes sous-jacents, avant même que vous ne perceviez quoi que ce soit. Voici le mécanisme vérifié, et surtout : lequel des deux cas relève réellement d'une récupération possible.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Ce que cet article n'est pas`,
    text: `Ceci n'est pas un conseil en investissement ni une recommandation de choisir tel ou tel ETF : FiscalPlace ne fournit pas de conseil financier personnalisé. C'est une explication d'un mécanisme fiscal, pour vous permettre de lire une fiche produit ou un relevé en connaissance de cause.`,
  },
  { type: "h2", text: `Le point commun : le fonds paie une retenue avant même de vous distribuer quoi que ce soit` },
  {
    type: "p",
    text: `Un ETF qui détient des actions américaines encaisse des dividendes déjà amputés d'une retenue à la source américaine — exactement comme un actionnaire individuel. La différence entre un ETF domicilié aux États-Unis et un ETF domicilié en Irlande ne porte pas sur l'existence de cette retenue, mais sur son taux, sur qui peut agir dessus, et sur sa visibilité pour vous.`,
  },
  { type: "h2", text: `ETF domicilié aux États-Unis : traité exactement comme une action américaine` },
  {
    type: "p",
    text: `Un ETF domicilié aux États-Unis (par exemple un ticker coté au NYSE ou au Nasdaq) est fiscalement transparent de la même manière qu'une action américaine ordinaire pour un actionnaire non-résident : la distribution que vous recevez subit la retenue américaine standard de ${pct(us.statutoryRate, "fr")}, ramenée à ${pct(treatyRateFor(us, "FR"), "fr")} si un W-8BEN valide est enregistré chez votre courtier — **y compris si l'ETF ne détient que des actions non américaines**. Le statut du fonds compte, pas la nationalité de ce qu'il détient.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenue sans W-8BEN valide (${pct(us.statutoryRate, "fr")})`,
    withheldAmount: eur(-exampleWithheldFull, "fr"),
    owedLabel: `Retenue due avec W-8BEN (${pct(treatyRateFor(us, "FR"), "fr")})`,
    owedAmount: eur(-exampleOwed, "fr"),
    treatyRef: `CDI FR-US`,
    recoverLabel: `Trop-perçu récupérable`,
    recoverAmount: eur(exampleRecoverable, "fr"),
    footnote: `Exemple pour ${eur(EXAMPLE_GROSS, "fr")} de distribution brute d'un ETF domicilié aux États-Unis, résident fiscal de France, sans W-8BEN valide en place.`,
  },
  {
    type: "p",
    text: `C'est le seul des deux cas de cet article qui relève d'une récupération possible — et il ne s'agit d'aucun mécanisme nouveau : c'est notre [fiche États-Unis](${countryHref("fr", us.slug.fr)}) telle quelle, formulaires et délais compris.`,
  },
  { type: "h2", text: `ETF domicilié en Irlande : la retenue existe, mais elle est invisible — et non récupérable` },
  {
    type: "p",
    text: `Un ETF « UCITS » domicilié en Irlande (la structure la plus répandue en Europe, y compris pour des ETF distribués par des émetteurs américains) est un résident fiscal irlandais. À ce titre, il bénéficie généralement de la convention fiscale entre l'Irlande et les États-Unis, qui ramène la retenue américaine sur les dividendes encaissés par le fonds à environ ${pct(0.15, "fr")} — contre ${pct(us.statutoryRate, "fr")} sans traité. L'Irlande, de son côté, n'applique en règle générale aucune retenue supplémentaire lorsqu'elle vous distribue (ou capitalise) ces sommes en tant qu'investisseur non-résident.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Pourquoi ce n'est pas un dossier FiscalPlace`,
    text: `Cette retenue d'environ 15 % est prélevée sur le fonds, par le dépositaire américain, avant que la valeur liquidative ne soit calculée. Elle n'apparaît sur aucun relevé, sous aucune ligne « withholding tax » : c'est un coût structurel absorbé dans la performance de l'ETF, au même titre que ses frais de gestion. Personne — ni vous, ni FiscalPlace, ni votre courtier — ne peut déposer de demande de remboursement en votre nom : c'est le fonds, en tant qu'entité juridique irlandaise, qui est le bénéficiaire effectif reconnu par la convention fiscale, pas vous. Un prestataire qui vous propose de « récupérer » cette retenue sur un ETF UCITS vous vend quelque chose qui n'existe pas.`,
  },
  {
    type: "p",
    text: `Pour un résident fiscal français, le calcul reste favorable dans l'absolu — ${pct(0.15, "fr")} embarqués dans un ETF irlandais est proche du ${pct(treatyRateFor(us, "FR"), "fr")} qu'un particulier obtiendrait directement avec un W-8BEN valide sur des actions détenues en direct. L'écart se creuse surtout pour des investisseurs résidents de pays sans convention fiscale avec les États-Unis, pour qui l'alternative directe serait ${pct(us.statutoryRate, "fr")} plein — ce n'est pas le cas d'un résident français.`,
  },
  { type: "h2", text: `Tableau récapitulatif` },
  {
    type: "table",
    caption: `Pour un résident fiscal de France détenant un ETF exposé à des actions américaines.`,
    headers: [``, `ETF domicilié États-Unis`, `ETF UCITS domicilié Irlande`],
    rows: [
      [`Retenue US typique sur les dividendes sous-jacents`, `${formatPercent(us.statutoryRate, "fr", 3)} sans W-8BEN, ${formatPercent(treatyRateFor(us, "FR"), "fr", 3)} avec`, `≈ 15 % au niveau du fonds, quel que soit votre statut`],
      [`Visible sur votre relevé personnel ?`, `Oui — ligne de retenue explicite`, `Non — absorbée dans la valeur liquidative`],
      [`Qui est le bénéficiaire effectif reconnu par le traité ?`, `Vous, directement`, `Le fonds, en tant que résident fiscal irlandais`],
      [`Récupérable via FiscalPlace ?`, `Oui, si retenue au taux plein faute de W-8BEN`, `Non — aucune démarche possible, par personne`],
      [`Autre sujet à connaître`, `Exposition aux droits de succession américains (voir plus bas)`, `Généralement hors du champ des droits de succession américains`],
    ],
  },
  { type: "h2", text: `Un sujet différent, souvent confondu : les droits de succession américains` },
  {
    type: "p",
    text: `Sans lien avec la retenue à la source, mais fréquemment découvert au même moment : un non-résident détenant en direct des titres « de source américaine » — actions ou ETF domiciliés aux États-Unis — peut être exposé aux droits de succession fédéraux américains sur ces actifs, avec un abattement de base historiquement fixé à 60 000 $ (non indexé), bien plus bas que les abattements domestiques américains. La convention fiscale franco-américaine en matière de succession prévoit un mécanisme d'allègement pour les résidents français, mais son calcul est spécifique et sort largement du périmètre de cet article. Un ETF domicilié en Irlande n'est en règle générale pas considéré comme un actif de source américaine à ce titre. **Ce point relève du conseil patrimonial, pas de la récupération de retenue à la source** — nous le mentionnons pour qu'il ne vous surprenne pas, sans prétendre le traiter : un notaire ou un conseiller en gestion de patrimoine habitué aux problématiques transfrontalières est le bon interlocuteur.`,
  },
  { type: "h2", text: `Et les ETF domiciliés ailleurs (Luxembourg, France) ?` },
  {
    type: "p",
    text: `La même logique générale s'applique : un fonds UCITS domicilié au Luxembourg ou en France est le bénéficiaire effectif reconnu par les conventions fiscales sur ce qu'il détient, pas vous. Toute retenue subie par le fonds sur ses positions sous-jacentes est un coût structurel de sa performance, invisible sur votre relevé, et non récupérable par voie individuelle — le même principe que pour un ETF UCITS irlandais.`,
  },
  { type: "h2", text: `Vos questions sur le domicile des ETF` },
  {
    type: "faq",
    items: [
      {
        question: `FiscalPlace peut-il m'aider sur la retenue subie par un ETF UCITS irlandais ?`,
        answer: `Non — et ce n'est le cas d'aucun prestataire : le fonds, pas vous, est le bénéficiaire effectif reconnu par la convention fiscale. Il n'existe aucune démarche individuelle possible sur ce point, par construction.`,
      },
      {
        question: `Et sur un ETF domicilié aux États-Unis que je détiens en direct ?`,
        answer: `Oui, exactement comme pour une action américaine : si la retenue a été prélevée au taux plein faute de W-8BEN valide, l'écart avec le taux conventionnel se récupère par la même voie. Voir la [fiche États-Unis](${countryHref("fr", us.slug.fr)}).`,
      },
      {
        question: `Comment savoir où mon ETF est domicilié ?`,
        answer: `L'information figure dans le KIID/PRIIPs KID ou la fiche produit de l'émetteur (souvent un code ISIN commençant par IE pour l'Irlande, LU pour le Luxembourg, US pour les États-Unis, FR pour la France), et généralement dans le nom légal complet du fonds.`,
      },
      {
        question: `Un ETF irlandais est-il toujours plus avantageux qu'un ETF américain pour un résident français ?`,
        answer: `Sur le seul critère de la retenue à la source américaine, les deux aboutissent à un ordre de grandeur proche pour un résident français correctement documenté (W-8BEN à jour) : environ 15 % dans les deux cas. La différence pratique tient surtout à l'absence de démarche à effectuer côté irlandais, et à l'exposition différente aux droits de succession américains — pas à un écart de taux flagrant comme pour un investisseur d'un pays sans convention fiscale avec les États-Unis.`,
      },
      {
        question: `Cette retenue "invisible" sur un ETF irlandais est-elle illégale ou anormale ?`,
        answer: `Non, aucunement : c'est le fonctionnement normal et documenté d'un fonds UCITS qui investit à l'international. Ce n'est pas un trop-perçu au sens où ce site l'entend pour vos titres détenus en direct — c'est un coût structurel connu, déjà reflété dans la performance historique et les documents réglementaires du fonds.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier mes titres détenus en direct`,
    note: `Le simulateur s'applique à vos actions et ETF détenus en direct, domiciliés aux États-Unis ou dans l'un des 19 pays couverts.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Two ETFs tracking the same S&P 500 index can show, after several years, a different net return — without management fees fully explaining the gap. The fund's legal domicile (Ireland or the United States, most commonly) determines part of the withholding tax applied to the underlying dividends, before you ever receive anything. Here is the verified mechanism — and, crucially, which of the two cases is actually a recoverable claim.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What this article is not`,
    text: `This is not investment advice, nor a recommendation to pick one ETF over another: FiscalPlace does not provide personalized financial advice. It is an explanation of a tax mechanism, so you can read a fund factsheet or a statement with a clearer picture.`,
  },
  { type: "h2", text: `What both have in common: the fund pays withholding before it ever distributes anything to you` },
  {
    type: "p",
    text: `An ETF holding US shares receives dividends already reduced by US withholding tax — exactly like an individual shareholder. The difference between a US-domiciled ETF and an Ireland-domiciled ETF isn't whether this withholding exists, but its rate, who can act on it, and whether you ever see it.`,
  },
  { type: "h2", text: `US-domiciled ETF: treated exactly like a US share` },
  {
    type: "p",
    text: `A US-domiciled ETF (listed on the NYSE or Nasdaq, for instance) is tax-transparent for a non-resident shareholder in the same way an ordinary US share is: the distribution you receive suffers the standard US withholding of ${pct(us.statutoryRate, "en")}, cut to ${pct(treatyRateFor(us, "FR"), "en")} if a valid W-8BEN is on file with your broker — **even if the fund holds only non-US shares**. The fund's own status is what matters, not the nationality of what it holds.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld without a valid W-8BEN (${pct(us.statutoryRate, "en")})`,
    withheldAmount: eur(-exampleWithheldFull, "en"),
    owedLabel: `Owed with a valid W-8BEN (${pct(treatyRateFor(us, "FR"), "en")})`,
    owedAmount: eur(-exampleOwed, "en"),
    treatyRef: `FR-US tax treaty`,
    recoverLabel: `Recoverable over-withholding`,
    recoverAmount: eur(exampleRecoverable, "en"),
    footnote: `Example for ${eur(EXAMPLE_GROSS, "en")} of gross distribution from a US-domiciled ETF, French tax resident, with no valid W-8BEN in place.`,
  },
  {
    type: "p",
    text: `This is the only one of the two cases in this article that is an actual recoverable claim — and it isn't a new mechanism: it's our [United States country page](${countryHref("en", us.slug.en)}) as-is, same forms, same deadlines.`,
  },
  { type: "h2", text: `Ireland-domiciled UCITS ETF: the withholding exists, but it's invisible — and not recoverable` },
  {
    type: "p",
    text: `An Ireland-domiciled "UCITS" ETF (the most common structure in Europe, including for funds issued by US asset managers) is an Irish tax resident. As such, it generally benefits from the tax treaty between Ireland and the United States, which cuts the US withholding on dividends the fund receives to roughly ${pct(0.15, "en")} — versus ${pct(us.statutoryRate, "en")} without a treaty. Ireland, in turn, generally applies no further withholding when it distributes (or accumulates) those proceeds to you as a non-resident investor.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Why this is not a FiscalPlace claim`,
    text: `This roughly 15% withholding is deducted from the fund by the US custodian before net asset value is even calculated. It never appears on any statement, under any "withholding tax" line: it's a structural cost absorbed into the ETF's performance, the same way its management fee is. Nobody — not you, not FiscalPlace, not your broker — can file a refund claim on your behalf: the fund itself, as an Irish legal entity, is the beneficial owner recognized under the tax treaty, not you. A provider offering to "recover" this withholding on a UCITS ETF is selling you something that does not exist.`,
  },
  {
    type: "p",
    text: `For a French tax resident, the math still works out reasonably in absolute terms — a ${pct(0.15, "en")} embedded rate in an Irish ETF is close to the ${pct(treatyRateFor(us, "FR"), "en")} an individual would get directly with a valid W-8BEN on shares held outright. The gap widens mainly for investors resident in countries with no US tax treaty, for whom the direct alternative would be the full ${pct(us.statutoryRate, "en")} — not the case for a French resident.`,
  },
  { type: "h2", text: `Summary table` },
  {
    type: "table",
    caption: `For a French tax resident holding a US-equity-exposed ETF.`,
    headers: [``, `US-domiciled ETF`, `Ireland-domiciled UCITS ETF`],
    rows: [
      [`Typical US withholding on underlying dividends`, `${formatPercent(us.statutoryRate, "en", 3)} without a W-8BEN, ${formatPercent(treatyRateFor(us, "FR"), "en", 3)} with one`, `≈ 15% at fund level, regardless of your own status`],
      [`Visible on your personal statement?`, `Yes — explicit withholding line`, `No — absorbed into net asset value`],
      [`Who is the treaty-recognized beneficial owner?`, `You, directly`, `The fund, as an Irish tax resident`],
      [`Recoverable via FiscalPlace?`, `Yes, if withheld at the full rate for lack of a W-8BEN`, `No — no claim route exists, for anyone`],
      [`Other point worth knowing`, `Exposure to US estate tax (see below)`, `Generally outside the scope of US estate tax`],
    ],
  },
  { type: "h2", text: `A different, often-confused topic: US estate tax` },
  {
    type: "p",
    text: `Unrelated to withholding tax, but often discovered at the same time: a non-resident holding US-situs assets directly — US shares or US-domiciled ETFs — can be exposed to US federal estate tax on those assets, with a base exemption historically set at $60,000 (not inflation-indexed), far below domestic US exemptions. The France-US estate tax treaty provides a relief mechanism for French residents, but its calculation is specific and well beyond the scope of this article. An Ireland-domiciled ETF is generally not treated as a US-situs asset for this purpose. **This is a wealth-planning question, not a withholding-tax recovery one** — we mention it so it doesn't catch you by surprise, without attempting to cover it here: a notary or a wealth advisor experienced in cross-border matters is the right person to ask.`,
  },
  { type: "h2", text: `What about ETFs domiciled elsewhere (Luxembourg, France)?` },
  {
    type: "p",
    text: `The same general logic applies: a UCITS fund domiciled in Luxembourg or France is the treaty-recognized beneficial owner on what it holds, not you. Any withholding the fund suffers on its underlying positions is a structural cost of its performance, invisible on your statement, and not recoverable on an individual basis — the same principle as for an Ireland-domiciled UCITS ETF.`,
  },
  { type: "h2", text: `Your questions about ETF domicile` },
  {
    type: "faq",
    items: [
      {
        question: `Can FiscalPlace help with the withholding an Ireland-domiciled UCITS ETF suffers?`,
        answer: `No — and no provider can: the fund, not you, is the treaty-recognized beneficial owner. No individual claim route exists on this point, by construction.`,
      },
      {
        question: `What about a US-domiciled ETF I hold directly?`,
        answer: `Yes, exactly like a US share: if it was withheld at the full rate for lack of a valid W-8BEN, the gap with the treaty rate is recoverable the same way. See the [United States country page](${countryHref("en", us.slug.en)}).`,
      },
      {
        question: `How do I find out where my ETF is domiciled?`,
        answer: `It's stated in the KIID/PRIIPs KID or the issuer's factsheet (often reflected in an ISIN starting with IE for Ireland, LU for Luxembourg, US for the United States, FR for France), and usually in the fund's full legal name.`,
      },
      {
        question: `Is an Irish ETF always better than a US one for a French resident?`,
        answer: `On the US-withholding criterion alone, both land in a similar range for a properly documented French resident (valid W-8BEN): roughly 15% either way. The practical difference is mostly the absence of any paperwork on the Irish side, and different exposure to US estate tax — not a stark rate gap like for an investor from a country with no US tax treaty.`,
      },
      {
        question: `Is this "invisible" withholding on an Irish ETF illegal or unusual?`,
        answer: `Not at all: it's the normal, well-documented functioning of a UCITS fund investing internationally. It isn't an over-withholding in the sense this site uses for shares you hold directly — it's a known structural cost, already reflected in the fund's historical performance and regulatory documents.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check my directly-held shares`,
    note: `The simulator applies to shares and ETFs you hold directly, domiciled in the US or any of the 19 countries covered.`,
  },
];

export const etfDomicileIrelandVsUs: Article = {
  id: "etf-domicile-ireland-vs-us",
  slug: {
    fr: "etf-domicile-irlande-ou-etats-unis",
    en: "etf-domicile-ireland-or-united-states",
  },
  category: "comparisons",
  title: {
    fr: "ETF domicilié en Irlande ou aux États-Unis : quel impact sur la retenue à la source",
    en: "ETF domicile: Ireland or the United States — the withholding tax impact",
  },
  description: {
    fr: "Un ETF domicilié aux États-Unis se traite comme une action américaine — récupérable si mal documenté. Un ETF UCITS irlandais absorbe une retenue invisible d'environ 15 %, jamais récupérable par personne. Le mécanisme vérifié, et lequel des deux vous concerne.",
    en: "A US-domiciled ETF is treated like a US share — recoverable if under-documented. An Irish UCITS ETF absorbs an invisible ~15% withholding that nobody can ever reclaim. The verified mechanism, and which one applies to you.",
  },
  updated: "2025-08-14",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US", "IE"],
};
