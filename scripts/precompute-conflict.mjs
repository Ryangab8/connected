#!/usr/bin/env node
// Pre-compute, for every species in biodiversitySpecies.js, which of its English
// hand-curated sites fall inside any SSSI polygon. The runtime check is too
// slow (78 × ~10 sites × 9,663 polygons = ~7.5M booleanPointInPolygon calls)
// so we do it once here and bake the answer into the bundle.
//
// Output: src/data/conflict-precomputed.json
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { feature as topoFeature } from 'topojson-client';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// We can't import the .js species file directly here without ESM gymnastics
// involving the project's bundler. Re-export it from a sibling helper instead.
const { SPECIES } = await import(resolve(root, 'src/data/biodiversitySpecies.js'));
const sssiTopo = JSON.parse(readFileSync(resolve(root, 'src/data/sssi-england.topo.json'), 'utf8'));

const ENGLAND_BBOX = { minLat: 49.8, maxLat: 55.85, minLng: -6.5, maxLng: 1.85 };
const inEngland = ([lat, lng]) =>
  lat >= ENGLAND_BBOX.minLat && lat <= ENGLAND_BBOX.maxLat
  && lng >= ENGLAND_BBOX.minLng && lng <= ENGLAND_BBOX.maxLng;

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
