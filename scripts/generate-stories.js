/**
 * generate-stories.js
 * 
 * Uses Claude API (Opus) to generate ecological narratives for each species.
 * Creates the "loss → why → ripple → action" story structure.
 * 
 * Outputs individual story JSON files to src/data/stories/
 * 
 * Usage: node scripts/generate-stories.js
 * 
 * API Key Priority:
 * 1. .env file (ANTHROPIC_API_KEY=xxx)
 * 2. config.json ({"CLAUDE_API_KEY": "xxx"})
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// ============================================
// LOAD API KEY
// ============================================

// Try .env first
dotenvConfig({ path: path.join(projectRoot, '.env') });

let apiKey = process.env.ANTHROPIC_API_KEY;

// Fall back to config.json
if (!apiKey) {
  const configPath = path.join(projectRoot, 'config.json');
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.CLAUDE_API_KEY && config.CLAUDE_API_KEY !== 'PASTE_YOUR_KEY_HERE') {
      apiKey = config.CLAUDE_API_KEY;
      console.log('Using API key from config.json');
    }
  }
}

// Check if we have a key
if (!apiKey) {
  console.error('');
  console.error('ERROR: No API key found!');
  console.error('');
  console.error('Option 1: Create .env file in project root with:');
  console.error('  ANTHROPIC_API_KEY=sk-ant-your-key-here');
  console.error('');
  console.error('Option 2: Copy config.example.json to config.json and add your key');
  console.error('');
  process.exit(1);
}

// Set for Anthropic SDK
process.env.ANTHROPIC_API_KEY = apiKey;

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  speciesDataPath: path.join(projectRoot, 'src', 'data', 'species.json'),
  storiesOutputDir: path.join(projectRoot, 'src', 'data', 'stories'),
  model: 'claude-sonnet-4-20250514',
  maxTokens: 2000,
  requestDelay: 1000 // ms between requests
};

// ============================================
// SPECIES CONTEXT DATA
// ============================================

/**
 * Additional context to help Claude generate accurate, specific narratives
 */
const SPECIES_CONTEXT = {
  'hedgehog': {
    primaryCauses: ['Garden fencing blocking movement', 'Pesticide reduction of invertebrate prey', 'Road mortality', 'Loss of hedgerows', 'Intensive agriculture'],
    rippleEffects: ['Slug and snail population increase', 'Garden pest damage', 'Increased pesticide use by gardeners', 'Secondary pollinator impacts'],
    conservationOrgs: ['British Hedgehog Preservation Society', 'People\'s Trust for Endangered Species', 'Hedgehog Street'],
    actionUrl: 'https://www.hedgehogstreet.org/',
    culturalNote: 'One of Britain\'s most beloved mammals, featured in Beatrix Potter\'s Mrs. Tiggy-Winkle.'
  },
  
  'curlew': {
    primaryCauses: ['Agricultural intensification', 'Loss of wet grassland', 'Predation of nests', 'Drainage of uplands', 'Early grass cutting destroying nests'],
    rippleEffects: ['Indicator of upland ecosystem health', 'Loss of flagship species for conservation', 'Reduced invertebrate control in farmland'],
    conservationOrgs: ['Curlew Recovery Partnership', 'RSPB', 'BTO'],
    actionUrl: 'https://www.curlewrecovery.org/',
    culturalNote: 'The curlew\'s haunting call is synonymous with wild British moorland. May become extinct as UK breeding bird within decades.'
  },
  
  'water-vole': {
    primaryCauses: ['American mink predation', 'Loss of riverbank habitat', 'Water pollution', 'Unsympathetic river management', 'Fragmented populations'],
    rippleEffects: ['Riverbank destabilization', 'Loss of burrow habitat for other species', 'Reduced vegetation management along waterways', 'Indicator of river health'],
    conservationOrgs: ['Wildlife Trusts', 'Environment Agency', 'People\'s Trust for Endangered Species'],
    actionUrl: 'https://www.wildlifetrusts.org/actions/how-help-water-voles',
    culturalNote: 'Ratty from Wind in the Willows. Once abundant, now one of UK\'s fastest declining mammals.'
  },
  
  'turtle-dove': {
    primaryCauses: ['Loss of arable weeds (food source)', 'Agricultural intensification', 'Hunting on migration route', 'Climate change affecting Sahel wintering grounds', 'Loss of thick hedgerows for nesting'],
    rippleEffects: ['Indicator of farmland biodiversity collapse', 'Reduced seed dispersal', 'Symbol of wider agricultural ecosystem damage'],
    conservationOrgs: ['Operation Turtle Dove', 'RSPB', 'Pensthorpe Conservation Trust'],
    actionUrl: 'https://www.operationturtledove.org/',
    culturalNote: 'The "turtle" comes from its purring "turr turr" call. A symbol of love since ancient times, now facing extinction in UK.'
  },
  
  'small-tortoiseshell': {
    primaryCauses: ['Parasitic fly (Sturmia bella) from continental Europe', 'Loss of nettle patches', 'Pesticide impacts', 'Climate change affecting lifecycle timing', 'Garden tidiness removing food plants'],
    rippleEffects: ['Reduced pollination services', 'Part of broader pollinator crisis', 'Indicator of invertebrate ecosystem health', 'Loss of garden wildlife'],
    conservationOrgs: ['Butterfly Conservation', 'UK Butterfly Monitoring Scheme'],
    actionUrl: 'https://butterfly-conservation.org/how-you-can-help',
    culturalNote: 'Once the most common butterfly in British gardens. Children growing up now may never see one.'
  },
  
  'red-squirrel': {
    primaryCauses: ['Grey squirrel competition', 'Squirrelpox virus (carried by greys)', 'Habitat fragmentation', 'Loss of conifer forests', 'Climate change affecting food availability'],
    rippleEffects: ['Reduced conifer seed dispersal', 'Changed forest regeneration patterns', 'Grey squirrels damage trees differently', 'Loss of native woodland character'],
    conservationOrgs: ['Red Squirrel Survival Trust', 'Scottish Wildlife Trust', 'Wildlife Trusts'],
    actionUrl: 'https://www.rsst.org.uk/how-you-can-help/',
    culturalNote: 'Now restricted to Scotland, parts of Northern England, and Ireland. The grey squirrel was introduced from North America in 1870s.'
  },
  
  'atlantic-salmon': {
    primaryCauses: ['River barriers (dams, weirs)', 'Water pollution', 'Climate change warming rivers', 'Sea lice from salmon farms', 'Overfishing', 'Loss of spawning habitat'],
    rippleEffects: ['Marine nutrient transport to rivers disrupted', 'Loss of food for otters, kingfishers, herons', 'Indicator of overall river health', 'Economic impact on fishing communities'],
    conservationOrgs: ['Atlantic Salmon Trust', 'Missing Salmon Alliance', 'Rivers Trust'],
    actionUrl: 'https://atlanticsalmontrust.org/get-involved/',
    culturalNote: 'Returns to the exact river where it was born. Salmon runs once fed entire ecosystems, including historically bears and wolves.'
  },
  
  'common-toad': {
    primaryCauses: ['Road mortality during migration', 'Loss of breeding ponds', 'Agricultural drainage', 'Pesticide impacts', 'Garden pond decline', 'Disease'],
    rippleEffects: ['Slug and invertebrate population increase', 'Loss of prey for grass snakes, herons', 'Indicator of wetland connectivity', 'Garden ecosystem imbalance'],
    conservationOrgs: ['Froglife', 'Toad Patrol volunteers', 'Amphibian and Reptile Conservation'],
    actionUrl: 'https://www.froglife.org/what-you-can-do/',
    culturalNote: 'Toads migrate up to 2km to ancestral breeding ponds. Volunteers carry them across roads during spring migration.'
  },
  
  'corncrake': {
    primaryCauses: ['Early mechanical mowing of hay meadows', 'Loss of traditional hay meadows', 'Agricultural intensification', 'Drainage of wet grassland', 'Predation'],
    rippleEffects: ['Indicator of traditional farming practice loss', 'Symbol of crofting landscape change', 'Biodiversity of hay meadows declining together'],
    conservationOrgs: ['RSPB', 'Scottish Natural Heritage', 'Crofting communities'],
    actionUrl: 'https://www.rspb.org.uk/birds-and-wildlife/corncrake',
    culturalNote: 'Once heard across Britain, its rasping call now restricted to Scottish islands and Ireland. "Crex crex" is its scientific name.'
  },
  
  'natterjack-toad': {
    primaryCauses: ['Loss of coastal dune habitat', 'Heathland destruction', 'Natural succession (scrub overgrowth)', 'Sea level rise', 'Loss of ephemeral breeding pools'],
    rippleEffects: ['Indicator of rare coastal/heathland habitat', 'Specialist predator of dune invertebrates', 'Symbol of dynamic natural landscapes'],
    conservationOrgs: ['Amphibian and Reptile Conservation', 'Natural England', 'Wildlife Trusts'],
    actionUrl: 'https://www.arc-trust.org/natterjack-toad',
    culturalNote: 'Britain\'s loudest amphibian - males\' calls can be heard 2km away. Runs rather than hops. Needs warm, shallow pools.'
  }
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

// ============================================
// STORY GENERATION
// ============================================

async function generateStory(anthropic, species, context) {
  const prompt = `You are an expert conservation biologist and science communicator. Generate a compelling, accurate narrative about the decline of the ${species.commonName} (${species.scientificName}) in the UK and Ireland.

## Species Data
- **Common Name:** ${species.commonName}
- **Scientific Name:** ${species.scientificName}
- **Decline:** ${species.declineScore.percent}% ${species.declineScore.direction} (comparing ${species.declineScore.earlyPeriod} to ${species.declineScore.latePeriod})
- **Trend:** ${species.declineScore.trend}
- **Ecological Impact Score:** ${species.ecologicalImpactScore.score}/100
- **Ecological Role Notes:** ${species.ecologicalImpactScore.notes}
- **Peak Regions:** ${species.peakRegions.join(', ')}
- **Total Records:** ${species.totalRecords}

## Additional Context
- **Primary Causes:** ${context.primaryCauses.join(', ')}
- **Ripple Effects:** ${context.rippleEffects.join(', ')}
- **Conservation Organizations:** ${context.conservationOrgs.join(', ')}
- **Cultural Note:** ${context.culturalNote}

## Output Format
Generate a JSON object with this exact structure:

{
  "id": "${species.id}",
  "commonName": "${species.commonName}",
  "scientificName": "${species.scientificName}",
  
  "loss": {
    "headline": "[Punchy, specific headline with number, e.g., 'Down 75% in 20 years']",
    "description": "[2-3 sentences describing the decline in accessible language. Include specific regions if relevant.]",
    "dataNote": "[One sentence about data source/methodology]"
  },
  
  "why": {
    "primary": "[The single most important cause]",
    "factors": [
      {
        "cause": "[Cause name]",
        "description": "[1-2 sentences explaining how this cause affects the species]",
        "severity": "[high/medium/low]"
      }
    ]
  },
  
  "ripple": {
    "headline": "[Compelling one-liner about interconnection]",
    "narrative": "[3-4 sentences explaining the cascade of effects when this species declines. Make connections surprising but accurate. End with something that affects humans directly.]",
    "connections": [
      {
        "from": "[Starting point]",
        "to": "[What it affects]",
        "mechanism": "[Brief explanation of how]"
      }
    ]
  },
  
  "action": {
    "headline": "[Empowering call to action]",
    "description": "[1-2 sentences about why individual action matters]",
    "steps": [
      "[Specific, achievable action 1]",
      "[Specific, achievable action 2]",
      "[Specific, achievable action 3]",
      "[Specific, achievable action 4]"
    ],
    "organizations": [
      {
        "name": "[Org name]",
        "url": "[URL]",
        "description": "[What they do, one sentence]"
      }
    ],
    "primaryLink": "${context.actionUrl}"
  },
  
  "quote": {
    "text": "[A memorable, shareable quote about this species or its decline - can be from a conservationist, poet, or your own creation]",
    "attribution": "[Who said it, or 'Conservation proverb' if created]"
  }
}

## Guidelines
- Be specific and local (UK/Ireland focus)
- Use accessible language, no jargon
- Make the ripple effects surprising but scientifically accurate
- Actions should be things regular people can actually do
- The narrative should make people CARE, not just inform
- Include 3-5 factors in "why"
- Include 3-5 connections in "ripple"
- Include 2-3 organizations in "action"

Output ONLY the JSON object, no additional text.`;

  try {
    const response = await anthropic.messages.create({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });
    
    // Extract JSON from response
    const content = response.content[0].text;
    
    // Parse and validate JSON
    const story = JSON.parse(content);
    
    // Add metadata
    story.generatedAt = new Date().toISOString();
    story.model = CONFIG.model;
    story.scores = {
      declinePercent: species.declineScore.percent,
      declineDirection: species.declineScore.direction,
      ecologicalImpact: species.ecologicalImpactScore.score,
      urgencyScore: species.urgencyScore,
      urgencyRank: species.urgencyRank
    };
    story.regions = {
      peak: species.peakRegions,
      mostDeclined: species.mostDeclinedRegions,
      byCountry: species.byCountry
    };
    story.yearlyTrend = species.yearlyTrend;
    
    return story;
    
  } catch (error) {
    console.error(`  Error generating story: ${error.message}`);
    throw error;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Story Generation Script (Claude API)');
  console.log('='.repeat(60));
  console.log(`Model: ${CONFIG.model}`);
  console.log('='.repeat(60));
  
  // Initialize Anthropic client
  const anthropic = new Anthropic();
  
  // Load species data
  if (!fs.existsSync(CONFIG.speciesDataPath)) {
    console.error(`Species data not found at ${CONFIG.speciesDataPath}`);
    console.error('Run process-species.js first.');
    process.exit(1);
  }
  
  const speciesList = JSON.parse(fs.readFileSync(CONFIG.speciesDataPath, 'utf8'));
  console.log(`\nLoaded ${speciesList.length} species\n`);
  
  ensureDirectoryExists(CONFIG.storiesOutputDir);
  
  const results = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  
  for (const species of speciesList) {
    console.log(`Generating story for ${species.commonName}...`);
    
    const context = SPECIES_CONTEXT[species.id];
    
    if (!context) {
      console.warn(`  Warning: No context data for ${species.id}, skipping`);
      continue;
    }
    
    try {
      const story = await generateStory(anthropic, species, context);
      
      // Save individual story file
      const outputPath = path.join(CONFIG.storiesOutputDir, `${species.id}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(story, null, 2));
      console.log(`  ✓ Saved to ${outputPath}`);
      
      results.push({
        id: species.id,
        commonName: species.commonName,
        status: 'success'
      });
      
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      results.push({
        id: species.id,
        commonName: species.commonName,
        status: 'failed',
        error: error.message
      });
    }
    
    // Delay between requests
    await sleep(CONFIG.requestDelay);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`\nSuccessful: ${successful.length}/${speciesList.length}`);
  successful.forEach(r => console.log(`  ✓ ${r.commonName}`));
  
  if (failed.length > 0) {
    console.log(`\nFailed: ${failed.length}/${speciesList.length}`);
    failed.forEach(r => console.log(`  ✗ ${r.commonName}: ${r.error}`));
  }
  
  // Save generation summary
  const summaryPath = path.join(CONFIG.storiesOutputDir, '_generation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    model: CONFIG.model,
    results: results
  }, null, 2));
  
  console.log(`\nSummary saved to ${summaryPath}`);
  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
