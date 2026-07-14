import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, href } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — "W-8BEN, W-8BEN-E or W-9: which form is yours?"
 * The three IRS status certificates compared honestly, including the case
 * where the answer is "W-9, and we cannot help you". Rates and prices are
 * computed from the data layer; nothing is restated by hand.
 */

const us = getCountryById("US")!;
const usTreaty = treatyRateFor(us, "FR");

const eur = (n: number, locale: Locale) => formatCurrency(n, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/** Canonical slug of the sibling W-8BEN tutorial (same content cluster). */
const W8BEN_GUIDE_SLUG = {
  fr: "w-8ben-mode-demploi",
  en: "w-8ben-explained",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Trois formulaires de l'IRS se ressemblent assez pour être confondus — et assez peu pour que le mauvais choix coûte cher : le **W-9**, le **W-8BEN** et le **W-8BEN-E**. Tous les trois répondent à la même question posée par votre courtier (« qui êtes-vous, fiscalement, vis-à-vis des États-Unis ? »), mais ils s'adressent à trois populations différentes. Voici comment choisir en trente secondes, ce que chacun déclenche sur vos dividendes américains, et les deux pièges qui reviennent sans cesse.`,
  },
  { type: "h2", text: `Le choix en trente secondes` },
  {
    type: "ol",
    items: [
      `**Vous êtes une « US person »** — citoyen américain (même binational), titulaire d'une green card ou résident fiscal des États-Unis : **W-9**, quel que soit votre pays de vie.`,
      `**Vous êtes une personne physique, non-US, qui investit en son nom propre** : **W-8BEN** — le cas de l'immense majorité des lecteurs de ce site.`,
      `**Le compte appartient à une société, une holding ou une autre entité non américaine** : **W-8BEN-E**, la version « entités », nettement plus lourde.`,
    ],
  },
  {
    type: "table",
    caption: `Les trois certificats de statut comparés — taux indicatifs pour un résident fiscal français, données revues mi-2026.`,
    headers: [``, `W-9`, `W-8BEN`, `W-8BEN-E`],
    rows: [
      [`Pour qui`, `US persons (citoyens, green cards, résidents US)`, `Personnes physiques non-US`, `Sociétés et entités non-US`],
      [`Longueur`, `1 page`, `1 page`, `8 pages, ~30 statuts possibles`],
      [
        `Effet sur la retenue dividendes`,
        `Pas de retenue à la source ; revenus déclarés à l'IRS (1099)`,
        `${pct(usTreaty, "fr")} au lieu de ${pct(us.statutoryRate, "fr")} (convention FR-US)`,
        `Taux conventionnel selon le statut de l'entité`,
      ],
      [`Validité`, `Sans expiration (sauf changement)`, `Fin de la 3e année civile après signature`, `Fin de la 3e année civile après signature`],
      [
        `Notre forfait`,
        `— (nous n'intervenons pas)`,
        eur(PRICING.fixedServices.w8ben, "fr"),
        eur(PRICING.fixedServices.w8benE, "fr"),
      ],
    ],
  },
  { type: "h2", text: `W-9 : le formulaire des « US persons » — y compris malgré elles` },
  {
    type: "p",
    text: `Le W-9 ne demande aucun bénéfice conventionnel : il certifie que vous êtes contribuable américain, transmet votre numéro fiscal US, et déclenche la déclaration de vos revenus à l'IRS. Le piège qui mérite d'être dit : la nationalité américaine suffit. Un binational franco-américain vivant à Paris, ou un « Américain accidentel » né aux États-Unis, doit remettre un W-9 — **pas** un W-8BEN. Signer un W-8BEN en étant US person est une fausse déclaration, avec de vraies conséquences. Si c'est votre situation, notre service ne vous concerne pas : votre sujet relève d'un avocat fiscaliste spécialisé en fiscalité américaine, et nous préférons vous le dire ici que de vous facturer pour rien.`,
  },
  { type: "h2", text: `W-8BEN : le formulaire qui fait passer la retenue de ${pct(us.statutoryRate, "fr")} à ${pct(usTreaty, "fr")}` },
  {
    type: "p",
    text: `C'est le cas standard de l'investisseur particulier français : le W-8BEN certifie à votre courtier que vous n'êtes pas une US person et que vous résidez dans un pays conventionné. Résultat immédiat : la retenue américaine sur vos dividendes passe du taux par défaut de ${pct(us.statutoryRate, "fr")} au taux conventionnel de ${pct(usTreaty, "fr")} — dès le versement suivant, sans rien à réclamer. Il expire à la fin de la 3e année civile suivant la signature, en silence. [Notre tutoriel ligne par ligne](${articleHref("fr", W8BEN_GUIDE_SLUG.fr)}) vous permet de le remplir seul ; le [vérificateur gratuit](${href("fr", "w8benChecker")}) vous dit si le vôtre est encore valide.`,
  },
  { type: "h2", text: `W-8BEN-E : la même idée, mais pour les entités — et huit pages` },
  {
    type: "p",
    text: `Dès que le compte-titres appartient à une personne morale — société patrimoniale, holding, structure d'investissement — le W-8BEN ne convient plus : c'est le W-8BEN-E. Même principe (certifier le statut non-US et revendiquer la convention), mais l'exercice change d'échelle : huit pages, une trentaine de statuts possibles au titre du chapitre 4 (FATCA), et une classification de l'entité dont dépend le taux appliqué. Une case mal choisie et l'établissement payeur retient ${pct(us.statutoryRate, "fr")} par prudence. C'est le seul des trois formulaires où nous déconseillons franchement le fait-maison sans expérience préalable — notre forfait est à ${eur(PRICING.fixedServices.w8benE, "fr")}, questionnaire de classification inclus.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Et les autres W-8 ?`,
    text: `La famille compte deux autres membres que vous croiserez rarement : le W-8IMY (intermédiaires et structures transparentes — courtiers, partnerships) et le W-8ECI (revenus effectivement rattachés à une activité aux États-Unis). Si votre situation les appelle, elle dépasse le cadre d'un portefeuille de dividendes — et le bon réflexe est un conseil spécialisé, pas un formulaire choisi au hasard.`,
  },
  { type: "h2", text: `Les deux confusions qui coûtent le plus cher` },
  {
    type: "ul",
    items: [
      `**Signer un W-8BEN en étant US person.** Le cas des binationaux et Américains accidentels : le passeport américain impose le W-9, même en vivant en France depuis toujours. Le W-8BEN signé « par simplicité » est une fausse déclaration au regard du droit américain.`,
      `**Remplir un W-8BEN pour le compte d'une société.** Une SCI, une holding familiale ou une société de gestion de patrimoine n'est pas une personne physique : c'est le W-8BEN-E qui s'applique, avec sa classification. Le W-8BEN « au nom du gérant » sur un compte de société est un grand classique du formulaire rejeté.`,
    ],
  },
  { type: "h2", text: `Vos questions sur le choix du formulaire` },
  {
    type: "faq",
    items: [
      {
        question: `Mon courtier m'a fait remplir un questionnaire à l'ouverture : lequel ai-je signé ?`,
        answer: `Chez la plupart des courtiers en ligne, le questionnaire d'ouverture tient lieu de W-8BEN pour une personne physique non-US. Vérifiez dans vos documents fiscaux en ligne : la mention « W-8BEN » et une date de signature y figurent en général. En cas de doute, le taux appliqué à votre dernier dividende américain tranche : ${pct(usTreaty, "fr")} signifie qu'un W-8BEN valide est en place, ${pct(us.statutoryRate, "fr")} qu'il manque ou a expiré.`,
      },
      {
        question: `Je suis binational franco-américain : puis-je quand même récupérer des retenues étrangères ?`,
        answer: `Sur les dividendes non américains (Suisse, Allemagne…), les conventions de votre pays de résidence continuent de s'appliquer : ce volet reste ouvert. Sur les dividendes américains, en revanche, votre statut de US person change entièrement le cadre (W-9, imposition américaine) — un sujet que nous ne traitons pas et qui mérite un conseil spécialisé.`,
      },
      {
        question: `Le W-9 expire-t-il comme le W-8BEN ?`,
        answer: `Non : le W-9 reste valable tant que les informations qu'il porte sont exactes. La règle des trois années civiles ne concerne que la famille W-8. C'est une différence de confort notable — mais elle ne rend pas le statut de US person plus avantageux pour autant sur un portefeuille de dividendes.`,
      },
      {
        question: `Ma société doit-elle refaire son W-8BEN-E tous les trois ans aussi ?`,
        answer: `Oui : même règle de validité que le W-8BEN — fin de la troisième année civile suivant la signature, ou immédiatement en cas de changement de situation (siège, statut, classification). Le [vérificateur d'expiration](${href("fr", "w8benChecker")}) s'applique donc aussi aux W-8BEN-E.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "w8benChecker",
    label: `Vérifier la validité de mon W-8BEN`,
    note: `Gratuit, sans compte — la date d'expiration exacte en dix secondes.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Three IRS forms look alike enough to be confused — and differ enough for the wrong choice to be expensive: the **W-9**, the **W-8BEN** and the **W-8BEN-E**. All three answer the same question your broker asks ("who are you, tax-wise, in relation to the United States?"), but they address three different populations. Here is how to choose in thirty seconds, what each one triggers on your US dividends, and the two traps that come up again and again.`,
  },
  { type: "h2", text: `The thirty-second decision` },
  {
    type: "ol",
    items: [
      `**You are a "US person"** — a US citizen (dual nationals included), a green-card holder or a US tax resident: **W-9**, whatever country you live in.`,
      `**You are an individual, not a US person, investing in your own name**: **W-8BEN** — the case of the vast majority of this site's readers.`,
      `**The account belongs to a company, holding structure or other non-US entity**: **W-8BEN-E**, the "entities" version, markedly heavier.`,
    ],
  },
  {
    type: "table",
    caption: `The three status certificates compared — indicative rates for a French tax resident, data reviewed in mid-2026.`,
    headers: [``, `W-9`, `W-8BEN`, `W-8BEN-E`],
    rows: [
      [`Who it is for`, `US persons (citizens, green cards, US residents)`, `Non-US individuals`, `Non-US companies and entities`],
      [`Length`, `1 page`, `1 page`, `8 pages, ~30 possible statuses`],
      [
        `Effect on dividend withholding`,
        `No withholding at source; income reported to the IRS (1099)`,
        `${pct(usTreaty, "en")} instead of ${pct(us.statutoryRate, "en")} (FR-US treaty)`,
        `Treaty rate according to the entity's status`,
      ],
      [`Validity`, `No expiry (unless circumstances change)`, `End of the 3rd calendar year after signature`, `End of the 3rd calendar year after signature`],
      [
        `Our fixed fee`,
        `— (not a service we provide)`,
        eur(PRICING.fixedServices.w8ben, "en"),
        eur(PRICING.fixedServices.w8benE, "en"),
      ],
    ],
  },
  { type: "h2", text: `W-9: the form for US persons — including reluctant ones` },
  {
    type: "p",
    text: `The W-9 claims no treaty benefit: it certifies that you are a US taxpayer, transmits your US tax number, and triggers the reporting of your income to the IRS. The trap worth stating: US citizenship alone is enough. A French-American dual national living in Paris, or an "accidental American" born in the US, must file a W-9 — **not** a W-8BEN. Signing a W-8BEN while being a US person is a false certification, with real consequences. If that is your situation, our service is not for you: your subject belongs with a lawyer specialised in US taxation, and we would rather tell you here than bill you for nothing.`,
  },
  { type: "h2", text: `W-8BEN: the form that cuts withholding from ${pct(us.statutoryRate, "en")} to ${pct(usTreaty, "en")}` },
  {
    type: "p",
    text: `This is the standard case for a French individual investor: the W-8BEN certifies to your broker that you are not a US person and that you reside in a treaty country. The immediate result: US withholding on your dividends drops from the default ${pct(us.statutoryRate, "en")} to the ${pct(usTreaty, "en")} treaty rate — from the very next payment, with nothing to claim back. It expires at the end of the 3rd calendar year after signature, silently. [Our line-by-line tutorial](${articleHref("en", W8BEN_GUIDE_SLUG.en)}) lets you complete it on your own; the [free checker](${href("en", "w8benChecker")}) tells you whether yours is still valid.`,
  },
  { type: "h2", text: `W-8BEN-E: the same idea, for entities — and eight pages` },
  {
    type: "p",
    text: `As soon as the securities account belongs to a legal person — a family company, a holding structure, an investment vehicle — the W-8BEN no longer fits: it is the W-8BEN-E. Same principle (certify non-US status and claim the treaty), but the exercise changes scale: eight pages, some thirty possible chapter 4 (FATCA) statuses, and an entity classification on which the applied rate depends. One wrongly ticked box and the paying institution withholds ${pct(us.statutoryRate, "en")} out of caution. It is the only one of the three forms where we plainly advise against DIY without prior experience — our fixed fee is ${eur(PRICING.fixedServices.w8benE, "en")}, classification questionnaire included.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What about the other W-8s?`,
    text: `The family has two other members you will rarely meet: the W-8IMY (intermediaries and flow-through structures — brokers, partnerships) and the W-8ECI (income effectively connected with a US business). If your situation calls for them, it exceeds the scope of a dividend portfolio — and the right reflex is specialised advice, not a form picked at random.`,
  },
  { type: "h2", text: `The two most expensive mix-ups` },
  {
    type: "ul",
    items: [
      `**Signing a W-8BEN while being a US person.** The dual-national and accidental-American case: a US passport mandates the W-9, even after a lifetime in France. A W-8BEN signed "for simplicity" is a false certification under US law.`,
      `**Filing a W-8BEN on behalf of a company.** A property company, family holding or wealth-management vehicle is not an individual: the W-8BEN-E applies, classification included. A W-8BEN "in the manager's name" on a corporate account is a classic of the rejected form.`,
    ],
  },
  { type: "h2", text: `Your questions about choosing the form` },
  {
    type: "faq",
    items: [
      {
        question: `My broker had me fill in a questionnaire at account opening: which form did I sign?`,
        answer: `With most online brokers, the opening questionnaire serves as a W-8BEN for a non-US individual. Check your online tax documents: the words "W-8BEN" and a signature date usually appear there. When in doubt, the rate applied to your last US dividend settles it: ${pct(usTreaty, "en")} means a valid W-8BEN is on file, ${pct(us.statutoryRate, "en")} means it is missing or expired.`,
      },
      {
        question: `I am a French-American dual national: can I still recover foreign withholding?`,
        answer: `On non-US dividends (Switzerland, Germany…), your residence country's treaties keep applying: that side remains open. On US dividends, however, your US-person status changes the whole framework (W-9, US taxation) — a subject we do not handle and which deserves specialised advice.`,
      },
      {
        question: `Does the W-9 expire like the W-8BEN?`,
        answer: `No: the W-9 remains valid as long as the information on it is accurate. The three-calendar-year rule only concerns the W-8 family. A notable comfort difference — though it does not make US-person status any more advantageous on a dividend portfolio.`,
      },
      {
        question: `Does my company have to redo its W-8BEN-E every three years too?`,
        answer: `Yes: the same validity rule as the W-8BEN — end of the third calendar year after signature, or immediately upon a change in circumstances (registered office, status, classification). The [expiry checker](${href("en", "w8benChecker")}) therefore applies to W-8BEN-E forms as well.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "w8benChecker",
    label: `Check my W-8BEN's validity`,
    note: `Free, no account — your exact expiry date in ten seconds.`,
  },
];

export const w8benVsW8beneVsW9: Article = {
  id: "w8ben-vs-w8bene-vs-w9",
  slug: {
    fr: "w-8ben-w-8ben-e-w-9-quel-formulaire",
    en: "w-8ben-vs-w-8ben-e-vs-w-9",
  },
  category: "comparisons",
  title: {
    fr: "W-8BEN, W-8BEN-E ou W-9 : quel formulaire devez-vous remplir ?",
    en: "W-8BEN, W-8BEN-E or W-9: which form should you file?",
  },
  description: {
    fr: `Trois formulaires IRS, trois populations : particuliers non-US, entités, et US persons — binationaux compris. Le choix en trente secondes, l'effet de chacun sur la retenue de ${pct(us.statutoryRate, "fr")}, et les deux confusions qui coûtent le plus cher.`,
    en: `Three IRS forms, three populations: non-US individuals, entities, and US persons — dual nationals included. The thirty-second decision, each form's effect on the ${pct(us.statutoryRate, "en")} withholding, and the two most expensive mix-ups.`,
  },
  updated: "2026-07-12",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US"],
};
