import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, type RouteKey } from "@/lib/routes";
import { getCountryById } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  StatTile,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface StepItem {
  title: string;
  body: string;
}

interface PitfallItem {
  title: string;
  body: string;
}

interface BridgeItem {
  title: string;
  body: string;
  linkLabel: string;
}

interface CertCopy {
  metaTitle: (price: string) => string;
  metaDescription: (price: string) => string;
  hero: {
    kicker: string;
    h1: string;
    sub: (price: string) => string;
    secondary: string;
  };
  kit: {
    kicker: string;
    title: string;
    items: string[];
    footnote: string;
  };
  what: {
    kicker: string;
    title: string;
    lede: string;
    whatTitle: string;
    whatBody: string;
    whoTitle: string;
    whoBody: (chName: string, deName: string, atName: string) => string;
  };
  steps: { kicker: string; title: string; lede: string; items: (deName: string) => StepItem[] };
  price: {
    kicker: string;
    title: string;
    lede: string;
    feeLabel: string;
    feeHint: string;
    vintageValue: string;
    vintageLabel: string;
    prepValue: string;
    prepLabel: string;
  };
  pitfalls: {
    kicker: string;
    title: string;
    lede: string;
    items: (deName: string) => PitfallItem[];
    solLink: string;
  };
  bridges: {
    kicker: string;
    title: string;
    items: BridgeItem[];
  };
  faq: {
    kicker: string;
    title: string;
    items: (v: { price: string }) => FAQItem[];
  };
  finalCta: { title: string; lede: string };
}

const copy: Localized<CertCopy> = {
  fr: {
    metaTitle: (price) =>
      `Certificat de résidence fiscale pour ${price} : le document qui débloque vos remboursements | FiscalPlace`,
    metaDescription: (price) =>
      `Aucune administration étrangère ne rembourse sans preuve de votre résidence fiscale. Nous préparons le bon formulaire, au bon millésime, prêt à faire viser par votre centre des impôts — forfait de ${price}.`,
    hero: {
      kicker: "Service à forfait · certificat de résidence",
      h1: "Le document sans lequel aucun fisc étranger ne vous remboursera — préparé sans aller-retour ni case ratée.",
      sub: (price) =>
        `Le certificat de résidence fiscale prouve aux administrations étrangères que vous résidez bien dans un pays conventionné : c'est lui qui ouvre droit au taux réduit et aux remboursements. Il est délivré par votre propre administration — et nous préparons tout ce qu'elle doit viser, pour ${price}.`,
      secondary: "Voir le service de récupération",
    },
    kit: {
      kicker: "Le kit remis",
      title: "Ce que vous recevez",
      items: [
        "Le formulaire exact attendu par le pays visé, pré-rempli intégralement",
        "Le millésime contrôlé : l'année du certificat correspond à l'année des dividendes réclamés",
        "La notice de dépôt : à qui l'adresser dans votre centre des impôts, par quel canal, quoi demander",
        "Le contrôle au retour : visa, tampon et concordance avec votre dossier de remboursement",
      ],
      footnote: "Un jeu complet par pays et par année de revenus réclamée.",
    },
    what: {
      kicker: "Comprendre",
      title: "C'est quoi, et pour qui ?",
      lede: "La pièce maîtresse de tout dossier conventionnel : elle prouve que le taux réduit vous revient de droit.",
      whatTitle: "Ce que c'est",
      whatBody:
        "L'attestation par laquelle votre administration fiscale certifie que vous étiez résident fiscal de votre pays pour une année donnée. Les conventions fiscales réservent leurs taux réduits aux résidents des États signataires : sans cette preuve, l'administration étrangère n'a aucune raison de vous appliquer autre chose que le taux plein — ni de vous rembourser quoi que ce soit.",
      whoTitle: "Pour qui",
      whoBody: (chName, deName, atName) =>
        `Toute personne qui dépose une demande de remboursement de retenue à la source (${chName}, ${deName}, ${atName}…) ou qui met en place un taux réduit à la source lorsque le pays l'exige. À l'inverse, le W-8BEN américain n'en a en général pas besoin : nous vous le disons plutôt que de vous vendre un document inutile.`,
    },
    steps: {
      kicker: "La démarche",
      title: "Ce que nous faisons, concrètement",
      lede: "Le certificat est délivré par votre administration — notre travail est que le visa soit la seule étape restante.",
      items: (deName) => [
        {
          title: "Nous identifions le bon support",
          body: `Certains pays acceptent une attestation générique de votre administration ; d'autres, comme l'${deName}, exigent leur propre formulaire national, visé par votre centre des impôts. Se tromper de support, c'est repartir de zéro.`,
        },
        {
          title: "Nous pré-remplissons tout, au bon millésime",
          body: "Identité, adresse fiscale, année de revenus concernée, références du dossier de remboursement : le formulaire arrive chez vous terminé, dans la langue attendue par l'administration destinataire.",
        },
        {
          title: "Vous le faites viser, guidé pas à pas",
          body: "La notice de dépôt vous dit précisément à qui l'adresser, par quel canal (guichet, courrier, messagerie sécurisée) et quelle formulation employer pour éviter le refus de guichet.",
        },
        {
          title: "Nous contrôlons le document au retour",
          body: "Visa, tampon, millésime, concordance avec les montants réclamés : nous vérifions que le certificat sera accepté avant qu'il ne parte dans votre dossier.",
        },
      ],
    },
    price: {
      kicker: "Prix & délais",
      title: "Un forfait par certificat",
      lede: "Le prix couvre la préparation complète et le contrôle au retour. Le visa lui-même est gratuit : c'est votre administration qui le délivre.",
      feeLabel: "par certificat — préparation complète et contrôle",
      feeHint: "un certificat par pays et par année réclamée",
      vintageValue: "1 an",
      vintageLabel: "durée de référence d'un certificat : le millésime de l'année réclamée",
      prepValue: "≤ 2 j",
      prepLabel: "notre délai de préparation ouvré — le visa de votre centre des impôts s'y ajoute",
    },
    pitfalls: {
      kicker: "Transparence",
      title: "Ce qui peut coincer",
      lede: "Le certificat est un document simple. Ses délais et ses exigences de forme, beaucoup moins.",
      items: (deName) => [
        {
          title: "Les délais du centre des impôts ne dépendent pas de nous",
          body: "Selon le service et la période — campagne déclarative, congés —, le visa prend de quelques jours à plusieurs semaines. Nous préparons tout pour que cette étape soit la seule restante, et nous recommandons de lancer la demande tôt quand une prescription approche.",
        },
        {
          title: "Le millésime exigé",
          body: "Un certificat atteste votre résidence pour une année précise. Des dividendes 2024 justifiés par un certificat 2026 : refus. Il faut un certificat par année de revenus réclamée — nous préparons le jeu complet d'emblée.",
        },
        {
          title: "Le formulaire national imposé",
          body: `Certaines administrations — l'${deName} notamment — ne se contentent pas d'une attestation générique : elles exigent leur propre formulaire, visé par votre centre des impôts. Nous fournissons le bon document du premier coup.`,
        },
        {
          title: "L'original exigé, pas le scan",
          body: "Plusieurs administrations veulent un tampon original. Un seul exemplaire visé ne servira donc pas trois pays : nous dimensionnons le nombre d'exemplaires dès le départ.",
        },
      ],
      solLink: "Vérifier mes délais de prescription",
    },
    bridges: {
      kicker: "Et ensuite",
      title: "Le certificat n'est jamais une fin en soi",
      items: [
        {
          title: "Récupération du trop-perçu",
          body: "C'est le dossier dans lequel ce certificat finit presque toujours. Si vous nous confiez la récupération, sa préparation est incluse — couverte par la commission au succès.",
          linkLabel: "Le service de récupération",
        },
        {
          title: "Relief at source",
          body: "Certains pays demandent aussi cette preuve pour appliquer le taux réduit dès le versement. Voyez où le mécanisme existe, et où il n'existe pas.",
          linkLabel: "Le taux réduit à la source, pays par pays",
        },
        {
          title: "Calculateur de prescription",
          body: "Le certificat prend du temps à obtenir ; les délais de dépôt, eux, courent déjà. Vérifiez gratuitement ce qui se prescrit, et quand.",
          linkLabel: "Calculer mes échéances",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur le certificat de résidence",
      items: ({ price }) => [
        {
          question: "Une attestation peut-elle servir pour plusieurs pays ?",
          answer:
            "Le contenu est le même, mais chaque administration étrangère veut en général son propre exemplaire — souvent un original visé — et certaines exigent leur formulaire national. En pratique : un jeu par pays. Nous préparons tous les exemplaires nécessaires en une fois.",
        },
        {
          question: "Combien de temps un certificat reste-t-il valable ?",
          answer:
            "Il fonctionne par millésime : il atteste votre résidence pour une année donnée. Pour réclamer des dividendes de plusieurs années, il faut un certificat par année concernée — c'est l'une des premières choses que nous vérifions dans un dossier.",
        },
        {
          question: "Est-ce inclus si je vous confie ma récupération ?",
          answer: `Oui. Dans un dossier de récupération complet, la préparation des certificats fait partie du service et se trouve couverte par la commission au succès. Le forfait de ${price} s'adresse à ceux qui déposent leur demande eux-mêmes ou n'ont besoin que de ce document.`,
        },
        {
          question: "Mon centre des impôts peut-il refuser de viser un formulaire étranger ?",
          answer:
            "Cela arrive, le plus souvent parce que le guichet ne connaît pas le document. Notre notice de dépôt précise la démarche et la formulation à employer ; si le blocage persiste, nous reformulons la demande avec vous par le canal écrit de votre administration.",
        },
      ],
    },
    finalCta: {
      title: "Un certificat exact, au bon millésime, du premier coup.",
      lede: "Dites-nous le pays et les années concernées : le kit complet part chez vous sous deux jours ouvrés.",
    },
  },
  en: {
    metaTitle: (price) =>
      `Certificate of tax residence for ${price}: the document that unlocks your refunds | FiscalPlace`,
    metaDescription: (price) =>
      `No foreign administration refunds anything without proof of your tax residence. We prepare the right form, for the right year, ready for your tax office to stamp — a ${price} fixed fee.`,
    hero: {
      kicker: "Fixed-fee service · residence certificate",
      h1: "The document no foreign tax authority will refund you without — prepared with no back-and-forth and no missed box.",
      sub: (price) =>
        `The certificate of tax residence proves to foreign administrations that you really are a resident of a treaty country: it is what entitles you to reduced rates and refunds. It is issued by your own administration — and we prepare everything it needs to stamp, for ${price}.`,
      secondary: "See the recovery service",
    },
    kit: {
      kicker: "The kit you receive",
      title: "What you get",
      items: [
        "The exact form the target country expects, fully pre-completed",
        "The vintage checked: the certificate year matches the year of the dividends claimed",
        "The filing note: whom to address at your tax office, through which channel, what to ask for",
        "The return check: stamp, endorsement and consistency with your refund claim",
      ],
      footnote: "One complete set per country and per income year claimed.",
    },
    what: {
      kicker: "The basics",
      title: "What it is, and who it is for",
      lede: "The cornerstone of every treaty claim: it proves the reduced rate is yours by right.",
      whatTitle: "What it is",
      whatBody:
        "The attestation through which your tax administration certifies that you were a tax resident of your country for a given year. Tax treaties reserve their reduced rates for residents of the signatory states: without this proof, the foreign administration has no reason to apply anything but the full rate — or to refund you anything at all.",
      whoTitle: "Who it is for",
      whoBody: (chName, deName, atName) =>
        `Anyone filing a withholding-tax refund claim (${chName}, ${deName}, ${atName}…) or setting up a reduced rate at source where the country requires it. Conversely, the US W-8BEN generally does not need one: we tell you so rather than sell you a document you do not need.`,
    },
    steps: {
      kicker: "The process",
      title: "What we actually do",
      lede: "The certificate is issued by your administration — our job is to make the stamp the only step left.",
      items: (deName) => [
        {
          title: "We identify the right medium",
          body: `Some countries accept a generic attestation from your administration; others, like ${deName}, require their own national form, stamped by your tax office. Pick the wrong medium and you start over.`,
        },
        {
          title: "We pre-complete everything, for the right year",
          body: "Identity, tax address, income year concerned, refund-claim references: the form reaches you finished, in the language the receiving administration expects.",
        },
        {
          title: "You get it stamped, guided step by step",
          body: "The filing note tells you exactly whom to address, through which channel (counter, post, secure messaging) and how to word the request to avoid a counter refusal.",
        },
        {
          title: "We check the document on its return",
          body: "Stamp, endorsement, vintage, consistency with the amounts claimed: we verify the certificate will be accepted before it goes into your file.",
        },
      ],
    },
    price: {
      kicker: "Price & timing",
      title: "One fixed fee per certificate",
      lede: "The price covers full preparation and the return check. The stamp itself is free: your administration issues it.",
      feeLabel: "per certificate — full preparation and check",
      feeHint: "one certificate per country and per year claimed",
      vintageValue: "1 yr",
      vintageLabel: "a certificate's reference period: the vintage of the year claimed",
      prepValue: "≤ 2 days",
      prepLabel: "our working-day preparation time — your tax office's stamp comes on top",
    },
    pitfalls: {
      kicker: "Straight talk",
      title: "What can go wrong",
      lede: "The certificate is a simple document. Its timing and formal requirements are anything but.",
      items: (deName) => [
        {
          title: "Your tax office's timing is not ours to control",
          body: "Depending on the office and the season — filing campaigns, holidays — the stamp takes anywhere from a few days to several weeks. We prepare everything so this is the only step left, and we recommend starting early when a deadline is approaching.",
        },
        {
          title: "The required vintage",
          body: "A certificate attests your residence for one specific year. 2024 dividends backed by a 2026 certificate: rejected. You need one certificate per income year claimed — we prepare the full set from the start.",
        },
        {
          title: "The mandatory national form",
          body: `Some administrations — ${deName} in particular — will not accept a generic attestation: they require their own form, stamped by your tax office. We supply the right document first time.`,
        },
        {
          title: "Originals required, not scans",
          body: "Several administrations insist on an original stamp. One stamped copy will not serve three countries: we size the number of copies from day one.",
        },
      ],
      solLink: "Check my filing deadlines",
    },
    bridges: {
      kicker: "What comes next",
      title: "The certificate is never an end in itself",
      items: [
        {
          title: "Withholding-tax recovery",
          body: "This is the file the certificate almost always ends up in. If you entrust us with the recovery, its preparation is included — covered by the success fee.",
          linkLabel: "The recovery service",
        },
        {
          title: "Relief at source",
          body: "Some countries also require this proof to apply the reduced rate at payment time. See where the mechanism exists — and where it does not.",
          linkLabel: "Reduced rates at source, country by country",
        },
        {
          title: "Deadline calculator",
          body: "The certificate takes time to obtain; the filing deadlines are already running. Check for free what expires, and when.",
          linkLabel: "Calculate my deadlines",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your residence-certificate questions",
      items: ({ price }) => [
        {
          question: "Can one attestation serve several countries?",
          answer:
            "The content is the same, but each foreign administration generally wants its own copy — often a stamped original — and some require their national form. In practice: one set per country. We prepare every copy you need in one go.",
        },
        {
          question: "How long does a certificate stay valid?",
          answer:
            "It works by vintage: it attests your residence for a given year. To claim dividends from several years, you need one certificate per year concerned — one of the first things we check in a file.",
        },
        {
          question: "Is it included if I entrust you with my recovery?",
          answer: `Yes. In a full recovery file, preparing the certificates is part of the service, covered by the success fee. The ${price} fixed fee is for those who file their claim themselves or only need this document.`,
        },
        {
          question: "Can my tax office refuse to stamp a foreign form?",
          answer:
            "It happens, most often because the counter does not recognise the document. Our filing note spells out the procedure and the wording to use; if the blockage persists, we help you reword the request through your administration's written channel.",
        },
      ],
    },
    finalCta: {
      title: "An exact certificate, for the right year, first time.",
      lede: "Tell us the country and years concerned: the complete kit reaches you within two working days.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  const price = formatCurrency(PRICING.fixedServices.residenceCertificate, locale);
  return { title: t.metaTitle(price), description: t.metaDescription(price) };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const BRIDGE_ROUTES: RouteKey[] = ["serviceRecovery", "serviceReliefAtSource", "solCalculator"];

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const fc = (n: number) => formatCurrency(n, locale);

  const chName = getCountryById("CH")?.name[locale] ?? "";
  const deName = getCountryById("DE")?.name[locale] ?? "";
  const atName = getCountryById("AT")?.name[locale] ?? "";

  const faqItems = t.faq.items({ price: fc(PRICING.fixedServices.residenceCertificate) });

  return (
    <>
      {/* HERO */}
      <section>
        <Container wide className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl">
              {t.hero.h1}
            </h1>
            <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-mine">
              {t.hero.sub(fc(PRICING.fixedServices.residenceCertificate))}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href={href(locale, "portalOnboarding")}>
                {common.cta.openAccount}
              </ButtonLink>
              <ButtonLink href={href(locale, "serviceRecovery")} variant="ghost">
                {t.hero.secondary}
              </ButtonLink>
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
          <Card className="p-5 sm:p-6">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.kit.kicker}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink">{t.kit.title}</h2>
            <ul className="mt-4 space-y-3">
              {t.kit.items.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-mine"
                >
                  <span className="mt-0.5 shrink-0 font-mono text-xs font-medium text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-rule pt-3 font-mono text-[11px] uppercase tracking-wide text-mine">
              {t.kit.footnote}
            </p>
          </Card>
        </Container>
      </section>

      {/* WHAT / WHO */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.what.kicker} title={t.what.title} lede={t.what.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.what.whatTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.what.whatBody}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.what.whoTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.what.whoBody(chName, deName, atName)}
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* STEPS */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.steps.kicker} title={t.steps.title} lede={t.steps.lede} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.items(deName).map((step, i) => (
              <Card as="li" key={step.title} className="p-5">
                <p className="font-mono text-xs font-medium text-mine">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{step.body}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </section>

      {/* PRICE & TIMING */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.price.kicker} title={t.price.title} lede={t.price.lede} />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatTile
              value={fc(PRICING.fixedServices.residenceCertificate)}
              label={t.price.feeLabel}
              hint={t.price.feeHint}
              tone="brand"
            />
            <StatTile value={t.price.vintageValue} label={t.price.vintageLabel} tone="gold" />
            <StatTile value={t.price.prepValue} label={t.price.prepLabel} />
          </div>
        </Container>
      </section>

      {/* PITFALLS */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.pitfalls.kicker}
            title={t.pitfalls.title}
            lede={t.pitfalls.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.pitfalls.items(deName).map((item) => (
              <Card key={item.title} className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{item.body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-5">
            <ButtonLink variant="ghost" href={href(locale, "solCalculator")}>
              {t.pitfalls.solLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* BRIDGES */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.bridges.kicker} title={t.bridges.title} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.bridges.items.map((item, i) => (
              <Card key={item.title} className="flex flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">{item.body}</p>
                <Link
                  href={href(locale, BRIDGE_ROUTES[i])}
                  className="mt-3 text-[15px] font-medium text-brand hover:underline underline-offset-4"
                >
                  {item.linkLabel} →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={faqItems} className="mt-8" />
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-rule bg-white">
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "portalOnboarding")}>
              {common.cta.openAccount}
            </ButtonLink>
            <TrustLine text={common.trustLine} />
            <ButtonLink variant="ghost" href={href(locale, "contact")}>
              {common.cta.contactUs}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
