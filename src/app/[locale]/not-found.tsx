import Link from "next/link";

/**
 * Locale is not reliably known in not-found context, so this page is
 * deliberately bilingual — the only page on the site allowed to be.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[6px] border border-rule bg-white p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-mine">Erreur · Error 404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
          Cette page n&apos;est pas au registre
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mine">
          La page demandée n&apos;existe pas ou a été déplacée. / The page you requested does not
          exist or has moved.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/fr"
            className="rounded-[6px] border border-brand bg-brand px-5 py-2.5 text-[15px] font-medium text-white hover:bg-brand-deep"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/en"
            className="rounded-[6px] border border-ink bg-white px-5 py-2.5 text-[15px] font-medium text-ink hover:bg-paper"
          >
            Back to the English homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
