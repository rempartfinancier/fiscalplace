"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { href, type RouteKey } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { ButtonLink } from "@/components/ui/primitives";
import { useLeadCapture } from "./LeadCapture";

const LOGIN_LEAD_LABEL: Localized<string> = {
  fr: "Connexion à l'espace client",
  en: "Client-area login",
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

export function Header({ locale, altHref }: { locale: Locale; altHref: string }) {
  const t = getCommon(locale);
  const [open, setOpen] = useState(false);
  const { openLeadCapture } = useLeadCapture();
  const openLoginLead = () => openLeadCapture({ kind: "login", serviceLabel: LOGIN_LEAD_LABEL[locale] });
  const links: { key: RouteKey; label: string }[] = [
    { key: "howItWorks", label: t.nav.howItWorks },
    { key: "services", label: t.nav.services },
    { key: "pricing", label: t.nav.pricing },
    { key: "countries", label: t.nav.countries },
    { key: "resources", label: t.nav.resources },
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
