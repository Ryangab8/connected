/**
 * fetch-gbif.js
 * 
 * Fetches species occurrence data from GBIF API for UK + Ireland
 * Uses scientific name search instead of taxon keys for reliability
 * Outputs raw JSON files per species to scripts/output/raw/
 * 
 * Usage: node scripts/fetch-gbif.js
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
  // Date range for occurrence data
  startYear: 2004,
  endYear: 2024,
  
  // API settings
  gbifBaseUrl: 'https://api.gbif.org/v1',
  requestDelay: 1500, // ms between requests to be nice to GBIF
  maxRecordsPerSpecies: 10000, // Cap to keep things manageable
  
  // Output directory
  outputDir: path.join(__dirname, 'output', 'raw')
};

// ============================================
// TARGET SPECIES
// ============================================

const SPECIES = [
  {
    id: 'hedgehog',
    commonName: 'Hedgehog',
    scientificName: 'Erinaceus europaeus'
  },
  {
    id: 'curlew',
    commonName: 'Eurasian Curlew',
    scientificName: 'Numenius arquata'
  },
  {
    id: 'water-vole',
    commonName: 'Water Vole',
    scientificName: 'Arvicola amphibius'
  },
  {
    id: 'turtle-dove',
    commonName: 'European Turtle Dove',
    scientificName: 'Streptopelia turtur'
  },
  {
    id: 'small-tortoiseshell',
    commonName: 'Small Tortoiseshell',
    scientificName: 'Aglais urticae'
  },
  {
    id: 'red-squirrel',
    commonName: 'Red Squirrel',
    scientificName: 'Sciurus vulgaris'
  },
  {
    id: 'atlantic-salmon',
    commonName: 'Atlantic Salmon',
    scientificName: 'Salmo salar'
  },
  {
    id: 'common-toad',
    commonName: 'Common Toad',
    scientificName: 'Bufo bufo'
  },
  {
    id: 'corncrake',
    commonName: 'Corncrake',
    scientificName: 'Crex crex'
  },
  {
    id: 'natterjack-toad',
    commonName: 'Natterjack Toad',
    scientificName: 'Epidalea calamita'
  }
];

// ============================================
// UK + IRELAND REGIONS
// ============================================

const REGIONS = {
  // England regions (approximate bounding boxes)
  'South East England': { north: 51.8, south: 50.7, east: 1.5, west: -1.5, country: 'England' },
  'South West England': { north: 51.7, south: 50.0, east: -1.5, west: -5.7, country: 'England' },
  'London': { north: 51.7, south: 51.3, east: 0.3, west: -0.5, country: 'England' },
  'East of England': { north: 52.9, south: 51.5, east: 1.8, west: -0.5, country: 'England' },
  'East Midlands': { north: 53.5, south: 52.0, east: 0.0, west: -1.8, country: 'England' },
  'West Midlands': { north: 53.0, south: 52.0, east: -1.2, west: -3.1, country: 'England' },
  'Yorkshire': { north: 54.5, south: 53.3, east: -0.1, west: -2.5, country: 'England' },
  'North West England': { north: 55.2, south: 53.0, east: -1.8, west: -3.1, country: 'England' },
  'North East England': { north: 55.8, south: 54.5, east: -0.8, west: -2.5, country: 'England' },
  
  // Other UK nations
  'Scotland': { north: 61.0, south: 54.6, east: -0.7, west: -7.6, country: 'Scotland' },
  'Wales': { north: 53.5, south: 51.3, east: -2.6, west: -5.5, country: 'Wales' },
  'Northern Ireland': { north: 55.4, south: 54.0, east: -5.4, west: -8.2, country: 'Northern Ireland' },
  
  // Republic of Ireland
  'Republic of Ireland': { north: 55.4, south: 51.4, east: -5.9, west: -10.5, country: 'Republic of Ireland' }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function assignRegion(lat, lon) {
  for (const [regionName, bounds] of Object.entries(REGIONS)) {
    if (lat <= bounds.north && lat >= bounds.south && 
        lon <= bounds.east && lon >= bounds.west) {
      return { region: regionName, country: bounds.country };
    }
  }
  return { region: 'Unknown', country: 'Unknown' };
}

// ============================================
// GBIF API FUNCTIONS
// ============================================

async function fetchOccurrencesByName(scientificName, countryCode, offset = 0, limit = 300) {
  const params = new URLSearchParams({
    scientificName: scientificName,
    country: countryCode,
    hasCoordinate: 'true',
    hasGeospatialIssue: 'false',
    year: `${CONFIG.startYear},${CONFIG.endYear}`,
    offset: offset.toString(),
    limit: limit.toString()
  });
  
  const url = `${CONFIG.gbifBaseUrl}/occurrence/search?${params}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`  Error fetching: ${error.message}`);
    return null;
  }
}

async function getAllOccurrences(species) {
  console.log(`\nFetching ${species.commonName} (${species.scientificName})...`);
  
  let allOccurrences = [];
  
  // Fetch for each country
  for (const countryCode of ['GB', 'IE']) {
    const countryName = countryCode === 'GB' ? 'UK' : 'Ireland';
    console.log(`  Fetching ${countryName} records...`);
    
    let offset = 0;
    const limit = 300;
    let countryRecords = 0;
    
    while (true) {
      const data = await fetchOccurrencesByName(species.scientificName, countryCode, offset, limit);
      
      if (!data) {
        console.log(`    Warning: API error for ${countryName}`);
        break;
      }
      
      if (offset === 0) {
        console.log(`    Total available: ${data.count}`);
      }
      
      if (!data.results || data.results.length === 0) {
        break;
      }
      
      allOccurrences = allOccurrences.concat(data.results);
      countryRecords += data.results.length;
      
      // Check limits
      if (data.endOfRecords || countryRecords >= CONFIG.maxRecordsPerSpecies / 2) {
        break;
      }
      
      offset += limit;
      await sleep(CONFIG.requestDelay);
    }
    
    console.log(`    Retrieved ${countryRecords} records`);
    await sleep(CONFIG.requestDelay);
  }
  
  console.log(`  Total: ${allOccurrences.length} records`);
  return allOccurrences;
}

// ============================================
// DATA PROCESSING
// ============================================

function processOccurrences(species, occurrences) {
  const processed = {
    species: {
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName
    },
    metadata: {
      totalRecords: occurrences.length,
      dateRange: `${CONFIG.startYear}-${CONFIG.endYear}`,
      fetchedAt: new Date().toISOString()
    },
    byYear: {},
    byRegion: {},
    byCountry: {},
    rawSample: [] // Keep first 100 records as sample
  };
  
  // Initialize year buckets
  for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
    processed.byYear[year] = 0;
  }
  
  // Initialize region and country buckets
  for (const [regionName, bounds] of Object.entries(REGIONS)) {
    processed.byRegion[regionName] = { total: 0, byYear: {} };
    for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
      processed.byRegion[regionName].byYear[year] = 0;
    }
  }
  
  const countries = ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland'];
  for (const country of countries) {
    processed.byCountry[country] = { total: 0, byYear: {} };
    for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
      processed.byCountry[country].byYear[year] = 0;
    }
  }
  
  // Process each occurrence
  occurrences.forEach((occ, index) => {
    const year = occ.year;
    const lat = occ.decimalLatitude;
    const lon = occ.decimalLongitude;
    
    if (!year || !lat || !lon) return;
    if (year < CONFIG.startYear || year > CONFIG.endYear) return;
    
    // Count by year
    processed.byYear[year]++;
    
    // Assign and count by region
    const { region, country } = assignRegion(lat, lon);
    
    if (processed.byRegion[region]) {
      processed.byRegion[region].total++;
      processed.byRegion[region].byYear[year]++;
    }
    
    if (processed.byCountry[country]) {
      processed.byCountry[country].total++;
      processed.byCountry[country].byYear[year]++;
    }
    
    // Keep sample of raw records
    if (index < 100) {
      processed.rawSample.push({
        year: occ.year,
        month: occ.month,
        lat: lat,
        lon: lon,
        region: region,
        country: country,
        basisOfRecord: occ.basisOfRecord,
        datasetName: occ.datasetName
      });
    }
  });
  
  return processed;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('GBIF Data Fetch Script');
  console.log('='.repeat(60));
  console.log(`Target: ${SPECIES.length} species`);
  console.log(`Date range: ${CONFIG.startYear}-${CONFIG.endYear}`);
  console.log(`Regions: UK + Ireland (${Object.keys(REGIONS).length} regions)`);
  console.log('='.repeat(60));
  
  // Ensure output directory exists
  ensureDirectoryExists(CONFIG.outputDir);
  
  const results = [];
  
  for (const species of SPECIES) {
    try {
      // Fetch occurrences
      const occurrences = await getAllOccurrences(species);
      
      if (occurrences.length === 0) {
        console.log(`  WARNING: No occurrences found for ${species.commonName}`);
        results.push({
          id: species.id,
          commonName: species.commonName,
          totalRecords: 0,
          status: 'no_data'
        });
        continue;
      }
      
      // Process data
      const processed = processOccurrences(species, occurrences);
      
      // Save to file
      const outputPath = path.join(CONFIG.outputDir, `${species.id}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(processed, null, 2));
      console.log(`  Saved to ${outputPath}`);
      
      results.push({
        id: species.id,
        commonName: species.commonName,
        totalRecords: processed.metadata.totalRecords,
        status: 'success'
      });
      
    } catch (error) {
      console.error(`  FAILED: ${error.message}`);
      results.push({
        id: species.id,
        commonName: species.commonName,
        status: 'failed',
        error: error.message
      });
    }
    
    // Delay between species
    await sleep(CONFIG.requestDelay);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('FETCH COMPLETE');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'success');
  const noData = results.filter(r => r.status === 'no_data');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`\nSuccessful: ${successful.length}/${SPECIES.length}`);
  successful.forEach(r => {
    console.log(`  ✓ ${r.commonName}: ${r.totalRecords} records`);
  });
  
  if (noData.length > 0) {
    console.log(`\nNo data found: ${noData.length}/${SPECIES.length}`);
    noData.forEach(r => {
      console.log(`  ○ ${r.commonName}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\nFailed: ${failed.length}/${SPECIES.length}`);
    failed.forEach(r => {
      console.log(`  ✗ ${r.commonName}: ${r.error}`);
    });
  }
  
  // Save summary
  const summaryPath = path.join(CONFIG.outputDir, '_fetch-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    config: CONFIG,
    results: results
  }, null, 2));
  console.log(`\nSummary saved to ${summaryPath}`);
}

main().catch(console.error);
