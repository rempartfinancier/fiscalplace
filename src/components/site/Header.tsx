"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { articleHref, href, type RouteKey } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { ButtonLink } from "@/components/ui/primitives";
import { useLeadCapture } from "./LeadCapture";
import { CATEGORY_LABELS } from "@/data/articles/types";
import { costOfRecovery } from "@/data/articles/cost-of-recovery";
import { diyVsDelegate } from "@/data/articles/diy-vs-delegate";
import { nothingToRecover } from "@/data/articles/nothing-to-recover";

const LOGIN_LEAD_LABEL: Localized<string> = {
  fr: "Connexion à l'espace client",
  en: "Client-area login",
};

/**
 * Self-service tools, listed first in the Resources menu — Endless Customers
 * doctrine: a visitor should be able to get a real answer before reading
 * anything or talking to anyone.
 */
const TOOLS_MENU: { key: RouteKey; label: Localized<string>; hint: Localized<string> }[] = [
  {
    key: "simulator",
    label: { fr: "Simulateur de récupération", en: "Refund simulator" },
    hint: { fr: "Votre trop-perçu, chiffré en 2 minutes", en: "Your over-withholding, in 2 minutes" },
  },
  {
    key: "solCalculator",
    label: { fr: "Calculateur de délais de prescription", en: "Deadline calculator" },
    hint: { fr: "Ce qui expire bientôt, pays par pays", en: "What expires soon, country by country" },
  },
  {
    key: "w8benChecker",
    label: { fr: "Vérificateur W-8BEN", en: "W-8BEN checker" },
    hint: { fr: "Votre formulaire est-il encore valide ?", en: "Is your form still valid?" },
  },
  {
    key: "statementReader",
    label: { fr: "Lecteur de relevé", en: "Statement reader" },
    hint: { fr: "Collez une ligne, obtenez le diagnostic", en: "Paste a line, get the diagnosis" },
  },
];

/**
 * Three Big-5 articles judged most load-bearing for a first-time visitor:
 * cost (the #1 Sheridan topic), an honest DIY-vs-us comparison, and the
 * anti-sales "where there's nothing to recover" piece.
 */
const FEATURED_ARTICLES = [costOfRecovery, diyVsDelegate, nothingToRecover];

const RESOURCES_MENU_COPY: Localized<{ toolsKicker: string; readKicker: string; allLink: string }> = {
  fr: { toolsKicker: "Outils gratuits", readKicker: "À lire", allLink: "Toutes les ressources →" },
  en: { toolsKicker: "Free tools", readKicker: "Worth reading", allLink: "All resources →" },
};

function BrandMark({ locale }: { locale: Locale }) {
  return (
    <Link href={href(locale, "home")} className="flex items-center gap-2">
      {/* Logotype: double rule under the name — the settled-entry mark. */}
      <span className="relative font-display text-xl font-bold tracking-tight text-ink">
        Fiscal<span className="text-brand">Place</span>
        <span className="double-rule absolute -bottom-1 left-0 h-[5px] w-full" aria-hidden="true" />
      </span>
    </Link>
  );
}

function ResourcesMenuContent({ locale, onNavigate }: { locale: Locale; onNavigate: () => void }) {
  const m = RESOURCES_MENU_COPY[locale];
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-mine">
          {m.toolsKicker}
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {TOOLS_MENU.map((tool) => (
            <li key={tool.key}>
              <Link
                href={href(locale, tool.key)}
                onClick={onNavigate}
                className="block rounded-[6px] px-2 py-1.5 hover:bg-paper"
              >
                <span className="block text-[15px] font-medium text-ink">{tool.label[locale]}</span>
                <span className="block text-[13px] text-mine">{tool.hint[locale]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-mine">
          {m.readKicker}
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {FEATURED_ARTICLES.map((article) => (
            <li key={article.id}>
              <Link
                href={articleHref(locale, article.slug[locale])}
                onClick={onNavigate}
                className="block rounded-[6px] px-2 py-1.5 hover:bg-paper"
              >
                <span className="block font-mono text-[11px] uppercase tracking-wide text-mine">
                  {CATEGORY_LABELS[article.category][locale]}
                </span>
                <span className="block text-[15px] font-medium leading-snug text-ink">
                  {article.title[locale]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="sm:col-span-2">
        <Link
          href={href(locale, "resources")}
          onClick={onNavigate}
          className="block border-t border-rule pt-3 text-[14px] font-medium text-brand hover:underline underline-offset-4"
        >
          {m.allLink}
        </Link>
      </div>
    </div>
  );
}

export function Header({ locale, altHref }: { locale: Locale; altHref: string }) {
  const t = getCommon(locale);
  const [open, setOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const { openLeadCapture } = useLeadCapture();
  const openLoginLead = () => openLeadCapture({ kind: "login", serviceLabel: LOGIN_LEAD_LABEL[locale] });

  useEffect(() => {
    if (!resourcesOpen) return;
    function onDocClick(e: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setResourcesOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [resourcesOpen]);

  const links: { key: RouteKey; label: string }[] = [
    { key: "howItWorks", label: t.nav.howItWorks },
    { key: "services", label: t.nav.services },
    { key: "pricing", label: t.nav.pricing },
    { key: "countries", label: t.nav.countries },
  ];
  const otherLocale = locale === "fr" ? "EN" : "FR";
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[6px] focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        {t.a11y.skipToContent}
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandMark locale={locale} />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation">
          {links.map((link) => (
            <Link
              key={link.key}
              href={href(locale, link.key)}
              className="text-[15px] text-ink hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
          <div ref={resourcesRef} className="relative">
            <button
              type="button"
              onClick={() => setResourcesOpen((v) => !v)}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 text-[15px] text-ink hover:text-brand"
            >
              {t.nav.resources}
              <span aria-hidden="true" className={`text-xs transition-transform ${resourcesOpen ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {resourcesOpen && (
              <div
                role="menu"
                className="absolute left-1/2 top-full z-50 mt-3 w-[520px] max-w-[90vw] -translate-x-1/2 rounded-[6px] border border-rule bg-white p-5 shadow-float"
              >
                <ResourcesMenuContent locale={locale} onNavigate={() => setResourcesOpen(false)} />
              </div>
            )}
          </div>
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href={altHref}
            className="font-mono text-[13px] text-mine hover:text-brand"
            aria-label={t.footer.langLabel}
          >
            {otherLocale}
          </Link>
          <button
            type="button"
            onClick={openLoginLead}
            className="text-[15px] text-ink hover:text-brand"
          >
            {t.nav.login}
          </button>
          <ButtonLink href={href(locale, "simulator")}>{t.nav.simulateCta}</ButtonLink>
        </div>
        <button
          className="rounded-[6px] border border-rule bg-white px-3 py-2 text-sm lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? t.nav.close : t.nav.menu}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Navigation"
          className="border-t border-rule bg-white px-4 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={href(locale, link.key)}
                  className="block rounded-[6px] px-2 py-2 text-[16px] text-ink hover:bg-paper"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setMobileResourcesOpen((v) => !v)}
                aria-expanded={mobileResourcesOpen}
                className="flex w-full items-center justify-between rounded-[6px] px-2 py-2 text-left text-[16px] text-ink hover:bg-paper"
              >
                {t.nav.resources}
                <span aria-hidden="true" className={`text-xs transition-transform ${mobileResourcesOpen ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {mobileResourcesOpen && (
                <div className="px-2 py-3">
                  <ResourcesMenuContent
                    locale={locale}
                    onNavigate={() => {
                      setOpen(false);
                      setMobileResourcesOpen(false);
                    }}
                  />
                </div>
              )}
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openLoginLead();
                }}
                className="block w-full rounded-[6px] px-2 py-2 text-left text-[16px] text-ink hover:bg-paper"
              >
                {t.nav.login}
              </button>
            </li>
            <li>
              <Link
                href={altHref}
                className="block rounded-[6px] px-2 py-2 font-mono text-[14px] text-mine hover:bg-paper"
              >
                {otherLocale}
              </Link>
            </li>
            <li className="mt-2">
              <ButtonLink href={href(locale, "simulator")} className="w-full">
                {t.nav.simulateCta}
              </ButtonLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
