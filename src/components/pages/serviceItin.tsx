import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, type RouteKey } from "@/lib/routes";
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
import { LedgerLine, DoubleRule } from "@/components/ui/ledger";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";
import { LeadCaptureButton } from "@/components/site/LeadCaptureButton";

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

interface ItinCopy {
  metaTitle: (price: string) => string;
  metaDescription: (price: string) => string;
  leadServiceLabel: string;
  hero: {
    kicker: string;
    h1: string;
    sub: (price: string) => string;
    secondary: string;
  };
  deduction: {
    kicker: string;
    fee: string;
    feeSub: string;
    deducted: string;
    finalCost: string;
    footnote: string;
  };
  what: {
    kicker: string;
    title: string;
    lede: string;
    whatTitle: string;
    whatBody: string;
    whoTitle: string;
    whoBody: string;
  };
  steps: { kicker: string; title: string; lede: string; items: StepItem[] };
  price: {
    kicker: string;
    title: string;
    lede: string;
    feeLabel: string;
    feeHint: string;
    deductionValue: (price: string) => string;
    deductionLabel: string;
    delayValue: string;
    delayLabel: string;
  };
  pitfalls: {
    kicker: string;
    title: string;
    lede: string;
    items: PitfallItem[];
    solLink: string;
  };
  bridges: { kicker: string; title: string; items: BridgeItem[] };
  faq: {
    kicker: string;
    title: string;
    items: (v: { price: string }) => FAQItem[];
  };
  finalCta: { title: string; lede: string };
}

const copy: Localized<ItinCopy> = {
  fr: {
    metaTitle: (price) =>
      `ITIN (numéro fiscal IRS) pour ${price}, déduits si vous récupérez avec nous | FiscalPlace`,
    metaDescription: (price) =>
      `L'ITIN est l'identifiant fiscal que l'IRS exige pour certaines demandes de remboursement américaines. Dossier W-7 complet pour ${price} — intégralement déduits de notre commission si vous nous confiez ensuite la récupération. Et si vous n'en avez pas besoin, on vous le dit.`,
    leadServiceLabel: "Demande d'ITIN",
    hero: {
      kicker: "Service à forfait · ITIN",
      h1: "L'identifiant qui débloque certains remboursements de l'IRS — obtenu proprement, sans risquer votre passeport.",
      sub: (price) =>
        `L'ITIN (Individual Taxpayer Identification Number) est le numéro fiscal que l'IRS attribue aux personnes sans numéro de sécurité sociale américain. Certaines demandes de remboursement l'exigent. Nous préparons le dossier W-7 complet pour ${price} — et nous commençons par vérifier, gratuitement, que vous en avez vraiment besoin.`,
      secondary: "Voir le service de récupération",
    },
    deduction: {
      kicker: "L'écriture, soldée",
      fee: "Forfait ITIN (dossier W-7)",
      feeSub: "Payé une fois, à la commande",
      deducted: "Déduit de la commission au succès",
      finalCost: "Coût final si vous récupérez avec nous",
      footnote:
        "La déduction s'applique sur la commission du dossier de récupération correspondant, au moment où elle est due — c'est-à-dire uniquement en cas de succès.",
    },
    what: {
      kicker: "Comprendre",
      title: "C'est quoi, et pour qui ?",
      lede: "Neuf chiffres attribués par l'IRS — rien de plus, rien de moins.",
      whatTitle: "Ce que c'est",
      whatBody:
        "Un identifiant fiscal délivré par l'IRS, via le formulaire W-7, aux personnes qui n'ont pas de numéro de sécurité sociale américain. Il sert uniquement à identifier vos démarches auprès de l'administration américaine : il ne vous rend pas imposable aux États-Unis et ne crée aucune obligation déclarative nouvelle. C'est une clé d'accès, pas un statut.",
      whoTitle: "Pour qui",
      whoBody:
        "Les investisseurs non résidents dont la demande de remboursement auprès de l'IRS l'exige — typiquement lorsque le trop-perçu se réclame a posteriori par une déclaration 1040-NR. Soyons clairs : il est inutile pour remplir un W-8BEN ou bénéficier du taux conventionnel à la source. Beaucoup de gens demandent un ITIN pour rien — notre première étape est justement d'éviter que vous en fassiez partie.",
    },
    steps: {
      kicker: "La démarche",
      title: "Ce que nous faisons, concrètement",
      lede: "La première étape ne coûte rien : vérifier que ce service vous est réellement utile.",
      items: [
        {
          title: "Nous vérifions que vous en avez besoin — gratuitement",
          body: "Dans beaucoup de situations, votre numéro fiscal national suffit et l'ITIN est superflu. Ce diagnostic est gratuit et son verdict est honnête : si la réponse est non, vous ne payez rien et nous vous disons quoi faire à la place.",
        },
        {
          title: "Nous préparons le formulaire W-7 complet",
          body: "Le bon motif de demande coché, les pièces justificatives exactes, la cohérence avec la demande de remboursement à laquelle l'ITIN se rattache : les rejets pour dossier incomplet se jouent là.",
        },
        {
          title: "Nous sécurisons la question de la pièce d'identité",
          body: "L'IRS exige le passeport original ou une copie certifiée par l'autorité émettrice. Avant tout envoi, nous passons en revue les options acceptées dans votre situation — et leurs délais — pour ne pas immobiliser votre passeport des semaines sans nécessité.",
        },
        {
          title: "Nous déposons et suivons jusqu'à l'attribution",
          body: "La demande part coordonnée avec votre dossier de remboursement, et nous suivons l'instruction jusqu'à réception du numéro — visible étape par étape dans votre espace.",
        },
      ],
    },
    price: {
      kicker: "Prix & délais",
      title: "Un forfait qui ne se paie qu'une fois — voire zéro",
      lede: "Si vous nous confiez ensuite la récupération, le forfait est intégralement déduit de la commission au succès. Vous ne payez jamais deux fois la même démarche.",
      feeLabel: "dossier W-7 complet, dépôt et suivi inclus",
      feeHint: "diagnostic d'utilité préalable gratuit",
      deductionValue: (price) => `− ${price}`,
      deductionLabel: "déduits de la commission si vous nous confiez ensuite la récupération",
      delayValue: "≥ 7 sem.",
      delayLabel: "délai d'instruction annoncé par l'IRS — souvent dépassé en période de pointe",
    },
    pitfalls: {
      kicker: "Transparence",
      title: "Ce qui peut coincer",
      lede: "L'ITIN est la démarche la plus lente de notre catalogue. Autant le savoir avant de commencer.",
      items: [
        {
          title: "Le passeport, exigence la plus lourde",
          body: "L'IRS veut l'original ou une copie certifiée conforme par l'autorité qui a émis le document — une copie simple, même tamponnée en mairie, ne suffit pas toujours. Envoyer son passeport original aux États-Unis pour plusieurs semaines n'est pas anodin : nous examinons d'abord toutes les alternatives acceptées.",
        },
        {
          title: "Des délais en semaines, pas en jours",
          body: "L'IRS annonce environ sept semaines d'instruction, davantage en période de pointe. Si votre demande de remboursement approche de sa prescription, l'ITIN se lance en premier — c'est lui qui donne le tempo du dossier.",
        },
        {
          title: "Le rejet pour dossier incomplet",
          body: "Un W-7 renvoyé, ce sont des semaines perdues et une pièce d'identité immobilisée pour rien. Motif mal coché, justificatif manquant, incohérence avec la demande jointe : ces erreurs évitables sont précisément ce que le forfait élimine.",
        },
        {
          title: "Un ITIN peut expirer",
          body: "Un ITIN qui n'apparaît sur aucune déclaration fédérale américaine pendant trois années consécutives expire. Si le vôtre dort depuis longtemps, un renouvellement peut être nécessaire avant toute nouvelle demande — nous le vérifions d'entrée.",
        },
      ],
      solLink: "Vérifier mes délais de prescription",
    },
    bridges: {
      kicker: "Et ensuite",
      title: "L'ITIN n'est qu'un moyen — voici la fin",
      items: [
        {
          title: "Récupération du trop-perçu",
          body: "L'ITIN ne rapporte rien en lui-même : c'est la demande de remboursement qu'il débloque qui vous paie. Confiez-la-nous et le forfait ITIN est intégralement déduit de la commission au succès.",
          linkLabel: "Le service de récupération",
        },
        {
          title: "Formulaire W-8BEN",
          body: "Pour l'avenir, le W-8BEN évite le problème à la racine : le taux conventionnel s'applique dès le versement, et l'ITIN devient inutile pour vos dividendes courants.",
          linkLabel: "Le service W-8BEN",
        },
        {
          title: "Calculateur de prescription",
          body: "Sept semaines d'ITIN plus l'instruction de l'IRS : le calendrier compte. Vérifiez gratuitement ce que vos délais permettent encore.",
          linkLabel: "Calculer mes échéances",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur l'ITIN",
      items: ({ price }) => [
        {
          question: "Ai-je besoin d'un ITIN pour remplir un W-8BEN ?",
          answer:
            "Non, en règle générale. Le W-8BEN accepte votre numéro fiscal national dans la case prévue, et le taux conventionnel s'applique à la source sans ITIN. Celui-ci ne devient nécessaire que pour certaines demandes de remboursement déposées directement auprès de l'IRS — si un prestataire vous vend un ITIN « obligatoire » pour un simple portefeuille d'actions, demandez pourquoi.",
        },
        {
          question: "Dois-je vraiment envoyer mon passeport original aux États-Unis ?",
          answer:
            "Pas forcément. L'IRS accepte aussi une copie certifiée par l'autorité qui a émis le passeport, et d'autres voies existent selon les situations. C'est le point que nous verrouillons avant tout envoi : vous connaissez les options, leurs délais et leurs risques avant de poster quoi que ce soit.",
        },
        {
          question: "L'ITIN me rend-il imposable aux États-Unis ?",
          answer:
            "Non. C'est un identifiant, pas un statut fiscal : il ne crée ni résidence fiscale américaine ni obligation déclarative nouvelle. Il sert ici à une seule chose — réclamer l'argent qui vous est dû.",
        },
        {
          question: `Pourquoi les ${price} sont-ils déduits ensuite ?`,
          answer: `Parce que l'ITIN n'est pas une fin en soi : si vous nous confiez la récupération qui le motive, le forfait de ${price} vient intégralement en déduction de la commission au succès. La démarche administrative ne doit jamais vous coûter deux fois.`,
        },
      ],
    },
    finalCta: {
      title: "D'abord vérifier, ensuite déposer — jamais l'inverse.",
      lede: "Le diagnostic d'utilité est gratuit. Si l'ITIN s'impose, le dossier W-7 part complet du premier coup.",
    },
  },
  en: {
    metaTitle: (price) =>
      `ITIN (IRS tax number) for ${price}, deducted if you recover with us | FiscalPlace`,
    metaDescription: (price) =>
      `The ITIN is the tax ID the IRS requires for certain US refund claims. A complete W-7 file for ${price} — fully deducted from our fee if you then entrust us with the recovery. And if you do not need one, we tell you.`,
    leadServiceLabel: "ITIN application",
    hero: {
      kicker: "Fixed-fee service · ITIN",
      h1: "The identifier that unlocks certain IRS refunds — obtained cleanly, without gambling with your passport.",
      sub: (price) =>
        `The ITIN (Individual Taxpayer Identification Number) is the tax number the IRS assigns to people without a US social security number. Certain refund claims require it. We prepare the complete W-7 file for ${price} — and we start by checking, for free, that you actually need one.`,
      secondary: "See the recovery service",
    },
    deduction: {
      kicker: "The entry, settled",
      fee: "ITIN fixed fee (W-7 file)",
      feeSub: "Paid once, on ordering",
      deducted: "Deducted from the success fee",
      finalCost: "Final cost if you recover with us",
      footnote:
        "The deduction applies to the fee on the matching recovery claim, at the moment it falls due — that is, only on success.",
    },
    what: {
      kicker: "The basics",
      title: "What it is, and who it is for",
      lede: "Nine digits assigned by the IRS — nothing more, nothing less.",
      whatTitle: "What it is",
      whatBody:
        "A tax identifier issued by the IRS, through form W-7, to people who have no US social security number. Its only purpose is to identify your filings with the US administration: it does not make you taxable in the United States and creates no new reporting obligation. It is an access key, not a status.",
      whoTitle: "Who it is for",
      whoBody:
        "Non-resident investors whose refund claim with the IRS requires it — typically when the over-withholding is claimed after the fact through a 1040-NR return. Let us be clear: it is useless for completing a W-8BEN or getting the treaty rate at source. Plenty of people request an ITIN for nothing — our first step exists precisely so you are not one of them.",
    },
    steps: {
      kicker: "The process",
      title: "What we actually do",
      lede: "The first step costs nothing: checking that this service is actually useful to you.",
      items: [
        {
          title: "We check that you need one — for free",
          body: "In many situations your national tax number is enough and the ITIN is superfluous. The diagnostic is free and its verdict is honest: if the answer is no, you pay nothing and we tell you what to do instead.",
        },
        {
          title: "We prepare the complete W-7 form",
          body: "The right application reason ticked, the exact supporting documents, consistency with the refund claim the ITIN attaches to: rejections for incomplete files are won or lost right here.",
        },
        {
          title: "We de-risk the identity-document question",
          body: "The IRS requires the original passport or a copy certified by the issuing authority. Before anything is sent, we review the options accepted in your situation — and their timelines — so your passport is not tied up for weeks without need.",
        },
        {
          title: "We file and track it through to assignment",
          body: "The application goes out coordinated with your refund claim, and we follow the processing until the number arrives — visible step by step in your account.",
        },
      ],
    },
    price: {
      kicker: "Price & timing",
      title: "A fee you pay once — or not at all",
      lede: "If you then entrust us with the recovery, the fee is fully deducted from the success fee. You never pay twice for the same work.",
      feeLabel: "complete W-7 file, filing and tracking included",
      feeHint: "free usefulness check first",
      deductionValue: (price) => `− ${price}`,
      deductionLabel: "deducted from the success fee if you then entrust us with the recovery",
      delayValue: "≥ 7 wks",
      delayLabel: "processing time announced by the IRS — often exceeded at peak periods",
    },
    pitfalls: {
      kicker: "Straight talk",
      title: "What can go wrong",
      lede: "The ITIN is the slowest procedure in our catalogue. Better to know that before you start.",
      items: [
        {
          title: "The passport, the heaviest requirement",
          body: "The IRS wants the original or a copy certified by the authority that issued the document — an ordinary copy, even locally stamped, is not always enough. Sending your original passport to the United States for several weeks is no small thing: we examine every accepted alternative first.",
        },
        {
          title: "Timelines in weeks, not days",
          body: "The IRS announces around seven weeks of processing, more at peak periods. If your refund claim is approaching its deadline, the ITIN goes first — it sets the tempo of the whole file.",
        },
        {
          title: "Rejection for an incomplete file",
          body: "A returned W-7 means weeks lost and an identity document tied up for nothing. A mis-ticked reason, a missing document, an inconsistency with the attached claim: these avoidable mistakes are exactly what the fixed fee eliminates.",
        },
        {
          title: "An ITIN can expire",
          body: "An ITIN that appears on no US federal return for three consecutive years expires. If yours has been dormant for a while, a renewal may be needed before any new claim — we check that upfront.",
        },
      ],
      solLink: "Check my filing deadlines",
    },
    bridges: {
      kicker: "What comes next",
      title: "The ITIN is only a means — here is the end",
      items: [
        {
          title: "Withholding-tax recovery",
          body: "The ITIN earns you nothing by itself: the refund claim it unlocks is what pays you. Entrust it to us and the ITIN fee is fully deducted from the success fee.",
          linkLabel: "The recovery service",
        },
        {
          title: "W-8BEN form",
          body: "Going forward, the W-8BEN removes the problem at the root: the treaty rate applies at payment time, and the ITIN becomes unnecessary for your everyday dividends.",
          linkLabel: "The W-8BEN service",
        },
        {
          title: "Deadline calculator",
          body: "Seven weeks of ITIN plus IRS processing: the calendar matters. Check for free what your deadlines still allow.",
          linkLabel: "Calculate my deadlines",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your ITIN questions",
      items: ({ price }) => [
        {
          question: "Do I need an ITIN to complete a W-8BEN?",
          answer:
            "As a general rule, no. The W-8BEN accepts your national tax number in the relevant box, and the treaty rate applies at source without an ITIN. It only becomes necessary for certain refund claims filed directly with the IRS — if a provider sells you a “mandatory” ITIN for a plain stock portfolio, ask why.",
        },
        {
          question: "Do I really have to send my original passport to the United States?",
          answer:
            "Not necessarily. The IRS also accepts a copy certified by the authority that issued the passport, and other routes exist depending on the situation. This is the point we lock down before anything is sent: you know the options, their timelines and their risks before posting a thing.",
        },
        {
          question: "Does an ITIN make me taxable in the United States?",
          answer:
            "No. It is an identifier, not a tax status: it creates neither US tax residence nor any new reporting obligation. Here it serves one purpose only — claiming the money you are owed.",
        },
        {
          question: `Why is the ${price} deducted later?`,
          answer: `Because the ITIN is not an end in itself: if you entrust us with the recovery that motivates it, the ${price} fee is fully deducted from the success fee. The paperwork should never cost you twice.`,
        },
      ],
    },
    finalCta: {
      title: "Check first, file second — never the other way round.",
      lede: "The usefulness check is free. If the ITIN is truly needed, the W-7 file goes out complete, first time.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  const price = formatCurrency(PRICING.fixedServices.itin, locale);
  return { title: t.metaTitle(price), description: t.metaDescription(price) };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const BRIDGE_ROUTES: RouteKey[] = ["serviceRecovery", "serviceW8ben", "solCalculator"];

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const fc = (n: number) => formatCurrency(n, locale);
  const itinPrice = PRICING.fixedServices.itin;

  const faqItems = t.faq.items({ price: fc(itinPrice) });

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
              {t.hero.sub(fc(itinPrice))}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <LeadCaptureButton serviceLabel={t.leadServiceLabel}>
                {common.cta.openAccount}
              </LeadCaptureButton>
              <ButtonLink href={href(locale, "serviceRecovery")} variant="ghost">
                {t.hero.secondary}
              </ButtonLink>
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
          <div>
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.deduction.kicker}
            </p>
            <div className="rounded-[6px] border border-rule bg-white p-5 sm:p-6">
              <LedgerLine
                label={t.deduction.fee}
                amount={fc(itinPrice)}
                tone="ink"
                sub={t.deduction.feeSub}
              />
              <LedgerLine
                label={t.deduction.deducted}
                amount={fc(-itinPrice)}
                tone="brand"
              />
              <div className="my-2 border-t border-rule" aria-hidden="true" />
              <LedgerLine
                label={t.deduction.finalCost}
                amount={fc(0)}
                tone="ink"
                highlight
                bold
              />
              <DoubleRule className="mt-3" />
              <p className="mt-3 text-[13px] leading-relaxed text-mine">{t.deduction.footnote}</p>
            </div>
          </div>
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
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.what.whoBody}</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* STEPS */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.steps.kicker} title={t.steps.title} lede={t.steps.lede} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.items.map((step, i) => (
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
              value={fc(itinPrice)}
              label={t.price.feeLabel}
              hint={t.price.feeHint}
              tone="brand"
            />
            <StatTile
              value={t.price.deductionValue(fc(itinPrice))}
              label={t.price.deductionLabel}
              tone="gold"
            />
            <StatTile value={t.price.delayValue} label={t.price.delayLabel} />
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
            {t.pitfalls.items.map((item) => (
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
            <LeadCaptureButton serviceLabel={t.leadServiceLabel}>
              {common.cta.openAccount}
            </LeadCaptureButton>
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
