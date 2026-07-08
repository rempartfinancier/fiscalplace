# fiscalplace.com

Plateforme de récupération du trop-perçu de retenue à la source (withholding tax) sur les dividendes étrangers — directe, transparente, self-service d'abord (méthode Endless Customers).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000 → redirige vers /fr
npm run build    # build de production (toutes les pages sont statiques)
```

## Architecture

- **Next.js App Router + TypeScript + Tailwind v4**, 100 % statique, backend simulé pour la démonstration.
- **i18n FR/EN à slugs localisés** : registre central `src/lib/routes.ts`, dispatcher `src/app/[locale]/[...slug]/page.tsx`. Aucune URL ni chaîne visible en dur dans les composants.
- **Sources de vérité des données** :
  - `src/config/pricing.ts` — grille tarifaire paramétrable (commission au succès marginale, forfaits, abonnement). Tout prix affiché en dérive.
  - `src/data/countries.ts` — base des taux conventionnels et délais de prescription, versionnée (`DATA_VERSION`), à revalider par un fiscaliste avant tout usage réel.
  - `src/data/demo-portal.ts` — données fictives de l'espace client de démonstration.
- **Design system** « Le grand livre réconcilié » : tokens dans `src/app/globals.css`, composants dans `src/components/ui/`, conventions complètes dans `docs/CONVENTIONS.md`.

## Livrables associés

- `CHANGELOG.md` — décisions prises en autonomie et placeholders restants.
- `docs/MISE-EN-PRODUCTION.md` — checklist humaine avant lancement commercial réel.
