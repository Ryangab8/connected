// Extracts the UK and Ireland coastlines from Natural Earth (world-atlas, 1:50m)
// into a small GeoJSON used to draw the map on LinkedIn post cards.
// Run once: node scripts/build-outline.mjs
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const world = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
const countries = feature(world, world.objects.countries);

// ISO 3166 numeric: 826 = United Kingdom, 372 = Ireland
const KEEP = new Set(['826', '372']);
const round = n => Math.round(n * 1000) / 1000;

const features = countries.features
  .filter(f => KEEP.has(String(f.id)))
  .map(f => {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const coordinates = polys.map(poly => poly.map(ring => ring.map(([x, y]) => [round(x), round(y)])));
    return { type: 'Feature', properties: { name: f.properties.name }, geometry: { type: 'MultiPolygon', coordinates } };
  });

writeFileSync('src/data/uk-ireland-outline.json', JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`Wrote ${features.length} countries`);
