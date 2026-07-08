import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { getCountryById, recoveryGap, treatyRateFor } from "@/data/countries";
import { PRICING, computeCommission } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * COST — "How much does withholding tax recovery actually cost?"
 * Every rate, deadline and price below is computed from @/data/countries and
 * @/config/pricing at module load; nothing is restated by hand.
 */

const ch = getCountryById("CH")!;
const de = getCountryById("DE")!;
const ca = getCountryById("CA")!;
const gb = getCountryById("GB")!;
const nl = getCountryById("NL")!;

const eur = (n: number, locale: Locale) =>
  formatCurrency(n, locale, "EUR", Number.isInteger(n) ? 0 : 2);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);
const pct1 = (rate: number, locale: Locale) => formatPercent(rate, locale, 1);

const [tier1, tier2, tier3, tier4] = PRICING.successFeeTiers;

/** Worked examples shown in the fee table — computed, never restated. */
const EXAMPLE_AMOUNTS = [1_115, 2_840, 30_000, 100_000];

function exampleRows(locale: Locale): string[][] {
  return EXAMPLE_AMOUNTS.map((recovered) => {
    const c = computeCommission(recovered);
    const fee = Math.round(c.fee * 100) / 100;
    const net = Math.round(c.net * 100) / 100;
    const capNote = c.capApplied ? (locale === "fr" ? " (plafond atteint)" : " (cap reached)") : "";
    return [eur(recovered, locale), `${eur(fee, locale)}${capNote}`, pct1(c.effectiveRate, locale), eur(net, locale)];
  });
}

// Swiss worked example rendered as a ledger entry.
const chGross = 8_000;
const chTreatyRate = treatyRateFor(ch, "FR");
const chWithheld = chGross * ch.statutoryRate;
const chOwed = chGross * chTreatyRate;
const chRecoverable = chGross * recoveryGap(ch, "FR");
const chFee = computeCommission(chRecoverable).fee;

const c2840 = computeCommission(2_840);
const c30k = computeCommission(30_000);

/** Recovered amount below which the floor fee pushes the effective rate above tier 1. */
const floorBreakEven = Math.round(PRICING.floorFee / tier1.rate);

/** Canonical slugs of the sibling cost articles (same content batch). */
const PRICING_TRANSPARENCY_SLUG = {
  fr: "pourquoi-les-prestataires-cachent-leurs-tarifs",
  en: "why-providers-hide-their-pricing",
} as const;
const W8BEN_SLUG = { fr: "w-8ben-mode-demploi", en: "w-8ben-explained" } as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Réponse directe : trois modèles coexistent sur ce marché. La commission au succès — souvent entre 15 et 35 % du montant récupéré, presque jamais affichée publiquement —, le forfait par démarche, et la facturation au temps passé des avocats fiscalistes. Chez FiscalPlace, la grille est publique : commission dégressive et **marginale par tranche**, de ${pct(tier1.rate, "fr")} à ${pct(tier4.rate, "fr")}, plancher de ${eur(PRICING.floorFee, "fr")}, plafond de ${eur(PRICING.capFee, "fr")} — et rien du tout si la récupération échoue. Le détail, avec quatre exemples calculés, suit.`,
  },
  {
    type: "p",
    text: `Vous venez de découvrir qu'un fisc étranger a prélevé plus que ce que la convention fiscale autorise — ${pct(ch.statutoryRate, "fr")} sur un dividende suisse quand ${pct(chTreatyRate, "fr")} suffisaient, par exemple — et que la différence se récupère. Question suivante, parfaitement légitime : combien coûte la récupération ? C'est la question à laquelle ce secteur répond le plus mal : la plupart des prestataires ne publient aucun tarif ([nous avons consacré un article entier à ce silence](${articleHref("fr", PRICING_TRANSPARENCY_SLUG.fr)})). Voici les trois modèles que vous rencontrerez, leurs fourchettes réelles, notre grille complète, les coûts cachés à débusquer — et le vrai coût du « je le fais moi-même ».`,
  },
  { type: "h2", text: `Quels sont les modèles de facturation des prestataires de récupération ?` },
  {
    type: "p",
    text: `Trois logiques se partagent le marché, chacune avec sa zone de pertinence — et ses angles morts.`,
  },
  {
    type: "table",
    caption: `Panorama indicatif des pratiques couramment observées sur le marché — la plupart de ces chiffres ne sont pas publiés par les intéressés. Données revues en juin 2026.`,
    headers: [`Modèle`, `Comment vous payez`, `Fourchette couramment observée`, `Le point de vigilance`],
    rows: [
      [
        `Commission au succès`,
        `Un pourcentage du montant récupéré, après remboursement`,
        `Souvent 15 à 35 % — rarement publié`,
        `Minimums non affichés, « succès » défini de façon floue`,
      ],
      [
        `Forfait par démarche`,
        `Prix fixe, payé d'avance`,
        `De quelques dizaines à quelques centaines d'euros par formulaire`,
        `Dû même si la demande échoue`,
      ],
      [
        `Temps passé (avocat fiscaliste)`,
        `Honoraires horaires`,
        `Plusieurs centaines d'euros de l'heure selon le cabinet`,
        `Le compteur tourne pendant que l'administration fait attendre`,
      ],
    ],
  },
  {
    type: "p",
    text: `Ces fourchettes sont indicatives : le gros du marché tarife au cas par cas, selon les volumes et la chaîne de conservation des titres. Conséquence pratique pour un particulier ou une petite structure : il est très difficile d'obtenir un prix ferme sans passer par un appel commercial.`,
  },
  { type: "h2", text: `Comment fonctionne notre grille : dégressive, marginale, publiée` },
  {
    type: "p",
    text: `Notre commission au succès fonctionne comme le barème de l'impôt sur le revenu : chaque tranche du montant récupéré est facturée au taux de sa tranche — le taux d'une tranche supérieure ne s'applique jamais à l'ensemble. Et elle n'est due que sur les montants **effectivement récupérés** : dossier rejeté, prescription atteinte, administration qui ne répond pas — vous ne payez rien.`,
  },
  {
    type: "table",
    caption: `Notre barème marginal, appliqué au seul montant récupéré. Données revues en juin 2026 — la grille de référence à jour est sur la page tarifs.`,
    headers: [`Tranche du montant récupéré`, `Taux appliqué à la tranche`],
    rows: [
      [`Jusqu'à ${eur(tier1.upTo, "fr")}`, pct(tier1.rate, "fr")],
      [`De ${eur(tier1.upTo, "fr")} à ${eur(tier2.upTo, "fr")}`, pct(tier2.rate, "fr")],
      [`De ${eur(tier2.upTo, "fr")} à ${eur(tier3.upTo, "fr")}`, pct(tier3.rate, "fr")],
      [
        `Au-delà de ${eur(PRICING.institutionalThreshold, "fr")}`,
        `${pct(tier4.rate, "fr")} — et passage sur devis institutionnel`,
      ],
    ],
  },
  {
    type: "ul",
    items: [
      `**Plancher : ${eur(PRICING.floorFee, "fr")}** par dossier abouti — jamais facturé d'avance, jamais facturé en cas d'échec.`,
      `**Plafond : ${eur(PRICING.capFee, "fr")}** par dossier, quel que soit le montant récupéré.`,
      `**Débours refacturés à prix coûtant** (attestations de dépositaires, visas de formulaires…), justificatifs à l'appui, sans marge.`,
      `**Au-delà de ${eur(PRICING.institutionalThreshold, "fr")} récupérés : devis institutionnel** — à cette échelle, le sur-mesure redevient légitime, et nous le disons plutôt que de l'habiller.`,
    ],
  },
  {
    type: "p",
    text: `À côté de la commission, des forfaits fixes couvrent les démarches unitaires : W-8BEN à ${eur(PRICING.fixedServices.w8ben, "fr")}, W-8BEN-E à ${eur(PRICING.fixedServices.w8benE, "fr")}, certificat de résidence fiscale à ${eur(PRICING.fixedServices.residenceCertificate, "fr")}, ITIN à ${eur(PRICING.fixedServices.itin, "fr")} (déduit de la commission si vous basculez ensuite vers une récupération complète), traitement prioritaire à ${eur(PRICING.fixedServices.priorityHandling, "fr")} pour les dossiers proches de la prescription. L'ensemble est détaillé sur [la page tarifs](${href("fr", "pricing")}) et expliqué sans détour dans [comment nous sommes payés](${href("fr", "howWeGetPaid")}).`,
  },
  { type: "h3", text: `Quatre exemples calculés` },
  {
    type: "p",
    text: `Le barème marginal rend le taux effectif dégressif : plus le dossier est important, plus le pourcentage réellement payé baisse.`,
  },
  {
    type: "table",
    caption: `Exemples calculés avec le barème ci-dessus (plancher ${eur(PRICING.floorFee, "fr")}, plafond ${eur(PRICING.capFee, "fr")}). Montants indicatifs.`,
    headers: [`Montant récupéré`, `Notre commission`, `Taux effectif`, `Net pour vous`],
    rows: exampleRows("fr"),
  },
  { type: "h2", text: `Combien rapporte un dossier type ? L'exemple suisse, ligne à ligne` },
  {
    type: "p",
    text: `La [Suisse](${countryHref("fr", ch.slug.fr)}) illustre bien la mécanique, parce que l'écart y est le plus important d'Europe : ${pct(ch.statutoryRate, "fr")} prélevés à la source, ${pct(chTreatyRate, "fr")} dus par la convention. Prenons ${eur(chGross, "fr")} de dividendes suisses bruts encaissés par un résident français :`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Impôt anticipé suisse prélevé (${pct(ch.statutoryRate, "fr")})`,
    withheldAmount: eur(chWithheld, "fr"),
    owedLabel: `Retenue conventionnelle due (${pct(chTreatyRate, "fr")})`,
    owedAmount: eur(chOwed, "fr"),
    treatyRef: `CDI FR-CH — dividendes`,
    recoverLabel: `Trop-perçu récupérable`,
    recoverAmount: eur(chRecoverable, "fr"),
    footnote: `Sur ce dossier, notre commission au succès serait de ${eur(chFee, "fr")} : il vous revient ${eur(chRecoverable - chFee, "fr")} net. Chiffres indicatifs, taux revus en juin 2026.`,
  },
  {
    type: "p",
    text: `Deux contraintes suisses à connaître avant de se réjouir : la demande se prescrit par ${ch.sol.years} ans à compter de la fin de l'année civile du dividende, et le dépôt s'effectue obligatoirement en ligne depuis 2025 (formulaire 83 pour un résident de France). Un dossier papier peut être retourné sans examen.`,
  },
  { type: "h2", text: `Quels coûts cachés faut-il surveiller (chez nous comme ailleurs) ?` },
  {
    type: "p",
    text: `Un pourcentage seul ne dit presque rien. Les vrais écarts de facture se jouent dans les lignes secondaires :`,
  },
  {
    type: "ul",
    items: [
      `**Les minimums non affichés.** Un « 15 % au succès » assorti d'un minimum caché de plusieurs centaines d'euros absorbe l'intégralité d'une petite récupération. Le nôtre existe aussi — ${eur(PRICING.floorFee, "fr")} — mais il est publié, et le simulateur vous prévient avant tout engagement.`,
      `**Les débours gonflés.** Attestations de dépositaires, traductions, visas de formulaires : refacturés « avec frais de coordination », ils peuvent doubler. Exigez le prix coûtant, pièces justificatives à l'appui.`,
      `**Les frais de dossier d'entrée.** Payés d'avance et conservés même si la demande échoue : c'est l'exact inverse d'un modèle au succès.`,
      `**La définition du « succès ».** Commission sur le montant demandé ou sur le montant obtenu ? Avant ou après débours ? Chaque mot pèse au moment de la facture.`,
      `**Les clauses d'exclusivité pluriannuelles.** Certains mandats verrouillent toutes vos récupérations futures, pays et années confondus. Les nôtres se limitent aux dossiers que vous nous confiez.`,
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `La question qui démasque`,
    text: `Demandez par écrit : « Quelle serait votre facture totale, débours compris, si vous récupérez ${eur(2_840, "fr")} ? » Chez nous, la réponse tient en une ligne : ${eur(Math.round(c2840.fee * 100) / 100, "fr")} (barème marginal), zéro si échec. Un prestataire sérieux sait répondre avec la même précision.`,
  },
  { type: "h2", text: `Combien coûte vraiment le do-it-yourself ?` },
  {
    type: "p",
    text: `Zéro euro d'honoraires — et c'est parfois le bon choix, autant le dire clairement. Mais le DIY a un coût réel, en temps et en risque :`,
  },
  {
    type: "ul",
    items: [
      `Obtenir un certificat de résidence fiscale **par pays et par année réclamée**, visé par votre centre des impôts.`,
      `Identifier le bon formulaire et sa procédure : dépôt électronique obligatoire en [Suisse](${countryHref("fr", ch.slug.fr)}) depuis 2025, portail en ligne du BZSt en [Allemagne](${countryHref("fr", de.slug.fr)}), formulaire NR7-R papier au [Canada](${countryHref("fr", ca.slug.fr)}) — trois pays, trois mondes.`,
      `Réconcilier ligne à ligne relevés, tax vouchers et montants réclamés — la première cause de rejet évitable.`,
      `Suivre l'instruction et relancer, parfois longtemps : en Allemagne, elle dépasse fréquemment 12 mois.`,
      `Absorber le coût d'une erreur : un dossier rejeté se redépose, mais seulement si la prescription n'est pas tombée entre-temps — ${ca.sol.years} ans seulement au Canada.`,
    ],
  },
  {
    type: "p",
    text: `Notre position honnête : pour un seul pays, une seule année et un montant modeste, le DIY est raisonnable — [un W-8BEN se remplit très bien seul, nous avons publié le mode d'emploi](${articleHref("fr", W8BEN_SLUG.fr)}). Et il arrive qu'il n'y ait tout simplement rien à récupérer : le [Royaume-Uni](${countryHref("fr", gb.slug.fr)}) ne prélève aucune retenue sur les dividendes ordinaires, et les ${pct(nl.statutoryRate, "fr")} néerlandais correspondent déjà au taux conventionnel d'un particulier français ([le cas des Pays-Bas ici](${countryHref("fr", nl.slug.fr)})). Dans ces situations, le meilleur prestataire est celui qui vous dit de ne pas ouvrir de dossier — c'est exactement ce que fait notre simulateur, gratuitement.`,
  },
  { type: "h2", text: `Vos questions sur le coût de la récupération` },
  {
    type: "faq",
    items: [
      {
        question: `Que payez-vous si la récupération échoue ?`,
        answer: `Rien en honoraires : la commission n'existe que sur les montants effectivement récupérés, et le plancher de ${eur(PRICING.floorFee, "fr")} ne s'applique qu'aux dossiers aboutis. Seule exception, prévue au contrat : les débours facturés par des tiers (attestations de dépositaires, par exemple), refacturés à prix coûtant.`,
      },
      {
        question: `La commission porte-t-elle sur le montant demandé ou sur le montant récupéré ?`,
        answer: `Sur le montant effectivement remboursé par l'administration, jamais sur le montant réclamé. Et le barème est marginal : sur ${eur(30_000, "fr")} récupérés, la commission est de ${eur(Math.round(c30k.fee * 100) / 100, "fr")} — soit ${pct1(c30k.effectiveRate, "fr")} effectifs — et non ${pct(tier1.rate, "fr")} ou ${pct(tier3.rate, "fr")} de l'ensemble.`,
      },
      {
        question: `Y a-t-il des frais d'entrée ou un abonnement obligatoire ?`,
        answer: `Non. L'ouverture et le diagnostic d'un dossier sont gratuits. L'abonnement Suivi & Alertes (${eur(PRICING.subscription.monthly, "fr")} par mois ou ${eur(PRICING.subscription.yearly, "fr")} par an et par portefeuille) est optionnel : il surveille échéances et formulaires, il ne conditionne aucune récupération.`,
      },
      {
        question: `Pourquoi un plancher de ${eur(PRICING.floorFee, "fr")} ?`,
        answer: `Parce qu'en dessous, le traitement coûte plus qu'il ne rapporte — à nous comme à vous. Conséquence assumée : sous environ ${eur(floorBreakEven, "fr")} récupérés, le taux effectif dépasse ${pct(tier1.rate, "fr")}. Le simulateur vous l'affiche avant tout engagement et vous dira honnêtement quand un dossier ne vaut pas la peine d'être ouvert.`,
      },
      {
        question: `Un avocat fiscaliste est-il parfois le meilleur choix ?`,
        answer: `Oui : contentieux avec une administration, qualité de bénéficiaire effectif contestée, structurations complexes ou enjeux au-delà de ${eur(PRICING.institutionalThreshold, "fr")}. Pour la récupération standard de retenues sur dividendes de portefeuille, la facturation au temps passé est en revanche rarement compétitive.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculer mon trop-perçu`,
    note: `Gratuit, sans création de compte — le résultat affiche la commission et votre net.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Straight answer: three models coexist in this market. The success fee — often between 15 and 35% of the amount recovered, almost never displayed publicly —, the fixed fee per filing, and the hourly billing of tax lawyers. At FiscalPlace the grid is public: a degressive, **marginal-by-tranche** success fee from ${pct(tier1.rate, "en")} down to ${pct(tier4.rate, "en")}, a ${eur(PRICING.floorFee, "en")} floor, a ${eur(PRICING.capFee, "en")} cap — and nothing at all if the recovery fails. The details, with four worked examples, follow.`,
  },
  {
    type: "p",
    text: `You have just discovered that a foreign tax authority withheld more than the tax treaty allows — ${pct(ch.statutoryRate, "en")} on a Swiss dividend where ${pct(chTreatyRate, "en")} would have sufficed, say — and that the difference can be recovered. Next question, entirely fair: what does recovery cost? It is the question this industry answers worst: most providers publish no pricing at all ([we devoted a whole article to that silence](${articleHref("en", PRICING_TRANSPARENCY_SLUG.en)})). Here are the three models you will encounter, their real ranges, our full grid, the hidden costs to hunt down — and the true cost of doing it yourself.`,
  },
  { type: "h2", text: `How do withholding tax recovery providers charge?` },
  {
    type: "p",
    text: `Three billing logics share the market, each with its zone of relevance — and its blind spots.`,
  },
  {
    type: "table",
    caption: `Indicative overview of commonly observed market practice — most of these figures are not published by the firms themselves. Data reviewed in June 2026.`,
    headers: [`Model`, `How you pay`, `Commonly observed range`, `What to watch`],
    rows: [
      [
        `Success fee`,
        `A percentage of the amount recovered, after the refund lands`,
        `Often 15 to 35% — rarely published`,
        `Undisclosed minimums, "success" defined loosely`,
      ],
      [
        `Fixed fee per filing`,
        `A flat price, paid upfront`,
        `From a few tens to a few hundred euros per form`,
        `Owed even if the claim fails`,
      ],
      [
        `Hourly billing (tax lawyer)`,
        `Hourly fees`,
        `Several hundred euros an hour depending on the firm`,
        `The meter runs while the administration keeps you waiting`,
      ],
    ],
  },
  {
    type: "p",
    text: `Those ranges are indicative: the bulk of the market prices case by case, based on volumes and the custody chain. The practical consequence for an individual or a small structure: getting a firm price without sitting through a sales call is very hard.`,
  },
  { type: "h2", text: `How our grid works: degressive, marginal, published` },
  {
    type: "p",
    text: `Our success fee works like income-tax brackets: each slice of the recovered amount is charged at its own tier's rate — a higher tier's rate never applies to the whole. And it is only due on amounts **actually recovered**: claim rejected, deadline expired, administration gone silent — you pay nothing.`,
  },
  {
    type: "table",
    caption: `Our marginal scale, applied to the recovered amount only. Data reviewed in June 2026 — the authoritative, up-to-date grid lives on the pricing page.`,
    headers: [`Slice of the recovered amount`, `Rate applied to the slice`],
    rows: [
      [`Up to ${eur(tier1.upTo, "en")}`, pct(tier1.rate, "en")],
      [`From ${eur(tier1.upTo, "en")} to ${eur(tier2.upTo, "en")}`, pct(tier2.rate, "en")],
      [`From ${eur(tier2.upTo, "en")} to ${eur(tier3.upTo, "en")}`, pct(tier3.rate, "en")],
      [
        `Above ${eur(PRICING.institutionalThreshold, "en")}`,
        `${pct(tier4.rate, "en")} — and the file moves to an institutional quote`,
      ],
    ],
  },
  {
    type: "ul",
    items: [
      `**Floor: ${eur(PRICING.floorFee, "en")}** per successful claim — never charged upfront, never charged on failure.`,
      `**Cap: ${eur(PRICING.capFee, "en")}** per claim, whatever the recovery.`,
      `**Disbursements passed on at cost** (custodian confirmations, form certification fees…), receipts attached, no markup.`,
      `**Above ${eur(PRICING.institutionalThreshold, "en")} recovered: institutional quote** — at that scale bespoke pricing becomes legitimate again, and we say so rather than dressing it up.`,
    ],
  },
  {
    type: "p",
    text: `Alongside the success fee, fixed-fee services cover standalone filings: the W-8BEN at ${eur(PRICING.fixedServices.w8ben, "en")}, the W-8BEN-E at ${eur(PRICING.fixedServices.w8benE, "en")}, the certificate of tax residence at ${eur(PRICING.fixedServices.residenceCertificate, "en")}, the ITIN at ${eur(PRICING.fixedServices.itin, "en")} (deducted from the success fee if you later upgrade to a full recovery), and priority handling at ${eur(PRICING.fixedServices.priorityHandling, "en")} for claims close to their deadline. Everything is laid out on [the pricing page](${href("en", "pricing")}) and explained plainly in [how we get paid](${href("en", "howWeGetPaid")}).`,
  },
  { type: "h3", text: `Four worked examples` },
  {
    type: "p",
    text: `The marginal scale makes the effective rate degressive: the bigger the claim, the lower the percentage you actually pay.`,
  },
  {
    type: "table",
    caption: `Examples computed with the scale above (floor ${eur(PRICING.floorFee, "en")}, cap ${eur(PRICING.capFee, "en")}). Indicative amounts.`,
    headers: [`Amount recovered`, `Our fee`, `Effective rate`, `Net to you`],
    rows: exampleRows("en"),
  },
  { type: "h2", text: `What does a typical claim yield? The Swiss case, line by line` },
  {
    type: "p",
    text: `[Switzerland](${countryHref("en", ch.slug.en)}) illustrates the mechanics well, because the gap there is the widest in Europe: ${pct(ch.statutoryRate, "en")} withheld at source, ${pct(chTreatyRate, "en")} owed under the treaty. Take ${eur(chGross, "en")} of gross Swiss dividends received by a French resident:`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Swiss anticipatory tax withheld (${pct(ch.statutoryRate, "en")})`,
    withheldAmount: eur(chWithheld, "en"),
    owedLabel: `Treaty withholding owed (${pct(chTreatyRate, "en")})`,
    owedAmount: eur(chOwed, "en"),
    treatyRef: `FR-CH tax treaty — dividends`,
    recoverLabel: `Recoverable over-withholding`,
    recoverAmount: eur(chRecoverable, "en"),
    footnote: `On this claim, our success fee would be ${eur(chFee, "en")}: ${eur(chRecoverable - chFee, "en")} comes back to you net. Indicative figures, rates reviewed in June 2026.`,
  },
  {
    type: "p",
    text: `Two Swiss constraints to know before celebrating: the claim expires ${ch.sol.years} years after the end of the calendar year of the dividend, and filing has been electronic-only since 2025 (Form 83 for a French resident). A paper file can be returned unexamined.`,
  },
  { type: "h2", text: `Which hidden costs should you watch for (with us as with anyone)?` },
  {
    type: "p",
    text: `A percentage on its own says almost nothing. The real differences in the final invoice hide in the secondary lines:`,
  },
  {
    type: "ul",
    items: [
      `**Undisclosed minimums.** A "15% success fee" paired with a hidden minimum of several hundred euros swallows a small recovery whole. Ours exists too — ${eur(PRICING.floorFee, "en")} — but it is published, and the simulator warns you before you commit to anything.`,
      `**Inflated disbursements.** Custodian confirmations, translations, form certifications: passed on "with coordination fees", they can double. Demand cost price, receipts attached.`,
      `**Upfront file-opening fees.** Paid in advance and kept even if the claim fails: the exact opposite of a success-based model.`,
      `**The definition of "success".** Fee on the amount claimed or the amount obtained? Before or after disbursements? Every word matters when the invoice arrives.`,
      `**Multi-year exclusivity clauses.** Some mandates lock in all your future recoveries, every country and every year. Ours are limited to the claims you actually entrust to us.`,
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `The question that unmasks`,
    text: `Ask in writing: "What would your total invoice be, disbursements included, if you recover ${eur(2_840, "en")}?" Our answer fits on one line: ${eur(Math.round(c2840.fee * 100) / 100, "en")} (marginal scale), zero on failure. A serious provider can answer with the same precision.`,
  },
  { type: "h2", text: `What does doing it yourself really cost?` },
  {
    type: "p",
    text: `Zero euros in fees — and sometimes that is the right call, let's say it plainly. But DIY has a real cost, in time and in risk:`,
  },
  {
    type: "ul",
    items: [
      `Obtaining a certificate of tax residence **per country and per year claimed**, stamped by your local tax office.`,
      `Identifying the right form and procedure: mandatory electronic filing in [Switzerland](${countryHref("en", ch.slug.en)}) since 2025, the BZSt online portal in [Germany](${countryHref("en", de.slug.en)}), the paper NR7-R in [Canada](${countryHref("en", ca.slug.en)}) — three countries, three different worlds.`,
      `Reconciling statements, tax vouchers and claimed amounts line by line — the leading avoidable cause of rejection.`,
      `Tracking the processing and chasing it up, sometimes for a long while: in Germany it frequently exceeds 12 months.`,
      `Absorbing the cost of a mistake: a rejected claim can be refiled, but only if the deadline has not expired in the meantime — just ${ca.sol.years} years in Canada.`,
    ],
  },
  {
    type: "p",
    text: `Our honest position: for a single country, a single year and a modest amount, DIY is reasonable — [a W-8BEN is perfectly fillable on your own, and we published the full instructions](${articleHref("en", W8BEN_SLUG.en)}). And sometimes there is simply nothing to recover: the [United Kingdom](${countryHref("en", gb.slug.en)}) withholds nothing on ordinary dividends, and the Dutch ${pct(nl.statutoryRate, "en")} already matches the treaty rate for a French individual ([the Netherlands case here](${countryHref("en", nl.slug.en)})). In those situations, the best provider is the one who tells you not to open a claim — which is exactly what our simulator does, for free.`,
  },
  { type: "h2", text: `Your questions about the cost of recovery` },
  {
    type: "faq",
    items: [
      {
        question: `What do you pay if the recovery fails?`,
        answer: `Nothing in fees: the commission only exists on amounts actually recovered, and the ${eur(PRICING.floorFee, "en")} floor applies to successful claims only. The one contractual exception: disbursements charged by third parties (custodian confirmations, for instance), passed on at cost.`,
      },
      {
        question: `Is the fee computed on the amount claimed or the amount recovered?`,
        answer: `On the amount actually refunded by the administration, never on the amount claimed. And the scale is marginal: on ${eur(30_000, "en")} recovered, the fee is ${eur(Math.round(c30k.fee * 100) / 100, "en")} — an effective ${pct1(c30k.effectiveRate, "en")} — not ${pct(tier1.rate, "en")} or ${pct(tier3.rate, "en")} of the whole.`,
      },
      {
        question: `Are there entry fees or a mandatory subscription?`,
        answer: `No. Opening and diagnosing a claim is free. The Monitoring & Alerts subscription (${eur(PRICING.subscription.monthly, "en")} per month or ${eur(PRICING.subscription.yearly, "en")} per year, per portfolio) is optional: it watches deadlines and forms, it is never a precondition to any recovery.`,
      },
      {
        question: `Why a ${eur(PRICING.floorFee, "en")} floor?`,
        answer: `Because below it, processing costs more than it yields — for us and for you. The assumed consequence: under roughly ${eur(floorBreakEven, "en")} recovered, the effective rate exceeds ${pct(tier1.rate, "en")}. The simulator shows you this before any commitment, and will tell you honestly when a claim is not worth opening.`,
      },
      {
        question: `Is a tax lawyer sometimes the better choice?`,
        answer: `Yes: litigation with an administration, a challenged beneficial-ownership position, complex structures, or stakes above ${eur(PRICING.institutionalThreshold, "en")}. For the standard recovery of withholding on portfolio dividends, hourly billing is rarely competitive.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculate my refund`,
    note: `Free, no account needed — the result shows the fee and your net.`,
  },
];

export const costOfRecovery: Article = {
  id: "cost-of-recovery",
  slug: {
    fr: "combien-coute-recuperation-withholding-tax",
    en: "cost-of-withholding-tax-recovery",
  },
  category: "cost",
  title: {
    fr: "Combien coûte la récupération de withholding tax sur des dividendes étrangers ?",
    en: "How much does it cost to recover withholding tax on foreign dividends?",
  },
  description: {
    fr: "Commission au succès, forfait ou facturation horaire : les trois modèles du marché, leurs fourchettes réelles, notre grille marginale avec quatre exemples calculés — et les coûts cachés à débusquer, do-it-yourself compris.",
    en: "Success fee, fixed fee or hourly billing: the market's three models, their real ranges, our marginal grid with four worked examples — and the hidden costs to hunt down, do-it-yourself included.",
  },
  updated: "2026-06-24",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["CH", "DE", "CA"],
};
