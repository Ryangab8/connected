# Connected — UK Biodiversity Web

## Project Handoff Guide

**Live site:** [connectedbiodiversity.com](https://connectedbiodiversity.com)
**Repository:** github.com/Ryangab8/connected
**Hosted on:** Vercel (auto-deploys on push to `main`)
**Total project size:** ~3.2 MB (excluding node_modules)

---

## What This Project Is

Connected is an interactive visualization of 29 UK and Ireland wildlife species and the 85+ ecological relationships between them. It demonstrates how species are interconnected through predator-prey dynamics, habitat dependencies, pollination, competition, and more — and what happens when those connections break.

The project has five main sections:
- **The Web** (`/`) — An interactive canvas-based network graph showing all 29 species as nodes, grouped by ecosystem, with 85 colored edges representing ecological relationships. Click any species to see its connections. Filter by relationship type.
- **Map** (`/map`) — Two modes: "Species Explorer" (select a species, see its GBIF distribution heatmap) and "Cascade Stories" (step through cascades geographically with centroid arrows).
- **Stories** (`/stories`) — Eight cascade narratives explaining real documented ecological chain reactions.
- **Break the Chain** (`/act`) — Conservation intervention points: what's at stake, what's being done, what individuals can do.
- **About** (`/about`) — Project description, tech stack, sources, and creator bio placeholder.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Git

### Run locally
```bash
git clone https://github.com/Ryangab8/connected.git
cd connected
npm install
npm run dev
# Opens at http://localhost:5173
```

### Deploy changes
```bash
git add .
git commit -m "description of changes"
git push origin main
# Vercel auto-deploys in ~30 seconds
```

---

## Complete Project Structure

```
connected/
│
├── index.html                  # SPA entry point, mounts React at #root
├── package.json                # Dependencies & npm scripts
├── vite.config.js              # Vite config: React plugin, port 5173, auto-open
├── .env.example                # Template for GBIF_USERNAME, GBIF_PASSWORD, CLAUDE_API_KEY
├── config.example.json         # Alternate API key config for scripts
├── .gitignore                  # Ignores node_modules, dist, .env, scripts/output
│
├── data/                       # SOURCE OF TRUTH — curated data files
│   ├── species.json            # 29 species with full metadata (42 KB)
│   ├── relationships.json      # 85 ecological relationships, 11 types (37 KB)
│   ├── cascades.json           # 8 cascade narratives with step chains (16.6 KB)
│   └── species-images.json     # Wikimedia Commons image URLs, 26 of 29 species (10.4 KB)
│
├── scripts/                    # Data processing pipeline
│   ├── fetch-gbif.js           # Fetches GBIF occurrence data (needs .env for credentials)
│   ├── process-species.js      # Calculates decline & ecological impact scores
│   ├── generate-stories.js     # Generates narratives via Claude API (needs CLAUDE_API_KEY)
│   ├── build-data.js           # Orchestrates full pipeline: fetch → process → generate
│   ├── eval-methodology.js     # Compares decline calculation methodologies
│   ├── fetch-wikimedia-images.js  # Fetches CC images from Wikimedia by scientific name
│   ├── find-missing-images.js  # Identifies species still missing images
│   └── output/gbif/            # Raw GBIF fetch results (29 per-species JSON files)
│
├── src/
│   ├── index.jsx               # ReactDOM entry — BrowserRouter + StrictMode
│   ├── App.jsx                 # Router: all routes + AnimatePresence transitions
│   │
│   ├── components/             # 15 React components
│   │   ├── NetworkGraph.jsx    # Home page — canvas network, pan/zoom, filtering (23.6 KB)
│   │   ├── MapPage.jsx         # Map page — Leaflet heatmaps + cascade arrows (28.3 KB)
│   │   ├── ActPage.jsx         # Break the Chain — 8 intervention cards (28.1 KB)
│   │   ├── SpeciesPage.jsx     # Species detail — hero, map, connections (16.9 KB)
│   │   ├── AboutPage.jsx       # About — tech stack, sources, bio placeholder (11.9 KB)
│   │   ├── CascadeOverlay.jsx  # Step-by-step cascade chain overlay (9.0 KB)
│   │   ├── CascadeStory.jsx    # Individual story page with species images (8.1 KB)
│   │   ├── SpeciesPanel.jsx    # Sidebar panel for hover/click details (8.1 KB)
│   │   ├── Header.jsx          # Fixed nav bar with animated active link (6.6 KB)
│   │   ├── MapView.jsx         # Leaflet map wrapper + tile config (6.4 KB)
│   │   ├── StoriesPage.jsx     # Stories landing — grid of 8 cascade cards (5.2 KB)
│   │   ├── Legend.jsx           # Network legend — ecosystems, types, statuses (4.5 KB)
│   │   ├── SpeciesImage.jsx    # Lazy-loaded photo with fallback + CC attribution (4.2 KB)
│   │   ├── RelationshipTypeFilter.jsx  # Edge type filter buttons (3.6 KB)
│   │   └── EcosystemFilter.jsx # Ecosystem cluster visibility toggles (2.7 KB)
│   │
│   ├── lib/
│   │   └── dataLoader.js       # Central data utility — node positions, lazy-loading,
│   │                           #   color helpers, centroid calc, all getters (12.1 KB)
│   │
│   ├── styles/
│   │   └── global.css          # CSS custom properties theme, responsive breakpoints (6.3 KB)
│   │
│   └── data/                   # BUILD OUTPUT — mirrors data/ folder + distributions
│       ├── species.json        # (copied from data/)
│       ├── relationships.json  # (copied from data/)
│       ├── cascades.json       # (copied from data/)
│       ├── species-images.json # (copied from data/)
│       ├── distributions.json  # Combined GBIF data, 106K+ points (2.64 MB, lazy-loaded)
│       ├── regions.json        # UK region GeoJSON boundaries (4.7 KB)
│       └── _manifest.json      # File metadata for integrity checks (1.0 KB)
│
└── .claude/
    └── settings.local.json     # Claude Code permissions config
```

---

## Data Files Reference

### species.json (29 entries)
Each species has: `id`, `commonName`, `scientificName`, `gbifKey`, `ecosystem`, `trophicLevel`, `role`, `conservationStatus` (uk/iucn/trend), `connectionCount`, `tagline`, `description`, `keyFact`, `conservationOrg`, `conservationUrl`.

### relationships.json (85 entries, 11 types)
Each relationship: `source` → `target` species IDs, `type` (predator-prey, habitat, pollination, competition, seed-dispersal, soil-engineering, nutrient-cycling, disease, intraguild-predation, herbivory, indirect-positive), `description`, `cascadeEffect`, `source_citation`.

### cascades.json (8 stories)
Each cascade: `title`, `subtitle`, `ecosystem`, `chain` (ordered species IDs), `trigger`, `steps` (with narrative text and status per species).

### species-images.json (26 of 29 species)
Three species currently missing images. Each entry: `url` (Wikimedia thumbnail), `alt`, `credit`, `license`, `filePage`. To find missing images, run `node scripts/find-missing-images.js`.

### distributions.json (2.64 MB, lazy-loaded)
GBIF occurrence coordinates (2020–2025). 106,737 total points across 29 species. Each species keyed by ID with a `points` array of `[lat, lon]` pairs.

---

## NPM Scripts

```bash
npm run dev              # Local dev server at localhost:5173
npm run build            # Production build → dist/
npm run preview          # Preview production build locally
npm run fetch-data       # Refresh GBIF data (needs .env with GBIF credentials)
npm run process-data     # Recalculate decline/impact scores
npm run generate-stories # Regenerate narratives via Claude API (needs CLAUDE_API_KEY)
```

### Environment variables (for scripts only — not needed for frontend)
Create a `.env` file from `.env.example`:
```
GBIF_USERNAME=your_gbif_username
GBIF_PASSWORD=your_gbif_password
CLAUDE_API_KEY=your_anthropic_api_key
```
GBIF credentials: free account at https://www.gbif.org/
Claude API key: only needed for `generate-stories.js`

---

## The 29 Species by Ecosystem

| Ecosystem | Species |
|-----------|---------|
| Woodland | Oak, Red Squirrel, Grey Squirrel, Jay, Tawny Owl, Bluebell |
| Upland | Heather, Red Grouse, Hen Harrier |
| Farmland | Hawthorn, Hedgehog, Barn Owl, Skylark, Badger |
| Freshwater | Otter, Water Vole, Kingfisher, White-clawed Crayfish, Atlantic Salmon, American Mink |
| Marine | Atlantic Puffin, Grey Seal, Sand Eel |
| Cross-ecosystem | Earthworm, Red Fox, Common Frog, Buff-tailed Bumblebee, Small Tortoiseshell, Swift |

## The 8 Cascade Stories

1. The Sand Eel Collapse — Warming seas → sand eel decline → puffin starvation
2. The Mink Invasion — American mink → water vole devastation
3. The Grey Squirrel Invasion — Grey squirrels → red squirrel & oak decline
4. The Badger-Hedgehog Triangle — Badger predation + habitat loss → hedgehog collapse
5. The Pesticide Treadmill — Insecticides → insect collapse → farmland bird decline
6. The Upland Collapse — Grouse moor degradation → predator persecution
7. Soil Death — Earthworm decline → cascading ecosystem effects
8. Urban Sprawl — Road fragmentation → hedgehog isolation

---

## How to Make Common Changes

### Edit species descriptions or metadata
Edit `data/species.json` → copy to `src/data/species.json` (or run build-data.js) → push to main.

### Add or modify relationships
Edit `data/relationships.json` → copy to `src/data/` → push.

### Edit cascade narratives
Edit `data/cascades.json` → copy to `src/data/` → push.

### Update species images
Edit `data/species-images.json`. Find CC-licensed images on commons.wikimedia.org. Three species still need images — run `node scripts/find-missing-images.js` to see which ones.

### Change network graph layout
Node positions are defined in `src/lib/dataLoader.js` in the `getFixedPosition()` function. Each species has hardcoded x,y coordinates. If adding a species, you must assign coordinates here.

### Change colors or theme
Edit `src/styles/global.css`. Key variables:
- Background: `#f8f7f4` (warm off-white)
- Ecosystem colors: woodland green, freshwater blue, upland purple, farmland amber, marine teal
- Relationship type colors and status colors defined as CSS custom properties

### Fill in the creator bio
Search for "placeholder" in `src/components/AboutPage.jsx` and replace with real name, bio, LinkedIn URL, and email.

### Re-fetch GBIF data
```bash
# Set up .env with GBIF credentials first
npm run fetch-data
# Then rebuild distributions.json
node scripts/build-data.js
```
Takes ~15-20 minutes. Outputs to `scripts/output/gbif/`, then combines into `src/data/distributions.json`.

### Add a new species
1. Add entry to `data/species.json` following existing schema
2. Add relationships to `data/relationships.json`
3. Add image to `data/species-images.json`
4. Optionally add to a cascade in `data/cascades.json`
5. Assign x,y position in `src/lib/dataLoader.js` → `getFixedPosition()`
6. Copy data files to `src/data/` (or run build-data.js)
7. Push to main

---

## Important Notes

- **`distributions.json` is 2.64 MB** — lazy-loaded at runtime so it doesn't affect initial page load
- **Data lives in two places** — `data/` (script source of truth) and `src/data/` (app reads from here). Keep in sync.
- **Network graph uses fixed positions** — not force-directed. Layout is curated in `dataLoader.js`.
- **No backend needed** — everything is static JSON bundled by Vite
- **All species images must be CC-licensed** — sourced from Wikimedia Commons
- **The Anthropic SDK** is a dependency for `scripts/generate-stories.js` only. It's not used by the frontend but ships in `package.json`. Consider moving to `devDependencies` if bundle size matters.
- **The `n8n/` folder referenced in old docs doesn't exist** — that automation was planned but not built

---

## Vercel Deployment

| Setting | Value |
|---------|-------|
| Platform | Vercel (free tier) |
| Repo connection | GitHub → Ryangab8/connected → main |
| Auto-deploy | Every push to main |
| Build command | `npm run build` (runs `vite build`) |
| Output directory | `dist/` |
| Framework | Vite (auto-detected) |
| Environment variables | None needed for frontend |

To set up on a new Vercel account:
1. Sign up at vercel.com
2. "Add New Project" → import the GitHub repo
3. Vite auto-detected, click Deploy
4. Add custom domain in Settings → Domains

---

## Working with Claude Code

Open the project folder in Claude Code. Key context to provide:

- Data source of truth is in `/data/` — species.json, relationships.json, cascades.json, species-images.json
- Frontend components are in `src/components/`
- The network graph is canvas-based with fixed positions defined in `src/lib/dataLoader.js`
- Maps use Leaflet with leaflet-heat for heatmaps
- After editing data files in `data/`, copy them to `src/data/` and push to main
- No backend — everything is static JSON
- The research document in the project files contains complete ecological sources for all 85 relationships
