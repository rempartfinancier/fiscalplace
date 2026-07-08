"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { getPortalStrings } from "@/content/portal";
import { DEMO_ENTITIES, type DemoClaim } from "@/data/demo-portal";
import { RESIDENCES, RESIDENCE_LABELS, type Residence } from "@/data/countries";
import { usePortal } from "@/components/portal/PortalContext";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { LedgerLine } from "@/components/ui/ledger";

/* ------------------------------------------------------------------ */
/* Local helpers (foundation files are read-only)                      */
/* ------------------------------------------------------------------ */

type EntityTypeKey = "individual" | "company" | "advised";

/** Entity added locally through the mocked form — session-only, never persisted. */
interface LocalEntity {
  id: string;
  name: string;
  typeKey: EntityTypeKey;
  residence: Residence;
}

function residenceLabel(residence: string, locale: Locale): string {
  return (RESIDENCES as readonly string[]).includes(residence)
    ? RESIDENCE_LABELS[residence as Residence][locale]
    : residence;
}

function entityStats(claims: DemoClaim[], entityId?: string) {
  const own = entityId ? claims.filter((c) => c.entityId === entityId) : claims;
  return {
    count: own.length,
    inProgress: own.filter((c) => !c.outcome).reduce((s, c) => s + c.recoverableEstimate, 0),
    recovered: own.reduce((s, c) => s + (c.outcome?.recovered ?? 0), 0),
  };
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface EntitiesCopy {
  metaTitle: string;
  metaDescription: string;
  lede: string;
  section: string;
  consolidated: { body: string };
  setActive: string;
  activeView: string;
  cards: {
    claims: (n: number) => string;
    inProgress: string;
    recovered: string;
    localTag: string;
    localNote: string;
  };
  form: {
    title: string;
    lede: string;
    name: string;
    namePlaceholder: string;
    type: string;
    residence: string;
    submit: string;
    error: string;
    added: (name: string) => string;
    persistence: string;
  };
  types: Record<EntityTypeKey, string>;
  roles: {
    kicker: string;
    title: string;
    lede: string;
    items: { name: string; desc: string }[];
    demoNote: string;
  };
  partner: { before: string; link: string; after: string };
}

const copy: Localized<EntitiesCopy> = {
  fr: {
    metaTitle: "Entités — Espace client FiscalPlace",
    metaDescription:
      "Un compte, plusieurs portefeuilles : portefeuille personnel, société ou holding, clients conseillés. Basculez de vue et suivez chaque entité séparément.",
    lede: "Un seul compte, plusieurs portefeuilles : le vôtre, celui de votre société ou holding, et — si vous êtes CGP — ceux de vos clients. Chaque dossier, document et facture est rattaché à son entité ; la vue consolidée additionne tout.",
    section: "Vos entités",
    consolidated: {
      body: "Toutes les entités agrégées : dossiers, montants et factures confondus.",
    },
    setActive: "Définir comme vue active",
    activeView: "Vue active",
    cards: {
      claims: (n) => `${n} dossier${n === 1 ? "" : "s"}`,
      inProgress: "En cours de récupération",
      recovered: "Déjà récupéré",
      localTag: "Ajoutée en démo",
      localNote:
        "Entité locale à cette session : la démonstration n'enregistre rien côté serveur, elle disparaîtra au rechargement de la page.",
    },
    form: {
      title: "Ajouter une entité",
      lede: "Dans le produit, une nouvelle entité passe par une vérification d'identité (KYC/KYB) avant activation. Ici, la démonstration ajoute simplement une carte locale.",
      name: "Nom de l'entité",
      namePlaceholder: "Ex. SCI Les Tilleuls",
      type: "Type",
      residence: "Résidence fiscale",
      submit: "Ajouter l'entité (démo)",
      error: "Donnez un nom à l'entité pour l'ajouter.",
      added: (name) => `« ${name} » ajoutée à la démonstration.`,
      persistence: "Ajout local uniquement : rien n'est enregistré côté serveur.",
    },
    types: {
      individual: "Particulier",
      company: "Société / holding",
      advised: "Client conseillé (CGP)",
    },
    roles: {
      kicker: "Rôles & permissions",
      title: "Qui peut faire quoi",
      lede: "Le produit permet de partager l'accès à une entité sans en partager le contrôle :",
      items: [
        {
          name: "Propriétaire",
          desc: "Contrôle complet : dossiers, coordonnées de versement, invitations, fermeture du compte.",
        },
        {
          name: "Admin",
          desc: "Gère les dossiers, documents et messages — pas les coordonnées bancaires ni les accès.",
        },
        {
          name: "Lecture",
          desc: "Consultation seule : idéal pour un expert-comptable ou un associé.",
        },
      ],
      demoNote: "Dans cette démonstration, vous êtes propriétaire de toutes les entités affichées.",
    },
    partner: {
      before: "Vous conseillez des clients ? L'",
      link: "espace partenaire",
      after: " centralise vos apports et votre part de commission.",
    },
  },
  en: {
    metaTitle: "Entities — FiscalPlace client area",
    metaDescription:
      "One account, several portfolios: personal portfolio, company or holding, advised clients. Switch views and track each entity separately.",
    lede: "One account, several portfolios: your own, your company's or holding's, and — if you are a wealth manager — your clients'. Every claim, document and invoice is attached to its entity; the consolidated view adds everything up.",
    section: "Your entities",
    consolidated: {
      body: "All entities aggregated: claims, amounts and invoices combined.",
    },
    setActive: "Set as active view",
    activeView: "Active view",
    cards: {
      claims: (n) => `${n} claim${n === 1 ? "" : "s"}`,
      inProgress: "Being recovered",
      recovered: "Recovered to date",
      localTag: "Added in demo",
      localNote:
        "Local to this session: the demo saves nothing server-side — this entity will disappear when the page reloads.",
    },
    form: {
      title: "Add an entity",
      lede: "In the product, a new entity goes through identity checks (KYC/KYB) before activation. Here, the demo simply adds a local card.",
      name: "Entity name",
      namePlaceholder: "e.g. Maple Holdings Ltd",
      type: "Type",
      residence: "Tax residence",
      submit: "Add entity (demo)",
      error: "Give the entity a name to add it.",
      added: (name) => `“${name}” added to the demo.`,
      persistence: "Local only: nothing is saved server-side.",
    },
    types: {
      individual: "Individual",
      company: "Company / holding",
      advised: "Advised client (wealth manager)",
    },
    roles: {
      kicker: "Roles & permissions",
      title: "Who can do what",
      lede: "The product lets you share access to an entity without sharing control of it:",
      items: [
        {
          name: "Owner",
          desc: "Full control: claims, payout details, invitations, account closure.",
        },
        {
          name: "Admin",
          desc: "Manages claims, documents and messages — not bank details or access rights.",
        },
        {
          name: "Read-only",
          desc: "View only: ideal for an accountant or a business partner.",
        },
      ],
      demoNote: "In this demo, you are the owner of every entity shown.",
    },
    partner: {
      before: "Advising clients? The ",
      link: "partner area",
      after: " centralises your referrals and your share of the fee.",
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

const TYPE_KEYS: EntityTypeKey[] = ["individual", "company", "advised"];

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const p = getPortalStrings(locale);
  const { claims, entityFilter, setEntityFilter } = usePortal();

  const [localEntities, setLocalEntities] = useState<LocalEntity[]>([]);
  const [name, setName] = useState("");
  const [typeKey, setTypeKey] = useState<EntityTypeKey>("individual");
  const [residence, setResidence] = useState<Residence>("FR");
  const [formError, setFormError] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const fc = (n: number) => formatCurrency(n, locale);
  const all = entityStats(claims);

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError(true);
      setAdded(null);
      return;
    }
    setLocalEntities((prev) => [
      ...prev,
      { id: `local-${prev.length + 1}`, name: trimmed, typeKey, residence },
    ]);
    setAdded(trimmed);
    setFormError(false);
    setName("");
  }

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">{p.nav.entities}</h1>
        <p className="mt-1 max-w-[75ch] text-[15px] leading-relaxed text-mine">{t.lede}</p>
      </header>

      {/* -------------------------------------------------------- */}
      {/* Views: consolidated + one card per entity                  */}
      {/* -------------------------------------------------------- */}
      <section className="mt-6" aria-labelledby="ent-list">
        <h2 id="ent-list" className="sr-only">
          {t.section}
        </h2>

        <Card className={`p-5 ${entityFilter === "all" ? "ring-1 ring-brand" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1 basis-64">
              <h3 className="font-medium text-ink">{p.entitySwitcher.all}</h3>
              <p className="mt-1 text-sm leading-relaxed text-mine">{t.consolidated.body}</p>
              <p className="mt-2 font-mono text-xs text-mine">
                {t.cards.claims(all.count)} · {t.cards.inProgress.toLowerCase()}{" "}
                {fc(all.inProgress)}
              </p>
            </div>
            {entityFilter === "all" ? (
              <Badge tone="green">{t.activeView}</Badge>
            ) : (
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                onClick={() => setEntityFilter("all")}
              >
                {t.setActive}
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {DEMO_ENTITIES.map((entity) => {
            const stats = entityStats(claims, entity.id);
            const active = entityFilter === entity.id;
            return (
              <Card
                as="article"
                key={entity.id}
                className={`flex flex-col p-5 ${active ? "ring-1 ring-brand" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-ink">{entity.name[locale]}</h3>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-mine">
                      {entity.type[locale]} · {residenceLabel(entity.residence, locale)}
                    </p>
                  </div>
                  {active && <Badge tone="green">{t.activeView}</Badge>}
                </div>
                <p className="mt-3 font-mono text-xs text-mine">{t.cards.claims(stats.count)}</p>
                <div className="mt-1">
                  <LedgerLine
                    label={t.cards.inProgress}
                    amount={fc(stats.inProgress)}
                    tone="gold"
                  />
                  {stats.recovered > 0 && (
                    <LedgerLine
                      label={t.cards.recovered}
                      amount={fc(stats.recovered)}
                      tone="brand"
                    />
                  )}
                </div>
                <div className="mt-3 flex-1" />
                {!active && (
                  <div className="border-t border-rule pt-3">
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                      onClick={() => setEntityFilter(entity.id)}
                    >
                      {t.setActive}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          {localEntities.map((entity) => (
            <Card as="article" key={entity.id} className="flex flex-col p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-ink">{entity.name}</h3>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-mine">
                    {t.types[entity.typeKey]} · {residenceLabel(entity.residence, locale)}
                  </p>
                </div>
                <Badge tone="gold">{t.cards.localTag}</Badge>
              </div>
              <p className="mt-3 font-mono text-xs text-mine">{t.cards.claims(0)}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-mine">{t.cards.localNote}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------------ */}
        {/* Mocked "add entity" form                                 */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="ent-add" className="p-5">
          <h2 id="ent-add" className="font-display text-xl font-semibold text-ink">
            {t.form.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mine">{t.form.lede}</p>
          <form className="mt-4 grid gap-4" onSubmit={handleAdd} noValidate>
            <div>
              <label htmlFor="ent-name" className="block text-sm font-medium text-ink">
                {t.form.name}
              </label>
              <input
                id="ent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.form.namePlaceholder}
                aria-invalid={formError || undefined}
                className="mt-1 w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
              />
              {formError && (
                <p role="alert" className="mt-1 text-[13px] text-debit">
                  {t.form.error}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ent-type" className="block text-sm font-medium text-ink">
                  {t.form.type}
                </label>
                <select
                  id="ent-type"
                  value={typeKey}
                  onChange={(e) => setTypeKey(e.target.value as EntityTypeKey)}
                  className="mt-1 w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
                >
                  {TYPE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t.types[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ent-residence" className="block text-sm font-medium text-ink">
                  {t.form.residence}
                </label>
                <select
                  id="ent-residence"
                  value={residence}
                  onChange={(e) => setResidence(e.target.value as Residence)}
                  className="mt-1 w-full rounded-[6px] border border-rule bg-white px-3 py-2 text-[15px] text-ink"
                >
                  {RESIDENCES.map((r) => (
                    <option key={r} value={r}>
                      {RESIDENCE_LABELS[r][locale]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Button type="submit" variant="secondary">
                {t.form.submit}
              </Button>
              {added && (
                <p role="status" className="mt-2 font-mono text-[12px] text-brand">
                  {t.form.added(added)} {t.form.persistence}
                </p>
              )}
            </div>
          </form>
        </Card>

        {/* ------------------------------------------------------ */}
        {/* Roles & permissions — informative                        */}
        {/* ------------------------------------------------------ */}
        <Card as="section" aria-labelledby="ent-roles" className="p-5">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.roles.kicker}
          </p>
          <h2 id="ent-roles" className="mt-2 font-display text-xl font-semibold text-ink">
            {t.roles.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mine">{t.roles.lede}</p>
          <ul className="mt-3 grid gap-3">
            {t.roles.items.map((role) => (
              <li key={role.name} className="flex items-start gap-3">
                <Badge tone="neutral" className="mt-0.5 shrink-0">
                  {role.name}
                </Badge>
                <span className="text-sm leading-relaxed text-mine">{role.desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[12px] text-mine">{t.roles.demoNote}</p>
          <p className="mt-3 border-t border-rule pt-3 text-sm leading-relaxed text-mine">
            {t.partner.before}
            <Link
              href={href(locale, "portalPartner")}
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              {t.partner.link}
            </Link>
            {t.partner.after}
          </p>
        </Card>
      </div>
    </div>
  );
}
