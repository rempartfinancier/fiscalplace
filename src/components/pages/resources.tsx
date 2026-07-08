import Link from "next/link";
import { formatDate, type Locale, type Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { articleHref, href, type RouteKey } from "@/lib/routes";
import { ARTICLES } from "@/data/articles";
import { CATEGORY_LABELS, type Article, type ArticleCategory } from "@/data/articles/types";
import { getCommon } from "@/content/common";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";

/**
 * Resources hub — the public library of Big 5 answers (cost, problems,
 * comparisons, rankings), with the self-service tools presented first.
 */

/** Display order of the hub sections; a section only renders if populated. */
const CATEGORY_ORDER: ArticleCategory[] = ["cost", "problems", "comparisons", "best", "reviews"];

interface SectionCopy {
  kicker: string;
  title: string;
  lede: string;
}

const copy: Localized<{
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  manifesto: string;
  note: string;
  readingTime: (min: number) => string;
  tools: {
    kicker: string;
    title: string;
    lede: string;
    tag: string;
    open: string;
    items: { routeKey: RouteKey; title: string; description: string }[];
  };
  sections: Record<ArticleCategory, SectionCopy>;
  finalCta: { title: string; text: string; secondary: string };
}> = {
  fr: {
    metaTitle: "Ressources — prix, problèmes, comparaisons",
    metaDescription:
      "Les réponses publiques aux questions qui précèdent un dossier de récupération de retenue à la source : ce que ça coûte vraiment, ce qui peut mal tourner, et les comparaisons honnêtes entre solutions.",
    kicker: "Ressources",
    h1: "Tout ce qu'on nous demande, répondu en public",
    manifesto:
      "Les questions que vous vous posez avant de nous confier un dossier — prix, problèmes, comparaisons — méritent des réponses publiques, pas un rendez-vous commercial.",
    note: "Lecture libre, sans inscription. Chaque article affiche la date de sa dernière revue.",
    readingTime: (min) => `${min} min de lecture`,
    tools: {
      kicker: "Self-service",
      title: "Les réponses les plus rapides ne sont pas des articles",
      lede: "Avant de lire quoi que ce soit : deux outils gratuits donnent une réponse chiffrée à votre situation, en quelques minutes et sans créer de compte.",
      tag: "Gratuit · sans compte",
      open: "Ouvrir l'outil",
      items: [
        {
          routeKey: "simulator",
          title: "Simulateur de récupération",
          description:
            "Vos dividendes, les taux des conventions fiscales, notre commission déduite : le net récupérable sur votre portefeuille, pays par pays.",
        },
        {
          routeKey: "solCalculator",
          title: "Calculateur de prescription",
          description:
            "Chaque pays efface les trop-perçus passé son délai. Vérifiez ce qui reste récupérable dans votre historique — et ce qui expire bientôt.",
        },
      ],
    },
    sections: {
      cost: {
        kicker: "Prix",
        title: "Ce que ça coûte, vraiment",
        lede: "Notre commission, les coûts cachés du fait-maison, et pourquoi ce secteur cache si souvent ses prix : tout est chiffré.",
      },
      problems: {
        kicker: "Problèmes",
        title: "Ce qui peut mal tourner",
        lede: "Rejets, prescriptions dépassées, W-8BEN expirés : les pièges réels des dossiers de récupération, et comment nous les traitons quand ils surviennent.",
      },
      comparisons: {
        kicker: "Comparaisons",
        title: "Nous, votre courtier, ou vous-même",
        lede: "Des comparaisons honnêtes entre les options — y compris quand la meilleure option n'est pas nous.",
      },
      best: {
        kicker: "Classements",
        title: "Les meilleurs dossiers à ouvrir",
        lede: "Pays, délais, potentiels de récupération : des classements fondés sur notre base de données, pas sur l'enthousiasme.",
      },
      reviews: {
        kicker: "Avis",
        title: "Avis & retours",
        lede: "Comment nous collectons et vérifions les retours de clients — et où les lire.",
      },
    },
    finalCta: {
      title: "Votre question n'est pas dans la liste ?",
      text: "Posez-la nous : la réponse est publique par principe, et si elle manque ici, elle deviendra probablement un article. Et si vous voulez simplement un chiffre pour votre portefeuille, le simulateur reste le chemin le plus court.",
      secondary: "Poser ma question",
    },
  },
  en: {
    metaTitle: "Resources — pricing, problems, comparisons",
    metaDescription:
      "Public answers to the questions that come before any withholding-tax claim: what it really costs, what can go wrong, and honest comparisons between your options.",
    kicker: "Resources",
    h1: "Everything we get asked, answered in public",
    manifesto:
      "The questions you ask yourself before trusting us with a claim — price, problems, comparisons — deserve public answers, not a sales call.",
    note: "Free to read, no sign-up. Every article shows the date of its last review.",
    readingTime: (min) => `${min} min read`,
    tools: {
      kicker: "Self-service",
      title: "The fastest answers aren't articles",
      lede: "Before you read anything: two free tools give you a figure for your own situation, in minutes and without creating an account.",
      tag: "Free · no account",
      open: "Open the tool",
      items: [
        {
          routeKey: "simulator",
          title: "Refund simulator",
          description:
            "Your dividends, the applicable treaty rates, our fee deducted: the recoverable net on your portfolio, country by country.",
        },
        {
          routeKey: "solCalculator",
          title: "Deadline calculator",
          description:
            "Every country writes off over-withholding once its deadline passes. Check what is still recoverable in your history — and what expires soon.",
        },
      ],
    },
    sections: {
      cost: {
        kicker: "Pricing",
        title: "What it really costs",
        lede: "Our fee, the hidden costs of doing it yourself, and why this industry so often hides its prices: everything in figures.",
      },
      problems: {
        kicker: "Problems",
        title: "What can go wrong",
        lede: "Rejections, missed deadlines, lapsed W-8BEN forms: the real traps in recovery claims, and how we handle them when they happen.",
      },
      comparisons: {
        kicker: "Comparisons",
        title: "Us, your broker, or doing it yourself",
        lede: "Honest comparisons between your options — including when the best option is not us.",
      },
      best: {
        kicker: "Rankings",
        title: "The best claims to open",
        lede: "Countries, deadlines, recovery potential: rankings built on our country database, not on enthusiasm.",
      },
      reviews: {
        kicker: "Reviews",
        title: "Reviews & feedback",
        lede: "How we collect and verify client feedback — and where to read it.",
      },
    },
    finalCta: {
      title: "Your question isn't on the list?",
      text: "Ask us: answers are public by principle, and if yours is missing here, it will probably become an article. And if all you want is a figure for your portfolio, the simulator remains the shortest path.",
      secondary: "Ask my question",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

function ArticleCard({
  locale,
  article,
  readingTime,
}: {
  locale: Locale;
  article: Article;
  readingTime: (min: number) => string;
}) {
  return (
    <li className="h-full">
      <Link
        href={articleHref(locale, article.slug[locale])}
        className="group flex h-full flex-col rounded-[6px] border border-rule bg-white p-5 transition-colors hover:border-brand"
      >
        <div>
          <Badge>{CATEGORY_LABELS[article.category][locale]}</Badge>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          {article.title[locale]}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-mine">{article.description[locale]}</p>
        <p className="mt-auto pt-4 font-mono text-xs text-mine">
          <time dateTime={article.updated}>{formatDate(article.updated, locale)}</time>
          <span aria-hidden="true"> · </span>
          {readingTime(article.readingMinutes)}
        </p>
      </Link>
    </li>
  );
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const sections = CATEGORY_ORDER.map((category) => ({
    category,
    articles: ARTICLES.filter((a) => a.category === category),
  })).filter((s) => s.articles.length > 0);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        {/* Manifesto */}
        <header className="max-w-[75ch]">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.kicker}
          </p>
          <h1 className="mt-2 text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t.h1}
          </h1>
          <p className="mt-4 max-w-[68ch] text-lg leading-relaxed text-mine">{t.manifesto}</p>
          <p className="mt-4 font-mono text-[13px] text-mine">{t.note}</p>
        </header>

        {/* Self-service first: the fastest answers */}
        <section className="mt-14">
          <SectionHeading kicker={t.tools.kicker} title={t.tools.title} lede={t.tools.lede} />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {t.tools.items.map((tool) => (
              <li key={tool.routeKey} className="h-full">
                <Link
                  href={href(locale, tool.routeKey)}
                  className="group flex h-full flex-col rounded-[6px] border border-rule bg-white p-5 transition-colors hover:border-brand"
                >
                  <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-gold-ink">
                    {t.tools.tag}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink transition-colors group-hover:text-brand">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-mine">{tool.description}</p>
                  <p className="mt-auto pt-4 text-sm font-medium text-brand">
                    {t.tools.open} <span aria-hidden="true">→</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Big 5 sections, in reading order */}
        {sections.map(({ category, articles }) => (
          <section key={category} className="mt-16">
            <SectionHeading
              kicker={`${t.sections[category].kicker} · ${articles.length}`}
              title={t.sections[category].title}
              lede={t.sections[category].lede}
            />
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  locale={locale}
                  article={article}
                  readingTime={t.readingTime}
                />
              ))}
            </ul>
          </section>
        ))}

        {/* Final CTA */}
        <section className="mt-16" aria-labelledby="resources-final-cta">
          <Card className="p-6 sm:p-8">
            <h2 id="resources-final-cta" className="font-display text-2xl font-semibold text-ink">
              {t.finalCta.title}
            </h2>
            <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
              {t.finalCta.text}
            </p>
            <div className="mt-5 flex flex-col items-start gap-3">
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
                <ButtonLink href={href(locale, "contact")} variant="secondary">
                  {t.finalCta.secondary}
                </ButtonLink>
              </div>
              <TrustLine text={common.trustLine} />
            </div>
          </Card>
        </section>
      </Container>
    </div>
  );
}
