import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, href } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * COST — "The W-8BEN explained (and why we charge for a free form)".
 * Sheridan angle pushed to the end: the form is free at the IRS, the article
 * teaches the reader to do it alone, and only then explains when paying our
 * fixed fee is rational. All rates/prices computed from the data layer.
 */

const us = getCountryById("US")!;
const usTreaty = treatyRateFor(us, "FR");

const eur = (n: number, locale: Locale) =>
  formatCurrency(n, locale, "EUR", Number.isInteger(n) ? 0 : 2);
const usd = (n: number, locale: Locale) =>
  formatCurrency(n, locale, "USD", Number.isInteger(n) ? 0 : 2);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

// Before/after table, per 1,000 USD of gross US dividends.
const DIV_BASE = 1_000;
const withheldWithout = DIV_BASE * us.statutoryRate;
const withheldWith = DIV_BASE * usTreaty;
const netWithout = DIV_BASE - withheldWithout;
const netWith = DIV_BASE - withheldWith;
const gapPerBase = withheldWithout - withheldWith;

// Ledger example: past over-withholding on 2,000 USD of gross dividends.
const ledgerGross = 2_000;
const ledgerWithheld = ledgerGross * us.statutoryRate;
const ledgerOwed = ledgerGross * usTreaty;
const ledgerRecoverable = ledgerWithheld - ledgerOwed;

const IRS_W8BEN_URL = "https://www.irs.gov/forms-pubs/about-form-w-8-ben";

/** Canonical slug of the sibling cost article (same content batch). */
const COST_SLUG = {
  fr: "combien-coute-recuperation-withholding-tax",
  en: "cost-of-withholding-tax-recovery",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Disons-le d'emblée : le formulaire W-8BEN est **gratuit**. L'IRS le met à disposition de tous, aucun intermédiaire n'est requis, et ce guide vous montre comment le remplir seul, ligne par ligne. Correctement en place chez votre courtier, il ramène la retenue américaine sur vos dividendes de ${pct(us.statutoryRate, "fr")} à ${pct(usTreaty, "fr")} pour un résident français (taux indicatifs, revus en juin 2026). Nos ${eur(PRICING.fixedServices.w8ben, "fr")} ne vendent pas l'accès au formulaire : ils vendent la vérification, le suivi d'expiration et la cohérence multi-comptes — et dans beaucoup de cas, vous n'en avez pas besoin. On vous explique lesquels.`,
  },
  {
    type: "p",
    text: `Le scénario classique : votre premier dividende américain tombe, et ${pct(us.statutoryRate, "fr")} se sont volatilisés au lieu des ${pct(usTreaty, "fr")} prévus par la convention fiscale franco-américaine. La différence ne vient ni de votre courtier ni d'une taxe mystérieuse : il manque — ou il a expiré — un simple formulaire de trois parties. Voici à quoi il sert, où le trouver gratuitement, comment le remplir sans erreur, quand il expire, et ce qu'on peut faire des retenues déjà subies.`,
  },
  { type: "h2", text: `À quoi sert le formulaire W-8BEN ?` },
  {
    type: "p",
    text: `Le W-8BEN certifie deux choses auprès de l'intermédiaire qui vous verse des revenus américains : vous n'êtes pas une « US person », et vous résidez dans un pays lié aux États-Unis par une convention fiscale. Muni de ce document valide, votre courtier applique directement le taux conventionnel à la source — ${pct(usTreaty, "fr")} sur les dividendes pour un résident de France au lieu du taux par défaut de ${pct(us.statutoryRate, "fr")}. C'est ce qu'on appelle le **relief at source** : le bon taux dès le versement, rien à réclamer ensuite.`,
  },
  {
    type: "p",
    text: `Deux précisions importantes. Le W-8BEN n'est pas une déclaration d'impôt : il ne se transmet pas à l'IRS par vos soins, il se remet à votre courtier ou dépositaire. Et il n'a **aucun effet rétroactif** : il corrige les versements futurs, pas les retenues déjà subies — pour celles-là, voyez plus bas.`,
  },
  {
    type: "table",
    caption: `Effet du W-8BEN pour un résident fiscal français, par tranche de ${usd(DIV_BASE, "fr")} de dividendes américains bruts. Taux indicatifs, revus en juin 2026.`,
    headers: [``, `Sans W-8BEN valide`, `Avec W-8BEN valide`],
    rows: [
      [`Taux de retenue américaine`, pct(us.statutoryRate, "fr"), pct(usTreaty, "fr")],
      [`Retenue sur ${usd(DIV_BASE, "fr")} de dividendes`, usd(withheldWithout, "fr"), usd(withheldWith, "fr")],
      [`Net encaissé`, usd(netWithout, "fr"), usd(netWith, "fr")],
      [`Manque à gagner`, `${usd(gapPerBase, "fr")} par tranche de ${usd(DIV_BASE, "fr")}`, `—`],
    ],
  },
  { type: "h2", text: `Où trouver le W-8BEN gratuitement (et pourquoi vous l'avez peut-être déjà signé) ?` },
  {
    type: "p",
    text: `[Le formulaire et sa notice officielle sont téléchargeables gratuitement sur irs.gov](${IRS_W8BEN_URL}) — méfiez-vous des sites qui font payer le simple téléchargement. Mais dans la pratique, la plupart des courtiers en ligne intègrent le W-8BEN à leur parcours d'ouverture de compte : le questionnaire que vous avez rempli à l'inscription en tenait probablement lieu. Avant toute chose, vérifiez donc dans votre espace client **la date de signature** de votre W-8BEN existant et le taux réellement appliqué à votre dernier dividende américain. Un formulaire expiré ne prévient pas : il vous rebascule silencieusement à ${pct(us.statutoryRate, "fr")}.`,
  },
  { type: "h2", text: `Comment remplir le W-8BEN ligne par ligne ?` },
  {
    type: "p",
    text: `Le formulaire tient sur une page et se divise en trois parties. Voici chaque ligne, avec le piège associé — c'est le même niveau de contrôle que nous appliquons en interne.`,
  },
  { type: "h3", text: `Partie I — Identification` },
  {
    type: "ul",
    items: [
      `**Ligne 1 — Nom.** Votre nom complet, tel qu'il figure sur vos papiers d'identité. Une société ou une SCI ne remplit pas ce formulaire : les entités relèvent du W-8BEN-E, nettement plus lourd.`,
      `**Ligne 2 — Pays de citoyenneté.** Votre nationalité — à ne pas confondre avec le pays de résidence fiscale, qui arrive en partie II.`,
      `**Ligne 3 — Adresse de résidence permanente.** Votre adresse réelle : pas de boîte postale, pas d'adresse « c/o », et une adresse américaine appelle des justifications supplémentaires. C'est la ligne la plus scrutée du formulaire.`,
      `**Ligne 4 — Adresse postale.** Uniquement si elle diffère de la ligne 3 ; sinon, laissez vide.`,
      `**Ligne 5 — Numéro fiscal américain (SSN ou ITIN).** Vide dans l'immense majorité des cas : il n'est pas nécessaire pour bénéficier du taux conventionnel sur des dividendes de portefeuille.`,
      `**Ligne 6a — Numéro fiscal étranger.** Votre numéro fiscal français (13 chiffres, en tête de votre avis d'imposition). Le laisser vide sans cocher la case 6b est l'un des oublis les plus fréquents.`,
      `**Ligne 7 — Numéro de référence.** Optionnelle ; certains intermédiaires y font figurer votre numéro de compte.`,
      `**Ligne 8 — Date de naissance.** Au format américain MM-JJ-AAAA : le 3 juillet 1980 s'écrit 07-03-1980. L'inversion jour/mois est un grand classique.`,
    ],
  },
  { type: "h3", text: `Partie II — Le bénéfice de la convention fiscale` },
  {
    type: "ul",
    items: [
      `**Ligne 9 — Pays de résidence au sens de la convention.** « France » pour un résident fiscal français. C'est cette ligne qui déclenche le passage de ${pct(us.statutoryRate, "fr")} à ${pct(usTreaty, "fr")} — l'oublier vide le formulaire de son intérêt.`,
      `**Ligne 10 — Taux et conditions spéciaux.** Dans la quasi-totalité des cas de dividendes de portefeuille, elle reste **vide** : le taux conventionnel standard s'applique sans elle. Elle ne sert qu'à revendiquer un régime dérogatoire particulier.`,
    ],
  },
  { type: "h3", text: `Partie III — Certification et signature` },
  {
    type: "p",
    text: `Signature, nom en toutes lettres et date — au format américain, encore. Si vous signez pour quelqu'un d'autre (mandat, représentation légale), la case dédiée doit l'indiquer. Un formulaire non signé ou non daté est tout simplement sans valeur : l'intermédiaire continuera d'appliquer ${pct(us.statutoryRate, "fr")}.`,
  },
  { type: "h2", text: `Quand le W-8BEN expire-t-il, et comment le renouveler ?` },
  {
    type: "p",
    text: `Un W-8BEN reste valable jusqu'à la **fin de la troisième année civile suivant sa signature** : signé le 15 mars 2026, il expire le 31 décembre 2029. Il devient aussi caduc dès qu'un changement de situation le rend inexact — un déménagement dans un autre pays, typiquement — avec, en règle générale, 30 jours pour remettre un formulaire à jour. Le renouvellement est identique au dépôt initial : un nouveau formulaire, qui remplace l'ancien.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `L'expiration silencieuse`,
    text: `Aucun courtier n'est tenu de vous alerter avant l'échéance. Le premier symptôme est une retenue à ${pct(us.statutoryRate, "fr")} sur un dividende — parfois découverte des mois plus tard. Notez l'échéance dans votre agenda dès la signature ; notre abonnement Suivi & Alertes (${eur(PRICING.subscription.monthly, "fr")} par mois ou ${eur(PRICING.subscription.yearly, "fr")} par an et par portefeuille) surveille précisément ces dates, parmi d'autres échéances.`,
  },
  { type: "h2", text: `Et les retenues déjà prélevées à ${pct(us.statutoryRate, "fr")} par le passé ?` },
  {
    type: "p",
    text: `Le W-8BEN ne répare pas le passé : les périodes sans formulaire valide relèvent d'une **procédure de récupération** distincte auprès de l'administration américaine, enfermée en règle générale dans un délai d'environ ${us.sol.years} ans. Concrètement :`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenue appliquée sans W-8BEN (${pct(us.statutoryRate, "fr")})`,
    withheldAmount: usd(ledgerWithheld, "fr"),
    owedLabel: `Retenue due avec la convention (${pct(usTreaty, "fr")})`,
    owedAmount: usd(ledgerOwed, "fr"),
    treatyRef: `Convention fiscale FR-US — dividendes`,
    recoverLabel: `Trop-perçu récupérable a posteriori`,
    recoverAmount: usd(ledgerRecoverable, "fr"),
    footnote: `Exemple illustratif sur ${usd(ledgerGross, "fr")} de dividendes américains bruts — taux revus en juin 2026. La récupération a posteriori est une démarche distincte du W-8BEN, soumise à prescription.`,
  },
  {
    type: "p",
    text: `Cette voie passe par notre [service de récupération](${href("fr", "serviceRecovery")}) au succès — dont [la grille et les exemples calculés sont détaillés ici](${articleHref("fr", COST_SLUG.fr)}) — et nécessite parfois un ITIN, un identifiant fiscal américain (forfait ${eur(PRICING.fixedServices.itin, "fr")}, déduit de la commission si vous basculez vers une récupération complète). Premier réflexe dans tous les cas : vérifier que le délai n'est pas déjà expiré avec le [calculateur de prescription](${href("fr", "solCalculator")}), gratuit.`,
  },
  { type: "h2", text: `Pourquoi payer ${eur(PRICING.fixedServices.w8ben, "fr")} pour un formulaire gratuit ?` },
  {
    type: "p",
    text: `Réponse honnête : dans beaucoup de cas, ne payez pas. Un seul courtier, un parcours d'ouverture qui intègre le formulaire, le guide ci-dessus sous les yeux — faites-le vous-même, c'est notre recommandation sincère. Notre [forfait W-8BEN à ${eur(PRICING.fixedServices.w8ben, "fr")}](${href("fr", "serviceW8ben")}) (tarif indicatif, issu de notre grille publiée) devient rationnel dans des situations précises :`,
  },
  {
    type: "ul",
    items: [
      `**Vous avez plusieurs comptes ou courtiers.** Chaque intermédiaire exige son propre formulaire : nous préparons l'ensemble à partir d'un seul dossier, avec des informations rigoureusement identiques partout.`,
      `**Une erreur vous coûterait cher en silence.** ${pct(us.statutoryRate, "fr")} au lieu de ${pct(usTreaty, "fr")}, c'est ${usd(gapPerBase, "fr")} perdus par tranche de ${usd(DIV_BASE, "fr")} de dividendes, chaque année, sans aucun message d'erreur. La vérification vaut ce qu'elle évite.`,
      `**Votre situation sort du cas standard.** Adresse partagée entre deux pays, résidence fiscale récente, mandat de gestion : les lignes 3, 4 et 9 méritent alors un second regard.`,
      `**Vous gérez une entité.** Le W-8BEN-E (sociétés, structures) est un tout autre exercice — huit pages et une trentaine de statuts possibles ; le forfait est à ${eur(PRICING.fixedServices.w8benE, "fr")}, et là, franchement, l'accompagnement se justifie.`,
      `**Vous voulez déléguer le suivi d'expiration.** La date de fin de troisième année civile est exactement le genre d'échéance qu'on oublie — voir l'encadré ci-dessus.`,
    ],
  },
  {
    type: "p",
    text: `Tous ces tarifs sortent de notre [grille publiée](${href("fr", "pricing")}) — pas de devis surprise, pas de supplément découvert en cours de route.`,
  },
  { type: "h2", text: `Vos questions sur le W-8BEN` },
  {
    type: "faq",
    items: [
      {
        question: `Mon courtier a-t-il déjà déposé un W-8BEN pour moi ?`,
        answer: `Très probablement, si vous avez ouvert votre compte chez un courtier en ligne : le questionnaire d'ouverture en tient souvent lieu. Vérifiez trois choses : la date de signature (expiration fin de la troisième année civile), le pays de résidence déclaré, et le taux réellement appliqué à votre dernier dividende américain — ${pct(usTreaty, "fr")}, et non ${pct(us.statutoryRate, "fr")}.`,
      },
      {
        question: `Le W-8BEN me dispense-t-il d'impôt en France ?`,
        answer: `Non. Il agit uniquement sur la retenue américaine à la source. Vos dividendes restent imposables en France selon votre situation ; la retenue conventionnelle ouvre en principe droit à un crédit d'impôt à faire valoir dans votre déclaration. Nous décrivons ici la mécanique administrative — pas un conseil fiscal personnalisé.`,
      },
      {
        question: `Faut-il un ITIN pour remplir un W-8BEN ?`,
        answer: `Non : le numéro fiscal français suffit (ligne 6a). L'ITIN — un identifiant fiscal américain — ne devient utile que dans certains dossiers de remboursement a posteriori auprès de l'IRS. Le cas échéant, notre forfait ITIN est à ${eur(PRICING.fixedServices.itin, "fr")}, déduit de la commission au succès si vous basculez ensuite vers une récupération complète.`,
      },
      {
        question: `Que se passe-t-il si je me trompe dans le formulaire ?`,
        answer: `Dans un cas standard, rien de punitif : un formulaire invalide laisse simplement le taux par défaut de ${pct(us.statutoryRate, "fr")} s'appliquer — et l'écart s'accumule, dividende après dividende. La correction est simple : signer un nouveau formulaire, qui remplace l'ancien. Pour le trop-retenu passé, c'est la procédure de récupération décrite plus haut.`,
      },
      {
        question: `Un seul W-8BEN couvre-t-il tous mes comptes ?`,
        answer: `Non : en pratique, chaque courtier ou dépositaire exige le sien. Les informations doivent être identiques partout — c'est précisément le scénario multi-comptes où notre forfait devient rationnel.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "contact",
    label: `Faire vérifier ou établir votre W-8BEN`,
    note: `Forfait ${eur(PRICING.fixedServices.w8ben, "fr")}, grille publiée — ou suivez le guide ci-dessus et faites-le vous-même.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Let's say it upfront: the W-8BEN form is **free**. The IRS makes it available to everyone, no intermediary is required, and this guide shows you how to complete it on your own, line by line. Properly in place with your broker, it cuts US withholding on your dividends from ${pct(us.statutoryRate, "en")} to ${pct(usTreaty, "en")} for a French resident (indicative rates, reviewed in June 2026). Our ${eur(PRICING.fixedServices.w8ben, "en")} does not sell access to the form: it sells verification, expiry tracking and multi-account consistency — and in many cases you don't need it. We'll tell you which ones.`,
  },
  {
    type: "p",
    text: `The classic scenario: your first US dividend lands and ${pct(us.statutoryRate, "en")} has vanished instead of the ${pct(usTreaty, "en")} the French-American tax treaty provides for. The difference comes neither from your broker's greed nor from some mystery tax: a simple three-part form is missing — or has expired. Here is what it does, where to get it for free, how to fill it in without mistakes, when it expires, and what can be done about the tax already withheld.`,
  },
  { type: "h2", text: `What is the W-8BEN form for?` },
  {
    type: "p",
    text: `The W-8BEN certifies two things to the intermediary paying you US income: you are not a "US person", and you reside in a country that has a tax treaty with the United States. With that valid document on file, your broker applies the treaty rate directly at source — ${pct(usTreaty, "en")} on dividends for a French resident instead of the default ${pct(us.statutoryRate, "en")}. That is what **relief at source** means: the right rate from the moment of payment, nothing to claim back afterwards.`,
  },
  {
    type: "p",
    text: `Two important clarifications. The W-8BEN is not a tax return: you do not send it to the IRS yourself, you hand it to your broker or custodian. And it has **no retroactive effect**: it fixes future payments, not the tax already withheld — for that, see below.`,
  },
  {
    type: "table",
    caption: `Effect of the W-8BEN for a French tax resident, per ${usd(DIV_BASE, "en")} of gross US dividends. Indicative rates, reviewed in June 2026.`,
    headers: [``, `Without a valid W-8BEN`, `With a valid W-8BEN`],
    rows: [
      [`US withholding rate`, pct(us.statutoryRate, "en"), pct(usTreaty, "en")],
      [`Withheld on ${usd(DIV_BASE, "en")} of dividends`, usd(withheldWithout, "en"), usd(withheldWith, "en")],
      [`Net received`, usd(netWithout, "en"), usd(netWith, "en")],
      [`Money left on the table`, `${usd(gapPerBase, "en")} per ${usd(DIV_BASE, "en")}`, `—`],
    ],
  },
  { type: "h2", text: `Where can you get the W-8BEN for free (and why you may have already signed one)?` },
  {
    type: "p",
    text: `[The form and its official instructions can be downloaded free of charge from irs.gov](${IRS_W8BEN_URL}) — beware of websites charging for the mere download. In practice, though, most online brokers embed the W-8BEN in their account-opening flow: the questionnaire you completed at sign-up probably served as one. So before anything else, check in your client area **the signature date** of your existing W-8BEN and the rate actually applied to your last US dividend. An expired form gives no warning: it silently reverts you to ${pct(us.statutoryRate, "en")}.`,
  },
  { type: "h2", text: `How do you fill in the W-8BEN, line by line?` },
  {
    type: "p",
    text: `The form fits on one page and has three parts. Here is every line, with its associated trap — the same level of checking we apply internally.`,
  },
  { type: "h3", text: `Part I — Identification` },
  {
    type: "ul",
    items: [
      `**Line 1 — Name.** Your full name, as it appears on your identity documents. A company or investment vehicle does not use this form: entities fall under the far heavier W-8BEN-E.`,
      `**Line 2 — Country of citizenship.** Your nationality — not to be confused with your country of tax residence, which comes in Part II.`,
      `**Line 3 — Permanent residence address.** Your real address: no PO box, no "c/o" address, and a US address will trigger requests for further justification. This is the most scrutinised line on the form.`,
      `**Line 4 — Mailing address.** Only if it differs from line 3; otherwise leave it blank.`,
      `**Line 5 — US taxpayer identification number (SSN or ITIN).** Blank in the vast majority of cases: it is not needed to claim the treaty rate on portfolio dividends.`,
      `**Line 6a — Foreign tax identifying number.** Your French tax number (13 digits, at the top of your avis d'imposition). Leaving it blank without ticking box 6b is one of the most common omissions.`,
      `**Line 7 — Reference number.** Optional; some intermediaries put your account number here.`,
      `**Line 8 — Date of birth.** In the US format MM-DD-YYYY: 3 July 1980 is written 07-03-1980. Swapping day and month is an absolute classic.`,
    ],
  },
  { type: "h3", text: `Part II — Claiming the treaty benefit` },
  {
    type: "ul",
    items: [
      `**Line 9 — Country of residence for treaty purposes.** "France" for a French tax resident. This is the line that triggers the drop from ${pct(us.statutoryRate, "en")} to ${pct(usTreaty, "en")} — forget it and the form loses its whole point.`,
      `**Line 10 — Special rates and conditions.** In virtually every portfolio-dividend case it stays **blank**: the standard treaty rate applies without it. It only serves to claim a specific derogatory regime.`,
    ],
  },
  { type: "h3", text: `Part III — Certification and signature` },
  {
    type: "p",
    text: `Signature, printed name and date — in the US format, again. If you sign on someone else's behalf (mandate, legal representation), the dedicated capacity box must say so. An unsigned or undated form is simply worthless: the intermediary will keep applying ${pct(us.statutoryRate, "en")}.`,
  },
  { type: "h2", text: `When does a W-8BEN expire, and how do you renew it?` },
  {
    type: "p",
    text: `A W-8BEN remains valid until the **end of the third calendar year after its signature**: signed on 15 March 2026, it expires on 31 December 2029. It also lapses as soon as a change of circumstances makes it inaccurate — a move to another country, typically — with, as a general rule, 30 days to file an updated form. Renewal is identical to the initial filing: a new form, which replaces the old one.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `The silent expiry`,
    text: `No broker is obliged to warn you before the deadline. The first symptom is a dividend withheld at ${pct(us.statutoryRate, "en")} — sometimes discovered months later. Note the expiry in your calendar the day you sign; our Monitoring & Alerts subscription (${eur(PRICING.subscription.monthly, "en")} per month or ${eur(PRICING.subscription.yearly, "en")} per year, per portfolio) tracks precisely these dates, among other deadlines.`,
  },
  { type: "h2", text: `What about the ${pct(us.statutoryRate, "en")} already withheld in the past?` },
  {
    type: "p",
    text: `The W-8BEN does not repair the past: periods without a valid form fall under a separate **recovery procedure** with the US administration, generally locked within a window of about ${us.sol.years} years. Concretely:`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withholding applied without a W-8BEN (${pct(us.statutoryRate, "en")})`,
    withheldAmount: usd(ledgerWithheld, "en"),
    owedLabel: `Withholding owed under the treaty (${pct(usTreaty, "en")})`,
    owedAmount: usd(ledgerOwed, "en"),
    treatyRef: `FR-US tax treaty — dividends`,
    recoverLabel: `Over-withholding recoverable after the fact`,
    recoverAmount: usd(ledgerRecoverable, "en"),
    footnote: `Illustrative example on ${usd(ledgerGross, "en")} of gross US dividends — rates reviewed in June 2026. After-the-fact recovery is a separate procedure from the W-8BEN and subject to a limitation period.`,
  },
  {
    type: "p",
    text: `That route runs through our success-based [recovery service](${href("en", "serviceRecovery")}) — [its grid and worked examples are detailed here](${articleHref("en", COST_SLUG.en)}) — and sometimes requires an ITIN, a US tax identifier (fixed fee ${eur(PRICING.fixedServices.itin, "en")}, deducted from the success fee if you upgrade to a full recovery). First reflex in every case: check that the window has not already closed with the free [deadline calculator](${href("en", "solCalculator")}).`,
  },
  { type: "h2", text: `Why pay ${eur(PRICING.fixedServices.w8ben, "en")} for a free form?` },
  {
    type: "p",
    text: `Honest answer: in many cases, don't. One broker, an account-opening flow that embeds the form, this guide in front of you — do it yourself, that is our sincere recommendation. Our [W-8BEN fixed-fee service at ${eur(PRICING.fixedServices.w8ben, "en")}](${href("en", "serviceW8ben")}) (indicative price, from our published grid) becomes rational in specific situations:`,
  },
  {
    type: "ul",
    items: [
      `**You have several accounts or brokers.** Each intermediary requires its own form: we prepare the full set from a single file, with rigorously identical information everywhere.`,
      `**A mistake would cost you dearly, in silence.** ${pct(us.statutoryRate, "en")} instead of ${pct(usTreaty, "en")} means ${usd(gapPerBase, "en")} lost per ${usd(DIV_BASE, "en")} of dividends, every year, with no error message. The check is worth what it prevents.`,
      `**Your situation is not the standard case.** An address split between two countries, a recent change of tax residence, a management mandate: lines 3, 4 and 9 then deserve a second pair of eyes.`,
      `**You manage an entity.** The W-8BEN-E (companies, structures) is another exercise entirely — eight pages and some thirty possible statuses; the fixed fee is ${eur(PRICING.fixedServices.w8benE, "en")}, and there, frankly, assistance earns its keep.`,
      `**You want the expiry tracked for you.** The end-of-third-calendar-year deadline is exactly the kind of date people forget — see the box above.`,
    ],
  },
  {
    type: "p",
    text: `All of these prices come from our [published grid](${href("en", "pricing")}) — no surprise quote, no supplement discovered along the way.`,
  },
  { type: "h2", text: `Your questions about the W-8BEN` },
  {
    type: "faq",
    items: [
      {
        question: `Has my broker already filed a W-8BEN for me?`,
        answer: `Very probably, if you opened your account with an online broker: the sign-up questionnaire often serves as one. Check three things: the signature date (expiry at the end of the third calendar year), the declared country of residence, and the rate actually applied to your last US dividend — ${pct(usTreaty, "en")}, not ${pct(us.statutoryRate, "en")}.`,
      },
      {
        question: `Does the W-8BEN exempt me from tax in France?`,
        answer: `No. It only acts on the US withholding at source. Your dividends remain taxable in France according to your situation; the treaty withholding in principle opens a right to a tax credit to claim in your French return. We describe the administrative mechanics here — not personalised tax advice.`,
      },
      {
        question: `Do I need an ITIN to fill in a W-8BEN?`,
        answer: `No: the French tax number is enough (line 6a). The ITIN — a US tax identifier — only becomes useful in certain after-the-fact refund claims with the IRS. If needed, our ITIN fixed fee is ${eur(PRICING.fixedServices.itin, "en")}, deducted from the success fee if you then upgrade to a full recovery.`,
      },
      {
        question: `What happens if I make a mistake on the form?`,
        answer: `In a standard case, nothing punitive: an invalid form simply lets the default ${pct(us.statutoryRate, "en")} keep applying — and the gap compounds, dividend after dividend. The fix is simple: sign a new form, which replaces the old one. For the tax already over-withheld, it is the recovery procedure described above.`,
      },
      {
        question: `Does one W-8BEN cover all my accounts?`,
        answer: `No: in practice, every broker or custodian requires its own. The information must be identical everywhere — which is precisely the multi-account scenario where our fixed fee becomes rational.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "contact",
    label: `Have your W-8BEN checked or filed`,
    note: `${eur(PRICING.fixedServices.w8ben, "en")} fixed fee, published grid — or follow the guide above and do it yourself.`,
  },
];

export const w8benExplained: Article = {
  id: "w8ben-explained",
  slug: {
    fr: "w-8ben-mode-demploi",
    en: "w-8ben-explained",
  },
  category: "cost",
  title: {
    fr: `W-8BEN : mode d'emploi complet (et pourquoi nous facturons ${eur(PRICING.fixedServices.w8ben, "fr")} un formulaire gratuit)`,
    en: `The W-8BEN explained: complete instructions (and why we charge ${eur(PRICING.fixedServices.w8ben, "en")} for a free form)`,
  },
  description: {
    fr: `Le W-8BEN est gratuit chez l'IRS. Tutoriel ligne par ligne pour le remplir seul, pièges, expiration et renouvellement — et les cas précis où notre forfait de ${eur(PRICING.fixedServices.w8ben, "fr")} (tarif indicatif) vaut la dépense.`,
    en: `The W-8BEN is free at the IRS. A line-by-line tutorial to complete it yourself, the traps, expiry and renewal — and the specific cases where our ${eur(PRICING.fixedServices.w8ben, "en")} fixed fee (indicative price) earns its keep.`,
  },
  updated: "2025-01-14",
  readingMinutes: 10,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US"],
};
