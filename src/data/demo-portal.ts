import type { Localized } from "@/lib/i18n";

/**
 * DEMO PORTAL DATA — everything in the client area is driven by this mocked
 * dataset. It simulates what the real backend (workflow orchestrator +
 * PostgreSQL) would serve. All names/figures are openly fictitious demo data,
 * labelled as such in the UI — this is NOT presented as real client activity.
 */

export const CLAIM_STAGES = [
  "eligibility",
  "documents",
  "mandate",
  "filed",
  "processing",
  "response",
  "refundReceived",
  "paidOut",
] as const;
export type ClaimStage = (typeof CLAIM_STAGES)[number];

export const STAGE_LABELS: Record<ClaimStage, Localized<string>> = {
  eligibility: { fr: "Éligibilité vérifiée", en: "Eligibility verified" },
  documents: { fr: "Documents collectés", en: "Documents collected" },
  mandate: { fr: "Mandat signé", en: "Mandate signed" },
  filed: { fr: "Dossier déposé", en: "Claim filed" },
  processing: { fr: "En instruction", en: "Under review" },
  response: { fr: "Réponse / requête complémentaire", en: "Response / further request" },
  refundReceived: { fr: "Remboursement reçu", en: "Refund received" },
  paidOut: { fr: "Paiement versé", en: "Paid out to you" },
};

export interface DemoEntity {
  id: string;
  name: Localized<string>;
  type: Localized<string>;
  residence: string;
}

export interface ClaimEvent {
  stage: ClaimStage;
  date: string; // ISO
  note?: Localized<string>;
}

export interface DemoClaim {
  id: string;
  entityId: string;
  countryId: string;
  /** Securities concerned — display only. */
  securities: string;
  taxYears: string;
  grossDividends: number;
  recoverableEstimate: number;
  currentStage: ClaimStage;
  /** Completed events, in order. */
  history: ClaimEvent[];
  solDeadline: string; // ISO
  actionRequired?: Localized<string>;
  /** Set when the claim is finished. */
  outcome?: {
    recovered: number;
    fee: number;
    disbursements: number;
    netPaid: number;
    paidOn: string;
  };
}

export interface DemoDocument {
  id: string;
  entityId: string;
  claimId?: string;
  name: string;
  kind: Localized<string>;
  uploadedOn: string;
  status: "extracted" | "processing" | "needs-review";
  extraction?: { field: Localized<string>; value: string }[];
}

export interface DemoMessage {
  id: string;
  from: "client" | "assistant" | "team";
  authorLabel: Localized<string>;
  date: string;
  body: Localized<string>;
}

export interface DemoInvoice {
  id: string;
  number: string;
  date: string;
  entityId: string;
  label: Localized<string>;
  amount: number;
  status: "paid" | "deducted";
  lines: { label: Localized<string>; amount: number }[];
}

export interface DemoNotification {
  id: string;
  date: string;
  kind: "status" | "deadline" | "action" | "payment";
  body: Localized<string>;
  claimId?: string;
  read: boolean;
}

export interface DemoReferral {
  client: Localized<string>;
  joined: string;
  claims: number;
  recovered: number;
  commission: number;
}

export const DEMO_USER = {
  firstName: "Camille",
  lastName: "Démo",
  email: "camille@exemple.fr",
  residence: "FR",
  kycStatus: "verified" as const,
  partnerCode: "CGP-DEMO-2317",
};

export const DEMO_ENTITIES: DemoEntity[] = [
  {
    id: "ent-perso",
    name: { fr: "Portefeuille personnel", en: "Personal portfolio" },
    type: { fr: "Particulier", en: "Individual" },
    residence: "FR",
  },
  {
    id: "ent-holding",
    name: { fr: "SC Horizon Patrimoine (démo)", en: "SC Horizon Patrimoine (demo)" },
    type: { fr: "Société civile / holding", en: "Holding company" },
    residence: "FR",
  },
];

export const DEMO_CLAIMS: DemoClaim[] = [
  {
    id: "FP-2417",
    entityId: "ent-perso",
    countryId: "CH",
    securities: "Nestlé, Roche, Zurich Insurance",
    taxYears: "2024",
    grossDividends: 14_200,
    recoverableEstimate: 2_840,
    currentStage: "processing",
    history: [
      { stage: "eligibility", date: "2026-02-03" },
      { stage: "documents", date: "2026-02-10" },
      { stage: "mandate", date: "2026-02-11" },
      {
        stage: "filed",
        date: "2026-02-18",
        note: {
          fr: "Déposé électroniquement auprès de l'AFC (procédure en ligne obligatoire).",
          en: "Filed electronically with the Swiss FTA (mandatory online procedure).",
        },
      },
      {
        stage: "processing",
        date: "2026-02-19",
        note: {
          fr: "Délai d'instruction habituel constaté : 4 à 8 mois.",
          en: "Typical observed processing time: 4 to 8 months.",
        },
      },
    ],
    solDeadline: "2027-12-31",
  },
  {
    id: "FP-2551",
    entityId: "ent-perso",
    countryId: "CA",
    securities: "Banque Royale du Canada, Enbridge",
    taxYears: "2024",
    grossDividends: 6_100,
    recoverableEstimate: 610,
    currentStage: "documents",
    history: [
      { stage: "eligibility", date: "2026-06-22" },
      { stage: "documents", date: "2026-06-24" },
    ],
    solDeadline: "2026-12-31",
    actionRequired: {
      fr: "Il manque votre certificat de résidence fiscale 2024. Délai canadien : ce dossier se prescrit le 31 décembre 2026 — nous l'avons passé en traitement prioritaire.",
      en: "Your 2024 certificate of tax residence is missing. Canadian deadline: this claim expires on 31 December 2026 — we have switched it to priority handling.",
    },
  },
  {
    id: "FP-2238",
    entityId: "ent-perso",
    countryId: "DE",
    securities: "Allianz, Siemens",
    taxYears: "2022–2023",
    grossDividends: 9_800,
    recoverableEstimate: 1_115,
    currentStage: "paidOut",
    history: [
      { stage: "eligibility", date: "2025-09-12" },
      { stage: "documents", date: "2025-09-20" },
      { stage: "mandate", date: "2025-09-21" },
      { stage: "filed", date: "2025-10-02" },
      { stage: "processing", date: "2025-10-03" },
      {
        stage: "response",
        date: "2026-04-14",
        note: {
          fr: "Le BZSt a demandé une attestation de détention complémentaire — fournie sous 6 jours.",
          en: "The BZSt requested an additional custody confirmation — provided within 6 days.",
        },
      },
      { stage: "refundReceived", date: "2026-06-02" },
      { stage: "paidOut", date: "2026-06-05" },
    ],
    solDeadline: "2026-12-31",
    outcome: {
      recovered: 1_115,
      fee: 278.75,
      disbursements: 12.4,
      netPaid: 823.85,
      paidOn: "2026-06-05",
    },
  },
  {
    id: "FP-2602",
    entityId: "ent-perso",
    countryId: "IE",
    securities: "CRH, Kerry Group",
    taxYears: "2023–2024",
    grossDividends: 3_400,
    recoverableEstimate: 850,
    currentStage: "mandate",
    history: [
      { stage: "eligibility", date: "2026-07-01" },
      { stage: "documents", date: "2026-07-05" },
    ],
    solDeadline: "2027-12-31",
    actionRequired: {
      fr: "Votre mandat de représentation est prêt : une signature électronique et le dossier part au dépôt.",
      en: "Your representation mandate is ready: one electronic signature and the claim goes to filing.",
    },
  },
  {
    id: "FP-2588",
    entityId: "ent-holding",
    countryId: "SE",
    securities: "Volvo, Investor AB",
    taxYears: "2023–2024",
    grossDividends: 21_500,
    recoverableEstimate: 3_225,
    currentStage: "filed",
    history: [
      { stage: "eligibility", date: "2026-05-11" },
      { stage: "documents", date: "2026-05-19" },
      { stage: "mandate", date: "2026-05-20" },
      {
        stage: "filed",
        date: "2026-06-30",
        note: {
          fr: "Dépôt SKV 3740 auprès du Skatteverket.",
          en: "SKV 3740 filed with Skatteverket.",
        },
      },
    ],
    solDeadline: "2028-12-31",
  },
];

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: "doc-1",
    entityId: "ent-perso",
    claimId: "FP-2417",
    name: "releve-dividendes-2024.pdf",
    kind: { fr: "Relevé de dividendes", en: "Dividend statement" },
    uploadedOn: "2026-02-08",
    status: "extracted",
    extraction: [
      { field: { fr: "Dividendes bruts", en: "Gross dividends" }, value: "14 200,00 CHF" },
      { field: { fr: "Impôt anticipé (35 %)", en: "Withholding (35%)" }, value: "4 970,00 CHF" },
      { field: { fr: "Lignes détectées", en: "Lines detected" }, value: "3 (ISIN CH…)" },
    ],
  },
  {
    id: "doc-2",
    entityId: "ent-perso",
    claimId: "FP-2417",
    name: "attestation-residence-2024.pdf",
    kind: { fr: "Certificat de résidence fiscale", en: "Certificate of tax residence" },
    uploadedOn: "2026-02-10",
    status: "extracted",
    extraction: [
      { field: { fr: "Année", en: "Year" }, value: "2024" },
      { field: { fr: "Autorité", en: "Authority" }, value: "SIP Paris 8e" },
    ],
  },
  {
    id: "doc-3",
    entityId: "ent-perso",
    claimId: "FP-2551",
    name: "releve-ca-2024.pdf",
    kind: { fr: "Relevé de courtage", en: "Brokerage statement" },
    uploadedOn: "2026-06-24",
    status: "extracted",
    extraction: [
      { field: { fr: "Dividendes bruts", en: "Gross dividends" }, value: "6 100,00 CAD" },
      { field: { fr: "Retenue (25 %)", en: "Withholding (25%)" }, value: "1 525,00 CAD" },
    ],
  },
  {
    id: "doc-4",
    entityId: "ent-holding",
    claimId: "FP-2588",
    name: "kontoutdrag-2023-2024.pdf",
    kind: { fr: "Relevé de dividendes", en: "Dividend statement" },
    uploadedOn: "2026-05-17",
    status: "extracted",
    extraction: [
      { field: { fr: "Dividendes bruts", en: "Gross dividends" }, value: "21 500,00 SEK eq." },
      { field: { fr: "Retenue (30 %)", en: "Withholding (30%)" }, value: "6 450,00 SEK eq." },
    ],
  },
  {
    id: "doc-5",
    entityId: "ent-perso",
    name: "avis-imposition-2025.pdf",
    kind: { fr: "Avis d'imposition", en: "Tax assessment notice" },
    uploadedOn: "2026-07-02",
    status: "processing",
  },
];

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: "msg-1",
    from: "client",
    authorLabel: { fr: "Vous", en: "You" },
    date: "2026-07-03",
    body: {
      fr: "Bonjour, mon dossier suisse est « en instruction » depuis février. Est-ce normal que ce soit si long ?",
      en: "Hello, my Swiss claim has been 'under review' since February. Is it normal for it to take this long?",
    },
  },
  {
    id: "msg-2",
    from: "assistant",
    authorLabel: { fr: "Assistant FiscalPlace", en: "FiscalPlace Assistant" },
    date: "2026-07-03",
    body: {
      fr: "Oui, c'est dans la norme : l'AFC suisse instruit actuellement les demandes en 4 à 8 mois. Votre dossier FP-2417 a été déposé le 18 février — nous sommes au 5e mois. Nous relançons automatiquement l'administration si aucune réponse n'arrive d'ici fin août, et vous serez notifié·e au moindre changement. Souhaitez-vous qu'un membre de l'équipe vous rappelle ?",
      en: "Yes, this is within the norm: the Swiss FTA currently processes claims in 4 to 8 months. Your claim FP-2417 was filed on 18 February — we are in month 5. We chase the administration automatically if no reply arrives by the end of August, and you will be notified of any change. Would you like a team member to call you back?",
    },
  },
  {
    id: "msg-3",
    from: "client",
    authorLabel: { fr: "Vous", en: "You" },
    date: "2026-07-03",
    body: {
      fr: "Non merci, c'est très clair. Une dernière chose : la commission sera bien prélevée seulement à la fin ?",
      en: "No thanks, that's very clear. One last thing: the fee is only charged at the end, right?",
    },
  },
  {
    id: "msg-4",
    from: "team",
    authorLabel: { fr: "Équipe FiscalPlace", en: "FiscalPlace Team" },
    date: "2026-07-04",
    body: {
      fr: "Exactement : rien n'est facturé tant que le remboursement n'est pas effectivement reçu. Pour ~2 840 € récupérés, la commission serait de 686,20 € selon la grille publique, et vous recevriez ~2 153,80 € net. Le détail figurera ligne à ligne sur votre facture, débours inclus.",
      en: "Exactly: nothing is billed until the refund is actually received. For ~€2,840 recovered, the fee would be €686.20 per the public grid, and you would receive ~€2,153.80 net. The line-by-line detail will appear on your invoice, disbursements included.",
    },
  },
];

export const DEMO_INVOICES: DemoInvoice[] = [
  {
    id: "inv-1",
    number: "FP-2026-0611",
    date: "2026-06-05",
    entityId: "ent-perso",
    label: {
      fr: "Commission au succès — dossier FP-2238 (Allemagne)",
      en: "Success fee — claim FP-2238 (Germany)",
    },
    amount: 291.15,
    status: "deducted",
    lines: [
      {
        label: {
          fr: "Commission (25 % × 1 115 € — tranche 0–2 500 €)",
          en: "Fee (25% × €1,115 — 0–€2,500 tier)",
        },
        amount: 278.75,
      },
      {
        label: {
          fr: "Débours refacturés à prix coûtant (envoi postal certifié BZSt)",
          en: "Disbursements at cost (certified mail to BZSt)",
        },
        amount: 12.4,
      },
    ],
  },
  {
    id: "inv-2",
    number: "FP-2026-0402",
    date: "2026-04-01",
    entityId: "ent-holding",
    label: {
      fr: "Abonnement Suivi & Alertes — SC Horizon Patrimoine (annuel)",
      en: "Monitoring & Alerts subscription — SC Horizon Patrimoine (yearly)",
    },
    amount: 149,
    status: "paid",
    lines: [
      {
        label: { fr: "Abonnement annuel, 1 portefeuille", en: "Yearly subscription, 1 portfolio" },
        amount: 149,
      },
    ],
  },
];

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "not-1",
    date: "2026-07-05",
    kind: "action",
    claimId: "FP-2602",
    body: {
      fr: "Dossier FP-2602 (Irlande) : votre mandat attend votre signature électronique.",
      en: "Claim FP-2602 (Ireland): your mandate is awaiting your electronic signature.",
    },
    read: false,
  },
  {
    id: "not-2",
    date: "2026-07-01",
    kind: "deadline",
    claimId: "FP-2551",
    body: {
      fr: "Dossier FP-2551 (Canada) : prescription le 31/12/2026 — document manquant, traitement prioritaire activé.",
      en: "Claim FP-2551 (Canada): statute of limitations on 31/12/2026 — missing document, priority handling activated.",
    },
    read: false,
  },
  {
    id: "not-3",
    date: "2026-06-30",
    kind: "status",
    claimId: "FP-2588",
    body: {
      fr: "Dossier FP-2588 (Suède) : déposé auprès du Skatteverket.",
      en: "Claim FP-2588 (Sweden): filed with Skatteverket.",
    },
    read: true,
  },
  {
    id: "not-4",
    date: "2026-06-05",
    kind: "payment",
    claimId: "FP-2238",
    body: {
      fr: "Dossier FP-2238 (Allemagne) : 823,85 € nets versés sur votre compte se terminant par ••42.",
      en: "Claim FP-2238 (Germany): €823.85 net paid to your account ending ••42.",
    },
    read: true,
  },
];

// Referral commissions = PRICING.partnerRevShare × success fee actually collected.
export const DEMO_REFERRALS: DemoReferral[] = [
  { client: { fr: "M. B. (Lyon)", en: "Mr B. (Lyon)" }, joined: "2026-03-14", claims: 2, recovered: 4_310, commission: 190.16 },
  { client: { fr: "Mme R. (Bordeaux)", en: "Ms R. (Bordeaux)" }, joined: "2026-05-02", claims: 1, recovered: 0, commission: 0 },
  { client: { fr: "SCI T. (Paris)", en: "SCI T. (Paris)" }, joined: "2026-06-18", claims: 3, recovered: 1_950, commission: 97.5 },
];
