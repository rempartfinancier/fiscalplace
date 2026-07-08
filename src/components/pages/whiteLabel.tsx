import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { PRICING, computeCommission } from "@/config/pricing";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  Badge,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerLine, DoubleRule } from "@/components/ui/ledger";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface WhiteLabelCopy {
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    h1: string;
    sub: string;
    demoCta: string;
  };
  rule: {
    kicker: string;
    title: string;
    lede: string;
    exampleKicker: string;
    lRecovered: string;
    lFee: string;
    lFeeSub: string;
    lRebate: (pct: string) => string;
    lRebateSub: string;
    lSurcharge: string;
    lNet: string;
    footnote: (pct: string) => string;
  };
  formulas: {
    kicker: string;
    title: string;
    lede: string;
    referral: {
      badge: string;
      title: string;
      points: (pct: string) => string[];
      note: string;
    };
    whiteLabel: {
      badge: string;
      title: string;
      points: string[];
      contractIntro: string;
      contractPlaceholder: string;
    };
  };
  split: {
    kicker: string;
    title: string;
    lede: string;
    gains: { title: string; items: string[] };
    notYou: { title: string; items: string[] };
  };
  demo: {
    kicker: string;
    title: string;
    lede: string;
    items: string[];
    cta: string;
    note: string;
  };
  faq: {
    kicker: string;
    title: string;
    items: (pct: string) => FAQItem[];
  };
  finalCta: { title: string; lede: string; paidLink: string };
}

const copy: Localized<WhiteLabelCopy> = {
  fr: {
    metaTitle:
      "Partenaires CGP & marque blanche — récupération de withholding tax",
    metaDescription:
      "Apport d'affaires ou marque blanche : offrez la récupération de retenue à la source à vos clients sans la gérer. Rétrocession prélevée sur notre commission, jamais sur le client. Grille publique identique pour tous.",
    hero: {
      kicker: "Partenaires · CGP, family offices & gérants",
      h1: "Offrez la récupération de withholding tax à vos clients, sans la gérer.",
      sub: "Vos clients détiennent des actions suisses, américaines, allemandes — et abandonnent chaque année aux fiscs étrangers des retenues à la source trop prélevées. FiscalPlace prépare, dépose et suit les dossiers à leur place ; votre cabinet reste concentré sur le conseil et récolte la valeur ajoutée.",
      demoCta: "Voir la démo de l'espace partenaire",
    },
    rule: {
      kicker: "La règle avant les formules",
      title: "Votre client paie la grille publique. Point.",
      lede: "Un partenariat qui renchérit le service du client final est un conflit d'intérêts déguisé. Le nôtre est construit à l'envers : la rétrocession qui vous est versée sort de notre commission — jamais d'une majoration facturée à votre client.",
      exampleKicker: "Exemple chiffré, au barème public",
      lRecovered: "Trop-perçu récupéré pour votre client",
      lFee: "Commission FiscalPlace — barème public",
      lFeeSub: "identique avec ou sans partenaire",
      lRebate: (pct) => `dont rétrocession versée à votre cabinet (${pct})`,
      lRebateSub: "prélevée sur notre part",
      lSurcharge: "Majoration facturée à votre client",
      lNet: "Net reversé à votre client",
      footnote: (pct) =>
        `Montants indicatifs, calculés au barème public. La rétrocession de ${pct} est prélevée sur notre commission : en venant en direct, votre client verrait exactement les mêmes lignes.`,
    },
    formulas: {
      kicker: "Deux formules",
      title: "Apport d'affaires ou marque blanche : choisissez votre niveau d'intégration.",
      lede: "Dans les deux cas, FiscalPlace prépare, dépose et suit les dossiers de bout en bout : votre cabinet n'exécute aucune démarche fiscale.",
      referral: {
        badge: "Formule 1 · Apport d'affaires",
        title: "Vous recommandez, nous opérons, vous suivez tout.",
        points: (pct) => [
          "Un lien de parrainage tracé, propre à votre cabinet : chaque client qui ouvre un dossier par ce lien vous est attribué automatiquement.",
          `Rétrocession de ${pct} de la commission que nous encaissons effectivement sur les dossiers apportés. Pas de récupération, pas de commission — et donc pas de rétrocession.`,
          "Reporting complet dans votre espace partenaire : dossiers apportés, statut de chaque demande, commissions encaissées, rétrocessions dues et versées.",
        ],
        note: "Aucun coût d'entrée, aucun engagement de volume.",
      },
      whiteLabel: {
        badge: "Formule 2 · Marque blanche",
        title: "Le parcours à votre marque, notre machine en coulisses.",
        points: [
          "Le parcours client — diagnostic, dépôt des relevés, suivi des dossiers — est habillé au nom et aux couleurs de votre cabinet.",
          "FiscalPlace opère en coulisses : mêmes formulaires officiels, mêmes contrôles, même chaîne de traitement que sous notre propre marque.",
          "Votre client conserve un interlocuteur unique : vous.",
        ],
        contractIntro:
          "Le périmètre exact (responsabilités, mentions au client, facturation) sera contractualisé :",
        contractPlaceholder:
          "[CONDITIONS CONTRACTUELLES DE MARQUE BLANCHE À VALIDER JURIDIQUEMENT]",
      },
    },
    split: {
      kicker: "Le partage des rôles",
      title: "Ce que vous y gagnez. Ce que vous n'aurez jamais à faire.",
      lede: "Le partenariat n'a d'intérêt que si la frontière est nette : à vous la relation client, à nous la tuyauterie fiscale.",
      gains: {
        title: "Ce que votre cabinet gagne",
        items: [
          "Du temps de conseil : la récupération de retenue à la source est un sujet que vos clients soulèvent, pas un métier que vous devez internaliser.",
          "De la valeur ajoutée visible : de l'argent réel revient sur le compte du client, et la démarche est associée à votre cabinet.",
          "Un revenu complémentaire aligné : la rétrocession n'existe que si votre client récupère effectivement — jamais contre son intérêt.",
        ],
      },
      notYou: {
        title: "Ce que vous ne faites pas",
        items: [
          "Aucun formulaire fiscal étranger à remplir, aucune administration à relancer, aucun délai de prescription à surveiller.",
          "Aucune collecte de justificatifs : votre client dépose ses relevés dans son espace sécurisé, nous faisons le tri ligne à ligne.",
          "Aucune facturation à gérer : nous facturons le client au barème public et vous reversons votre part, avec le détail.",
        ],
      },
    },
    demo: {
      kicker: "L'espace partenaire",
      title: "Regardez l'outil avant de signer quoi que ce soit.",
      lede: "Un environnement de démonstration vous montre exactement ce que vous verrez au quotidien :",
      items: [
        "Les dossiers apportés et le statut de chaque demande, étape par étape.",
        "Les commissions encaissées par FiscalPlace sur vos dossiers.",
        "Les rétrocessions dues et versées, ligne à ligne.",
      ],
      cta: "Explorer la démo de l'espace partenaire",
      note: "Environnement de démonstration : toutes les données y sont fictives.",
    },
    faq: {
      kicker: "FAQ partenaires",
      title: "Les questions que les cabinets nous posent d'abord.",
      items: (pct) => [
        {
          question: "Qui est responsable du dossier vis-à-vis de mon client ?",
          answer:
            "FiscalPlace. Le mandat de représentation est signé directement entre votre client et nous : notre responsabilité est engagée sur la préparation, le dépôt et le suivi de chaque demande. Votre cabinet n'endosse pas la responsabilité d'une prestation qu'il n'exécute pas.",
        },
        {
          question:
            "L'apport d'affaires est-il compatible avec mes obligations réglementaires ?",
          answer:
            "Nous vous fournissons le détail nécessaire à l'information de vos clients, et la rémunération d'apport est documentée publiquement sur cette page. [STATUT RÉGLEMENTAIRE DE L'APPORT D'AFFAIRES À VALIDER] : le cadre exact (information du client, compatibilité avec votre statut) sera précisé avec notre conseil juridique avant la signature des premières conventions — nous préférons vous le dire plutôt que de l'affirmer trop tôt.",
        },
        {
          question: "Mon client saura-t-il que je perçois une rétrocession ?",
          answer: `Oui, et c'est voulu. Nous ne construirons pas un partenariat sur une rémunération cachée : l'existence de la rétrocession de ${pct} est documentée publiquement, ici et sur notre page « Comment nous sommes payés ». Votre client paie la grille publique dans tous les cas — la rétrocession sort de notre part.`,
        },
        {
          question: "Comment résilier le partenariat ?",
          answer:
            "Par simple notification, sans pénalité ni période de blocage. Les dossiers déjà ouverts via votre lien vont à leur terme aux conditions convenues : les rétrocessions correspondantes vous restent dues.",
        },
        {
          question: "Et si le dossier d'un client apporté échoue ?",
          answer:
            "Il ne paie rien, nous n'encaissons rien, et vous ne touchez rien : la commission n'existe qu'au succès, la rétrocession non plus. Personne dans la chaîne n'a intérêt à déposer un dossier voué à l'échec — c'est le but.",
        },
      ],
    },
    finalCta: {
      title: "Parlons de votre cabinet.",
      lede: "Décrivez-nous votre clientèle et ses portefeuilles : nous vous répondons avec une estimation chiffrée du gisement récupérable, pas avec une plaquette commerciale.",
      paidLink: "Comment nous sommes payés",
    },
  },
  en: {
    metaTitle:
      "CGP & wealth-manager partners — white-label withholding-tax recovery",
    metaDescription:
      "Referral or white label: offer withholding-tax recovery to your clients without running it. The rebate comes out of our fee, never out of your client. Same public grid for everyone.",
    hero: {
      kicker: "Partners · advisers, family offices & wealth managers",
      h1: "Offer withholding-tax recovery to your clients — without running it.",
      sub: "Your clients hold Swiss, US and German shares — and hand over-withheld tax to foreign treasuries every year. FiscalPlace prepares, files and tracks the claims in their place; your firm stays focused on advice and keeps the credit.",
      demoCta: "See the partner-area demo",
    },
    rule: {
      kicker: "The rule before the packages",
      title: "Your client pays the public grid. Full stop.",
      lede: "A partnership that makes the end client's service more expensive is a disguised conflict of interest. Ours is built the other way round: the rebate paid to you comes out of our fee — never out of a mark-up billed to your client.",
      exampleKicker: "Worked example, on the public grid",
      lRecovered: "Over-withholding recovered for your client",
      lFee: "FiscalPlace fee — public grid",
      lFeeSub: "identical with or without a partner",
      lRebate: (pct) => `of which rebate paid to your firm (${pct})`,
      lRebateSub: "taken out of our share",
      lSurcharge: "Mark-up billed to your client",
      lNet: "Net paid out to your client",
      footnote: (pct) =>
        `Indicative amounts, computed on the public grid. The ${pct} rebate comes out of our fee: coming to us directly, your client would see exactly the same lines.`,
    },
    formulas: {
      kicker: "Two packages",
      title: "Referral or white label: pick your level of integration.",
      lede: "In both cases FiscalPlace prepares, files and tracks the claims end to end: your firm performs no tax procedure whatsoever.",
      referral: {
        badge: "Package 1 · Referral",
        title: "You recommend, we operate, you see everything.",
        points: (pct) => [
          "A tracked referral link, unique to your firm: every client who opens a claim through it is attributed to you automatically.",
          `A rebate of ${pct} of the fee we actually collect on referred claims. No recovery, no fee — and therefore no rebate.`,
          "Full reporting in your partner area: referred claims, the status of each filing, fees collected, rebates due and paid.",
        ],
        note: "No entry cost, no volume commitment.",
      },
      whiteLabel: {
        badge: "Package 2 · White label",
        title: "The journey under your brand, our machinery behind it.",
        points: [
          "The client journey — diagnostic, statement upload, claim tracking — is dressed in your firm's name and colours.",
          "FiscalPlace operates behind the scenes: same official forms, same checks, same processing pipeline as under our own brand.",
          "Your client keeps a single point of contact: you.",
        ],
        contractIntro:
          "The exact scope (responsibilities, client disclosures, invoicing) will be set by contract:",
        contractPlaceholder:
          "[WHITE-LABEL CONTRACT TERMS TO BE LEGALLY VALIDATED]",
      },
    },
    split: {
      kicker: "Who does what",
      title: "What you gain. What you will never have to do.",
      lede: "A partnership only works when the boundary is sharp: the client relationship is yours, the tax plumbing is ours.",
      gains: {
        title: "What your firm gains",
        items: [
          "Advisory time back: withholding-tax recovery is a topic your clients raise, not a trade you should have to build in-house.",
          "Visible added value: real money lands back on the client's account, and the initiative is associated with your firm.",
          "An aligned side revenue: the rebate only exists when your client actually recovers — never against their interest.",
        ],
      },
      notYou: {
        title: "What you do not do",
        items: [
          "No foreign tax forms to fill in, no administration to chase, no limitation deadlines to watch.",
          "No document collection: your client uploads statements to their secure account, and we sort them line by line.",
          "No invoicing to handle: we bill the client on the public grid and pay out your share, fully itemised.",
        ],
      },
    },
    demo: {
      kicker: "The partner area",
      title: "Look at the tool before you sign anything.",
      lede: "A demo environment shows you exactly what you would see day to day:",
      items: [
        "Referred claims and the status of each filing, step by step.",
        "The fees FiscalPlace has collected on your claims.",
        "Rebates due and paid, line by line.",
      ],
      cta: "Explore the partner-area demo",
      note: "Demo environment: all data in it is fictitious.",
    },
    faq: {
      kicker: "Partner FAQ",
      title: "The questions firms ask us first.",
      items: (pct) => [
        {
          question: "Who is liable for the claim towards my client?",
          answer:
            "FiscalPlace. The representation mandate is signed directly between your client and us: our liability covers the preparation, filing and follow-up of every claim. Your firm does not take on responsibility for a service it does not perform.",
        },
        {
          question: "Is the referral arrangement compatible with my regulatory obligations?",
          answer:
            "We provide the detail you need to inform your clients, and the referral remuneration is documented publicly on this page. [REGULATORY STATUS OF THE REFERRAL ARRANGEMENT TO BE VALIDATED]: the exact framework (client disclosure, compatibility with your status) will be settled with our legal counsel before the first agreements are signed — we would rather tell you that than overstate it.",
        },
        {
          question: "Will my client know I receive a rebate?",
          answer: `Yes — deliberately. We will not build a partnership on hidden remuneration: the ${pct} rebate is documented publicly, here and on our “How we get paid” page. Your client pays the public grid in every case — the rebate comes out of our share.`,
        },
        {
          question: "How do I terminate the partnership?",
          answer:
            "By simple notice, with no penalty and no lock-in. Claims already opened through your link run to completion on the agreed terms: the corresponding rebates remain due to you.",
        },
        {
          question: "What if a referred client's claim fails?",
          answer:
            "They pay nothing, we collect nothing, and you receive nothing: the fee only exists on success, and so does the rebate. Nobody in the chain has an incentive to file a doomed claim — which is the point.",
        },
      ],
    },
    finalCta: {
      title: "Let's talk about your firm.",
      lede: "Tell us about your client base and their portfolios: we reply with a figure for the recoverable pool, not with a sales brochure.",
      paidLink: "How we get paid",
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

/** Worked example fed to computeCommission (rates come from @/config/pricing). */
const EXAMPLE_RECOVERED = 5_000;

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const fc = (n: number) => formatCurrency(n, locale);
  const pct = formatPercent(PRICING.partnerRevShare, locale);
  const example = computeCommission(EXAMPLE_RECOVERED);
  const rebate = example.fee * PRICING.partnerRevShare;

  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/* HERO                                                        */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16 lg:py-20">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[26ch] font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl lg:text-[2.6rem]">
            {t.hero.h1}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-mine">
            {t.hero.sub}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href={href(locale, "contact")}>{common.cta.contactUs}</ButtonLink>
            <ButtonLink href={href(locale, "login")} variant="ghost">
              {t.hero.demoCta}
            </ButtonLink>
          </div>
          <TrustLine text={common.trustLine} className="mt-3" />
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* THE RULE — client always pays the public grid               */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.rule.kicker} title={t.rule.title} lede={t.rule.lede} />
          <div className="mt-8 max-w-2xl">
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.rule.exampleKicker}
            </p>
            <div className="rounded-[6px] border border-rule bg-paper p-5 sm:p-6">
              <LedgerLine
                label={t.rule.lRecovered}
                amount={fc(EXAMPLE_RECOVERED)}
                tone="brand"
              />
              <LedgerLine
                label={t.rule.lFee}
                amount={fc(-example.fee)}
                tone="debit"
                sub={t.rule.lFeeSub}
              />
              <LedgerLine
                label={t.rule.lRebate(pct)}
                amount={fc(rebate)}
                tone="gold"
                sub={t.rule.lRebateSub}
              />
              <LedgerLine label={t.rule.lSurcharge} amount={fc(0)} tone="brand" />
              <div className="my-2 border-t border-rule" aria-hidden="true" />
              <LedgerLine
                label={t.rule.lNet}
                amount={fc(example.net)}
                tone="ink"
                highlight
                bold
              />
              <DoubleRule className="mt-3" />
              <p className="mt-3 text-[13px] leading-relaxed text-mine">
                {t.rule.footnote(pct)}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* TWO PACKAGES                                                */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.formulas.kicker}
            title={t.formulas.title}
            lede={t.formulas.lede}
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="flex flex-col p-6">
              <div>
                <Badge tone="green">{t.formulas.referral.badge}</Badge>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                {t.formulas.referral.title}
              </h3>
              <ul className="mt-4 flex-1 space-y-3">
                {t.formulas.referral.points(pct).map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-[15px] leading-relaxed text-mine"
                  >
                    <span aria-hidden="true" className="font-mono text-brand">
                      —
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[13px] text-mine">
                {t.formulas.referral.note}
              </p>
            </Card>
            <Card className="flex flex-col p-6">
              <div>
                <Badge tone="gold">{t.formulas.whiteLabel.badge}</Badge>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                {t.formulas.whiteLabel.title}
              </h3>
              <ul className="mt-4 flex-1 space-y-3">
                {t.formulas.whiteLabel.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-[15px] leading-relaxed text-mine"
                  >
                    <span aria-hidden="true" className="font-mono text-brand">
                      —
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-[4px] bg-tint-gold px-3 py-2.5">
                <p className="text-[13px] leading-relaxed text-mine">
                  {t.formulas.whiteLabel.contractIntro}
                </p>
                <p className="mt-1 font-mono text-[13px] leading-relaxed text-gold-ink">
                  {t.formulas.whiteLabel.contractPlaceholder}
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* GAINS / NOT-YOU SPLIT                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.split.kicker} title={t.split.title} lede={t.split.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.split.gains.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {t.split.gains.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[15px] leading-relaxed text-mine"
                  >
                    <span aria-hidden="true" className="font-mono text-brand">
                      +
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.split.notYou.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {t.split.notYou.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[15px] leading-relaxed text-mine"
                  >
                    <span aria-hidden="true" className="font-mono text-mine">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* PARTNER-AREA DEMO                                           */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading kicker={t.demo.kicker} title={t.demo.title} lede={t.demo.lede} />
          <ul className="mt-6 max-w-2xl space-y-3">
            {t.demo.items.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-mine">
                <span aria-hidden="true" className="font-mono text-brand">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <ButtonLink href={href(locale, "login")} variant="secondary">
              {t.demo.cta}
            </ButtonLink>
          </div>
          <p className="mt-3 font-mono text-[13px] text-mine">{t.demo.note}</p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FAQ                                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container className="py-14 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={t.faq.items(pct)} className="mt-8" />
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FINAL CTA                                                   */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "contact")}>{common.cta.contactUs}</ButtonLink>
            <TrustLine text={common.trustLine} />
            <ButtonLink href={href(locale, "howWeGetPaid")} variant="ghost">
              {t.finalCta.paidLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
