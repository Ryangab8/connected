# Claude Code Brief — connectedbiodiversity.com
## Implementing Biodiversity Outlook & Policy Outlook maps

**Prepared for**: Emily Moreland / Claude Code  
**Site**: connectedbiodiversity.com  
**Status of deliverables**: Two fully working HTML prototype files, ready to be decomposed into React components and integrated into the existing site.

---

## 1. Project context

**connectedbiodiversity.com** is a React 18 site visualising ecological connections between 29 UK species across habitat zones. It uses:

- **React 18** (functional components, hooks)
- **Leaflet** (map rendering, already in use on the `/map` route)
- **Framer Motion** (animations)
- **Canvas API** (species web visualisation)
- **DM Sans** + **Playfair Display** fonts (Google Fonts — already loaded)

The site currently has the following nav structure:
```
The Web | Map | Stories | Act | About
```

Two new feature pages have been designed and prototyped — **Biodiversity Outlook** (map 1) and **Policy Outlook** (map 2). Both exist as self-contained HTML files. Your job is to decompose them into React components and integrate them into the site.

---

## 2. Deliverable files

Both prototype files are in the project — treat them as the **source of truth** for all logic, data, and visual design:

| File | Description |
|---|---|
| `map1_final.html` | Biodiversity Outlook — species map |
| `map2_final.html` | Policy Outlook — climate/policy projection map |

**Do not redesign.** Extract and port faithfully. Visual decisions are intentional.

---

## 3. Map 1 — Biodiversity Outlook

### What it does
An interactive Leaflet map of 78 UK/Ireland species, all legally protected or on a UK Red List. Users can filter by threat status and taxonomic group, click species to see detail, and expand to see all known locations for a selected species.

### Key features

**Dual visual encoding on markers:**
- **Colour = threat status**: critical (#b83a2a), severe (#c8760a), declining (#5c3d7a), recovering (#4a7c2a)
- **Shape = taxonomic group**: bird=pentagon, mammal=diamond, fish=triangle, invertebrate=hexagon, amphibian=4-pointed star, plant=rounded square
- **Size = severity**: critical=20px, severe=16px, declining/recovering=13px
- Markers are generated as inline SVG via `groupSVG(group, size, colour)` function — port this exactly

**Single marker default, expand on click:**
- Default: one marker per species at `latlng[0]` (primary site)
- On click: all `latlng` coordinates expand as secondary markers (78% size of primary, same shape/colour)
- Primary marker gets a CSS pulse ring animation (`@keyframes pulse`)
- Map `fitBounds` to all locations if species has multiple sites
- Click same species again or another species to collapse

**Filter system:**
- Two filter rows: threat status pills + taxonomic group pills
- `buildFilters()` clears the container before rebuilding to prevent pill doubling — **this is a known bug that was fixed, do not regress it**
- Active pill highlighted with appropriate colour class

**Detail panel (sidebar):**
- Opens when species clicked
- Shows: name, latin name, group, description, **population facts grid** (3 cards), decline severity bar, cause, protection status
- Population facts are in `POP_STATS` lookup keyed by species ID — 78 entries, all verified from Red List sources
- "📍 N known sites — click to expand all on map" note when species has multiple latlng

**Data:**
- All species data is in the `SPECIES` const array — 78 objects
- Each species has: `id, name, latin, group, status, icon, decline, cause, desc, protection, latlng[]`
- Separate `POP_STATS` object maps species ID → array of `{val, label}` objects (2–3 per species)

### Suggested React decomposition

```
src/
  pages/
    BiodiversityOutlook.jsx       ← main page component
  components/biodiversity/
    SpeciesMap.jsx                ← Leaflet map + markers
    SpeciesSidebar.jsx            ← filter pills + species list + detail panel
    SpeciesDetail.jsx             ← detail panel (name, pop stats, decline bar)
    PopulationStats.jsx           ← 3-card pop facts grid
  data/
    species.js                    ← SPECIES array (extract from HTML)
    populationStats.js            ← POP_STATS object (extract from HTML)
```

### Suggested route
```
/biodiversity-outlook
```
Add to nav between existing Map and Stories links.

---

## 4. Map 2 — Policy Outlook

### What it does
A policy and climate projection map with a 2024–2050 timeline slider. Shows nation-level policy delivery scores, 28 conservation sites with active project details, and a dashboard strip with three live metrics. Also includes a "What You Can Do" action panel.

### Key features

**Timeline slider (2024–2050):**
- All chart data, dashboard metrics, and nation cards update on slider change
- Three chart modes toggled by mode buttons: Species Abundance Index, Carbon in Nature, Policy Delivery Score
- Each mode has its own `datasets`, labels, and contextual description

**Dashboard strip (4 cards):**
1. **Abundance index** — current trajectory value + transformative pathway comparison. Shows "↓ X pts on current trajectory" and green subtext "Transformative action: Y (+Z pts)"
2. **Carbon stored in nature** — subtitle says "net source, not sink". Trend line changes based on year: red warning pre-2030, shifts to restoration narrative post-2030
3. **Land protected %** — with a progress bar vs 30% target
4. **Carbon — the real picture** — static explainer card: "Net source since 2019. Degraded peatlands emit ~23 Mt/yr vs forests absorbing ~17 Mt/yr. Only 22% of UK peatland in near-natural condition."

**Key carbon framing (do not change):**
> UK land use has been a **net carbon source since 2019** when peatland data was added to the national GHG inventory. Degraded peatlands emit ~23 Mt CO₂e/yr; forests absorb only ~17 Mt CO₂e/yr.  
> Source: Peatland ACTION / IUCN UK Peatland Programme

**Nation policy cards (5 nations):**

| Nation | Current score | Required score | Gap |
|---|---|---|---|
| Scotland | 78 | 95 | 17 |
| England | 55 | 85 | 30 |
| Wales | 52 | 82 | 30 |
| Rep. Ireland | 60 | 85 | 25 |
| N. Ireland | 28 | 70 | 42 |

The gap is the story — current score vs required score shown as two bars. N. Ireland's 42-point gap is the most critical and should be most visually prominent.

**Conservation sites (28 total):**
- 10 Scotland, 8 Northern Ireland, 4 England, 2 Wales, 4 Republic of Ireland
- Each site has: `name, lat, lng, type, carbon, nation, icon, desc, projects`
- The `projects` field contains HTML with `🔧` labelled active conservation projects — render as innerHTML in popups
- Rathlin Island is flagged as **WORLD FIRST COMPLETE 2026** (ferret eradication, March 2026)

**What You Can Do panel:**
- Triggered by "🌿 What You Can Do" button in nav
- Slide-up drawer with 7 habitat tabs: Peatland, Marine, Freshwater, Coastal, Grassland, Woodland, Heathland
- Each tab has 4 volunteer opportunities + 3 action/petition items
- All links are real, verified URLs (RSPB, Wildlife Trusts, Project Seagrass, etc.)
- Data is in `ACTION_DATA` object — extract as `src/data/actionData.js`

### Suggested React decomposition

```
src/
  pages/
    PolicyOutlook.jsx             ← main page component
  components/policy/
    PolicyMap.jsx                 ← Leaflet map + site/nation markers
    PolicySidebar.jsx             ← mode buttons, slider, chart, nation cards
    PolicyChart.jsx               ← Chart.js chart (wrap in canvas)
    DashboardStrip.jsx            ← 4 metric cards
    NationCard.jsx                ← individual nation policy gap card
    SitePopup.jsx                 ← conservation site popup content
    ActionPanel.jsx               ← "What You Can Do" drawer
    ActionTab.jsx                 ← individual habitat tab content
  data/
    sites.js                      ← SITES array (28 conservation sites)
    nations.js                    ← nation scores + gap data
    actionData.js                 ← ACTION_DATA (7 habitats × volunteer+action cards)
```

### Suggested route
```
/policy-outlook
```

---

## 5. Shared design tokens

Extract these as a shared theme file or CSS variables — both maps use them:

```js
// Threat status colours
const THREAT_COLOR = {
  critical:  '#b83a2a',
  severe:    '#c8760a',
  declining: '#5c3d7a',
  recovering:'#4a7c2a'
}

// CSS variables (already in site's style system — confirm these match)
--cream:      #f8f5ef
--dark:       #1a2318
--green-deep: #2d5a1e
--green-mid:  #4a7c2a
--amber:      #c8760a
--red:        #b83a2a
--panel:      #faf8f4

// Fonts (already loaded via Google Fonts)
font-family: 'Playfair Display', serif   // headings, large numbers
font-family: 'DM Sans', sans-serif       // body, labels, UI
```

---

## 6. Dependencies to add (if not already present)

```bash
npm install leaflet react-leaflet chart.js react-chartjs-2
```

Both maps already use Leaflet — it's in the existing site. Chart.js is only needed for map 2's projection charts. If the site already imports Chart.js, skip.

---

## 7. Data sources (for reference — do not need to re-verify)

All data in the prototype files is verified against the following sources:

| Dataset | Source |
|---|---|
| Species threat status | BOCC5 (Birds of Conservation Concern 5, 2021) |
| Plant Red List | BSBI GB Red List 2025 (published Nov 2025) |
| Fish Red List | Nunn et al. 2023, *Aquatic Conservation* |
| Butterfly Red List | Butterfly Conservation Red List 2022 |
| Mammal Red List | Mammal Society Red List 2020 |
| Carbon net source | IUCN UK Peatland Programme / Peatland ACTION |
| Forest carbon | Forestry Commission England, 2023 (17.4 Mt CO₂e/yr) |
| Nation policy scores | Nature Recovery Scotland 2024 review; NI Audit Office 2024; Welsh Gov SFS consultation; NPWS Ireland 2024 |
| Rathlin LIFE Raft | RSPB NI press release, March 2026 |
| Population statistics | BTO, NatureScot, RSPB, Butterfly Conservation, per-species citations in POP_STATS comments |

---

## 8. Implementation order (recommended)

1. **Extract all data files first** — `species.js`, `populationStats.js`, `sites.js`, `nations.js`, `actionData.js`. These are pure JS objects, no logic.
2. **Port `groupSVG()` utility** — this generates the SVG marker shapes. Put it in `src/utils/markerShapes.js`. It must be pixel-perfect — the legend depends on it matching exactly.
3. **Build BiodiversityOutlook** — simpler of the two. Get the map, markers and sidebar working first, then filters, then expand-on-click.
4. **Build PolicyOutlook** — do the slider + chart first (the core mechanic), then dashboard strip, then site markers, then nation cards, then action panel last.
5. **Wire into nav** — add both routes, update navigation links.

---

## 9. Things to preserve exactly — do not change

- **The net carbon source framing** — UK nature has been a net carbon source since 2019, not a sink. This is accurate and important.
- **Nation policy gap presentation** — the gap between current and required score is the story. Do not collapse to a single score.
- **The N. Ireland policy gap** (42 points) — it's the worst of the 5 nations by a significant margin. Make sure it reads clearly.
- **Rathlin Island framing** — "WORLD FIRST COMPLETE 2026" for ferret eradication. First time on any inhabited island globally.
- **Single marker default / expand on click** — one dot per species is intentional to prevent recovering species appearing to dominate the map.
- **Pill doubling fix** — `buildFilters()` clears container before rebuilding. Do not regress this.
- **Both visual channels** — colour = threat, shape = group. Both must be present for the map to be readable. Do not reduce to just colour.

---

## 10. Known gotchas

- **Leaflet in React** — use `react-leaflet` or manage the map instance via `useRef` + `useEffect`. Do not instantiate Leaflet inside render.
- **Chart.js canvas** — destroy and recreate the chart instance when mode switches, or use `chart.destroy()` before reinitialising. The current HTML does this in `initChart()`.
- **Filter pill doubling** — the HTML fix clears the container before appending new pills. In React this is handled naturally by re-rendering, but if you manage pills imperatively make sure to clear first.
- **Popup HTML** — the `projects` field in SITES contains raw HTML strings with `<strong>` and `<br>` tags. Use `dangerouslySetInnerHTML` in the popup component or sanitise appropriately.
- **Leaflet CSS** — must be imported explicitly: `import 'leaflet/dist/leaflet.css'`
- **Leaflet default icon** — Leaflet's default marker icon breaks in webpack/Vite due to asset path issues. Since both maps use `L.divIcon()` (custom SVG markers), this is not an issue — but don't accidentally trigger the default icon path.

---

*Brief generated from design session — all prototype logic verified and working in browser.*
