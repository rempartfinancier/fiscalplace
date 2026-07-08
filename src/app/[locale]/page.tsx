import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { MarketingChrome } from "@/components/site/MarketingChrome";
import HomePage, { getMeta } from "@/components/pages/home";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const meta = getMeta(locale);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { languages: { fr: href("fr", "home"), en: href("en", "home") } },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const altHref = href(locale === "fr" ? "en" : "fr", "home");
  return (
    <MarketingChrome locale={locale} altHref={altHref}>
      <HomePage locale={locale} />
    </MarketingChrome>
  );
}
