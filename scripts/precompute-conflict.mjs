#!/usr/bin/env node
// Pre-compute, for every species in biodiversitySpecies.js, which of its English
// hand-curated sites fall inside any SSSI polygon. The runtime check is too
// slow (78 × ~10 sites × 9,663 polygons = ~7.5M booleanPointInPolygon calls)
// so we do it once here and bake the answer into the bundle.
//
// Output: src/data/conflict-precomputed.json
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { feature as topoFeature } from 'topojson-client';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// We can't import the .js species file directly here without ESM gymnastics
// involving the project's bundler. Re-export it from a sibling helper instead.
const { SPECIES } = await import(pathToFileURL(resolve(root, 'src/data/biodiversitySpecies.js')).href);
const sssiTopo = JSON.parse(readFileSync(resolve(root, 'src/data/sssi-england.topo.json'), 'utf8'));

// England plus its inshore waters, [lng, lat]. Follows the Wales border (Severn and Dee
// estuaries) and the Scotland border (Solway to Tweed). Irish Sea and Bristol Channel edges run
// down the midline, so Welsh, Scottish, Manx and Irish sites are excluded. A bounding box here
// used to pull in Wales, southern Scotland, Northern Ireland, Dublin and Wexford.
const ENGLAND = {
  type: 'Polygon',
  coordinates: [[
    [-2.03, 55.81], [-1.0, 55.95], [2.6, 53.2], [2.6, 51.0], [1.6, 50.6], [-1.5, 50.3], [-6.6, 49.7], [-6.6, 50.6],
    [-5.5, 51.2], [-4.5, 51.33], [-3.6, 51.37], [-3.1, 51.42], [-2.85, 51.53], [-2.66, 51.62],
    [-2.72, 51.81], [-2.95, 51.95], [-3.13, 52.07], [-3.08, 52.2], [-3.05, 52.34], [-3.12, 52.55], [-3.0, 52.72],
    [-3.13, 52.86], [-2.95, 52.95], [-2.72, 52.97], [-2.92, 53.1], [-2.93, 53.17], [-3.05, 53.25], [-3.2, 53.35],
    [-3.28, 53.45], [-3.9, 53.6], [-3.9, 54.3], [-3.75, 54.75], [-3.6, 54.86], [-3.4, 54.93], [-3.1, 54.98],
    [-3.06, 54.99], [-2.95, 55.04], [-2.86, 55.07], [-2.75, 55.15], [-2.6, 55.25], [-2.48, 55.35], [-2.25, 55.42],
    [-2.15, 55.48], [-2.27, 55.59], [-2.25, 55.65], [-2.16, 55.72], [-2.11, 55.77], [-2.03, 55.81],
  ]],
};
const inEngland = ([lat, lng]) => booleanPointInPolygon(turfPoint([lng, lat]), ENGLAND);

const layerName = Object.keys(sssiTopo.objects)[0];
const sssiGeo = topoFeature(sssiTopo, sssiTopo.objects[layerName]);
console.log(`Loaded ${sssiGeo.features.length} SSSI polygons`);

// Pre-compute per-feature bbox to short-circuit booleanPointInPolygon for far-away polygons.
function computeBbox(geom) {
  if (!geom || !geom.coordinates) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < minX) minX = x; if (y < minY) minY = y;
      if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    } else {
      coords.forEach(visit);
    }
  };
  visit(geom.coordinates);
  return [minX, minY, maxX, maxY];
}
const featureBboxes = sssiGeo.features.map(f => computeBbox(f.geometry));

const result = {};
let speciesProcessed = 0;
const t0 = Date.now();
for (const s of SPECIES) {
  const englishSites = s.latlng.filter(inEngland);
  if (englishSites.length === 0) continue;
  let inside = 0;
  const sites = englishSites.map(([lat, lng]) => {
    const pt = turfPoint([lng, lat]);
    let insideSSSI = false;
    for (let i = 0; i < sssiGeo.features.length; i++) {
      const bbox = featureBboxes[i];
      if (!bbox) continue;
      const [minX, minY, maxX, maxY] = bbox;
      if (lng < minX || lng > maxX || lat < minY || lat > maxY) continue;
      if (booleanPointInPolygon(pt, sssiGeo.features[i])) { insideSSSI = true; break; }
    }
    if (insideSSSI) inside++;
    return { lat, lng, insideSSSI };
  });
  result[s.id] = { sites, inside, total: englishSites.length };
  speciesProcessed++;
}
console.log(`Processed ${speciesProcessed} species in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

const outPath = resolve(root, 'src/data/conflict-precomputed.json');
writeFileSync(outPath, JSON.stringify(result));
console.log(`Wrote ${outPath}`);
