import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref } from "@/lib/routes";
import { getCountryById, recoveryGap, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "The EU adopted the FASTER directive on withholding tax relief
 * — does that mean I can wait?" News-driven angle: Directive (EU) 2025/50
 * was adopted 10 December 2024 and is real, but its application date
 * (1 January 2030) is nearly four years out and not retroactive. The risk
 * this article addresses is investors reading FASTER headlines and
 * shelving claims on dividends already withheld — which keeps running
 * against today's statutes of limitations regardless. All rates, gaps and
 * deadlines below come from @/data/countries; only the directive's own
 * dates and mechanics (verified by web search against EUR-Lex, the Council
 * of the EU and Big Four alerts) are hand-written.
 */

const de = getCountryById("DE")!;
const ch = getCountryById("CH")!;
const be = getCountryById("BE")!;

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/* Worked German example: 4,000 € of gross dividends, withheld today under national rules. */
const DE_GROSS = 4_000;
const deWithheld = DE_GROSS * de.statutoryRate;
const deOwed = DE_GROSS * treatyRateFor(de, "FR");
const deRecoverable = deWithheld - deOwed;

const yearsFr = (years: number) => `${years} ans`;
const yearsEn = (years: number) => `${years} ${years > 1 ? "years" : "year"}`;

/* Canonical slugs of sibling articles referenced below. */
const SOL_RANKING_SLUG = {
  fr: "classement-delais-prescription-par-pays",
  en: "statute-of-limitations-ranking-by-country",
} as const;
const MISSED_DEADLINE_SLUG = {
  fr: "delai-de-prescription-depasse-que-faire",
  en: "missed-the-statute-of-limitations-what-now",
} as const;
const W8BEN_SLUG = {
  fr: "w-8ben-mode-demploi",
  en: "w-8ben-explained",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Depuis son adoption, la directive européenne « FASTER » revient régulièrement dans la presse fiscale et chez les conseillers en gestion de patrimoine, présentée comme la fin annoncée des lourdeurs de la retenue à la source sur les dividendes transfrontaliers. C'est en grande partie vrai — mais la date qui compte pour vous est 2030, pas 2026. Si vous avez des dividendes étrangers retenus cette année, les attendre serait une erreur : ils restent soumis aux règles et aux délais d'aujourd'hui, sans aucun effet rétroactif de cette réforme.`,
  },
  { type: "h2", text: `Qu'est-ce que la directive FASTER, exactement ?` },
  {
    type: "p",
    text: `FASTER (« Faster and Safer Relief of Excess Withholding Taxes ») est la directive (UE) 2025/50, adoptée par le Conseil de l'Union européenne le 10 décembre 2024 et publiée au Journal officiel de l'UE le 10 janvier 2025. Elle vise à harmoniser et accélérer les procédures de récupération de la retenue à la source excédentaire sur les dividendes (et, selon les cas, les intérêts) versés entre États membres. Chaque État membre a jusqu'au **31 décembre 2028** pour la transposer dans son droit national, et les nouvelles règles ne s'appliqueront qu'à partir du **1er janvier 2030**.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Le chiffre à retenir`,
    text: `Entre aujourd'hui et l'entrée en application de FASTER, il reste près de quatre ans. Aucune disposition ne rend la directive rétroactive : les dividendes déjà versés restent gouvernés par les règles et délais de prescription en vigueur au moment du versement.`,
  },
  { type: "h2", text: `Les deux mécanismes que Bruxelles met sur la table` },
  {
    type: "p",
    text: `FASTER ne remplace pas les régimes nationaux par un système unique : elle encadre deux mécanismes que chaque État membre peut choisir d'adopter (l'un, l'autre, ou les deux), selon qu'il dispose déjà ou non d'une procédure domestique complète d'allègement à la source.`,
  },
  {
    type: "ul",
    items: [
      `**Allègement à la source (relief at source)** : le taux réduit conventionnel s'applique directement au moment du versement, sans avance de trésorerie ni démarche a posteriori de l'investisseur.`,
      `**Remboursement rapide (quick refund)** : la retenue est prélevée au taux plein, mais remboursée dans un délai encadré — jusqu'à 60 jours calendaires après la fin de la période de dépôt de la demande, contre plusieurs mois, voire plusieurs années, dans certaines procédures nationales actuelles.`,
      `**Certificat de résidence fiscale numérique (eTRC)** : un document électronique harmonisé, délivré par l'administration du pays de résidence sous 14 jours calendaires à compter d'une demande complète, valable pour une année civile ou fiscale au maximum.`,
    ],
  },
  {
    type: "p",
    text: `Concrètement, un mécanisme d'allègement à la source combiné à un eTRC ressemblerait, pour l'investisseur, à ce que vous connaissez peut-être déjà sur les actions américaines via le formulaire W-8BEN : le bon taux s'applique dès le versement, sans dossier de remboursement à monter ensuite. [Notre guide du W-8BEN](${articleHref("fr", W8BEN_SLUG.fr)}) donne une idée concrète de ce à quoi ce type de mécanisme ressemble une fois en place — et de ses propres pièges (validité, renouvellement, expiration silencieuse).`,
  },
  { type: "h2", text: `Ce qui ne change strictement rien avant 2030` },
  {
    type: "p",
    text: `Prenons un exemple concret avec un pays que FASTER concernera directement : l'Allemagne, membre de l'UE. Un résident de France percevant aujourd'hui des dividendes allemands reste soumis à la mécanique actuelle — retenue au taux plein, dossier de remboursement a posteriori auprès du BZSt, délai de ${yearsFr(de.sol.years)}. FASTER n'y change rien avant son entrée en application.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu à la source aujourd'hui (${pct(de.statutoryRate, "fr")})`,
    withheldAmount: eur(deWithheld, "fr"),
    owedLabel: `Dû par un résident de France (${pct(treatyRateFor(de, "FR"), "fr")})`,
    owedAmount: eur(deOwed, "fr"),
    treatyRef: `Convention franco-allemande`,
    recoverLabel: `Trop-perçu récupérable, selon la procédure en vigueur`,
    recoverAmount: eur(deRecoverable, "fr"),
    footnote: `Exemple pour ${eur(DE_GROSS, "fr")} de dividendes allemands bruts versés en 2026 — montants indicatifs. Ce trop-perçu se réclame selon la procédure BZSt actuelle, avec un délai de ${yearsFr(de.sol.years)} à compter de la fin de l'année civile du versement : FASTER, non encore applicable, n'intervient pas dans ce calcul.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `« Une réforme arrive » n'est pas une raison d'attendre`,
    text: `Le risque concret n'est pas de mal comprendre FASTER — c'est de laisser dormir un dossier en pensant qu'il « finira par se régler tout seul ». Les délais de prescription actuels continuent de courir sans interruption jusqu'en 2030 et au-delà : [notre classement des délais pays par pays](${articleHref("fr", SOL_RANKING_SLUG.fr)}) et [ce qui se passe concrètement une fois le délai dépassé](${articleHref("fr", MISSED_DEADLINE_SLUG.fr)}) montrent qu'un trop-perçu prescrit est perdu définitivement, réforme européenne ou non.`,
  },
  { type: "h2", text: `Même après 2030, l'application ne sera pas automatique partout` },
  {
    type: "p",
    text: `Deux nuances, à prendre avec la prudence qui s'impose à quatre ans de l'échéance et avant transposition complète en droit national. D'abord, les obligations de procédure de FASTER (allègement à la source et/ou remboursement rapide) ne s'imposent pas à tous les États membres dans tous les cas : elles visent en priorité ceux qui ne disposent pas déjà d'un dispositif domestique complet d'allègement à la source, ou dont la capitalisation boursière dépasse un seuil de 1,5 % pendant quatre années consécutives (mesuré sur des données ESMA jusqu'au 31 décembre 2028) — seul le volet du certificat numérique de résidence (eTRC) s'appliquera de façon uniforme partout. Ensuite, chaque État membre garde la main pour revenir à sa procédure nationale classique en cas de dossier incomplet ou de contrôle en cours. **À confirmer au fil de la transposition** : les orientations connues à ce stade suggèrent que la France privilégierait l'allègement à la source plutôt que le remboursement rapide, mais rien n'est arrêté avant l'échéance de transposition du 31 décembre 2028 — nous mettrons cette page à jour à mesure que le texte français se précise.`,
  },
  { type: "h2", text: `Suisse, États-Unis, Japon : hors du champ de FASTER, hier comme demain` },
  {
    type: "p",
    text: `FASTER est une directive de l'Union européenne : elle ne concerne que les flux de dividendes entre États membres de l'UE. Elle ne change absolument rien — ni avant, ni après 2030 — pour les dividendes en provenance de pays hors UE : ni les États-Unis, ni le Japon, ni le Canada, ni surtout la [Suisse](${countryHref("fr", ch.slug.fr)}), pourtant le plus gros gisement de récupération pour un investisseur français (écart de ${pct(recoveryGap(ch, "FR"), "fr")} entre le taux retenu et le taux dû). Pour ces pays, les procédures nationales actuelles — formulaire 83 suisse, W-8BEN américain, etc. — resteront la seule voie, quelle que soit l'issue de FASTER en Europe.`,
  },
  {
    type: "p",
    text: `À l'inverse, un pays de l'UE réputé simple comme la [Belgique](${countryHref("fr", be.slug.fr)}) (formulaire 276 Div.-Aut., ${yearsFr(be.sol.years)} pour agir) fait partie des dossiers que FASTER pourrait, à terme, simplifier encore — sans que cela change quoi que ce soit à la manière de traiter vos dividendes belges retenus cette année.`,
  },
  { type: "h2", text: `Vos questions sur la directive FASTER` },
  {
    type: "faq",
    items: [
      {
        question: `Dois-je attendre 2030 pour réclamer mes dividendes étrangers actuels ?`,
        answer: `Non. FASTER n'a aucun effet rétroactif et ne modifie aucun délai de prescription en cours. Un trop-perçu de 2026 doit être réclamé selon les règles de 2026, sous peine de prescription bien avant que la directive ne s'applique.`,
      },
      {
        question: `FASTER va-t-elle supprimer les délais de prescription actuels ?`,
        answer: `Non, ni avant ni après son application : la directive porte sur la rapidité et la simplicité des procédures de remboursement et d'allègement à la source, pas sur les délais pour agir. Chaque pays continuera d'avoir ses propres règles de prescription.`,
      },
      {
        question: `FASTER concernera-t-elle mes dividendes suisses, américains ou canadiens ?`,
        answer: `Non. C'est une directive de l'Union européenne : elle ne couvre que les paiements entre États membres de l'UE. Les pays hors UE (Suisse, États-Unis, Royaume-Uni post-Brexit, Japon, Canada, Australie…) restent entièrement en dehors de son champ.`,
      },
      {
        question: `Une fois FASTER applicable, n'aurai-je plus besoin de réclamer quoi que ce soit ?`,
        answer: `Cela dépendra du mécanisme choisi par chaque État membre. En allègement à la source, le bon taux s'appliquerait dès le versement — plus rien à réclamer, comme pour un W-8BEN valide sur des actions américaines. En remboursement rapide, une demande reste nécessaire, simplement traitée plus vite (jusqu'à 60 jours). Certains pays pourraient aussi continuer d'appliquer leur procédure actuelle si les seuils d'application de FASTER ne sont pas atteints.`,
      },
      {
        question: `Où en sera-t-on d'ici 2030 ?`,
        answer: `Les États membres transposent la directive en droit national jusqu'au 31 décembre 2028, ce qui laisse place à des ajustements. Nous suivons ces évolutions et mettrons cet article à jour à mesure que les textes nationaux se précisent — en particulier pour la France.`,
      },
    ],
  },
  {
    type: "p",
    text: `En résumé : FASTER est une bonne nouvelle à moyen terme pour la simplicité des démarches au sein de l'UE, mais elle ne doit rien changer à votre calendrier aujourd'hui. Le meilleur réflexe reste de vérifier ce qui expire en premier.`,
  },
  {
    type: "cta",
    routeKey: "solCalculator",
    label: `Vérifier mes délais restants`,
    note: `Gratuit, sans compte — pour ne pas laisser un trop-perçu se prescrire en attendant 2030.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Since its adoption, the EU's "FASTER" directive keeps coming up in tax press and wealth-management circles, framed as the coming end of cross-border dividend withholding headaches. That's largely true — but the date that matters for you is 2030, not 2026. If you have foreign dividends withheld this year, waiting on FASTER would be a mistake: they remain governed by today's rules and deadlines, with no retroactive effect from this reform whatsoever.`,
  },
  { type: "h2", text: `What the FASTER directive actually is` },
  {
    type: "p",
    text: `FASTER ("Faster and Safer Relief of Excess Withholding Taxes") is Directive (EU) 2025/50, adopted by the Council of the European Union on 10 December 2024 and published in the EU Official Journal on 10 January 2025. It aims to harmonise and speed up the recovery of excess withholding tax on dividends (and, in some cases, interest) paid across EU member states. Each member state has until **31 December 2028** to transpose it into national law, and the new rules will only apply from **1 January 2030**.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `The number to remember`,
    text: `Between today and FASTER's application date, there is nearly four years to go. Nothing makes the directive retroactive: dividends already paid remain governed by the rules and statutes of limitations in force at the time of payment.`,
  },
  { type: "h2", text: `The two mechanisms Brussels put on the table` },
  {
    type: "p",
    text: `FASTER doesn't replace national regimes with one single system: it frames two mechanisms that each member state may choose to adopt (either, both, or neither if it already runs a comprehensive domestic system), depending on whether it already has a comprehensive domestic relief-at-source procedure.`,
  },
  {
    type: "ul",
    items: [
      `**Relief at source**: the reduced treaty rate applies directly at the time of payment, with no cash advance and no after-the-fact claim from the investor.`,
      `**Quick refund**: tax is withheld at the full rate but refunded within a capped window — up to 60 calendar days after the end of the period to request it, versus several months or even years under some current national procedures.`,
      `**Electronic tax residence certificate (eTRC)**: a harmonised digital document, issued by the residence country's administration within 14 calendar days of a complete request, valid for a maximum of one calendar or fiscal year.`,
    ],
  },
  {
    type: "p",
    text: `In practice, a relief-at-source mechanism paired with an eTRC would look, for an investor, much like what you may already know from US shares via Form W-8BEN: the correct rate applies at payment, with no refund file to build afterwards. [Our W-8BEN guide](${articleHref("en", W8BEN_SLUG.en)}) gives a concrete sense of what that kind of mechanism looks like once in place — and its own pitfalls (validity, renewal, silent expiry).`,
  },
  { type: "h2", text: `What changes absolutely nothing before 2030` },
  {
    type: "p",
    text: `Take a concrete example with a country FASTER will directly concern: Germany, an EU member state. A French resident receiving German dividends today remains subject to the current mechanics — full-rate withholding, an after-the-fact refund claim with the BZSt, a ${yearsEn(de.sol.years)} window. FASTER changes none of that before it takes effect.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld at source today (${pct(de.statutoryRate, "en")})`,
    withheldAmount: eur(deWithheld, "en"),
    owedLabel: `Owed by a French resident (${pct(treatyRateFor(de, "FR"), "en")})`,
    owedAmount: eur(deOwed, "en"),
    treatyRef: `France–Germany treaty`,
    recoverLabel: `Recoverable over-withholding, under the current procedure`,
    recoverAmount: eur(deRecoverable, "en"),
    footnote: `Example for ${eur(DE_GROSS, "en")} of gross German dividends paid in 2026 — indicative amounts. This over-withholding is claimed under the current BZSt procedure, with a ${yearsEn(de.sol.years)} window from the end of the payment's calendar year: FASTER, not yet applicable, plays no part in this calculation.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `"A reform is coming" is not a reason to wait`,
    text: `The real risk isn't misunderstanding FASTER — it's letting a claim sit because it will "sort itself out eventually." Current statutes of limitations keep running uninterrupted through 2030 and beyond: [our country-by-country deadline ranking](${articleHref("en", SOL_RANKING_SLUG.en)}) and [what actually happens once a deadline passes](${articleHref("en", MISSED_DEADLINE_SLUG.en)}) both show that a lapsed refund is gone for good, EU reform or not.`,
  },
  { type: "h2", text: `Even after 2030, rollout won't be automatic everywhere` },
  {
    type: "p",
    text: `Two caveats worth stating carefully, four years out and ahead of full national transposition. First, FASTER's procedural obligations (relief at source and/or quick refund) don't apply uniformly to every member state in every case: they primarily target states that don't already run a comprehensive domestic relief-at-source system, or whose market capitalisation exceeds a 1.5% threshold for four consecutive years (measured against ESMA data through 31 December 2028) — only the digital residence certificate (eTRC) will apply uniformly everywhere. Second, each member state retains discretion to fall back on its standard national procedure where a file is incomplete or under audit. **To be confirmed as transposition proceeds**: early signals suggest France may favour relief at source over the quick-refund route, but nothing is settled ahead of the 31 December 2028 transposition deadline — we will update this page as the French implementing text firms up.`,
  },
  { type: "h2", text: `Switzerland, the US, Japan: outside FASTER's scope, today and after 2030` },
  {
    type: "p",
    text: `FASTER is an EU directive: it only covers dividend flows between EU member states. It changes absolutely nothing — neither before nor after 2030 — for dividends from non-EU countries: not the United States, not Japan, not Canada, and certainly not [Switzerland](${countryHref("en", ch.slug.en)}), still the largest recovery pool for a French investor (a ${pct(recoveryGap(ch, "FR"), "en")} gap between the rate withheld and the rate owed). For these countries, current national procedures — the Swiss Form 83, the US W-8BEN, and so on — remain the only route, regardless of how FASTER plays out in Europe.`,
  },
  {
    type: "p",
    text: `Conversely, an EU country already known for being relatively simple, like [Belgium](${countryHref("en", be.slug.en)}) (form 276 Div.-Aut., ${yearsEn(be.sol.years)} to act), is among the files FASTER could eventually simplify further — without that changing anything about how you should handle your Belgian dividends withheld this year.`,
  },
  { type: "h2", text: `Your questions about the FASTER directive` },
  {
    type: "faq",
    items: [
      {
        question: `Do I need to wait until 2030 to claim my current foreign dividends?`,
        answer: `No. FASTER has no retroactive effect and changes no statute of limitations currently running. A 2026 over-withholding must be claimed under 2026 rules, or it risks lapsing well before the directive ever applies.`,
      },
      {
        question: `Will FASTER remove current statutes of limitations?`,
        answer: `No, neither before nor after it applies: the directive is about the speed and simplicity of refund and relief-at-source procedures, not about deadlines to act. Each country will keep its own limitation rules.`,
      },
      {
        question: `Will FASTER cover my Swiss, US or Canadian dividends?`,
        answer: `No. It's an EU directive: it only covers payments between EU member states. Non-EU countries (Switzerland, the US, post-Brexit UK, Japan, Canada, Australia…) remain entirely outside its scope.`,
      },
      {
        question: `Once FASTER applies, will I never need to file a claim again?`,
        answer: `That depends on the mechanism each member state chooses. Under relief at source, the correct rate would apply at payment — nothing left to claim, much like a valid W-8BEN on US shares. Under quick refund, a claim is still required, just processed faster (up to 60 days). Some countries may also keep their current procedure if FASTER's application thresholds aren't met.`,
      },
      {
        question: `Where will things stand by 2030?`,
        answer: `Member states are transposing the directive into national law through 31 December 2028, leaving room for adjustments along the way. We track these developments and will update this article as national implementing texts firm up — France's in particular.`,
      },
    ],
  },
  {
    type: "p",
    text: `Bottom line: FASTER is good medium-term news for the simplicity of EU claims, but it should change nothing about your timeline today. The best move is still to check what expires first.`,
  },
  {
    type: "cta",
    routeKey: "solCalculator",
    label: `Check my remaining deadlines`,
    note: `Free, no account needed — don't let an over-withholding lapse while waiting for 2030.`,
  },
];

export const fasterDirectiveEuWithholdingTax: Article = {
  id: "faster-directive-eu-withholding-tax",
  slug: {
    fr: "directive-faster-retenue-a-la-source-2030",
    en: "eu-faster-directive-withholding-tax-2030",
  },
  category: "problems",
  title: {
    fr: "Directive FASTER : la réforme européenne de la retenue à la source n'entrera en vigueur qu'en 2030",
    en: "The EU's FASTER directive on withholding tax won't apply before 2030",
  },
  description: {
    fr: `L'Union européenne a adopté la directive FASTER pour accélérer le remboursement des retenues à la source sur dividendes transfrontaliers au sein de l'UE. Son application ne commence qu'au 1er janvier 2030 : ce qu'elle changera, ce qu'elle ne change pas d'ici là, et pourquoi attendre serait une erreur pour vos dividendes déjà versés.`,
    en: `The EU has adopted the FASTER directive to speed up withholding tax relief on cross-border dividends within the EU. It only applies from 1 January 2030: what it will change, what stays exactly as it is until then, and why waiting would cost you on dividends already paid.`,
  },
  updated: "2026-08-08",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["DE", "CH", "BE"],
};
