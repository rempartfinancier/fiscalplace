import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LeadCaptureProvider } from "./LeadCapture";

export function MarketingChrome({
  locale,
  altHref,
  children,
}: {
  locale: Locale;
  altHref: string;
  children: ReactNode;
}) {
  return (
    <LeadCaptureProvider locale={locale}>
      <Header locale={locale} altHref={altHref} />
      <main id="contenu">{children}</main>
      <Footer locale={locale} />
    </LeadCaptureProvider>
  );
}
