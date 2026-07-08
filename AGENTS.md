<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# fiscalplace.com — règles projet

Avant toute contribution, lire `docs/CONVENTIONS.md` (design system « Le grand livre réconcilié », contrat i18n FR/EN, sources de vérité des données, garde-fous anti-hallucination). En bref :

- Aucun texte visible en dur dans les composants : pattern `copy: Localized<...>` + `getCommon(locale)`.
- Aucun taux/délai/tarif recopié : importer `src/data/countries.ts` et `src/config/pricing.ts`.
- Liens internes uniquement via `href()/countryHref()/articleHref()/claimHref()` de `src/lib/routes.ts`.
- Jamais inventer : SIREN, agréments, IBAN, membres d'équipe, témoignages, certifications, chiffres de traction → placeholder `[… À COMPLÉTER]`.
- Vérification : `npx tsc --noEmit` puis `npm run build`.
