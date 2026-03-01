import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const speciesImagesPath = path.join(__dirname, '../data/species-images.json');
const speciesImages = JSON.parse(fs.readFileSync(speciesImagesPath, 'utf8'));

// Search terms for each species with missing images
const searchTerms = {
  'red-squirrel': 'Sciurus vulgaris',
  'jay': 'Garrulus glandarius',
  'badger': 'Meles meles',
  'bluebell': 'Hyacinthoides non-scripta',
  'otter': 'Lutra lutra',
  'kingfisher': 'Alcedo atthis',
  'water-vole': 'Arvicola amphibius',
  'grey-seal': 'Halichoerus grypus',
  'hen-harrier': 'Circus cyaneus',
  'red-grouse': 'Lagopus lagopus scotica',
  'heather': 'Calluna vulgaris',
  'buff-tailed-bumblebee': 'Bombus terrestris',
  'small-tortoiseshell': 'Aglais urticae',
  'common-frog': 'Rana temporaria'
};

async function searchWikimediaImage(speciesId, searchTerm) {
  // Use Wikimedia Commons search API
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=5&format=json&origin=*`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const results = data.query.search;

    if (results.length === 0) {
      console.log(`No results found for ${speciesId}`);
      return null;
    }

    // Get the first result's image info
    const firstResult = results[0].title; // e.g., "File:Sciurus_vulgaris.jpg"

    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(firstResult)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const imageResponse = await fetch(imageInfoUrl);
    const imageData = await imageResponse.json();
    const pages = imageData.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === '-1') {
      console.log(`Could not get image info for ${firstResult}`);
      return null;
    }

    const imageUrl = pages[pageId].imageinfo[0].url;
    const filePage = `https://commons.wikimedia.org/wiki/${firstResult.replace(' ', '_')}`;

    console.log(`✓ Found for ${speciesId}: ${firstResult}`);
    console.log(`  URL: ${imageUrl}`);
    console.log(`  Page: ${filePage}\n`);

    return { url: imageUrl, filePage };
  } catch (error) {
    console.error(`Error searching for ${speciesId}:`, error.message);
    return null;
  }
}

async function findAllMissing() {
  console.log('Searching for missing species images...\n');

  for (const [speciesId, searchTerm] of Object.entries(searchTerms)) {
    console.log(`Searching for ${speciesId} (${searchTerm})...`);
    const result = await searchWikimediaImage(speciesId, searchTerm);

    if (result) {
      // Update the species-images.json
      speciesImages.images[speciesId].url = result.url;
      speciesImages.images[speciesId].filePage = result.filePage;
    }

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Write updated file
  fs.writeFileSync(speciesImagesPath, JSON.stringify(speciesImages, null, 2));
  console.log('\n✓ Updated species-images.json with found images');
}

findAllMissing();
