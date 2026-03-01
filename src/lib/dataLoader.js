// Data loader and processor for UK ecological web data

import speciesData from '../data/species.json';
import relationshipsData from '../data/relationships.json';
import cascadesData from '../data/cascades.json';
import speciesImagesData from '../data/species-images.json';

// Normalize compound ecosystem names to primary ecosystem
function normalizeEcosystem(ecosystem) {
  if (!ecosystem) return 'multiple';

  // Map compound ecosystems to their primary ecosystem
  const mapping = {
    'woodland_farmland': 'farmland',
    'farmland_garden': 'farmland',
    'hedgerow': 'farmland',
    'freshwater_marine': 'freshwater',
    'freshwater_garden': 'multiple',
    'coastal_marine': 'marine',
    'soil': 'multiple',
    'urban_aerial': 'multiple',
    'multiple': 'multiple'
  };

  // If it's a compound ecosystem, normalize it
  if (mapping[ecosystem]) {
    return mapping[ecosystem];
  }

  // Otherwise return as-is (woodland, freshwater, upland, farmland, marine)
  return ecosystem;
}

// Get ecosystem color for nodes (updated for light theme)
export function getEcosystemColor(ecosystem) {
  const normalized = normalizeEcosystem(ecosystem);

  const colors = {
    woodland: '#2d6a4f',
    freshwater: '#2176ae',
    upland: '#7b2d8e',
    farmland: '#c17f24',
    marine: '#0e8a7e',
    multiple: '#6b7280' // Cross-ecosystem grey
  };
  return colors[normalized] || '#6b7280'; // Default to cross-ecosystem grey
}

// Get conservation status color (for rings/indicators)
export function getStatusColor(species) {
  const trend = species.conservationStatus?.trend?.toLowerCase();

  if (trend === 'declining' || trend === 'critically endangered' || trend === 'endangered') {
    return '#dc2626'; // Red
  }
  if (trend === 'vulnerable' || trend === 'near threatened' || trend === 'amber') {
    return '#f59e0b'; // Amber
  }
  if (species.conservationStatus?.invasive) {
    return '#9333ea'; // Purple for invasive
  }
  return '#16a34a'; // Green for stable
}

// Get relationship type color
export function getRelationshipColor(type) {
  const colors = {
    predator_prey: '#ef4444',
    intraguild_predation: '#ef4444',
    competition: '#f97316',
    habitat_provider: '#3b82f6',
    pollination: '#ec4899',
    seed_dispersal: '#8b5cf6',
    disease_vector: '#94a3b8',
    indirect_positive: '#10b981',
    nutrient_cycling: '#0d9488',
    soil_engineering: '#92400e',
    herbivory: '#ea580c'
  };

  return colors[type] || '#94a3b8';
}

// Get human-readable relationship type label
export function getRelationshipLabel(type) {
  const labels = {
    predator_prey: 'Predator-Prey',
    intraguild_predation: 'Intraguild Predation',
    competition: 'Competition',
    habitat_provider: 'Habitat Provider',
    pollination: 'Pollination',
    seed_dispersal: 'Seed Dispersal',
    disease_vector: 'Disease Vector',
    indirect_positive: 'Indirect Benefit',
    nutrient_cycling: 'Nutrient Cycling',
    soil_engineering: 'Soil Engineering',
    herbivory: 'Herbivory'
  };

  return labels[type] || type;
}

// Fixed layout positions by ecosystem cluster
// NEW LAYOUT: Cross-ecosystem species in CENTER, other clusters arranged around
// Returns {x, y} position normalized to 0-1 range (will be scaled to viewport)
export function getFixedPosition(speciesId, ecosystem) {
  // Species organized by ecosystem with positions
  // CENTER = cross-ecosystem connectors (the bridge species)
  // Clusters arranged around center: woodland (upper-left), upland (upper-right),
  // farmland (left), freshwater (lower-left), marine (lower-right)
  const speciesPositions = {
    // CROSS-ECOSYSTEM (CENTER) - the bridge species connecting everything
    earthworm: { x: 0.48, y: 0.48 },
    'red-fox': { x: 0.54, y: 0.50 },
    'common-frog': { x: 0.46, y: 0.52 },
    'buff-tailed-bumblebee': { x: 0.52, y: 0.55 },
    'small-tortoiseshell': { x: 0.50, y: 0.58 },
    swift: { x: 0.48, y: 0.43 },

    // Woodland cluster (upper-left)
    oak: { x: 0.18, y: 0.20 },
    'red-squirrel': { x: 0.24, y: 0.18 },
    'grey-squirrel': { x: 0.15, y: 0.25 },
    jay: { x: 0.22, y: 0.26 },
    'tawny-owl': { x: 0.19, y: 0.30 },
    bluebell: { x: 0.26, y: 0.23 },

    // Upland/Moorland cluster (upper-right)
    heather: { x: 0.80, y: 0.22 },
    'red-grouse': { x: 0.76, y: 0.26 },
    'hen-harrier': { x: 0.83, y: 0.27 },

    // Farmland cluster (left)
    hawthorn: { x: 0.15, y: 0.48 },
    hedgehog: { x: 0.20, y: 0.50 },
    'barn-owl': { x: 0.18, y: 0.55 },
    skylark: { x: 0.14, y: 0.52 },
    badger: { x: 0.22, y: 0.45 },

    // Freshwater cluster (lower-left)
    otter: { x: 0.18, y: 0.72 },
    'water-vole': { x: 0.23, y: 0.75 },
    kingfisher: { x: 0.19, y: 0.78 },
    'white-clawed-crayfish': { x: 0.15, y: 0.76 },
    'atlantic-salmon': { x: 0.24, y: 0.70 },
    'american-mink': { x: 0.16, y: 0.80 },

    // Marine/Coastal cluster (lower-right)
    'atlantic-puffin': { x: 0.80, y: 0.73 },
    'grey-seal': { x: 0.82, y: 0.77 },
    'sand-eel': { x: 0.77, y: 0.75 }
  };

  return speciesPositions[speciesId] || { x: 0.5, y: 0.5 };
}

// Process species data into nodes for D3
export function getNodes() {
  return speciesData.species.map(species => {
    const position = getFixedPosition(species.id, species.ecosystem);

    return {
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      ecosystem: species.ecosystem,
      conservationStatus: species.conservationStatus,
      connectionCount: species.connectionCount,
      description: species.description,
      tagline: species.tagline,
      keyFact: species.keyFact,
      presentInIreland: species.presentInIreland,
      color: getEcosystemColor(species.ecosystem),
      statusColor: getStatusColor(species),
      // Size based on connection count - larger range for hub species
      radius: Math.max(6, Math.min(24, 6 + species.connectionCount * 0.9)),
      // Fixed position (normalized 0-1, will be scaled to viewport)
      fixedX: position.x,
      fixedY: position.y
    };
  });
}

// Process relationships data into edges for D3
export function getEdges() {
  return relationshipsData.relationships.map((rel, index) => ({
    id: rel.id || `edge-${index}`,
    source: rel.source,
    target: rel.target,
    type: rel.type,
    description: rel.description,
    color: getRelationshipColor(rel.type)
  }));
}

// Get all unique ecosystems
export function getEcosystems() {
  const ecosystems = new Set();
  speciesData.species.forEach(s => {
    if (s.ecosystem) ecosystems.add(s.ecosystem);
  });
  return Array.from(ecosystems);
}

// Get ecosystem display information (updated for light theme)
export function getEcosystemInfo() {
  return [
    { id: 'all', label: 'All', color: null },
    { id: 'woodland', label: 'Woodland', color: '#2d6a4f' },
    { id: 'freshwater', label: 'Freshwater', color: '#2176ae' },
    { id: 'upland', label: 'Upland', color: '#7b2d8e' },
    { id: 'farmland', label: 'Farmland', color: '#c17f24' },
    { id: 'marine', label: 'Marine', color: '#0e8a7e' },
    { id: 'cross-ecosystem', label: 'Cross-ecosystem', color: '#6b7280' }
  ];
}

// Get ecosystem cluster labels with positions (positioned ABOVE/outside clusters)
export function getEcosystemClusters() {
  return [
    { id: 'woodland', label: 'WOODLAND', x: 0.20, y: 0.12, color: '#2d6a4f' },
    { id: 'upland', label: 'UPLAND', x: 0.80, y: 0.12, color: '#7b2d8e' },
    { id: 'farmland', label: 'FARMLAND', x: 0.12, y: 0.42, color: '#c17f24' },
    { id: 'cross-ecosystem', label: 'CROSS-ECOSYSTEM', x: 0.50, y: 0.38, color: '#6b7280' },
    { id: 'freshwater', label: 'FRESHWATER', x: 0.20, y: 0.62, color: '#2176ae' },
    { id: 'marine', label: 'MARINE', x: 0.80, y: 0.62, color: '#0e8a7e' }
  ];
}

// Get connections for a specific species
export function getSpeciesConnections(speciesId) {
  const connections = {
    outgoing: [], // Species this one affects
    incoming: []  // Species that affect this one
  };

  relationshipsData.relationships.forEach(rel => {
    if (rel.source === speciesId) {
      connections.outgoing.push({
        targetId: rel.target,
        type: rel.type,
        description: rel.description
      });
    }
    if (rel.target === speciesId) {
      connections.incoming.push({
        sourceId: rel.source,
        type: rel.type,
        description: rel.description
      });
    }
  });

  return connections;
}

// Get full species data by ID
export function getSpeciesById(speciesId) {
  return speciesData.species.find(s => s.id === speciesId);
}

// Get cascades that include a specific species
export function getCascadesForSpecies(speciesId) {
  return cascadesData.cascades.filter(cascade =>
    cascade.chain.includes(speciesId)
  );
}

// Get all cascades
export function getAllCascades() {
  return cascadesData.cascades;
}

// Lazy load distribution data (2.5MB file)
let distributionData = null;

export async function getDistributions() {
  if (!distributionData) {
    const module = await import('../data/distributions.json');
    distributionData = module.default;
  }
  return distributionData;
}

// Get distribution points for a specific species
export async function getSpeciesDistribution(speciesId) {
  const distributions = await getDistributions();
  return distributions.species?.[speciesId]?.points || [];
}

// Get conservation status label
export function getStatusLabel(species) {
  const trend = species.conservationStatus?.trend;
  const uk = species.conservationStatus?.uk;

  if (species.conservationStatus?.invasive) {
    return 'Invasive';
  }

  if (uk && uk.includes('Endangered')) {
    return 'Declining';
  }

  if (trend) {
    return trend.charAt(0).toUpperCase() + trend.slice(1);
  }

  return 'Unknown';
}

// Calculate the geographic centroid of distribution points
// For spread-out data, finds the densest cluster center instead of raw mean
export function calculateCentroid(points) {
  if (!points || points.length === 0) {
    return null;
  }

  // Simple centroid for small datasets
  if (points.length < 100) {
    const sumLat = points.reduce((sum, p) => sum + p[0], 0);
    const sumLon = points.reduce((sum, p) => sum + p[1], 0);
    return [sumLat / points.length, sumLon / points.length];
  }

  // For larger datasets, find the densest cluster using a grid-based approach
  // This prevents outliers from skewing the centroid
  const gridSize = 0.5; // degrees
  const grid = {};

  points.forEach(([lat, lon]) => {
    const gridLat = Math.floor(lat / gridSize) * gridSize;
    const gridLon = Math.floor(lon / gridSize) * gridSize;
    const key = `${gridLat},${gridLon}`;

    if (!grid[key]) {
      grid[key] = { count: 0, sumLat: 0, sumLon: 0 };
    }
    grid[key].count++;
    grid[key].sumLat += lat;
    grid[key].sumLon += lon;
  });

  // Find the densest grid cell
  let maxDensity = 0;
  let densestCell = null;

  Object.entries(grid).forEach(([key, cell]) => {
    if (cell.count > maxDensity) {
      maxDensity = cell.count;
      densestCell = cell;
    }
  });

  if (densestCell) {
    return [
      densestCell.sumLat / densestCell.count,
      densestCell.sumLon / densestCell.count
    ];
  }

  // Fallback to simple mean
  const sumLat = points.reduce((sum, p) => sum + p[0], 0);
  const sumLon = points.reduce((sum, p) => sum + p[1], 0);
  return [sumLat / points.length, sumLon / points.length];
}

// Get species image data
export function getSpeciesImage(speciesId) {
  if (!speciesId) return null;
  return speciesImagesData.images[speciesId] || null;
}

// Export raw data for reference
export const rawData = {
  species: speciesData,
  relationships: relationshipsData,
  cascades: cascadesData,
  images: speciesImagesData
};
