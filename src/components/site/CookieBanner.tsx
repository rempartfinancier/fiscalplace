"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { Button } from "@/components/ui/primitives";

const STORAGE_KEY = "fp-cookie-consent";

const COPY = {
  fr: {
    text: "Nous n'utilisons que des cookies strictement nécessaires au fonctionnement du site. Aucun cookie publicitaire, aucun traceur tiers. Si nous ajoutons un jour des cookies de mesure d'audience, ils resteront désactivés tant que vous ne les aurez pas acceptés ici.",
    accept: "J'ai compris",
    refuse: "Continuer sans cookies optionnels",
    more: "Politique de cookies",
  },
  en: {
    text: "We only use cookies strictly necessary for the site to work. No advertising cookies, no third-party trackers. If we ever add analytics cookies, they will stay off until you accept them here.",
    accept: "Got it",
    refuse: "Continue without optional cookies",
    more: "Cookie policy",
  },
} as const;

export function CookieBanner({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);
  if (!visible) return null;
  const t = COPY[locale];
  const choose = (value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };
  return (
    <div
      role="region"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-white p-4 shadow-float"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[80ch] text-sm leading-relaxed text-mine">
          {t.text}{" "}
          <Link href={href(locale, "cookies")} className="text-brand underline underline-offset-2">
            {t.more}
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="secondary" onClick={() => choose("essential-only")}>
            {t.refuse}
          </Button>
          <Button onClick={() => choose("acknowledged")}>{t.accept}</Button>
        </div>
      </div>
    </div>
  );
}
