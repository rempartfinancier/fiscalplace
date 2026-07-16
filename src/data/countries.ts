import type { Localized } from "@/lib/i18n";

/**
 * COUNTRY TAX DATABASE — isolated, versioned data module.
 *
 * Treaty rates and statutes of limitations change over time. This module is the
 * ONLY place such figures may live: application logic and page copy must import
 * from here, never restate values. Each entry carries `lastReviewed`; the UI
 * must always display figures as indicative and show the review date.
 *
 * DATA STATUS: figures below reflect commonly documented rates and deadlines as
 * of the review date, assembled for launch. They MUST be re-verified by a tax
 * professional before any real client communication. Fields flagged `verify`
 * carry known uncertainty.
 */

export const DATA_VERSION = "2026-07.1";

/** Residences supported by the simulator. "OTHER" = generic treaty-country fallback. */
export const RESIDENCES = ["FR", "BE", "LU", "CH", "OTHER"] as const;
export type Residence = (typeof RESIDENCES)[number];

export const RESIDENCE_LABELS: Record<Residence, Localized<string>> = {
  FR: { fr: "France", en: "France" },
  BE: { fr: "Belgique", en: "Belgium" },
  LU: { fr: "Luxembourg", en: "Luxembourg" },
  CH: { fr: "Suisse", en: "Switzerland" },
  OTHER: { fr: "Autre pays conventionné", en: "Other treaty country" },
};

export type SolRule = "calendar-year-end" | "anniversary";
export type RecoveryPotential = "high" | "medium" | "low" | "none";

export interface CountryTaxProfile {
  /** ISO 3166-1 alpha-2 of the source country. */
  id: string;
  slug: Localized<string>;
  name: Localized<string>;
  flag: string;
  /** Statutory withholding rate applied by default to non-residents (0–1). */
  statutoryRate: number;
  /** Treaty rate: default for portfolio individual investors + residence overrides (0–1). */
  treatyRate: { default: number; byResidence?: Partial<Record<Residence, number>> };
  /** Statute of limitations for standard refund claims. */
  sol: { years: number; rule: SolRule; verify?: boolean; notes: Localized<string> };
  /** Is relief at source practically achievable for an individual investor? */
  reliefAtSource: boolean;
  /** Does the source administration accept electronic filing? */
  onlineFiling: boolean;
  refundForm: Localized<string>;
  authority: Localized<string>;
  docsRequired: Localized<string[]>;
  specifics: Localized<string[]>;
  recoveryPotential: RecoveryPotential;
  lastReviewed: string;
}

export const COUNTRIES: CountryTaxProfile[] = [
  {
    id: "US",
    slug: { fr: "etats-unis", en: "united-states" },
    name: { fr: "États-Unis", en: "United States" },
    flag: "🇺🇸",
    statutoryRate: 0.3,
    treatyRate: { default: 0.15 },
    sol: {
      years: 3,
      rule: "anniversary",
      notes: {
        fr: "En règle générale, 3 ans à compter du prélèvement pour déposer une demande de remboursement auprès de l'IRS (règle simplifiée : le calcul exact dépend de la date de dépôt de la déclaration).",
        en: "As a general rule, 3 years from the withholding date to file a refund claim with the IRS (simplified: the exact computation depends on the return filing date).",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "1040-NR", en: "1040-NR" },
    authority: { fr: "IRS (Internal Revenue Service)", en: "IRS (Internal Revenue Service)" },
    docsRequired: {
      fr: [
        "Formulaire W-8BEN valide (ou W-8BEN-E pour une entité)",
        "Relevés de courtage détaillant les dividendes et la retenue prélevée",
        "Certificat de résidence fiscale du pays de résidence",
        "ITIN dans certains cas de demande de remboursement a posteriori",
      ],
      en: [
        "Valid W-8BEN form (or W-8BEN-E for an entity)",
        "Brokerage statements showing dividends and tax withheld",
        "Certificate of tax residence from your country of residence",
        "An ITIN in some after-the-fact refund scenarios",
      ],
    },
    specifics: {
      fr: [
        "Le levier principal est préventif : un W-8BEN valide auprès de votre courtier ramène la retenue de 30 % à 15 % dès le versement (relief at source).",
        "La récupération a posteriori concerne surtout les périodes où aucun W-8BEN valide n'était en place, ou les erreurs d'application du taux.",
        "Le W-8BEN expire à la fin de la 3e année civile suivant sa signature : un renouvellement oublié fait rebasculer au taux plein.",
        "Les frais de dépositaire sur ADR sont distincts de la retenue à la source et ne sont pas récupérables par cette voie.",
      ],
      en: [
        "The main lever is preventive: a valid W-8BEN with your broker cuts withholding from 30% to 15% at payment time (relief at source).",
        "After-the-fact recovery mostly covers periods with no valid W-8BEN in place, or misapplied rates.",
        "A W-8BEN expires at the end of the third calendar year after signature: a missed renewal silently reverts you to the full rate.",
        "ADR depositary fees are separate from withholding tax and cannot be recovered through this route.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-06-15",
  },
  {
    id: "CH",
    slug: { fr: "suisse", en: "switzerland" },
    name: { fr: "Suisse", en: "Switzerland" },
    flag: "🇨🇭",
    statutoryRate: 0.35,
    treatyRate: { default: 0.15 },
    sol: {
      years: 3,
      rule: "calendar-year-end",
      notes: {
        fr: "3 ans à compter de la fin de l'année civile au cours de laquelle le dividende est arrivé à échéance.",
        en: "3 years from the end of the calendar year in which the dividend fell due.",
      },
    },
    reliefAtSource: false,
    onlineFiling: true,
    refundForm: { fr: "Formulaire 83 (résidents de France)", en: "Form 83 (French residents)" },
    authority: {
      fr: "Administration fédérale des contributions (AFC)",
      en: "Swiss Federal Tax Administration (FTA)",
    },
    docsRequired: {
      fr: [
        "Attestation de résidence fiscale visée par votre centre des impôts",
        "Relevés bancaires ou de courtage justifiant l'encaissement des dividendes",
        "Tax vouchers / justificatifs de l'impôt anticipé prélevé",
        "Mandat autorisant FiscalPlace à agir auprès de l'AFC",
      ],
      en: [
        "Certificate of tax residence stamped by your local tax office",
        "Bank or brokerage statements evidencing the dividend payments",
        "Tax vouchers evidencing the withholding tax levied",
        "A mandate authorising FiscalPlace to act before the FTA",
      ],
    },
    specifics: {
      fr: [
        "L'écart de 20 points (35 % retenus, 15 % dus) fait de la Suisse le gisement de récupération le plus important en Europe pour un investisseur français.",
        "Le dépôt s'effectue désormais en ligne : l'AFC a rendu la procédure électronique obligatoire courant 2025.",
        "Pas de relief at source pour un particulier : la récupération a posteriori est le passage obligé.",
        "Trois demandes maximum par an et par demandeur : le regroupement des dividendes en une demande annuelle est la pratique recommandée.",
      ],
      en: [
        "The 20-point gap (35% withheld, 15% owed) makes Switzerland the largest recovery pool in Europe for a French investor.",
        "Filing is now electronic: the FTA made online submission mandatory during 2025.",
        "No relief at source for individuals: the after-the-fact refund is the only route.",
        "A maximum of three claims per year per claimant: bundling dividends into one annual claim is the recommended practice.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-06-15",
  },
  {
    id: "DE",
    slug: { fr: "allemagne", en: "germany" },
    name: { fr: "Allemagne", en: "Germany" },
    flag: "🇩🇪",
    statutoryRate: 0.26375,
    treatyRate: { default: 0.15 },
    sol: {
      years: 4,
      rule: "calendar-year-end",
      notes: {
        fr: "4 ans à compter de la fin de l'année civile du versement du dividende, en règle générale.",
        en: "4 years from the end of the calendar year of the dividend payment, as a general rule.",
      },
    },
    reliefAtSource: false,
    onlineFiling: true,
    refundForm: { fr: "Demande BZSt (portail en ligne)", en: "BZSt claim (online portal)" },
    authority: {
      fr: "Bundeszentralamt für Steuern (BZSt)",
      en: "Federal Central Tax Office (BZSt)",
    },
    docsRequired: {
      fr: [
        "Certificat de résidence fiscale sur le formulaire allemand, visé par votre administration",
        "Attestations de détention des titres (Depotbestätigung) et justificatifs de la retenue",
        "Tax vouchers originaux émis par le dépositaire allemand",
        "Mandat de représentation",
      ],
      en: [
        "Certificate of tax residence on the German form, stamped by your tax administration",
        "Custody confirmations (Depotbestätigung) and withholding evidence",
        "Original tax vouchers issued by the German custodian",
        "A representation mandate",
      ],
    },
    specifics: {
      fr: [
        "Le taux de 26,375 % combine l'impôt de 25 % et la contribution de solidarité de 5,5 % assise sur celui-ci.",
        "Le BZSt exige des justificatifs de chaîne de détention précis : c'est l'un des dossiers les plus exigeants sur la qualité documentaire.",
        "La procédure passe par le portail en ligne du BZSt, avec des délais d'instruction qui dépassent fréquemment 12 mois.",
      ],
      en: [
        "The 26.375% rate combines the 25% tax and the 5.5% solidarity surcharge computed on it.",
        "The BZSt requires precise chain-of-custody evidence: one of the most demanding files in terms of documentation quality.",
        "Filing goes through the BZSt online portal, with processing times frequently exceeding 12 months.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-06-15",
  },
  {
    id: "GB",
    slug: { fr: "royaume-uni", en: "united-kingdom" },
    name: { fr: "Royaume-Uni", en: "United Kingdom" },
    flag: "🇬🇧",
    statutoryRate: 0,
    treatyRate: { default: 0 },
    sol: {
      years: 4,
      rule: "calendar-year-end",
      verify: true,
      notes: {
        fr: "4 ans en règle générale pour les trop-perçus, décomptés par année fiscale britannique (qui se termine le 5 avril, pas le 31 décembre).",
        en: "4 years as a general rule for overpayments, counted by UK tax year (which ends on 5 April, not 31 December).",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "—", en: "—" },
    authority: { fr: "HM Revenue & Customs (HMRC)", en: "HM Revenue & Customs (HMRC)" },
    docsRequired: {
      fr: [
        "Aucun dossier de récupération n'est nécessaire pour les dividendes ordinaires : il n'y a rien à récupérer",
        "Pour les distributions de REIT (PID) : justificatifs de la retenue de 20 % et certificat de résidence",
      ],
      en: [
        "No recovery file is needed for ordinary dividends: there is nothing to recover",
        "For REIT distributions (PIDs): evidence of the 20% withholding and a certificate of residence",
      ],
    },
    specifics: {
      fr: [
        "Le Royaume-Uni ne prélève pas de retenue à la source sur les dividendes ordinaires : si votre courtier a retenu quelque chose sur une action britannique classique, c'est une anomalie à examiner, pas une fatalité.",
        "Exception notable : les distributions immobilières des REIT (Property Income Distributions) supportent 20 %, souvent réductibles à 15 % par convention.",
        "Attention aussi aux titres à double cotation : un titre « britannique » peut en réalité distribuer depuis une autre juridiction.",
      ],
      en: [
        "The UK levies no withholding tax on ordinary dividends: if your broker withheld something on a standard UK share, that is an anomaly worth examining, not a given.",
        "Notable exception: REIT Property Income Distributions bear 20%, often reducible to 15% by treaty.",
        "Watch dual-listed securities too: a 'UK' stock may actually distribute from another jurisdiction.",
      ],
    },
    recoveryPotential: "none",
    lastReviewed: "2026-06-15",
  },
  {
    id: "NL",
    slug: { fr: "pays-bas", en: "netherlands" },
    name: { fr: "Pays-Bas", en: "Netherlands" },
    flag: "🇳🇱",
    statutoryRate: 0.15,
    treatyRate: { default: 0.15 },
    sol: {
      years: 3,
      rule: "calendar-year-end",
      verify: true,
      notes: {
        fr: "3 ans à compter de la fin de l'année civile du versement, en règle générale (des délais plus longs existent dans certaines configurations — donnée à confirmer selon votre cas).",
        en: "3 years from the end of the calendar year of payment, as a general rule (longer periods exist in some configurations — to be confirmed for your case).",
      },
    },
    reliefAtSource: false,
    onlineFiling: true,
    refundForm: { fr: "Demande Belastingdienst", en: "Belastingdienst claim" },
    authority: { fr: "Belastingdienst", en: "Belastingdienst (Dutch Tax Administration)" },
    docsRequired: {
      fr: [
        "Certificat de résidence fiscale",
        "Justificatifs des dividendes et de la retenue de 15 %",
        "Le cas échéant, éléments prouvant un statut ouvrant droit à mieux que 15 % (fonds, organisme exonéré…)",
      ],
      en: [
        "Certificate of tax residence",
        "Evidence of the dividends and the 15% withholding",
        "Where relevant, evidence of a status entitling you to better than 15% (fund, exempt body…)",
      ],
    },
    specifics: {
      fr: [
        "Cas honnête à connaître : pour un particulier résident de France, le taux néerlandais de 15 % correspond déjà au taux conventionnel — il n'y a en général rien à récupérer.",
        "Le potentiel existe pour certains profils (organismes exonérés, fonds, situations de sur-prélèvement technique) : nous le disons clairement plutôt que de vendre un espoir infondé.",
        "C'est l'exemple type de pays où notre diagnostic gratuit conclura souvent « dossier non rentable » — et vous le dira.",
      ],
      en: [
        "An honest case worth knowing: for an individual French resident, the Dutch 15% is already the treaty rate — there is generally nothing to recover.",
        "Potential exists for specific profiles (exempt bodies, funds, technical over-withholding): we say so plainly rather than selling false hope.",
        "This is the textbook country where our free diagnostic will often conclude 'not worth filing' — and will tell you so.",
      ],
    },
    recoveryPotential: "low",
    lastReviewed: "2026-06-15",
  },
  {
    id: "CA",
    slug: { fr: "canada", en: "canada" },
    name: { fr: "Canada", en: "Canada" },
    flag: "🇨🇦",
    statutoryRate: 0.25,
    treatyRate: { default: 0.15 },
    sol: {
      years: 2,
      rule: "calendar-year-end",
      notes: {
        fr: "2 ans seulement à compter de la fin de l'année civile du prélèvement (formulaire NR7-R) : l'un des délais les plus courts du panel.",
        en: "Only 2 years from the end of the calendar year of withholding (form NR7-R): one of the shortest deadlines in our panel.",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "NR7-R", en: "NR7-R" },
    authority: { fr: "Agence du revenu du Canada (ARC)", en: "Canada Revenue Agency (CRA)" },
    docsRequired: {
      fr: [
        "Formulaire NR7-R complété",
        "Justificatifs des dividendes et de la retenue (relevés, feuillets NR4 le cas échéant)",
        "Certificat de résidence fiscale",
        "Mandat de représentation",
      ],
      en: [
        "Completed NR7-R form",
        "Evidence of dividends and withholding (statements, NR4 slips where applicable)",
        "Certificate of tax residence",
        "A representation mandate",
      ],
    },
    specifics: {
      fr: [
        "Le délai de 2 ans est le vrai piège canadien : beaucoup de trop-perçus se prescrivent avant même que l'investisseur ait réalisé qu'il pouvait réclamer.",
        "Un courtier bien paramétré peut appliquer 15 % à la source ; en pratique, les comptes multi-dépositaires passent souvent à travers.",
        "La procédure reste papier : la qualité du dossier initial conditionne fortement le délai de traitement.",
      ],
      en: [
        "The 2-year deadline is the real Canadian trap: many overpayments expire before the investor even realises a claim was possible.",
        "A well-configured broker can apply 15% at source; in practice, multi-custodian accounts often slip through.",
        "The procedure is still paper-based: initial file quality strongly drives processing time.",
      ],
    },
    recoveryPotential: "medium",
    lastReviewed: "2026-06-15",
  },
  {
    id: "JP",
    slug: { fr: "japon", en: "japan" },
    name: { fr: "Japon", en: "Japan" },
    flag: "🇯🇵",
    statutoryRate: 0.15315,
    treatyRate: { default: 0.1, byResidence: { OTHER: 0.15 } },
    sol: {
      years: 5,
      rule: "anniversary",
      notes: {
        fr: "5 ans à compter du lendemain de la date de versement, en règle générale.",
        en: "5 years from the day after the payment date, as a general rule.",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "Formulaire 1 (relief) / demande de remboursement via l'agent payeur", en: "Form 1 (relief) / refund claim via the paying agent" },
    authority: { fr: "National Tax Agency (NTA)", en: "National Tax Agency (NTA)" },
    docsRequired: {
      fr: [
        "Formulaire conventionnel japonais visé par l'administration du pays de résidence",
        "Justificatifs de la chaîne de paiement (l'agent payeur japonais est un passage obligé)",
        "Certificat de résidence fiscale",
      ],
      en: [
        "Japanese treaty form stamped by your residence-country administration",
        "Evidence of the payment chain (the Japanese paying agent is a mandatory intermediary)",
        "Certificate of tax residence",
      ],
    },
    specifics: {
      fr: [
        "L'écart est modeste (15,315 % retenus contre souvent 10 % dus pour un résident de France) mais s'accumule vite sur un portefeuille distribuant régulièrement.",
        "La procédure transite par l'agent payeur japonais et reste largement papier : c'est un dossier à friction élevée, que notre automatisation absorbe mais qui reste plus lent que la moyenne.",
        "Le taux statutaire inclut la surtaxe de reconstruction (2,1 % de l'impôt), d'où le chiffre non rond de 15,315 %.",
      ],
      en: [
        "The gap is modest (15.315% withheld vs often 10% owed for a French resident) but compounds quickly on a regularly distributing portfolio.",
        "The procedure runs through the Japanese paying agent and remains largely paper-based: a high-friction file that our automation absorbs, but slower than average.",
        "The statutory rate includes the reconstruction surtax (2.1% of the tax), hence the non-round 15.315%.",
      ],
    },
    recoveryPotential: "medium",
    lastReviewed: "2026-06-15",
  },
  {
    id: "AU",
    slug: { fr: "australie", en: "australia" },
    name: { fr: "Australie", en: "Australia" },
    flag: "🇦🇺",
    statutoryRate: 0.3,
    treatyRate: { default: 0.15 },
    sol: {
      years: 4,
      rule: "calendar-year-end",
      verify: true,
      notes: {
        fr: "4 ans en règle générale — l'année fiscale australienne se termine le 30 juin, ce qui décale les décomptes usuels.",
        en: "4 years as a general rule — the Australian tax year ends on 30 June, which shifts the usual counting.",
      },
    },
    reliefAtSource: true,
    onlineFiling: true,
    refundForm: { fr: "Demande ATO", en: "ATO claim" },
    authority: { fr: "Australian Taxation Office (ATO)", en: "Australian Taxation Office (ATO)" },
    docsRequired: {
      fr: [
        "Relevés distinguant dividendes « franked » et « unfranked »",
        "Justificatifs de la retenue prélevée sur la part unfranked",
        "Certificat de résidence fiscale",
      ],
      en: [
        "Statements separating franked and unfranked dividends",
        "Evidence of withholding on the unfranked portion",
        "Certificate of tax residence",
      ],
    },
    specifics: {
      fr: [
        "Particularité australienne : les dividendes « fully franked » (adossés à de l'impôt sur les sociétés déjà payé) ne supportent aucune retenue — il n'y a alors rien à récupérer.",
        "Seule la part « unfranked » est retenue à 30 %, réductible à 15 % par convention : le diagnostic ligne à ligne est indispensable.",
        "Les crédits d'imputation (franking credits) ne sont pas remboursables aux non-résidents : personne ne peut les « récupérer » pour vous, et quiconque le promet se trompe.",
      ],
      en: [
        "Australian particularity: fully franked dividends (backed by corporate tax already paid) bear no withholding — there is nothing to recover on them.",
        "Only the unfranked portion is withheld at 30%, reducible to 15% by treaty: line-by-line diagnosis is essential.",
        "Franking credits are not refundable to non-residents: nobody can 'recover' them for you, and anyone promising that is wrong.",
      ],
    },
    recoveryPotential: "medium",
    lastReviewed: "2026-06-15",
  },
  {
    id: "IE",
    slug: { fr: "irlande", en: "ireland" },
    name: { fr: "Irlande", en: "Ireland" },
    flag: "🇮🇪",
    statutoryRate: 0.25,
    treatyRate: { default: 0 },
    sol: {
      years: 4,
      rule: "calendar-year-end",
      notes: {
        fr: "4 ans à compter de la fin de l'année du versement du dividende.",
        en: "4 years from the end of the year in which the dividend was paid.",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "Demande de remboursement DWT (Revenue)", en: "DWT refund claim (Revenue)" },
    authority: { fr: "Irish Revenue", en: "Irish Revenue" },
    docsRequired: {
      fr: [
        "Déclaration de non-résidence (formulaire d'exemption DWT) pour l'avenir",
        "Justificatifs des dividendes et de la retenue de 25 % pour le passé",
        "Certificat de résidence fiscale",
      ],
      en: [
        "Non-resident declaration (DWT exemption form) going forward",
        "Evidence of dividends and the 25% withholding for the past",
        "Certificate of tax residence",
      ],
    },
    specifics: {
      fr: [
        "Le cas irlandais est le plus spectaculaire du panel : un résident d'un pays conventionné peut prétendre à une exonération totale — les 25 points retenus sont intégralement récupérables.",
        "Une déclaration d'exemption correctement déposée supprime la retenue sur tous les dividendes futurs : la prévention vaut ici autant que la récupération.",
        "Dossier fréquent chez les détenteurs d'actions Accenture, Medtronic, CRH ou de trackers domiciliés hors Irlande mais investis en titres irlandais.",
      ],
      en: [
        "The Irish case is the most spectacular in our panel: a treaty-country resident can claim full exemption — the 25 withheld points are entirely recoverable.",
        "A properly filed exemption declaration removes withholding on all future dividends: prevention is worth as much as recovery here.",
        "A frequent file for holders of Accenture, Medtronic, CRH shares, or of trackers domiciled outside Ireland but invested in Irish stocks.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-06-15",
  },
  {
    id: "AT",
    slug: { fr: "autriche", en: "austria" },
    name: { fr: "Autriche", en: "Austria" },
    flag: "🇦🇹",
    statutoryRate: 0.275,
    treatyRate: { default: 0.15 },
    sol: {
      years: 5,
      rule: "calendar-year-end",
      notes: {
        fr: "5 ans à compter de la fin de l'année civile du prélèvement — l'un des délais les plus confortables d'Europe.",
        en: "5 years from the end of the calendar year of withholding — one of the most comfortable deadlines in Europe.",
      },
    },
    reliefAtSource: false,
    onlineFiling: true,
    refundForm: { fr: "ZS-RD1 (pré-déclaration en ligne)", en: "ZS-RD1 (online pre-filing)" },
    authority: { fr: "Finanzamt für Großbetriebe", en: "Finanzamt für Großbetriebe (Austrian tax office)" },
    docsRequired: {
      fr: [
        "Formulaire ZS-RD1 avec pré-déclaration électronique",
        "Certificat de résidence fiscale visé",
        "Justificatifs des dividendes et de la retenue de 27,5 %",
      ],
      en: [
        "ZS-RD1 form with electronic pre-filing",
        "Stamped certificate of tax residence",
        "Evidence of dividends and the 27.5% withholding",
      ],
    },
    specifics: {
      fr: [
        "12,5 points d'écart (27,5 % retenus, 15 % dus) et 5 ans pour agir : l'Autriche est un dossier au rapport effort/gain très favorable.",
        "La procédure combine une pré-déclaration en ligne et un envoi papier signé : notre pipeline génère les deux automatiquement.",
        "Depuis 2018, la demande de remboursement doit être précédée d'une pré-notification électronique (« DIAG ») déposée via le site du ministère des Finances autrichien : elle ne peut être transmise qu'à partir du 1er janvier de l'année suivant le versement, et la demande de remboursement elle-même doit être déposée au plus tard 5 ans après.",
      ],
      en: [
        "A 12.5-point gap (27.5% withheld, 15% owed) and 5 years to act: Austria offers a very favourable effort-to-gain ratio.",
        "The procedure combines an online pre-filing and a signed paper submission: our pipeline generates both automatically.",
        "Since 2018, the refund claim must be preceded by an electronic pre-notification (\"DIAG\") filed via the Austrian Ministry of Finance website: it cannot be submitted before 1 January of the year following payment, and the refund claim itself must be filed within 5 years after that.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-07-15",
  },
  {
    id: "SE",
    slug: { fr: "suede", en: "sweden" },
    name: { fr: "Suède", en: "Sweden" },
    flag: "🇸🇪",
    statutoryRate: 0.3,
    treatyRate: { default: 0.15 },
    sol: {
      years: 5,
      rule: "calendar-year-end",
      notes: {
        fr: "5 ans à compter de la fin de l'année civile du versement — délai confirmé directement par le Skatteverket : la demande doit lui parvenir avant la fin de la 5e année suivant le versement.",
        en: "5 years from the end of the calendar year of payment — confirmed directly by Skatteverket: the claim must reach them before the end of the 5th year following payment.",
      },
    },
    reliefAtSource: false,
    onlineFiling: false,
    refundForm: { fr: "SKV 3740", en: "SKV 3740" },
    authority: { fr: "Skatteverket", en: "Skatteverket (Swedish Tax Agency)" },
    docsRequired: {
      fr: [
        "Formulaire SKV 3740",
        "Certificat de résidence fiscale",
        "Justificatifs des dividendes suédois et de la retenue de 30 %",
      ],
      en: [
        "SKV 3740 form",
        "Certificate of tax residence",
        "Evidence of the Swedish dividends and the 30% withholding",
      ],
    },
    specifics: {
      fr: [
        "15 points d'écart sur des valeurs à dividendes réguliers (Volvo, Investor AB, banques nordiques) : les montants s'accumulent vite.",
        "Le Skatteverket est réputé pour ses réponses relativement rapides comparées à d'autres administrations du panel.",
        "Contrairement à d'autres pays du panel, le formulaire SKV 3740 ne se dépose pas en ligne : il doit être envoyé signé, par courrier postal, au service Kupongskatt du Skatteverket — une téléprocédure est à l'étude côté suédois mais n'existe pas encore à ce jour.",
      ],
      en: [
        "A 15-point gap on regular dividend payers (Volvo, Investor AB, Nordic banks): amounts add up quickly.",
        "Skatteverket is known for relatively fast responses compared with other administrations in our panel.",
        "Unlike some other countries in our panel, form SKV 3740 cannot be filed online: it must be signed and sent by post to Skatteverket's Kupongskatt unit — an electronic filing option is reportedly under consideration on the Swedish side but does not exist yet.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-07-15",
  },
  {
    id: "IT",
    slug: { fr: "italie", en: "italy" },
    name: { fr: "Italie", en: "Italy" },
    flag: "🇮🇹",
    statutoryRate: 0.26,
    treatyRate: { default: 0.15 },
    sol: {
      years: 4,
      rule: "anniversary",
      notes: {
        fr: "48 mois (4 ans) à compter de la date du prélèvement, en règle générale : chaque ligne de dividende a sa propre date limite.",
        en: "48 months (4 years) from the withholding date, as a general rule: each dividend line has its own deadline.",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "Modello A (dividendes)", en: "Form A (dividends)" },
    authority: {
      fr: "Agenzia delle Entrate — Centre opérationnel de Pescara",
      en: "Agenzia delle Entrate — Pescara Operations Centre",
    },
    docsRequired: {
      fr: [
        "Formulaire italien de remboursement (Modello A) avec attestation de résidence intégrée, visée par votre administration",
        "Justificatifs des dividendes et de la retenue de 26 % (relevés, tax vouchers)",
        "Attestation de bénéficiaire effectif des dividendes",
        "Mandat de représentation",
      ],
      en: [
        "Italian refund form (Form A) with the embedded residence certification, stamped by your administration",
        "Evidence of the dividends and the 26% withholding (statements, tax vouchers)",
        "Beneficial-ownership attestation for the dividends",
        "A representation mandate",
      ],
    },
    specifics: {
      fr: [
        "11 points d'écart (26 % retenus, 15 % dus) sur des valeurs très présentes dans les portefeuilles (ENI, Enel, Intesa, Generali…).",
        "L'instruction italienne est la plus lente du panel : plusieurs années d'attente sont fréquentes — des intérêts moratoires s'ajoutent aux remboursements tardifs.",
        "Le taux réduit à la source existe en théorie via le dépositaire, mais reste rarement accessible à un particulier passant par un courtier en ligne : la récupération a posteriori est la voie usuelle.",
        "La procédure demeure papier, auprès du centre opérationnel de Pescara : la qualité du dossier initial est déterminante.",
      ],
      en: [
        "An 11-point gap (26% withheld, 15% owed) on names most portfolios hold (ENI, Enel, Intesa, Generali…).",
        "Italian processing is the slowest in the panel: multi-year waits are common — late refunds accrue statutory interest.",
        "Relief at source exists in theory via the custodian but is rarely available to an individual using an online broker: the after-the-fact refund is the usual route.",
        "The procedure is still paper-based, with the Pescara Operations Centre: initial file quality is decisive.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-07-12",
  },
  {
    id: "ES",
    slug: { fr: "espagne", en: "spain" },
    name: { fr: "Espagne", en: "Spain" },
    flag: "🇪🇸",
    statutoryRate: 0.19,
    treatyRate: { default: 0.15 },
    sol: {
      years: 4,
      rule: "calendar-year-end",
      verify: true,
      notes: {
        fr: "4 ans en règle générale, décomptés à partir de la fin de la période de dépôt du Modelo 210 — le point de départ exact dépend de la date du prélèvement (donnée à confirmer selon votre cas).",
        en: "4 years as a general rule, counted from the end of the Modelo 210 filing window — the exact starting point depends on the withholding date (to be confirmed for your case).",
      },
    },
    reliefAtSource: true,
    onlineFiling: true,
    refundForm: { fr: "Modelo 210", en: "Modelo 210" },
    authority: { fr: "Agencia Tributaria (AEAT)", en: "Agencia Tributaria (AEAT)" },
    docsRequired: {
      fr: [
        "Certificat de résidence fiscale récent, au sens de la convention",
        "Justificatifs des dividendes espagnols et de la retenue de 19 %",
        "Identifiant fiscal pour le dépôt du Modelo 210",
        "Coordonnées bancaires pour le virement du remboursement",
      ],
      en: [
        "Recent certificate of tax residence, within the meaning of the treaty",
        "Evidence of the Spanish dividends and the 19% withholding",
        "A tax identifier for the Modelo 210 filing",
        "Bank details for the refund transfer",
      ],
    },
    specifics: {
      fr: [
        "L'écart espagnol est modeste : 4 points (19 % retenus, 15 % dus). Sur de petits dividendes, notre diagnostic conclura parfois « dossier non rentable » — et vous le dira.",
        "Le vrai point de friction n'est pas le formulaire mais l'identifiant fiscal exigé pour déposer le Modelo 210 : c'est lui qui décourage le fait-maison.",
        "Particularité locale : les grandes valeurs espagnoles distribuent souvent en « scrip dividend » — la part servie en actions ne subit pas de retenue, seule la part en espèces en subit une.",
      ],
      en: [
        "The Spanish gap is modest: 4 points (19% withheld, 15% owed). On small dividends our diagnostic will sometimes conclude 'not worth filing' — and will tell you so.",
        "The real friction point is not the form but the tax identifier required to file the Modelo 210: that is what defeats most do-it-yourself attempts.",
        "Local quirk: large Spanish names often pay 'scrip dividends' — the portion served in shares bears no withholding, only the cash portion does.",
      ],
    },
    recoveryPotential: "medium",
    lastReviewed: "2026-07-12",
  },
  {
    id: "BE",
    slug: { fr: "belgique", en: "belgium" },
    name: { fr: "Belgique", en: "Belgium" },
    flag: "🇧🇪",
    statutoryRate: 0.3,
    treatyRate: { default: 0.15, byResidence: { BE: 0.3 } },
    sol: {
      years: 4,
      rule: "calendar-year-end",
      verify: true,
      notes: {
        fr: "5 ans à compter du 1er janvier de l'année du prélèvement — soit, en pratique, jusqu'au 31 décembre de la 4e année suivant le versement.",
        en: "5 years from 1 January of the withholding year — in practice, until 31 December of the 4th year after payment.",
      },
    },
    reliefAtSource: false,
    onlineFiling: true,
    refundForm: { fr: "276 Div.-Aut.", en: "276 Div.-Aut." },
    authority: { fr: "SPF Finances", en: "FPS Finance (Belgian tax administration)" },
    docsRequired: {
      fr: [
        "Formulaire 276 Div.-Aut. visé par l'administration fiscale de votre pays de résidence",
        "Justificatifs d'encaissement des dividendes et de la retenue de 30 %",
        "Attestation de détention des titres à la date de mise en paiement",
        "Mandat de représentation",
      ],
      en: [
        "Form 276 Div.-Aut. stamped by the tax administration of your residence country",
        "Evidence of the dividend payments and the 30% withholding",
        "Proof of holding the securities on the payment date",
        "A representation mandate",
      ],
    },
    specifics: {
      fr: [
        "15 points d'écart (30 % retenus, 15 % dus) sur les grandes valeurs belges (KBC, Ageas, Solvay, UCB…) : l'un des gisements les plus rentables du panel.",
        "Le dépôt peut désormais passer par le portail en ligne de l'administration, ce qui raccourcit un circuit historiquement postal.",
        "Cas honnête : pour un résident belge, le précompte mobilier sur ses propres actions belges est un impôt domestique définitif — il n'y a rien à récupérer par la voie conventionnelle.",
      ],
      en: [
        "A 15-point gap (30% withheld, 15% owed) on the big Belgian names (KBC, Ageas, Solvay, UCB…): one of the most profitable pools in the panel.",
        "Filing can now go through the administration's online portal, shortening a historically postal circuit.",
        "Honest case: for a Belgian resident, the withholding on their own Belgian shares is a final domestic tax — there is nothing to recover through the treaty route.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-07-12",
  },
  {
    id: "DK",
    slug: { fr: "danemark", en: "denmark" },
    name: { fr: "Danemark", en: "Denmark" },
    flag: "🇩🇰",
    statutoryRate: 0.27,
    treatyRate: { default: 0.15 },
    sol: {
      years: 3,
      rule: "anniversary",
      verify: true,
      notes: {
        fr: "3 ans à compter du prélèvement, en règle générale (donnée à confirmer lors du diagnostic de votre dossier).",
        en: "3 years from the withholding date, as a general rule (to be confirmed during your file's diagnostic).",
      },
    },
    reliefAtSource: false,
    onlineFiling: true,
    refundForm: { fr: "Formulaire 06.003 (demande en ligne)", en: "Form 06.003 (online claim)" },
    authority: { fr: "Skattestyrelsen", en: "Skattestyrelsen (Danish Tax Agency)" },
    docsRequired: {
      fr: [
        "Certificat de résidence fiscale",
        "Justificatifs des dividendes danois et de la retenue de 27 %",
        "Preuve de la détention des titres à la date de détachement",
        "Coordonnées bancaires et mandat de représentation",
      ],
      en: [
        "Certificate of tax residence",
        "Evidence of the Danish dividends and the 27% withholding",
        "Proof of holding the shares on the ex-date",
        "Bank details and a representation mandate",
      ],
    },
    specifics: {
      fr: [
        "12 points d'écart (27 % retenus, 15 % dus) sur des valeurs recherchées (Novo Nordisk, Ørsted, Maersk…).",
        "Depuis les fraudes massives au remboursement qui ont visé le Danemark, Skattestyrelsen vérifie chaque dossier en profondeur : documentation exigeante et instruction longue — un dossier propre du premier coup fait toute la différence.",
        "Particularité franco-danoise : après plus d'une décennie sans convention fiscale entre la France et le Danemark, une nouvelle convention s'applique aux dividendes récents — les années plus anciennes s'examinent au cas par cas.",
      ],
      en: [
        "A 12-point gap (27% withheld, 15% owed) on sought-after names (Novo Nordisk, Ørsted, Maersk…).",
        "Since the massive refund frauds that targeted Denmark, Skattestyrelsen vets every file in depth: demanding documentation and long processing — a clean first submission makes all the difference.",
        "A French-Danish particularity: after more than a decade without a tax treaty between France and Denmark, a new treaty applies to recent dividends — older years are assessed case by case.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-07-12",
  },
  {
    id: "NO",
    slug: { fr: "norvege", en: "norway" },
    name: { fr: "Norvège", en: "Norway" },
    flag: "🇳🇴",
    statutoryRate: 0.25,
    treatyRate: { default: 0.15 },
    sol: {
      years: 5,
      rule: "calendar-year-end",
      verify: true,
      notes: {
        fr: "5 ans à compter de la fin de l'année du versement, en règle générale (donnée à confirmer lors du diagnostic de votre dossier).",
        en: "5 years from the end of the payment year, as a general rule (to be confirmed during your file's diagnostic).",
      },
    },
    reliefAtSource: true,
    onlineFiling: true,
    refundForm: { fr: "RF-1306 (demande en ligne)", en: "RF-1306 (online claim)" },
    authority: { fr: "Skatteetaten", en: "Skatteetaten (Norwegian Tax Administration)" },
    docsRequired: {
      fr: [
        "Certificat de résidence fiscale au sens de la convention",
        "Justificatifs des dividendes norvégiens et de la retenue de 25 %",
        "Relevés établissant la chaîne de détention des titres",
        "Mandat de représentation",
      ],
      en: [
        "Certificate of tax residence within the meaning of the treaty",
        "Evidence of the Norwegian dividends and the 25% withholding",
        "Statements establishing the custody chain for the securities",
        "A representation mandate",
      ],
    },
    specifics: {
      fr: [
        "10 points d'écart (25 % retenus, 15 % dus) sur les piliers de la cote d'Oslo (Equinor, DNB, Telenor…).",
        "Le taux réduit à la source fonctionne réellement en Norvège quand la chaîne de dépositaires est documentée à l'avance : la prévention est une option sérieuse, pas une promesse théorique.",
        "Pour les particuliers résidents de l'EEE, une voie alternative existe (la déduction dite « d'abri ») qui peut, sur certains profils, faire mieux que le taux conventionnel : nous chiffrons les deux voies avant de déposer.",
      ],
      en: [
        "A 10-point gap (25% withheld, 15% owed) on the pillars of the Oslo exchange (Equinor, DNB, Telenor…).",
        "Relief at source genuinely works in Norway when the custody chain is documented in advance: prevention is a serious option, not a theoretical promise.",
        "For EEA-resident individuals an alternative route exists (the so-called shielding deduction) which can beat the treaty rate on some profiles: we quantify both routes before filing.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-07-12",
  },
  {
    id: "FI",
    slug: { fr: "finlande", en: "finland" },
    name: { fr: "Finlande", en: "Finland" },
    flag: "🇫🇮",
    statutoryRate: 0.3,
    treatyRate: { default: 0.15, byResidence: { FR: 0 } },
    sol: {
      years: 3,
      rule: "calendar-year-end",
      notes: {
        fr: "La demande peut être déposée pendant les 3 années civiles qui suivent l'année du versement du dividende.",
        en: "The claim can be filed during the 3 calendar years following the year of the dividend payment.",
      },
    },
    reliefAtSource: true,
    onlineFiling: true,
    refundForm: { fr: "Formulaire 6164 (particuliers)", en: "Form 6164e (individuals)" },
    authority: {
      fr: "Vero Skatt (administration fiscale finlandaise)",
      en: "Finnish Tax Administration (Vero Skatt)",
    },
    docsRequired: {
      fr: [
        "Certificat de résidence fiscale",
        "Justificatifs des dividendes finlandais et de la retenue prélevée (30 %, parfois 35 %)",
        "Détail des positions à la date de détachement",
        "Mandat de représentation",
      ],
      en: [
        "Certificate of tax residence",
        "Evidence of the Finnish dividends and the withholding levied (30%, sometimes 35%)",
        "Position details on the ex-date",
        "A representation mandate",
      ],
    },
    specifics: {
      fr: [
        "Le cas le plus spectaculaire du panel pour un résident de France : la convention franco-finlandaise réserve l'imposition des dividendes au pays de résidence — 0 % dû en Finlande, l'intégralité des 30 points retenus est récupérable (Nokia, Sampo, Fortum, UPM…).",
        "Quand le dépositaire n'a pas identifié l'investisseur, la retenue grimpe à 35 % : ce sur-prélèvement se récupère aussi.",
        "Le taux réduit à la source existe via les dépositaires enregistrés auprès de l'administration finlandaise, mais reste rare à travers un courtier grand public : la récupération a posteriori est la voie usuelle.",
        "Pour les autres résidences du panel, le taux conventionnel usuel est de 15 % : l'écart reste substantiel, mais sans commune mesure avec le cas français.",
      ],
      en: [
        "The panel's most spectacular case for a French resident: the France–Finland treaty reserves dividend taxation to the residence country — 0% owed in Finland, the full 30 withheld points are recoverable (Nokia, Sampo, Fortum, UPM…).",
        "When the custodian has not identified the investor, withholding climbs to 35%: that extra layer is recoverable too.",
        "Relief at source exists via custodians registered with the Finnish administration but remains rare through a retail broker: the after-the-fact refund is the usual route.",
        "For the panel's other residences the usual treaty rate is 15%: the gap remains substantial, but nowhere near the French case.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-07-12",
  },
  {
    id: "PT",
    slug: { fr: "portugal", en: "portugal" },
    name: { fr: "Portugal", en: "Portugal" },
    flag: "🇵🇹",
    statutoryRate: 0.25,
    treatyRate: { default: 0.15 },
    sol: {
      years: 2,
      rule: "calendar-year-end",
      verify: true,
      notes: {
        fr: "2 ans à compter de la fin de l'année du prélèvement, en règle générale — avec le Canada, l'un des délais les plus courts du panel.",
        en: "2 years from the end of the withholding year, as a general rule — alongside Canada, one of the shortest windows in the panel.",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "Modelo 22-RFI", en: "Form 22-RFI" },
    authority: {
      fr: "Autoridade Tributária e Aduaneira",
      en: "Autoridade Tributária e Aduaneira (Portuguese tax authority)",
    },
    docsRequired: {
      fr: [
        "Formulaire Modelo 22-RFI accompagné d'un certificat de résidence fiscale",
        "Justificatifs des dividendes portugais et de la retenue de 25 %",
        "Identification de l'agent payeur portugais",
        "Mandat de représentation",
      ],
      en: [
        "Form 22-RFI with a certificate of tax residence",
        "Evidence of the Portuguese dividends and the 25% withholding",
        "Identification of the Portuguese paying agent",
        "A representation mandate",
      ],
    },
    specifics: {
      fr: [
        "10 points d'écart (25 % retenus, 15 % dus) sur les valeurs phares de Lisbonne (EDP, Galp, Jerónimo Martins…).",
        "Le délai de 2 ans est le piège portugais : comme au Canada, beaucoup de trop-perçus se prescrivent avant d'avoir été identifiés.",
        "La prévention fonctionne : le Modelo 21-RFI remis à l'agent payeur avant le versement obtient directement les 15 % à la source — la meilleure démarche pour les positions conservées durablement.",
        "Un taux majoré de 35 % frappe les comptes logés dans des juridictions listées : ces lignes s'examinent au cas par cas.",
      ],
      en: [
        "A 10-point gap (25% withheld, 15% owed) on Lisbon's flagship names (EDP, Galp, Jerónimo Martins…).",
        "The 2-year window is the Portuguese trap: as in Canada, many over-withholdings expire before anyone spots them.",
        "Prevention works: Form 21-RFI handed to the paying agent before payment secures the 15% at source — the best move for long-held positions.",
        "A higher 35% rate hits accounts booked in listed jurisdictions: those lines are assessed case by case.",
      ],
    },
    recoveryPotential: "medium",
    lastReviewed: "2026-07-12",
  },
  {
    id: "FR",
    slug: { fr: "france", en: "france" },
    name: { fr: "France", en: "France" },
    flag: "🇫🇷",
    statutoryRate: 0.128,
    treatyRate: { default: 0.15, byResidence: { FR: 0.128 } },
    sol: {
      years: 2,
      rule: "calendar-year-end",
      notes: {
        fr: "Réclamation recevable jusqu'au 31 décembre de la 2e année suivant celle du prélèvement, en règle générale.",
        en: "Claims are admissible until 31 December of the 2nd year following the withholding year, as a general rule.",
      },
    },
    reliefAtSource: true,
    onlineFiling: false,
    refundForm: { fr: "Formulaires 5000 + 5001", en: "Forms 5000 + 5001" },
    authority: {
      fr: "DGFiP (Direction générale des Finances publiques)",
      en: "DGFiP (French public finances directorate)",
    },
    docsRequired: {
      fr: [
        "Formulaire 5000 (attestation de résidence) visé par l'administration du pays de résidence",
        "Annexe 5001 (liquidation de la retenue sur dividendes)",
        "Justificatifs des dividendes français et de la retenue prélevée",
        "Mandat de représentation le cas échéant",
      ],
      en: [
        "Form 5000 (residence attestation) stamped by the residence-country administration",
        "Schedule 5001 (computation of the dividend withholding)",
        "Evidence of the French dividends and the withholding levied",
        "A representation mandate where applicable",
      ],
    },
    specifics: {
      fr: [
        "Cas honnête, à rebours de l'intuition : pour un particulier non résident, la France retient 12,8 % — en dessous des 15 % conventionnels usuels. Dans le cas standard, il n'y a donc rien à récupérer.",
        "Le trop-perçu apparaît quand l'établissement payeur a appliqué un taux erroné (le 25 % de droit commun pour les personnes morales — article 187 du CGI, indexé sur le taux normal de l'IS — réductible par convention, ou un taux majoré) : ces écarts se récupèrent via le couple 5000/5001.",
        "La prévention est la voie normale : un formulaire 5000 remis avant le versement obtient directement le bon taux à la source.",
        "Piège réel et méconnu pour un résident fiscal français : chez certains courtiers qui détiennent les titres « au porteur » via une entité américaine (Interactive Brokers LLC notamment), l'administration française applique la retenue due par cette entité américaine — une personne morale non résidente — et non le régime d'un particulier résident français. Le taux observé est alors le taux normal de l'IS, soit 25 % depuis 2022 (attention : plusieurs pages de courtiers citent encore 28 %, un chiffre daté de 2020 non mis à jour), sans rapport avec le statut fiscal réel du client. C'est un vrai trop-perçu, récupérable via les mêmes formulaires 5000/5001 — vérifiez votre relevé annuel si votre courtier fonctionne ainsi.",
      ],
      en: [
        "An honest, counter-intuitive case: for a non-resident individual, France withholds 12.8% — below the usual 15% treaty rates. In the standard case there is therefore nothing to recover.",
        "Over-withholding appears when the paying agent applied a wrong rate (the standard 25% for legal entities — CGI Article 187, indexed to the standard corporate tax rate — treaty-reducible, or a punitive rate): those gaps are recovered through the 5000/5001 pair.",
        "Prevention is the normal route: a Form 5000 delivered before payment secures the correct rate at source directly.",
        "A real, underappreciated trap for a French tax resident: with some brokers that hold shares 'in street name' through a US entity (notably Interactive Brokers LLC), the French administration applies the withholding owed by that US legal entity — a non-resident company — rather than the individual French resident's own regime. The rate observed is the standard corporate tax rate, 25% since 2022 (note: several broker pages still cite 28%, a figure dated to 2020 that was never updated), unrelated to the client's actual tax status. That is a genuine over-withholding, recoverable through the same 5000/5001 forms — check your annual statement if your broker works this way.",
      ],
    },
    recoveryPotential: "low",
    lastReviewed: "2026-07-15",
  },
];

export function getCountryBySlug(locale: "fr" | "en", slug: string): CountryTaxProfile | undefined {
  return COUNTRIES.find((c) => c.slug[locale] === slug);
}

export function getCountryById(id: string): CountryTaxProfile | undefined {
  return COUNTRIES.find((c) => c.id === id);
}

/** Treaty rate applicable for a given residence (falls back to the default portfolio rate). */
export function treatyRateFor(country: CountryTaxProfile, residence: Residence): number {
  return country.treatyRate.byResidence?.[residence] ?? country.treatyRate.default;
}

/** Recoverable gap in rate points (0–1) for a residence. */
export function recoveryGap(country: CountryTaxProfile, residence: Residence): number {
  return Math.max(0, country.statutoryRate - treatyRateFor(country, residence));
}

/** Statute-of-limitations deadline for a dividend paid on `paymentDateIso`. */
export function solDeadline(country: CountryTaxProfile, paymentDateIso: string): Date {
  const payment = new Date(paymentDateIso + "T12:00:00");
  if (country.sol.rule === "calendar-year-end") {
    return new Date(payment.getFullYear() + country.sol.years, 11, 31, 12);
  }
  const d = new Date(payment);
  d.setFullYear(d.getFullYear() + country.sol.years);
  return d;
}
