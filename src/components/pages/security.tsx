import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";

/**
 * SECURITY — concrete, jargon-free description of how documents and data are
 * protected. Anti-hallucination guardrails (conventions §5): every real-world
 * vendor is an explicit bracketed placeholder, and NO certification badge is
 * shown or implied — the page says so out loud.
 */

const SECURITY_EMAIL = "security@fiscalplace.com";

interface SecurityCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  lede: string;
  measures: {
    kicker: string;
    title: string;
    lede: string;
    items: { title: string; body: string }[];
  };
  retention: {
    kicker: string;
    title: string;
    lede: string;
    rows: { what: string; howLong: string }[];
    detailNote: string;
    detailLink: string;
  };
  rights: {
    title: string;
    body: string;
    list: string[];
    link: string;
  };
  disclosure: {
    kicker: string;
    title: string;
    body: string;
    emailNote: string;
    promise: string;
  };
  honesty: {
    title: string;
    body: string;
  };
  finalCta: {
    title: string;
    lede: string;
    demoCta: string;
  };
}

const copy: Localized<SecurityCopy> = {
  fr: {
    metaTitle: "Sécurité & confidentialité — comment vos documents sont protégés",
    metaDescription:
      "Chiffrement en transit et au repos, hébergement UE, accès cloisonnés, vérification d'identité, journal d'audit des décisions automatisées, durées de conservation, droits RGPD — concrètement, sans badge que nous n'avons pas.",
    kicker: "Sécurité & confidentialité",
    h1: "Comment vos documents et vos données sont protégés",
    lede: "Vous nous confiez des relevés bancaires, des pièces d'identité et des mandats signés. Voici, mesure par mesure, ce que nous en faisons — concrètement, sans jargon creux, et sans afficher un seul badge que nous n'avons pas.",
    measures: {
      kicker: "Les mesures",
      title: "Six protections, décrites sans marketing",
      lede: "Chacune répond à un risque précis : interception, fuite, accès indu, usurpation, contestation d'une signature, erreur d'automatisation.",
      items: [
        {
          title: "Chiffrement, en transit et au repos",
          body: "Chaque échange avec le site et l'espace client passe par TLS : rien ne circule en clair entre votre navigateur et nos serveurs. Les documents que vous téléversez sont ensuite chiffrés au repos : un accès brut au stockage ne suffit pas à les lire.",
        },
        {
          title: "Hébergement dans l'Union européenne",
          body: "Vos données et documents sont hébergés dans l'UE, chez [PRESTATAIRE D'HÉBERGEMENT UE À CONFIRMER], sous juridiction RGPD. Aucune copie de production n'est stockée hors de l'Union européenne.",
        },
        {
          title: "Accès cloisonnés, moindre privilège",
          body: "Chaque membre de l'équipe accède uniquement à ce que son rôle exige, via des comptes nominatifs — jamais de compte partagé. Les accès aux dossiers sont journalisés et revus périodiquement ; un accès qui ne sert plus est révoqué.",
        },
        {
          title: "Identité vérifiée, sanctions filtrées",
          body: "Avant tout dépôt en votre nom, votre identité est vérifiée et confrontée aux listes de sanctions et de personnes politiquement exposées (PEP) par un prestataire spécialisé : [PRESTATAIRE KYC À CHOISIR]. C'est ce qui empêche qu'un tiers réclame votre remboursement à votre place.",
        },
        {
          title: "Signature électronique probante",
          body: "Les mandats se signent électroniquement via [PRESTATAIRE DE SIGNATURE À CHOISIR], avec horodatage et dossier de preuve. L'exemplaire signé reste consultable à tout moment dans vos documents — vous n'avez jamais à nous croire sur ce que vous avez signé.",
        },
        {
          title: "Chaque décision automatisée, journalisée",
          body: `Notre chaîne de traitement lit vos relevés, calcule et pré-valide automatiquement. Chaque décision est inscrite dans un journal d'audit consultable dossier par dossier : quoi, quand, sur quelle base. Et au-delà de ${formatCurrency(PRICING.humanReviewThreshold, "fr")} de récupération estimée, une revue humaine est systématique avant dépôt — ce seuil est configurable, jamais supprimable.`,
        },
      ],
    },
    retention: {
      kicker: "Conservation",
      title: "Combien de temps nous gardons quoi",
      lede: "Garder moins longtemps serait illégal ; garder plus longtemps serait injustifiable. Trois catégories, trois horloges.",
      rows: [
        {
          what: "Pièces de dossier (relevés, formulaires, décisions des administrations)",
          howLong:
            "Durée de vie du dossier, puis durées légales fiscales et comptables — jusqu'à 10 ans pour certaines pièces comptables",
        },
        {
          what: "Justificatifs d'identité (KYC)",
          howLong:
            "Durées imposées par la réglementation anti-blanchiment après la fin de la relation",
        },
        {
          what: "Compte, préférences et journaux de connexion",
          howLong: "Tant que le compte existe, puis suppression ou anonymisation",
        },
      ],
      detailNote:
        "Le détail complet, catégorie par catégorie et durée par durée, figure dans la politique de confidentialité.",
      detailLink: "Lire la politique de confidentialité",
    },
    rights: {
      title: "Vos droits RGPD, et comment les exercer",
      body: "Vous restez propriétaire de vos données. Vous pouvez à tout moment exercer les droits suivants — depuis votre espace ou par écrit — avec une seule limite honnête : nous ne pouvons pas effacer ce que la loi nous oblige à conserver avant l'expiration des durées légales.",
      list: [
        "Accès : obtenir la copie de tout ce que nous détenons sur vous",
        "Rectification : corriger une donnée inexacte",
        "Effacement : supprimer ce qui n'est plus légalement requis",
        "Limitation et opposition : geler ou refuser certains traitements",
        "Portabilité : récupérer vos données dans un format réutilisable",
      ],
      link: "La marche à suivre, droit par droit",
    },
    disclosure: {
      kicker: "Signalement",
      title: "Vous avez trouvé une faille ?",
      body: "Écrivez-nous directement : décrivez ce que vous avez observé, sans exploiter la faille au-delà de la démonstration et sans accéder aux données d'autres utilisateurs.",
      emailNote: "[ADRESSE DE CONTACT SÉCURITÉ À CONFIGURER AVANT LA MISE EN PRODUCTION]",
      promise:
        "Notre engagement : un accusé de réception rapide, une correction priorisée, un retour sur ce qui a été fait — et aucune poursuite contre la recherche de bonne foi.",
    },
    honesty: {
      title: "Ce que nous n'affichons pas",
      body: "Aucun badge SOC 2, ISO 27001 ou équivalent ne figure sur ce site : nous n'affichons aucune certification que nous n'avons pas encore obtenue. Le jour où une certification sera acquise, elle sera publiée ici avec son périmètre exact et son rapport vérifiable — pas juste un logo dans un pied de page.",
    },
    finalCta: {
      title: "Jugez sur pièces, pas sur promesses",
      lede: "L'espace client — celui-là même qui portera vos documents — se visite en démonstration complète, avec des données fictives et sans inscription.",
      demoCta: "Explorer la démo de l'espace client",
    },
  },
  en: {
    metaTitle: "Security & privacy — how your documents are protected",
    metaDescription:
      "Encryption in transit and at rest, EU hosting, partitioned access, identity verification, an audit log of automated decisions, retention periods, GDPR rights — concretely, with no badge we do not hold.",
    kicker: "Security & privacy",
    h1: "How your documents and your data are protected",
    lede: "You entrust us with bank statements, identity documents and signed mandates. Here is, measure by measure, what we do with them — concretely, without hollow jargon, and without displaying a single badge we do not hold.",
    measures: {
      kicker: "The measures",
      title: "Six protections, described without marketing",
      lede: "Each one answers a specific risk: interception, leakage, undue access, impersonation, disputed signatures, automation errors.",
      items: [
        {
          title: "Encryption, in transit and at rest",
          body: "Every exchange with the site and the client area runs over TLS: nothing travels in clear text between your browser and our servers. The documents you upload are then encrypted at rest: raw access to the storage is not enough to read them.",
        },
        {
          title: "Hosting in the European Union",
          body: "Your data and documents are hosted in the EU, with [EU HOSTING PROVIDER TO BE CONFIRMED], under GDPR jurisdiction. No production copy is stored outside the European Union.",
        },
        {
          title: "Partitioned access, least privilege",
          body: "Each team member accesses only what their role requires, through named accounts — never a shared login. Access to claims is logged and reviewed periodically; an access that is no longer needed is revoked.",
        },
        {
          title: "Identity verified, sanctions screened",
          body: "Before any filing in your name, your identity is verified and checked against sanctions and politically-exposed-persons (PEP) lists by a specialised provider: [KYC PROVIDER TO BE CHOSEN]. This is what prevents a third party from claiming your refund in your place.",
        },
        {
          title: "Evidentiary electronic signature",
          body: "Mandates are signed electronically through [E-SIGNATURE PROVIDER TO BE CHOSEN], with time-stamping and an evidence file. The signed copy stays available in your documents at all times — you never have to take our word for what you signed.",
        },
        {
          title: "Every automated decision, logged",
          body: `Our pipeline parses your statements, calculates and pre-validates automatically. Every decision is written to an audit log you can consult claim by claim: what, when, on what basis. And above ${formatCurrency(PRICING.humanReviewThreshold, "en")} of estimated recovery, a human review is systematic before filing — that threshold is configurable, never removable.`,
        },
      ],
    },
    retention: {
      kicker: "Retention",
      title: "How long we keep what",
      lede: "Keeping data for less time would be illegal; keeping it longer would be unjustifiable. Three categories, three clocks.",
      rows: [
        {
          what: "Claim records (statements, forms, administrations' decisions)",
          howLong:
            "Life of the claim, then statutory tax and accounting retention periods — up to 10 years for some accounting records",
        },
        {
          what: "Identity evidence (KYC)",
          howLong:
            "Retention periods imposed by anti-money-laundering regulation after the relationship ends",
        },
        {
          what: "Account, preferences and login records",
          howLong: "As long as the account exists, then deletion or anonymisation",
        },
      ],
      detailNote:
        "The full breakdown, category by category and period by period, is in the privacy policy.",
      detailLink: "Read the privacy policy",
    },
    rights: {
      title: "Your GDPR rights, and how to exercise them",
      body: "Your data remains yours. You can exercise the following rights at any time — from your account or in writing — with one honest limit: we cannot erase what the law requires us to keep before the legal retention periods expire.",
      list: [
        "Access: obtain a copy of everything we hold about you",
        "Rectification: correct inaccurate data",
        "Erasure: delete what is no longer legally required",
        "Restriction and objection: freeze or refuse certain processing",
        "Portability: retrieve your data in a reusable format",
      ],
      link: "The procedure, right by right",
    },
    disclosure: {
      kicker: "Disclosure",
      title: "Found a vulnerability?",
      body: "Write to us directly: describe what you observed, without exploiting the flaw beyond demonstration and without accessing other users' data.",
      emailNote: "[SECURITY CONTACT ADDRESS TO BE CONFIGURED BEFORE PRODUCTION LAUNCH]",
      promise:
        "Our commitment: a prompt acknowledgement, a prioritised fix, feedback on what was done — and no legal action against good-faith research.",
    },
    honesty: {
      title: "What we do not display",
      body: "No SOC 2, ISO 27001 or equivalent badge appears on this site: we display no certification we have not yet obtained. The day a certification is earned, it will be published here with its exact scope and its verifiable report — not just a logo in a footer.",
    },
    finalCta: {
      title: "Judge on evidence, not on promises",
      lede: "The client area — the very one that will carry your documents — is open as a full demo, with fictitious data and no sign-up.",
      demoCta: "Explore the client-area demo",
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
      {/* SIX MEASURES                                                    */}
      {/* -------------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.measures.kicker}
            title={t.measures.title}
            lede={t.measures.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.measures.items.map((item, i) => (
              <Card key={item.title} className="p-5">
                <p className="font-mono text-xs font-medium text-mine">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{item.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* RETENTION + GDPR RIGHTS                                         */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.retention.kicker}
            title={t.retention.title}
            lede={t.retention.lede}
          />
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <dl>
                {t.retention.rows.map((row, i) => (
                  <div
                    key={row.what}
                    className={i > 0 ? "mt-4 border-t border-rule pt-4" : ""}
                  >
                    <dt className="text-[15px] font-medium text-ink">{row.what}</dt>
                    <dd className="mt-1 font-mono text-[13px] leading-relaxed text-mine">
                      {row.howLong}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 border-t border-rule pt-4 text-[13px] leading-relaxed text-mine">
                {t.retention.detailNote}
              </p>
              <div className="mt-2">
                <ButtonLink variant="ghost" href={href(locale, "privacy")}>
                  {t.retention.detailLink} →
                </ButtonLink>
              </div>
            </Card>
            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.rights.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.rights.body}</p>
              <ul className="mt-4 space-y-2">
                {t.rights.list.map((right) => (
                  <li key={right} className="flex gap-2 text-[15px] leading-relaxed text-mine">
                    <span aria-hidden="true" className="font-mono text-brand">
                      ·
                    </span>
                    {right}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <ButtonLink variant="ghost" href={href(locale, "privacy")}>
                  {t.rights.link} →
                </ButtonLink>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* VULNERABILITY DISCLOSURE + HONESTY                              */}
      {/* -------------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container className="py-14 sm:py-16">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div>
              <SectionHeading kicker={t.disclosure.kicker} title={t.disclosure.title} />
              <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-mine">
                {t.disclosure.body}
              </p>
              <p className="mt-4">
                <a
                  href={`mailto:${SECURITY_EMAIL}`}
                  className="font-mono text-[15px] text-brand underline underline-offset-4"
                >
                  {SECURITY_EMAIL}
                </a>
              </p>
              <p className="mt-1 font-mono text-xs text-mine">{t.disclosure.emailNote}</p>
              <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-mine">
                {t.disclosure.promise}
              </p>
            </div>
            <div className="rounded-[6px] border border-rule bg-paper p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.honesty.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.honesty.body}</p>
            </div>
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
            <ButtonLink href={href(locale, "portal")}>{t.finalCta.demoCta}</ButtonLink>
            <TrustLine text={common.trustLine} />
          </div>
        </Container>
      </section>
    </>
  );
}
