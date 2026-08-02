import { formatCurrency, type Locale } from "@/lib/i18n";
import { articleHref, href } from "@/lib/routes";
import { PRICING } from "@/config/pricing";
import { COUNTRIES, getCountryById } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — the residence-certificate step (Cerfa 5000) that sits upstream
 * of nearly every claim in @/data/countries (see docsRequired). Distinct
 * from the FR entry in countries.ts, which covers the same form from the
 * opposite direction (a foreign resident proving residence to reclaim French
 * withholding). Pricing pulled from @/config/pricing, never restated.
 */

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);

const ca = getCountryById("CA")!;
const pt = getCountryById("PT")!;
const ch = getCountryById("CH")!;

/** Countries whose docsRequired explicitly names a residence certificate — for the illustrative list. */
const NEEDING_CERTIFICATE = COUNTRIES.filter((c) => c.id !== "GB" && c.id !== "NL").length;

const REJECTION_REASONS_SLUG = {
  fr: "7-raisons-rejet-demande-remboursement",
  en: "7-reasons-withholding-refund-claims-get-rejected",
} as const;
const SOL_RANKING_SLUG = {
  fr: "classement-delais-prescription-par-pays",
  en: "statute-of-limitations-ranking-by-country",
} as const;
const FORMS_BY_COUNTRY_SLUG = {
  fr: "formulaires-remboursement-par-pays",
  en: "refund-forms-by-country",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Regardez la liste des pièces exigées pour presque n'importe quel pays de notre panel — ${NEEDING_CERTIFICATE} sur les 19 que nous couvrons — et un document revient systématiquement : le **certificat de résidence fiscale**. En France, ce document a un nom précis : le formulaire 5000 (Cerfa 12816). C'est souvent la toute première pièce qui bloque un dossier, avant même que la question du pays étranger ne se pose.`,
  },
  { type: "h2", text: `À quoi sert exactement le formulaire 5000` },
  {
    type: "p",
    text: `Le 5000 est un formulaire bilatéral : une attestation de résidence fiscale visée par l'administration d'un pays, destinée à être présentée à l'administration d'un autre pays pour obtenir l'application d'une convention fiscale. Il fonctionne dans les deux sens. Un résident de France qui perçoit des dividendes suisses, allemands ou canadiens fait viser un formulaire 5000 par son centre des impôts français, puis le transmet — accompagné de son annexe spécifique au pays — à l'administration étrangère concernée. Symétriquement, un résident étranger qui perçoit des dividendes français fait viser sa propre attestation par son administration d'origine avant de la présenter à la DGFiP (c'est ce même mécanisme qui encadre la retenue sur dividendes français évoquée dans notre fiche pays dédiée).`,
  },
  {
    type: "p",
    text: `Le formulaire comporte une partie générique (identité, adresse, année fiscale concernée) et, la plupart du temps, une annexe propre au pays de destination et au type de revenu — dividendes, intérêts, redevances n'utilisent pas la même annexe. Une erreur d'annexe est l'une des causes de rejet les plus fréquentes, et l'une des plus faciles à éviter avec un peu de méthode.`,
  },
  { type: "h2", text: `Comment on l'obtient, concrètement` },
  {
    type: "p",
    text: `Pour un résident français, l'attestation de résidence se demande auprès du service des impôts des particuliers (SIP) dont vous dépendez, soit par courrier, soit via la messagerie sécurisée de votre espace impots.gouv.fr. Une attestation de résidence « générique » (sans convention précise) peut, selon les cas, s'obtenir en ligne ; mais l'annexe bilatérale propre à une convention et à un type de revenu requiert le plus souvent un traitement manuel par un agent, avec visa et cachet — une étape qui ne se dématérialise pas entièrement partout.`,
  },
  { type: "h2", text: `Cinq raisons pour lesquelles cette étape traîne ou échoue` },
  {
    type: "ol",
    items: [
      `**Le formulaire couvre la mauvaise année fiscale.** Un 5000 daté pour l'année N ne vaut pas systématiquement pour les dividendes versés en N-1 ou N+1 : chaque demande a sa propre fenêtre de validité, à vérifier avant l'envoi.`,
      `**La mauvaise annexe pays a été jointe.** Le corps du formulaire est commun, mais l'annexe change selon le pays de destination et le type de revenu — une confusion fréquente quand le même contribuable détient des dividendes dans plusieurs pays la même année.`,
      `**Le SIP est surchargé et le délai de traitement dépasse la fenêtre disponible.** Le traitement manuel prend en général plusieurs semaines ; sur un dossier au délai de prescription serré — le Canada ou le Portugal, par exemple, avec ${ca.sol.years} et ${pt.sol.years} ans seulement pour agir — une demande envoyée trop tard n'a plus le temps d'aboutir avant que le droit à réclamation à l'étranger ne s'éteigne. Voir [notre classement des délais par pays](${articleHref("fr", SOL_RANKING_SLUG.fr)}).`,
      `**Une signature électronique est refusée par l'administration étrangère.** Certains pays du panel — la Suisse en particulier depuis le passage à la procédure en ligne — acceptent le dépôt dématérialisé, mais d'autres exigent encore un original signé à l'encre : envoyer un scan là où un original est requis fait perdre le bénéfice du dépôt sans que l'erreur soit toujours signalée clairement en retour.`,
      `**Un formulaire par pays et par année s'accumule sans être anticipé.** Un portefeuille sur ${ch.name.fr}, l'Allemagne et le Canada la même année réclame trois démarches distinctes auprès du même SIP : sans les regrouper en une seule fois, chaque relance repart du début du circuit.`,
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `Ce n'est qu'une pièce parmi d'autres`,
    text: `Le certificat de résidence est la condition d'entrée, pas la garantie d'aboutissement : relevés incomplets, mandat mal rédigé ou dossier déposé après l'échéance restent des causes de rejet à part entière. [Nos 7 raisons de rejet les plus fréquentes](${articleHref("fr", REJECTION_REASONS_SLUG.fr)}) couvrent l'ensemble du dossier, au-delà de cette seule étape.`,
  },
  { type: "h2", text: `Ce que nous faisons différemment` },
  {
    type: "p",
    text: `Nous obtenons l'attestation de résidence en votre nom, avec la bonne annexe pour chaque pays et chaque année concernés, et nous la déposons suffisamment tôt pour ne jamais faire courir de risque au délai de prescription du pays source. Cette démarche est incluse dans un dossier de récupération standard ; elle est aussi disponible seule, en prestation ponctuelle, pour ${eur(PRICING.fixedServices.residenceCertificate, "fr")} — par exemple si vous gérez vous-même le dépôt à l'étranger mais butez sur cette seule étape administrative française. Voir [le détail de cette prestation](${href("fr", "serviceResidenceCert")}).`,
  },
  { type: "h2", text: `Vos questions sur le formulaire 5000` },
  {
    type: "faq",
    items: [
      {
        question: `Le formulaire 5000 est-il payant auprès de l'administration ?`,
        answer: `Non, l'obtention de l'attestation auprès du SIP est gratuite. Ce qui a un coût, le cas échéant, c'est le temps passé à suivre le dossier, relancer l'administration et éviter les erreurs d'annexe — c'est cette partie que notre prestation prend en charge.`,
      },
      {
        question: `Une seule attestation suffit-elle pour tous mes pays de dividendes ?`,
        answer: `Non : le corps du formulaire est réutilisable dans son principe, mais chaque pays de destination requiert sa propre annexe et, souvent, un exemplaire distinct visé pour cette destination précise.`,
      },
      {
        question: `Combien de temps l'attestation reste-t-elle valable ?`,
        answer: `Cela dépend de l'administration étrangère et du type de revenu — certaines conventions attachent l'attestation à une année fiscale précise, d'autres tolèrent une validité glissante de douze mois. C'est un point à vérifier pays par pays, ce que fait notre diagnostic avant tout dépôt.`,
      },
      {
        question: `Que se passe-t-il si mon formulaire est refusé par l'administration étrangère ?`,
        answer: `Le refus mentionne en général le motif (année erronée, annexe manquante, signature non conforme) : la correction et le redépôt restent possibles tant que le délai de prescription du pays source n'est pas atteint — d'où l'intérêt de ne pas attendre la dernière ligne droite pour engager la démarche.`,
      },
    ],
  },
  {
    type: "p",
    text: `Pour situer cette étape dans l'ensemble du parcours, [notre tableau des formulaires de remboursement par pays](${articleHref("fr", FORMS_BY_COUNTRY_SLUG.fr)}) indique, pour chaque administration, si un certificat de résidence distinct est exigé en plus du formulaire local.`,
  },
  {
    type: "cta",
    routeKey: "contact",
    label: `Faire établir mon attestation de résidence fiscale`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Look at the documents required for almost any country in our panel — ${NEEDING_CERTIFICATE} of the 19 we cover — and one document keeps coming up: the **certificate of tax residence**. In France, that document has a specific name: Form 5000 (Cerfa 12816). It's often the very first piece that stalls a claim, before the destination country even comes into play.`,
  },
  { type: "h2", text: `What Form 5000 is actually for` },
  {
    type: "p",
    text: `Form 5000 is bilateral: a residence attestation stamped by one country's administration, meant to be presented to another country's administration to obtain treaty relief. It works both ways. A French resident receiving Swiss, German or Canadian dividends gets a 5000 stamped by their French tax office, then sends it — with the country-specific schedule attached — to the relevant foreign administration. Symmetrically, a foreign resident receiving French dividends gets their own attestation stamped by their home administration before presenting it to the DGFiP (the same mechanism that governs the French dividend withholding covered in our dedicated country profile).`,
  },
  {
    type: "p",
    text: `The form has a generic section (identity, address, tax year concerned) and, most of the time, a schedule specific to the destination country and the income type — dividends, interest and royalties don't use the same schedule. A wrong schedule is one of the most common causes of rejection, and one of the easiest to avoid with a little method.`,
  },
  { type: "h2", text: `How you actually get it` },
  {
    type: "p",
    text: `For a French resident, the residence attestation is requested from your local tax office (SIP), either by mail or through the secure messaging on your impots.gouv.fr account. A "generic" residence attestation (with no specific treaty attached) can sometimes be obtained online; but the bilateral schedule tied to a specific treaty and income type usually still requires manual processing by an agent, with a stamp and signature — a step that doesn't fully dematerialise everywhere.`,
  },
  { type: "h2", text: `Five reasons this step drags on or fails` },
  {
    type: "ol",
    items: [
      `**The form covers the wrong tax year.** A 5000 dated for year N doesn't automatically cover dividends paid in N-1 or N+1: each request has its own validity window, worth checking before sending.`,
      `**The wrong country schedule was attached.** The form body is shared, but the schedule changes with the destination country and income type — a frequent mix-up when the same taxpayer holds dividends in several countries the same year.`,
      `**The tax office is backlogged and processing outlasts the available window.** Manual processing typically takes several weeks; on a file with a tight statute of limitations — Canada or Portugal, for instance, with only ${ca.sol.years} and ${pt.sol.years} years to act — a request sent too late no longer has time to land before the foreign claim right expires. See [our statute-of-limitations ranking by country](${articleHref("en", SOL_RANKING_SLUG.en)}).`,
      `**An electronic signature gets rejected by the foreign administration.** Some countries in our panel — Switzerland in particular since moving to online filing — accept dematerialised submission, but others still require a wet-ink original: sending a scan where an original is required forfeits the filing, and the rejection isn't always clearly flagged back.`,
      `**One form per country per year piles up unanticipated.** A portfolio spanning ${ch.name.en}, Germany and Canada in the same year requires three separate requests to the same tax office: without bundling them into one pass, each follow-up restarts the whole circuit.`,
    ],
  },
  {
    type: "callout",
    tone: "warning",
    title: `It's one document among several`,
    text: `The residence certificate is the entry condition, not a guarantee of success: incomplete statements, a poorly worded mandate, or a file filed after the deadline remain full-fledged causes of rejection on their own. [Our 7 most common rejection reasons](${articleHref("en", REJECTION_REASONS_SLUG.en)}) cover the whole file, beyond this one step.`,
  },
  { type: "h2", text: `What we do differently` },
  {
    type: "p",
    text: `We obtain the residence attestation on your behalf, with the correct schedule for each country and year involved, and file it early enough to never put the source country's statute of limitations at risk. This is included in a standard recovery file; it's also available on its own, as a one-off service, for ${eur(PRICING.fixedServices.residenceCertificate, "en")} — for instance if you handle the foreign filing yourself but get stuck on this one French administrative step. See [the service details](${href("en", "serviceResidenceCert")}).`,
  },
  { type: "h2", text: `Your questions on Form 5000` },
  {
    type: "faq",
    items: [
      {
        question: `Does the tax office charge for Form 5000?`,
        answer: `No, obtaining the attestation from your tax office is free. What has a cost, if any, is the time spent tracking the file, chasing the administration and avoiding schedule errors — that's the part our service handles.`,
      },
      {
        question: `Does one attestation cover all my dividend-paying countries?`,
        answer: `No: the form body is reusable in principle, but each destination country needs its own schedule and, often, a separate copy stamped for that specific destination.`,
      },
      {
        question: `How long does the attestation stay valid?`,
        answer: `It depends on the foreign administration and the income type — some treaties tie the attestation to one specific tax year, others allow a rolling twelve-month validity. It's a point to check country by country, which our diagnostic does before any filing.`,
      },
      {
        question: `What happens if my form is rejected by the foreign administration?`,
        answer: `The rejection generally states the reason (wrong year, missing schedule, non-compliant signature): correcting and refiling remains possible as long as the source country's statute of limitations hasn't been reached — which is why it pays not to wait until the last stretch to start the process.`,
      },
    ],
  },
  {
    type: "p",
    text: `To place this step within the whole process, [our table of refund forms by country](${articleHref("en", FORMS_BY_COUNTRY_SLUG.en)}) shows, for each administration, whether a separate residence certificate is required on top of the local form.`,
  },
  {
    type: "cta",
    routeKey: "contact",
    label: `Get my tax residence certificate issued`,
  },
];

export const residenceCertificateForm5000: Article = {
  id: "residence-certificate-form-5000",
  slug: {
    fr: "certificat-residence-fiscale-formulaire-5000",
    en: "tax-residence-certificate-form-5000",
  },
  category: "problems",
  title: {
    fr: `Certificat de résidence fiscale (formulaire 5000) : pourquoi tant de demandes traînent ou échouent`,
    en: `Tax residence certificate (Form 5000): why so many claims stall or fail`,
  },
  description: {
    fr: `Presque toutes les récupérations de retenue à la source commencent par le même document, le formulaire 5000 — et c'est souvent là que les dossiers s'enlisent. Les cinq erreurs les plus fréquentes, et comment les éviter.`,
    en: `Almost every withholding tax recovery starts with the same document, Form 5000 — and it's often where claims get stuck. The five most common mistakes, and how to avoid them.`,
  },
  updated: "2026-08-02",
  readingMinutes: 7,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["CA", "PT", "CH", "FR"],
};
