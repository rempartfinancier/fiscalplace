import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { COUNTRIES } from "@/data/countries";
import { getCommon } from "@/content/common";
import { ButtonLink, Card, Container, SectionHeading, TrustLine } from "@/components/ui/primitives";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { StatementReaderTool } from "@/components/site/StatementReaderTool";

const N_COUNTRIES = COUNTRIES.length;

/* ----------------------------------------------------------------- copy */

interface PageCopy {
  metaTitle: string;
  metaDescription: string;
  hero: { kicker: string; title: string; lede: string };
  toolFallback: string;
  how: {
    kicker: string;
    title: string;
    lede: string;
    items: { title: string; body: string }[];
  };
  faq: { kicker: string; title: string; items: { question: string; answer: string }[] };
  final: { title: string; body: string };
}

const copy: Localized<PageCopy> = {
  fr: {
    metaTitle: "Lecteur de relevé : votre dividende a-t-il été trop retenu ?",
    metaDescription: `Collez une ligne de dividende de votre relevé de courtage : l'outil détecte le pays (via l'ISIN), le brut et la retenue, calcule le taux réellement appliqué et le compare aux conventions fiscales de ${N_COUNTRIES} pays. Gratuit, sans compte, analyse 100 % dans votre navigateur.`,
    hero: {
      kicker: "Outil self-service · Gratuit · Sans compte",
      title: "Le lecteur de relevé : sur-prélevé ou pas ?",
      lede: `Chaque ligne de dividende étranger contient deux chiffres que presque personne ne compare : le brut et l'impôt retenu. Collez la ligne telle quelle — l'outil reconnaît le pays via l'ISIN, retrouve les montants, calcule le taux réellement appliqué et le compare à ce que la convention fiscale autorise pour votre résidence. Verdict en dix secondes, ${N_COUNTRIES} pays couverts.`,
    },
    toolFallback: "Chargement du lecteur…",
    how: {
      kicker: "Mode d'emploi",
      title: "Où trouver la ligne à coller",
      lede: "N'importe quel document qui montre le brut et l'impôt retenu convient — en français ou en anglais.",
      items: [
        {
          title: "Le relevé d'opérations sur titres",
          body: "Chez la plupart des courtiers : rubrique « opérations », « coupons » ou « dividendes » de votre espace client. Copiez la ou les lignes de l'opération, avec les montants — l'ISIN, s'il figure, identifie le pays tout seul.",
        },
        {
          title: "L'avis d'opéré ou le décompte de coupon",
          body: "Le document PDF émis à chaque versement. C'est le plus complet : brut, taux appliqué, impôt retenu, net crédité. Un copier-coller du bloc central suffit, mise en forme comprise.",
        },
        {
          title: "Le rapport fiscal annuel",
          body: "La synthèse annuelle de votre courtier liste tous les dividendes et retenues de l'année. Collez une ligne à la fois : le diagnostic vaut par versement, pas en cumul — deux taux différents peuvent se cacher dans un total.",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur le lecteur de relevé",
      items: [
        {
          question: "Mes données de relevé sont-elles envoyées quelque part ?",
          answer:
            "Non. L'analyse s'exécute intégralement dans votre navigateur : le texte collé n'est transmis à aucun serveur, n'est pas enregistré, et disparaît quand vous quittez la page. C'est aussi pour cela que l'outil fonctionne hors connexion une fois la page chargée.",
        },
        {
          question: "Quels formats de relevés l'outil comprend-il ?",
          answer:
            "Les formats usuels des courtiers français et internationaux : montants en notation française (1 234,56) ou anglo-saxonne (1,234.56), libellés « brut / retenue / net » ou « gross / withholding tax / net », ISIN, devises, pourcentages. Si la détection se trompe, les quatre champs restent modifiables à la main — le diagnostic repart de vos corrections.",
        },
        {
          question: "L'outil fonctionne-t-il pour les ETF et les fonds ?",
          answer:
            "Il les détecte, justement pour vous éviter une fausse joie : dans un fonds ou un ETF, la retenue est prélevée au niveau du fonds et ne vous appartient pas — il n'y a rien à réclamer pour le porteur de parts. Le diagnostic ne vaut que pour les titres détenus en direct.",
        },
        {
          question: "Le verdict vaut-il analyse fiscale ?",
          answer:
            "Non : c'est un diagnostic indicatif, fondé sur les taux généraux de notre base pays, revue régulièrement. Il vous dit si une ligne mérite un dossier — le dossier lui-même est ensuite vérifié ligne à ligne, taux et délais compris, avant tout dépôt. Et s'il n'y a rien à récupérer, l'outil vous le dit aussi.",
        },
        {
          question: "Puis-je coller plusieurs lignes d'un coup ?",
          answer:
            "Collez les lignes d'un seul et même versement (brut, impôt, net) — c'est le cas idéal. Pour plusieurs dividendes différents, analysez-les un par un : l'outil vous prévient s'il détecte plusieurs titres dans le texte. Pour chiffrer un portefeuille entier, le simulateur est l'étape suivante.",
        },
      ],
    },
    final: {
      title: "Une ligne sur-prélevée en cache rarement une seule",
      body: "Le même courtier, la même chaîne de dépositaires, les mêmes défauts de paramétrage : si cette ligne était au taux plein, les autres versements du même titre le sont probablement aussi. Le simulateur chiffre l'ensemble, pays par pays, commission déduite.",
    },
  },
  en: {
    metaTitle: "Statement reader: was your dividend over-withheld?",
    metaDescription: `Paste a dividend line from your brokerage statement: the tool detects the country (via the ISIN), the gross and the withholding, computes the rate actually applied and compares it with the tax treaties of ${N_COUNTRIES} countries. Free, no account, 100% in-browser analysis.`,
    hero: {
      kicker: "Self-service tool · Free · No account",
      title: "The statement reader: over-withheld or not?",
      lede: `Every foreign-dividend line holds two figures almost nobody compares: the gross and the tax withheld. Paste the line as is — the tool recognises the country via the ISIN, finds the amounts, computes the rate actually applied and compares it with what the tax treaty allows for your residence. Verdict in ten seconds, ${N_COUNTRIES} countries covered.`,
    },
    toolFallback: "Loading the reader…",
    how: {
      kicker: "How to use it",
      title: "Where to find the line to paste",
      lede: "Any document showing the gross and the tax withheld will do — in French or in English.",
      items: [
        {
          title: "The securities transaction statement",
          body: "With most brokers: the 'transactions', 'coupons' or 'dividends' section of your client area. Copy the operation's line or lines, amounts included — the ISIN, when present, identifies the country on its own.",
        },
        {
          title: "The contract note or coupon advice",
          body: "The PDF issued at each payment. It is the most complete: gross, rate applied, tax withheld, net credited. A copy-paste of the central block is enough, formatting included.",
        },
        {
          title: "The annual tax report",
          body: "Your broker's yearly summary lists every dividend and withholding of the year. Paste one line at a time: the diagnosis holds per payment, not in aggregate — two different rates can hide inside one total.",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your questions about the statement reader",
      items: [
        {
          question: "Is my statement data sent anywhere?",
          answer:
            "No. The analysis runs entirely in your browser: the pasted text is transmitted to no server, is not stored, and vanishes when you leave the page. That is also why the tool keeps working offline once the page has loaded.",
        },
        {
          question: "Which statement formats does the tool understand?",
          answer:
            "The usual formats of French and international brokers: amounts in French notation (1 234,56) or Anglo-Saxon notation (1,234.56), 'brut / retenue / net' or 'gross / withholding tax / net' labels, ISINs, currencies, percentages. If detection gets something wrong, all four fields remain hand-editable — the diagnosis restarts from your corrections.",
        },
        {
          question: "Does the tool work for ETFs and funds?",
          answer:
            "It detects them, precisely to spare you false hope: in a fund or ETF, the withholding is levied at fund level and does not belong to you — there is nothing for the unit-holder to claim. The diagnosis only holds for securities held directly.",
        },
        {
          question: "Does the verdict amount to tax analysis?",
          answer:
            "No: it is an indicative diagnosis, based on the general rates of our country database, reviewed regularly. It tells you whether a line deserves a file — the file itself is then verified line by line, rates and deadlines included, before any filing. And if there is nothing to recover, the tool says so too.",
        },
        {
          question: "Can I paste several lines at once?",
          answer:
            "Paste the lines of one single payment (gross, tax, net) — that is the ideal case. For several different dividends, analyse them one by one: the tool warns you when it detects several securities in the text. To quantify a whole portfolio, the simulator is the next step.",
        },
      ],
    },
    final: {
      title: "One over-withheld line rarely comes alone",
      body: "Same broker, same custody chain, same setup flaws: if this line was withheld at the full rate, the same security's other payments probably were too. The simulator quantifies the whole picture, country by country, fee deducted.",
    },
  },
};

/* ------------------------------------------------------------------- page */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule bg-white">
        <Container className="py-12 sm:py-16">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[24ch] font-display text-4xl font-semibold text-ink sm:text-5xl text-balance">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.hero.lede}</p>
        </Container>
      </section>

      {/* Tool — rendered directly: the component never suspends, and dev-mode
          Suspense reveal is unreliable in this setup (see CHANGELOG §1). */}
      <section>
        <Container className="py-10 sm:py-12">
          <StatementReaderTool locale={locale} />
        </Container>
      </section>

      {/* How to */}
      <section className="border-t border-rule bg-white">
        <Container className="py-12 sm:py-16">
          <SectionHeading kicker={t.how.kicker} title={t.how.title} lede={t.how.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {t.how.items.map((item) => (
              <Card key={item.title} className="p-5 sm:p-6">
                <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{item.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-12 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={t.faq.items} className="mt-8" />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rule bg-white">
        <Container className="py-12 sm:py-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl text-balance">
            {t.final.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-[17px] leading-relaxed text-mine">
            {t.final.body}
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <TrustLine text={common.trustLine} />
          </div>
        </Container>
      </section>
    </>
  );
}
