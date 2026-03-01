# Connected

An interactive biodiversity visualization showing species decline in the UK — and how everything is connected to everything.

## What This Is

Click on a region. See what's disappeared. Discover why. Follow the ripple effects downstream. Find out how you can help.

This isn't just a data visualization — it's a story about interconnection. How a hedgehog's decline connects to your garden tomatoes. How a curlew's disappearance links to flood patterns. How one thread pulled affects the whole web.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A code editor (VS Code recommended)
- Git

### Run Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/connected.git
cd connected

# Install dependencies
npm install

# Start dev server
npm run dev
```

Site runs at `http://localhost:5173`

---

## Project Structure

```
connected/
├── src/
│   ├── components/       # Reusable UI pieces
│   │   ├── Map.jsx           # Interactive UK map
│   │   ├── SpeciesCard.jsx   # Clickable species tile
│   │   ├── StoryFlow.jsx     # The cascading narrative UI
│   │   ├── RegionPanel.jsx   # Sidebar for region details
│   │   └── ActionCard.jsx    # "What you can do" component
│   │
│   ├── pages/            # Route-level views
│   │   ├── Home.jsx          # Landing page with map
│   │   ├── Species.jsx       # Individual species deep-dive
│   │   └── About.jsx         # Bio, methodology, credits
│   │
│   ├── data/             # ALL CONTENT LIVES HERE
│   │   ├── species.json      # Master species list + stats
│   │   ├── regions.json      # UK region boundaries (GeoJSON)
│   │   └── stories/          # Individual narratives
│   │       ├── hedgehog.json
│   │       ├── curlew.json
│   │       └── ...
│   │
│   ├── lib/              # Utility functions
│   └── styles/           # CSS
│
├── scripts/              # Data processing (run locally)
│   ├── fetch-gbif.js         # Pull from GBIF API
│   ├── process-species.js    # Clean and calculate stats
│   └── generate-stories.js   # AI-assisted narrative drafts
│
├── n8n/                  # Automation workflows
│   └── add-species-workflow.json
│
└── public/               # Static assets
```

---

## How to Add a New Species

### Option 1: Manual (No Coding Required)

1. Create a new file in `src/data/stories/` named `[species-name].json`
2. Follow this structure:

```json
{
  "id": "species-name",
  "commonName": "Hedgehog",
  "scientificName": "Erinaceus europaeus",
  "image": "/images/hedgehog.jpg",
  "regions": ["South East", "East of England"],
  
  "loss": {
    "headline": "Down 75% since 2000",
    "description": "Once a common sight in British gardens, hedgehog populations have collapsed across southern England.",
    "dataSource": "GBIF / People's Trust for Endangered Species"
  },
  
  "why": {
    "primary": "Habitat fragmentation",
    "factors": [
      {
        "cause": "Garden fencing",
        "description": "Solid fences block hedgehog highways — they need to roam 1-2km nightly."
      },
      {
        "cause": "Pesticide use",
        "description": "Fewer slugs and beetles means less food."
      },
      {
        "cause": "Road mortality",
        "description": "100,000+ killed on UK roads annually."
      }
    ]
  },
  
  "ripple": {
    "narrative": "Fewer hedgehogs means more slugs. More slugs means more crop damage. More crop damage means more pesticides. More pesticides means fewer pollinators. Fewer pollinators means...",
    "connections": [
      { "from": "Hedgehog decline", "to": "Slug population increase" },
      { "from": "Slug increase", "to": "Garden/crop damage" },
      { "from": "Crop damage", "to": "Pesticide use increase" },
      { "from": "Pesticide increase", "to": "Pollinator decline" }
    ]
  },
  
  "action": {
    "headline": "Create a hedgehog highway",
    "steps": [
      "Cut a 13cm x 13cm hole in your garden fence",
      "Stop using slug pellets",
      "Leave wild corners in your garden",
      "Check before strimming long grass"
    ],
    "link": "https://www.hedgehogstreet.org/"
  }
}
```

3. Add the species to `src/data/species.json` master list
4. Commit and push — Vercel auto-deploys

### Option 2: Using n8n Automation

See the [n8n Setup Guide](#n8n-automation-setup) below.

---

## Data Sources

All data is publicly available:

| Source | What | URL |
|--------|------|-----|
| GBIF | Species occurrence records | gbif.org |
| UK NBN Atlas | UK-specific biodiversity data | nbnatlas.org |
| IUCN Red List | Conservation status | iucnredlist.org |
| Met Office | Climate data | metoffice.gov.uk |

---

## Customization

### Change Colors/Branding

Edit `src/styles/main.css` — all colors are CSS variables at the top:

```css
:root {
  --color-primary: #1B4F72;
  --color-accent: #2E7D32;
  --color-warning: #F39C12;
  /* etc */
}
```

### Add Your Bio

Edit `src/pages/About.jsx` directly — it's just text content.

### Change Regions

Edit `src/data/regions.json` — standard GeoJSON format. You could swap UK regions for any geography.

---

## n8n Automation Setup

n8n automates adding new species — fetch data, generate narratives, commit to repo.

### Install n8n Locally

```bash
# Using npm
npm install -g n8n
n8n start

# Or download desktop app from n8n.io
```

### Import the Workflow

1. Open n8n (runs at `http://localhost:5678`)
2. Go to Workflows → Import from File
3. Select `n8n/add-species-workflow.json`
4. Add your credentials:
   - GBIF API (username/password)
   - Claude API key
   - GitHub personal access token

### How It Works

```
Trigger (manual)
    ↓
Enter species name
    ↓
Fetch occurrence data from GBIF
    ↓
Calculate decline statistics
    ↓
Generate narrative via Claude API
    ↓
Create JSON file
    ↓
Commit to GitHub repo
    ↓
Vercel auto-rebuilds site
```

---

## Deployment

### Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select this repo
5. Deploy (default settings work fine)

Auto-deploys on every push to `main`.

### Environment Variables

For the data scripts (not needed for the site itself):

1. Copy `.env.example` to `.env`
2. Fill in your API keys
3. Never commit `.env` (it's in .gitignore)

---

## Commands Reference

```bash
npm run dev          # Run locally
npm run build        # Production build
npm run preview      # Preview production build

npm run fetch-data   # Pull fresh GBIF data
npm run process-data # Process raw data
npm run generate-stories  # Generate narratives via Claude
```

---

## Contributing

This is designed to be forked and made your own. Some ideas:

- Add more species
- Expand to other regions/countries
- Add more data sources (climate, pollution, land use)
- Improve the ripple effect visualizations
- Add species comparison features

---

## Credits

- Data: [GBIF](https://gbif.org), [NBN Atlas](https://nbnatlas.org)
- Inspiration: The interconnected web of life, and everyone working to protect it
- Built with: React, Leaflet, Claude

---

## License

MIT — do whatever you want with it.
