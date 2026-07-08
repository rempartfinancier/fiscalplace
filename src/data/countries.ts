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

export const DATA_VERSION = "2026-06.1";

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
      ],
      en: [
        "A 12.5-point gap (27.5% withheld, 15% owed) and 5 years to act: Austria offers a very favourable effort-to-gain ratio.",
        "The procedure combines an online pre-filing and a signed paper submission: our pipeline generates both automatically.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-06-15",
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
      verify: true,
      notes: {
        fr: "5 ans à compter de la fin de l'année civile du versement, en règle générale (donnée à confirmer lors du diagnostic de votre dossier).",
        en: "5 years from the end of the calendar year of payment, as a general rule (to be confirmed during your file's diagnostic).",
      },
    },
    reliefAtSource: false,
    onlineFiling: true,
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
      ],
      en: [
        "A 15-point gap on regular dividend payers (Volvo, Investor AB, Nordic banks): amounts add up quickly.",
        "Skatteverket is known for relatively fast responses compared with other administrations in our panel.",
      ],
    },
    recoveryPotential: "high",
    lastReviewed: "2026-06-15",
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
