/**
 * process-species.js
 * 
 * Processes raw GBIF data and calculates:
 * - Decline Score (% population change over 20 years)
 * - Ecological Impact Score (how much losing this species affects ecosystem)
 * 
 * Outputs clean species.json for the frontend
 * 
 * Usage: node scripts/process-species.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  inputDir: path.join(__dirname, 'output', 'raw'),
  outputDir: path.join(path.dirname(__dirname), 'src', 'data'),
  
  // Years to compare for decline calculation
  earlyPeriod: { start: 2004, end: 2008 },  // First 5 years
  latePeriod: { start: 2020, end: 2024 }    // Last 5 years
};

// ============================================
// ECOLOGICAL IMPACT SCORING
// ============================================

/**
 * Ecological Impact Score Components (each 1-5):
 * 
 * 1. Trophic Role - Position in food web
 *    5 = Apex predator
 *    4 = Mesopredator / keystone species
 *    3 = Primary consumer with broad diet
 *    2 = Specialist consumer
 *    1 = Limited food web role
 * 
 * 2. Ecosystem Engineering - Does it physically modify habitat?
 *    5 = Major engineer (creates habitat for many species)
 *    4 = Significant modifier
 *    3 = Moderate (burrowing, seed dispersal)
 *    2 = Minor
 *    1 = Minimal physical impact
 * 
 * 3. Dependency Count - How many species directly depend on this one?
 *    5 = >15 dependent species
 *    4 = 10-15 dependent species
 *    3 = 5-10 dependent species
 *    2 = 2-5 dependent species
 *    1 = <2 dependent species
 * 
 * 4. Functional Redundancy (inverted) - Can other species fill this role?
 *    5 = No replacement exists (unique niche)
 *    4 = Very few alternatives
 *    3 = Some alternatives exist
 *    2 = Several species fill similar role
 *    1 = Many species fill same niche
 * 
 * Total: 4-20 points, normalized to 0-100 scale
 */

const ECOLOGICAL_SCORES = {
  'hedgehog': {
    trophicRole: 3,        // Generalist insectivore/omnivore
    ecosystemEngineering: 3, // Soil aeration, seed dispersal
    dependencyCount: 3,    // Prey for badgers, foxes; controls invertebrates
    functionalRedundancy: 3, // Some overlap with shrews, but unique size niche
    notes: 'Key invertebrate predator in gardens. Controls slugs, beetles. Declining = pest outbreaks.',
    sources: ['PTES Hedgehog Report 2022', 'British Hedgehog Preservation Society']
  },
  
  'curlew': {
    trophicRole: 3,        // Invertebrate specialist
    ecosystemEngineering: 2, // Minor ground disturbance
    dependencyCount: 3,    // Indicator species for upland health
    functionalRedundancy: 4, // Few waders fill same upland niche
    notes: 'Flagship species for upland and wet grassland conservation. Indicator of ecosystem health.',
    sources: ['Curlew Recovery Partnership', 'RSPB State of UK Birds 2023']
  },
  
  'water-vole': {
    trophicRole: 2,        // Herbivore
    ecosystemEngineering: 5, // Major riverbank engineer - burrows create habitat
    dependencyCount: 4,    // Prey for many predators; burrows used by other species
    functionalRedundancy: 5, // NO other UK species fills this engineering role
    notes: 'Keystone riparian engineer. Burrows prevent bank erosion, create habitat for invertebrates, fish, amphibians.',
    sources: ['Wildlife Trusts', 'Environment Agency Water Vole Conservation']
  },
  
  'turtle-dove': {
    trophicRole: 2,        // Seed eater
    ecosystemEngineering: 2, // Seed dispersal
    dependencyCount: 2,    // Limited direct dependencies
    functionalRedundancy: 2, // Other doves/pigeons partially fill niche
    notes: 'Farmland specialist. Decline indicates agricultural intensification impacts.',
    sources: ['Operation Turtle Dove', 'BTO Bird Trends']
  },
  
  'small-tortoiseshell': {
    trophicRole: 2,        // Nectar feeder, caterpillars eat nettles
    ecosystemEngineering: 3, // Pollination services
    dependencyCount: 3,    // Pollinates many plant species
    functionalRedundancy: 3, // Other butterflies pollinate, but declining together
    notes: 'Key pollinator and indicator of habitat quality. Part of broader pollinator crisis.',
    sources: ['Butterfly Conservation', 'UK Butterfly Monitoring Scheme']
  },
  
  'red-squirrel': {
    trophicRole: 2,        // Seed/nut specialist
    ecosystemEngineering: 4, // Major seed disperser, forest regeneration
    dependencyCount: 3,    // Prey for pine marten; seed dispersal for trees
    functionalRedundancy: 4, // Grey squirrels DON'T fill same role (different seed caching)
    notes: 'Critical for conifer forest regeneration. Forgotten seed caches = new trees. Grey squirrels don\'t cache the same way.',
    sources: ['Red Squirrel Survival Trust', 'Scottish Wildlife Trust']
  },
  
  'atlantic-salmon': {
    trophicRole: 4,        // Apex in freshwater; prey in marine
    ecosystemEngineering: 4, // Nutrient transport marine→freshwater
    dependencyCount: 5,    // Massive - otters, birds, bears (historically), insects, trees
    functionalRedundancy: 5, // NO other UK species transports marine nutrients upstream
    notes: 'Keystone species. Transports marine nutrients into freshwater/forest ecosystems. Feeds everything.',
    sources: ['Atlantic Salmon Trust', 'Missing Salmon Alliance']
  },
  
  'common-toad': {
    trophicRole: 3,        // Generalist invertebrate predator
    ecosystemEngineering: 2, // Minor burrowing
    dependencyCount: 3,    // Prey for grass snakes, herons; controls invertebrates
    functionalRedundancy: 3, // Frogs overlap somewhat, but different habitat use
    notes: 'Major slug and invertebrate predator. Migrates to breed - road mortality is catastrophic.',
    sources: ['Froglife', 'Toad Patrol data']
  },
  
  'corncrake': {
    trophicRole: 3,        // Omnivore - invertebrates and seeds
    ecosystemEngineering: 2, // Minor
    dependencyCount: 2,    // Limited direct dependencies
    functionalRedundancy: 4, // Unique hay meadow niche in UK
    notes: 'Indicator species for traditional hay meadow management. Decline = agricultural intensification.',
    sources: ['RSPB Corncrake Conservation', 'Scottish Natural Heritage']
  },
  
  'natterjack-toad': {
    trophicRole: 3,        // Invertebrate predator
    ecosystemEngineering: 3, // Pioneer species on disturbed ground
    dependencyCount: 2,    // Limited but specialist
    functionalRedundancy: 5, // ONLY UK toad using shallow ephemeral pools
    notes: 'Specialist of coastal dunes and heathland. Breeds in warm shallow pools. Unique niche.',
    sources: ['Amphibian and Reptile Conservation', 'Natural England']
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function calculateDeclineScore(byYear) {
  // Sum records in early period
  let earlySum = 0;
  for (let year = CONFIG.earlyPeriod.start; year <= CONFIG.earlyPeriod.end; year++) {
    earlySum += byYear[year] || 0;
  }
  
  // Sum records in late period
  let lateSum = 0;
  for (let year = CONFIG.latePeriod.start; year <= CONFIG.latePeriod.end; year++) {
    lateSum += byYear[year] || 0;
  }
  
  // Avoid division by zero
  if (earlySum === 0) {
    return { declinePercent: 0, trend: 'insufficient_data', earlySum, lateSum };
  }
  
  // Calculate percentage change
  const changePercent = ((lateSum - earlySum) / earlySum) * 100;
  
  // Determine trend
  let trend;
  if (changePercent <= -50) trend = 'severe_decline';
  else if (changePercent <= -25) trend = 'moderate_decline';
  else if (changePercent <= -10) trend = 'slight_decline';
  else if (changePercent <= 10) trend = 'stable';
  else if (changePercent <= 25) trend = 'slight_increase';
  else trend = 'increasing';
  
  return {
    declinePercent: Math.round(changePercent),
    trend,
    earlyPeriodRecords: earlySum,
    latePeriodRecords: lateSum
  };
}

function calculateEcologicalImpactScore(speciesId) {
  const scores = ECOLOGICAL_SCORES[speciesId];
  
  if (!scores) {
    console.warn(`  Warning: No ecological scores defined for ${speciesId}`);
    return { score: 50, components: null, notes: 'No data available' };
  }
  
  const rawScore = scores.trophicRole + 
                   scores.ecosystemEngineering + 
                   scores.dependencyCount + 
                   scores.functionalRedundancy;
  
  // Normalize from 4-20 scale to 0-100
  const normalizedScore = Math.round(((rawScore - 4) / 16) * 100);
  
  return {
    score: normalizedScore,
    components: {
      trophicRole: scores.trophicRole,
      ecosystemEngineering: scores.ecosystemEngineering,
      dependencyCount: scores.dependencyCount,
      functionalRedundancy: scores.functionalRedundancy
    },
    notes: scores.notes,
    sources: scores.sources
  };
}

function findPeakRegions(byRegion, topN = 3) {
  const regions = Object.entries(byRegion)
    .filter(([name, data]) => name !== 'Unknown')
    .map(([name, data]) => ({ name, total: data.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
  
  return regions.map(r => r.name);
}

function findMostDeclinedRegions(byRegion, topN = 3) {
  const regions = Object.entries(byRegion)
    .filter(([name, data]) => name !== 'Unknown' && data.total > 50) // Minimum records
    .map(([name, data]) => {
      const decline = calculateDeclineScore(data.byYear);
      return { name, declinePercent: decline.declinePercent, total: data.total };
    })
    .filter(r => r.declinePercent < 0) // Only declining regions
    .sort((a, b) => a.declinePercent - b.declinePercent) // Most negative first
    .slice(0, topN);
  
  return regions;
}

// ============================================
// MAIN PROCESSING
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Species Data Processing Script');
  console.log('='.repeat(60));
  
  ensureDirectoryExists(CONFIG.outputDir);
  ensureDirectoryExists(path.join(CONFIG.outputDir, 'stories'));
  
  // Get all raw data files
  const rawFiles = fs.readdirSync(CONFIG.inputDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));
  
  console.log(`Found ${rawFiles.length} species files to process\n`);
  
  const speciesList = [];
  
  for (const file of rawFiles) {
    const filePath = path.join(CONFIG.inputDir, file);
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`Processing ${rawData.species.commonName}...`);
    
    // Calculate decline score
    const decline = calculateDeclineScore(rawData.byYear);
    console.log(`  Decline: ${decline.declinePercent}% (${decline.trend})`);
    
    // Calculate ecological impact score
    const ecological = calculateEcologicalImpactScore(rawData.species.id);
    console.log(`  Ecological Impact: ${ecological.score}/100`);
    
    // Find key regions
    const peakRegions = findPeakRegions(rawData.byRegion);
    const declinedRegions = findMostDeclinedRegions(rawData.byRegion);
    
    // Build processed species object
    const processed = {
      id: rawData.species.id,
      commonName: rawData.species.commonName,
      scientificName: rawData.species.scientificName,
      gbifKey: rawData.species.gbifKey,
      
      // Scores
      declineScore: {
        percent: Math.abs(decline.declinePercent), // Store as positive for display
        direction: decline.declinePercent <= 0 ? 'decline' : 'increase',
        trend: decline.trend,
        earlyPeriod: `${CONFIG.earlyPeriod.start}-${CONFIG.earlyPeriod.end}`,
        latePeriod: `${CONFIG.latePeriod.start}-${CONFIG.latePeriod.end}`,
        earlyPeriodRecords: decline.earlyPeriodRecords,
        latePeriodRecords: decline.latePeriodRecords
      },
      
      ecologicalImpactScore: ecological,
      
      // Combined urgency score (average of both, weighted slightly toward ecological)
      urgencyScore: Math.round(
        (Math.min(Math.abs(decline.declinePercent), 100) * 0.4) + 
        (ecological.score * 0.6)
      ),
      
      // Geographic data
      totalRecords: rawData.metadata.totalRecords,
      peakRegions: peakRegions,
      mostDeclinedRegions: declinedRegions,
      
      // Time series for charts
      yearlyTrend: rawData.byYear,
      
      // Regional breakdown
      byCountry: Object.fromEntries(
        Object.entries(rawData.byCountry)
          .filter(([_, data]) => data.total > 0)
          .map(([country, data]) => [country, {
            total: data.total,
            decline: calculateDeclineScore(data.byYear).declinePercent
          }])
      ),
      
      // Metadata
      dataSource: 'GBIF',
      dateRange: rawData.metadata.dateRange,
      lastUpdated: rawData.metadata.fetchedAt
    };
    
    speciesList.push(processed);
  }
  
  // Sort by urgency score (highest first)
  speciesList.sort((a, b) => b.urgencyScore - a.urgencyScore);
  
  // Add rank
  speciesList.forEach((species, index) => {
    species.urgencyRank = index + 1;
  });
  
  // Save master species list
  const outputPath = path.join(CONFIG.outputDir, 'species.json');
  fs.writeFileSync(outputPath, JSON.stringify(speciesList, null, 2));
  console.log(`\nSaved species.json with ${speciesList.length} species`);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING COMPLETE');
  console.log('='.repeat(60));
  console.log('\nSpecies ranked by Urgency Score:\n');
  
  console.log('Rank | Species              | Decline | Eco Impact | Urgency');
  console.log('-----|----------------------|---------|------------|--------');
  
  speciesList.forEach(s => {
    const name = s.commonName.padEnd(20);
    const decline = `${s.declineScore.direction === 'decline' ? '-' : '+'}${s.declineScore.percent}%`.padStart(7);
    const eco = `${s.ecologicalImpactScore.score}`.padStart(10);
    const urgency = `${s.urgencyScore}`.padStart(7);
    console.log(`  ${s.urgencyRank}  | ${name} | ${decline} | ${eco} | ${urgency}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Output saved to: ${outputPath}`);
}

main().catch(console.error);
