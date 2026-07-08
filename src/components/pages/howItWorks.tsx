import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { PRICING } from "@/config/pricing";
import {
  DATA_VERSION,
  getCountryById,
  recoveryGap,
  solDeadline,
  treatyRateFor,
} from "@/data/countries";
import { CLAIM_STAGES, type ClaimStage } from "@/data/demo-portal";
import { TimelineVertical } from "@/components/ui/ClaimTimeline";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  StatTile,
  TrustLine,
} from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Data-derived figures — nothing below is hardcoded copy.             */
/* ------------------------------------------------------------------ */

const ch = getCountryById("CH")!;
const ca = getCountryById("CA")!;
const at = getCountryById("AT")!;

const threshold = PRICING.humanReviewThreshold;
const priorityFee = PRICING.fixedServices.priorityHandling;

/** Illustrative audit-log example: a Swiss dividend line, fully computed from the data layer. */
const exampleGross = 1_200;
const chGap = recoveryGap(ch, "FR");
const chTreaty = treatyRateFor(ch, "FR");
const exampleRecover = exampleGross * chGap;
const chDeadlineIso = solDeadline(ch, "2024-06-15").toISOString().slice(0, 10);

interface Copy {
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    h1: string;
    lede: string;
    stats: { value: string; label: string }[];
  };
  pipeline: {
    kicker: string;
    title: string;
    lede: string;
    descriptions: Record<ClaimStage, string>;
    caption: string;
  };
  human: {
    kicker: string;
    title: string;
    lede: string;
    cases: { title: string; text: string }[];
    whyTitle: string;
    whyText: string;
  };
  problems: {
    kicker: string;
    title: string;
    lede: string;
    weDo: string;
    cases: { title: string; what: string; response: string }[];
  };
  duration: {
    kicker: string;
    title: string;
    lede: string;
    caption: string;
    colCountry: string;
    colRange: string;
    colNote: string;
    rows: { id: string; range: string; note: string }[];
    disclaimer: string;
    solCta: string;
  };
  audit: {
    kicker: string;
    title: string;
    lede: string;
    bullets: string[];
    exampleTag: string;
    log: string[];
  };
  final: { title: string; lede: string };
}

const copy: Localized<Copy> = {
  fr: {
    metaTitle: "Comment ça marche : les 8 étapes entre votre relevé et votre virement",
    metaDescription:
      "Le pipeline complet de récupération de retenue à la source : ce que fait l'automatisation, où l'humain intervient, ce qui peut mal se passer et les délais réels, pays par pays.",
    hero: {
      kicker: "Comment ça marche",
      h1: "Ce qui se passe vraiment entre votre relevé et votre virement",
      lede: "Pas de pipeline mystère, pas de « nos experts s'occupent de tout » : voici les huit étapes exactes que suit chaque dossier, ce que fait l'automatisation, où un humain tranche — et ce qui peut mal se passer en route.",
      stats: [
        {
          value: String(CLAIM_STAGES.length),
          label: "étapes, toutes visibles dans votre espace client",
        },
        {
          value: formatCurrency(0, "fr"),
          label: "à avancer — la commission n'existe qu'au succès",
        },
        {
          value: formatCurrency(threshold, "fr"),
          label: "le seuil au-delà duquel un humain valide toujours avant dépôt",
        },
      ],
    },
    pipeline: {
      kicker: "Le pipeline",
      title: "Les 8 étapes, sans découpage marketing",
      lede: "Huit étapes numérotées, parce qu'elles se suivent vraiment. C'est la même chronologie que celle affichée sur chaque dossier de votre espace client : le site et le produit racontent la même histoire.",
      descriptions: {
        eligibility:
          "Vous importez vos relevés de courtage (PDF ou CSV). L'automatisation reconnaît chaque ligne de dividende, applique le taux de la convention applicable et calcule le trop-perçu, pays par pays. Dans votre espace : le diagnostic ligne à ligne — y compris les lignes où il n'y a rien à récupérer, marquées comme telles. Durée typique : quelques minutes.",
        documents:
          "Le système dresse la liste exacte des pièces exigées par chaque administration (certificat de résidence fiscale, tax vouchers, attestations de détention…) et pré-remplit tout ce qui peut l'être. Dans votre espace : une checklist par dossier, mise à jour à chaque pièce reçue. Durée typique : 1 à 3 semaines — le certificat visé par votre centre des impôts est presque toujours l'étape la plus lente.",
        mandate:
          "Vous signez électroniquement le mandat qui nous autorise à agir en votre nom auprès de l'administration étrangère — rien de plus. Dans votre espace : le mandat consultable à tout moment, avec son périmètre exact. Durée typique : deux minutes.",
        filed: `Le pipeline génère les formulaires officiels de chaque pays (Formulaire 83, ZS-RD1, NR7-R…), dépose en ligne quand l'administration l'accepte, imprime et expédie en recommandé suivi sinon. Au-delà de ${formatCurrency(threshold, "fr")}, un humain valide toujours avant l'envoi. Dans votre espace : la référence de dépôt et la copie intégrale de ce qui est parti. Durée typique : quelques jours ouvrés une fois le dossier complet.`,
        processing:
          "L'administration instruit. Notre système compare l'ancienneté de votre dossier aux délais habituels du pays et déclenche des relances documentées dès qu'il sort de la norme. Dans votre espace : la date de dépôt, l'âge du dossier et la prochaine relance planifiée. Durée typique : de quelques mois à plus d'un an selon le pays — le détail honnête est un peu plus bas sur cette page.",
        response:
          "Accord, requête complémentaire ou rejet : chaque courrier est analysé, expliqué en clair et versé au dossier. Une requête complémentaire reçoit une réponse préparée dans le délai imparti — parfois court. Dans votre espace : la notification, le courrier original et notre réponse. Durée typique : variable — c'est l'étape que nous surveillons le plus.",
        refundReceived:
          "Le remboursement est encaissé puis rapproché, au centime, du montant réclamé ; tout écart est signalé et expliqué avant d'aller plus loin. Dans votre espace : la ligne passe du hachuré or (potentiel) au vert plein (réalisé). Durée typique : le virement de l'administration suit sa décision de quelques semaines.",
        paidOut:
          "Nous déduisons la commission de la grille publique — calculée à ce moment-là, jamais avant — et virons le net sur votre compte, avec la facture détaillée. Dans votre espace : l'écriture soldée, le justificatif de virement et l'historique complet. Durée typique : quelques jours ouvrés après réception des fonds.",
      },
      caption:
        "Ce que vous voyez ci-dessus est le composant de suivi réel de l'espace client, pas une illustration marketing.",
    },
    human: {
      kicker: "Là où l'automatisation s'arrête",
      title: "Où l'humain intervient (et pourquoi on ne l'automatisera jamais)",
      lede: "L'automatisation fait la répétition ; elle ne porte pas la responsabilité. Cinq situations sortent systématiquement du pipeline automatique :",
      cases: [
        {
          title: `Validation finale au-delà de ${formatCurrency(threshold, "fr")}`,
          text: "Tout dossier dont l'estimation dépasse ce seuil est relu et validé par une personne avant dépôt. Le seuil est configurable à la baisse, jamais supprimable : c'est un garde-fou de conformité, pas un réglage marketing.",
        },
        {
          title: "Alertes sanctions et PEP",
          text: "Si le filtrage automatique signale une correspondance possible avec une liste de sanctions ou une personne politiquement exposée, aucune machine ne « déclasse » l'alerte : un analyste tranche, et sa décision est motivée au dossier.",
        },
        {
          title: "Rejets et contestations",
          text: "Une lettre de rejet n'a jamais reçu de réponse type chez nous. Un gestionnaire lit le motif de l'administration, décide de corriger, redéposer ou contester, et rédige l'argumentaire.",
        },
        {
          title: "Divergences documents / déclaration",
          text: "Quand ce que dit un relevé ne correspond pas à ce qui a été déclaré (montant, date, titulaire), le dossier sort du pipeline automatique jusqu'à ce qu'un humain ait compris pourquoi.",
        },
        {
          title: "KYC ambigus",
          text: "Pièce d'identité douteuse, structure de détention inhabituelle, ayant droit économique difficile à établir : le doute profite toujours à la vérification humaine, jamais à la vitesse.",
        },
      ],
      whyTitle: "Pourquoi on ne l'automatisera jamais",
      whyText:
        "Parce qu'une demande de remboursement engage votre nom devant une administration fiscale étrangère. L'automatisation prépare, calcule, trace et accélère ; elle ne signe pas. La responsabilité d'un dépôt reste portée par des personnes identifiables — et chaque intervention humaine est elle-même consignée dans le journal d'audit.",
    },
    problems: {
      kicker: "Transparence",
      title: "Ce qui peut mal se passer",
      lede: "La plupart des sites de récupération s'arrêtent à « déposez, encaissez ». Voici la partie qu'on ne vous montre jamais — et ce que nous faisons, précisément, quand elle arrive.",
      weDo: "Ce que FiscalPlace fait",
      cases: [
        {
          title: "La requête complémentaire",
          what: "L'administration demande une pièce ou une précision supplémentaire — avec un délai de réponse parfois limité à 10 ou 15 jours.",
          response:
            "La demande est détectée dès réception, la réponse préparée immédiatement et déposée dans le délai. Si une pièce doit venir de vous, la checklist de votre espace vous le dit précisément — et vous êtes relancé avant l'échéance, pas après.",
        },
        {
          title: "Le rejet",
          what: "Pièce jugée insuffisante, chaîne de détention incomplète, défaut de forme : le rejet existe, chez nous comme partout.",
          response:
            "Nous analysons le motif, corrigeons et redéposons quand le dossier reste défendable, contestons quand le rejet nous paraît infondé. S'il est définitif, vous ne payez rien : c'est le principe de la commission au succès.",
        },
        {
          title: "La prescription",
          what: `Passé le délai légal du pays, le trop-perçu est définitivement perdu — ${ca.sol.years} ans seulement au Canada, ${ch.sol.years} en Suisse, jusqu'à ${at.sol.years} en Autriche.`,
          response: `Chaque ligne est datée dès l'import et confrontée au délai de son pays. Ce qui est prescrit est marqué perdu — nous ne déposons pas de dossiers morts — et ce qui approche de l'échéance est priorisé, avec un traitement prioritaire possible (${formatCurrency(priorityFee, "fr")} par dossier, grille publique).`,
        },
        {
          title: "L'administration silencieuse",
          what: "Des mois sans la moindre nouvelle : le scénario le plus frustrant, et aucun prestataire honnête ne peut promettre de l'éviter.",
          response:
            "Relances écrites à intervalles réguliers, toutes archivées dans votre journal ; escalade par les canaux propres à chaque administration ; et un état honnête dans votre espace — « en instruction, relancé le 12 mars » plutôt qu'un faux « tout va bien ».",
        },
      ],
    },
    duration: {
      kicker: "Les délais réels",
      title: "Combien de temps ça prend (vraiment)",
      lede: "Deux dossiers identiques déposés dans deux pays différents ne vivront pas la même vie. Voici les fourchettes d'instruction constatées après dépôt — pas la version optimiste. Ajoutez en amont la collecte des documents, typiquement 1 à 3 semaines de votre côté.",
      caption: "Fourchettes de délais d'instruction constatés, pays par pays",
      colCountry: "Pays",
      colRange: "Instruction constatée",
      colNote: "Particularités",
      rows: [
        {
          id: "SE",
          range: "3 à 6 mois",
          note: "Le Skatteverket a la réputation de répondre plus vite que le reste de notre panel.",
        },
        {
          id: "CH",
          range: "4 à 8 mois",
          note: "Dépôt électronique obligatoire depuis 2025 ; regroupement en une demande annuelle recommandé (trois demandes par an maximum).",
        },
        {
          id: "AT",
          range: "6 à 12 mois",
          note: "Pré-déclaration en ligne puis envoi papier signé : le pipeline génère les deux.",
        },
        {
          id: "CA",
          range: "6 à 12 mois",
          note: `Procédure encore papier : la qualité du dossier initial fait le délai. Et attention à la prescription courte — ${ca.sol.years} ans seulement.`,
        },
        {
          id: "JP",
          range: "9 à 18 mois",
          note: "Le passage obligé par l'agent payeur japonais ajoute de la friction : plus lent que la moyenne.",
        },
        {
          id: "DE",
          range: "12 à 18 mois, parfois plus",
          note: "Le BZSt dépasse fréquemment 12 mois d'instruction et exige une chaîne documentaire irréprochable.",
        },
      ],
      disclaimer:
        "Fourchettes indicatives, constatées en pratique et revues régulièrement — jamais contractuelles. Votre estimation par pays vous est donnée avant dépôt, et le journal de votre dossier montre où il en est réellement. Le délai d'instruction ne doit pas être confondu avec le délai de prescription, qui court contre vous dès aujourd'hui.",
      solCta: "Vérifier mes délais de prescription",
    },
    audit: {
      kicker: "Journal d'audit",
      title: "Chaque décision automatisée laisse une trace",
      lede: "Un dossier fiscal ne supporte pas le « faites-nous confiance ». Chaque décision prise par l'automatisation est consignée, horodatée et consultable depuis votre espace — la même trace que celle que nous produirions pour un auditeur.",
      bullets: [
        "Chaque taux appliqué, avec sa référence de convention",
        "Chaque calcul de trop-perçu, ligne par ligne",
        "Chaque formulaire généré et chaque dépôt, horodatés",
        "Chaque relance envoyée et chaque réponse reçue",
        "Chaque intervention humaine, avec son motif",
      ],
      exampleTag: "Exemple illustratif",
      log: [
        `09:41:07 · Ligne détectée : dividende suisse — brut ${formatCurrency(exampleGross, "fr")}`,
        `09:41:07 · Taux vérifiés : ${formatPercent(ch.statutoryRate, "fr")} retenus vs ${formatPercent(chTreaty, "fr")} dus — CDI FR-CH`,
        `09:41:08 · Trop-perçu calculé : ${formatCurrency(exampleRecover, "fr")} (${formatPercent(chGap, "fr")} de ${formatCurrency(exampleGross, "fr")})`,
        `09:41:08 · Prescription contrôlée : échéance ${formatDate(chDeadlineIso, "fr")} — dans les délais`,
        `09:41:12 · Formulaire officiel généré — référentiel pays ${DATA_VERSION}`,
      ],
    },
    final: {
      title: "Commencez par le chiffre, pas par le dossier",
      lede: "Le simulateur vous dit en deux minutes ce qu'il y a — ou pas — à récupérer, gratuitement. Si la réponse est « rien », vous le saurez aussi : nous n'ouvrons pas de dossier qui ne vaut pas d'être ouvert.",
    },
  },
  en: {
    metaTitle: "How it works: the 8 stages between your statement and your payout",
    metaDescription:
      "The full withholding-tax recovery pipeline: what the automation does, where humans step in, what can go wrong, and real country-by-country timelines.",
    hero: {
      kicker: "How it works",
      h1: "What actually happens between your statement and your payout",
      lede: "No mystery pipeline, no “our experts handle everything”: here are the exact eight stages every claim goes through, what the automation does, where a human decides — and what can go wrong along the way.",
      stats: [
        {
          value: String(CLAIM_STAGES.length),
          label: "stages, all visible in your client area",
        },
        {
          value: formatCurrency(0, "en"),
          label: "upfront — the fee only exists on success",
        },
        {
          value: formatCurrency(threshold, "en"),
          label: "the threshold above which a human always signs off before filing",
        },
      ],
    },
    pipeline: {
      kicker: "The pipeline",
      title: "The 8 stages, without the marketing cut",
      lede: "Eight numbered stages, because they genuinely happen in order. It is the same chronology shown on every claim in your client area: the website and the product tell the same story.",
      descriptions: {
        eligibility:
          "You import your brokerage statements (PDF or CSV). The automation recognises every dividend line, applies the applicable treaty rate and computes the over-withholding, country by country. In your client area: the line-by-line diagnostic — including the lines with nothing to recover, flagged as such. Typical duration: a few minutes.",
        documents:
          "The system draws up the exact list of documents each administration requires (certificate of tax residence, tax vouchers, custody confirmations…) and pre-fills everything that can be pre-filled. In your client area: a per-claim checklist, updated as each document comes in. Typical duration: 1 to 3 weeks — the certificate stamped by your local tax office is almost always the slowest step.",
        mandate:
          "You e-sign the mandate authorising us to act on your behalf before the foreign administration — nothing more. In your client area: the mandate, viewable at any time, with its exact scope. Typical duration: two minutes.",
        filed: `The pipeline generates each country's official forms (Form 83, ZS-RD1, NR7-R…), files online where the administration accepts it, prints and ships by tracked mail where it doesn't. Above ${formatCurrency(threshold, "en")}, a human always signs off before anything leaves. In your client area: the filing reference and a full copy of what was sent. Typical duration: a few working days once the file is complete.`,
        processing:
          "The administration reviews. Our system compares your claim's age against the country's usual timelines and triggers documented follow-ups as soon as it drifts past the norm. In your client area: the filing date, the claim's age and the next scheduled follow-up. Typical duration: from a few months to over a year depending on the country — the honest detail is further down this page.",
        response:
          "Approval, request for further information, or rejection: every letter is analysed, explained in plain language and added to your file. A follow-up request gets a prepared answer within the deadline — sometimes a short one. In your client area: the notification, the original letter and our answer. Typical duration: variable — this is the stage we watch most closely.",
        refundReceived:
          "The refund is received, then reconciled to the cent against the amount claimed; any gap is flagged and explained before we go further. In your client area: the line turns from gold hatching (potential) to solid green (realised). Typical duration: the administration's transfer follows its decision by a few weeks.",
        paidOut:
          "We deduct the fee from the public grid — computed at that moment, never earlier — and wire the net amount to your account, with an itemised invoice. In your client area: the settled entry, the payment evidence and the full history. Typical duration: a few working days after the funds arrive.",
      },
      caption:
        "What you see above is the actual tracking component from the client area, not a marketing illustration.",
    },
    human: {
      kicker: "Where automation stops",
      title: "Where humans step in (and why we will never automate it away)",
      lede: "Automation handles the repetition; it does not carry the responsibility. Five situations always leave the automated pipeline:",
      cases: [
        {
          title: `Final sign-off above ${formatCurrency(threshold, "en")}`,
          text: "Every claim whose estimate exceeds this threshold is reviewed and approved by a person before filing. The threshold can be lowered, never removed: it is a compliance guardrail, not a marketing dial.",
        },
        {
          title: "Sanctions and PEP alerts",
          text: "If automated screening flags a possible match with a sanctions list or a politically exposed person, no machine ever clears the alert: an analyst decides, and the decision is documented in the file.",
        },
        {
          title: "Rejections and appeals",
          text: "A rejection letter has never received a template answer from us. A case manager reads the administration's reasoning, decides whether to fix, refile or contest, and writes the argument.",
        },
        {
          title: "Document / declaration mismatches",
          text: "When what a statement says doesn't match what was declared (amount, date, holder), the claim leaves the automated pipeline until a human has understood why.",
        },
        {
          title: "Ambiguous KYC",
          text: "A doubtful identity document, an unusual holding structure, a beneficial owner that is hard to establish: doubt always favours human verification, never speed.",
        },
      ],
      whyTitle: "Why we will never automate it away",
      whyText:
        "Because a refund claim commits your name before a foreign tax administration. Automation prepares, computes, logs and accelerates; it does not sign. Responsibility for a filing rests with identifiable people — and every human intervention is itself recorded in the audit log.",
    },
    problems: {
      kicker: "Transparency",
      title: "What can go wrong",
      lede: "Most recovery websites stop at 'file, get paid'. Here is the part you are never shown — and what we do, precisely, when it happens.",
      weDo: "What FiscalPlace does",
      cases: [
        {
          title: "The request for further information",
          what: "The administration asks for an extra document or clarification — sometimes with a response window of only 10 to 15 days.",
          response:
            "The request is detected on receipt, the answer prepared immediately and filed within the deadline. If a document has to come from you, the checklist in your client area says exactly which one — and you are chased before the deadline, not after.",
        },
        {
          title: "The rejection",
          what: "A document deemed insufficient, an incomplete chain of custody, a formal defect: rejections happen — to us as to everyone.",
          response:
            "We analyse the reasoning, fix and refile when the claim remains defensible, and contest when the rejection looks unfounded. If it is final, you pay nothing: that is what success-only fees mean.",
        },
        {
          title: "The statute of limitations",
          what: `Once a country's legal deadline passes, the over-withholding is lost for good — just ${ca.sol.years} years in Canada, ${ch.sol.years} in Switzerland, up to ${at.sol.years} in Austria.`,
          response: `Every line is dated at import and checked against its country's deadline. Whatever is time-barred is marked as lost — we don't file dead claims — and whatever is close to expiry is prioritised, with optional priority handling (${formatCurrency(priorityFee, "en")} per claim, public grid).`,
        },
        {
          title: "The silent administration",
          what: "Months without a word: the most frustrating scenario, and no honest provider can promise to avoid it.",
          response:
            "Written follow-ups at regular intervals, all archived in your log; escalation through each administration's own channels; and an honest status in your client area — 'under review, chased on 12 March' rather than a fake 'all good'.",
        },
      ],
    },
    duration: {
      kicker: "Real timelines",
      title: "How long it (really) takes",
      lede: "Two identical claims filed in two different countries will not live the same life. Here are the processing ranges we observe after filing — not the optimistic version. Add document collection upfront, typically 1 to 3 weeks on your side.",
      caption: "Observed processing-time ranges, country by country",
      colCountry: "Country",
      colRange: "Observed processing",
      colNote: "Specifics",
      rows: [
        {
          id: "SE",
          range: "3 to 6 months",
          note: "Skatteverket has a reputation for answering faster than the rest of our panel.",
        },
        {
          id: "CH",
          range: "4 to 8 months",
          note: "Electronic filing has been mandatory since 2025; bundling into one annual claim is recommended (three claims per year maximum).",
        },
        {
          id: "AT",
          range: "6 to 12 months",
          note: "Online pre-filing plus a signed paper submission: the pipeline generates both.",
        },
        {
          id: "CA",
          range: "6 to 12 months",
          note: `Still a paper procedure: initial file quality drives the timeline. And mind the short statute of limitations — only ${ca.sol.years} years.`,
        },
        {
          id: "JP",
          range: "9 to 18 months",
          note: "The mandatory route through the Japanese paying agent adds friction: slower than average.",
        },
        {
          id: "DE",
          range: "12 to 18 months, sometimes more",
          note: "The BZSt frequently takes over 12 months and demands a flawless documentation chain.",
        },
      ],
      disclaimer:
        "Indicative ranges, observed in practice and reviewed regularly — never contractual. Your per-country estimate is given before filing, and your claim's log shows where it really stands. Processing time must not be confused with the statute of limitations, which runs against you starting today.",
      solCta: "Check my filing deadlines",
    },
    audit: {
      kicker: "Audit log",
      title: "Every automated decision leaves a trace",
      lede: "A tax file cannot run on 'trust us'. Every decision the automation takes is recorded, timestamped and viewable from your client area — the same trail we would produce for an auditor.",
      bullets: [
        "Every rate applied, with its treaty reference",
        "Every over-withholding computation, line by line",
        "Every form generated and every filing, timestamped",
        "Every follow-up sent and every answer received",
        "Every human intervention, with its reason",
      ],
      exampleTag: "Illustrative example",
      log: [
        `09:41:07 · Line detected: Swiss dividend — gross ${formatCurrency(exampleGross, "en")}`,
        `09:41:07 · Rates checked: ${formatPercent(ch.statutoryRate, "en")} withheld vs ${formatPercent(chTreaty, "en")} owed — FR-CH TREATY`,
        `09:41:08 · Over-withholding computed: ${formatCurrency(exampleRecover, "en")} (${formatPercent(chGap, "en")} of ${formatCurrency(exampleGross, "en")})`,
        `09:41:08 · Statute of limitations checked: deadline ${formatDate(chDeadlineIso, "en")} — within time`,
        `09:41:12 · Official form generated — country dataset ${DATA_VERSION}`,
      ],
    },
    final: {
      title: "Start with the number, not the paperwork",
      lede: "The simulator tells you in two minutes what there is — or isn't — to recover, for free. If the answer is 'nothing', you'll know that too: we don't open claims that aren't worth opening.",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  return (
    <div className="pb-20">
      {/* ------------------------------------------------ Hero */}
      <section className="border-b border-rule bg-white">
        <Container className="py-14 sm:py-20">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[26ch] font-display text-4xl font-semibold text-ink text-balance sm:text-5xl">
            {t.hero.h1}
          </h1>
          <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-mine">{t.hero.lede}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <ButtonLink variant="secondary" href={href(locale, "pricing")}>
              {common.cta.seePricing}
            </ButtonLink>
          </div>
          <TrustLine text={common.trustLine} className="mt-3" />
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {t.hero.stats.map((s) => (
              <StatTile key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ Pipeline */}
      <Container>
        <section className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <SectionHeading
              kicker={t.pipeline.kicker}
              title={t.pipeline.title}
              lede={t.pipeline.lede}
            />
          </div>
          <div>
            <Card className="p-6 sm:p-8">
              <TimelineVertical
                currentStage="paidOut"
                locale={locale}
                descriptions={t.pipeline.descriptions}
              />
            </Card>
            <p className="mt-3 font-mono text-[13px] text-mine">{t.pipeline.caption}</p>
          </div>
        </section>

        {/* ------------------------------------------------ Human interventions */}
        <section className="border-t border-rule py-14 sm:py-20">
          <SectionHeading kicker={t.human.kicker} title={t.human.title} lede={t.human.lede} />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.human.cases.map((c) => (
              <Card as="li" key={c.title} className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mine">{c.text}</p>
              </Card>
            ))}
            <Card as="li" className="bg-tint-green p-5">
              <h3 className="font-display text-lg font-semibold text-ink">{t.human.whyTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mine">{t.human.whyText}</p>
            </Card>
          </ul>
        </section>

        {/* ------------------------------------------------ What can go wrong */}
        <section className="border-t border-rule py-14 sm:py-20">
          <SectionHeading
            kicker={t.problems.kicker}
            title={t.problems.title}
            lede={t.problems.lede}
          />
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {t.problems.cases.map((c) => (
              <Card as="li" key={c.title} className="flex flex-col p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mine">{c.what}</p>
                <div className="mt-4 border-t border-rule pt-4">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-brand">
                    {t.problems.weDo}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">{c.response}</p>
                </div>
              </Card>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------ Honest timelines */}
        <section className="border-t border-rule py-14 sm:py-20">
          <SectionHeading
            kicker={t.duration.kicker}
            title={t.duration.title}
            lede={t.duration.lede}
          />
          <Card className="mt-10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">{t.duration.caption}</caption>
                <thead>
                  <tr className="border-b border-rule">
                    <th
                      scope="col"
                      className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-mine"
                    >
                      {t.duration.colCountry}
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-mine"
                    >
                      {t.duration.colRange}
                    </th>
                    <th scope="col" className="px-5 py-3">
                      <span className="sr-only">{t.duration.colNote}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.duration.rows.map((row) => {
                    const country = getCountryById(row.id);
                    if (!country) return null;
                    return (
                      <tr key={row.id} className="border-b border-rule align-top last:border-b-0">
                        <th scope="row" className="px-5 py-4 text-[15px] font-medium text-ink">
                          <span aria-hidden="true" className="mr-2">
                            {country.flag}
                          </span>
                          {country.name[locale]}
                        </th>
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-gold-ink">
                          {row.range}
                        </td>
                        <td className="px-5 py-4 text-sm leading-relaxed text-mine">{row.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="mt-4 max-w-[80ch] text-[13px] leading-relaxed text-mine">
            {t.duration.disclaimer}
          </p>
          <div className="mt-5">
            <ButtonLink variant="secondary" href={href(locale, "solCalculator")}>
              {t.duration.solCta}
            </ButtonLink>
          </div>
        </section>

        {/* ------------------------------------------------ Audit log */}
        <section className="grid gap-10 border-t border-rule py-14 sm:py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
          <div>
            <SectionHeading kicker={t.audit.kicker} title={t.audit.title} lede={t.audit.lede} />
            <ul className="mt-6 space-y-2">
              {t.audit.bullets.map((b) => (
                <li key={b} className="flex items-baseline gap-2 text-[15px] text-mine">
                  <span aria-hidden="true" className="font-mono text-brand">
                    ·
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <Card className="self-start p-5 sm:p-6">
            <Badge tone="gold">{t.audit.exampleTag}</Badge>
            <ol className="mt-4 space-y-2.5">
              {t.audit.log.map((line) => (
                <li
                  key={line}
                  className="border-l-2 border-rule pl-3 font-mono text-[12px] leading-relaxed text-mine"
                >
                  {line}
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* ------------------------------------------------ Final CTA */}
        <section className="border-t border-rule py-14 text-center sm:py-20">
          <SectionHeading center title={t.final.title} lede={t.final.lede} />
          <div className="mt-8 flex justify-center">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
          </div>
          <TrustLine text={common.trustLine} className="mt-3" />
        </section>
      </Container>
    </div>
  );
}
