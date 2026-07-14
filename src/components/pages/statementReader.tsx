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
    metaDescription: `Déposez votre relevé (PDF, CSV, TXT) ou collez une ligne de dividende : l'outil détecte chaque ligne, le pays (via l'ISIN), le brut et la retenue, calcule le taux réellement appliqué et le compare aux conventions fiscales de ${N_COUNTRIES} pays. Gratuit, sans compte, analyse 100 % dans votre navigateur.`,
    hero: {
      kicker: "Outil self-service · Gratuit · Sans compte",
      title: "Le lecteur de relevé : sur-prélevé ou pas ?",
      lede: `Chaque ligne de dividende étranger contient deux chiffres que presque personne ne compare : le brut et l'impôt retenu. Déposez votre relevé (PDF, CSV, TXT) ou collez une ligne telle quelle — l'outil reconnaît chaque pays via l'ISIN, retrouve les montants, calcule le taux réellement appliqué et le compare à ce que la convention fiscale autorise pour votre résidence, ligne après ligne si le fichier en contient plusieurs. Verdict en dix secondes, ${N_COUNTRIES} pays couverts.`,
    },
    toolFallback: "Chargement du lecteur…",
    how: {
      kicker: "Mode d'emploi",
      title: "Quel document déposer",
      lede: "N'importe quel document qui montre le brut et l'impôt retenu convient — en français ou en anglais, en PDF, CSV ou TXT.",
      items: [
        {
          title: "L'export CSV du relevé d'opérations",
          body: "Chez la plupart des courtiers : rubrique « opérations », « coupons » ou « dividendes » de votre espace client, avec une option d'export. C'est le format le plus fiable — une ligne par dividende, l'ISIN identifie le pays tout seul.",
        },
        {
          title: "L'avis d'opéré ou le décompte de coupon en PDF",
          body: "Le document PDF émis à chaque versement, ou le rapport fiscal annuel complet. L'outil extrait le texte du PDF directement dans votre navigateur et repère chaque ligne de dividende, même sur plusieurs pages.",
        },
        {
          title: "Une seule ligne, copiée à la main",
          body: "Pas de fichier sous la main ? Collez simplement la ligne — brut, retenue, ISIN — dans le champ manuel plus bas. C'est le même moteur d'analyse, juste sans le fichier autour.",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur le lecteur de relevé",
      items: [
        {
          question: "Mon fichier ou mes données de relevé sont-ils envoyés quelque part ?",
          answer:
            "Non. Le fichier déposé ou le texte collé sont lus intégralement dans votre navigateur — extraction du PDF comprise — sans jamais transiter par un serveur ni être enregistrés : tout disparaît quand vous quittez la page. C'est aussi pour cela que l'outil fonctionne hors connexion une fois la page chargée.",
        },
        {
          question: "Quels formats de fichiers l'outil accepte-t-il ?",
          answer:
            "PDF, CSV et TXT, en plus du collage manuel. Les montants en notation française (1 234,56) ou anglo-saxonne (1,234.56), les libellés « brut / retenue / net » ou « gross / withholding tax / net », ISIN, devises, pourcentages sont tous reconnus. Si la détection se trompe sur une ligne, les quatre champs du diagnostic détaillé restent modifiables à la main.",
        },
        {
          question: "Mon PDF est un scan : ça fonctionne quand même ?",
          answer:
            "Non, pas directement : l'outil lit le texte du PDF, pas une image. Un PDF scanné (sans texte sélectionnable) ne donnera aucun résultat — le mieux est alors d'exporter un CSV depuis votre courtier, ou de recopier les montants à la main dans le champ manuel.",
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
          question: "Le fichier contient plusieurs dividendes : ça marche comment ?",
          answer:
            "L'outil détecte chaque ligne de dividende du fichier et les liste dans un tableau, une par une, avec leur taux et leur statut. Cliquez une ligne pour afficher son diagnostic complet en dessous. Pour chiffrer l'ensemble du portefeuille commission déduite, le simulateur est l'étape suivante.",
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
    metaDescription: `Upload your statement (PDF, CSV, TXT) or paste a dividend line: the tool detects every line, the country (via the ISIN), the gross and the withholding, computes the rate actually applied and compares it with the tax treaties of ${N_COUNTRIES} countries. Free, no account, 100% in-browser analysis.`,
    hero: {
      kicker: "Self-service tool · Free · No account",
      title: "The statement reader: over-withheld or not?",
      lede: `Every foreign-dividend line holds two figures almost nobody compares: the gross and the tax withheld. Upload your statement (PDF, CSV, TXT) or paste a line as is — the tool recognises every country via the ISIN, finds the amounts, computes the rate actually applied and compares it with what the tax treaty allows for your residence, line by line when the file holds several. Verdict in ten seconds, ${N_COUNTRIES} countries covered.`,
    },
    toolFallback: "Loading the reader…",
    how: {
      kicker: "How to use it",
      title: "Which document to upload",
      lede: "Any document showing the gross and the tax withheld will do — in French or in English, as a PDF, CSV or TXT.",
      items: [
        {
          title: "The CSV export of your transaction statement",
          body: "With most brokers: the 'transactions', 'coupons' or 'dividends' section of your client area has an export option. It is the most reliable format — one line per dividend, the ISIN identifies the country on its own.",
        },
        {
          title: "The contract note or coupon advice, as a PDF",
          body: "The PDF issued at each payment, or the full annual tax report. The tool extracts the PDF's text directly in your browser and finds every dividend line, even across several pages.",
        },
        {
          title: "A single line, typed by hand",
          body: "No file at hand? Just paste the line — gross, withholding, ISIN — into the manual field further down. It is the same analysis engine, minus the file around it.",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your questions about the statement reader",
      items: [
        {
          question: "Is my uploaded file or statement data sent anywhere?",
          answer:
            "No. An uploaded file or pasted text is read entirely in your browser — PDF extraction included — never transmitted to a server, never stored: it all vanishes when you leave the page. That is also why the tool keeps working offline once the page has loaded.",
        },
        {
          question: "Which file formats does the tool accept?",
          answer:
            "PDF, CSV and TXT, on top of manual paste. Amounts in French notation (1 234,56) or Anglo-Saxon notation (1,234.56), 'brut / retenue / net' or 'gross / withholding tax / net' labels, ISINs, currencies, percentages are all recognised. If detection gets a line wrong, the four fields of the detailed diagnosis remain hand-editable.",
        },
        {
          question: "My PDF is a scan — will that work?",
          answer:
            "Not directly: the tool reads the PDF's text, not an image. A scanned PDF with no selectable text will yield no results — the best move then is to export a CSV from your broker instead, or type the amounts into the manual field.",
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
          question: "The file has several dividends — how does that work?",
          answer:
            "The tool detects every dividend line in the file and lists them in a table, one by one, with their rate and status. Click a line to see its full diagnosis below. To quantify the whole portfolio, fee deducted, the simulator is the next step.",
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
