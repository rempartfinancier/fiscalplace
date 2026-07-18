import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { PRICING, computeCommission } from "@/config/pricing";
import { Card, Container } from "@/components/ui/primitives";
import { DoubleRule, LedgerLine } from "@/components/ui/ledger";

/* ------------------------------------------------------------------ */
/* Legal-article scaffolding — duplicated in each of the five legal    */
/* page modules (foundation files are read-only and this mission only  */
/* owns the legal pages). Keep visually in sync with legalNotice,      */
/* termsOfUse, privacy and cookies.                                    */
/* ------------------------------------------------------------------ */

const UPDATED = "2026-07-17";
/** Same address as the contact page (src/components/site/ContactForm.tsx). */
const CONTACT_EMAIL = "contact@fiscalplace.com";
/** Recovered amount fed to computeCommission() for the worked example (art. 4). */
const FEE_EXAMPLE = 6_000;

function Sec({
  n,
  id,
  artLabel,
  title,
  children,
}: {
  n: number;
  id: string;
  artLabel: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-rule pt-8">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
        {artLabel} {String(n).padStart(2, "0")}
      </p>
      <h2 id={`${id}-title`} className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-[72ch] text-[15px] leading-relaxed text-mine">{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[72ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-mine marker:text-brand">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Toc({ label, items }: { label: string; items: { id: string; title: string }[] }) {
  return (
    <Card as="section" className="p-5">
      <nav aria-label={label}>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">{label}</p>
        <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="group inline-flex items-baseline gap-2 text-[15px] text-ink hover:text-brand"
              >
                <span className="font-mono text-xs text-mine group-hover:text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Card>
  );
}

const TH_CLASS = "px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface FixedServiceCopy {
  label: string;
  note: string;
}

interface TermsOfSaleCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  updatedLabel: string;
  artLabel: string;
  lede: (cgu: ReactNode) => ReactNode;
  cguLabel: string;
  tocLabel: string;
  parties: {
    title: string;
    p1: (legalNotice: ReactNode) => ReactNode;
    legalNoticeLabel: string;
    p2: string;
  };
  services: {
    title: string;
    intro: string;
    items: { name: string; desc: string }[];
    free: string;
  };
  grid: {
    title: string;
    intro: (pricingPage: ReactNode) => ReactNode;
    pricingPageLabel: string;
    tiersCaption: string;
    colTier: string;
    colRate: string;
    tierUpTo: (a: string) => string;
    tierBetween: (a: string, b: string) => string;
    tierAbove: (a: string) => string;
    guarantees: (floor: string, cap: string) => string;
    institutional: (threshold: string) => string;
    fixedTitle: string;
    fixedCaption: string;
    colService: string;
    colPrice: string;
    colNote: string;
    fixed: {
      w8ben: FixedServiceCopy;
      w8benE: FixedServiceCopy;
      residenceCertificate: FixedServiceCopy;
      itin: FixedServiceCopy;
      priorityHandling: FixedServiceCopy;
    };
    subTitle: string;
    subBody: (monthly: string, yearly: string) => string;
    partnerTitle: string;
    partner: (share: string) => string;
    vat: string;
  };
  fee: {
    title: string;
    p: string[];
    exampleKicker: string;
    exampleIntro: (amount: string) => string;
    exampleCaption: string;
    colSlice: string;
    colRate: string;
    colFee: string;
    sliceLabel: (from: string, to: string) => string;
    sliceAbove: (from: string) => string;
    exRecovered: string;
    exFee: string;
    exNet: string;
    exFootnote: (effective: string) => string;
  };
  disbursements: { title: string; p: string[] };
  mandate: { title: string; p: string[] };
  obligations: { title: string; intro: string; items: string[]; closing: string };
  noGuarantee: { title: string; p: string[] };
  subscription: { title: string; p: string[] };
  withdrawal: { title: string; p: string[] };
  complaints: { title: string; p: string[] };
  law: { title: string; p: string[] };
  contact: { title: string; body: string; formLink: string };
}

const copy: Localized<TermsOfSaleCopy> = {
  fr: {
    metaTitle: "Conditions générales de vente (CGV)",
    metaDescription:
      "La grille tarifaire intégrale de FiscalPlace et les règles du contrat : commission au succès marginale par tranche, forfaits, abonnement, mandat révocable, rétractation de 14 jours, absence de garantie de résultat.",
    kicker: "Légal",
    h1: "Conditions générales de vente",
    updatedLabel: "Dernière mise à jour",
    artLabel: "Art.",
    lede: (cgu) => (
      <>
        Les présentes conditions (« CGV ») régissent les prestations payantes de FiscalPlace. Elles
        reprennent l'intégralité de la grille tarifaire publique du site, générée depuis la même
        source : si un chiffre diffère entre une page commerciale et les CGV, c'est un bug, pas une
        clause cachée — signalez-le-nous. L'utilisation du site relève des {cgu}.
      </>
    ),
    cguLabel: "conditions générales d'utilisation",
    tocLabel: "Sommaire",
    parties: {
      title: "Parties et objet",
      p1: (legalNotice) => (
        <>
          Les CGV sont conclues entre EXP Capital (« FiscalPlace », « nous »),
          éditeur du site fiscalplace.com, dont l'identification complète figure dans les{" "}
          {legalNotice}, et toute personne physique ou morale commandant une prestation (« vous »,
          le « Client »). La commande vaut acceptation des CGV en vigueur à sa date.
        </>
      ),
      legalNoticeLabel: "mentions légales",
      p2: "Elles s'appliquent aux trois familles de prestations décrites à l'article 2, à l'exclusion de tout conseil fiscal personnalisé réglementé : FiscalPlace exécute des démarches administratives et fiscales, elle ne bâtit pas de stratégie fiscale.",
    },
    services: {
      title: "Services couverts",
      intro: "FiscalPlace propose trois familles de prestations :",
      items: [
        {
          name: "Récupération au succès",
          desc: "préparation, dépôt et suivi de demandes de remboursement de retenue à la source sur dividendes étrangers, rémunérées uniquement par une commission sur les montants effectivement récupérés (articles 3 et 4).",
        },
        {
          name: "Forfaits à prix fixe",
          desc: "prestations ponctuelles à prix ferme : formulaires W-8BEN et W-8BEN-E, certificat de résidence fiscale, assistance ITIN, traitement prioritaire d'un dossier proche de sa prescription (article 3).",
        },
        {
          name: "Abonnement de suivi",
          desc: "surveillance de portefeuille et alertes de prescription, facturée par portefeuille, au mois ou à l'année (articles 3 et 9).",
        },
      ],
      free: "Le diagnostic initial — l'analyse de vos relevés pour déterminer s'il existe un trop-perçu récupérable — est gratuit et sans engagement, y compris lorsqu'il conclut qu'un dépôt ne vaut pas la peine.",
    },
    grid: {
      title: "Grille tarifaire",
      intro: (pricingPage) => (
        <>
          La grille ci-dessous constitue l'intégralité de nos prix : il n'existe aucun autre barème,
          ni frais de dossier, ni supplément non listé ici. C'est la même grille que celle de la{" "}
          {pricingPage}, générée depuis la même source de données.
        </>
      ),
      pricingPageLabel: "page tarifs",
      tiersCaption: "Barème de la commission au succès, marginal par tranche du montant récupéré",
      colTier: "Tranche du montant récupéré",
      colRate: "Taux appliqué à la tranche",
      tierUpTo: (a) => `Jusqu'à ${a}`,
      tierBetween: (a, b) => `De ${a} à ${b}`,
      tierAbove: (a) => `Au-delà de ${a}`,
      guarantees: (floor, cap) =>
        `Le barème est marginal : chaque tranche du montant récupéré est facturée à son propre taux, jamais le taux d'une tranche appliqué au tout. La commission est encadrée par un plancher de ${floor} par dossier abouti et un plafond de ${cap} par dossier, quel que soit le montant récupéré. En cas d'échec de la demande, aucune commission n'est due — plancher compris.`,
      institutional: (threshold) =>
        `Au-delà de ${threshold} récupérés, les volumes relèvent d'une tarification institutionnelle (family offices, gestionnaires de fortune) convenue par écrit, sur devis. La grille publique reste le référentiel par défaut tant qu'aucune convention particulière n'est signée.`,
      fixedTitle: "Forfaits à prix fixe",
      fixedCaption: "Prestations ponctuelles à prix ferme",
      colService: "Prestation",
      colPrice: "Prix",
      colNote: "Précision",
      fixed: {
        w8ben: {
          label: "Formulaire W-8BEN (personne physique)",
          note: "Préparation, contrôle et accompagnement jusqu'à la transmission à votre courtier.",
        },
        w8benE: {
          label: "Formulaire W-8BEN-E (entité)",
          note: "Version entité : société, holding, structure patrimoniale.",
        },
        residenceCertificate: {
          label: "Certificat de résidence fiscale",
          note: "Préparation de la demande et suivi jusqu'à délivrance par votre administration.",
        },
        itin: {
          label: "Assistance ITIN (États-Unis)",
          note: "Déduit de la commission au succès si vous basculez ensuite vers une récupération complète.",
        },
        priorityHandling: {
          label: "Traitement prioritaire",
          note: "Par dossier proche de son délai de prescription.",
        },
      },
      subTitle: "Abonnement de suivi",
      subBody: (monthly, yearly) =>
        `L'abonnement de surveillance et d'alertes coûte ${monthly} par mois ou ${yearly} par an, par portefeuille suivi. Sa durée et sa résiliation sont détaillées à l'article 9.`,
      partnerTitle: "Rétrocession partenaire",
      partner: (share) =>
        `Lorsque votre dossier nous est apporté par un partenaire (conseiller en gestion de patrimoine, gestionnaire de fortune), celui-ci perçoit une rétrocession de ${share} de la commission au succès que nous encaissons effectivement sur ce dossier. Cette rétrocession est prise sur notre part : elle ne modifie ni la grille ci-dessus, ni votre net.`,
      vat: "Les prix sont exprimés en euros. [TVA : RÉGIME À CONFIRMER PAR EXPERT-COMPTABLE — la mention HT ou TTC applicable à chaque prestation sera précisée ici avant l'ouverture commerciale.]",
    },
    fee: {
      title: "La commission au succès, expliquée",
      p: [
        "Fait générateur : la commission n'est due qu'à l'encaissement effectif du remboursement versé par l'administration fiscale — que ce versement transite par nous ou vous parvienne directement. Pas de remboursement, pas de commission : ni frais de dossier, ni plancher, ni pénalité.",
        "Assiette : la commission est calculée sur le montant effectivement récupéré, tel qu'il ressort de la décision de l'administration — jamais sur le montant estimé au diagnostic ou au dépôt.",
        "Barème marginal : comme pour l'impôt sur le revenu, chaque tranche du montant récupéré est facturée au taux de sa tranche (article 3). Le taux d'une tranche ne s'applique donc jamais à l'ensemble du montant.",
      ],
      exampleKicker: "Exemple contractuel",
      exampleIntro: (amount) =>
        `Pour un trop-perçu récupéré de ${amount}, le calcul s'effectue tranche par tranche :`,
      exampleCaption: "Calcul de la commission, tranche par tranche, sur l'exemple",
      colSlice: "Tranche",
      colRate: "Taux",
      colFee: "Commission",
      sliceLabel: (from, to) => `De ${from} à ${to}`,
      sliceAbove: (from) => `Au-delà de ${from}`,
      exRecovered: "Trop-perçu récupéré",
      exFee: "Commission au succès",
      exNet: "Net reversé au Client",
      exFootnote: (effective) =>
        `Soit un taux effectif de ${effective} sur cet exemple ; ni le plancher ni le plafond ne s'y appliquent. Le simulateur du site reproduit ce calcul pour n'importe quel montant.`,
    },
    disbursements: {
      title: "Débours",
      p: [
        "Certaines formalités génèrent des frais externes : émission de certificats par une administration, apostilles ou légalisations, affranchissements spécifiques, frais bancaires de virement international. Ces débours sont refacturés à prix coûtant, sans marge, sur présentation des justificatifs correspondants.",
        "Tout débours prévisible vous est annoncé avant d'être engagé. Les débours engagés avec votre accord restent dus même si la demande n'aboutit pas : ils correspondent à des sommes effectivement versées à des tiers, pas à une rémunération de FiscalPlace.",
      ],
    },
    mandate: {
      title: "Mandat",
      p: [
        "La récupération suppose que vous mandatiez FiscalPlace pour agir en votre nom auprès des administrations fiscales concernées : préparer les formulaires et les signer lorsque la procédure locale le permet, déposer les demandes, recevoir la correspondance, effectuer les relances. Le mandat est formalisé par écrit (signature électronique) avant tout dépôt et précise son périmètre : pays, périodes, comptes concernés.",
        "Le mandat est révocable à tout moment, par écrit, sans frais de révocation ni justification.",
        "Effets d'une révocation en cours d'instruction : nous cessons immédiatement tout nouveau dépôt et vous remettons l'état du dossier ainsi que les pièces utiles pour reprendre la main. Les demandes déjà déposées suivent leur cours devant l'administration : si l'une d'elles aboutit à un remboursement, la commission de l'article 4 reste due sur ce remboursement, de même que les débours déjà engagés. Aucune commission n'est due au titre des demandes non déposées au jour de la révocation.",
      ],
    },
    obligations: {
      title: "Obligations du Client",
      intro: "Nos dépôts valent ce que valent vos pièces. Vous vous engagez à :",
      items: [
        "fournir des documents exacts, complets et authentiques (relevés, certificats, justificatifs d'identité) et signaler tout élément susceptible d'affecter une demande : changement de résidence fiscale, demande déjà déposée par ailleurs, remboursement partiel déjà perçu ;",
        "ne pas réclamer deux fois la même retenue — directement ou par un autre prestataire — pour les périodes et comptes que vous nous confiez ;",
        "nous informer sans délai si une administration vous verse directement un remboursement ou vous adresse une correspondance relative à une demande en cours ;",
        "répondre dans un délai raisonnable à nos demandes de pièces complémentaires : plusieurs administrations rejettent définitivement les dossiers restés incomplets au-delà de leurs délais internes.",
      ],
      closing:
        "La transmission consciente de documents falsifiés entraîne la résiliation immédiate du mandat, sans préjudice des signalements que la loi impose.",
    },
    noGuarantee: {
      title: "Absence de garantie de résultat",
      p: [
        "La décision d'accorder ou de refuser un remboursement appartient exclusivement à chaque administration fiscale. FiscalPlace s'engage sur la qualité et la complétude du dossier déposé et sur la diligence de son suivi — une obligation de moyens — jamais sur la décision, ni sur son délai.",
        "Les montants affichés au diagnostic et dans le simulateur sont des estimations indicatives fondées sur les taux conventionnels publiés ; chaque dossier est vérifié avant dépôt. Les délais communiqués sont des fourchettes constatées, pas des engagements : certaines administrations dépassent douze mois d'instruction.",
        "Ce modèle a une contrepartie simple : si la demande échoue, vous ne devez aucune commission (article 4). Le risque d'échec est porté par nous, pas par vous.",
      ],
    },
    subscription: {
      title: "Abonnement : durée, reconduction, résiliation",
      p: [
        "L'abonnement mensuel se renouvelle tacitement par périodes d'un mois. Il est résiliable à tout moment, depuis l'espace client ou par écrit ; la résiliation prend effet à la fin de la période en cours, sans frais ni pénalité.",
        "L'abonnement annuel se renouvelle tacitement par périodes d'un an. Conformément au code de la consommation, vous êtes informé par écrit, avant chaque échéance, de votre faculté de ne pas reconduire ; après une reconduction tacite, vous pouvez résilier à tout moment, sans frais, la résiliation prenant effet dans les conditions légales.",
        "La résiliation de l'abonnement n'affecte pas les dossiers de récupération en cours : ils suivent le régime des articles 4 et 6.",
      ],
    },
    withdrawal: {
      title: "Droit de rétractation (consommateurs)",
      p: [
        "Si vous êtes consommateur et contractez à distance, vous disposez d'un délai de rétractation de 14 jours à compter de la conclusion du contrat, sans motif ni pénalité. Un écrit adressé à l'adresse indiquée à l'article Contact suffit ; un remboursement des sommes versées intervient alors dans les délais légaux.",
        "Les délais de prescription n'attendent pas toujours 14 jours : vous pouvez nous demander expressément de commencer l'exécution immédiatement. Dans ce cas, si vous vous rétractez avant la fin du délai, vous devez le prix correspondant au service déjà exécuté ; et si la prestation est entièrement exécutée avant la fin du délai, avec votre accord exprès et votre reconnaissance de la perte du droit de rétractation, celui-ci ne peut plus être exercé.",
        "Cas concret : la rétractation, dans les 14 jours, d'un mandat de récupération au titre duquel aucune demande n'a encore été déposée est sans frais — le diagnostic étant gratuit, il n'y a rien à rembourser.",
      ],
    },
    complaints: {
      title: "Réclamations et médiation",
      p: [
        "Toute réclamation s'adresse d'abord à nous, par écrit, en indiquant le dossier concerné : chaque réclamation est instruite et reçoit une réponse écrite.",
        "Si vous êtes consommateur et que la réponse ne vous satisfait pas, vous pouvez saisir gratuitement le médiateur de la consommation : [MÉDIATEUR DE LA CONSOMMATION À DÉSIGNER — coordonnées et modalités de saisine à publier ici].",
      ],
    },
    law: {
      title: "Droit applicable",
      p: [
        "Les CGV sont soumises au droit français [DROIT APPLICABLE À VALIDER PAR CONSEIL JURIDIQUE]. Si vous êtes consommateur résidant dans un autre État, vous conservez la protection des dispositions impératives de votre pays de résidence.",
        "À défaut de résolution amiable ou de médiation, les tribunaux compétents sont saisis dans les conditions de droit commun.",
      ],
    },
    contact: {
      title: "Contact",
      body: "Pour toute question relative aux présentes CGV, à une facture ou à une réclamation :",
      formLink: "Ou passez par la page contact",
    },
  },
  en: {
    metaTitle: "Terms of Sale",
    metaDescription:
      "FiscalPlace's complete fee schedule and contract terms: marginal success fee by tranche, fixed-fee services, subscription, revocable mandate, 14-day withdrawal right, no guarantee of outcome.",
    kicker: "Legal",
    h1: "Terms of Sale",
    updatedLabel: "Last updated",
    artLabel: "Art.",
    lede: (cgu) => (
      <>
        These terms (the “Terms of Sale”) govern FiscalPlace's paid services. They restate the
        site's entire public fee schedule, generated from the same source: if a figure ever differs
        between a marketing page and these terms, it is a bug, not a hidden clause — please tell us.
        Use of the website itself is governed by the {cgu}.
      </>
    ),
    cguLabel: "terms of use",
    tocLabel: "Contents",
    parties: {
      title: "Parties and purpose",
      p1: (legalNotice) => (
        <>
          These Terms of Sale are entered into between EXP Capital
          (“FiscalPlace”, “we”), publisher of fiscalplace.com, fully identified in the {legalNotice},
          and any natural or legal person ordering a service (“you”, the “Client”). Placing an order
          constitutes acceptance of the Terms of Sale in force on that date.
        </>
      ),
      legalNoticeLabel: "legal notice",
      p2: "They apply to the three families of services described in article 2, to the exclusion of any regulated personalised tax advice: FiscalPlace performs administrative and tax filings, it does not build tax strategies.",
    },
    services: {
      title: "Services covered",
      intro: "FiscalPlace offers three families of services:",
      items: [
        {
          name: "Success-fee recovery",
          desc: "preparing, filing and following up withholding-tax refund claims on foreign dividends, paid for solely through a fee on the amounts actually recovered (articles 3 and 4).",
        },
        {
          name: "Fixed-fee services",
          desc: "one-off services at a firm price: W-8BEN and W-8BEN-E forms, certificate of tax residence, ITIN assistance, priority handling of a claim close to its limitation deadline (article 3).",
        },
        {
          name: "Monitoring subscription",
          desc: "portfolio monitoring and limitation-deadline alerts, billed per portfolio, monthly or yearly (articles 3 and 9).",
        },
      ],
      free: "The initial diagnostic — analysing your statements to determine whether recoverable over-withholding exists — is free and without commitment, including when it concludes that filing is not worth it.",
    },
    grid: {
      title: "Fee schedule",
      intro: (pricingPage) => (
        <>
          The schedule below is the entirety of our prices: there is no other grid, no file fee, no
          surcharge not listed here. It is the same schedule as the {pricingPage}, generated from
          the same data source.
        </>
      ),
      pricingPageLabel: "pricing page",
      tiersCaption: "Success-fee schedule, marginal by slice of the recovered amount",
      colTier: "Slice of the recovered amount",
      colRate: "Rate applied to the slice",
      tierUpTo: (a) => `Up to ${a}`,
      tierBetween: (a, b) => `${a} to ${b}`,
      tierAbove: (a) => `Above ${a}`,
      guarantees: (floor, cap) =>
        `The schedule is marginal: each slice of the recovered amount is charged at its own rate — a tier's rate never applies to the whole amount. The fee is bounded by a ${floor} minimum per successful claim and a ${cap} cap per claim, whatever the recovery. If the claim fails, no fee is due — minimum included.`,
      institutional: (threshold) =>
        `Above ${threshold} recovered, volumes fall under institutional pricing (family offices, wealth managers), agreed in writing on a bespoke quote. The public schedule remains the default reference until a specific agreement is signed.`,
      fixedTitle: "Fixed-fee services",
      fixedCaption: "One-off services at a firm price",
      colService: "Service",
      colPrice: "Price",
      colNote: "Detail",
      fixed: {
        w8ben: {
          label: "W-8BEN form (individual)",
          note: "Preparation, checking and support through to submission to your broker.",
        },
        w8benE: {
          label: "W-8BEN-E form (entity)",
          note: "Entity version: company, holding, wealth structure.",
        },
        residenceCertificate: {
          label: "Certificate of tax residence",
          note: "Preparing the request and following it through to issuance by your administration.",
        },
        itin: {
          label: "ITIN assistance (United States)",
          note: "Deducted from the success fee if you later upgrade to a full recovery claim.",
        },
        priorityHandling: {
          label: "Priority handling",
          note: "Per claim close to its statute-of-limitations deadline.",
        },
      },
      subTitle: "Monitoring subscription",
      subBody: (monthly, yearly) =>
        `The monitoring-and-alerts subscription costs ${monthly} per month or ${yearly} per year, per monitored portfolio. Its duration and cancellation are detailed in article 9.`,
      partnerTitle: "Partner revenue share",
      partner: (share) =>
        `When your claim is referred to us by a partner (financial adviser, wealth manager), that partner receives ${share} of the success fee we actually collect on the claim. This share comes out of our side: it changes neither the schedule above nor your net.`,
      vat: "Prices are stated in euros. [VAT: REGIME TO BE CONFIRMED BY CHARTERED ACCOUNTANT — whether each price is inclusive or exclusive of VAT will be specified here before commercial launch.]",
    },
    fee: {
      title: "The success fee, explained",
      p: [
        "Triggering event: the fee is owed only upon actual receipt of the refund paid by the tax administration — whether the payment passes through us or reaches you directly. No refund, no fee: no file fee, no minimum, no penalty.",
        "Base: the fee is computed on the amount actually recovered, as stated in the administration's decision — never on the amount estimated at diagnostic or filing time.",
        "Marginal schedule: as with income-tax brackets, each slice of the recovered amount is charged at its own tier rate (article 3). A tier's rate therefore never applies to the whole amount.",
      ],
      exampleKicker: "Contractual example",
      exampleIntro: (amount) =>
        `For a recovered over-withholding of ${amount}, the computation runs slice by slice:`,
      exampleCaption: "Slice-by-slice fee computation for the example",
      colSlice: "Slice",
      colRate: "Rate",
      colFee: "Fee",
      sliceLabel: (from, to) => `${from} to ${to}`,
      sliceAbove: (from) => `Above ${from}`,
      exRecovered: "Over-withholding recovered",
      exFee: "Success fee",
      exNet: "Net paid to the Client",
      exFootnote: (effective) =>
        `That is an effective rate of ${effective} on this example; neither the minimum nor the cap applies to it. The site's simulator reproduces this computation for any amount.`,
    },
    disbursements: {
      title: "Disbursements",
      p: [
        "Some formalities generate external costs: certificates issued by an administration, apostilles or legalisations, specific postage, international transfer bank charges. These disbursements are re-invoiced at cost, with no margin, against the corresponding receipts.",
        "Any foreseeable disbursement is announced to you before it is incurred. Disbursements incurred with your agreement remain due even if the claim fails: they are sums actually paid to third parties, not remuneration for FiscalPlace.",
      ],
    },
    mandate: {
      title: "Mandate",
      p: [
        "Recovery requires you to mandate FiscalPlace to act in your name before the tax administrations concerned: preparing forms and signing them where the local procedure allows, filing claims, receiving correspondence, chasing responses. The mandate is formalised in writing (electronic signature) before any filing and states its scope: countries, periods, accounts covered.",
        "The mandate is revocable at any time, in writing, with no revocation fee and no justification required.",
        "Effects of revocation while claims are being processed: we immediately stop any new filing and hand over the state of the file and the documents you need to take over. Claims already filed continue their course before the administration: if one of them results in a refund, the article 4 fee remains due on that refund, as do disbursements already incurred. No fee is due for claims not yet filed on the day of revocation.",
      ],
    },
    obligations: {
      title: "Client obligations",
      intro: "Our filings are only as good as your documents. You undertake to:",
      items: [
        "provide accurate, complete and authentic documents (statements, certificates, identity evidence) and flag anything likely to affect a claim: a change of tax residence, a claim already filed elsewhere, a partial refund already received;",
        "not claim the same withholding twice — directly or through another provider — for the periods and accounts you entrust to us;",
        "inform us without delay if an administration pays a refund directly to you or sends you correspondence about a pending claim;",
        "answer our requests for additional documents within a reasonable time: several administrations definitively reject files left incomplete beyond their internal deadlines.",
      ],
      closing:
        "Knowingly submitting falsified documents triggers immediate termination of the mandate, without prejudice to the reports the law requires.",
    },
    noGuarantee: {
      title: "No guarantee of outcome",
      p: [
        "The decision to grant or refuse a refund belongs exclusively to each tax administration. FiscalPlace commits to the quality and completeness of the file it submits and to diligent follow-up — a best-efforts obligation — never to the decision, nor to its timing.",
        "Amounts shown at diagnostic time and in the simulator are indicative estimates based on published treaty rates; every claim is verified before filing. Timelines we communicate are observed ranges, not commitments: some administrations take more than twelve months to process.",
        "This model has a simple counterpart: if the claim fails, you owe no fee (article 4). The risk of failure sits with us, not with you.",
      ],
    },
    subscription: {
      title: "Subscription: duration, renewal, cancellation",
      p: [
        "The monthly subscription renews tacitly for one-month periods. It can be cancelled at any time, from the client area or in writing; cancellation takes effect at the end of the current period, with no fee or penalty.",
        "The yearly subscription renews tacitly for one-year periods. As required by the French Consumer Code, you are informed in writing before each renewal date of your right not to renew; after a tacit renewal, you may cancel at any time, free of charge, with effect under the statutory conditions.",
        "Cancelling the subscription does not affect recovery claims in progress: they remain governed by articles 4 and 6.",
      ],
    },
    withdrawal: {
      title: "Right of withdrawal (consumers)",
      p: [
        "If you are a consumer contracting at a distance, you have a 14-day withdrawal period from the conclusion of the contract, with no reason or penalty required. Writing to the address in the Contact article is enough; any sums paid are then refunded within the statutory deadlines.",
        "Limitation deadlines do not always wait 14 days: you may expressly ask us to start performance immediately. In that case, if you withdraw before the period ends, you owe the price of the service already performed; and if the service is fully performed before the period ends, with your express agreement and your acknowledgement that the withdrawal right is lost, it can no longer be exercised.",
        "Concretely: withdrawing, within 14 days, from a recovery mandate under which no claim has yet been filed costs nothing — the diagnostic is free, so there is nothing to refund.",
      ],
    },
    complaints: {
      title: "Complaints and mediation",
      p: [
        "Any complaint should first be addressed to us in writing, identifying the claim concerned: every complaint is investigated and receives a written answer.",
        "If you are a consumer and the answer does not satisfy you, you may refer the matter free of charge to the consumer mediator: [CONSUMER MEDIATOR TO BE APPOINTED — contact details and referral process to be published here].",
      ],
    },
    law: {
      title: "Governing law",
      p: [
        "These Terms of Sale are governed by French law [GOVERNING LAW TO BE VALIDATED BY LEGAL COUNSEL]. If you are a consumer residing in another country, you keep the protection of your country's mandatory rules.",
        "Failing amicable resolution or mediation, the competent courts have jurisdiction under ordinary rules.",
      ],
    },
    contact: {
      title: "Contact",
      body: "For any question about these Terms of Sale, an invoice or a complaint:",
      formLink: "Or use the contact page",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta + page                                                         */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const fc = (n: number) => formatCurrency(n, locale);

  /* Success-fee tiers — rendered from PRICING, never restated. */
  const tierRows = PRICING.successFeeTiers.map((tier, i) => {
    const lower = i === 0 ? 0 : PRICING.successFeeTiers[i - 1].upTo;
    const label =
      tier.upTo === Infinity
        ? t.grid.tierAbove(fc(lower))
        : i === 0
          ? t.grid.tierUpTo(fc(tier.upTo))
          : t.grid.tierBetween(fc(lower), fc(tier.upTo));
    return { label, rate: formatPercent(tier.rate, locale) };
  });

  /* Fixed-fee services — prices from PRICING.fixedServices. */
  const fixedRows = [
    { ...t.grid.fixed.w8ben, price: fc(PRICING.fixedServices.w8ben) },
    { ...t.grid.fixed.w8benE, price: fc(PRICING.fixedServices.w8benE) },
    { ...t.grid.fixed.residenceCertificate, price: fc(PRICING.fixedServices.residenceCertificate) },
    { ...t.grid.fixed.itin, price: fc(PRICING.fixedServices.itin) },
    { ...t.grid.fixed.priorityHandling, price: fc(PRICING.fixedServices.priorityHandling) },
  ];

  /* Worked example — computed by the same function the invoices will use. */
  const example = computeCommission(FEE_EXAMPLE);
  const exampleRows = example.breakdown.map((line) => ({
    slice:
      line.to === Infinity
        ? t.fee.sliceAbove(fc(line.from))
        : t.fee.sliceLabel(fc(line.from), fc(line.to)),
    rate: formatPercent(line.rate, locale),
    fee: fc(line.fee),
  }));

  const sections = [
    { id: "parties", title: t.parties.title },
    { id: "services", title: t.services.title },
    { id: "grid", title: t.grid.title },
    { id: "fee", title: t.fee.title },
    { id: "disbursements", title: t.disbursements.title },
    { id: "mandate", title: t.mandate.title },
    { id: "obligations", title: t.obligations.title },
    { id: "no-guarantee", title: t.noGuarantee.title },
    { id: "subscription", title: t.subscription.title },
    { id: "withdrawal", title: t.withdrawal.title },
    { id: "complaints", title: t.complaints.title },
    { id: "law", title: t.law.title },
    { id: "contact", title: t.contact.title },
  ];

  const linkClass = "text-brand underline underline-offset-4 hover:text-brand-deep";

  return (
    <article>
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-[76ch]">
          <header>
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.kicker}
            </p>
            <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
              {t.h1}
            </h1>
            <p className="mt-3 font-mono text-[13px] text-mine">
              {t.updatedLabel} · {formatDate(UPDATED, locale)}
            </p>
            <p className="mt-5 max-w-[72ch] text-[16px] leading-relaxed text-mine">
              {t.lede(
                <Link href={href(locale, "termsOfUse")} className={linkClass}>
                  {t.cguLabel}
                </Link>,
              )}
            </p>
          </header>

          <div className="mt-8">
            <Toc label={t.tocLabel} items={sections} />
          </div>

          <div className="mt-10 space-y-10">
            <Sec n={1} id="parties" artLabel={t.artLabel} title={t.parties.title}>
              <P>
                {t.parties.p1(
                  <Link href={href(locale, "legalNotice")} className={linkClass}>
                    {t.parties.legalNoticeLabel}
                  </Link>,
                )}
              </P>
              <P>{t.parties.p2}</P>
            </Sec>

            <Sec n={2} id="services" artLabel={t.artLabel} title={t.services.title}>
              <P>{t.services.intro}</P>
              <ol className="max-w-[72ch] space-y-3">
                {t.services.items.map((item, i) => (
                  <li key={item.name} className="flex gap-3 text-[15px] leading-relaxed text-mine">
                    <span className="shrink-0 font-mono text-xs font-medium text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong className="font-semibold text-ink">{item.name}</strong> — {item.desc}
                    </span>
                  </li>
                ))}
              </ol>
              <P>{t.services.free}</P>
            </Sec>

            <Sec n={3} id="grid" artLabel={t.artLabel} title={t.grid.title}>
              <P>
                {t.grid.intro(
                  <Link href={href(locale, "pricing")} className={linkClass}>
                    {t.grid.pricingPageLabel}
                  </Link>,
                )}
              </P>

              <div className="overflow-x-auto rounded-[6px] border border-rule">
                <table className="w-full min-w-[420px] border-collapse bg-white text-left text-[15px]">
                  <caption className="sr-only">{t.grid.tiersCaption}</caption>
                  <thead>
                    <tr className="border-b border-rule">
                      <th scope="col" className={TH_CLASS}>
                        {t.grid.colTier}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.grid.colRate}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierRows.map((row) => (
                      <tr key={row.label} className="border-b border-rule last:border-b-0">
                        <td className="px-4 py-3 text-ink">{row.label}</td>
                        <td className="px-4 py-3 font-mono text-ink">{row.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <P>{t.grid.guarantees(fc(PRICING.floorFee), fc(PRICING.capFee))}</P>
              <P>{t.grid.institutional(fc(PRICING.institutionalThreshold))}</P>

              <h3 className="pt-2 font-display text-lg font-semibold text-ink">{t.grid.fixedTitle}</h3>
              <div className="overflow-x-auto rounded-[6px] border border-rule">
                <table className="w-full min-w-[560px] border-collapse bg-white text-left text-[15px]">
                  <caption className="sr-only">{t.grid.fixedCaption}</caption>
                  <thead>
                    <tr className="border-b border-rule">
                      <th scope="col" className={TH_CLASS}>
                        {t.grid.colService}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.grid.colPrice}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.grid.colNote}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixedRows.map((row) => (
                      <tr key={row.label} className="border-b border-rule last:border-b-0">
                        <td className="px-4 py-3 text-ink">{row.label}</td>
                        <td className="px-4 py-3 font-mono text-ink">{row.price}</td>
                        <td className="px-4 py-3 text-[14px] text-mine">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="pt-2 font-display text-lg font-semibold text-ink">{t.grid.subTitle}</h3>
              <P>{t.grid.subBody(fc(PRICING.subscription.monthly), fc(PRICING.subscription.yearly))}</P>

              <h3 className="pt-2 font-display text-lg font-semibold text-ink">{t.grid.partnerTitle}</h3>
              <P>{t.grid.partner(formatPercent(PRICING.partnerRevShare, locale))}</P>

              <P>{t.grid.vat}</P>
            </Sec>

            <Sec n={4} id="fee" artLabel={t.artLabel} title={t.fee.title}>
              {t.fee.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
              <p className="pt-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                {t.fee.exampleKicker}
              </p>
              <P>{t.fee.exampleIntro(fc(FEE_EXAMPLE))}</P>
              <div className="overflow-x-auto rounded-[6px] border border-rule">
                <table className="w-full min-w-[420px] border-collapse bg-white text-left text-[15px]">
                  <caption className="sr-only">{t.fee.exampleCaption}</caption>
                  <thead>
                    <tr className="border-b border-rule">
                      <th scope="col" className={TH_CLASS}>
                        {t.fee.colSlice}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.fee.colRate}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.fee.colFee}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exampleRows.map((row) => (
                      <tr key={row.slice} className="border-b border-rule last:border-b-0">
                        <td className="px-4 py-3 text-ink">{row.slice}</td>
                        <td className="px-4 py-3 font-mono text-ink">{row.rate}</td>
                        <td className="px-4 py-3 font-mono text-ink">{row.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="max-w-[72ch] rounded-[6px] border border-rule bg-white p-5">
                <LedgerLine label={t.fee.exRecovered} amount={fc(FEE_EXAMPLE)} tone="brand" />
                <LedgerLine label={t.fee.exFee} amount={fc(-example.fee)} tone="debit" />
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                <LedgerLine label={t.fee.exNet} amount={fc(example.net)} tone="ink" highlight bold />
                <DoubleRule className="mt-3" />
                <p className="mt-3 text-[13px] leading-relaxed text-mine">
                  {t.fee.exFootnote(formatPercent(example.effectiveRate, locale, 1))}
                </p>
              </div>
            </Sec>

            <Sec n={5} id="disbursements" artLabel={t.artLabel} title={t.disbursements.title}>
              {t.disbursements.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={6} id="mandate" artLabel={t.artLabel} title={t.mandate.title}>
              {t.mandate.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={7} id="obligations" artLabel={t.artLabel} title={t.obligations.title}>
              <P>{t.obligations.intro}</P>
              <Ul items={t.obligations.items} />
              <P>{t.obligations.closing}</P>
            </Sec>

            <Sec n={8} id="no-guarantee" artLabel={t.artLabel} title={t.noGuarantee.title}>
              {t.noGuarantee.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={9} id="subscription" artLabel={t.artLabel} title={t.subscription.title}>
              {t.subscription.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={10} id="withdrawal" artLabel={t.artLabel} title={t.withdrawal.title}>
              {t.withdrawal.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={11} id="complaints" artLabel={t.artLabel} title={t.complaints.title}>
              {t.complaints.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={12} id="law" artLabel={t.artLabel} title={t.law.title}>
              {t.law.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={13} id="contact" artLabel={t.artLabel} title={t.contact.title}>
              <P>{t.contact.body}</P>
              <p>
                <a href={`mailto:${CONTACT_EMAIL}`} className={`font-mono text-[15px] ${linkClass}`}>
                  {CONTACT_EMAIL}
                </a>
              </p>
              <P>
                <Link
                  href={href(locale, "contact")}
                  className="font-medium text-brand hover:underline underline-offset-4"
                >
                  {t.contact.formLink} →
                </Link>
              </P>
            </Sec>
          </div>
        </div>
      </Container>
    </article>
  );
}
