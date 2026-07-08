import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href, countryHref, type RouteKey } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { COUNTRIES } from "@/data/countries";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-sm text-ink hover:text-brand">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SERVICE_LABELS: Record<string, { fr: string; en: string }> = {
  serviceRecovery: { fr: "Récupération de withholding tax", en: "Withholding tax recovery" },
  serviceW8ben: { fr: "Formulaire W-8BEN", en: "W-8BEN form" },
  serviceResidenceCert: { fr: "Certificat de résidence fiscale", en: "Certificate of tax residence" },
  serviceItin: { fr: "Demande d'ITIN", en: "ITIN application" },
  serviceReliefAtSource: { fr: "Relief at source", en: "Relief at source" },
  serviceMonitoring: { fr: "Suivi & Alertes multi-portefeuille", en: "Monitoring & Alerts" },
  whiteLabel: { fr: "Marque blanche pour CGP", en: "White label for advisers" },
};

const COMPANY_LABELS: Record<string, { fr: string; en: string }> = {
  howItWorks: { fr: "Comment ça marche", en: "How it works" },
  pricing: { fr: "Tarifs", en: "Pricing" },
  comparison: { fr: "Comparatif", en: "Compare your options" },
  reviews: { fr: "Avis clients", en: "Client reviews" },
  about: { fr: "À propos", en: "About" },
  howWeGetPaid: { fr: "Comment nous sommes payés", en: "How we get paid" },
  faq: { fr: "FAQ", en: "FAQ" },
  security: { fr: "Sécurité & confidentialité", en: "Security & privacy" },
  contact: { fr: "Contact", en: "Contact" },
};

const TOOLS_LABELS: Record<string, { fr: string; en: string }> = {
  simulator: { fr: "Simulateur de récupération", en: "Refund simulator" },
  solCalculator: { fr: "Calculateur de prescription", en: "Deadline calculator" },
  resources: { fr: "Toutes les ressources", en: "All resources" },
};

const LEGAL_LABELS: Record<string, { fr: string; en: string }> = {
  legalNotice: { fr: "Mentions légales", en: "Legal notice" },
  termsOfUse: { fr: "CGU", en: "Terms of use" },
  termsOfSale: { fr: "CGV", en: "Terms of sale" },
  privacy: { fr: "Confidentialité", en: "Privacy policy" },
  cookies: { fr: "Cookies", en: "Cookies" },
};

export function Footer({ locale }: { locale: Locale }) {
  const t = getCommon(locale);
  const toLinks = (labels: Record<string, { fr: string; en: string }>) =>
    Object.entries(labels).map(([key, label]) => ({
      href: href(locale, key as RouteKey),
      label: label[locale],
    }));
  return (
    <footer className="border-t border-rule bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="relative inline-block font-display text-lg font-bold text-ink">
              Fiscal<span className="text-brand">Place</span>
              <span className="double-rule absolute -bottom-1 left-0 h-[5px] w-full" aria-hidden="true" />
            </p>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-mine">{t.footer.baseline}</p>
            <p className="mt-4 font-mono text-[12px] text-mine">{t.trustLine}</p>
          </div>
          <FooterColumn title={t.footer.services} links={toLinks(SERVICE_LABELS)} />
          <FooterColumn
            title={t.footer.countries}
            links={COUNTRIES.map((c) => ({
              href: countryHref(locale, c.slug[locale]),
              label: c.name[locale],
            }))}
          />
          <FooterColumn
            title={t.footer.resources}
            links={toLinks(TOOLS_LABELS)}
          />
          <div className="flex flex-col gap-10">
            <FooterColumn title={t.footer.company} links={toLinks(COMPANY_LABELS)} />
          </div>
        </div>
        <div className="mt-12 border-t border-rule pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {toLinks(LEGAL_LABELS).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-xs text-mine hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[100ch] text-xs leading-relaxed text-mine">{t.footer.disclaimer}</p>
          <p className="mt-3 max-w-[100ch] text-xs leading-relaxed text-mine">{t.footer.ratesNote}</p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-wide text-mine">
            {t.footer.copyrightLine}
          </p>
        </div>
      </div>
    </footer>
  );
}
