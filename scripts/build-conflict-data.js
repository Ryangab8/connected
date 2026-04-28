#!/usr/bin/env node
// Rebuild the SSSI dataset bundled with the site.
// 1. Downloads the latest Sites of Special Scientific Interest (England) GeoJSON
//    from Natural England's open data portal.
// 2. Simplifies it aggressively with mapshaper and writes TopoJSON to src/data/.
// 3. Result is gzip-friendly (~600KB on the wire) and renders the full set of
//    ~9,663 SSSI polygons at low zoom without bundling the raw 326MB source.
//
// Usage: node scripts/build-conflict-data.js
// Requires: mapshaper available via `npx`.
import { execSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

const SSSI_URL = 'https://opendata.arcgis.com/api/v3/datasets/f10cbb4425154bfda349ccf493487a80_0/downloads/data?format=geojson&spatialRefId=4326';
const tmp = tmpdir();
const rawPath = resolve(tmp, 'sssi-raw.geojson');
const out = resolve('src/data/sssi-england.topo.json');

mkdirSync('src/data', { recursive: true });

if (!existsSync(rawPath)) {
  console.log('downloading SSSI GeoJSON (~326MB, this will take a minute)...');
  execSync(`curl -fsSL -o ${rawPath} "${SSSI_URL}"`, { stdio: 'inherit' });
}
console.log(`raw size: ${(statSync(rawPath).size / 1024 / 1024).toFixed(1)}MB`);

// Drop most properties, simplify polygons to 1% of original vertices.
// keep-shapes prevents tiny polygons from being culled entirely.
const cmd = `npx --yes mapshaper@0.6.96 -i ${rawPath} ` +
            `-filter-fields SSSI_NAME ` +
            `-simplify 1% visvalingam weighted keep-shapes ` +
            `-o ${out} format=topojson`;
console.log('simplifying with mapshaper...');
execSync(cmd, { stdio: 'inherit' });

console.log(`output: ${(statSync(out).size / 1024 / 1024).toFixed(1)}MB at ${out}`);
