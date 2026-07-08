import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, type RouteKey } from "@/lib/routes";
import { COUNTRIES, getCountryById, treatyRateFor } from "@/data/countries";
import { PRICING, computeCommission } from "@/config/pricing";
import { SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";

/**
 * THE big FAQ — six thematic groups, 29 real answers (Sheridan style: answer
 * for real, never "contact us"). Every rate, deadline and price below is
 * computed from @/data/countries and @/config/pricing at module load; nothing
 * is restated by hand.
 */

/* ------------------------------------------------------------------ */
/* Data pulled from the sources of truth                               */
/* ------------------------------------------------------------------ */

const CH = getCountryById("CH")!;
const US = getCountryById("US")!;
const CA = getCountryById("CA")!;
const NL = getCountryById("NL")!;
const AT = getCountryById("AT")!;

const N_COUNTRIES = COUNTRIES.length;
const SOL_MIN = Math.min(...COUNTRIES.map((c) => c.sol.years));
const SOL_MAX = Math.max(...COUNTRIES.map((c) => c.sol.years));
const NAMES_FR = COUNTRIES.map((c) => c.name.fr).join(", ");
const NAMES_EN = COUNTRIES.map((c) => c.name.en).join(", ");

/** Worked pricing example used in the "Prix" group. */
const EX_RECOVERED = 5_000;
const EX = computeCommission(EX_RECOVERED);
const TIERS = PRICING.successFeeTiers;

/** Per-locale formatted values, computed once at module load. */
function values(locale: Locale) {
  const c = (n: number) => formatCurrency(n, locale);
  const p = (r: number, d = 3) => formatPercent(r, locale, d);
  return {
    zero: c(0),
    floor: c(PRICING.floorFee),
    cap: c(PRICING.capFee),
    t1max: c(TIERS[0].upTo),
    t2max: c(TIERS[1].upTo),
    t3max: c(TIERS[2].upTo),
    t1: p(TIERS[0].rate, 0),
    t2: p(TIERS[1].rate, 0),
    t3: p(TIERS[2].rate, 0),
    t4: p(TIERS[3].rate, 0),
    instit: c(PRICING.institutionalThreshold),
    exAmount: c(EX_RECOVERED),
    exFee: c(EX.fee),
    exNet: c(EX.net),
    exEff: formatPercent(EX.effectiveRate, locale, 1),
    w8ben: c(PRICING.fixedServices.w8ben),
    w8benE: c(PRICING.fixedServices.w8benE),
    resCert: c(PRICING.fixedServices.residenceCertificate),
    itin: c(PRICING.fixedServices.itin),
    priority: c(PRICING.fixedServices.priorityHandling),
    subMonthly: c(PRICING.subscription.monthly),
    subYearly: c(PRICING.subscription.yearly),
    humanReview: c(PRICING.humanReviewThreshold),
    smallThreshold: c(SMALL_CLAIM_ADVICE_THRESHOLD),
    chStat: p(CH.statutoryRate),
    chTreaty: p(treatyRateFor(CH, "FR")),
    usStat: p(US.statutoryRate),
    usTreaty: p(treatyRateFor(US, "FR")),
    nlStat: p(NL.statutoryRate),
  };
}

const vFr = values("fr");
const vEn = values("en");

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface FaqLink {
  key: RouteKey;
  label: string;
}

interface FaqGroup {
  /** Stable anchor id, shared across locales. */
  id: string;
  title: string;
  lede: string;
  items: FAQItem[];
  links: FaqLink[];
}

interface FaqCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  lede: (questionCount: number) => string;
  tocLabel: string;
  groups: FaqGroup[];
  finalCta: {
    title: string;
    lede: string;
    contactLink: string;
  };
}

const copy: Localized<FaqCopy> = {
  fr: {
    metaTitle: "FAQ — éligibilité, prix, délais, documents, sécurité",
    metaDescription:
      "Toutes les questions qu'on nous pose sur la récupération de retenue à la source : qui est éligible, combien ça coûte, combien de temps ça prend, quels documents fournir — avec de vraies réponses chiffrées.",
    kicker: "FAQ",
    h1: "La FAQ : de vraies réponses, chiffres compris",
    lede: (n) =>
      `Une FAQ ne devrait jamais répondre « contactez-nous ». Les ${n} questions ci-dessous reçoivent une réponse complète, avec les mêmes chiffres que nos pages tarifs et pays — importés des mêmes données, jamais recopiés à la main.`,
    tocLabel: "Aller directement à",
    groups: [
      {
        id: "eligibilite",
        title: "Éligibilité",
        lede: "Qui peut récupérer, sur quels pays, à partir de quels montants.",
        items: [
          {
            question: "Qui peut utiliser FiscalPlace ?",
            answer:
              "Toute personne qui perçoit des dividendes étrangers sur-prélevés : particuliers d'abord, mais aussi holdings patrimoniales et petites structures. Notre simulateur couvre les résidences fiscales française, belge, luxembourgeoise et suisse, plus un profil générique pour les autres pays conventionnés. La condition de fond est unique : être résident fiscal d'un pays lié au pays source par une convention fiscale — c'est cette convention qui crée votre droit à remboursement, pas nous.",
          },
          {
            question: "Quels pays couvrez-vous ?",
            answer: `${N_COUNTRIES} pays sources à ce jour : ${NAMES_FR} — chacun avec sa fiche détaillée (taux, délais, documents, pièges). Deux figurent dans la liste pour une raison inverse : le Royaume-Uni ne prélève rien sur les dividendes ordinaires, et la retenue néerlandaise de ${vFr.nlStat} correspond déjà au taux conventionnel pour un particulier résident de France — il n'y a donc généralement rien à y récupérer, et nous le disons.`,
          },
          {
            question:
              "Mon courtier a déjà appliqué le taux réduit : ai-je quand même quelque chose à récupérer ?",
            answer: `Parfois, oui. Le taux réduit à la source ne fonctionne que si le bon formulaire était valide au bon moment : un W-8BEN expiré (il expire à la fin de la 3e année civile suivant sa signature), un changement de courtier ou un compte omnibus mal paramétré suffisent à faire rebasculer certains versements au taux plein — ${vFr.usStat} au lieu de ${vFr.usTreaty} sur les dividendes américains, par exemple. Notre diagnostic ligne à ligne repère précisément les versements sur-prélevés ; s'il n'y a rien, il conclut « rien à déposer », gratuitement.`,
          },
          {
            question: "J'ai des dividendes de plusieurs pays : un dossier ou plusieurs ?",
            answer:
              "Une demande par administration : chaque pays instruit séparément, avec ses propres formulaires et délais. Dans votre espace, tout est regroupé : chaque pays devient une écriture distincte avec sa jauge d'avancement, et la commission se calcule dossier par dossier. Détail utile : la Suisse limite à trois demandes par an et par demandeur — nous regroupons donc vos dividendes suisses en une demande annuelle.",
          },
          {
            question: "Une société ou une holding peut-elle utiliser le service ?",
            answer: `Oui. Les entités suivent le même parcours avec des formulaires propres — W-8BEN-E côté américain (proposé en forfait à ${vFr.w8benE}), preuves de bénéficiaire effectif ailleurs. Les administrations examinent ce point de près depuis les scandales d'arbitrage de dividendes : prévoyez un peu plus de justificatifs qu'un particulier. Au-delà de ${vFr.instit} récupérés, une tarification volume se discute au cas par cas.`,
          },
          {
            question: "Y a-t-il un montant minimum de dossier ?",
            answer: `Non — mais un seuil de bon sens. Sous ${vFr.smallThreshold} de trop-perçu estimé, notre commission plancher de ${vFr.floor} absorberait l'essentiel du gain : le simulateur vous le dit et vous conseille d'attendre puis de regrouper plusieurs années avant de déposer. Au-dessus, même quelques centaines d'euros justifient un dépôt : c'est précisément ce que notre chaîne de traitement automatisée rend rentable.`,
          },
        ],
        links: [
          { key: "countries", label: "Toutes les fiches pays" },
          { key: "simulator", label: "Tester mon cas dans le simulateur" },
        ],
      },
      {
        id: "prix",
        title: "Prix",
        lede: "Le barème complet est public ; en voici la lecture commentée.",
        items: [
          {
            question: "Combien coûte la récupération ?",
            answer: `Une commission au succès uniquement, dégressive et marginale par tranche du montant récupéré : ${vFr.t1} jusqu'à ${vFr.t1max}, ${vFr.t2} de ${vFr.t1max} à ${vFr.t2max}, ${vFr.t3} de ${vFr.t2max} à ${vFr.t3max}, ${vFr.t4} au-delà. Comme pour l'impôt sur le revenu, chaque tranche est facturée à son propre taux : changer de tranche ne renchérit jamais les tranches précédentes. S'y ajoutent deux garde-fous : un plancher de ${vFr.floor} et un plafond de ${vFr.cap} par dossier abouti.`,
          },
          {
            question: "Et si la démarche échoue, je paie quoi ?",
            answer: `${vFr.zero}. Pas de frais de dossier, pas d'avance, pas de frais d'étude. Le diagnostic initial est gratuit, y compris quand il conclut qu'il n'y a rien à récupérer. Un rejet définitif par l'administration ne vous coûte rien non plus : ce risque fait partie de notre modèle économique, pas du vôtre.`,
          },
          {
            question: `Pourquoi une commission plancher de ${vFr.floor} ?`,
            answer: `Chaque dossier abouti déclenche des coûts fixes incompressibles : certificats, préparation, dépôt, suivi, reversement. Le plancher de ${vFr.floor} les couvre sur les très petits dossiers — et il n'est facturé qu'en cas de succès. C'est aussi pour cela que le simulateur vous déconseille de déposer sous ${vFr.smallThreshold} de trop-perçu : nous préférons vous dire d'attendre plutôt que d'encaisser un plancher sur un gain marginal.`,
          },
          {
            question: "Y a-t-il des frais cachés ou des options payantes ?",
            answer: `La commission au succès couvre tout le parcours standard. À côté, des forfaits fixes existent pour des besoins ponctuels, tous publics : W-8BEN à ${vFr.w8ben} (${vFr.w8benE} pour une entité), certificat de résidence fiscale à ${vFr.resCert}, ITIN à ${vFr.itin} (déduit de la commission si vous basculez en récupération complète), traitement prioritaire à ${vFr.priority} pour un dossier proche de la prescription. L'abonnement de surveillance multi-portefeuille (${vFr.subMonthly} par mois ou ${vFr.subYearly} par an) est optionnel. Il n'existe aucun autre frais.`,
          },
          {
            question: `Concrètement, sur ${vFr.exAmount} récupérés, vous prenez combien ?`,
            answer: `${vFr.exFee}, soit un taux effectif de ${vFr.exEff} : la première tranche (jusqu'à ${vFr.t1max}) est facturée à ${vFr.t1}, le reste à ${vFr.t2}. Il vous revient ${vFr.exNet}, versés après réception effective du remboursement. Le calcul tranche par tranche, pour n'importe quel montant, est détaillé sur la page tarifs et dans le simulateur.`,
          },
        ],
        links: [
          { key: "pricing", label: "Le barème complet" },
          { key: "howWeGetPaid", label: "Comment nous sommes payés" },
        ],
      },
      {
        id: "delais",
        title: "Délais & prescription",
        lede: "Deux horloges tournent en parallèle : celle de la prescription, et celle de l'instruction.",
        items: [
          {
            question: "Combien de temps ai-je pour réclamer un trop-perçu ?",
            answer: `De ${SOL_MIN} à ${SOL_MAX} ans selon le pays source, avec des règles de décompte différentes (fin d'année civile ou date anniversaire). Le Canada est le plus court du panel : ${CA.sol.years} ans après la fin de l'année civile du prélèvement — beaucoup de trop-perçus canadiens se prescrivent avant même que l'investisseur ait réalisé qu'il pouvait réclamer. L'Autriche et la Suède laissent ${AT.sol.years} ans. Notre calculateur de prescription donne la date limite exacte pour chaque dividende, gratuitement.`,
          },
          {
            question: "Combien de temps prend un remboursement ?",
            answer:
              "Honnêtement : de quelques semaines à plus de douze mois, selon l'administration. La Suède est réputée répondre relativement vite ; l'Allemagne dépasse fréquemment douze mois d'instruction. Nous n'avons aucun pouvoir sur le rythme des administrations : notre travail consiste à déposer un dossier complet du premier coup — le facteur n°1 des délais — puis à relancer. Votre espace affiche des fourchettes constatées, pas des promesses.",
          },
          {
            question: "Ma date limite approche : pouvez-vous accélérer ?",
            answer: `Oui, pour la partie qui dépend de nous : le traitement prioritaire (${vFr.priority} par dossier, en plus de la commission au succès) fait passer votre dossier en tête de notre file — préparation et dépôt accélérés. Ce qui compte juridiquement, en règle générale, c'est la date de dépôt de la demande : une fois déposée dans les temps, l'instruction peut se poursuivre au-delà de la date de prescription sans éteindre votre droit — nous vérifions la règle exacte du pays concerné avant chaque dépôt.`,
          },
          {
            question: "Puis-je récupérer sur des années passées ?",
            answer: `Oui — c'est même le cas le plus fréquent. Tout dividende dont le délai de prescription n'est pas expiré peut faire l'objet d'une demande : selon les pays, cela couvre les ${SOL_MIN} à ${SOL_MAX} dernières années. Regrouper plusieurs années dans un même dépôt est souvent la meilleure stratégie : mêmes justificatifs, une seule instruction, et une commission calculée sur le total récupéré — donc des tranches dégressives mieux utilisées.`,
          },
          {
            question: "Que se passe-t-il si la prescription expire avant que j'aie déposé ?",
            answer:
              "Le droit s'éteint, définitivement : aucune administration ne rouvre un délai de prescription expiré, et aucun prestataire — nous compris — ne peut l'obtenir pour vous. C'est le seul échec sans recours de toute la chaîne. C'est pourquoi nous conseillons de vérifier vos dates limites avant toute autre chose, avec le calculateur : gratuit, sans compte, deux minutes.",
          },
        ],
        links: [
          { key: "solCalculator", label: "Calculer mes dates limites" },
          { key: "countries", label: "Les délais pays par pays" },
        ],
      },
      {
        id: "processus",
        title: "Processus & documents",
        lede: "Ce que nous vous demandons, ce que nous faisons, et où va l'argent.",
        items: [
          {
            question: "De quels documents avez-vous besoin ?",
            answer:
              "Trois familles, communes à presque tous les pays : vos relevés de courtage (les versements et la retenue réellement prélevée), un certificat de résidence fiscale par année réclamée, et un mandat nous autorisant à agir auprès de l'administration. Certains pays ajoutent leurs pièces : tax vouchers originaux et attestations de dépôt (Depotbestätigung) en Allemagne, formulaire conventionnel visé par votre centre des impôts pour le Japon. Votre espace liste ce qui manque, pièce par pièce, pour chaque dossier.",
          },
          {
            question: "Qu'est-ce que le certificat de résidence fiscale, et comment l'obtenir ?",
            answer: `C'est le document par lequel votre administration atteste que vous étiez résident fiscal chez elle l'année du dividende — la pièce maîtresse de toute demande, et la première cause de rejet quand elle manque ou couvre la mauvaise année. Nous préparons la demande pré-remplie pour votre centre des impôts, sur le formulaire du bon pays (certains, comme l'Allemagne, imposent leur propre modèle). Ce service existe aussi seul, en forfait à ${vFr.resCert}.`,
          },
          {
            question: "Devez-vous accéder à mon compte de courtage ?",
            answer:
              "Non, jamais. Vous téléversez vos relevés (PDF ou export) dans votre espace ; nous ne demandons ni identifiants, ni accès en lecture chez votre courtier, ni procuration sur vos titres. Le mandat que vous signez porte uniquement sur les démarches fiscales de remboursement — pas sur vos avoirs.",
          },
          {
            question: "Comment se signe le mandat ?",
            answer:
              "Électroniquement, dans votre espace client, en quelques minutes : vous vérifiez le périmètre (pays, années, portée exacte du mandat), signez en ligne, et l'exemplaire horodaté reste consultable dans vos documents. Quand une administration exige en plus un original papier signé — cela existe encore —, nous générons le document prêt à signer et vous indiquons exactement quoi en faire.",
          },
          {
            question: "Où arrive l'argent remboursé ?",
            answer:
              "Sur le compte bancaire désigné dans la demande de remboursement — le vôtre. Le circuit exact varie selon l'administration et il est fixé noir sur blanc au moment du dépôt, visible dans votre dossier. Notre commission est facturée à ce moment-là seulement : une fois le remboursement effectivement reçu, jamais avant.",
          },
          {
            question: "Que se passe-t-il si l'administration rejette la demande ?",
            answer:
              "D'abord, comprendre le motif : la plupart des rejets sont documentaires — certificat inadapté, chaîne de détention insuffisamment prouvée, formulaire périmé — et se corrigent. Nous redéposons alors tant que la prescription est ouverte, sans frais supplémentaires. Si le rejet est définitif, vous ne payez rien : pas de récupération, pas de commission. Nous publions d'ailleurs les sept motifs de rejet les plus fréquents dans nos ressources, avec notre parade pour chacun.",
          },
        ],
        links: [
          { key: "howItWorks", label: "Le processus en détail" },
          { key: "resources", label: "Nos ressources sur les rejets et les pièges" },
        ],
      },
      {
        id: "securite",
        title: "Sécurité & données",
        lede: "Les réponses courtes ; la page sécurité détaille chaque mesure.",
        items: [
          {
            question: "Comment mes documents sont-ils protégés ?",
            answer:
              "Chiffrement en transit (TLS) pour chaque échange, chiffrement au repos pour les documents stockés, hébergement dans l'Union européenne, et accès internes cloisonnés selon le principe du moindre privilège : seules les personnes qui travaillent sur votre dossier y accèdent, et ces accès sont journalisés. La page sécurité détaille chaque mesure — y compris ce que nous n'affichons pas, comme les certifications que nous n'avons pas encore obtenues.",
          },
          {
            question: "Pourquoi vérifiez-vous mon identité ?",
            answer:
              "Parce que nous déposons des demandes en votre nom auprès d'administrations fiscales, et que des remboursements sont en jeu. La vérification d'identité et le filtrage sanctions/PEP, réalisés par un prestataire spécialisé, protègent contre deux risques réels : l'usurpation d'identité (quelqu'un qui réclamerait votre remboursement à votre place) et l'usage frauduleux du service. Elle a lieu une seule fois, à l'ouverture du dossier.",
          },
          {
            question: "Combien de temps conservez-vous mes données ?",
            answer:
              "Le temps du dossier, puis le temps des obligations légales : les pièces fiscales et comptables doivent être conservées plusieurs années après la clôture (jusqu'à 10 ans pour certaines pièces comptables), et les justificatifs d'identité suivent les durées imposées par la réglementation anti-blanchiment. Au-delà de ces durées : suppression ou anonymisation. Le détail, catégorie par catégorie, figure dans notre politique de confidentialité.",
          },
          {
            question: "Quels sont mes droits sur mes données (RGPD) ?",
            answer:
              "Accès, rectification, effacement, limitation, portabilité, opposition : tous les droits RGPD classiques, exerçables depuis votre espace ou par écrit. Une seule limite, honnête : nous ne pouvons pas effacer ce que la loi nous oblige à conserver — dossiers déposés auprès d'administrations, pièces comptables — avant l'expiration des durées légales. La politique de confidentialité explique comment exercer chaque droit, et auprès de qui.",
          },
        ],
        links: [
          { key: "security", label: "La page sécurité complète" },
          { key: "privacy", label: "Politique de confidentialité" },
        ],
      },
      {
        id: "espace-client",
        title: "Espace client & démo",
        lede: "Voir le produit avant de nous confier quoi que ce soit.",
        items: [
          {
            question: "Puis-je voir l'espace client avant d'ouvrir un dossier ?",
            answer:
              "Oui, intégralement : un compte de démonstration public montre l'espace client complet — dossiers en cours, jauges d'avancement, documents, messages, facturation — avec des données entièrement fictives. Aucune inscription, aucun email demandé. C'est la façon la plus rapide de juger si notre manière de travailler vous convient, avant d'envoyer le moindre relevé.",
          },
          {
            question: "Que vois-je pendant l'instruction de mon dossier ?",
            answer: `Chaque dossier est une écriture dans votre registre : le montant en jeu, l'étape en cours (préparation, dépôt, instruction, décision, versement), les documents échangés et une fourchette de délai constatée pour l'administration concernée. Chaque décision automatisée de notre chaîne de traitement — lecture d'un relevé, calcul, pré-validation — est journalisée et consultable ; au-delà de ${vFr.humanReview} de récupération estimée, une revue humaine est systématique avant dépôt.`,
          },
          {
            question: "Comment ouvrir un vrai compte ?",
            answer:
              "La création de comptes réels ouvrira au lancement commercial [DATE D'OUVERTURE DES COMPTES À ANNONCER]. D'ici là, trois choses sont déjà possibles : chiffrer votre trop-perçu avec le simulateur (sans compte), explorer la démo pour voir le produit exact, et nous poser une question sur votre situation via le formulaire de contact — réponse sous 2 jours ouvrés.",
          },
        ],
        links: [
          { key: "portal", label: "Explorer la démo" },
          { key: "portalOnboarding", label: "Voir le parcours d'entrée" },
        ],
      },
    ],
    finalCta: {
      title: "Une question qui n'est pas dans la liste ?",
      lede: "Posez-la : la réponse alimentera cette page. Et si votre question est « combien ? », le simulateur y répond en deux minutes, sans email.",
      contactLink: "Poser ma question",
    },
  },
  en: {
    metaTitle: "FAQ — eligibility, pricing, deadlines, documents, security",
    metaDescription:
      "Every question we get about withholding-tax recovery: who is eligible, what it costs, how long it takes, which documents are needed — with real, numbers-included answers.",
    kicker: "FAQ",
    h1: "The FAQ: real answers, numbers included",
    lede: (n) =>
      `An FAQ should never answer “contact us”. The ${n} questions below get a complete answer, with the same figures as our pricing and country pages — imported from the same data, never retyped by hand.`,
    tocLabel: "Jump to",
    groups: [
      {
        id: "eligibilite",
        title: "Eligibility",
        lede: "Who can recover, from which countries, and from what amounts.",
        items: [
          {
            question: "Who can use FiscalPlace?",
            answer:
              "Anyone receiving over-withheld foreign dividends: individual investors first, but also family holding companies and small structures. Our simulator covers French, Belgian, Luxembourg and Swiss tax residences, plus a generic profile for other treaty countries. The one substantive condition: being a tax resident of a country linked to the source country by a tax treaty — it is that treaty, not us, that creates your right to a refund.",
          },
          {
            question: "Which countries do you cover?",
            answer: `${N_COUNTRIES} source countries to date: ${NAMES_EN} — each with its own detailed guide (rates, deadlines, documents, traps). Two are on the list for the opposite reason: the UK withholds nothing on ordinary dividends, and the Dutch ${vEn.nlStat} withholding already matches the treaty rate for an individual French resident — so there is generally nothing to recover there, and we say so.`,
          },
          {
            question:
              "My broker already applied the reduced rate: is there still anything to recover?",
            answer: `Sometimes, yes. Relief at source only works if the right form was valid at the right moment: an expired W-8BEN (it lapses at the end of the third calendar year after signature), a broker switch or a misconfigured omnibus account are enough to push some payments back to the full rate — ${vEn.usStat} instead of ${vEn.usTreaty} on US dividends, for instance. Our line-by-line diagnostic pinpoints the over-withheld payments; if there is nothing, it concludes “nothing to file”, free of charge.`,
          },
          {
            question: "I have dividends from several countries: one claim or several?",
            answer:
              "One claim per administration: each country processes separately, with its own forms and deadlines. In your account everything is consolidated: each country becomes a distinct ledger entry with its own progress gauge, and the fee is computed claim by claim. Useful detail: Switzerland caps claims at three per year per claimant — so we bundle your Swiss dividends into one annual claim.",
          },
          {
            question: "Can a company or holding structure use the service?",
            answer: `Yes. Entities follow the same journey with their own forms — W-8BEN-E on the US side (available as a ${vEn.w8benE} fixed-fee service), beneficial-ownership evidence elsewhere. Administrations scrutinise this point closely since the dividend-arbitrage scandals: expect somewhat more paperwork than an individual. Above ${vEn.instit} recovered, volume pricing is quoted case by case.`,
          },
          {
            question: "Is there a minimum claim size?",
            answer: `No — but there is a common-sense threshold. Below ${vEn.smallThreshold} of estimated over-withholding, our ${vEn.floor} minimum fee would absorb most of the gain: the simulator tells you so and advises waiting, then pooling several years before filing. Above that, even a few hundred euros justify filing: that is exactly what our automated pipeline makes economical.`,
          },
        ],
        links: [
          { key: "countries", label: "All country guides" },
          { key: "simulator", label: "Test my case in the simulator" },
        ],
      },
      {
        id: "prix",
        title: "Pricing",
        lede: "The full fee schedule is public; here is the annotated reading.",
        items: [
          {
            question: "How much does recovery cost?",
            answer: `A success fee only, degressive and marginal by tranche of the recovered amount: ${vEn.t1} up to ${vEn.t1max}, ${vEn.t2} from ${vEn.t1max} to ${vEn.t2max}, ${vEn.t3} from ${vEn.t2max} to ${vEn.t3max}, ${vEn.t4} above. Like income-tax brackets, each slice is charged at its own rate: moving into a higher tranche never makes the earlier slices more expensive. Two guardrails apply on top: a ${vEn.floor} floor and a ${vEn.cap} cap per successful claim.`,
          },
          {
            question: "And if the claim fails, what do I pay?",
            answer: `${vEn.zero}. No file fee, no advance, no assessment fee. The initial diagnostic is free, including when it concludes there is nothing to recover. A final rejection by the administration costs you nothing either: that risk is part of our business model, not yours.`,
          },
          {
            question: `Why a ${vEn.floor} minimum fee?`,
            answer: `Every successful claim triggers unavoidable fixed costs: certificates, preparation, filing, follow-up, payout. The ${vEn.floor} floor covers them on very small claims — and it is only charged on success. It is also why the simulator advises against filing below ${vEn.smallThreshold} of over-withholding: we would rather tell you to wait than pocket a floor fee on a marginal gain.`,
          },
          {
            question: "Are there hidden fees or paid options?",
            answer: `The success fee covers the entire standard journey. Alongside it, fixed-fee services exist for one-off needs, all public: W-8BEN at ${vEn.w8ben} (${vEn.w8benE} for an entity), certificate of tax residence at ${vEn.resCert}, ITIN at ${vEn.itin} (deducted from the success fee if you upgrade to full recovery), priority handling at ${vEn.priority} for a claim close to its filing deadline. The multi-portfolio monitoring subscription (${vEn.subMonthly} per month or ${vEn.subYearly} per year) is optional. No other fee exists.`,
          },
          {
            question: `Concretely, on ${vEn.exAmount} recovered, how much do you take?`,
            answer: `${vEn.exFee}, an effective rate of ${vEn.exEff}: the first slice (up to ${vEn.t1max}) is charged at ${vEn.t1}, the rest at ${vEn.t2}. You keep ${vEn.exNet}, paid out after the refund is actually received. The slice-by-slice calculation, for any amount, is detailed on the pricing page and in the simulator.`,
          },
        ],
        links: [
          { key: "pricing", label: "The full fee schedule" },
          { key: "howWeGetPaid", label: "How we get paid" },
        ],
      },
      {
        id: "delais",
        title: "Deadlines & limitation periods",
        lede: "Two clocks run in parallel: the statute of limitations, and the processing time.",
        items: [
          {
            question: "How long do I have to claim an overpayment?",
            answer: `From ${SOL_MIN} to ${SOL_MAX} years depending on the source country, with different counting rules (calendar year-end or anniversary date). Canada is the shortest in our panel: ${CA.sol.years} years after the end of the calendar year of withholding — many Canadian overpayments expire before the investor even realises a claim was possible. Austria and Sweden allow ${AT.sol.years} years. Our deadline calculator gives the exact cut-off date for each dividend, free.`,
          },
          {
            question: "How long does a refund take?",
            answer:
              "Honestly: from a few weeks to more than twelve months, depending on the administration. Sweden is known for relatively fast answers; Germany frequently exceeds twelve months of processing. We have no power over an administration's pace: our job is to file a complete claim first time — the number-one driver of processing time — and then to follow up. Your account shows observed ranges, not promises.",
          },
          {
            question: "My deadline is close: can you speed things up?",
            answer: `Yes, for the part that depends on us: priority handling (${vEn.priority} per claim, on top of the success fee) moves your file to the front of our queue — accelerated preparation and filing. As a general rule, what matters legally is the filing date: once the claim is filed in time, processing can continue past the limitation date without extinguishing your right — we check the exact rule of the country concerned before every filing.`,
          },
          {
            question: "Can I recover for past years?",
            answer: `Yes — that is actually the most common case. Any dividend whose limitation period has not expired can be claimed: depending on the country, that covers the last ${SOL_MIN} to ${SOL_MAX} years. Pooling several years into a single filing is often the best strategy: the same supporting documents, one processing round, and a fee computed on the recovered total — so the degressive tranches work harder for you.`,
          },
          {
            question: "What happens if the limitation period expires before I file?",
            answer:
              "The right is extinguished, permanently: no administration reopens an expired limitation period, and no provider — us included — can obtain that for you. It is the only failure in the whole chain with no remedy. That is why we advise checking your deadlines before anything else, with the calculator: free, no account, two minutes.",
          },
        ],
        links: [
          { key: "solCalculator", label: "Calculate my deadlines" },
          { key: "countries", label: "Deadlines country by country" },
        ],
      },
      {
        id: "processus",
        title: "Process & documents",
        lede: "What we ask of you, what we do, and where the money goes.",
        items: [
          {
            question: "Which documents do you need?",
            answer:
              "Three families, common to nearly every country: your brokerage statements (the payments and the tax actually withheld), one certificate of tax residence per year claimed, and a mandate authorising us to act before the administration. Some countries add their own items: original tax vouchers and custody confirmations (Depotbestätigung) in Germany, a treaty form stamped by your tax office for Japan. Your account lists what is missing, item by item, for each claim.",
          },
          {
            question: "What is the certificate of tax residence, and how do I get one?",
            answer: `It is the document by which your administration attests you were a tax resident there in the year of the dividend — the cornerstone of every claim, and the top rejection cause when it is missing or covers the wrong year. We prepare the pre-filled request for your tax office, on the right country's form (some, like Germany, impose their own template). The service also exists on its own, as a ${vEn.resCert} fixed fee.`,
          },
          {
            question: "Do you need access to my brokerage account?",
            answer:
              "No, never. You upload your statements (PDF or export) to your account; we ask for no credentials, no read access at your broker, no power over your securities. The mandate you sign covers the tax refund procedures only — not your assets.",
          },
          {
            question: "How is the mandate signed?",
            answer:
              "Electronically, in your client area, in a few minutes: you check the scope (countries, years, exact reach of the mandate), sign online, and the time-stamped copy stays available in your documents. When an administration additionally requires a signed paper original — it still happens — we generate the ready-to-sign document and tell you exactly what to do with it.",
          },
          {
            question: "Where does the refunded money arrive?",
            answer:
              "In the bank account designated in the refund claim — yours. The exact circuit varies by administration and is set out in black and white at filing time, visible in your claim. Our fee is invoiced only at that point: once the refund is actually received, never before.",
          },
          {
            question: "What happens if the administration rejects the claim?",
            answer:
              "First, understand the ground: most rejections are documentary — unsuitable certificate, insufficiently proven chain of custody, outdated form — and can be fixed. We then refile as long as the limitation period is open, at no extra cost. If the rejection is final, you pay nothing: no recovery, no fee. We also publish the seven most frequent rejection grounds in our resources, with our counter-measure for each.",
          },
        ],
        links: [
          { key: "howItWorks", label: "The process in detail" },
          { key: "resources", label: "Our resources on rejections and traps" },
        ],
      },
      {
        id: "securite",
        title: "Security & data",
        lede: "The short answers; the security page details every measure.",
        items: [
          {
            question: "How are my documents protected?",
            answer:
              "Encryption in transit (TLS) for every exchange, encryption at rest for stored documents, hosting in the European Union, and internal access partitioned on the least-privilege principle: only the people working on your claim can access it, and those accesses are logged. The security page details every measure — including what we do not display, such as certifications we have not yet obtained.",
          },
          {
            question: "Why do you verify my identity?",
            answer:
              "Because we file claims in your name with tax administrations, and refunds are at stake. Identity verification and sanctions/PEP screening, run by a specialised provider, protect against two real risks: identity theft (someone claiming your refund in your place) and fraudulent use of the service. It happens once, when your file opens.",
          },
          {
            question: "How long do you keep my data?",
            answer:
              "For the life of the claim, then for the duration of legal obligations: tax and accounting records must be kept for several years after closure (up to 10 years for some accounting documents), and identity evidence follows the retention periods imposed by anti-money-laundering regulation. Beyond those periods: deletion or anonymisation. The full breakdown, category by category, is in our privacy policy.",
          },
          {
            question: "What are my rights over my data (GDPR)?",
            answer:
              "Access, rectification, erasure, restriction, portability, objection: all the classic GDPR rights, exercisable from your account or in writing. One honest limit: we cannot erase what the law requires us to keep — claims filed with administrations, accounting records — before the legal retention periods expire. The privacy policy explains how to exercise each right, and with whom.",
          },
        ],
        links: [
          { key: "security", label: "The full security page" },
          { key: "privacy", label: "Privacy policy" },
        ],
      },
      {
        id: "espace-client",
        title: "Client area & demo",
        lede: "See the product before entrusting us with anything.",
        items: [
          {
            question: "Can I see the client area before opening a claim?",
            answer:
              "Yes, all of it: a public demo account shows the complete client area — live claims, progress gauges, documents, messages, billing — with entirely fictitious data. No sign-up, no email required. It is the fastest way to judge whether our way of working suits you, before sending a single statement.",
          },
          {
            question: "What do I see while my claim is being processed?",
            answer: `Each claim is an entry in your ledger: the amount at stake, the current step (preparation, filing, processing, decision, payout), the documents exchanged, and an observed time range for the administration involved. Every automated decision in our pipeline — statement parsing, calculation, pre-validation — is logged and reviewable; above ${vEn.humanReview} of estimated recovery, a human review is systematic before filing.`,
          },
          {
            question: "How do I open a real account?",
            answer:
              "Real account creation opens at commercial launch [ACCOUNT OPENING DATE TO BE ANNOUNCED]. Until then, three things are already possible: put a number on your over-withholding with the simulator (no account), explore the demo to see the exact product, and ask us a question about your situation through the contact form — answered within 2 business days.",
          },
        ],
        links: [
          { key: "portal", label: "Explore the demo" },
          { key: "portalOnboarding", label: "See the onboarding journey" },
        ],
      },
    ],
    finalCta: {
      title: "A question that is not on the list?",
      lede: "Ask it: the answer will feed this page. And if your question is “how much?”, the simulator answers in two minutes, no email.",
      contactLink: "Ask my question",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const questionCount = t.groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      {/* -------------------------------------------------------------- */}
      {/* HERO + TABLE OF CONTENTS                                        */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.kicker}
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl">
            {t.h1}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-mine">
            {t.lede(questionCount)}
          </p>
          <nav aria-label={t.tocLabel} className="mt-7">
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.tocLabel}
            </p>
            <ul className="flex flex-wrap gap-2">
              {t.groups.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-rule bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink"
                  >
                    {group.title}
                    <span className="font-mono text-xs text-mine">{group.items.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* GROUPS                                                          */}
      {/* -------------------------------------------------------------- */}
      {t.groups.map((group, i) => (
        <section
          key={group.id}
          id={group.id}
          className={i % 2 === 0 ? "border-y border-rule bg-white" : ""}
        >
          <Container className="py-12 sm:py-14">
            <SectionHeading
              kicker={String(i + 1).padStart(2, "0")}
              title={group.title}
              lede={group.lede}
            />
            <FAQAccordion items={group.items} className="mt-6" />
            <div className="mt-4 flex flex-wrap gap-3">
              {group.links.map((link) => (
                <ButtonLink key={link.key} variant="ghost" href={href(locale, link.key)}>
                  {link.label} →
                </ButtonLink>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* -------------------------------------------------------------- */}
      {/* FINAL CTA + INDICATIVE-FIGURES NOTE                             */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <TrustLine text={common.trustLine} />
            <ButtonLink variant="ghost" href={href(locale, "contact")}>
              {t.finalCta.contactLink}
            </ButtonLink>
          </div>
          <p className="mx-auto mt-8 max-w-[75ch] text-[13px] leading-relaxed text-mine">
            {common.footer.ratesNote}
          </p>
        </Container>
      </section>
    </>
  );
}
