import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, articleHref } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { rejectionReasons } from "@/data/articles/rejection-reasons";
import {
  Container,
  ButtonLink,
  Card,
  Badge,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";

/**
 * REVIEWS — the anti-fake-review page.
 * Hard guardrail (conventions §5): ZERO invented testimonials. The page ships
 * the finished structure (policy, verified-review card layout, third-party
 * platform slot) with explicit placeholders, and openly says why it is empty.
 */

interface ReviewsCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  lede: string;
  policy: {
    kicker: string;
    title: string;
    lede: string;
    rules: { title: string; body: string }[];
  };
  state: {
    counterLabel: string;
    counterValue: string;
    title: string;
    body: string;
  };
  grid: {
    kicker: string;
    title: string;
    verifiedBadge: string;
    ratingPlaceholder: string;
    quotePlaceholder: string;
    namePlaceholder: string;
    datePlaceholder: string;
    countryLabel: string;
    countryPlaceholder: string;
    amountLabel: string;
    amountPlaceholder: string;
  };
  verify: {
    kicker: string;
    title: string;
    lede: string;
    cards: { title: string; body: string; linkLabel: string }[];
  };
  finalCta: {
    title: string;
    lede: string;
  };
}

const copy: Localized<ReviewsCopy> = {
  fr: {
    metaTitle: "Avis clients FiscalPlace — vérifiés, jamais achetés",
    metaDescription:
      "Notre politique d'avis avant nos avis : collectés après versement effectif uniquement, jamais incités ni réécrits, les négatifs publiés et répondus. Zéro faux avis, même au lancement.",
    kicker: "Avis clients",
    h1: "Les avis de nos clients — vérifiés, jamais achetés",
    lede: "Cette page est prête pour nos premiers retours : nous avons choisi de ne jamais afficher de faux avis, même au lancement. Voici d'abord les règles que chaque avis publié ici devra respecter — puis, en attendant, tout ce que vous pouvez déjà vérifier par vous-même.",
    policy: {
      kicker: "La politique, avant les avis",
      title: "Cinq règles, publiées avant le premier avis",
      lede: "Un avis ne vaut que par la façon dont il a été obtenu. Ces règles s'appliqueront au premier avis comme au millième, et cette page pourra vous servir de preuve si nous y dérogeons un jour.",
      rules: [
        {
          title: "Collecté après versement effectif, jamais avant",
          body: "Un avis ne peut être déposé qu'une fois le dossier soldé : remboursement reçu par le client, commission facturée, écriture fermée. Personne ne note une promesse — on note un résultat.",
        },
        {
          title: "Jamais incité, jamais rémunéré",
          body: "Aucune remise, aucun cadeau, aucun tirage au sort en échange d'un avis. Un avis obtenu contre avantage est biaisé par construction, même quand il est sincère.",
        },
        {
          title: "Jamais réécrit, jamais trié",
          body: "Publication telle quelle, formulation et fautes comprises. Pas de sélection des meilleurs, pas de « modération » qui fait discrètement disparaître les deux étoiles.",
        },
        {
          title: "Les négatifs sont publiés — et reçoivent une réponse publique",
          body: "Un avis négatif reste en ligne comme les autres et reçoit une réponse factuelle de la personne qui a traité le dossier : ce qui s'est passé, ce qui a été corrigé, ce qui ne pouvait pas l'être.",
        },
        {
          title: "Collecte et authentification par un tiers indépendant",
          body: "Le recueil des avis et la vérification « client réel » passeront par une plateforme d'avis tierce, consultable hors de nos pages : [PLATEFORME D'AVIS TIERS À CHOISIR : EX. TRUSTPILOT — DÉCISION HUMAINE].",
        },
      ],
    },
    state: {
      counterLabel: "Avis publiés à ce jour",
      counterValue: "0",
      title: "Zéro avis affiché, et c'est volontaire",
      body: "FiscalPlace est en lancement : aucun client réel n'a encore été remboursé, donc aucun avis réel n'existe. Plutôt que d'acheter des étoiles ou d'inventer des prénoms, nous publions la maquette exacte des futurs avis — note, date, pays du dossier, montant — et la laissons vide jusqu'aux premiers dossiers clôturés.",
    },
    grid: {
      kicker: "L'emplacement",
      title: "À quoi ressemblera chaque avis publié ici",
      verifiedBadge: "Avis vérifié",
      ratingPlaceholder: "[NOTE] / 5",
      quotePlaceholder:
        "[TÉMOIGNAGE CLIENT RÉEL À INTÉGRER APRÈS LES PREMIERS DOSSIERS CLÔTURÉS]",
      namePlaceholder: "[PRÉNOM ET INITIALE]",
      datePlaceholder: "[DATE DE L'AVIS]",
      countryLabel: "Pays du dossier :",
      countryPlaceholder: "[PAYS]",
      amountLabel: "Montant récupéré :",
      amountPlaceholder: "[MONTANT]",
    },
    verify: {
      kicker: "En attendant",
      title: "Ce que vous pouvez déjà vérifier, sans nous croire sur parole",
      lede: "La confiance ne se décrète pas : elle se recoupe. Trois choses sont déjà publiques et vérifiables aujourd'hui, avis ou pas.",
      cards: [
        {
          title: "Le barème, en entier",
          body: "Tous nos prix sont publics : commission au succès tranche par tranche, plancher, plafond, forfaits fixes, exemples calculés. Aucun « sur devis ».",
          linkLabel: "Voir les tarifs publics",
        },
        {
          title: "Nos échecs possibles, documentés",
          body: "Les sept motifs de rejet les plus fréquents d'une demande de remboursement, publiés avant que vous ne posiez la question — avec ce que nous faisons quand ça arrive.",
          linkLabel: "Lire l'article sur les rejets",
        },
        {
          title: "Le produit, en vrai",
          body: "L'espace client complet se visite en démonstration publique : dossiers fictifs à tous les stades, documents, messages, facturation. Sans inscription, sans email.",
          linkLabel: "Explorer la démo du portail",
        },
      ],
    },
    finalCta: {
      title: "Le meilleur juge de FiscalPlace, ce sont vos relevés",
      lede: "Deux minutes, sans email : le simulateur applique les taux conventionnels à vos dividendes et affiche ce qu'on vous doit — commission déduite.",
    },
  },
  en: {
    metaTitle: "FiscalPlace client reviews — verified, never bought",
    metaDescription:
      "Our review policy before our reviews: collected only after the refund is actually paid out, never incentivised or rewritten, negatives published and answered. Zero fake reviews, even at launch.",
    kicker: "Client reviews",
    h1: "Our clients' reviews — verified, never bought",
    lede: "This page is ready for our first feedback: we chose never to display fake reviews, even at launch. Here are, first, the rules every review published here will have to meet — then everything you can already verify for yourself in the meantime.",
    policy: {
      kicker: "The policy, before the reviews",
      title: "Five rules, published before the first review",
      lede: "A review is only worth as much as the way it was obtained. These rules will apply to the first review as to the thousandth, and this page will serve as evidence if we ever break them.",
      rules: [
        {
          title: "Collected after the payout, never before",
          body: "A review can only be left once the claim is settled: refund received by the client, fee invoiced, entry closed. Nobody rates a promise — you rate a result.",
        },
        {
          title: "Never incentivised, never paid for",
          body: "No discount, no gift, no prize draw in exchange for a review. A review obtained against a benefit is biased by construction, even when it is sincere.",
        },
        {
          title: "Never rewritten, never filtered",
          body: "Published as written, wording and typos included. No cherry-picking the best ones, no “moderation” that quietly makes the two-star reviews disappear.",
        },
        {
          title: "Negatives stay up — and get a public answer",
          body: "A negative review remains online like any other and receives a factual reply from the person who handled the claim: what happened, what was fixed, what could not be.",
        },
        {
          title: "Collection and authentication by an independent third party",
          body: "Review collection and “real client” verification will run through a third-party review platform, checkable outside our own pages: [THIRD-PARTY REVIEW PLATFORM TO BE CHOSEN: E.G. TRUSTPILOT — HUMAN DECISION].",
        },
      ],
    },
    state: {
      counterLabel: "Reviews published to date",
      counterValue: "0",
      title: "Zero reviews shown — on purpose",
      body: "FiscalPlace is launching: no real client has been refunded yet, so no real review exists. Rather than buying stars or inventing first names, we publish the exact template of future reviews — rating, date, claim country, amount — and leave it empty until the first claims close.",
    },
    grid: {
      kicker: "The slot",
      title: "What every review published here will look like",
      verifiedBadge: "Verified review",
      ratingPlaceholder: "[RATING] / 5",
      quotePlaceholder:
        "[REAL CLIENT TESTIMONIAL — TO BE ADDED AFTER THE FIRST CLOSED CLAIMS]",
      namePlaceholder: "[FIRST NAME AND INITIAL]",
      datePlaceholder: "[REVIEW DATE]",
      countryLabel: "Claim country:",
      countryPlaceholder: "[COUNTRY]",
      amountLabel: "Amount recovered:",
      amountPlaceholder: "[AMOUNT]",
    },
    verify: {
      kicker: "In the meantime",
      title: "What you can already verify, without taking our word for it",
      lede: "Trust is not declared: it is cross-checked. Three things are already public and verifiable today, reviews or not.",
      cards: [
        {
          title: "The fee schedule, in full",
          body: "All our prices are public: success fee slice by slice, floor, cap, fixed-fee services, worked examples. Nothing is “on request”.",
          linkLabel: "See the public pricing",
        },
        {
          title: "Our possible failures, documented",
          body: "The seven most frequent reasons refund claims get rejected, published before you even ask — with what we do when it happens.",
          linkLabel: "Read the rejections article",
        },
        {
          title: "The product, for real",
          body: "The full client area is open as a public demo: fictitious claims at every stage, documents, messages, billing. No sign-up, no email.",
          linkLabel: "Explore the portal demo",
        },
      ],
    },
    finalCta: {
      title: "The best judge of FiscalPlace is your own statements",
      lede: "Two minutes, no email: the simulator applies treaty rates to your dividends and shows what you are owed — fee already deducted.",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

/** Three identical, honest slots: the layout is final, the content is awaited. */
const REVIEW_SLOTS = [0, 1, 2] as const;

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  return (
    <>
      {/* -------------------------------------------------------------- */}
      {/* HERO                                                            */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.kicker}
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl">
            {t.h1}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.lede}</p>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* POLICY — before any review                                      */}
      {/* -------------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.policy.kicker}
            title={t.policy.title}
            lede={t.policy.lede}
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.policy.rules.map((rule, i) => (
              <Card as="li" key={rule.title} className="p-5">
                <p className="font-mono text-xs font-medium text-mine">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                  {rule.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{rule.body}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* HONEST STATE + REVIEW SLOTS                                     */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-2xl font-medium text-ink">
                {t.state.counterValue}
              </span>
              <span className="font-mono text-xs font-medium uppercase tracking-wide text-mine">
                {t.state.counterLabel}
              </span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
              {t.state.title}
            </h2>
            <p className="mt-3 max-w-[75ch] text-[15px] leading-relaxed text-mine">
              {t.state.body}
            </p>
          </Card>

          <SectionHeading className="mt-12" kicker={t.grid.kicker} title={t.grid.title} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEW_SLOTS.map((slot) => (
              <Card as="article" key={slot} className="flex flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-baseline gap-2">
                    <span aria-hidden="true" className="text-mine">
                      ☆☆☆☆☆
                    </span>
                    <span className="font-mono text-xs text-mine">
                      {t.grid.ratingPlaceholder}
                    </span>
                  </span>
                  <Badge tone="neutral">{t.grid.verifiedBadge}</Badge>
                </div>
                <blockquote className="mt-4 flex-1 rounded-[4px] bg-paper px-3 py-3 text-[15px] leading-relaxed text-mine">
                  {t.grid.quotePlaceholder}
                </blockquote>
                <footer className="mt-4 border-t border-rule pt-3">
                  <p className="font-mono text-xs text-mine">
                    {t.grid.namePlaceholder} · {t.grid.datePlaceholder}
                  </p>
                  <p className="mt-1 font-mono text-xs text-mine">
                    {t.grid.countryLabel} {t.grid.countryPlaceholder} ·{" "}
                    {t.grid.amountLabel} {t.grid.amountPlaceholder}
                  </p>
                </footer>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* WHAT IS ALREADY VERIFIABLE                                      */}
      {/* -------------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.verify.kicker}
            title={t.verify.title}
            lede={t.verify.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.verify.cards.map((card, i) => {
              const target =
                i === 0
                  ? href(locale, "pricing")
                  : i === 1
                    ? articleHref(locale, rejectionReasons.slug[locale])
                    : href(locale, "portal");
              return (
                <Card key={card.title} className="flex flex-col p-5">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {card.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">
                    {card.body}
                  </p>
                  <Link
                    href={target}
                    className="mt-3 text-[15px] font-medium text-brand hover:underline underline-offset-4"
                  >
                    {card.linkLabel} →
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* FINAL CTA                                                       */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <TrustLine text={common.trustLine} />
          </div>
        </Container>
      </section>
    </>
  );
}
