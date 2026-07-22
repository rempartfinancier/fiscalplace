import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { Container, ButtonLink, Card, Badge, SectionHeading } from "@/components/ui/primitives";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";
import { LeadMagnetForm } from "@/components/site/LeadMagnetForm";

/**
 * /guide — dedicated lead-magnet landing page. Bullets below are pulled
 * straight from the real table of contents of dossier-pret-60-minutes.pdf
 * (pages 3, 4/6/8, 11, 12-14, 15) — nothing promised here that isn't
 * actually in the PDF. The EN edition is honest about the PDF being
 * French-only (conventions §5: no overpromising).
 */

interface GuideCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  lede: string;
  languageNote?: string;
  editionBadge: string;
  bulletsTitle: string;
  bullets: string[];
  formTitle: string;
  scopeNote: string;
  faqTitle: string;
  faq: FAQItem[];
  bridge: {
    title: string;
    body: string;
    pricingLink: string;
    contactLink: string;
  };
  legal: string;
}

const copy: Localized<GuideCopy> = {
  fr: {
    metaTitle:
      "Guide gratuit : le dossier de récupération prêt en 60 minutes — FiscalPlace",
    metaDescription:
      "PDF gratuit : la checklist des documents et les emails prêts à copier-coller pour réclamer vos dividendes suisses, américains et allemands surtaxés. Édition 2026.",
    kicker: "Guide gratuit",
    h1: "Le dossier de récupération prêt en 60 minutes",
    lede: "3 pays, 1 checklist imprimable, 4 emails prêts à l'emploi (FR/EN) — pour ne plus attendre deux mois de plus une réponse de votre courtier avant de déposer votre dossier.",
    editionBadge: "Édition 2026 — Suisse · États-Unis · Allemagne",
    bulletsTitle: "Ce que vous allez obtenir",
    bullets: [
      "Un tableau panorama Suisse / États-Unis / Allemagne : taux par défaut, taux conventionnel, interlocuteur principal et durée de validité de l'attestation de résidence.",
      "Un tableau détaillé par pays des documents à réunir, qui les délivre et le délai moyen d'obtention.",
      "Deux emails prêts à copier-coller — en français et en anglais — à envoyer à votre courtier, plus un script de relance à J+15.",
      "Les 4 erreurs qui font le plus souvent rejeter un dossier, et comment les repérer avant l'envoi.",
      "Une checklist finale imprimable pour cocher chaque document au fur et à mesure.",
    ],
    formTitle: "Recevez le guide",
    scopeNote:
      "Ce guide part du principe que vous savez déjà, via le simulateur gratuit, que vous avez un trop-perçu récupérable, et que vous avez vérifié via le calculateur de délais qu'il n'est pas prescrit. Il ne recalcule ni l'un ni l'autre.",
    faqTitle: "Questions fréquentes",
    faq: [
      {
        question: "Ce guide remplace-t-il le simulateur ou le calculateur de délais ?",
        answer:
          "Non. Il part du principe que vous avez déjà utilisé le simulateur de récupération et le calculateur de délais de prescription pour savoir combien récupérer et si ce n'est pas prescrit. Ce guide ne recalcule ni l'un ni l'autre : il vous dit uniquement quels documents réunir, pays par pays, et comment les obtenir.",
      },
      {
        question: "Le guide couvre-t-il d'autres pays que la Suisse, les États-Unis et l'Allemagne ?",
        answer:
          "Non, cette édition 2026 couvre exclusivement ces trois pays. Le registre complet des autres pays reste disponible sur la page Pays du site.",
      },
      {
        question: "Est-ce un conseil fiscal personnalisé ?",
        answer:
          "Non. Ce guide est une information générale indicative ; les taux et procédures qu'il cite doivent être revalidés par un fiscaliste avant tout dépôt réel. FiscalPlace ne fournit pas de conseil fiscal personnalisé réglementé.",
      },
    ],
    bridge: {
      title: "Et si vous préférez déléguer le dépôt lui-même",
      body: "Une fois les documents réunis, il reste à déposer le dossier auprès de chaque administration et à en suivre l'instruction — plusieurs mois à plus d'un an, dans la langue du pays source, avec un risque de rejet en cas de dossier incomplet. C'est précisément cette étape que nous prenons en charge sur mandat direct, à la commission uniquement.",
      pricingLink: "Voir les tarifs",
      contactLink: "Nous contacter",
    },
    legal:
      "Document d'information générale, non contractuel. Ne constitue ni un conseil fiscal personnalisé, ni une offre de service, ni un démarchage.",
  },
  en: {
    metaTitle: "Free guide: the claim file, ready in 60 minutes — FiscalPlace",
    metaDescription:
      "Free PDF: the document checklist and ready-to-send email scripts to claim back over-withheld tax on your Swiss, US and German dividends. 2026 edition.",
    kicker: "Free guide",
    h1: "The claim file, ready in 60 minutes",
    lede: "3 countries, 1 printable checklist, 4 ready-to-send email scripts (FR/EN) — so you stop waiting another two months for your broker before you can file.",
    languageNote: "This guide is written in French; an English edition is not yet available.",
    editionBadge: "2026 edition — Switzerland · United States · Germany",
    bulletsTitle: "What you will get",
    bullets: [
      "A Switzerland / United States / Germany overview table: default rate, treaty rate, main point of contact and how long a residence certificate stays valid.",
      "A country-by-country table of the documents to gather, who issues each one, and the typical time to obtain it.",
      "Two ready-to-copy email scripts — in French and in English — to send to your broker, plus a day-15 follow-up script.",
      "The 4 mistakes that most often get a claim rejected, and how to spot them before you send.",
      "A printable final checklist to tick off each document as you gather it.",
    ],
    formTitle: "Get the guide",
    scopeNote:
      "This guide assumes you already know, via the free simulator, that you have a recoverable over-withholding, and that you have checked via the deadline calculator that it is not time-barred. It does not recalculate either.",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        question: "Does this guide replace the simulator or the deadline calculator?",
        answer:
          "No. It assumes you have already used the refund simulator and the filing-deadline calculator to know how much to recover and whether it is still within the statute of limitations. This guide does not recalculate either: it only tells you which documents to gather, country by country, and how to obtain them.",
      },
      {
        question: "Does the guide cover countries other than Switzerland, the US and Germany?",
        answer:
          "No, this 2026 edition covers exclusively these three countries. The full country registry remains available on the Countries page.",
      },
      {
        question: "Is this personalised tax advice?",
        answer:
          "No. This guide is general, indicative information; the rates and procedures it cites must be revalidated by a tax professional before any real filing. FiscalPlace does not provide regulated personalised tax advice.",
      },
    ],
    bridge: {
      title: "If you would rather delegate the filing itself",
      body: "Once the documents are gathered, the next step is filing the claim with each administration and following it through — typically several months to over a year, in the source country's language, with a risk of rejection if the file is incomplete. That is exactly the step we take on under direct mandate, on a success-fee basis only.",
      pricingLink: "See pricing",
      contactLink: "Contact us",
    },
    legal:
      "General information document, non-contractual. It does not constitute personalised tax advice, a service offer, or solicitation.",
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/* HERO                                                        */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="grid items-start gap-10 py-14 sm:py-16 lg:grid-cols-[3fr_2fr] lg:py-20">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.kicker}
            </p>
            <Badge tone="neutral">{t.editionBadge}</Badge>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl lg:text-[2.4rem]">
              {t.h1}
            </h1>
            <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-mine">{t.lede}</p>
            {t.languageNote && (
              <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-mine italic">
                {t.languageNote}
              </p>
            )}

            <h2 className="mt-9 font-display text-xl font-semibold text-ink">
              {t.bulletsTitle}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {t.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-[15px] leading-relaxed text-mine">
                  <span className="mt-1 text-brand" aria-hidden="true">
                    ✓
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-[6px] border border-rule bg-paper p-4">
              <p className="text-[14px] leading-relaxed text-mine">{t.scopeNote}</p>
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">{t.formTitle}</h2>
            <LeadMagnetForm locale={locale} idPrefix="guide-page" />
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FAQ                                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container className="py-14 sm:py-16">
          <SectionHeading title={t.faqTitle} />
          <FAQAccordion items={t.faq} className="mt-8" />
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* BRIDGE TO OFFER                                             */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <Card className="p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">{t.bridge.title}</h2>
            <p className="mt-3 max-w-[72ch] text-[15px] leading-relaxed text-mine">
              {t.bridge.body}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={href(locale, "pricing")}>{t.bridge.pricingLink} →</ButtonLink>
              <ButtonLink variant="ghost" href={href(locale, "contact")}>
                {t.bridge.contactLink}
              </ButtonLink>
            </div>
          </Card>
          <p className="mx-auto mt-8 max-w-[75ch] text-[13px] leading-relaxed text-mine">
            {t.legal}
          </p>
        </Container>
      </section>
    </>
  );
}
