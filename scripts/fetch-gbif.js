/**
 * fetch-gbif.js
 * 
 * Fetches recent (2020–2025) species occurrence data from the GBIF API
 * for the UK Ecological Web visualization project.
 * 
 * Reads species list from ../data/species.json (uses gbifKey for reliable lookup).
 * Outputs one JSON file per species to scripts/output/gbif/
 * 
 * Key differences from previous version:
 * - Uses taxonKey instead of scientificName for more reliable API matches
 * - 2020–2025 only (no historical comparison — avoids iNaturalist boom bias)
 * - Keeps all coordinates for Leaflet map plotting
 * - Tiered record caps based on data quality flags
 * - Respects presentInIreland flag (skips IE fetch for tawny owl, water vole)
 * - Resume support: skips species with existing output files (use --force to refetch)
 * 
 * Usage:
 *   node scripts/fetch-gbif.js              # fetch all, skip existing
 *   node scripts/fetch-gbif.js --force      # refetch everything
 *   node scripts/fetch-gbif.js --only oak   # fetch single species
 *   node scripts/fetch-gbif.js --dry-run    # show plan without fetching
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
  // Date range — recent data only
  startYear: 2020,
  endYear: 2025,
  
  // API settings
  gbifBaseUrl: 'https://api.gbif.org/v1',
  requestDelay: 1200,     // ms between API calls (be nice to GBIF)
  retryDelay: 5000,       // ms before retrying a failed request
  maxRetries: 3,          // retries per failed request
  pageSize: 300,          // GBIF max per request
  
  // Record caps per data quality tier
  // Higher for species we want dense map coverage on
  recordCaps: {
    excellent: 5000,   // Oak, hedgehog, bumblebee — lots of data, want good maps
    good: 3000,        // Otter, badger, red squirrel — solid data
    moderate: 2000,    // Salmon, crayfish — less available
    poor: 1000         // Earthworm, sand eel — take whatever we can get
  },
  
  // Paths
  speciesJsonPath: path.join(__dirname, '..', 'data', 'species.json'),
  outputDir: path.join(__dirname, 'output', 'gbif')
};

// ============================================
// UK + IRELAND REGIONS (from your original)
// ============================================

const REGIONS = {
  'South East England': { north: 51.8, south: 50.7, east: 1.5, west: -1.5, country: 'England' },
  'South West England': { north: 51.7, south: 50.0, east: -1.5, west: -5.7, country: 'England' },
  'London': { north: 51.7, south: 51.3, east: 0.3, west: -0.5, country: 'England' },
  'East of England': { north: 52.9, south: 51.5, east: 1.8, west: -0.5, country: 'England' },
  'East Midlands': { north: 53.5, south: 52.0, east: 0.0, west: -1.8, country: 'England' },
  'West Midlands': { north: 53.0, south: 52.0, east: -1.2, west: -3.1, country: 'England' },
  'Yorkshire': { north: 54.5, south: 53.3, east: -0.1, west: -2.5, country: 'England' },
  'North West England': { north: 55.2, south: 53.0, east: -1.8, west: -3.1, country: 'England' },
  'North East England': { north: 55.8, south: 54.5, east: -0.8, west: -2.5, country: 'England' },
  'Scotland': { north: 61.0, south: 54.6, east: -0.7, west: -7.6, country: 'Scotland' },
  'Wales': { north: 53.5, south: 51.3, east: -2.6, west: -5.5, country: 'Wales' },
  'Northern Ireland': { north: 55.4, south: 54.0, east: -5.4, west: -8.2, country: 'Northern Ireland' },
  'Republic of Ireland': { north: 55.4, south: 51.4, east: -5.9, west: -10.5, country: 'Republic of Ireland' }
};

// ============================================
// HELPERS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function assignRegion(lat, lon) {
  for (const [name, bounds] of Object.entries(REGIONS)) {
    if (lat <= bounds.north && lat >= bounds.south &&
        lon <= bounds.east && lon >= bounds.west) {
      return { region: name, country: bounds.country };
    }
  }
  return { region: 'Unknown', country: 'Unknown' };
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force'),
    dryRun: args.includes('--dry-run'),
    only: args.includes('--only') ? args[args.indexOf('--only') + 1] : null
  };
}

function formatNum(n) {
  return n.toLocaleString();
}

function elapsed(startMs) {
  const s = Math.round((Date.now() - startMs) / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// ============================================
// GBIF API
// ============================================

/**
 * Two search strategies:
 *   'taxonKey'       — exact GBIF backbone key (fast, but some species indexed under synonyms)
 *   'scientificName' — name-based search (slower, but catches synonym/subspecies records)
 * 
 * fetchSpeciesOccurrences tries taxonKey first. If a country returns 0 results,
 * it automatically retries with scientificName for that country.
 */

async function fetchPage(searchParams, countryCode, offset = 0) {
  const params = new URLSearchParams({
    ...searchParams,
    country: countryCode,
    hasCoordinate: 'true',
    hasGeospatialIssue: 'false',
    year: `${CONFIG.startYear},${CONFIG.endYear}`,
    offset: offset.toString(),
    limit: CONFIG.pageSize.toString()
  });

  const url = `${CONFIG.gbifBaseUrl}/occurrence/search?${params}`;

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        const wait = CONFIG.retryDelay * attempt;
        console.log(`    ⏳ Rate limited, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === CONFIG.maxRetries) {
        console.error(`    ✗ Failed after ${CONFIG.maxRetries} attempts: ${error.message}`);
        return null;
      }
      console.log(`    ⚠ Attempt ${attempt} failed, retrying in ${CONFIG.retryDelay / 1000}s...`);
      await sleep(CONFIG.retryDelay);
    }
  }
  return null;
}

async function fetchCountryRecords(searchParams, countryCode, countryName, cap) {
  let records = [];
  let offset = 0;
  let totalAvailable = null;

  while (true) {
    const data = await fetchPage(searchParams, countryCode, offset);
    
    if (!data) break;
    
    if (offset === 0) {
      totalAvailable = data.count;
      console.log(`    ${countryName}: ${formatNum(totalAvailable)} available, fetching up to ${formatNum(cap)}`);
    }

    if (!data.results || data.results.length === 0) break;

    records = records.concat(data.results);

    if (data.endOfRecords || records.length >= cap) break;

    offset += CONFIG.pageSize;
    await sleep(CONFIG.requestDelay);
  }

  if (totalAvailable !== null) {
    console.log(`    ${countryName}: retrieved ${formatNum(records.length)}/${formatNum(totalAvailable)}`);
  }

  return records;
}

async function fetchSpeciesOccurrences(species, recordCap) {
  const countries = species.presentInIreland
    ? [{ code: 'GB', name: 'UK' }, { code: 'IE', name: 'Ireland' }]
    : [{ code: 'GB', name: 'UK' }];

  // Split cap proportionally (roughly 75/25 UK/IE for most species)
  const ukCap = species.presentInIreland ? Math.round(recordCap * 0.75) : recordCap;
  const ieCap = Math.round(recordCap * 0.25);

  // Two search strategies
  const taxonKeySearch = { taxonKey: species.gbifKey.toString() };
  const nameSearch = { scientificName: species.scientificName };

  let allRecords = [];

  for (const { code, name } of countries) {
    const cap = code === 'GB' ? ukCap : ieCap;

    // Strategy 1: try taxonKey (fast, exact)
    let records = await fetchCountryRecords(taxonKeySearch, code, name, cap);

    // Strategy 2: fall back to scientificName if taxonKey returned nothing
    if (records.length === 0) {
      console.log(`    ${name}: taxonKey returned 0 — retrying with scientificName...`);
      await sleep(CONFIG.requestDelay);
      records = await fetchCountryRecords(nameSearch, code, name, cap);
      
      if (records.length > 0) {
        console.log(`    ${name}: ✓ scientificName fallback found ${formatNum(records.length)} records`);
      }
    }

    allRecords = allRecords.concat(records);
    await sleep(CONFIG.requestDelay);
  }

  return allRecords;
}

// ============================================
// DATA PROCESSING
// ============================================

function processOccurrences(species, rawOccurrences) {
  // Extract just what we need for the map + summary stats
  const points = [];
  const byCountry = {};
  const byRegion = {};
  const byYear = {};
  let skipped = 0;

  for (const occ of rawOccurrences) {
    const lat = occ.decimalLatitude;
    const lon = occ.decimalLongitude;
    const year = occ.year;

    if (!lat || !lon) { skipped++; continue; }

    const { region, country } = assignRegion(lat, lon);

    // Map point (compact — just what Leaflet needs plus a bit of context)
    points.push([
      Math.round(lat * 10000) / 10000,   // 4 decimal places ≈ 11m precision
      Math.round(lon * 10000) / 10000,
      year || null,
      occ.month || null
    ]);

    // Summaries
    byCountry[country] = (byCountry[country] || 0) + 1;
    byRegion[region] = (byRegion[region] || 0) + 1;
    if (year) byYear[year] = (byYear[year] || 0) + 1;
  }

  // Sort regions by count descending
  const topRegions = Object.entries(byRegion)
    .filter(([r]) => r !== 'Unknown')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    species: {
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      gbifKey: species.gbifKey
    },
    metadata: {
      totalPoints: points.length,
      skippedRecords: skipped,
      dateRange: `${CONFIG.startYear}-${CONFIG.endYear}`,
      fetchedAt: new Date().toISOString(),
      pointFormat: '[latitude, longitude, year, month]'
    },
    summary: {
      byCountry,
      byYear,
      topRegions
    },
    // The main payload — compact array of [lat, lon, year, month]
    points
  };
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = parseArgs();
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('GBIF Distribution Fetch — UK Ecological Web');
  console.log('='.repeat(60));
  console.log(`Date range: ${CONFIG.startYear}–${CONFIG.endYear}`);
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : args.force ? 'FORCE REFETCH' : 'NORMAL (skip existing)'}`);
  if (args.only) console.log(`Filter: ${args.only} only`);
  console.log('='.repeat(60));

  // Load species list
  if (!fs.existsSync(CONFIG.speciesJsonPath)) {
    console.error(`\n✗ Species file not found: ${CONFIG.speciesJsonPath}`);
    console.error('  Run the data generation step first to create species.json');
    process.exit(1);
  }

  const speciesData = JSON.parse(fs.readFileSync(CONFIG.speciesJsonPath, 'utf8'));
  let speciesList = speciesData.species;

  // Filter if --only specified
  if (args.only) {
    speciesList = speciesList.filter(s => s.id === args.only);
    if (speciesList.length === 0) {
      console.error(`\n✗ Species "${args.only}" not found in species.json`);
      process.exit(1);
    }
  }

  ensureDir(CONFIG.outputDir);

  // Plan the fetch
  console.log(`\nPlanning fetch for ${speciesList.length} species:\n`);

  const plan = speciesList.map(sp => {
    const cap = CONFIG.recordCaps[sp.gbifDataQuality] || CONFIG.recordCaps.moderate;
    const outputPath = path.join(CONFIG.outputDir, `${sp.id}.json`);
    const exists = fs.existsSync(outputPath);
    const skip = exists && !args.force;

    return { ...sp, cap, outputPath, exists, skip };
  });

  // Show plan
  for (const p of plan) {
    const status = p.skip ? '⊘ skip (exists)' : `↓ fetch up to ${formatNum(p.cap)}`;
    const countries = p.presentInIreland ? 'UK+IE' : 'UK only';
    const quality = p.gbifDataQuality.padEnd(10);
    console.log(`  ${p.commonName.padEnd(28)} ${quality} ${countries.padEnd(8)} ${status}`);
  }

  const toFetch = plan.filter(p => !p.skip);
  const skipping = plan.filter(p => p.skip);

  console.log(`\n  Fetching: ${toFetch.length} species`);
  console.log(`  Skipping: ${skipping.length} species (already fetched)`);

  if (args.dryRun) {
    console.log('\n  --dry-run flag set, exiting without fetching.');
    return;
  }

  if (toFetch.length === 0) {
    console.log('\n  Nothing to fetch! Use --force to refetch existing files.');
    return;
  }

  // Estimate time
  const estMinutes = Math.round(toFetch.length * 1.5);
  console.log(`\n  Estimated time: ~${estMinutes} minutes\n`);

  // Fetch
  const results = [];

  for (let i = 0; i < toFetch.length; i++) {
    const sp = toFetch[i];
    console.log(`\n[${i + 1}/${toFetch.length}] ${sp.commonName} (${sp.scientificName})`);
    console.log(`  GBIF key: ${sp.gbifKey} | quality: ${sp.gbifDataQuality} | cap: ${formatNum(sp.cap)}`);

    try {
      const rawOccurrences = await fetchSpeciesOccurrences(sp, sp.cap);

      if (rawOccurrences.length === 0) {
        console.log(`  ⚠ No occurrences found`);
        results.push({ id: sp.id, commonName: sp.commonName, points: 0, status: 'no_data' });
        continue;
      }

      // Process
      const processed = processOccurrences(sp, rawOccurrences);

      // Save
      fs.writeFileSync(sp.outputPath, JSON.stringify(processed, null, 2));
      console.log(`  ✓ Saved ${formatNum(processed.metadata.totalPoints)} points → ${sp.id}.json`);

      // Show summary
      const countries = Object.entries(processed.summary.byCountry)
        .map(([c, n]) => `${c}: ${formatNum(n)}`)
        .join(', ');
      console.log(`    ${countries}`);

      results.push({
        id: sp.id,
        commonName: sp.commonName,
        points: processed.metadata.totalPoints,
        status: 'success'
      });

    } catch (error) {
      console.error(`  ✗ FAILED: ${error.message}`);
      results.push({ id: sp.id, commonName: sp.commonName, status: 'failed', error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`FETCH COMPLETE — ${elapsed(startTime)}`);
  console.log('='.repeat(60));

  const successful = results.filter(r => r.status === 'success');
  const noData = results.filter(r => r.status === 'no_data');
  const failed = results.filter(r => r.status === 'failed');

  if (successful.length > 0) {
    console.log(`\n✓ Successful: ${successful.length}`);
    const totalPoints = successful.reduce((s, r) => s + r.points, 0);
    successful.forEach(r => console.log(`  ${r.commonName.padEnd(28)} ${formatNum(r.points)} points`));
    console.log(`  ${'TOTAL'.padEnd(28)} ${formatNum(totalPoints)} points`);
  }

  if (noData.length > 0) {
    console.log(`\n⚠ No data: ${noData.length}`);
    noData.forEach(r => console.log(`  ${r.commonName}`));
  }

  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`  ${r.commonName}: ${r.error}`));
  }

  // Save fetch summary
  const summaryPath = path.join(CONFIG.outputDir, '_fetch-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    elapsed: elapsed(startTime),
    config: {
      dateRange: `${CONFIG.startYear}-${CONFIG.endYear}`,
      recordCaps: CONFIG.recordCaps
    },
    results,
    skipped: skipping.map(s => s.id)
  }, null, 2));
  console.log(`\nSummary saved to ${summaryPath}`);
}

main().catch(console.error);
