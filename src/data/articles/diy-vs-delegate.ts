import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { PRICING, computeCommission } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — "DIY vs delegating your refund claim".
 * Every rate, deadline and price below is computed from @/data/countries and
 * @/config/pricing at module load; nothing is restated by hand.
 */

const ch = getCountryById("CH")!;
const de = getCountryById("DE")!;
const ca = getCountryById("CA")!;

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/* Worked Swiss scenario: 5,000 € of gross Swiss dividends. */
const GROSS = 5_000;
const withheld = GROSS * ch.statutoryRate; // 35% → 1,750 €
const owedFr = GROSS * treatyRateFor(ch, "FR"); // 15% → 750 €
const recoverable = withheld - owedFr; // 1,000 €
const commission = computeCommission(recoverable); // 250 € on the first tier
const fee = commission.fee;
const net = recoverable - fee;

/* DIY time estimate (hours) and the hourly "wage" of doing it yourself. */
const DIY_HOURS_MIN = 4;
const DIY_HOURS_MAX = 8;
const hourlyLow = fee / DIY_HOURS_MAX;
const hourlyHigh = fee / DIY_HOURS_MIN;

/* Our published "do it yourself" threshold: ~60 € of fee at stake. */
const tier1Rate = PRICING.successFeeTiers[0].rate; // 25%
const DIY_FEE_THRESHOLD = 60;
const diyRecoveredThreshold = Math.round(DIY_FEE_THRESHOLD / tier1Rate); // ≈ 240 €
const floorBreakEven = Math.round(PRICING.floorFee / tier1Rate); // ≈ 156 €

/* Canonical slugs of sibling articles referenced below. */
const REJECTION_SLUG = {
  fr: "7-raisons-rejet-demande-remboursement",
  en: "7-reasons-withholding-refund-claims-get-rejected",
} as const;
const VS_BROKER_SLUG = {
  fr: "fiscalplace-vs-courtier-depositaire",
  en: "fiscalplace-vs-your-broker-or-custodian",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Peut-on récupérer soi-même la retenue à la source prélevée en trop sur ses dividendes étrangers, sans payer personne ? Oui. Les formulaires sont publics, les administrations répondent aux particuliers, et aucune règle n'impose de passer par un intermédiaire. Cet article est écrit par un prestataire rémunéré à la commission — raison de plus pour commencer par cette réponse-là.`,
  },
  {
    type: "p",
    text: `La vraie question n'est donc pas « est-ce possible ? » mais « qu'est-ce que chaque voie coûte réellement, en argent, en temps et en risque ? ». Nous mettons les chiffres des deux côtés sur la table, y compris ceux qui ne nous arrangent pas — et vous trouverez plus bas le seuil en dessous duquel nous vous dirons nous-mêmes de ne pas nous confier votre dossier. (Si votre question est plutôt « mon courtier ne s'en occupe-t-il pas déjà ? », c'est [un autre comparatif](${articleHref("fr", VS_BROKER_SLUG.fr)}).)`,
  },
  { type: "h2", text: `Ce que « faire soi-même » implique, étape par étape` },
  {
    type: "p",
    text: `Prenons le gisement le plus courant chez les investisseurs français : les dividendes suisses. La [Suisse](${countryHref("fr", ch.slug.fr)}) retient ${pct(ch.statutoryRate, "fr")} à la source quand la convention ne lui permet d'en conserver que ${pct(treatyRateFor(ch, "FR"), "fr")} pour un résident de France ; l'écart se réclame auprès de l'Administration fédérale des contributions. Voici le parcours complet, sans rien omettre :`,
  },
  {
    type: "ol",
    items: [
      `Vérifier qu'il existe bien un trop-perçu : taux appliqué sur vos relevés, taux conventionnel, dates de versement, délais de prescription encore ouverts.`,
      `Obtenir une **attestation de résidence fiscale** visée par votre centre des impôts — un aller-retour avec le SIE qui prend parfois plusieurs semaines.`,
      `Rassembler les justificatifs : relevés bancaires ou de courtage, tax vouchers, preuve de l'encaissement des dividendes.`,
      `Remplir le formulaire du pays — pour la Suisse, le formulaire 83, avec **dépôt en ligne obligatoire depuis 2025** : un dossier papier peut être retourné sans examen.`,
      `Déposer, puis suivre : accusé de réception, relances, réponses aux demandes de pièces complémentaires — certaines administrations n'accordent que 10 à 15 jours pour répondre.`,
      `Recommencer chaque année, en composant avec les règles locales — la Suisse, par exemple, limite chaque demandeur à trois demandes par an.`,
    ],
  },
  {
    type: "p",
    text: `Pour une première demande suisse, comptez honnêtement entre ${DIY_HOURS_MIN} et ${DIY_HOURS_MAX} heures de travail effectif, étalées sur plusieurs semaines : lecture des instructions, obtention de l'attestation, saisie, dépôt, suivi. Les années suivantes vont plus vite — deux à trois heures si rien ne change. Et ce n'est pas du temps « perdu » : c'est un savoir-faire réutilisable, que certains investisseurs prennent un vrai plaisir à acquérir.`,
  },
  { type: "h2", text: `Le scénario chiffré : ${eur(GROSS, "fr")} de dividendes suisses` },
  {
    type: "p",
    text: `Posons l'écriture pour ${eur(GROSS, "fr")} de dividendes bruts suisses encaissés sur l'année :`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu à la source (${pct(ch.statutoryRate, "fr")})`,
    withheldAmount: eur(withheld, "fr"),
    owedLabel: `Dû par convention (${pct(treatyRateFor(ch, "FR"), "fr")})`,
    owedAmount: eur(owedFr, "fr"),
    treatyRef: `CDI FR-CH`,
    recoverLabel: `Trop-perçu récupérable`,
    recoverAmount: eur(recoverable, "fr"),
    footnote: `Montants indicatifs — données revues en juin 2026.`,
  },
  { type: "h3", text: `Voie A — vous faites tout vous-même` },
  {
    type: "p",
    text: `Vous récupérez ${eur(recoverable, "fr")}, commission : 0 €. Le coût réel est ailleurs : ${DIY_HOURS_MIN} à ${DIY_HOURS_MAX} heures de votre temps la première année, quelques frais périphériques, et surtout le risque d'erreur formelle — attestation du mauvais millésime, signature au mauvais endroit, dépôt papier là où l'électronique est obligatoire. Chacune de ces erreurs se paie en mois de délai supplémentaire, parfois en rejet à corriger ; nous les avons détaillées dans [les 7 motifs de rejet les plus fréquents](${articleHref("fr", REJECTION_SLUG.fr)}).`,
  },
  { type: "h3", text: `Voie B — vous déléguez` },
  {
    type: "p",
    text: `Sur ${eur(recoverable, "fr")} récupérés, notre grille — **marginale par tranche**, comme le barème de l'impôt sur le revenu — donne ${eur(fee, "fr")} de commission, soit ${formatPercent(commission.effectiveRate, "fr")} effectif sur un dossier de cette taille : il vous revient ${eur(net, "fr")} net. Vous signez un mandat, transmettez vos relevés, et le formulaire, le dépôt électronique, le suivi des échéances et les relances sont pris en charge. Si la demande échoue définitivement, la commission est de 0 € — c'est [le principe même de notre rémunération](${href("fr", "howWeGetPaid")}).`,
  },
  {
    type: "p",
    text: `Autrement dit : sur ce dossier, faire vous-même « rémunère » votre temps entre ${eur(hourlyLow, "fr")} et ${eur(hourlyHigh, "fr")} de l'heure. Si votre heure vaut plus que cela — ou si vous préférez la passer ailleurs — la délégation est rationnelle. Sinon, le DIY se défend parfaitement. C'est un arbitrage, pas une question de capacité.`,
  },
  { type: "h2", text: `Le comparatif complet : coûts, temps, risques` },
  {
    type: "table",
    caption: `Comparaison indicative pour un dossier standard de particulier — données revues en juin 2026.`,
    headers: [`Critère`, `Vous-même (DIY)`, `En délégation`],
    rows: [
      [`Commission`, `0 €`, `${eur(fee, "fr")} sur le cas ci-dessus`],
      [`Temps la première année`, `Environ ${DIY_HOURS_MIN} à ${DIY_HOURS_MAX} h`, `Moins d'une heure (mandat + relevés)`],
      [`Temps les années suivantes`, `Environ 2 à 3 h par pays`, `Quelques minutes (nouveaux relevés)`],
      [`Risque d'erreur formelle`, `Réel la première fois : millésime, signature, mode de dépôt`, `Résiduel — dossier contrôlé avant dépôt`],
      [`Suivi des prescriptions`, `À votre charge, pays par pays`, `Calculé et surveillé pour chaque dossier`],
      [`Relances et correspondance`, `À votre charge, dans la langue de l'administration`, `Prises en charge via le mandat`],
      [`Plusieurs pays`, `Effort multiplié : autres formulaires, autres règles`, `Même mandat, même processus`],
      [`En cas d'échec`, `Temps perdu, pas d'autre coût`, `Ni commission ni honoraires — seuls d'éventuels débours tiers, à prix coûtant`],
    ],
  },
  { type: "h2", text: `Les coûts cachés — des deux côtés` },
  {
    type: "p",
    text: `**Côté DIY**, le budget invisible est fait de frictions : l'attestation de résidence qui tarde, la demande de pièces qui tombe pendant vos vacances avec 15 jours pour répondre, l'année de dividendes qui se prescrit pendant qu'on remet le dossier « à ce week-end ». Aucun de ces coûts n'apparaît sur une facture — ils n'en sont pas moins réels.`,
  },
  {
    type: "p",
    text: `**Côté délégation**, voici nos petites lignes, en gros caractères : les débours facturés par des tiers (une attestation de dépositaire payante, par exemple) sont refacturés **à prix coûtant**, jamais avec une marge ; la commission a un plancher de ${eur(PRICING.floorFee, "fr")} par dossier abouti et un plafond de ${eur(PRICING.capFee, "fr")} ; et vous restez responsable de l'exactitude des informations que vous nous transmettez. Rien d'autre — pas de frais d'entrée, pas d'abonnement obligatoire, [toute la grille est publique](${href("fr", "pricing")}).`,
  },
  { type: "h2", text: `Quand le DIY gagne clairement : notre seuil des ~${DIY_FEE_THRESHOLD} €` },
  {
    type: "p",
    text: `L'arithmétique tranche d'elle-même sur les petits dossiers. En dessous d'environ ${eur(diyRecoveredThreshold, "fr")} à récupérer, la commission en jeu tombe sous ~${eur(DIY_FEE_THRESHOLD, "fr")} ; et sous ${eur(floorBreakEven, "fr")} récupérés, notre plancher de ${eur(PRICING.floorFee, "fr")} porterait le taux effectif au-delà de ${formatPercent(tier1Rate, "fr")}. À ce niveau, déléguer ne vaut pas le coût — littéralement.`,
  },
  {
    type: "ul",
    items: [
      `**Moins de ~${eur(diyRecoveredThreshold, "fr")} à récupérer** : gardez tout, la démarche vaut d'être apprise.`,
      `**Un seul pays, à procédure simple et en ligne** : le dossier suisse, une fois compris, se refait chaque année sans difficulté.`,
      `**Un cas purement préventif américain** : le W-8BEN se remplit gratuitement chez votre courtier. Notre [forfait à ${eur(PRICING.fixedServices.w8ben, "fr")}](${href("fr", "serviceW8ben")}) n'a de sens que si vous voulez une vérification et un rappel avant expiration.`,
      `**Vous aimez ça** : certains de nos lecteurs font leurs dossiers eux-mêmes avec nos outils gratuits, et c'est très bien ainsi.`,
    ],
  },
  {
    type: "callout",
    tone: "info",
    title: `Notre engagement`,
    text: `Le [simulateur](${href("fr", "simulator")}) fait cet arbitrage pour vous, avant tout engagement : il affiche le récupérable brut, la commission selon la grille et le net. Si le dossier n'est pas rentable, il vous le dit — et nous ne le prendrons pas.`,
  },
  { type: "h2", text: `Quand la délégation devient rationnelle` },
  {
    type: "ul",
    items: [
      `**Plusieurs pays** : chaque administration a ses formulaires, sa langue et ses règles — l'effort DIY se multiplie quand le nôtre se mutualise.`,
      `**Des montants à quatre chiffres** : le coût d'une erreur (mois de délai, rejet, année prescrite) dépasse vite la commission.`,
      `**L'[Allemagne](${countryHref("fr", de.slug.fr)})** : le BZSt exige une preuve de chaîne de détention que peu de particuliers réunissent seuls du premier coup, pour une instruction dépassant souvent 12 mois.`,
      `**Le [Canada](${countryHref("fr", ca.slug.fr)})** : ${ca.sol.years} ans seulement pour agir après la fin de l'année civile — l'erreur qui coûte des mois peut y coûter tout le dossier.`,
      `**Des dividendes récurrents** : la question revient chaque année ; la délégation transforme une corvée annuelle en simple transmission de relevés.`,
    ],
  },
  { type: "h2", text: `Le verdict, profil par profil` },
  {
    type: "table",
    caption: `Notre lecture honnête des cas types — le simulateur affine avec vos chiffres réels.`,
    headers: [`Votre situation`, `Notre recommandation`],
    rows: [
      [`Un dividende suisse isolé, moins de ~${eur(diyRecoveredThreshold, "fr")} en jeu`, `DIY — l'arithmétique est sans appel`],
      [`Actions américaines uniquement, W-8BEN valide en place`, `Ni l'un ni l'autre : rien à récupérer a posteriori — surveillez juste l'expiration du formulaire`],
      [`Dossier suisse ou irlandais à quatre chiffres, un seul pays`, `Les deux se défendent : DIY si votre temps le permet, délégation sinon`],
      [`Dividendes dans trois pays ou plus`, `Délégation — c'est là que la mutualisation joue à plein`],
      [`Dossier allemand, ou échéance de prescription proche`, `Délégation sans hésiter : la technicité ou l'urgence changent la donne`],
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `Pendant que vous hésitez, la prescription court`,
    text: `Quelle que soit la voie choisie, la seule vraie erreur est de ne rien faire : chaque 31 décembre, une année entière de trop-perçus expire dans plusieurs pays. Deux minutes sur le [calculateur de prescription](${href("fr", "solCalculator")}) suffisent pour connaître vos échéances — gratuitement, sans compte.`,
  },
  { type: "h2", text: `Vos questions sur l'arbitrage DIY / délégation` },
  {
    type: "faq",
    items: [
      {
        question: `Puis-je commencer seul et vous confier le dossier ensuite ?`,
        answer: `Oui, à tout moment — y compris après un rejet à corriger ou en cours de procédure. La seule limite est la prescription : un dossier transmis à quelques mois de l'échéance se traite encore (au besoin avec le traitement prioritaire à ${eur(PRICING.fixedServices.priorityHandling, "fr")}), un dossier prescrit ne se traite plus, par personne.`,
      },
      {
        question: `Vos outils gratuits me servent-ils si je fais tout moi-même ?`,
        answer: `Oui, et c'est voulu : le simulateur et le calculateur de prescription fonctionnent sans création de compte et donnent les mêmes chiffres, que vous déléguiez ensuite ou non. Un investisseur bien informé qui choisit le DIY en connaissance de cause est un meilleur résultat pour nous qu'un client mal orienté.`,
      },
      {
        question: `Pourquoi publier un comparatif qui conseille parfois de ne pas vous payer ?`,
        answer: `Parce que notre modèle est au succès : un dossier non rentable pour vous l'est encore moins pour nous, et un client qui découvre après coup qu'il aurait pu faire seul ne revient jamais. Dire où passe la frontière nous coûte quelques petits dossiers et nous vaut la confiance sur les gros — l'échange nous convient.`,
      },
      {
        question: `En faisant moi-même, est-ce que je risque de « tout perdre » ?`,
        answer: `Non. Une erreur formelle se corrige par un redépôt tant que le délai de prescription est ouvert : le scénario réaliste du DIY raté, c'est du temps perdu, pas une sanction. La seule perte définitive est l'année qui se prescrit pendant que le dossier attend — un risque qui existe d'ailleurs aussi quand on ne fait rien du tout.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculer mon trop-perçu`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Can you recover the excess withholding tax on your foreign dividends yourself, without paying anyone? Yes. The forms are public, tax administrations do answer individual investors, and no rule requires an intermediary. This article is written by a provider paid on commission — all the more reason to lead with that answer.`,
  },
  {
    type: "p",
    text: `So the real question isn't "is it possible?" but "what does each route actually cost — in money, time and risk?". We put both sides' numbers on the table, including the ones that don't flatter us — and further down you'll find the threshold below which we will tell you, ourselves, not to hire us. (If your question is rather "doesn't my broker already handle this?", that's [a different comparison](${articleHref("en", VS_BROKER_SLUG.en)}).)`,
  },
  { type: "h2", text: `What "doing it yourself" actually involves, step by step` },
  {
    type: "p",
    text: `Take the most common pool for French-resident investors: Swiss dividends. [Switzerland](${countryHref("en", ch.slug.en)}) withholds ${pct(ch.statutoryRate, "en")} at source while the treaty only lets it keep ${pct(treatyRateFor(ch, "FR"), "en")} for a French resident; the gap is claimed back from the Swiss Federal Tax Administration. Here is the full journey, nothing left out:`,
  },
  {
    type: "ol",
    items: [
      `Confirm there is actually an over-withholding: the rate on your statements, the treaty rate, payment dates, and deadlines still open.`,
      `Obtain a **certificate of tax residence** stamped by your local tax office — a back-and-forth that can take several weeks.`,
      `Gather the evidence: bank or brokerage statements, tax vouchers, proof the dividends were received.`,
      `Fill in the country's form — for Switzerland, Form 83, with **electronic filing mandatory since 2025**: a paper file can be returned unexamined.`,
      `File, then follow up: acknowledgements, reminders, replies to requests for additional documents — some administrations allow only 10 to 15 days to respond.`,
      `Do it again every year, within local rules — Switzerland, for instance, caps each claimant at three claims per year.`,
    ],
  },
  {
    type: "p",
    text: `For a first Swiss claim, budget an honest ${DIY_HOURS_MIN} to ${DIY_HOURS_MAX} hours of actual work, spread over several weeks: reading the instructions, getting the certificate, data entry, filing, follow-up. Subsequent years go faster — two to three hours if nothing changes. And it isn't "lost" time: it's a reusable skill some investors genuinely enjoy acquiring.`,
  },
  { type: "h2", text: `The worked scenario: ${eur(GROSS, "en")} of Swiss dividends` },
  {
    type: "p",
    text: `Let's post the entry for ${eur(GROSS, "en")} of gross Swiss dividends received over the year:`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld at source (${pct(ch.statutoryRate, "en")})`,
    withheldAmount: eur(withheld, "en"),
    owedLabel: `Owed under the treaty (${pct(treatyRateFor(ch, "FR"), "en")})`,
    owedAmount: eur(owedFr, "en"),
    treatyRef: `FR-CH TAX TREATY`,
    recoverLabel: `Recoverable over-withholding`,
    recoverAmount: eur(recoverable, "en"),
    footnote: `Indicative amounts — data reviewed in June 2026.`,
  },
  { type: "h3", text: `Route A — you do everything yourself` },
  {
    type: "p",
    text: `You recover ${eur(recoverable, "en")}, fee: €0. The real cost sits elsewhere: ${DIY_HOURS_MIN} to ${DIY_HOURS_MAX} hours of your time in year one, a few incidental expenses, and above all the risk of a formal error — wrong-year certificate, signature in the wrong place, paper filing where electronic is mandatory. Each of those mistakes costs months of extra delay, sometimes a rejection to cure; we detailed them in [the 7 most common rejection grounds](${articleHref("en", REJECTION_SLUG.en)}).`,
  },
  { type: "h3", text: `Route B — you delegate` },
  {
    type: "p",
    text: `On ${eur(recoverable, "en")} recovered, our grid — **marginal by tranche**, like income-tax brackets — comes to ${eur(fee, "en")}, i.e. an effective ${formatPercent(commission.effectiveRate, "en")} on a file this size: ${eur(net, "en")} lands back with you, net. You sign a mandate, send your statements, and the form, the electronic filing, the deadline tracking and the follow-ups are handled. If the claim fails for good, the fee is €0 — that is [the very principle of how we get paid](${href("en", "howWeGetPaid")}).`,
  },
  {
    type: "p",
    text: `Put differently: on this file, doing it yourself "pays" your time between ${eur(hourlyLow, "en")} and ${eur(hourlyHigh, "en")} an hour. If your hour is worth more than that — or you'd simply rather spend it elsewhere — delegating is the rational choice. If not, DIY holds up perfectly well. It's a trade-off, not a question of ability.`,
  },
  { type: "h2", text: `The full comparison: costs, time, risks` },
  {
    type: "table",
    caption: `Indicative comparison for a standard individual file — data reviewed in June 2026.`,
    headers: [`Criterion`, `Yourself (DIY)`, `Delegated`],
    rows: [
      [`Fee`, `€0`, `${eur(fee, "en")} on the case above`],
      [`Time in year one`, `Around ${DIY_HOURS_MIN} to ${DIY_HOURS_MAX} h`, `Under an hour (mandate + statements)`],
      [`Time in later years`, `Around 2 to 3 h per country`, `A few minutes (new statements)`],
      [`Formal-error risk`, `Real the first time: form vintage, signature, filing channel`, `Residual — file checked before filing`],
      [`Deadline tracking`, `On you, country by country`, `Computed and monitored per claim`],
      [`Follow-ups and correspondence`, `On you, in the administration's language`, `Handled under the mandate`],
      [`Multiple countries`, `Effort multiplies: different forms, different rules`, `Same mandate, same process`],
      [`If the claim fails`, `Time lost, no other cost`, `No fee of any kind — only third-party disbursements, at cost, where they arise`],
    ],
  },
  { type: "h2", text: `The hidden costs — on both sides` },
  {
    type: "p",
    text: `**On the DIY side**, the invisible budget is friction: the residence certificate that takes weeks, the document request landing mid-holiday with 15 days to answer, the year of dividends that expires while the file waits for "next weekend". None of it ever shows on an invoice — all of it is real.`,
  },
  {
    type: "p",
    text: `**On the delegation side**, here is our small print in large type: third-party disbursements (a custodian charging for its confirmation, say) are passed on **at cost**, never with a markup; the fee has a ${eur(PRICING.floorFee, "en")} floor per successful claim and a ${eur(PRICING.capFee, "en")} cap; and you remain responsible for the accuracy of the information you give us. Nothing else — no onboarding fee, no compulsory subscription, [the whole grid is public](${href("en", "pricing")}).`,
  },
  { type: "h2", text: `When DIY clearly wins: our ~€${DIY_FEE_THRESHOLD} threshold` },
  {
    type: "p",
    text: `On small files the arithmetic settles the debate on its own. Below roughly ${eur(diyRecoveredThreshold, "en")} recoverable, the fee at stake falls under ~${eur(DIY_FEE_THRESHOLD, "en")}; and under ${eur(floorBreakEven, "en")} recovered, our ${eur(PRICING.floorFee, "en")} floor would push the effective rate past ${formatPercent(tier1Rate, "en")}. At that level, delegating simply isn't worth the cost — literally.`,
  },
  {
    type: "ul",
    items: [
      `**Less than ~${eur(diyRecoveredThreshold, "en")} to recover**: keep it all — the procedure is worth learning.`,
      `**A single country with a simple, online procedure**: the Swiss file, once understood, repeats easily every year.`,
      `**A purely preventive US case**: the W-8BEN can be completed free of charge with your broker. Our [${eur(PRICING.fixedServices.w8ben, "en")} fixed-fee service](${href("en", "serviceW8ben")}) only makes sense if you want it checked and a renewal reminder before it expires.`,
      `**You enjoy it**: some of our readers run their own claims with our free tools — and that's exactly as it should be.`,
    ],
  },
  {
    type: "callout",
    tone: "info",
    title: `Our commitment`,
    text: `The [simulator](${href("en", "simulator")}) runs this trade-off for you before any commitment: gross recoverable, the fee per the grid, and your net. If a file isn't worth it, it says so — and we won't take it on.`,
  },
  { type: "h2", text: `When delegating becomes the rational choice` },
  {
    type: "ul",
    items: [
      `**Several countries**: each administration has its own forms, language and rules — DIY effort multiplies where ours is pooled.`,
      `**Four-figure amounts**: the cost of one mistake (months of delay, a rejection, an expired year) quickly exceeds the fee.`,
      `**[Germany](${countryHref("en", de.slug.en)})**: the BZSt demands chain-of-custody evidence few individuals assemble alone at the first attempt, for processing that often exceeds 12 months.`,
      `**[Canada](${countryHref("en", ca.slug.en)})**: only ${ca.sol.years} years to act after the end of the calendar year — a mistake that costs months there can cost the whole claim.`,
      `**Recurring dividends**: the question returns every year; delegation turns an annual chore into forwarding statements.`,
    ],
  },
  { type: "h2", text: `The verdict, profile by profile` },
  {
    type: "table",
    caption: `Our honest reading of the typical cases — the simulator refines it with your actual figures.`,
    headers: [`Your situation`, `Our recommendation`],
    rows: [
      [`One isolated Swiss dividend, less than ~${eur(diyRecoveredThreshold, "en")} at stake`, `DIY — the arithmetic is unambiguous`],
      [`US shares only, valid W-8BEN in place`, `Neither: nothing to recover after the fact — just watch the form's expiry date`],
      [`A four-figure Swiss or Irish file, single country`, `Both are defensible: DIY if your time allows, delegation otherwise`],
      [`Dividends across three or more countries`, `Delegate — this is where pooling pays off in full`],
      [`A German file, or a deadline closing in`, `Delegate without hesitating: technicality or urgency changes the equation`],
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `While you hesitate, the clock runs`,
    text: `Whichever route you pick, the only real mistake is doing nothing: every 31 December, a full year of over-withholding expires in several countries at once. Two minutes on the [deadline calculator](${href("en", "solCalculator")}) tells you your dates — free, no account.`,
  },
  { type: "h2", text: `Your questions on the DIY / delegate trade-off` },
  {
    type: "faq",
    items: [
      {
        question: `Can I start on my own and hand you the file later?`,
        answer: `Yes, at any point — including after a rejection to cure, or mid-procedure. The only limit is the statute of limitations: a file handed over a few months before its deadline can still be processed (with ${eur(PRICING.fixedServices.priorityHandling, "en")} priority handling if needed); an expired file cannot, by anyone.`,
      },
      {
        question: `Are your free tools useful if I do everything myself?`,
        answer: `Yes, deliberately so: the simulator and the deadline calculator work without an account and show the same figures whether you delegate afterwards or not. A well-informed investor choosing DIY with open eyes is a better outcome for us than a badly steered client.`,
      },
      {
        question: `Why publish a comparison that sometimes advises against paying you?`,
        answer: `Because our model is success-based: a file that isn't worth it for you is worth even less for us, and a client who discovers after the fact that they could have done it alone never comes back. Saying where the line sits costs us a few small files and earns us trust on the large ones — a trade we're happy with.`,
      },
      {
        question: `If I go DIY, could I "lose everything"?`,
        answer: `No. A formal error is cured by refiling as long as the claim window is open: the realistic worst case of failed DIY is lost time, not a penalty. The only permanent loss is the year that expires while the file sits waiting — a risk that, incidentally, also exists when you do nothing at all.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculate my refund`,
  },
];

export const diyVsDelegate: Article = {
  id: "diy-vs-delegate",
  slug: {
    fr: "faire-soi-meme-vs-deleguer-remboursement",
    en: "diy-vs-delegating-your-refund-claim",
  },
  category: "comparisons",
  title: {
    fr: "Récupérer sa retenue à la source soi-même ou déléguer : le comparatif honnête",
    en: "Reclaiming your withholding tax yourself vs delegating: the honest comparison",
  },
  description: {
    fr: `Faire soi-même coûte 0 € de commission — mais pas 0 heure ni 0 risque. Un scénario suisse chiffré des deux voies, les coûts cachés de chaque côté, et le seuil en dessous duquel nous vous conseillons de ne pas nous payer.`,
    en: `Doing it yourself costs €0 in fees — but not zero hours or zero risk. A worked Swiss scenario for both routes, the hidden costs on each side, and the threshold below which we advise you not to pay us.`,
  },
  updated: "2025-06-17",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["CH", "DE", "CA"],
};
