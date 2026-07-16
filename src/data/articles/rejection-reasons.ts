import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { getCountryById } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "The 7 most common rejection reasons".
 * Every rate, deadline and price below is computed from @/data/countries and
 * @/config/pricing at module load; nothing is restated by hand.
 */

const de = getCountryById("DE")!;
const ch = getCountryById("CH")!;
const ca = getCountryById("CA")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);
const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);

/** Canonical slugs of the sibling "problems" articles (owned by this content batch). */
const MISSED_DEADLINE_SLUG = {
  fr: "delai-de-prescription-depasse-que-faire",
  en: "missed-the-statute-of-limitations-what-now",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Aucun prestataire n'aime parler de ses dossiers rejetés. Nous préférons le faire avant que vous ne posiez la question : oui, des demandes de remboursement de retenue à la source sont rejetées — y compris des dossiers préparés sérieusement. Voici les sept motifs que les administrations fiscales étrangères opposent le plus souvent, la façon dont nous les neutralisons en amont, et ce que nous faisons quand le rejet tombe malgré tout.`,
  },
  {
    type: "p",
    text: `Une chose à garder en tête en lisant : notre [commission au succès](${href("fr", "pricing")}) n'est due que sur les montants effectivement récupérés. Un rejet définitif ne vous coûte rien — c'est nous qui portons ce risque. La prévention décrite ci-dessous n'est donc pas un argument marketing : c'est notre modèle économique.`,
  },
  {
    type: "ol",
    items: [
      `**Certificat de résidence absent ou d'un mauvais millésime** — la pièce maîtresse du dossier, et l'oubli le plus courant.`,
      `**Chaîne de détention non prouvée** — la spécialité de l'administration allemande.`,
      `**Formulaire obsolète, incomplet ou mal signé** — l'erreur bête qui coûte des mois.`,
      `**Montants incohérents entre relevés et demande** — brut, net, change, frais mélangés.`,
      `**Demande déposée hors délai** — le seul motif sans aucun recours.`,
      `**Qualité de bénéficiaire effectif contestée** — le point que les administrations scrutent le plus depuis les scandales d'arbitrage de dividendes.`,
      `**Réponse tardive à une demande de pièces complémentaires** — des fenêtres de 10 à 15 jours dans certains pays.`,
    ],
  },
  { type: "h2", text: `1. Certificat de résidence absent — ou du mauvais millésime` },
  {
    type: "p",
    text: `La quasi-totalité des administrations exigent un certificat de résidence fiscale couvrant **l'année du dividende**, visé par votre centre des impôts. L'erreur la plus banale consiste à joindre un certificat récent pour des dividendes anciens : un certificat émis en 2026 ne prouve pas votre résidence de 2023. Certaines administrations vont plus loin et imposent leur propre modèle — l'Allemagne, par exemple, fait viser un formulaire allemand par le fisc français.`,
  },
  {
    type: "p",
    text: `**Comment on le prévient.** Nous demandons un certificat par année réclamée, sur le formulaire du bon pays, et nous contrôlons le visa avant tout dépôt. Si cette pièce est la seule chose dont vous avez besoin, elle existe aussi en [forfait indépendant à ${eur(PRICING.fixedServices.residenceCertificate, "fr")}](${href("fr", "serviceResidenceCert")}).`,
  },
  {
    type: "p",
    text: `**Si ça arrive quand même.** Un rejet pour certificat manquant ou inadapté n'éteint pas votre droit : on redépose avec la bonne pièce, tant que le délai de prescription est ouvert. Le coût réel est du temps — des semaines, parfois des mois d'instruction supplémentaires.`,
  },
  { type: "h2", text: `2. Chaîne de détention non prouvée (le cas BZSt)` },
  {
    type: "p",
    text: `Le [Bundeszentralamt für Steuern allemand](${countryHref("fr", de.slug.fr)}) est l'administration la plus exigeante du panel sur la preuve : il faut démontrer la chaîne de détention complète du titre — qui détenait quoi, via quel dépositaire, à la date du détachement — avec attestations de dépôt (Depotbestätigung) et tax vouchers originaux. En compte omnibus, cette preuve ne va pas de soi : votre nom n'apparaît nulle part dans les livres du dépositaire allemand.`,
  },
  {
    type: "p",
    text: `**Comment on le prévient.** Nous identifions la chaîne de dépositaires et collectons les justificatifs **avant** de déposer, pas après la première demande de pièces. Quand un dépositaire facture ses attestations, ces débours vous sont refacturés à prix coûtant — jamais avec une marge.`,
  },
  {
    type: "p",
    text: `**Si ça arrive quand même.** On répond à la requête du BZSt avec les maillons manquants. C'est rattrapable dans la plupart des cas, mais la coopération des intermédiaires ne dépend ni de vous ni de nous : c'est le dossier type où l'anticipation fait gagner des mois.`,
  },
  { type: "h2", text: `3. Formulaire obsolète, incomplet ou mal signé` },
  {
    type: "p",
    text: `Chaque administration a ses formulaires, ses millésimes et ses exigences de signature. La [Suisse](${countryHref("fr", ch.slug.fr)}) illustre bien le sujet : la demande d'un résident de France passe par le formulaire 83 et, depuis 2025, le dépôt électronique auprès de l'AFC est obligatoire — un dossier papier peut être retourné sans examen. Ailleurs, une case oubliée, une signature au mauvais endroit ou une version périmée du formulaire suffisent à bloquer la demande.`,
  },
  {
    type: "p",
    text: `**Comment on le prévient.** Nos dossiers sont générés à partir des formulaires en vigueur au jour du dépôt, puis contrôlés avant signature. C'est exactement le type d'erreur que l'automatisation élimine presque totalement.`,
  },
  {
    type: "p",
    text: `**Si ça arrive quand même.** C'est le rejet le plus bénin : on corrige et on redépose. La seule vraie perte est du délai — sauf si la prescription tombe entre-temps, d'où l'intérêt de ne jamais déposer à la dernière minute.`,
  },
  { type: "h2", text: `4. Montants incohérents entre relevés et demande` },
  {
    type: "p",
    text: `Montant brut confondu avec le net, taux de change appliqué à une autre date que celle du versement, frais de dépositaire d'ADR agrégés à la retenue… Si les montants réclamés ne se réconcilient pas avec les relevés joints, l'administration ne corrige pas à votre place : elle rejette ou suspend.`,
  },
  {
    type: "p",
    text: `**Comment on le prévient.** Chaque demande part d'une réconciliation ligne à ligne entre vos relevés et les montants réclamés — c'est littéralement notre métier de base. Les frais de dépositaire d'ADR américains, par exemple, sont exclus d'office : ce n'est pas de la retenue à la source, et ils ne sont pas récupérables par cette voie.`,
  },
  {
    type: "p",
    text: `**Si ça arrive quand même.** Demande corrigée, accompagnée d'une note explicative. Les administrations acceptent volontiers les corrections sincères ; ce qu'elles sanctionnent, c'est l'incohérence laissée sans explication.`,
  },
  { type: "h2", text: `5. Demande déposée hors délai` },
  {
    type: "p",
    text: `C'est le seul motif de la liste sans voie de recours : une demande déposée après l'expiration du délai de prescription est rejetée, définitivement, quelle que soit sa qualité. Et les délais varient fortement d'un pays à l'autre — [le Canada ne laisse que ${ca.sol.years} ans](${countryHref("fr", ca.slug.fr)}) après la fin de l'année civile du prélèvement, quand d'autres pays en laissent cinq. Nous avons consacré [un article entier à cette question](${articleHref("fr", MISSED_DEADLINE_SLUG.fr)}).`,
  },
  {
    type: "p",
    text: `**Comment on le prévient.** Chaque échéance de chaque dossier est calculée et suivie. Vous pouvez vérifier les vôtres en deux minutes avec notre [calculateur de prescription gratuit](${href("fr", "solCalculator")}) ; pour un dossier déjà proche de l'échéance, un traitement prioritaire à ${eur(PRICING.fixedServices.priorityHandling, "fr")} fait passer la demande devant la file.`,
  },
  {
    type: "p",
    text: `**Si ça arrive quand même.** Rien. Personne ne peut rien, et quiconque prétend le contraire mérite votre méfiance. Ce qu'on peut encore faire, en revanche : sauver les années non prescrites du même portefeuille.`,
  },
  { type: "h2", text: `6. Qualité de bénéficiaire effectif contestée` },
  {
    type: "p",
    text: `L'administration peut contester que vous soyez le **bénéficiaire effectif** des dividendes : titres prêtés ou empruntés, achats-ventes serrés autour de la date de détachement, démembrement de propriété, structures interposées. Depuis les grands scandales d'arbitrage de dividendes, les administrations européennes examinent ce point de très près — et rejettent au moindre doute sérieux.`,
  },
  {
    type: "p",
    text: `**Comment on le prévient.** Nous passons chaque dossier au crible de ces signaux avant dépôt. Si votre situation présente un risque réel, nous vous le disons avant de déposer, pas après — quitte à vous déconseiller la demande.`,
  },
  {
    type: "p",
    text: `**Si ça arrive quand même.** On documente la propriété économique : dates d'acquisition, absence de prêt de titres, réalité des flux. Parfois, l'administration maintient son refus. Dans ce cas, notre règle s'applique sans discussion : pas de récupération, pas de commission.`,
  },
  { type: "h2", text: `7. Réponse tardive à une demande de pièces complémentaires` },
  {
    type: "p",
    text: `Beaucoup de rejets ne sanctionnent pas le dossier initial, mais le silence qui suit. Certaines administrations n'accordent que **10 à 15 jours** pour répondre à une demande de pièces complémentaires. Un courrier papier expédié depuis l'étranger, des vacances, une boîte mail saturée — et un dossier parfaitement valable est rejeté.`,
  },
  {
    type: "p",
    text: `**Comment on le prévient.** Le mandat que vous nous confiez fait de nous le destinataire de la correspondance : les requêtes arrivent chez nous, sont tracées, leurs échéances surveillées — et vous êtes notifié de chaque mouvement dans votre espace client.`,
  },
  {
    type: "p",
    text: `**Si ça arrive quand même.** Selon le pays, on demande la réouverture du dossier ou on redépose une demande complète. Possible uniquement si le délai de prescription n'est pas expiré — encore lui.`,
  },
  { type: "h2", text: `L'honnêteté oblige : un dossier parfait peut quand même traîner` },
  {
    type: "p",
    text: `Il faut le dire clairement : l'acceptation d'un dossier ne dit rien de sa vitesse de traitement. En Allemagne, l'instruction dépasse fréquemment 12 mois, dossier irréprochable ou non. Aucun prestataire ne contrôle le rythme d'une administration étrangère — quiconque vous promet une date ferme de remboursement l'invente. Ce que nous contrôlons vraiment : la qualité du dossier au moment du dépôt, les relances, et votre visibilité sur chaque étape depuis votre espace client.`,
  },
  {
    type: "table",
    caption: `Synthèse indicative — chaque administration a ses pratiques propres. Données revues en juin 2026.`,
    headers: [`Motif de rejet`, `Évitable en amont ?`, `Rattrapable après rejet ?`],
    rows: [
      [`Certificat absent / mauvais millésime`, `Oui`, `Oui — redépôt avec la bonne pièce`],
      [`Chaîne de détention non prouvée`, `Oui, en anticipant les justificatifs`, `Souvent — si les dépositaires coopèrent`],
      [`Formulaire obsolète / mal signé`, `Oui`, `Oui — correction et redépôt rapides`],
      [`Montants incohérents`, `Oui`, `Oui — demande corrigée et expliquée`],
      [`Demande hors délai`, `Oui`, `**Non — définitif**`],
      [`Bénéficiaire effectif contesté`, `Partiellement (diagnostic préalable)`, `Parfois — selon les preuves`],
      [`Réponse tardive à l'administration`, `Oui`, `Selon le pays et le délai restant`],
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `Le seul rejet sans recours`,
    text: `Hors délai, un trop-perçu est définitivement perdu — au Canada, la fenêtre n'est que de ${ca.sol.years} ans après la fin de l'année civile du prélèvement. Avant toute chose, vérifiez vos échéances : le [calculateur de prescription](${href("fr", "solCalculator")}) est gratuit et sans création de compte.`,
  },
  { type: "h2", text: `Vos questions sur les rejets` },
  {
    type: "faq",
    items: [
      {
        question: `Un rejet est-il définitif ?`,
        answer: `Non, sauf prescription. Six des sept motifs de cette liste se rattrapent par un redépôt ou une réponse complémentaire, tant que le délai de réclamation du pays est encore ouvert. Le seul rejet irréversible est la demande déposée hors délai.`,
      },
      {
        question: `Combien vous coûte un dossier rejeté ?`,
        answer: `Rien en commission : elle n'est due que sur les montants effectivement récupérés. Un redépôt après correction ne génère aucun frais supplémentaire de notre part — la commission ne s'applique qu'une fois, sur ce qui aboutit. Seule exception, prévue au contrat : les débours facturés par des tiers (attestations de dépositaires, par exemple), refacturés à prix coûtant.`,
      },
      {
        question: `Pouvez-vous garantir l'acceptation d'un dossier ?`,
        answer: `Non, et personne ne le peut : la décision appartient à l'administration étrangère. Ce que nous garantissons, c'est le mode de facturation — pas de récupération, pas de commission. Dans ce métier, une « garantie de résultat » est un signal d'alarme, pas un argument.`,
      },
      {
        question: `Un dossier rejeté une fois part-il avec un handicap ?`,
        answer: `Non. Les administrations examinent chaque dépôt sur pièces : un redépôt corrigé et complet est instruit normalement. L'important est de répondre point par point au motif du rejet initial — pas de renvoyer le même dossier en espérant un autre résultat.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "contact",
    label: `Faire analyser un rejet reçu`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `No provider likes talking about its rejected claims. We would rather do it before you ask: yes, withholding-tax refund claims do get rejected — including carefully prepared ones. Here are the seven grounds foreign tax administrations invoke most often, how we neutralise each one upfront, and what we do when a rejection lands anyway.`,
  },
  {
    type: "p",
    text: `One thing to keep in mind as you read: our [success fee](${href("en", "pricing")}) is only due on amounts actually recovered. A final rejection costs you nothing — we carry that risk. So the prevention work described below is not a marketing line: it is our business model.`,
  },
  {
    type: "ol",
    items: [
      `**Missing certificate of tax residence, or the wrong year's** — the file's cornerstone, and the most common omission.`,
      `**Unproven chain of custody** — the German administration's speciality.`,
      `**Outdated, incomplete or badly signed forms** — the silly mistake that costs months.`,
      `**Figures that don't match your statements** — gross, net, FX and fees mixed up.`,
      `**Filing after the deadline** — the only ground with no remedy at all.`,
      `**Beneficial ownership challenged** — the point administrations scrutinise hardest since the dividend-arbitrage scandals.`,
      `**Replying too late to a follow-up request** — 10-to-15-day windows in some countries.`,
    ],
  },
  { type: "h2", text: `1. Missing certificate of tax residence — or the wrong year's` },
  {
    type: "p",
    text: `Almost every administration requires a certificate of tax residence covering **the year of the dividend**, stamped by your local tax office. The most common mistake is attaching a recent certificate to old dividends: a certificate issued in 2026 does not prove where you were resident in 2023. Some administrations go further and impose their own template — Germany, for instance, has a German form stamped by the French tax office.`,
  },
  {
    type: "p",
    text: `**How we prevent it.** We request one certificate per year claimed, on the right country's form, and we check the stamp before anything is filed. If this document is all you need, it also exists as a [standalone fixed-fee service at ${eur(PRICING.fixedServices.residenceCertificate, "en")}](${href("en", "serviceResidenceCert")}).`,
  },
  {
    type: "p",
    text: `**If it happens anyway.** A rejection for a missing or mismatched certificate does not extinguish your right: we refile with the correct document, as long as the statute of limitations is still open. The real cost is time — weeks, sometimes months of extra processing.`,
  },
  { type: "h2", text: `2. Unproven chain of custody (the BZSt case)` },
  {
    type: "p",
    text: `Germany's [Federal Central Tax Office (BZSt)](${countryHref("en", de.slug.en)}) is the most demanding administration in our panel when it comes to evidence: you must demonstrate the security's full chain of custody — who held what, through which custodian, on the ex-date — with custody confirmations (Depotbestätigung) and original tax vouchers. In an omnibus account, that proof is anything but automatic: your name appears nowhere in the German custodian's books.`,
  },
  {
    type: "p",
    text: `**How we prevent it.** We map the custodian chain and collect the evidence **before** filing, not after the first information request. Where a custodian charges for its confirmations, those disbursements are passed on to you at cost — never with a markup.`,
  },
  {
    type: "p",
    text: `**If it happens anyway.** We answer the BZSt's request with the missing links. It is fixable in most cases, but the intermediaries' cooperation depends on neither you nor us: this is the textbook file where anticipation saves months.`,
  },
  { type: "h2", text: `3. Outdated, incomplete or badly signed forms` },
  {
    type: "p",
    text: `Every administration has its own forms, versions and signature requirements. [Switzerland](${countryHref("en", ch.slug.en)}) illustrates the point well: a French resident's claim goes through Form 83 and, since 2025, electronic filing with the Swiss FTA is mandatory — a paper file can be returned unexamined. Elsewhere, a missed box, a signature in the wrong place or a superseded form version is enough to block a claim.`,
  },
  {
    type: "p",
    text: `**How we prevent it.** Our files are generated from the form versions in force on the day of filing, then checked before signature. This is exactly the class of error automation all but eliminates.`,
  },
  {
    type: "p",
    text: `**If it happens anyway.** This is the most benign rejection: we correct and refile. The only real loss is time — unless the statute of limitations expires in the meantime, which is why you should never file at the last minute.`,
  },
  { type: "h2", text: `4. Figures that don't match your statements` },
  {
    type: "p",
    text: `Gross confused with net, exchange rates taken at the wrong date, ADR depositary fees lumped in with the withholding… If the amounts claimed cannot be reconciled with the statements attached, the administration will not fix it for you: it rejects or suspends.`,
  },
  {
    type: "p",
    text: `**How we prevent it.** Every claim starts with a line-by-line reconciliation between your statements and the amounts claimed — quite literally our core trade. US ADR depositary fees, for instance, are excluded from the outset: they are not withholding tax, and they cannot be recovered through this route.`,
  },
  {
    type: "p",
    text: `**If it happens anyway.** A corrected claim, with a covering note. Administrations readily accept good-faith corrections; what they penalise is an inconsistency left unexplained.`,
  },
  { type: "h2", text: `5. Filing after the deadline` },
  {
    type: "p",
    text: `This is the only ground on the list with no remedy whatsoever: a claim filed after the statute of limitations has expired is rejected, permanently, however good it is. And deadlines vary widely — [Canada allows only ${ca.sol.years} years](${countryHref("en", ca.slug.en)}) from the end of the calendar year of withholding, while other countries allow five. We devoted [a whole article to this question](${articleHref("en", MISSED_DEADLINE_SLUG.en)}).`,
  },
  {
    type: "p",
    text: `**How we prevent it.** Every deadline of every claim is computed and tracked. You can check yours in two minutes with our [free deadline calculator](${href("en", "solCalculator")}); for a claim already close to its deadline, priority handling at ${eur(PRICING.fixedServices.priorityHandling, "en")} moves it to the front of the queue.`,
  },
  {
    type: "p",
    text: `**If it happens anyway.** Nothing. Nobody can do anything, and anyone claiming otherwise deserves your suspicion. What can still be done, however: rescuing the non-expired years of the same portfolio.`,
  },
  { type: "h2", text: `6. Beneficial ownership challenged` },
  {
    type: "p",
    text: `The administration may dispute that you are the **beneficial owner** of the dividends: securities on loan, purchases and sales tightly wrapped around the ex-date, split legal ownership, interposed structures. Since the big dividend-arbitrage scandals, European administrations examine this point extremely closely — and reject at the first serious doubt.`,
  },
  {
    type: "p",
    text: `**How we prevent it.** We screen every file for those red flags before filing. If your situation carries a genuine risk, we tell you before filing, not after — even if that means advising against the claim.`,
  },
  {
    type: "p",
    text: `**If it happens anyway.** We document economic ownership: acquisition dates, absence of securities lending, the reality of the cash flows. Sometimes the administration upholds its refusal. In that case our rule applies, no argument: no recovery, no fee.`,
  },
  { type: "h2", text: `7. Replying too late to a follow-up request` },
  {
    type: "p",
    text: `Many rejections do not punish the original file but the silence that follows. Some administrations grant only **10 to 15 days** to answer a request for additional documents. A paper letter shipped from abroad, a holiday, an overflowing inbox — and a perfectly valid claim is rejected.`,
  },
  {
    type: "p",
    text: `**How we prevent it.** The mandate you give us makes us the recipient of the correspondence: requests land with us, are logged, their deadlines monitored — and you are notified of every movement in your client area.`,
  },
  {
    type: "p",
    text: `**If it happens anyway.** Depending on the country, we request that the file be reopened, or we refile a complete claim. Possible only if the statute of limitations has not expired — that deadline again.`,
  },
  { type: "h2", text: `In all honesty: a flawless file can still drag on` },
  {
    type: "p",
    text: `Let's say it plainly: a file being accepted says nothing about how fast it will be processed. In Germany, processing frequently exceeds 12 months, immaculate file or not. No provider controls the pace of a foreign administration — anyone promising you a firm refund date is making it up. What we do control: the quality of the file at filing, the follow-ups, and your visibility on every step from your client area.`,
  },
  {
    type: "table",
    caption: `Indicative summary — every administration has its own practice. Data reviewed in June 2026.`,
    headers: [`Rejection ground`, `Preventable upfront?`, `Fixable after rejection?`],
    rows: [
      [`Missing / wrong-year certificate`, `Yes`, `Yes — refile with the right document`],
      [`Unproven chain of custody`, `Yes, by collecting evidence early`, `Often — if custodians cooperate`],
      [`Outdated / badly signed form`, `Yes`, `Yes — quick correction and refiling`],
      [`Inconsistent figures`, `Yes`, `Yes — corrected and explained claim`],
      [`Filed after the deadline`, `Yes`, `**No — final**`],
      [`Beneficial ownership challenged`, `Partly (upfront screening)`, `Sometimes — evidence-dependent`],
      [`Late reply to the administration`, `Yes`, `Depends on country and time left`],
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `The one rejection with no remedy`,
    text: `Past the deadline, an over-withheld amount is permanently lost — in Canada the window is only ${ca.sol.years} years from the end of the calendar year of withholding. Before anything else, check your deadlines: the [deadline calculator](${href("en", "solCalculator")}) is free and requires no account.`,
  },
  { type: "h2", text: `Your questions about rejections` },
  {
    type: "faq",
    items: [
      {
        question: `Is a rejection final?`,
        answer: `No — except for late filing. Six of the seven grounds on this list can be cured by refiling or by a supplementary reply, as long as the country's claim window is still open. The only irreversible rejection is a claim filed after the deadline.`,
      },
      {
        question: `What does a rejected claim cost you?`,
        answer: `Nothing in fees: our commission is only due on amounts actually recovered. Refiling after a correction triggers no extra charge from us — the fee applies once, on what succeeds. The one contractual exception: third-party disbursements (custodian confirmations, for example), passed on at cost.`,
      },
      {
        question: `Can you guarantee a claim will be accepted?`,
        answer: `No, and nobody can: the decision belongs to the foreign administration. What we do guarantee is how we charge — no recovery, no fee. In this trade, a "guaranteed outcome" is a red flag, not a selling point.`,
      },
      {
        question: `Does a previously rejected claim start with a handicap?`,
        answer: `No. Administrations assess each filing on its documents: a corrected, complete refiling is examined normally. What matters is answering the original rejection ground point by point — not resubmitting the same file hoping for a different outcome.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "contact",
    label: `Have a rejection letter reviewed`,
  },
];

export const rejectionReasons: Article = {
  id: "rejection-reasons",
  slug: {
    fr: "7-raisons-rejet-demande-remboursement",
    en: "7-reasons-withholding-refund-claims-get-rejected",
  },
  category: "problems",
  title: {
    fr: "Les 7 raisons les plus fréquentes de rejet d'une demande de remboursement",
    en: "The 7 most common reasons withholding tax refund claims get rejected",
  },
  description: {
    fr: "Certificat manquant, chaîne de détention non prouvée, formulaire périmé, délai dépassé… Les sept motifs de rejet que nous rencontrons vraiment, comment nous les prévenons — et ce qui reste possible quand le rejet tombe quand même.",
    en: "Missing certificate, unproven chain of custody, outdated form, missed deadline… The seven rejection grounds we actually encounter, how we prevent them — and what remains possible when a rejection lands anyway.",
  },
  updated: "2025-04-08",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["DE", "CH", "CA"],
};

// Reference kept so the module never drifts from the canonical percentages if
// this article later quotes explicit rates (currently expressed via links).
void pct;
