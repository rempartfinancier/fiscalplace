import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import {
  COUNTRIES,
  getCountryById,
  recoveryGap,
  treatyRateFor,
  type CountryTaxProfile,
} from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { rejectionReasons } from "./rejection-reasons";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "Missed the statute of limitations: what happens (really)?"
 * Every rate, deadline and price below is computed from @/data/countries and
 * @/config/pricing at module load; nothing is restated by hand.
 */

const ch = getCountryById("CH")!;
const ca = getCountryById("CA")!;
const de = getCountryById("DE")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);
const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);

/**
 * Canonical slugs of the sibling "problems" article (same content batch) —
 * kept as a local constant to avoid a circular import (broker-wont-tell-you
 * imports this module).
 */
const BROKER_ARTICLE_SLUG = {
  fr: "retenue-a-la-source-ce-que-votre-courtier-ne-dit-pas",
  en: "withholding-tax-what-your-broker-wont-tell-you",
} as const;

/** Illustrative scenario for the ledger example (scenario constants, not tax data). */
const YEARLY_GROSS = 2_000;
const YEARS_TOTAL = 5;
const YEARS_OPEN = 3;
const chGap = recoveryGap(ch, "FR");
const withheldTotal = YEARLY_GROSS * YEARS_TOTAL * ch.statutoryRate;
const owedTotal = YEARLY_GROSS * YEARS_TOTAL * treatyRateFor(ch, "FR");
const stillClaimable = YEARLY_GROSS * YEARS_OPEN * chGap;
const lostForever = YEARLY_GROSS * (YEARS_TOTAL - YEARS_OPEN) * chGap;

function deadlineRows(locale: Locale): string[][] {
  const startLabel = (c: CountryTaxProfile) =>
    c.sol.rule === "calendar-year-end"
      ? locale === "fr"
        ? "fin de l'année civile du versement"
        : "end of the calendar year of payment"
      : locale === "fr"
        ? "date du versement (règle d'anniversaire)"
        : "payment date (anniversary rule)";
  return [...COUNTRIES]
    .sort((a, b) => a.sol.years - b.sol.years || a.name[locale].localeCompare(b.name[locale]))
    .map((c) => {
      const gap = recoveryGap(c, "FR");
      return [
        `${c.flag} ${c.name[locale]}`,
        `${c.sol.years} ${locale === "fr" ? "ans" : "years"}${c.sol.verify ? " *" : ""}`,
        startLabel(c),
        gap > 0
          ? pct(gap, locale)
          : locale === "fr"
            ? "— (rien à récupérer en général)"
            : "— (generally nothing to recover)",
      ];
    });
}

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Vous cherchez probablement une astuce, un recours, une exception. Voici la réponse honnête, sans détour : **passé le délai de prescription du pays source, l'argent est définitivement perdu**. Aucun recours gracieux, aucun cabinet « spécialisé », aucun mandataire — FiscalPlace compris — ne peut récupérer une retenue à la source prescrite. Ce qui reste à faire est ailleurs : sauver les années encore ouvertes, et faire en sorte de ne plus jamais revivre ça.`,
  },
  {
    type: "p",
    text: `Le scénario est toujours le même : un investisseur découvre que ses dividendes suisses ont été retenus à ${pct(ch.statutoryRate, "fr")} alors que la convention n'autorise que ${pct(treatyRateFor(ch, "FR"), "fr")}, calcule le trop-perçu accumulé sur cinq ans, se réjouit — puis apprend que les premières années ne sont plus réclamables. Cet article explique pourquoi c'est irréversible, donne les délais pays par pays, décortique le piège canadien, et montre honnêtement ce qu'on peut encore sauver quand une partie seulement du portefeuille est prescrite.`,
  },
  { type: "h2", text: `Peut-on encore récupérer une retenue à la source après le délai ?` },
  {
    type: "p",
    text: `Non. La prescription n'est pas une pénalité de retard qu'on pourrait négocier : elle **éteint juridiquement votre droit au remboursement**. Chaque pays fixe par la loi une fenêtre pendant laquelle un non-résident peut réclamer le trop-perçu ; une fois cette fenêtre fermée, l'administration n'a plus aucune base légale pour vous rembourser — même si le sur-prélèvement est évident, chiffré et parfaitement documenté. Ce n'est pas une question de bonne volonté du fonctionnaire qui traite le dossier : il n'a pas le droit de payer.`,
  },
  {
    type: "p",
    text: `La conséquence est brutale mais simple à retenir : **un dossier parfait déposé un jour trop tard vaut exactement zéro**. Et chaque dividende a sa propre échéance — calculée depuis sa date de versement ou depuis la fin de l'année civile, selon le pays. Un portefeuille n'est jamais « prescrit » d'un bloc : il se prescrit ligne par ligne, année après année.`,
  },
  { type: "h2", text: `Pourquoi personne ne peut « négocier » avec un fisc étranger` },
  {
    type: "p",
    text: `Une administration fiscale étrangère est souveraine. Elle n'a aucun compte à rendre à votre courtier, à votre banque, à votre avocat ou à nous. Un mandataire — aussi spécialisé soit-il — dépose des demandes dans le cadre que la loi locale prévoit ; il n'a aucun levier au-delà. Pour un investisseur particulier détenant un portefeuille de titres, il n'existe pas, dans le cas général, de recours en équité ni de remise gracieuse qui rouvrirait une prescription acquise.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Le test du prestataire honnête`,
    text: `Si un intermédiaire vous promet de récupérer des années prescrites — surtout contre des frais payables d'avance — méfiez-vous. Notre modèle est la [commission au succès](${href("fr", "howWeGetPaid")}) : nous n'avons aucun intérêt à déposer un dossier perdu d'avance, nous travaillerions gratuitement. Un prestataire payé d'avance, lui, gagne de l'argent même quand votre dossier est sans espoir.`,
  },
  { type: "h2", text: `Quels sont les délais de prescription pays par pays ?` },
  {
    type: "p",
    text: `Les fenêtres de réclamation vont de ${ca.sol.years} ans (Canada) à 5 ans (Autriche, Japon, Suède) — et leur point de départ varie lui aussi. Le tableau ci-dessous donne les règles générales pour un particulier résident fiscal de France ; pour vos dates exactes, ligne par ligne, le [calculateur de prescription](${href("fr", "solCalculator")}) est gratuit et sans création de compte.`,
  },
  {
    type: "table",
    caption: `Délais de réclamation standard, à titre indicatif — données revues en juin 2026. * : règle générale avec variantes connues, à confirmer selon votre situation. Australie : l'écart ne concerne que la part « unfranked » des dividendes.`,
    headers: [
      `Pays source`,
      `Délai (règle générale)`,
      `Point de départ`,
      `Écart récupérable typique (résident FR)`,
    ],
    rows: deadlineRows("fr"),
  },
  {
    type: "p",
    text: `Deux règles de décompte cohabitent : la plupart des pays comptent à partir de la **fin de l'année civile** du versement (un dividende de janvier et un dividende de décembre expirent donc le même 31 décembre), d'autres à partir de la **date du versement** elle-même. Dernier point, appris à nos dépens en lisant les pratiques des administrations : ne déposez jamais à la dernière minute. En [Allemagne](${countryHref("fr", de.slug.fr)}), l'instruction dépasse fréquemment 12 mois — ce n'est pas un problème en soi, car c'est la date de dépôt qui compte —, mais un dossier rejeté pour un défaut corrigible à trois semaines de l'échéance ne pourra jamais être redéposé. Les motifs de rejet, eux, sont presque tous rattrapables : nous les avons détaillés dans [les 7 raisons de rejet les plus fréquentes](${articleHref("fr", rejectionReasons.slug.fr)}).`,
  },
  { type: "h2", text: `Le piège canadien : ${ca.sol.years} ans seulement` },
  {
    type: "p",
    text: `Le [Canada](${countryHref("fr", ca.slug.fr)}) retient ${pct(ca.statutoryRate, "fr")} sur les dividendes versés à un résident de France, quand la convention n'autorise que ${pct(treatyRateFor(ca, "FR"), "fr")}. Mais la fenêtre de réclamation (formulaire ${ca.refundForm.fr}, procédure papier) n'est que de **${ca.sol.years} ans après la fin de l'année civile du prélèvement** — la plus courte de notre panel. Concrètement : un dividende canadien versé en janvier 2024 se prescrit le 31 décembre 2026, soit moins de six mois après la mise à jour de cet article.`,
  },
  {
    type: "p",
    text: `C'est le pays type où les trop-perçus meurent en silence : le temps qu'un investisseur découvre le mécanisme, la moitié de l'historique est déjà hors délai. Si vous détenez des valeurs canadiennes et que vous lisez ceci, vérifiez vos échéances aujourd'hui — pas ce week-end, aujourd'hui. Pour un dossier déjà proche de la limite, le traitement prioritaire (${eur(PRICING.fixedServices.priorityHandling, "fr")}) le fait passer devant la file.`,
  },
  { type: "h2", text: `Années partiellement prescrites : on récupère ce qui reste` },
  {
    type: "p",
    text: `Le cas réel le plus fréquent n'est pas le portefeuille entièrement prescrit, mais le portefeuille **à moitié prescrit**. Comme chaque année de dividendes a sa propre échéance, il est parfaitement normal d'avoir perdu 2021 et 2022 tout en pouvant encore réclamer 2023, 2024 et 2025. La pire réaction serait de laisser la déception des années perdues coûter en plus les années encore ouvertes — qui, elles, continuent d'expirer une par une.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Impôt anticipé suisse prélevé 2021–2025 (${pct(ch.statutoryRate, "fr")})`,
    withheldAmount: eur(withheldTotal, "fr"),
    owedLabel: `Dû selon la convention (${pct(treatyRateFor(ch, "FR"), "fr")})`,
    owedAmount: eur(owedTotal, "fr"),
    treatyRef: `CDI FR-CH`,
    recoverLabel: `Encore récupérable en juillet 2026 (années 2023 à 2025)`,
    recoverAmount: eur(stillClaimable, "fr"),
    footnote: `Exemple illustratif : dividendes bruts de ${eur(YEARLY_GROSS, "fr")} par an de 2021 à 2025, actionnaire résident fiscal de France. Les ${eur(lostForever, "fr")} des années 2021 et 2022 sont prescrits (${ch.sol.years} ans après la fin de l'année civile du versement). Taux indicatifs, revus en juin 2026.`,
  },
  {
    type: "p",
    text: `Dans cet exemple, les ${eur(lostForever, "fr")} prescrits sont un coût définitif — personne ne vous les rendra, et nous ne déposerons pas de demande pour eux. Les ${eur(stillClaimable, "fr")} restants, en revanche, se réclament normalement, et notre [commission](${href("fr", "pricing")}) ne porte que sur ce qui est effectivement récupéré : les années perdues ne nous rapportent rien, à vous non plus, et c'est précisément pour ça que vous pouvez croire notre diagnostic.`,
  },
  { type: "h2", text: `Comment ne plus jamais rater une échéance ?` },
  {
    type: "ol",
    items: [
      `**Inventoriez vos lignes de dividendes étrangers.** Relevés de courtage ou annexes de votre IFU : listez, année par année et pays par pays, les dividendes bruts et l'impôt étranger retenu. Si votre relevé est peu lisible, [notre article sur ce que votre courtier ne dit pas](${articleHref("fr", BROKER_ARTICLE_SLUG.fr)}) montre comment décoder une ligne de dividende en cinq minutes.`,
      `**Passez chaque année au [calculateur de prescription](${href("fr", "solCalculator")}).** Gratuit, sans compte : il applique la règle de chaque pays (fin d'année civile ou anniversaire) et vous donne la date limite exacte de chaque ligne.`,
      `**Déposez tôt, l'année la plus ancienne d'abord.** C'est elle qui expire en premier — et un dépôt précoce laisse le temps de corriger un éventuel rejet. À moins de six mois d'une échéance, le traitement prioritaire (${eur(PRICING.fixedServices.priorityHandling, "fr")}) est fait pour ça.`,
      `**Mettez la surveillance en pilote automatique.** L'[abonnement Suivi & Alertes](${href("fr", "serviceMonitoring")}) (${eur(PRICING.subscription.monthly, "fr")}/mois ou ${eur(PRICING.subscription.yearly, "fr")}/an par portefeuille) surveille vos échéances de prescription, l'expiration de vos documents et les nouvelles années récupérables — et vous alerte avant qu'il ne soit trop tard, pas après.`,
    ],
  },
  {
    type: "p",
    text: `Voilà la situation, sans enjolivure : ce qui est prescrit est perdu, et personne d'honnête ne vous dira le contraire. Mais chaque 31 décembre, quelque part, une nouvelle année de vos dividendes expire — l'inaction a un prix qui court encore. La prochaine étape logique prend deux minutes : passez vos années au calculateur. S'il reste des années ouvertes, nous les déposons pour vous, et nous ne sommes payés que sur ce qui aboutit.`,
  },
  { type: "h2", text: `Vos questions sur la prescription` },
  {
    type: "faq",
    items: [
      {
        question: `Existe-t-il un recours gracieux ou une dérogation ?`,
        answer: `Dans le cas général d'un investisseur particulier non résident, non : la prescription éteint le droit, et les administrations l'appliquent mécaniquement. S'il existait une voie particulière dans votre situation précise, notre diagnostic — gratuit — vous le dirait. Mais ne prenez aucune décision en pariant dessus.`,
      },
      {
        question: `Mon courtier est-il responsable si je découvre le problème trop tard ?`,
        answer: `En général non : sauf mandat spécifique, la récupération de retenue à la source ne fait pas partie de ses obligations contractuelles, et il n'a aucune obligation de vous alerter sur vos échéances. C'est exactement pour cela qu'il faut vérifier soi-même — nous avons consacré [un article entier au rôle réel du courtier](${articleHref("fr", BROKER_ARTICLE_SLUG.fr)}).`,
      },
      {
        question: `Les délais indiqués dans cet article peuvent-ils changer ?`,
        answer: `Oui : les législations et les pratiques administratives évoluent. Nos chiffres sont revus régulièrement (dernière revue : juin 2026) et présentés à titre indicatif ; le calculateur s'appuie toujours sur nos données à jour. Pour une année charnière — à quelques semaines d'une échéance supposée —, faites vérifier votre cas plutôt que de trancher seul.`,
      },
      {
        question: `Mon échéance tombe dans quelques semaines : est-ce encore jouable ?`,
        answer: `Souvent oui, si les justificatifs peuvent être réunis vite — le certificat de résidence fiscale est généralement le facteur limitant. Le traitement prioritaire (${eur(PRICING.fixedServices.priorityHandling, "fr")}) fait passer votre dossier devant la file, et si les délais d'obtention des pièces rendent le dépôt irréaliste, nous vous le disons avant d'encaisser quoi que ce soit.`,
      },
      {
        question: `La prescription s'applique-t-elle aussi aux petits montants ?`,
        answer: `Oui, la règle est la même à ${eur(40, "fr")} qu'à ${eur(40_000, "fr")}. Honnêteté oblige : avec notre plancher de ${eur(PRICING.floorFee, "fr")} par dossier abouti, un très petit trop-perçu peut ne pas valoir le dépôt. Le [simulateur](${href("fr", "simulator")}) fait ce calcul gratuitement, avant que vous n'engagiez quoi que ce soit.`,
      },
      {
        question: `Une année prescrite peut-elle « rouvrir » si la loi change ?`,
        answer: `Ne comptez pas dessus : les changements de délais ne sont qu'exceptionnellement rétroactifs en faveur du contribuable. Le raisonnement sain est de traiter tout montant prescrit comme définitivement perdu — et de concentrer l'énergie sur les années encore ouvertes.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "solCalculator",
    label: `Vérifier mes échéances maintenant`,
    note: `Gratuit, sans création de compte — deux minutes suffisent.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `You are probably hoping for a trick, an appeal, an exception. Here is the honest answer, straight up: **once the source country's statute of limitations has expired, the money is permanently lost**. No discretionary appeal, no "specialist" firm, no agent — FiscalPlace included — can recover time-barred withholding tax. What remains worth doing lies elsewhere: rescuing the years still open, and making sure this never happens to you again.`,
  },
  {
    type: "p",
    text: `The story is always the same: an investor discovers their Swiss dividends were withheld at ${pct(ch.statutoryRate, "en")} when the treaty allows only ${pct(treatyRateFor(ch, "FR"), "en")}, works out five years of over-withholding, celebrates — then learns the earliest years can no longer be claimed. This article explains why that is irreversible, lists the deadlines country by country, dissects the Canadian trap, and shows honestly what can still be saved when only part of a portfolio is time-barred.`,
  },
  { type: "h2", text: `Can withholding tax still be recovered after the deadline?` },
  {
    type: "p",
    text: `No. A statute of limitations is not a negotiable late penalty: it **legally extinguishes your right to the refund**. Each country sets by law a window during which a non-resident may claim the excess; once that window closes, the administration has no legal basis left to repay you — even where the over-withholding is obvious, quantified and perfectly documented. It is not about the goodwill of the officer handling the file: they are not allowed to pay.`,
  },
  {
    type: "p",
    text: `The consequence is brutal but easy to remember: **a perfect claim filed one day late is worth exactly zero**. And every dividend has its own deadline — counted from its payment date or from the end of the calendar year, depending on the country. A portfolio never expires as one block: it expires line by line, year after year.`,
  },
  { type: "h2", text: `Why nobody can "negotiate" with a foreign tax authority` },
  {
    type: "p",
    text: `A foreign tax administration is sovereign. It owes nothing to your broker, your bank, your lawyer or us. An agent — however specialised — files claims within the framework local law provides; beyond that, there is no leverage. For an individual investor holding a portfolio of listed securities, there is, in the general case, no equitable remedy or discretionary relief that reopens an expired limitation period.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `The honest-provider test`,
    text: `If an intermediary promises to recover time-barred years — especially for fees payable upfront — be suspicious. Our model is the [success fee](${href("en", "howWeGetPaid")}): we have no interest in filing a hopeless claim, since we would be working for free. A provider paid upfront, on the other hand, makes money even when your file has no chance.`,
  },
  { type: "h2", text: `What are the statutes of limitations, country by country?` },
  {
    type: "p",
    text: `Claim windows range from ${ca.sol.years} years (Canada) to 5 years (Austria, Japan, Sweden) — and their starting points differ too. The table below gives the general rules for an individual French tax resident; for your exact dates, line by line, the [deadline calculator](${href("en", "solCalculator")}) is free and requires no account.`,
  },
  {
    type: "table",
    caption: `Standard claim windows, indicative — data reviewed in June 2026. * : general rule with known variants, to be confirmed for your situation. Australia: the gap only concerns the unfranked portion of dividends.`,
    headers: [
      `Source country`,
      `Deadline (general rule)`,
      `Starting point`,
      `Typical recoverable gap (FR resident)`,
    ],
    rows: deadlineRows("en"),
  },
  {
    type: "p",
    text: `Two counting rules coexist: most countries count from the **end of the calendar year** of payment (so a January dividend and a December dividend expire on the same 31 December), others from the **payment date** itself. One last point, learned from how administrations actually operate: never file at the last minute. In [Germany](${countryHref("en", de.slug.en)}), processing frequently exceeds 12 months — not a problem in itself, since the filing date is what counts —, but a claim rejected for a curable defect three weeks before the deadline can never be refiled. Rejection grounds, by contrast, are almost all fixable: we detailed them in [the 7 most common rejection reasons](${articleHref("en", rejectionReasons.slug.en)}).`,
  },
  { type: "h2", text: `The Canadian trap: only ${ca.sol.years} years` },
  {
    type: "p",
    text: `[Canada](${countryHref("en", ca.slug.en)}) withholds ${pct(ca.statutoryRate, "en")} on dividends paid to a French resident, when the treaty allows only ${pct(treatyRateFor(ca, "FR"), "en")}. But the claim window (form ${ca.refundForm.en}, a paper procedure) is only **${ca.sol.years} years from the end of the calendar year of withholding** — the shortest in our panel. Concretely: a Canadian dividend paid in January 2024 expires on 31 December 2026, less than six months after this article's last update.`,
  },
  {
    type: "p",
    text: `This is the textbook country where over-withheld money dies in silence: by the time an investor discovers the mechanism, half the history is already out of time. If you hold Canadian stocks and are reading this, check your deadlines today — not this weekend, today. For a claim already close to the line, priority handling (${eur(PRICING.fixedServices.priorityHandling, "en")}) moves it to the front of the queue.`,
  },
  { type: "h2", text: `Partially expired years: we recover what remains` },
  {
    type: "p",
    text: `The most common real-world case is not the fully expired portfolio but the **half-expired** one. Because each dividend year has its own deadline, it is perfectly normal to have lost 2021 and 2022 while 2023, 2024 and 2025 remain claimable. The worst reaction would be to let the disappointment over the lost years cost you the open ones too — which keep expiring, one by one.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Swiss withholding tax levied 2021–2025 (${pct(ch.statutoryRate, "en")})`,
    withheldAmount: eur(withheldTotal, "en"),
    owedLabel: `Owed under the treaty (${pct(treatyRateFor(ch, "FR"), "en")})`,
    owedAmount: eur(owedTotal, "en"),
    treatyRef: `FR-CH tax treaty`,
    recoverLabel: `Still claimable in July 2026 (years 2023 to 2025)`,
    recoverAmount: eur(stillClaimable, "en"),
    footnote: `Illustrative example: gross dividends of ${eur(YEARLY_GROSS, "en")} per year from 2021 to 2025, shareholder resident in France for tax purposes. The ${eur(lostForever, "en")} from 2021 and 2022 are time-barred (${ch.sol.years} years from the end of the calendar year of payment). Indicative rates, reviewed in June 2026.`,
  },
  {
    type: "p",
    text: `In this example, the ${eur(lostForever, "en")} that expired is a definitive cost — nobody will give it back, and we will not file a claim for it. The remaining ${eur(stillClaimable, "en")}, however, can be claimed normally, and our [fee](${href("en", "pricing")}) applies only to what is actually recovered: the lost years earn us nothing, and you nothing — which is precisely why you can trust our diagnostic.`,
  },
  { type: "h2", text: `How do you never miss a deadline again?` },
  {
    type: "ol",
    items: [
      `**Take stock of your foreign dividend lines.** Brokerage statements or annual tax reports: list, year by year and country by country, the gross dividends and the foreign tax withheld. If your statement is hard to read, [our article on what your broker won't tell you](${articleHref("en", BROKER_ARTICLE_SLUG.en)}) shows how to decode a dividend line in five minutes.`,
      `**Run each year through the [deadline calculator](${href("en", "solCalculator")}).** Free, no account: it applies each country's rule (calendar-year-end or anniversary) and gives you the exact cut-off date of every line.`,
      `**File early, oldest year first.** That year expires first — and an early filing leaves time to fix a possible rejection. Within six months of a deadline, priority handling (${eur(PRICING.fixedServices.priorityHandling, "en")}) exists for exactly this.`,
      `**Put the monitoring on autopilot.** The [Monitoring & Alerts subscription](${href("en", "serviceMonitoring")}) (${eur(PRICING.subscription.monthly, "en")}/month or ${eur(PRICING.subscription.yearly, "en")}/year per portfolio) watches your limitation deadlines, expiring documents and newly claimable years — and alerts you before it is too late, not after.`,
    ],
  },
  {
    type: "p",
    text: `That is the situation, unvarnished: what is time-barred is lost, and no honest person will tell you otherwise. But every 31 December, somewhere, another year of your dividends expires — the cost of inaction is still running. The logical next step takes two minutes: run your years through the calculator. If open years remain, we file them for you, and we only get paid on what succeeds.`,
  },
  { type: "h2", text: `Your questions about statutes of limitations` },
  {
    type: "faq",
    items: [
      {
        question: `Is there any discretionary appeal or exemption?`,
        answer: `In the general case of an individual non-resident investor, no: the limitation period extinguishes the right, and administrations apply it mechanically. If a specific route existed in your precise situation, our diagnostic — free — would tell you. But do not base any decision on that bet.`,
      },
      {
        question: `Is my broker liable if I discover the problem too late?`,
        answer: `Generally no: absent a specific mandate, withholding-tax recovery is not part of their contractual duties, and they have no obligation to warn you about your deadlines. Which is exactly why you should check for yourself — we devoted [a whole article to the broker's real role](${articleHref("en", BROKER_ARTICLE_SLUG.en)}).`,
      },
      {
        question: `Can the deadlines in this article change?`,
        answer: `Yes: legislation and administrative practice evolve. Our figures are reviewed regularly (last review: June 2026) and shown as indicative; the calculator always runs on our up-to-date data. For a borderline year — weeks away from a presumed deadline — have your case checked rather than deciding alone.`,
      },
      {
        question: `My deadline is a few weeks away: is it still doable?`,
        answer: `Often yes, if the supporting documents can be gathered fast — the certificate of tax residence is usually the limiting factor. Priority handling (${eur(PRICING.fixedServices.priorityHandling, "en")}) moves your file to the front of the queue, and if document lead times make the filing unrealistic, we tell you before charging anything.`,
      },
      {
        question: `Does the limitation period also apply to small amounts?`,
        answer: `Yes, the rule is the same at ${eur(40, "en")} as at ${eur(40_000, "en")}. In all honesty: with our ${eur(PRICING.floorFee, "en")} floor per successful claim, a very small over-withholding may not be worth filing. The [simulator](${href("en", "simulator")}) does that maths for free, before you commit to anything.`,
      },
      {
        question: `Can an expired year "reopen" if the law changes?`,
        answer: `Do not count on it: deadline changes are only exceptionally retroactive in the taxpayer's favour. The sound approach is to treat any time-barred amount as permanently lost — and to focus your energy on the years still open.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "solCalculator",
    label: `Check my deadlines now`,
    note: `Free, no account needed — two minutes is enough.`,
  },
];

export const missedDeadline: Article = {
  id: "missed-deadline",
  slug: {
    fr: "delai-de-prescription-depasse-que-faire",
    en: "missed-the-statute-of-limitations-what-now",
  },
  category: "problems",
  title: {
    fr: "Délai de prescription dépassé : que se passe-t-il (vraiment) ?",
    en: "Missed the statute of limitations: what happens (really)?",
  },
  description: {
    fr: `La réponse honnête : passé la prescription, l'argent est définitivement perdu — personne ne peut le récupérer, et méfiez-vous de qui prétend le contraire. Les délais pays par pays, le piège canadien des ${ca.sol.years} ans, et comment sauver les années encore ouvertes.`,
    en: `The honest answer: once the limitation period expires, the money is permanently lost — nobody can recover it, and beware of anyone claiming otherwise. Deadlines country by country, the ${ca.sol.years}-year Canadian trap, and how to rescue the years still open.`,
  },
  updated: "2025-05-06",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["CA", "CH", "DE"],
};
