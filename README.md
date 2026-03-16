# Carte de l'Education

Carte interactive des etablissements scolaires en France (ecoles, colleges, lycees) avec overlay des donnees d'insertion professionnelle universitaire.

## Fonctionnalites

- **Carte interactive** avec ~63 000 etablissements scolaires (ecoles, colleges, lycees)
- **Marqueurs colores par type** : bleu ciel (ecoles), indigo (colleges), violet (lycees)
- **MarkerCluster** pour les performances avec 63K+ marqueurs
- **Filtres** : type d'etablissement, secteur (public/prive), education prioritaire, options (sport, international, europeenne)
- **Recherche textuelle** par nom ou ville
- **Sidebar** avec liste des etablissements visibles dans le viewport
- **Couche insertion professionnelle** (toggle) : marqueurs universitaires avec taux d'insertion, taux d'emploi et salaire median par discipline Master
- **Responsive** : sidebar desktop / bottom sheet mobile
- **DOM-TOM inclus** : pas de restriction de bounds sur la carte

## Sources de donnees

| Source | API | Contenu |
|--------|-----|---------|
| Annuaire Education | data.education.gouv.fr | 68 926 etablissements scolaires |
| Insertion pro Master | data.enseignementsup-recherche.gouv.fr | Taux d'insertion, emploi, salaires par discipline |
| Etablissements sup. | data.enseignementsup-recherche.gouv.fr | Geolocalisation des universites (pour jointure) |

## Commandes

```bash
npm run dev        # Serveur de dev Vite (http://localhost:5173/carte-education/)
npm run build      # tsc -b && vite build -> dist/
npm run lint       # ESLint
npm run preview    # Preview du build
npm run data       # Rafraichir les donnees depuis les APIs ouvertes
```

## Architecture

Application React 19 + TypeScript + Tailwind CSS v4 + Leaflet avec MarkerCluster.

### Pipeline de donnees (`scripts/fetch-data.mjs`)

1. Telecharge les ecoles/colleges/lycees depuis l'annuaire education (API exports/json)
2. Telecharge les donnees d'insertion pro Master (derniere annee disponible)
3. Telecharge les etablissements d'enseignement superieur pour la geolocalisation
4. Joint les donnees d'insertion avec les coordonnees par nom d'etablissement
5. Produit `public/data/etablissements.json` et `public/data/insertion.json`

### Modules

| Module | Role |
|--------|------|
| `App.tsx` | Orchestrateur : recherche, filtres, selection, panneau lateral |
| `components/MapView.tsx` | Carte Leaflet + MarkerCluster + couche insertion |
| `components/Filters.tsx` | Controles de filtrage (type, secteur, edu prio, options) |
| `components/SchoolPanel.tsx` | Liste laterale des etablissements visibles |
| `components/SchoolCard.tsx` | Carte d'un etablissement dans la liste |
| `components/InsertionDetail.tsx` | Modal detail insertion pro par discipline |
| `hooks/useData.ts` | Chargement des deux fichiers JSON |
| `hooks/useFilters.ts` | Logique de filtrage + agregation universites |
| `utils/colors.ts` | Couleurs par type d'etablissement |
| `utils/format.ts` | Formatage (pourcentages, salaires, troncature) |

### Deploiement

GitHub Pages via `.github/workflows/deploy.yml`. Rafraichissement mensuel des donnees via `.github/workflows/update-data.yml`.
