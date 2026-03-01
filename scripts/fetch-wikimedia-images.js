import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const speciesImagesPath = path.join(__dirname, '../data/species-images.json');
const speciesImages = JSON.parse(fs.readFileSync(speciesImagesPath, 'utf8'));

async function getWorkingImageUrl(filePage) {
  // Extract filename from filePage URL
  // e.g., "https://commons.wikimedia.org/wiki/File:Quercus_robur.jpg" -> "Quercus_robur.jpg"
  const filename = filePage.split('File:')[1];

  // Use Wikimedia API to get image info
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json&origin=*`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === '-1') {
      console.error(`File not found: ${filename}`);
      return null;
    }

    const imageUrl = pages[pageId].imageinfo[0].url;
    console.log(`✓ ${filename} -> ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error.message);
    return null;
  }
}

async function updateAllImages() {
  console.log('Fetching working image URLs from Wikimedia Commons...\n');

  for (const [speciesId, imageData] of Object.entries(speciesImages.images)) {
    console.log(`Fetching ${speciesId}...`);
    const workingUrl = await getWorkingImageUrl(imageData.filePage);

    if (workingUrl) {
      imageData.url = workingUrl;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Write updated file
  fs.writeFileSync(speciesImagesPath, JSON.stringify(speciesImages, null, 2));
  console.log('\n✓ Updated species-images.json with working URLs');
}

updateAllImages();
