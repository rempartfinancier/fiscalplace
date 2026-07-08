import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { COUNTRIES, getCountryById, treatyRateFor } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — "FiscalPlace vs your broker or custodian".
 * Every rate and price below is computed from @/data/countries and
 * @/config/pricing at module load; nothing is restated by hand.
 */

const us = getCountryById("US")!;
const ch = getCountryById("CH")!;
const ie = getCountryById("IE")!;

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

const usStatutory = { fr: pct(us.statutoryRate, "fr"), en: pct(us.statutoryRate, "en") };
const usTreaty = {
  fr: pct(treatyRateFor(us, "FR"), "fr"),
  en: pct(treatyRateFor(us, "FR"), "en"),
};

const tiers = PRICING.successFeeTiers;
const topRate = { fr: pct(tiers[0].rate, "fr"), en: pct(tiers[0].rate, "en") };
const bottomRate = {
  fr: pct(tiers[tiers.length - 1].rate, "fr"),
  en: pct(tiers[tiers.length - 1].rate, "en"),
};
const countryCount = COUNTRIES.length;

/* Canonical slugs of sibling articles referenced below. */
const BEST_COUNTRIES_SLUG = {
  fr: "meilleurs-pays-recuperation-resident-francais",
  en: "best-countries-for-recovery-french-resident",
} as const;
const DIY_SLUG = {
  fr: "faire-soi-meme-vs-deleguer-remboursement",
  en: "diy-vs-delegating-your-refund-claim",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `« Mon courtier ne s'occupe pas déjà de ça ? » C'est la question qu'on nous pose le plus souvent — et elle mérite une réponse précise plutôt qu'un argument commercial. La réponse courte : votre courtier **applique** la retenue, il ne la **récupère** pas. La réponse complète est ci-dessous : le rôle exact de chaque acteur, la place des spécialistes historiques du secteur, les cas où vous n'avez besoin de personne — et un tableau comparatif.`,
  },
  { type: "h2", text: `Ce que fait réellement votre courtier ou dépositaire` },
  {
    type: "p",
    text: `Quand un dividende étranger arrive sur votre compte, votre courtier est le dernier maillon d'une chaîne de dépositaires. Son métier : encaisser, convertir le cas échéant, créditer votre compte — et appliquer la retenue que la chaîne lui transmet. En matière fiscale, deux services peuvent exister chez lui, très inégalement répandus :`,
  },
  {
    type: "ul",
    items: [
      `**Le relief at source** — le taux réduit appliqué dès le versement. Courant pour les [États-Unis](${countryHref("fr", us.slug.fr)}) : le W-8BEN que votre courtier vous fait signer ramène la retenue de ${usStatutory.fr} à ${usTreaty.fr}. Possible mais aléatoire sur d'autres marchés (Canada, Australie), selon le paramétrage de la chaîne de dépositaires. Et structurellement impossible pour un particulier en [Suisse](${countryHref("fr", ch.slug.fr)}), quel que soit le courtier.`,
      `**La récupération a posteriori (reclaim)** — réclamer au fisc étranger ce qui a déjà été prélevé en trop. C'est l'exception : quelques banques privées le proposent à leurs clients, souvent facturé et limité à certains marchés. Chez les courtiers en ligne grand public, ce service n'existe généralement pas.`,
    ],
  },
  {
    type: "callout",
    tone: "example",
    title: `Le cas où votre courtier suffit`,
    text: `Vous ne détenez que des actions américaines et votre W-8BEN est valide ? Le taux conventionnel de ${usTreaty.fr} s'applique dès le versement : il n'y a rien à récupérer, et rien à nous confier. Surveillez seulement l'expiration — le W-8BEN cesse d'être valable à la fin de la troisième année civile suivant sa signature.`,
  },
  { type: "h2", text: `À qui appartient la responsabilité de récupérer ?` },
  {
    type: "p",
    text: `À vous — et c'est le point que presque personne ne lit dans ses conditions générales. En règle générale, les CGU des courtiers ne prévoient aucune obligation de récupérer la retenue étrangère : l'établissement s'engage à appliquer les taux que ses propres dépositaires lui transmettent, pas à vérifier qu'ils correspondent à votre convention fiscale, ni à réclamer le trop-perçu. Le droit au remboursement vous appartient personnellement, face à l'administration étrangère — et il s'éteint aux échéances de prescription, que personne ne surveille pour vous par défaut.`,
  },
  {
    type: "p",
    text: `Ce n'est pas un scandale, c'est une répartition des rôles : le courtier vend l'exécution des ordres et la garde des titres. La réconciliation fiscale internationale est un autre métier — le nôtre. Les deux sont complémentaires : nous travaillons à partir des relevés que votre courtier vous fournit, sans jamais toucher à vos comptes ni à vos titres.`,
  },
  { type: "h2", text: `WTax, GlobeTax : pourquoi les spécialistes historiques servent les institutions` },
  {
    type: "p",
    text: `La récupération de retenue à la source n'est pas un métier nouveau. Des acteurs comme **WTax** ou **GlobeTax** le pratiquent à grande échelle depuis des années et font référence sur le marché institutionnel : fonds de pension, sociétés de gestion, dépositaires eux-mêmes. Si vous gérez un fonds, ce sont des interlocuteurs sérieux — nous ne prétendrons pas le contraire.`,
  },
  {
    type: "p",
    text: `Leur modèle est simplement construit pour d'autres volumes que les vôtres : intégrations avec les conservateurs, dossiers portant sur des milliers de lignes, contrats négociés institution par institution. Un particulier avec quelques centaines ou milliers d'euros de trop-perçu n'est pas leur client type — non par mépris, mais parce que leur structure de coûts est calibrée pour l'institutionnel. C'est un choix de marché rationnel. Il laisse une place vide : celle de l'investisseur en direct. C'est la nôtre.`,
  },
  { type: "h2", text: `Notre positionnement : le spécialiste des investisseurs en direct` },
  {
    type: "p",
    text: `FiscalPlace est construit pour les particuliers et les petites structures qui investissent en direct : diagnostic self-service par le [simulateur](${href("fr", "simulator")}), [grille de commission 100 % publique](${href("fr", "pricing")}) — marginale par tranche, de ${topRate.fr} à ${bottomRate.fr} selon le montant récupéré, plancher ${eur(PRICING.floorFee, "fr")}, plafond ${eur(PRICING.capFee, "fr")} — et une règle sans exception : pas de récupération, pas de commission. Au-delà de ${eur(PRICING.institutionalThreshold, "fr")} récupérés, le dossier bascule sur devis : à ce niveau, vous ressemblez déjà à un client institutionnel, et nous vous le dirons.`,
  },
  {
    type: "p",
    text: `Pour les conseillers en gestion de patrimoine et les family offices qui veulent proposer le service à leurs clients, un [programme partenaire en marque blanche](${href("fr", "whiteLabel")}) existe — avec une rétrocession de ${formatPercent(PRICING.partnerRevShare, "fr")} de la commission effectivement encaissée, publiée comme le reste de nos tarifs.`,
  },
  { type: "h2", text: `Le tableau comparatif` },
  {
    type: "table",
    caption: `Comparaison indicative, établie de notre point de vue — vérifiez les conditions propres à votre établissement. Données revues en juin 2026.`,
    headers: [`Critère`, `Votre courtier / dépositaire`, `Spécialistes institutionnels (WTax, GlobeTax…)`, `FiscalPlace`],
    rows: [
      [
        `Client visé`,
        `Vous — pour l'exécution et la garde des titres`,
        `Fonds, sociétés de gestion, dépositaires`,
        `Particuliers et petites structures en direct`,
      ],
      [
        `Relief at source`,
        `Parfois — W-8BEN américain surtout`,
        `Oui, via les chaînes de conservation`,
        `Oui — W-8BEN, [exonération irlandaise](${countryHref("fr", ie.slug.fr)}), dossiers de prévention`,
      ],
      [
        `Récupération a posteriori`,
        `Rarement — parfois en banque privée, facturée`,
        `Oui, cœur de métier institutionnel`,
        `Oui, cœur de métier — ${countryCount} pays couverts`,
      ],
      [
        `Tarification`,
        `Selon l'établissement, rarement publiée`,
        `Négociée au cas par cas, non publique`,
        `Grille publique au succès, plancher ${eur(PRICING.floorFee, "fr")}, plafond ${eur(PRICING.capFee, "fr")}`,
      ],
      [
        `Suivi des prescriptions`,
        `Non`,
        `Pour leurs clients sous contrat`,
        `Oui — échéance calculée par dossier, alertes en option`,
      ],
      [
        `Si la demande échoue`,
        `Sans objet`,
        `Selon contrat`,
        `0 € de commission`,
      ],
    ],
  },
  { type: "h2", text: `Les cas où vous n'avez pas besoin de nous` },
  {
    type: "p",
    text: `Un comparatif honnête liste aussi les cases vides. Les voici :`,
  },
  {
    type: "ul",
    items: [
      `**Actions américaines avec W-8BEN valide** : le bon taux s'applique déjà à la source, il n'y a rien à récupérer a posteriori.`,
      `**Portefeuille 100 % Royaume-Uni ou Pays-Bas** : pour un particulier résident de France, il n'y a en général rien à récupérer sur ces marchés — [notre classement des pays](${articleHref("fr", BEST_COUNTRIES_SLUG.fr)}) l'assume noir sur blanc.`,
      `**Dividendes australiens fully franked** : aucune retenue n'est prélevée sur ces distributions, donc rien à réclamer.`,
      `**Votre banque privée inclut déjà la récupération** : comparez sa facturation réelle à notre grille avant de changer quoi que ce soit — si son service est compris dans des frais que vous payez déjà, gardez-le.`,
      `**Petit dossier, un seul pays, du temps devant vous** : le faire vous-même est souvent le meilleur choix — [on vous explique même comment arbitrer](${articleHref("fr", DIY_SLUG.fr)}).`,
    ],
  },
  { type: "h2", text: `Vos questions sur les courtiers et dépositaires` },
  {
    type: "faq",
    items: [
      {
        question: `Mon courtier affiche « gestion fiscale incluse » : que vérifier concrètement ?`,
        answer: `Trois choses. Un : applique-t-il le taux conventionnel dès le versement, pays par pays — comparez sur vos relevés le taux réellement retenu au taux de la convention. Deux : propose-t-il une récupération a posteriori du trop-perçu passé, et à quel prix. Trois : qui surveille vos délais de prescription. Dans la grande majorité des cas, la réponse honnête se résume au relief at source américain via W-8BEN — et à rien d'autre.`,
      },
      {
        question: `Puis-je exiger de mon courtier qu'il récupère la retenue à ma place ?`,
        answer: `Sauf engagement contractuel spécifique, non : ce n'est pas une obligation de sa part. En revanche, il est tenu de vous fournir vos propres justificatifs — relevés, tax vouchers, attestations de détention. C'est tout ce dont une récupération a besoin de sa part, que vous la fassiez vous-même ou que vous nous la confiiez.`,
      },
      {
        question: `Êtes-vous concurrents des courtiers ?`,
        answer: `Non, complémentaires : nous ne gardons pas de titres, ne passons pas d'ordres et ne touchons jamais à vos comptes. Nous travaillons à partir des relevés que votre courtier vous fournit, et rien ne change chez lui quand vous nous mandatez. Le seul document qui circule est un mandat pour agir auprès des administrations fiscales étrangères.`,
      },
      {
        question: `Êtes-vous moins chers que WTax ou GlobeTax ?`,
        answer: `Impossible à affirmer sérieusement : leurs tarifs institutionnels sont négociés au cas par cas et ne sont pas publics, toute comparaison chiffrée serait donc inventée. Ce que nous pouvons affirmer : notre grille est publique, vérifiable avant tout engagement, et conçue pour des dossiers de particuliers — un segment qui n'est pas leur cœur de cible.`,
      },
      {
        question: `Changer de courtier ferait-il disparaître mon trop-perçu ?`,
        answer: `Non : le droit au remboursement porte sur les dividendes déjà encaissés et vous suit personnellement. Il faudra en revanche pouvoir produire les relevés et justificatifs de l'ancien compte — récupérez-les avant la clôture, c'est toujours plus simple que de les redemander après.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "pricing",
    label: `Comparer avec notre grille publique`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `"Doesn't my broker already handle this?" It's the question we hear most — and it deserves a precise answer rather than a sales pitch. The short version: your broker **applies** the withholding, it doesn't **recover** it. The full version is below: each player's actual role, where the sector's historical specialists fit, the cases where you need nobody at all — and a comparison table.`,
  },
  { type: "h2", text: `What your broker or custodian actually does` },
  {
    type: "p",
    text: `When a foreign dividend reaches your account, your broker is the last link in a chain of custodians. Its job: collect, convert where needed, credit your account — and apply the withholding rate the chain passes down. On the tax side, two services may exist, very unevenly available:`,
  },
  {
    type: "ul",
    items: [
      `**Relief at source** — the reduced rate applied at payment time. Common for the [United States](${countryHref("en", us.slug.en)}): the W-8BEN your broker has you sign cuts withholding from ${usStatutory.en} to ${usTreaty.en}. Possible but hit-and-miss on other markets (Canada, Australia), depending on how the custody chain is configured. And structurally impossible for an individual in [Switzerland](${countryHref("en", ch.slug.en)}), whoever your broker is.`,
      `**After-the-fact recovery (reclaim)** — claiming back from the foreign tax authority what was already over-withheld. This is the exception: a few private banks offer it to their clients, often for a charge and on selected markets only. At mainstream online brokers, the service generally does not exist.`,
    ],
  },
  {
    type: "callout",
    tone: "example",
    title: `The case where your broker is enough`,
    text: `You only hold US shares and your W-8BEN is valid? The ${usTreaty.en} treaty rate already applies at payment: there is nothing to recover, and nothing to hand us. Just watch the expiry — a W-8BEN stops being valid at the end of the third calendar year after signature.`,
  },
  { type: "h2", text: `Whose responsibility is the recovery?` },
  {
    type: "p",
    text: `Yours — and that is the clause almost nobody reads in their terms of service. As a general rule, brokers' terms include no obligation to recover foreign withholding: the firm undertakes to apply the rates its own custodians pass down, not to check them against your tax treaty, nor to claim back the excess. The refund right belongs to you personally, vis-à-vis the foreign administration — and it lapses at each statute-of-limitations deadline, which nobody monitors for you by default.`,
  },
  {
    type: "p",
    text: `That isn't a scandal, it's a division of labour: brokers sell order execution and custody. Cross-border tax reconciliation is a different trade — ours. The two are complementary: we work from the statements your broker provides, and we never touch your accounts or your securities.`,
  },
  { type: "h2", text: `WTax, GlobeTax: why the historical specialists serve institutions` },
  {
    type: "p",
    text: `Withholding-tax recovery is not a new trade. Firms such as **WTax** and **GlobeTax** have practised it at scale for years and are the reference names on the institutional market: pension funds, asset managers, custodians themselves. If you run a fund, they are serious counterparties — we won't pretend otherwise.`,
  },
  {
    type: "p",
    text: `Their model is simply built for volumes other than yours: integrations with custodians, files spanning thousands of positions, contracts negotiated institution by institution. An individual with a few hundred or a few thousand euros over-withheld is not their typical client — not out of disdain, but because their cost structure is calibrated for institutions. It's a rational market choice. It leaves one seat empty: the direct investor's. That seat is ours.`,
  },
  { type: "h2", text: `Our positioning: the direct investor's specialist` },
  {
    type: "p",
    text: `FiscalPlace is built for individuals and small structures investing directly: self-service diagnosis through the [simulator](${href("en", "simulator")}), a [100% public fee grid](${href("en", "pricing")}) — marginal by tranche, from ${topRate.en} down to ${bottomRate.en} depending on the amount recovered, with a ${eur(PRICING.floorFee, "en")} floor and a ${eur(PRICING.capFee, "en")} cap — and one rule with no exceptions: no recovery, no fee. Above ${eur(PRICING.institutionalThreshold, "en")} recovered, the file moves to a bespoke quote: at that level you already look like an institutional client, and we will say so.`,
  },
  {
    type: "p",
    text: `For wealth managers and family offices who want to offer the service to their clients, a [white-label partner programme](${href("en", "whiteLabel")}) exists — with a ${formatPercent(PRICING.partnerRevShare, "en")} share of the fee actually collected, published like the rest of our pricing.`,
  },
  { type: "h2", text: `The comparison table` },
  {
    type: "table",
    caption: `Indicative comparison, written from our vantage point — check your own firm's terms. Data reviewed in June 2026.`,
    headers: [`Criterion`, `Your broker / custodian`, `Institutional specialists (WTax, GlobeTax…)`, `FiscalPlace`],
    rows: [
      [
        `Target client`,
        `You — for execution and custody`,
        `Funds, asset managers, custodians`,
        `Individuals and small direct-investing structures`,
      ],
      [
        `Relief at source`,
        `Sometimes — mainly the US W-8BEN`,
        `Yes, through custody chains`,
        `Yes — W-8BEN, [Irish exemption](${countryHref("en", ie.slug.en)}), prevention files`,
      ],
      [
        `After-the-fact reclaim`,
        `Rarely — sometimes in private banking, for a charge`,
        `Yes, core institutional business`,
        `Yes, core business — ${countryCount} countries covered`,
      ],
      [
        `Pricing`,
        `Firm-specific, rarely published`,
        `Negotiated case by case, not public`,
        `Public success-fee grid, ${eur(PRICING.floorFee, "en")} floor, ${eur(PRICING.capFee, "en")} cap`,
      ],
      [
        `Deadline monitoring`,
        `No`,
        `For their contracted clients`,
        `Yes — computed per claim, optional alerts`,
      ],
      [
        `If the claim fails`,
        `Not applicable`,
        `Per contract`,
        `€0 fee`,
      ],
    ],
  },
  { type: "h2", text: `The cases where you don't need us` },
  {
    type: "p",
    text: `An honest comparison also lists the empty boxes. Here they are:`,
  },
  {
    type: "ul",
    items: [
      `**US shares with a valid W-8BEN**: the right rate already applies at source — nothing to recover after the fact.`,
      `**A 100% UK or Netherlands portfolio**: for an individual French resident there is generally nothing to recover on those markets — [our country ranking](${articleHref("en", BEST_COUNTRIES_SLUG.en)}) says so in black and white.`,
      `**Fully franked Australian dividends**: no withholding is levied on those distributions, so there is nothing to claim.`,
      `**Your private bank already includes recovery**: compare its actual charges with our grid before changing anything — if the service sits inside fees you already pay, keep it.`,
      `**A small single-country file and time on your hands**: doing it yourself is often the better choice — [we even explain how to decide](${articleHref("en", DIY_SLUG.en)}).`,
    ],
  },
  { type: "h2", text: `Your questions about brokers and custodians` },
  {
    type: "faq",
    items: [
      {
        question: `My broker advertises "tax handling included": what should I check, concretely?`,
        answer: `Three things. One: does it apply the treaty rate at payment time, country by country — compare the rate actually withheld on your statements with the treaty rate. Two: does it offer after-the-fact recovery of past over-withholding, and at what price. Three: who monitors your claim deadlines. In the vast majority of cases, the honest answer boils down to US relief at source via the W-8BEN — and nothing else.`,
      },
      {
        question: `Can I require my broker to recover the withholding for me?`,
        answer: `Absent a specific contractual commitment, no: it is not an obligation on its side. It is, however, required to provide you with your own records — statements, tax vouchers, holding confirmations. That is all a recovery needs from it, whether you file yourself or hand the file to us.`,
      },
      {
        question: `Are you competing with brokers?`,
        answer: `No — complementary: we hold no securities, execute no orders, and never touch your accounts. We work from the statements your broker gives you, and nothing changes on its side when you mandate us. The only document in circulation is a mandate to act before foreign tax administrations.`,
      },
      {
        question: `Are you cheaper than WTax or GlobeTax?`,
        answer: `Impossible to claim seriously: their institutional pricing is negotiated case by case and is not public, so any figure-for-figure comparison would be invented. What we can state: our grid is public, checkable before any commitment, and designed for individual-sized files — a segment that is not those firms' core focus.`,
      },
      {
        question: `Would switching brokers make my over-withholding disappear?`,
        answer: `No: the refund right attaches to dividends already received and follows you personally. You will, however, need the old account's statements and vouchers — download them before closing the account; it is always easier than requesting them afterwards.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "pricing",
    label: `Compare against our public grid`,
  },
];

export const fiscalplaceVsBroker: Article = {
  id: "fiscalplace-vs-broker",
  slug: {
    fr: "fiscalplace-vs-courtier-depositaire",
    en: "fiscalplace-vs-your-broker-or-custodian",
  },
  category: "comparisons",
  title: {
    fr: "FiscalPlace vs votre courtier : qui récupère vraiment votre retenue à la source ?",
    en: "FiscalPlace vs your broker: who actually recovers your withholding tax?",
  },
  description: {
    fr: `Votre courtier applique la retenue, il ne la récupère pas. Ce que font vraiment les dépositaires, la place de WTax et GlobeTax côté institutionnel, les cas où vous n'avez besoin de personne — et le tableau comparatif complet.`,
    en: `Your broker applies the withholding — it doesn't recover it. What custodians actually do, where WTax and GlobeTax fit on the institutional side, the cases where you need nobody at all — and the full comparison table.`,
  },
  updated: "2026-07-08",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US", "CH", "IE"],
};
