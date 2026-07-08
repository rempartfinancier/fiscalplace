import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { PRICING } from "@/config/pricing";
import { COUNTRIES, getCountryById, recoveryGap } from "@/data/countries";
import { simulate } from "@/lib/simulator";
import { getCommon } from "@/content/common";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  StatTile,
  TrustLine,
} from "@/components/ui/primitives";
import { DoubleRule, LedgerEntry, LedgerLine } from "@/components/ui/ledger";
import { TimelineCompact } from "@/components/ui/ClaimTimeline";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

/**
 * /services/recuperation-withholding-tax — the flagship product page.
 * End-to-end withholding-tax recovery, success-fee only. Sells the money
 * that comes back, states plainly what is NOT promised.
 */

const EXAMPLE_GROSS = 20_000;

interface Copy {
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    h1: string;
    lede: (maxGap: string) => string;
    statFailLabel: string;
    statCountriesLabel: string;
    statCapLabel: string;
  };
  personas: {
    kicker: string;
    title: string;
    lede: string;
    individual: { title: string; desc: string; signal: string };
    familyOffice: { title: string; desc: (threshold: string) => string; signal: string };
    cgp: { title: string; desc: (revShare: string) => string; signal: string; linkLabel: string };
    holding: { title: string; desc: string; signal: string };
  };
  scope: {
    kicker: string;
    title: string;
    lede: string;
    items: { title: string; desc: string }[];
  };
  example: {
    kicker: string;
    title: (gross: string) => string;
    lede: (statutory: string, treaty: string) => string;
    withheldLabel: (rate: string) => string;
    owedLabel: (rate: string) => string;
    treatyRef: (rate: string) => string;
    feeTitle: string;
    recoveredLabel: string;
    feeLabel: string;
    feeSub: (effectiveRate: string) => string;
    netLabel: string;
    feeFootnote: string;
  };
  price: {
    kicker: string;
    title: string;
    lede: string;
    tierUpTo: (max: string) => string;
    tierBetween: (min: string, max: string) => string;
    tierAbove: (min: string) => string;
    floorNote: (floor: string) => string;
    capNote: (cap: string) => string;
    institutionalNote: (threshold: string) => string;
  };
  delays: {
    kicker: string;
    title: string;
    lede: string;
    filing: { title: string; desc: string };
    processing: { title: string; desc: string };
    sol: {
      title: (min: number, max: number) => string;
      desc: (caYears: number) => string;
      linkLabel: string;
    };
  };
  notPromised: {
    kicker: string;
    title: string;
    lede: string;
    guarantee: { title: string; desc: string };
    prescription: { title: string; desc: (caYears: number) => string };
    franking: { title: string; desc: string };
    uk: { title: string; desc: string };
  };
  process: { kicker: string; title: string; lede: string; linkLabel: string };
  faq: {
    kicker: string;
    title: string;
    fail: { q: string; a: (floor: string) => string };
    advance: { q: string; a: string };
    countries: { q: string; a: (count: number) => string };
    reject: { q: string; a: string };
    multi: { q: string; a: string };
    advice: { q: string; a: string };
  };
  finalCta: { title: string; desc: string };
}

const copy: Localized<Copy> = {
  fr: {
    metaTitle: "Récupération de retenue à la source de A à Z",
    metaDescription:
      "Nous récupérons le trop-perçu de retenue à la source sur vos dividendes étrangers : diagnostic, documents, formulaires, dépôt, relances, versement. Sans avance de frais — payé uniquement au résultat.",
    hero: {
      kicker: "Service phare",
      h1: "Votre trop-perçu, récupéré de bout en bout",
      lede: (maxGap) =>
        `Entre le taux prélevé à l'étranger et le taux prévu par la convention fiscale, l'écart atteint jusqu'à ${maxGap} du dividende selon le pays. Cet argent est à vous. Nous montons le dossier, le déposons et le suivons jusqu'au virement — vous ne payez que sur ce qui revient effectivement.`,
      statFailLabel: "facturé si la demande échoue",
      statCountriesLabel: "pays couverts, formulaires inclus",
      statCapLabel: "plafond d'honoraires par dossier",
    },
    personas: {
      kicker: "Pour qui",
      title: "À qui s'adresse ce service",
      lede: "Le même moteur de récupération, quatre situations types.",
      individual: {
        title: "Investisseur particulier",
        desc: "Un compte-titres chez un ou plusieurs courtiers, des dividendes suisses, américains ou européens encaissés au taux plein : le cas le plus fréquent. Nous remontons les années encore ouvertes, dans la limite des prescriptions de chaque pays.",
        signal: "Dès quelques centaines d'euros de trop-perçu",
      },
      familyOffice: {
        title: "Family office",
        desc: (threshold) =>
          `Multi-entités, multi-dépositaires, multi-juridictions : nous consolidons les lignes par entité et par pays, avec un interlocuteur unique et un reporting agrégé. Au-delà de ${threshold} récupérés, une tarification institutionnelle est établie sur devis.`,
        signal: "Consolidation par entité et par pays",
      },
      cgp: {
        title: "CGP — pour vos clients",
        desc: (revShare) =>
          `Vous détectez le trop-perçu chez vos clients, nous faisons tout le reste — sous notre marque ou la vôtre. ${revShare} des honoraires de résultat vous sont reversés sur chaque dossier apporté.`,
        signal: "Suivi consolidé de tous vos clients",
        linkLabel: "Voir l'offre marque blanche",
      },
      holding: {
        title: "Holding / PME",
        desc: "Une société qui encaisse des dividendes étrangers subit les mêmes retenues excédentaires qu'un particulier — avec des montants supérieurs et un formalisme accru (W-8BEN-E, justificatifs de chaîne de détention). Nous gérons les deux.",
        signal: "W-8BEN-E et chaîne de détention inclus",
      },
    },
    scope: {
      kicker: "Périmètre",
      title: "Ce que FiscalPlace prend en charge",
      lede: "De la première lecture de vos relevés jusqu'au virement sur votre compte, chaque étape ci-dessous est couverte par les honoraires de résultat — rien ne s'ajoute en cours de route.",
      items: [
        {
          title: "Diagnostic ligne à ligne",
          desc: "Lecture de vos relevés, détection des sur-prélèvements, chiffrage pays par pays. Gratuit — même si la conclusion est « rien à récupérer ».",
        },
        {
          title: "Collecte des documents",
          desc: "Liste personnalisée des pièces, relance de votre courtier si besoin, contrôle de conformité de chaque document avant montage.",
        },
        {
          title: "Mandat de représentation",
          desc: "Signature électronique du mandat qui nous autorise à agir en votre nom auprès de chaque administration concernée.",
        },
        {
          title: "Formulaires par pays",
          desc: "Formulaire 83 suisse, NR7-R canadien, ZS-RD1 autrichien, SKV 3740 suédois… générés, pré-remplis et contrôlés pour chaque juridiction.",
        },
        {
          title: "Dépôt auprès des administrations",
          desc: "En ligne quand l'administration le permet, papier sinon — au bon guichet, avant la prescription.",
        },
        {
          title: "Relances et suivi d'instruction",
          desc: "Réponses aux demandes complémentaires, relances des administrations, aussi longtemps que nécessaire.",
        },
        {
          title: "Réconciliation des remboursements",
          desc: "Chaque virement reçu est rapproché de la demande correspondante, ligne à ligne, écart par écart.",
        },
        {
          title: "Versement et justificatifs",
          desc: "Vous recevez le montant net, le décompte détaillé de nos honoraires et les pièces utiles à votre déclaration.",
        },
      ],
    },
    example: {
      kicker: "Exemple chiffré",
      title: (gross) => `Exemple : ${gross} de dividendes suisses`,
      lede: (statutory, treaty) =>
        `Résident fiscal français, dividendes bruts encaissés sur des valeurs suisses. La Suisse retient ${statutory} à la source ; la convention n'en autorise que ${treaty}.`,
      withheldLabel: (rate) => `Retenue suisse prélevée (${rate})`,
      owedLabel: (rate) => `Dû par convention (${rate})`,
      treatyRef: (rate) => `CDI FR-CH · ${rate}`,
      feeTitle: "Et une fois nos honoraires déduits ?",
      recoveredLabel: "Trop-perçu récupéré",
      feeLabel: "Honoraires de résultat",
      feeSub: (effectiveRate) => `taux effectif ${effectiveRate}`,
      netLabel: "Net versé pour vous",
      feeFootnote:
        "Si rien n'est récupéré, rien n'est facturé. Montants indicatifs — chaque dossier est vérifié avant dépôt.",
    },
    price: {
      kicker: "Le prix",
      title: "Payé au résultat, sur une grille publique",
      lede: "Aucune avance, aucun frais de dossier, aucun abonnement obligatoire. Nos honoraires sont un pourcentage dégressif du montant récupéré, calculé par tranche — comme un barème d'impôt : chaque tranche est facturée à son propre taux.",
      tierUpTo: (max) => `Jusqu'à ${max}`,
      tierBetween: (min, max) => `De ${min} à ${max}`,
      tierAbove: (min) => `Au-delà de ${min}`,
      floorNote: (floor) =>
        `Minimum ${floor} par dossier abouti — jamais facturé d'avance, jamais en cas d'échec.`,
      capNote: (cap) => `Plafond ${cap} d'honoraires par dossier, quel que soit le montant récupéré.`,
      institutionalNote: (threshold) =>
        `Au-delà de ${threshold} récupérés : tarification institutionnelle sur devis.`,
    },
    delays: {
      kicker: "Délais",
      title: "Les délais réalistes, sans enjolivement",
      lede: "La vitesse finale dépend de l'administration étrangère, pas de nous. Voici ce qu'il faut vraiment prévoir.",
      filing: {
        title: "Montage et dépôt : quelques semaines",
        desc: "Une fois vos documents réunis, le dossier est monté, contrôlé et déposé rapidement — c'est la partie que nous maîtrisons. L'étape la plus lente côté client est souvent le certificat de résidence à faire viser par votre centre des impôts.",
      },
      processing: {
        title: "Instruction : de quelques mois à plus d'un an",
        desc: "Chaque administration a son rythme : le fisc suédois est réputé relativement réactif, tandis que l'administration allemande dépasse fréquemment 12 mois d'instruction. Nous relançons systématiquement, mais nous ne décidons pas à leur place.",
      },
      sol: {
        title: (min, max) => `Prescription : ${min} à ${max} ans selon le pays`,
        desc: (caYears) =>
          `Passé le délai de prescription, le trop-perçu est définitivement perdu. Au Canada, la fenêtre n'est que de ${caYears} ans : certains dossiers se jouent à quelques mois près.`,
        linkLabel: "Calculer mes délais de prescription",
      },
    },
    notPromised: {
      kicker: "Transparence",
      title: "Ce qu'on ne vous promet pas",
      lede: "Un prestataire qui promet tout doit vous inquiéter. Voici nos limites, écrites noir sur blanc.",
      guarantee: {
        title: "Aucune garantie de succès",
        desc: "C'est l'administration étrangère qui décide, pas nous. Nous ne déposons que des dossiers que nous jugeons solides — et si la demande échoue malgré tout, vous ne payez rien.",
      },
      prescription: {
        title: "Aucune récupération après prescription",
        desc: (caYears) =>
          `Un trop-perçu prescrit est perdu, pour nous comme pour n'importe qui d'autre. Exemple : au Canada, ${caYears} ans seulement après la fin de l'année du prélèvement. C'est précisément pour cela que nous alertons avant l'échéance, pas après.`,
      },
      franking: {
        title: "Aucun miracle sur les franking credits australiens",
        desc: "Les crédits d'imputation australiens ne sont pas remboursables aux non-résidents — quiconque promet de les « récupérer » se trompe. Seule la retenue sur la part unfranked, au-delà du taux conventionnel, se réclame.",
      },
      uk: {
        title: "Rien à récupérer sur les dividendes ordinaires britanniques",
        desc: "Le Royaume-Uni ne prélève pas de retenue à la source sur les dividendes ordinaires : il n'y a rien à réclamer, et notre diagnostic vous le dira. Les distributions de REIT (PID) font exception et se traitent.",
      },
    },
    process: {
      kicker: "Processus",
      title: "Un dossier, huit étapes, zéro zone d'ombre",
      lede: "Chaque dossier avance sur la même chaîne de huit étapes, visible en continu dans votre espace client. Ci-dessous, un dossier en cours d'instruction :",
      linkLabel: "Voir les 8 étapes en détail",
    },
    faq: {
      kicker: "FAQ",
      title: "Les questions qu'on nous pose avant de signer",
      fail: {
        q: "Combien ça coûte si la demande échoue ?",
        a: (floor) =>
          `Rien. Zéro frais de dossier, zéro avance, zéro facturation en cas d'échec ou de rejet définitif. Le minimum de ${floor} par dossier ne s'applique qu'aux dossiers effectivement remboursés.`,
      },
      advance: {
        q: "Dois-je avancer de l'argent à un moment ?",
        a: "Non. Nos honoraires sont prélevés sur le montant récupéré, au moment où il est récupéré. Seuls les services à prix fixe commandés séparément (W-8BEN, certificat de résidence…) se paient à la commande — la récupération complète, elle, ne coûte rien tant que rien n'est revenu.",
      },
      countries: {
        q: "Quels pays couvrez-vous ?",
        a: (count) =>
          `${count} pays à ce jour, dont les principaux gisements de récupération européens et nord-américains. Chaque pays a sa fiche détaillée sur le site : taux, délais de prescription, pièces exigées et particularités.`,
      },
      reject: {
        q: "Que se passe-t-il si l'administration rejette ma demande ?",
        a: "Nous analysons le motif. Si le rejet est corrigeable — pièce manquante, visa absent, formulaire à compléter — nous corrigeons et redéposons sans frais supplémentaires. S'il est définitif, le dossier est clos et rien ne vous est facturé.",
      },
      multi: {
        q: "Puis-je confier plusieurs années et plusieurs pays à la fois ?",
        a: "Oui — c'est même la configuration la plus fréquente. Nous regroupons les demandes par pays et par année ; en Suisse, par exemple, regrouper les dividendes en une demande annuelle est la pratique recommandée. Chaque dossier garde sa propre ligne de suivi.",
      },
      advice: {
        q: "Est-ce du conseil fiscal ?",
        a: "Non. FiscalPlace est un service spécialisé de démarches administratives et fiscales : nous préparons, déposons et suivons des demandes de remboursement de retenue à la source. Pour une stratégie fiscale d'ensemble, rapprochez-vous d'un avocat fiscaliste ou d'un expert-comptable.",
      },
    },
    finalCta: {
      title: "Chiffrez votre trop-perçu avant de nous confier quoi que ce soit",
      desc: "Le simulateur est gratuit, sans compte, et affiche nos honoraires poste par poste. Si le jeu n'en vaut pas la chandelle, il vous le dira aussi.",
    },
  },
  en: {
    metaTitle: "End-to-end withholding-tax recovery",
    metaDescription:
      "We recover the over-withheld tax on your foreign dividends: diagnostic, documents, forms, filing, follow-ups, payout. No upfront fees — you only pay on results.",
    hero: {
      kicker: "Flagship service",
      h1: "Your over-withheld tax, recovered end to end",
      lede: (maxGap) =>
        `Between the rate withheld abroad and the rate the tax treaty allows, the gap reaches up to ${maxGap} of the dividend depending on the country. That money is yours. We build the claim, file it and follow it through to the bank transfer — you only pay on what actually comes back.`,
      statFailLabel: "charged if the claim fails",
      statCountriesLabel: "countries covered, forms included",
      statCapLabel: "fee cap per claim",
    },
    personas: {
      kicker: "Who it's for",
      title: "Who this service is for",
      lede: "The same recovery engine, four typical situations.",
      individual: {
        title: "Individual investor",
        desc: "A brokerage account with one or several brokers, Swiss, US or European dividends cashed at the full rate: the most common case. We go back through the years still open, within each country's statute of limitations.",
        signal: "From a few hundred euros of over-withholding",
      },
      familyOffice: {
        title: "Family office",
        desc: (threshold) =>
          `Multiple entities, custodians and jurisdictions: we consolidate holdings by entity and by country, with a single point of contact and aggregated reporting. Above ${threshold} recovered, institutional pricing is quoted individually.`,
        signal: "Consolidated by entity and by country",
      },
      cgp: {
        title: "Wealth advisers — for your clients",
        desc: (revShare) =>
          `You spot the over-withholding in your clients' portfolios, we do everything else — under our brand or yours. ${revShare} of the success fee is paid back to you on every referred claim.`,
        signal: "Consolidated tracking across all your clients",
        linkLabel: "See the white-label offer",
      },
      holding: {
        title: "Holding company / SME",
        desc: "A company cashing foreign dividends suffers the same excess withholding as an individual — with larger amounts and heavier formalities (W-8BEN-E, chain-of-custody evidence). We handle both.",
        signal: "W-8BEN-E and chain of custody included",
      },
    },
    scope: {
      kicker: "Scope",
      title: "What FiscalPlace takes care of",
      lede: "From the first read of your statements to the transfer landing on your account, every step below is covered by the success fee — nothing is added along the way.",
      items: [
        {
          title: "Line-by-line diagnostic",
          desc: "We read your statements, detect over-withholding and quantify it country by country. Free — even when the conclusion is 'nothing to recover'.",
        },
        {
          title: "Document collection",
          desc: "A personalised checklist, broker chased on your behalf if needed, and a compliance check on every document before the file is built.",
        },
        {
          title: "Representation mandate",
          desc: "Electronic signature of the mandate authorising us to act on your behalf before each administration involved.",
        },
        {
          title: "Country-specific forms",
          desc: "Swiss Form 83, Canadian NR7-R, Austrian ZS-RD1, Swedish SKV 3740… generated, pre-filled and checked for each jurisdiction.",
        },
        {
          title: "Filing with the administrations",
          desc: "Online where the administration allows it, paper otherwise — at the right counter, before the deadline expires.",
        },
        {
          title: "Follow-ups during review",
          desc: "We answer requests for further information and chase the administrations, for as long as it takes.",
        },
        {
          title: "Refund reconciliation",
          desc: "Every transfer received is matched against the corresponding claim, line by line, discrepancy by discrepancy.",
        },
        {
          title: "Payout and supporting documents",
          desc: "You receive the net amount, the detailed fee statement and the documents useful for your tax return.",
        },
      ],
    },
    example: {
      kicker: "Worked example",
      title: (gross) => `Example: ${gross} of Swiss dividends`,
      lede: (statutory, treaty) =>
        `French tax resident, gross dividends received on Swiss stocks. Switzerland withholds ${statutory} at source; the treaty allows only ${treaty}.`,
      withheldLabel: (rate) => `Swiss tax withheld (${rate})`,
      owedLabel: (rate) => `Owed under the treaty (${rate})`,
      treatyRef: (rate) => `FR–CH treaty · ${rate}`,
      feeTitle: "And after our fee?",
      recoveredLabel: "Over-withholding recovered",
      feeLabel: "Success fee",
      feeSub: (effectiveRate) => `effective rate ${effectiveRate}`,
      netLabel: "Net paid out to you",
      feeFootnote:
        "If nothing is recovered, nothing is charged. Indicative amounts — every claim is verified before filing.",
    },
    price: {
      kicker: "The price",
      title: "Paid on results, on a public grid",
      lede: "No advance, no file fee, no mandatory subscription. Our fee is a degressive percentage of the recovered amount, computed bracket by bracket — like an income-tax scale: each slice is charged at its own rate.",
      tierUpTo: (max) => `Up to ${max}`,
      tierBetween: (min, max) => `${min} to ${max}`,
      tierAbove: (min) => `Above ${min}`,
      floorNote: (floor) =>
        `${floor} minimum per successful claim — never charged upfront, never on failure.`,
      capNote: (cap) => `Fee capped at ${cap} per claim, whatever the amount recovered.`,
      institutionalNote: (threshold) =>
        `Above ${threshold} recovered: institutional pricing, quoted individually.`,
    },
    delays: {
      kicker: "Timelines",
      title: "Realistic timelines, no sugar-coating",
      lede: "The final speed depends on the foreign administration, not on us. Here is what to actually expect.",
      filing: {
        title: "Preparation and filing: a few weeks",
        desc: "Once your documents are in, the file is built, checked and filed quickly — that is the part we control. The slowest step on the client side is usually the certificate of residence to be stamped by your local tax office.",
      },
      processing: {
        title: "Review: from a few months to over a year",
        desc: "Each administration moves at its own pace: the Swedish tax agency is known for being relatively responsive, while the German administration frequently exceeds 12 months of review. We chase systematically — but we do not decide in their place.",
      },
      sol: {
        title: (min, max) => `Statute of limitations: ${min} to ${max} years by country`,
        desc: (caYears) =>
          `Once the deadline passes, the overpayment is lost for good. In Canada the window is only ${caYears} years: some claims come down to a matter of months.`,
        linkLabel: "Check my deadlines",
      },
    },
    notPromised: {
      kicker: "Transparency",
      title: "What we do not promise you",
      lede: "A provider who promises everything should worry you. Here are our limits, in black and white.",
      guarantee: {
        title: "No guarantee of success",
        desc: "The foreign administration decides, not us. We only file claims we judge solid — and if the claim fails anyway, you pay nothing.",
      },
      prescription: {
        title: "No recovery after the deadline",
        desc: (caYears) =>
          `A time-barred overpayment is lost — for us as for anyone else. Example: in Canada, only ${caYears} years after the end of the withholding year. That is exactly why we alert you before the deadline, not after.`,
      },
      franking: {
        title: "No miracle on Australian franking credits",
        desc: "Australian franking credits are not refundable to non-residents — anyone promising to 'recover' them is wrong. Only the withholding on the unfranked portion, above the treaty rate, can be claimed.",
      },
      uk: {
        title: "Nothing to recover on ordinary UK dividends",
        desc: "The UK levies no withholding tax on ordinary dividends: there is nothing to claim, and our diagnostic will tell you so. REIT distributions (PIDs) are the exception and can be worked.",
      },
    },
    process: {
      kicker: "Process",
      title: "One claim, eight stages, no grey areas",
      lede: "Every claim moves along the same eight-stage chain, visible at all times in your client area. Below, a claim currently under review:",
      linkLabel: "See the 8 stages in detail",
    },
    faq: {
      kicker: "FAQ",
      title: "The questions we get before people sign",
      fail: {
        q: "What does it cost if the claim fails?",
        a: (floor) =>
          `Nothing. No file fee, no advance, no invoice on failure or final rejection. The ${floor} minimum per claim only applies to claims that are actually refunded.`,
      },
      advance: {
        q: "Do I ever have to pay anything upfront?",
        a: "No. Our fee is taken from the recovered amount, at the moment it is recovered. Only the fixed-price services ordered separately (W-8BEN, certificate of residence…) are paid at order time — end-to-end recovery costs nothing until money has come back.",
      },
      countries: {
        q: "Which countries do you cover?",
        a: (count) =>
          `${count} countries to date, including the main European and North American recovery pools. Each country has its own detailed page on this site: rates, deadlines, required documents and quirks.`,
      },
      reject: {
        q: "What happens if the administration rejects my claim?",
        a: "We analyse the reason. If the rejection is fixable — missing document, missing stamp, incomplete form — we correct and refile at no extra cost. If it is final, the claim is closed and nothing is charged.",
      },
      multi: {
        q: "Can I hand over several years and several countries at once?",
        a: "Yes — that is actually the most common setup. We bundle claims by country and by year; in Switzerland, for instance, bundling dividends into one annual claim is the recommended practice. Each claim keeps its own tracking line.",
      },
      advice: {
        q: "Is this tax advice?",
        a: "No. FiscalPlace is a specialised administrative and tax-filing service: we prepare, file and follow up withholding-tax refund claims. For an overall tax strategy, consult a tax lawyer or a chartered accountant.",
      },
    },
    finalCta: {
      title: "Put a number on your overpayment before you commit to anything",
      desc: "The simulator is free, requires no account, and shows our fee line by line. If the claim is not worth filing, it will tell you that too.",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const c = getCommon(locale);

  const swiss = getCountryById("CH")!;
  const canada = getCountryById("CA")!;
  const sim = simulate({ country: swiss, residence: "FR", grossDividend: EXAMPLE_GROSS });

  const maxGap = Math.max(...COUNTRIES.map((country) => recoveryGap(country, "FR")));
  const solYears = COUNTRIES.map((country) => country.sol.years);
  const minSol = Math.min(...solYears);
  const maxSol = Math.max(...solYears);

  const tiers = PRICING.successFeeTiers;
  const tierRows = tiers.map((tier, i) => {
    const lower = i === 0 ? 0 : tiers[i - 1].upTo;
    const label =
      tier.upTo === Infinity
        ? t.price.tierAbove(formatCurrency(lower, locale))
        : i === 0
          ? t.price.tierUpTo(formatCurrency(tier.upTo, locale))
          : t.price.tierBetween(formatCurrency(lower, locale), formatCurrency(tier.upTo, locale));
    return { label, rate: formatPercent(tier.rate, locale) };
  });

  const personas: { title: string; desc: string; signal: string; link?: { href: string; label: string } }[] = [
    { ...t.personas.individual },
    {
      title: t.personas.familyOffice.title,
      desc: t.personas.familyOffice.desc(formatCurrency(PRICING.institutionalThreshold, locale)),
      signal: t.personas.familyOffice.signal,
    },
    {
      title: t.personas.cgp.title,
      desc: t.personas.cgp.desc(formatPercent(PRICING.partnerRevShare, locale)),
      signal: t.personas.cgp.signal,
      link: { href: href(locale, "whiteLabel"), label: t.personas.cgp.linkLabel },
    },
    { ...t.personas.holding },
  ];

  const faqItems = [
    { question: t.faq.fail.q, answer: t.faq.fail.a(formatCurrency(PRICING.floorFee, locale)) },
    { question: t.faq.advance.q, answer: t.faq.advance.a },
    { question: t.faq.countries.q, answer: t.faq.countries.a(COUNTRIES.length) },
    { question: t.faq.reject.q, answer: t.faq.reject.a },
    { question: t.faq.multi.q, answer: t.faq.multi.a },
    { question: t.faq.advice.q, answer: t.faq.advice.a },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-14 sm:pt-20">
        <Container>
          <Badge tone="gold">{t.hero.kicker}</Badge>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl text-balance">
            {t.hero.h1}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[17px] leading-relaxed text-mine">
            {t.hero.lede(formatPercent(maxGap, locale))}
          </p>
          <div className="mt-7">
            <ButtonLink href={href(locale, "simulator")}>{c.cta.simulate}</ButtonLink>
            <TrustLine text={c.trustLine} className="mt-3" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatTile value={formatCurrency(0, locale)} label={t.hero.statFailLabel} tone="brand" />
            <StatTile value={String(COUNTRIES.length)} label={t.hero.statCountriesLabel} />
            <StatTile
              value={formatCurrency(PRICING.capFee, locale)}
              label={t.hero.statCapLabel}
            />
          </div>
        </Container>
      </section>

      {/* Personas */}
      <section className="mt-14 border-y border-rule bg-white py-14 sm:py-16">
        <Container>
          <SectionHeading
            kicker={t.personas.kicker}
            title={t.personas.title}
            lede={t.personas.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {personas.map((p) => (
              <Card key={p.title} className="flex flex-col p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-mine">{p.desc}</p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-mine">
                  {p.signal}
                </p>
                {p.link && (
                  <p className="mt-2">
                    <Link
                      href={p.link.href}
                      className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
                    >
                      {p.link.label} →
                    </Link>
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Scope */}
      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading kicker={t.scope.kicker} title={t.scope.title} lede={t.scope.lede} />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.scope.items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-tint-green font-mono text-[11px] text-brand"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <div>
                  <p className="text-[15px] font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mine">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Worked example */}
      <section className="border-y border-rule bg-white py-14 sm:py-16">
        <Container>
          <SectionHeading
            kicker={t.example.kicker}
            title={t.example.title(formatCurrency(EXAMPLE_GROSS, locale))}
            lede={t.example.lede(
              formatPercent(sim.statutoryRate, locale),
              formatPercent(sim.treatyRate, locale),
            )}
          />
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-2">
            <LedgerEntry
              withheldLabel={t.example.withheldLabel(formatPercent(sim.statutoryRate, locale))}
              withheldAmount={formatCurrency(sim.withheld, locale)}
              owedLabel={t.example.owedLabel(formatPercent(sim.treatyRate, locale))}
              owedAmount={formatCurrency(sim.treatyDue, locale)}
              treatyRef={t.example.treatyRef(formatPercent(sim.treatyRate, locale))}
              recoverLabel={c.labels.overWithholding}
              recoverAmount={formatCurrency(sim.recoverable, locale)}
              footnote={`${c.labels.lastReviewed} ${formatDate(swiss.lastReviewed, locale)}`}
            />
            <Card className="p-5 sm:p-6">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                {t.example.feeTitle}
              </p>
              <div className="mt-3">
                <LedgerLine
                  label={t.example.recoveredLabel}
                  amount={formatCurrency(sim.recoverable, locale)}
                  tone="ink"
                />
                <LedgerLine
                  label={t.example.feeLabel}
                  amount={`− ${formatCurrency(sim.commission.fee, locale)}`}
                  tone="mine"
                  sub={t.example.feeSub(formatPercent(sim.commission.effectiveRate, locale, 1))}
                />
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                <LedgerLine
                  label={t.example.netLabel}
                  amount={formatCurrency(sim.netToClient, locale)}
                  tone="brand"
                  bold
                />
                <DoubleRule className="mt-3" />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-mine">{t.example.feeFootnote}</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Price */}
      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading kicker={t.price.kicker} title={t.price.title} lede={t.price.lede} />
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1fr_1fr]">
            <Card className="p-5 sm:p-6">
              <div className="space-y-1.5">
                {tierRows.map((row) => (
                  <div key={row.label} className="flex items-baseline text-[15px] text-ink">
                    <span className="shrink-0">{row.label}</span>
                    <span className="leaders" aria-hidden="true" />
                    <span className="shrink-0 font-mono">{row.rate}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex flex-col gap-3">
              <p className="text-[15px] leading-relaxed text-mine">
                {t.price.floorNote(formatCurrency(PRICING.floorFee, locale))}
              </p>
              <p className="text-[15px] leading-relaxed text-mine">
                {t.price.capNote(formatCurrency(PRICING.capFee, locale))}
              </p>
              <p className="text-[15px] leading-relaxed text-mine">
                {t.price.institutionalNote(
                  formatCurrency(PRICING.institutionalThreshold, locale),
                )}
              </p>
              <p className="mt-2">
                <Link
                  href={href(locale, "pricing")}
                  className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
                >
                  {c.cta.seePricing} →
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Timelines */}
      <section className="border-y border-rule bg-white py-14 sm:py-16">
        <Container>
          <SectionHeading kicker={t.delays.kicker} title={t.delays.title} lede={t.delays.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{t.delays.filing.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mine">{t.delays.filing.desc}</p>
            </Card>
            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-lg font-semibold text-ink">
                {t.delays.processing.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mine">{t.delays.processing.desc}</p>
            </Card>
            <Card className="flex flex-col p-5 sm:p-6">
              <h3 className="font-display text-lg font-semibold text-ink">
                {t.delays.sol.title(minSol, maxSol)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-mine">
                {t.delays.sol.desc(canada.sol.years)}
              </p>
              <p className="mt-4">
                <Link
                  href={href(locale, "solCalculator")}
                  className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
                >
                  {t.delays.sol.linkLabel} →
                </Link>
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* What we do not promise */}
      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading
            kicker={t.notPromised.kicker}
            title={t.notPromised.title}
            lede={t.notPromised.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              t.notPromised.guarantee,
              {
                title: t.notPromised.prescription.title,
                desc: t.notPromised.prescription.desc(canada.sol.years),
              },
              t.notPromised.franking,
              t.notPromised.uk,
            ].map((item) => (
              <Card key={item.title} className="p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mine">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Process teaser */}
      <section className="border-y border-rule bg-white py-14 sm:py-16">
        <Container>
          <SectionHeading
            kicker={t.process.kicker}
            title={t.process.title}
            lede={t.process.lede}
          />
          <Card className="mt-8 p-5 sm:p-6">
            <TimelineCompact currentStage="processing" locale={locale} />
          </Card>
          <p className="mt-5">
            <Link
              href={href(locale, "howItWorks")}
              className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
            >
              {t.process.linkLabel} →
            </Link>
          </p>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={faqItems} className="mt-8" />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rule bg-white py-14 sm:py-20">
        <Container className="text-center">
          <SectionHeading title={t.finalCta.title} lede={t.finalCta.desc} center />
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href={href(locale, "simulator")}>{c.cta.simulate}</ButtonLink>
            <ButtonLink href={href(locale, "portalOnboarding")} variant="secondary">
              {c.cta.openAccount}
            </ButtonLink>
          </div>
          <TrustLine text={c.trustLine} className="mt-4" />
        </Container>
      </section>
    </>
  );
}
