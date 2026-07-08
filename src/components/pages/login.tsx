import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  Badge,
  TrustLine,
} from "@/components/ui/primitives";
import { LoginForm } from "@/components/site/LoginForm";

/**
 * LOGIN — client-area entrance. Real accounts are not open yet (honest state,
 * handled by LoginForm); the page pushes the fully-explorable demo forward and
 * carries the anti-phishing reminder (we never ask for a password by email).
 */

interface LoginCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  lede: string;
  form: {
    title: string;
  };
  demo: {
    badge: string;
    title: string;
    body: string;
    cta: string;
    onboardingLink: string;
  };
  reminder: {
    title: string;
    body: string;
    link: string;
  };
}

const copy: Localized<LoginCopy> = {
  fr: {
    metaTitle: "Connexion à l'espace client",
    metaDescription:
      "Connectez-vous à votre espace client FiscalPlace — ou explorez d'abord le compte de démonstration complet, sans inscription. Les comptes réels ouvrent à la mise en production.",
    kicker: "Espace client",
    h1: "Connexion à votre espace client",
    lede: "Votre espace suit chaque dossier comme une écriture comptable : montants, étapes, documents, messages. Les comptes réels ouvriront à la mise en production — la démonstration, elle, est déjà complète.",
    form: {
      title: "Se connecter",
    },
    demo: {
      badge: "Sans inscription",
      title: "Explorer le compte de démonstration",
      body: "L'espace client complet, avec des dossiers fictifs à tous les stades — de l'import des relevés au remboursement versé. De quoi juger le produit avant de nous confier quoi que ce soit : aucune inscription, aucun email.",
      cta: "Explorer le compte de démonstration",
      onboardingLink: "Voir le parcours d'entrée (dépôt des relevés)",
    },
    reminder: {
      title: "Rappel de sécurité",
      body: "Nous ne vous demanderons jamais votre mot de passe — ni par email, ni par téléphone, ni « pour vérifier votre dossier ». Un message qui le fait ne vient pas de nous : ne répondez pas.",
      link: "Comment vos données sont protégées",
    },
  },
  en: {
    metaTitle: "Log in to the client area",
    metaDescription:
      "Log in to your FiscalPlace client area — or explore the full demo account first, no sign-up. Real accounts open at production launch.",
    kicker: "Client area",
    h1: "Log in to your client area",
    lede: "Your account tracks each claim like a ledger entry: amounts, steps, documents, messages. Real accounts will open at go-live — the demo, meanwhile, is already complete.",
    form: {
      title: "Log in",
    },
    demo: {
      badge: "No sign-up",
      title: "Explore the demo account",
      body: "The complete client area, with fictitious claims at every stage — from statement import to refund paid out. Enough to judge the product before entrusting us with anything: no sign-up, no email.",
      cta: "Explore the demo account",
      onboardingLink: "See the onboarding journey (statement upload)",
    },
    reminder: {
      title: "Security reminder",
      body: "We will never ask for your password — not by email, not by phone, not 'to check your claim'. A message that does is not from us: do not reply.",
      link: "How your data is protected",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

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
      {/* FORM + DEMO                                                     */}
      {/* -------------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 font-display text-xl font-semibold text-ink">
                {t.form.title}
              </h2>
              <LoginForm locale={locale} />
            </div>
            <div className="grid gap-4">
              <div className="rounded-[6px] border border-rule bg-tint-green p-5 sm:p-6">
                <Badge tone="green">{t.demo.badge}</Badge>
                <h2 className="mt-3 font-display text-xl font-semibold text-ink">
                  {t.demo.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{t.demo.body}</p>
                <div className="mt-5 flex flex-col items-start gap-2">
                  <ButtonLink href={href(locale, "portal")}>{t.demo.cta}</ButtonLink>
                  <TrustLine text={common.trustLine} />
                </div>
                <div className="mt-3">
                  <Link
                    href={href(locale, "portalOnboarding")}
                    className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                  >
                    {t.demo.onboardingLink} →
                  </Link>
                </div>
              </div>
              <Card className="p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {t.reminder.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{t.reminder.body}</p>
                <div className="mt-3">
                  <Link
                    href={href(locale, "security")}
                    className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                  >
                    {t.reminder.link} →
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
