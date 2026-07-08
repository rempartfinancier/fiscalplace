"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, claimHref, type RouteKey } from "@/lib/routes";
import { getPortalStrings } from "@/content/portal";
import {
  DEMO_DOCUMENTS,
  DEMO_ENTITIES,
  type DemoDocument,
} from "@/data/demo-portal";
import { usePortal, filterByEntity } from "@/components/portal/PortalContext";
import { Badge, Button, Card } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Local helpers (foundation files are read-only)                      */
/* ------------------------------------------------------------------ */

/** Unified shape for demo documents and files added locally in the demo. */
interface ViewDoc {
  id: string;
  entityId: string;
  claimId?: string;
  name: string;
  kind: Localized<string>;
  uploadedOn: string;
  status: DemoDocument["status"];
  extraction?: DemoDocument["extraction"];
  local?: boolean;
}

const LOCAL_KIND: Localized<string> = {
  fr: "Dépôt de démonstration",
  en: "Demo upload",
};

const STATUS_TONE: Record<DemoDocument["status"], "green" | "gold" | "red"> = {
  extracted: "green",
  processing: "gold",
  "needs-review": "red",
};

/** Service pages linked from the "what we ask for" cards (index-aligned with copy). */
const ASK_ROUTES: RouteKey[] = ["serviceRecovery", "serviceResidenceCert", "howItWorks"];

const UPLOAD_INPUT_ID = "fp-doc-upload";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface DocumentsCopy {
  metaTitle: string;
  metaDescription: string;
  title: string;
  sub: string;
  drop: {
    title: string;
    hint: string;
    demo: string;
    added: (n: number) => string;
    localNote: string;
  };
  list: {
    count: (n: number) => string;
    uploadedPrefix: string;
    extraction: (n: number) => string;
    auditNote: string;
  };
  status: Record<DemoDocument["status"], string>;
  empty: {
    title: string;
    body: string;
    cta: string;
    link: string;
  };
  ask: {
    kicker: string;
    title: string;
    lede: string;
    items: { title: string; body: string; link: string }[];
  };
}

const copy: Localized<DocumentsCopy> = {
  fr: {
    metaTitle: "Documents — Espace client FiscalPlace",
    metaDescription:
      "Déposez vos relevés et certificats, suivez leur extraction automatique — montants, dates, ISIN — et le statut de chaque pièce de vos dossiers.",
    title: "Vos documents",
    sub: "Chaque pièce déposée est lue par extraction automatique — montants, dates, codes ISIN — puis vérifiée avant tout dépôt auprès d'une administration. Chaque lecture est tracée au journal d'audit de votre dossier.",
    drop: {
      title: "Déposez vos documents ici",
      hint: "Glissez-déposez vos fichiers, ou cliquez pour parcourir — relevés de courtage, certificats de résidence, mandats.",
      demo: "Démonstration : rien n'est réellement transmis — vos fichiers ne quittent pas ce navigateur.",
      added: (n) =>
        `${n} fichier${n > 1 ? "s" : ""} ajouté${n > 1 ? "s" : ""} à la file de traitement (démonstration).`,
      localNote:
        "Ajout de démonstration : ce fichier n'a pas quitté votre navigateur, rien n'a été transmis. Dans le portail réel, l'extraction (montants, dates, ISIN) démarre immédiatement et la lecture est consignée au journal d'audit.",
    },
    list: {
      count: (n) => `${n} pièce${n > 1 ? "s" : ""}`,
      uploadedPrefix: "Déposé le",
      extraction: (n) => `Données extraites (${n})`,
      auditNote: "Lecture automatique · vérifiée · tracée au journal d'audit",
    },
    status: {
      extracted: "Extrait",
      processing: "En traitement",
      "needs-review": "À revoir",
    },
    empty: {
      title: "Aucun document pour cette vue.",
      body: "Déposez votre premier relevé : l'extraction identifie ligne à ligne les dividendes sur-prélevés, et chaque lecture est tracée au journal d'audit.",
      cta: "Déposer un premier document",
      link: "Comprendre le service de récupération",
    },
    ask: {
      kicker: "Pièces du dossier",
      title: "Les documents que nous demandons — et pourquoi",
      lede: "Trois pièces suffisent dans la plupart des dossiers. Aucune ne vous est demandée sans raison : voici ce que chacune prouve.",
      items: [
        {
          title: "Relevés de courtage ou de dividendes",
          body: "La matière première du dossier : ils prouvent le versement des dividendes et la retenue réellement prélevée, ligne à ligne — ISIN, dates, montants. C'est sur eux que l'extraction automatique travaille.",
          link: "Le service de récupération",
        },
        {
          title: "Certificat de résidence fiscale",
          body: "La pièce qui ouvre le droit au taux conventionnel : sans elle, aucune administration étrangère ne rembourse. Nous vous guidons pour l'obtenir auprès de votre centre des impôts.",
          link: "Obtenir le certificat",
        },
        {
          title: "Mandat de représentation",
          body: "Il nous autorise à agir en votre nom auprès de chaque administration : dépôt, suivi, relances. Signature électronique directement depuis votre espace.",
          link: "Le processus, étape par étape",
        },
      ],
    },
  },
  en: {
    metaTitle: "Documents — FiscalPlace client area",
    metaDescription:
      "Upload your statements and certificates, follow their automated extraction — amounts, dates, ISINs — and the status of every piece in your claims.",
    title: "Your documents",
    sub: "Every uploaded document is read by automated extraction — amounts, dates, ISIN codes — then verified before anything is filed with an administration. Each read is logged in your claim's audit trail.",
    drop: {
      title: "Drop your documents here",
      hint: "Drag and drop your files, or click to browse — brokerage statements, residence certificates, mandates.",
      demo: "Demo: nothing is actually transmitted — your files never leave this browser.",
      added: (n) => `${n} file${n === 1 ? "" : "s"} added to the processing queue (demo).`,
      localNote:
        "Demo upload: this file never left your browser and nothing was transmitted. In the real portal, extraction (amounts, dates, ISINs) starts immediately and the read is logged in the audit trail.",
    },
    list: {
      count: (n) => `${n} document${n === 1 ? "" : "s"}`,
      uploadedPrefix: "Uploaded",
      extraction: (n) => `Extracted data (${n})`,
      auditNote: "Automated read · verified · logged in the audit trail",
    },
    status: {
      extracted: "Extracted",
      processing: "Processing",
      "needs-review": "Needs review",
    },
    empty: {
      title: "No documents for this view.",
      body: "Upload your first statement: extraction identifies over-withheld dividends line by line, and every read is logged in the audit trail.",
      cta: "Upload a first document",
      link: "Understand the recovery service",
    },
    ask: {
      kicker: "Claim documents",
      title: "The documents we ask for — and why",
      lede: "Three pieces cover most claims. None is requested without a reason: here is what each one proves.",
      items: [
        {
          title: "Brokerage or dividend statements",
          body: "The raw material of the claim: they evidence the dividend payments and the tax actually withheld, line by line — ISINs, dates, amounts. This is what the automated extraction works on.",
          link: "The recovery service",
        },
        {
          title: "Certificate of tax residence",
          body: "The piece that unlocks the treaty rate: without it, no foreign administration will refund anything. We guide you through obtaining it from your local tax office.",
          link: "Get the certificate",
        },
        {
          title: "Representation mandate",
          body: "It authorises us to act on your behalf before each administration: filing, tracking, follow-ups. Signed electronically, straight from your account.",
          link: "The process, step by step",
        },
      ],
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

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const p = getPortalStrings(locale);
  const { entityFilter } = usePortal();

  const [localDocs, setLocalDocs] = useState<ViewDoc[]>([]);
  const [addedMsg, setAddedMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef(0);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const entityId = entityFilter !== "all" ? entityFilter : DEMO_ENTITIES[0].id;
    const today = new Date().toISOString().slice(0, 10);
    const items: ViewDoc[] = Array.from(files).map((file) => ({
      id: `local-${++counterRef.current}`,
      entityId,
      name: file.name,
      kind: LOCAL_KIND,
      uploadedOn: today,
      status: "processing" as const,
      local: true,
    }));
    setLocalDocs((prev) => [...items, ...prev]);
    setAddedMsg(t.drop.added(files.length));
  };

  const visible = filterByEntity<ViewDoc>([...localDocs, ...DEMO_DOCUMENTS], entityFilter);
  const groups = DEMO_ENTITIES.map((entity) => ({
    entity,
    docs: visible
      .filter((d) => d.entityId === entity.id)
      .sort((a, b) => b.uploadedOn.localeCompare(a.uploadedOn)),
  })).filter((g) => g.docs.length > 0);

  return (
    <div>
      {/* -------------------------------------------------------- */}
      {/* Heading + pipeline explanation                             */}
      {/* -------------------------------------------------------- */}
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">{t.title}</h1>
        <p className="mt-1 max-w-[68ch] text-[15px] leading-relaxed text-mine">{t.sub}</p>
      </header>

      {/* -------------------------------------------------------- */}
      {/* Mocked dropzone — always on top                            */}
      {/* -------------------------------------------------------- */}
      <section className="mt-6" aria-label={t.drop.title}>
        <label
          htmlFor={UPLOAD_INPUT_ID}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`block cursor-pointer rounded-[6px] border-2 border-dashed bg-white p-6 text-center transition-colors focus-within:border-brand hover:border-brand sm:p-8 ${
            dragging ? "border-brand bg-tint-green" : "border-rule"
          }`}
        >
          <input
            ref={inputRef}
            id={UPLOAD_INPUT_ID}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
            aria-describedby={`${UPLOAD_INPUT_ID}-hint ${UPLOAD_INPUT_ID}-demo`}
          />
          <span className="block text-[15px] font-medium text-ink">{t.drop.title}</span>
          <span
            id={`${UPLOAD_INPUT_ID}-hint`}
            className="mt-1 block text-sm leading-relaxed text-mine"
          >
            {t.drop.hint}
          </span>
          <span
            id={`${UPLOAD_INPUT_ID}-demo`}
            className="mt-3 block font-mono text-xs text-gold-ink"
          >
            {t.drop.demo}
          </span>
        </label>
        <p role="status" aria-live="polite" className="mt-2 min-h-[1.25rem] font-mono text-xs text-brand">
          {addedMsg}
        </p>
      </section>

      {/* -------------------------------------------------------- */}
      {/* Documents, grouped by entity                               */}
      {/* -------------------------------------------------------- */}
      {visible.length === 0 ? (
        <Card className="mt-6 p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">{t.empty.title}</p>
          <p className="mx-auto mt-2 max-w-[52ch] text-[15px] leading-relaxed text-mine">
            {t.empty.body}
          </p>
          <div className="mt-5 flex flex-col items-center gap-3">
            <Button variant="secondary" onClick={() => inputRef.current?.click()}>
              {t.empty.cta}
            </Button>
            <Link
              href={href(locale, "serviceRecovery")}
              className="text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              {t.empty.link} →
            </Link>
          </div>
        </Card>
      ) : (
        groups.map(({ entity, docs }) => (
          <section key={entity.id} className="mt-8" aria-labelledby={`docs-${entity.id}`}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 id={`docs-${entity.id}`} className="font-display text-xl font-semibold text-ink">
                {entity.name[locale]}
              </h2>
              <Badge tone="neutral">{entity.type[locale]}</Badge>
              <span className="font-mono text-xs text-mine">{t.list.count(docs.length)}</span>
            </div>
            <Card className="mt-3">
              <ul>
                {docs.map((doc) => (
                  <li key={doc.id} className="border-b border-rule px-4 py-4 last:border-b-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                      <div className="min-w-0 flex-1 basis-64">
                        <p className="break-all font-mono text-[14px] font-medium text-ink">
                          {doc.name}
                        </p>
                        <p className="mt-1 text-[13px] text-mine">
                          {doc.kind[locale]} · {t.list.uploadedPrefix}{" "}
                          <span className="font-mono">{formatDate(doc.uploadedOn, locale)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.claimId && (
                          <Link
                            href={claimHref(locale, doc.claimId)}
                            className="font-mono text-xs text-brand underline-offset-4 hover:underline"
                            aria-label={`${p.common.viewClaim} ${doc.claimId}`}
                          >
                            {doc.claimId} →
                          </Link>
                        )}
                        <Badge tone={STATUS_TONE[doc.status]}>{t.status[doc.status]}</Badge>
                      </div>
                    </div>

                    {doc.local && (
                      <p className="mt-2 rounded-[4px] bg-tint-gold px-2.5 py-1.5 text-[13px] leading-relaxed text-gold-ink">
                        {t.drop.localNote}
                      </p>
                    )}

                    {doc.status === "extracted" && doc.extraction && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-[14px] font-medium text-brand underline-offset-4 hover:underline">
                          {t.list.extraction(doc.extraction.length)}
                        </summary>
                        <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                          {doc.extraction.map((entry) => (
                            <div
                              key={entry.field.fr}
                              className="flex items-baseline justify-between gap-3 border-b border-rule pb-1"
                            >
                              <dt className="text-[13px] text-mine">{entry.field[locale]}</dt>
                              <dd className="font-mono text-[13px] text-ink">{entry.value}</dd>
                            </div>
                          ))}
                        </dl>
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-mine">
                          {t.list.auditNote}
                        </p>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ))
      )}

      {/* -------------------------------------------------------- */}
      {/* What we ask for, and why                                   */}
      {/* -------------------------------------------------------- */}
      <section className="mt-10" aria-labelledby="docs-ask">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
          {t.ask.kicker}
        </p>
        <h2 id="docs-ask" className="mt-2 font-display text-xl font-semibold text-ink">
          {t.ask.title}
        </h2>
        <p className="mt-1 max-w-[68ch] text-[15px] leading-relaxed text-mine">{t.ask.lede}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {t.ask.items.map((item, i) => (
            <Card key={item.title} className="flex flex-col p-5">
              <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">{item.body}</p>
              <Link
                href={href(locale, ASK_ROUTES[i])}
                className="mt-3 text-[15px] font-medium text-brand underline-offset-4 hover:underline"
              >
                {item.link} →
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
