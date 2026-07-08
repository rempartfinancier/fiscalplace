"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { href, type RouteKey } from "@/lib/routes";
import { getPortalStrings } from "@/content/portal";
import { getCommon } from "@/content/common";
import { DEMO_ENTITIES, DEMO_USER } from "@/data/demo-portal";
import { Badge, ButtonLink } from "@/components/ui/primitives";
import { PortalProvider, usePortal } from "./PortalContext";

function Gate({ locale }: { locale: Locale }) {
  const t = getPortalStrings(locale);
  const { enter } = usePortal();
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-[6px] border border-rule bg-white p-8">
        <Badge tone="gold">{t.common.demoTag}</Badge>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t.gate.title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.gate.text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={enter}
            className="inline-flex cursor-pointer items-center justify-center rounded-[6px] border border-brand bg-brand px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-deep"
          >
            {t.gate.enterDemo}
          </button>
          <ButtonLink href={href(locale, "home")} variant="secondary">
            {t.gate.backToSite}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

function Shell({
  locale,
  altHref,
  children,
}: {
  locale: Locale;
  altHref: string;
  children: ReactNode;
}) {
  const t = getPortalStrings(locale);
  const common = getCommon(locale);
  const { entityFilter, setEntityFilter, notifications, exit, entered } = usePortal();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (!entered) return <Gate locale={locale} />;

  const unread = notifications.filter((n) => !n.read).length;
  const items: { key: RouteKey; label: string; badge?: number }[] = [
    { key: "portal", label: t.nav.dashboard },
    { key: "portalClaims", label: t.nav.claims },
    { key: "portalDocuments", label: t.nav.documents },
    { key: "portalMessages", label: t.nav.messages },
    { key: "portalBilling", label: t.nav.billing },
    { key: "portalEntities", label: t.nav.entities },
    { key: "portalNotifications", label: t.nav.notifications, badge: unread },
    { key: "portalPartner", label: t.nav.partner },
    { key: "portalSettings", label: t.nav.settings },
  ];

  const nav = (
    <nav aria-label={t.nav.dashboard} className="flex flex-col gap-0.5">
      {items.map((item) => {
        const url = href(locale, item.key);
        const active = item.key === "portal" ? pathname === url : pathname.startsWith(url);
        return (
          <Link
            key={item.key}
            href={url}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between rounded-[6px] px-3 py-2 text-[15px] ${
              active ? "bg-tint-green font-medium text-brand" : "text-ink hover:bg-paper"
            }`}
          >
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-debit px-1.5 font-mono text-[11px] font-medium text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
      <button
        onClick={exit}
        className="mt-2 cursor-pointer rounded-[6px] px-3 py-2 text-left text-[14px] text-mine hover:bg-paper"
      >
        {t.nav.logout}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <div className="border-b border-gold/40 bg-tint-gold px-4 py-1.5 text-center font-mono text-[11px] uppercase tracking-wide text-gold-ink">
        {common.demoBanner}
      </div>
      <header className="border-b border-rule bg-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href={href(locale, "home")} className="relative font-display text-lg font-bold text-ink">
            Fiscal<span className="text-brand">Place</span>
            <span className="double-rule absolute -bottom-0.5 left-0 h-[5px] w-full" aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="hidden font-mono text-[11px] uppercase tracking-wide text-mine sm:inline">
                {t.entitySwitcher.label}
              </span>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="rounded-[6px] border border-rule bg-white px-2 py-1.5 text-sm"
              >
                <option value="all">{t.entitySwitcher.all}</option>
                {DEMO_ENTITIES.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name[locale]}
                  </option>
                ))}
              </select>
            </label>
            <Link href={altHref} className="font-mono text-[13px] text-mine hover:text-brand">
              {locale === "fr" ? "EN" : "FR"}
            </Link>
            <span className="hidden rounded-full bg-paper px-3 py-1.5 text-sm text-ink md:inline">
              {DEMO_USER.firstName}
            </span>
            <button
              className="rounded-[6px] border border-rule bg-white px-3 py-1.5 text-sm lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
            >
              {menuOpen ? common.nav.close : common.nav.menu}
            </button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-rule px-4 py-3 lg:hidden">{nav}</div>}
      </header>
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">{nav}</aside>
        <main id="contenu" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PortalChrome({
  locale,
  altHref,
  children,
}: {
  locale: Locale;
  altHref: string;
  children: ReactNode;
}) {
  return (
    <PortalProvider>
      <Shell locale={locale} altHref={altHref}>
        {children}
      </Shell>
    </PortalProvider>
  );
}
