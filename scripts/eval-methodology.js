/**
 * eval-methodology.js
 * 
 * Evaluates two approaches for normalizing GBIF data to account for
 * increased recording effort over time (iNaturalist boom).
 * 
 * Test A: Percentage of Total (filtered baseline)
 * Test B: Categorized Ratio Method (peer group comparison)
 * 
 * Compares results against known literature decline figures.
 * 
 * Usage: node scripts/eval-methodology.js
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
  rawDataDir: path.join(__dirname, 'output', 'raw'),
  outputDir: path.join(__dirname, 'output'),
  
  // Time periods for comparison
  earlyPeriod: { start: 2012, end: 2016, label: '2012-2016' },
  latePeriod: { start: 2020, end: 2024, label: '2020-2024' },
  
  // GBIF API for total records
  gbifBaseUrl: 'https://api.gbif.org/v1',
  
  // Peer groups for Test B
  peerGroups: {
    'Garden Wildlife': ['hedgehog', 'common-toad', 'small-tortoiseshell'],
    'Farmland Birds': ['curlew', 'turtle-dove', 'corncrake'],
    'Specialist/Aquatic': ['water-vole', 'atlantic-salmon', 'natterjack-toad', 'red-squirrel']
  },
  
  // Known literature decline figures for validation
  // Sources: PTES, BTO, RSPB, Wildlife Trusts
  literatureDeclines: {
    'hedgehog': { decline: -75, period: '2000-2020', source: 'PTES State of Hedgehogs 2022' },
    'curlew': { decline: -65, period: '1995-2018', source: 'BTO Breeding Bird Survey' },
    'water-vole': { decline: -90, period: '1990-2015', source: 'Wildlife Trusts' },
    'turtle-dove': { decline: -98, period: '1970-2020', source: 'BTO Bird Trends' },
    'small-tortoiseshell': { decline: -75, period: '1976-2019', source: 'UK Butterfly Monitoring' },
    'red-squirrel': { decline: -50, period: '1950-2010', source: 'Red Squirrel Survival Trust' },
    'atlantic-salmon': { decline: -70, period: '1980-2020', source: 'Atlantic Salmon Trust' },
    'common-toad': { decline: -68, period: '1985-2015', source: 'Froglife' },
    'corncrake': { decline: -80, period: '1970-2000', source: 'RSPB' },
    'natterjack-toad': { decline: -75, period: '1900-2000', source: 'ARC Trust' }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sumYearRange(byYear, start, end) {
  let sum = 0;
  for (let year = start; year <= end; year++) {
    sum += byYear[year] || 0;
  }
  return sum;
}

function percentChange(early, late) {
  if (early === 0) return null;
  return ((late - early) / early) * 100;
}

// ============================================
// LOAD SPECIES DATA
// ============================================

function loadSpeciesData() {
  const species = {};
  const files = fs.readdirSync(CONFIG.rawDataDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));
  
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(CONFIG.rawDataDir, file), 'utf8'));
    const id = data.species.id;
    
    species[id] = {
      id: id,
      commonName: data.species.commonName,
      scientificName: data.species.scientificName,
      byYear: data.byYear,
      totalRecords: data.metadata.totalRecords,
      earlyPeriodCount: sumYearRange(data.byYear, CONFIG.earlyPeriod.start, CONFIG.earlyPeriod.end),
      latePeriodCount: sumYearRange(data.byYear, CONFIG.latePeriod.start, CONFIG.latePeriod.end)
    };
  }
  
  return species;
}

// ============================================
// TEST A: PERCENTAGE OF TOTAL
// ============================================

async function fetchTotalRecordsPerYear(countryCode) {
  const totals = {};
  
  for (let year = CONFIG.earlyPeriod.start; year <= CONFIG.latePeriod.end; year++) {
    const params = new URLSearchParams({
      country: countryCode,
      year: year.toString(),
      hasCoordinate: 'true',
      limit: '0' // We only want the count
    });
    
    const url = `${CONFIG.gbifBaseUrl}/occurrence/search?${params}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      totals[year] = data.count || 0;
      
      // Progress indicator
      process.stdout.write(`\r  Fetching ${countryCode} ${year}: ${data.count.toLocaleString()} records`);
      
      await sleep(500);
    } catch (error) {
      console.error(`\n  Error fetching ${year}: ${error.message}`);
      totals[year] = 0;
    }
  }
  
  console.log(''); // New line after progress
  return totals;
}

async function runTestA(species) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST A: Percentage of Total Records');
  console.log('='.repeat(60));
  
  // Fetch total records per year for UK and Ireland
  console.log('\nFetching total GBIF records per year...');
  console.log('(This establishes the baseline for recording effort)\n');
  
  const ukTotals = await fetchTotalRecordsPerYear('GB');
  const ieTotals = await fetchTotalRecordsPerYear('IE');
  
  // Combine totals
  const combinedTotals = {};
  for (let year = CONFIG.earlyPeriod.start; year <= CONFIG.latePeriod.end; year++) {
    combinedTotals[year] = (ukTotals[year] || 0) + (ieTotals[year] || 0);
  }
  
  // Calculate early and late period totals
  const earlyTotal = sumYearRange(combinedTotals, CONFIG.earlyPeriod.start, CONFIG.earlyPeriod.end);
  const lateTotal = sumYearRange(combinedTotals, CONFIG.latePeriod.start, CONFIG.latePeriod.end);
  
  console.log(`\nBaseline totals:`);
  console.log(`  ${CONFIG.earlyPeriod.label}: ${earlyTotal.toLocaleString()} total records`);
  console.log(`  ${CONFIG.latePeriod.label}: ${lateTotal.toLocaleString()} total records`);
  console.log(`  Recording effort increase: ${((lateTotal / earlyTotal) * 100 - 100).toFixed(0)}%`);
  
  // Calculate each species as percentage of total
  const results = {};
  
  for (const [id, sp] of Object.entries(species)) {
    const earlyPercent = earlyTotal > 0 ? (sp.earlyPeriodCount / earlyTotal) * 100 : 0;
    const latePercent = lateTotal > 0 ? (sp.latePeriodCount / lateTotal) * 100 : 0;
    
    let normalizedChange = null;
    if (earlyPercent > 0) {
      normalizedChange = ((latePercent - earlyPercent) / earlyPercent) * 100;
    }
    
    results[id] = {
      commonName: sp.commonName,
      earlyRaw: sp.earlyPeriodCount,
      lateRaw: sp.latePeriodCount,
      rawChange: percentChange(sp.earlyPeriodCount, sp.latePeriodCount),
      earlyPercent: earlyPercent,
      latePercent: latePercent,
      normalizedChange: normalizedChange
    };
  }
  
  return results;
}

// ============================================
// TEST B: CATEGORIZED RATIO METHOD
// ============================================

function runTestB(species) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST B: Categorized Ratio Method');
  console.log('='.repeat(60));
  
  const results = {};
  
  // Initialize results for all species
  for (const id of Object.keys(species)) {
    results[id] = {
      commonName: species[id].commonName,
      peerGroup: null,
      earlyRatio: null,
      lateRatio: null,
      ratioChange: null
    };
  }
  
  // Process each peer group
  for (const [groupName, memberIds] of Object.entries(CONFIG.peerGroups)) {
    console.log(`\n${groupName}:`);
    
    // Get members that exist in our data
    const members = memberIds.filter(id => species[id]);
    
    if (members.length < 2) {
      console.log(`  Skipping - need at least 2 species, found ${members.length}`);
      continue;
    }
    
    // Calculate group totals for each period
    const earlyGroupTotal = members.reduce((sum, id) => sum + species[id].earlyPeriodCount, 0);
    const lateGroupTotal = members.reduce((sum, id) => sum + species[id].latePeriodCount, 0);
    
    console.log(`  Early period total: ${earlyGroupTotal.toLocaleString()}`);
    console.log(`  Late period total: ${lateGroupTotal.toLocaleString()}`);
    
    // Calculate each species' share within the group
    for (const id of members) {
      const sp = species[id];
      
      const earlyRatio = earlyGroupTotal > 0 ? (sp.earlyPeriodCount / earlyGroupTotal) * 100 : 0;
      const lateRatio = lateGroupTotal > 0 ? (sp.latePeriodCount / lateGroupTotal) * 100 : 0;
      
      let ratioChange = null;
      if (earlyRatio > 0) {
        ratioChange = ((lateRatio - earlyRatio) / earlyRatio) * 100;
      }
      
      results[id] = {
        commonName: sp.commonName,
        peerGroup: groupName,
        earlyRatio: earlyRatio,
        lateRatio: lateRatio,
        ratioChange: ratioChange
      };
      
      console.log(`  ${sp.commonName}: ${earlyRatio.toFixed(1)}% → ${lateRatio.toFixed(1)}% (${ratioChange !== null ? (ratioChange > 0 ? '+' : '') + ratioChange.toFixed(0) + '%' : 'N/A'})`);
    }
  }
  
  return results;
}

// ============================================
// COMPARISON OUTPUT
// ============================================

function outputComparison(species, testAResults, testBResults) {
  console.log('\n' + '='.repeat(80));
  console.log('METHODOLOGY COMPARISON');
  console.log('='.repeat(80));
  
  console.log('\nComparing normalized results against known literature decline figures:\n');
  
  // Table header
  console.log('Species              | Literature | Raw GBIF  | Test A    | Test B    | Best Match');
  console.log('---------------------|------------|-----------|-----------|-----------|------------');
  
  const comparison = [];
  
  for (const [id, lit] of Object.entries(CONFIG.literatureDeclines)) {
    if (!species[id]) continue;
    
    const testA = testAResults[id];
    const testB = testBResults[id];
    
    const litValue = lit.decline;
    const rawValue = testA?.rawChange;
    const testAValue = testA?.normalizedChange;
    const testBValue = testB?.ratioChange;
    
    // Determine which method is closer to literature
    let bestMatch = 'N/A';
    if (testAValue !== null && testBValue !== null) {
      const testADiff = Math.abs((testAValue || 0) - litValue);
      const testBDiff = Math.abs((testBValue || 0) - litValue);
      bestMatch = testADiff < testBDiff ? 'Test A' : 'Test B';
    } else if (testAValue !== null) {
      bestMatch = 'Test A';
    } else if (testBValue !== null) {
      bestMatch = 'Test B';
    }
    
    const name = species[id].commonName.padEnd(20);
    const litStr = `${litValue}%`.padStart(10);
    const rawStr = (rawValue !== null ? `${rawValue > 0 ? '+' : ''}${rawValue.toFixed(0)}%` : 'N/A').padStart(9);
    const testAStr = (testAValue !== null ? `${testAValue > 0 ? '+' : ''}${testAValue.toFixed(0)}%` : 'N/A').padStart(9);
    const testBStr = (testBValue !== null ? `${testBValue > 0 ? '+' : ''}${testBValue.toFixed(0)}%` : 'N/A').padStart(9);
    
    console.log(`${name} | ${litStr} | ${rawStr} | ${testAStr} | ${testBStr} | ${bestMatch}`);
    
    comparison.push({
      id,
      commonName: species[id].commonName,
      literature: litValue,
      literatureSource: lit.source,
      literaturePeriod: lit.period,
      rawGBIF: rawValue,
      testA: testAValue,
      testB: testBValue,
      bestMatch
    });
  }
  
  // Summary
  const testAWins = comparison.filter(c => c.bestMatch === 'Test A').length;
  const testBWins = comparison.filter(c => c.bestMatch === 'Test B').length;
  
  console.log('\n' + '-'.repeat(80));
  console.log(`\nSummary:`);
  console.log(`  Test A (% of total) closer to literature: ${testAWins} species`);
  console.log(`  Test B (peer ratios) closer to literature: ${testBWins} species`);
  
  // Save detailed results
  const outputPath = path.join(CONFIG.outputDir, 'methodology-comparison.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    config: {
      earlyPeriod: CONFIG.earlyPeriod,
      latePeriod: CONFIG.latePeriod,
      peerGroups: CONFIG.peerGroups
    },
    testAResults,
    testBResults,
    comparison,
    summary: {
      testAWins,
      testBWins,
      recommendation: testAWins > testBWins ? 'Test A' : testBWins > testAWins ? 'Test B' : 'Tie'
    }
  }, null, 2));
  
  console.log(`\nDetailed results saved to: ${outputPath}`);
  
  return comparison;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('GBIF Data Normalization Methodology Evaluation');
  console.log('='.repeat(60));
  
  // Load existing species data
  console.log('\nLoading species data from raw GBIF files...');
  const species = loadSpeciesData();
  console.log(`Loaded ${Object.keys(species).length} species\n`);
  
  // Show raw counts
  console.log('Raw record counts by period:');
  console.log('-'.repeat(50));
  for (const [id, sp] of Object.entries(species)) {
    console.log(`${sp.commonName.padEnd(25)} Early: ${sp.earlyPeriodCount.toString().padStart(6)} | Late: ${sp.latePeriodCount.toString().padStart(6)}`);
  }
  
  // Run Test A
  const testAResults = await runTestA(species);
  
  // Run Test B
  const testBResults = runTestB(species);
  
  // Compare results
  outputComparison(species, testAResults, testBResults);
  
  console.log('\n' + '='.repeat(60));
  console.log('EVALUATION COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
