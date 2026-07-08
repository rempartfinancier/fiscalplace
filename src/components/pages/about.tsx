import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { PRICING } from "@/config/pricing";
import { COUNTRIES } from "@/data/countries";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface AboutCopy {
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    h1: string;
    sub: string;
  };
  angle: {
    kicker: string;
    title: string;
    lede: string;
    direct: { title: string; body: string };
    small: { title: string; body: (floor: string) => string };
    radical: {
      title: string;
      body: string;
      pricingLink: string;
      paidLink: string;
      problemsLink: string;
    };
  };
  team: {
    kicker: string;
    title: string;
    lede: string;
    photoPlaceholder: string;
    members: { role: string; placeholder: string }[];
    note: string;
  };
  figures: {
    kicker: string;
    title: string;
    lede: string;
    slots: string[];
    emptyValue: string;
    placeholder: string;
    facts: (countries: string, floor: string) => string;
  };
  company: {
    kicker: string;
    title: string;
    lede: string;
    rows: { label: string; value: string }[];
    note: string;
    legalLink: string;
  };
  finalCta: {
    title: string;
    lede: string;
    resourcesLink: string;
  };
}

const copy: Localized<AboutCopy> = {
  fr: {
    metaTitle: "À propos — notre mission",
    metaDescription:
      "Rendre aux investisseurs l'argent que la complexité administrative leur confisque : pourquoi FiscalPlace travaille en direct pour l'investisseur, accueille les petits dossiers et publie tout — tarifs, modèle, problèmes.",
    hero: {
      kicker: "À propos · notre mission",
      h1: "Rendre aux investisseurs l'argent que la complexité administrative leur confisque.",
      sub: "Chaque année, des retenues à la source trop prélevées sur des dividendes étrangers restent chez les fiscs, non pas parce qu'elles sont irrécupérables, mais parce que les démarches sont pénibles, le secteur opaque et l'investisseur individuel jugé trop petit. FiscalPlace existe pour solder ces lignes-là, une par une.",
    },
    angle: {
      kicker: "Notre angle",
      title: "Trois choix qui nous distinguent — et nous engagent.",
      lede: "La récupération de retenue à la source existe depuis des décennies. Ce qui n'existait pas, c'est une version construite pour vous.",
      direct: {
        title: "En direct pour l'investisseur",
        body: "L'industrie du recouvrement travaille pour les banques dépositaires et les fonds ; le particulier n'y est qu'une ligne dans le fichier d'un intermédiaire. Nous avons choisi l'autre camp : un mandat signé directement entre vous et nous, un espace où vous voyez chaque dossier, et personne entre les deux.",
      },
      small: {
        title: "Les petits dossiers sont les bienvenus",
        body: (floor) =>
          `« Dossier trop petit » est la réponse standard du secteur sous plusieurs milliers d'euros. Notre chaîne de traitement automatisée rend viables les dossiers de quelques centaines d'euros, avec une commission plancher de ${floor} facturée uniquement au succès — et quand un dépôt ne vaut vraiment pas le coup, notre diagnostic gratuit vous le dit.`,
      },
      radical: {
        title: "Transparence radicale",
        body: "Nos tarifs sont publics jusqu'au dernier euro, notre modèle de rémunération est documenté page par page, et nous écrivons noir sur blanc ce qui peut mal tourner : rejets, prescriptions, administrations qui répondent en douze mois. Vous pouvez tout vérifier avant de nous confier quoi que ce soit :",
        pricingLink: "Les tarifs, du premier au dernier euro",
        paidLink: "Comment nous sommes payés",
        problemsLink: "Ce qui peut mal tourner, et comment on le traite",
      },
    },
    team: {
      kicker: "L'équipe",
      title: "On vous montre qui nous sommes.",
      lede: "Vous nous confiez des mandats fiscaux, des relevés de courtage et des remboursements en transit : cela ne se fait pas avec un logo anonyme. Cette section présentera les personnes réelles qui traitent vos dossiers — leurs visages, leurs parcours, leurs responsabilités.",
      photoPlaceholder: "[PHOTO]",
      members: [
        {
          role: "Fondateur",
          placeholder: "[NOM ET BIO RÉELS DU FONDATEUR À AJOUTER]",
        },
        {
          role: "Opérations fiscales",
          placeholder: "[NOM ET BIO RÉELS DE L'ÉQUIPE À AJOUTER]",
        },
        {
          role: "Produit & automatisation",
          placeholder: "[NOM ET BIO RÉELS DE L'ÉQUIPE À AJOUTER]",
        },
      ],
      note: "Aucun visage d'illustration, aucun nom inventé : cette section restera en placeholder plutôt que fausse.",
    },
    figures: {
      kicker: "Nos chiffres",
      title: "Les compteurs sont à zéro — et nous préférons vous le dire.",
      lede: "Beaucoup de sites affichent des « millions récupérés » invérifiables. Nous publierons ici nos chiffres réels — dossiers soldés, montants récupérés, délais constatés — dès que les premiers dossiers seront terminés, et pas avant.",
      slots: [
        "Trop-perçu récupéré pour nos clients",
        "Dossiers soldés",
        "Délai médian constaté",
      ],
      emptyValue: "—",
      placeholder: "[CHIFFRES DE LANCEMENT À PUBLIER APRÈS LES PREMIERS DOSSIERS]",
      facts: (countries, floor) =>
        `Ce qui est déjà vérifiable aujourd'hui : ${countries} fiches pays documentées et datées, un barème public du premier au dernier euro, et une commission plancher de ${floor} facturée uniquement au succès.`,
    },
    company: {
      kicker: "L'entreprise",
      title: "Qui vous avez en face, juridiquement.",
      lede: "Les informations d'immatriculation seront complétées avant l'ouverture commerciale — nous ne publions pas de données juridiques provisoires.",
      rows: [
        { label: "Forme juridique", value: "[FORME JURIDIQUE À COMPLÉTER]" },
        { label: "SIREN", value: "[SIREN À COMPLÉTER]" },
        { label: "Siège social", value: "[SIÈGE SOCIAL À COMPLÉTER]" },
      ],
      note: "Ces informations figureront aussi, en version complète, dans les mentions légales.",
      legalLink: "Consulter les mentions légales",
    },
    finalCta: {
      title: "Vérifiez-nous avant de nous confier quoi que ce soit.",
      lede: "Lisez nos ressources — prix, échecs, comparaisons honnêtes —, testez le simulateur, puis écrivez-nous : un humain vous répond.",
      resourcesLink: "Parcourir les ressources",
    },
  },
  en: {
    metaTitle: "About — our mission",
    metaDescription:
      "Giving investors back the money administrative complexity takes from them: why FiscalPlace works directly for investors, welcomes small claims and publishes everything — pricing, business model, problems.",
    hero: {
      kicker: "About · our mission",
      h1: "Giving investors back the money administrative complexity confiscates.",
      sub: "Every year, over-withheld tax on foreign dividends stays with foreign treasuries — not because it is unrecoverable, but because the procedures are painful, the industry opaque and the individual investor deemed too small. FiscalPlace exists to settle those lines, one by one.",
    },
    angle: {
      kicker: "Our angle",
      title: "Three choices that set us apart — and hold us to account.",
      lede: "Withholding-tax recovery has existed for decades. What did not exist is a version built for you.",
      direct: {
        title: "Directly for the investor",
        body: "The recovery industry works for custodian banks and funds; the individual is a row in an intermediary's file. We picked the other side: a mandate signed directly between you and us, an account where you see every claim, and nobody in between.",
      },
      small: {
        title: "Small claims are welcome",
        body: (floor) =>
          `“Too small to bother” is the industry's standard answer below several thousand euros. Our automated pipeline makes claims of a few hundred euros viable, with a ${floor} minimum fee charged only on success — and when filing genuinely is not worth it, our free diagnostic tells you so.`,
      },
      radical: {
        title: "Radical transparency",
        body: "Our pricing is public down to the last euro, our revenue model is documented page by page, and we spell out what can go wrong: rejections, expired deadlines, administrations that take twelve months to answer. You can check everything before entrusting us with anything:",
        pricingLink: "Pricing, from the first euro to the last",
        paidLink: "How we get paid",
        problemsLink: "What can go wrong, and how we handle it",
      },
    },
    team: {
      kicker: "The team",
      title: "We show you who we are.",
      lede: "You entrust us with tax mandates, brokerage statements and refunds in transit: that does not happen with an anonymous logo. This section will introduce the real people handling your claims — their faces, their backgrounds, their responsibilities.",
      photoPlaceholder: "[PHOTO]",
      members: [
        {
          role: "Founder",
          placeholder: "[REAL FOUNDER NAME AND BIO TO BE ADDED]",
        },
        {
          role: "Tax operations",
          placeholder: "[REAL TEAM MEMBER NAME AND BIO TO BE ADDED]",
        },
        {
          role: "Product & automation",
          placeholder: "[REAL TEAM MEMBER NAME AND BIO TO BE ADDED]",
        },
      ],
      note: "No stock faces, no invented names: this section stays a placeholder rather than a fake.",
    },
    figures: {
      kicker: "Our numbers",
      title: "The counters read zero — and we would rather tell you.",
      lede: "Many sites display unverifiable “millions recovered”. We will publish our real figures here — claims settled, amounts recovered, observed processing times — once the first claims are complete, and not before.",
      slots: [
        "Over-withholding recovered for clients",
        "Claims settled",
        "Median observed processing time",
      ],
      emptyValue: "—",
      placeholder: "[LAUNCH FIGURES TO BE PUBLISHED AFTER THE FIRST CLAIMS]",
      facts: (countries, floor) =>
        `What is already verifiable today: ${countries} documented, dated country guides, a fee schedule public down to the last euro, and a ${floor} minimum fee charged only on success.`,
    },
    company: {
      kicker: "The company",
      title: "Who you are dealing with, legally.",
      lede: "Registration details will be completed before commercial launch — we do not publish provisional legal data.",
      rows: [
        { label: "Legal form", value: "[LEGAL FORM TO BE COMPLETED]" },
        { label: "SIREN", value: "[SIREN TO BE COMPLETED]" },
        { label: "Registered office", value: "[REGISTERED OFFICE TO BE COMPLETED]" },
      ],
      note: "This information will also appear, in full, in the legal notice.",
      legalLink: "Read the legal notice",
    },
    finalCta: {
      title: "Check up on us before entrusting us with anything.",
      lede: "Read our resources — costs, failures, honest comparisons —, try the simulator, then write to us: a human answers.",
      resourcesLink: "Browse the resources",
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
  const floor = formatCurrency(PRICING.floorFee, locale);

  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/* HERO — the mission                                          */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16 lg:py-20">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[24ch] font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl lg:text-[2.6rem]">
            {t.hero.h1}
          </h1>
          <p className="mt-5 max-w-[64ch] text-[17px] leading-relaxed text-mine">
            {t.hero.sub}
          </p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* OUR ANGLE                                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.angle.kicker} title={t.angle.title} lede={t.angle.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.angle.direct.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.angle.direct.body}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.angle.small.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.angle.small.body(floor)}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.angle.radical.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.angle.radical.body}
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href={href(locale, "pricing")}
                    className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                  >
                    {t.angle.radical.pricingLink} →
                  </Link>
                </li>
                <li>
                  <Link
                    href={href(locale, "howWeGetPaid")}
                    className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                  >
                    {t.angle.radical.paidLink} →
                  </Link>
                </li>
                <li>
                  <Link
                    href={href(locale, "howItWorks")}
                    className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                  >
                    {t.angle.radical.problemsLink} →
                  </Link>
                </li>
              </ul>
            </Card>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* TEAM — placeholder cards only, no invented people           */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.team.kicker} title={t.team.title} lede={t.team.lede} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.team.members.map((member) => (
              <Card key={member.role} className="p-5">
                <div
                  className="flex h-40 items-center justify-center rounded-[4px] border border-dashed border-rule bg-paper"
                  aria-hidden="true"
                >
                  <span className="font-mono text-xs text-mine">
                    {t.team.photoPlaceholder}
                  </span>
                </div>
                <p className="mt-4 font-mono text-xs font-medium uppercase tracking-wide text-mine">
                  {member.role}
                </p>
                <p className="mt-2 font-mono text-[13px] leading-relaxed text-gold-ink">
                  {member.placeholder}
                </p>
              </Card>
            ))}
          </div>
          <p className="mt-5 font-mono text-[13px] text-mine">{t.team.note}</p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FIGURES — zero invented traction                            */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.figures.kicker}
            title={t.figures.title}
            lede={t.figures.lede}
          />
          <Card className="mt-8 p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {t.figures.slots.map((label) => (
                <div key={label}>
                  <p className="font-mono text-2xl font-medium text-mine">
                    {t.figures.emptyValue}
                  </p>
                  <p className="mt-1 text-sm text-mine">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[4px] bg-tint-gold px-3 py-2.5">
              <p className="font-mono text-[13px] leading-relaxed text-gold-ink">
                {t.figures.placeholder}
              </p>
            </div>
          </Card>
          <p className="mt-5 max-w-[75ch] text-[15px] leading-relaxed text-mine">
            {t.figures.facts(String(COUNTRIES.length), floor)}
          </p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* THE COMPANY — clean legal placeholders                      */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.company.kicker}
            title={t.company.title}
            lede={t.company.lede}
          />
          <Card className="mt-8 max-w-2xl p-6">
            <dl className="space-y-4">
              {t.company.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4"
                >
                  <dt className="font-mono text-xs font-medium uppercase tracking-wide text-mine">
                    {row.label}
                  </dt>
                  <dd className="font-mono text-[13px] leading-relaxed text-gold-ink">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-rule pt-4">
              <p className="text-[13px] leading-relaxed text-mine">{t.company.note}</p>
              <Link
                href={href(locale, "legalNotice")}
                className="mt-2 inline-block text-[15px] font-medium text-brand hover:underline underline-offset-4"
              >
                {t.company.legalLink} →
              </Link>
            </div>
          </Card>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FINAL CTA — contact + resources                             */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-rule bg-white">
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "contact")}>{common.cta.contactUs}</ButtonLink>
            <TrustLine text={common.trustLine} />
            <ButtonLink href={href(locale, "resources")} variant="ghost">
              {t.finalCta.resourcesLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
