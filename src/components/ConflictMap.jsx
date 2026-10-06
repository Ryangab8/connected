import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { feature as topoFeature } from 'topojson-client';
import { SPECIES, THREAT_COLOR } from '../data/biodiversitySpecies';
import sssiTopo from '../data/sssi-england.topo.json';
import SPECIES_CONFLICT from '../data/conflict-precomputed.json';

// SPECIES_CONFLICT is precomputed by scripts/precompute-conflict.mjs:
// for every species in England, every hand-curated site is tested against
// 9,663 SSSI polygons and marked insideSSSI true/false. Doing it offline keeps
// the runtime fast (and the bundle small — just counts, not turf).

// Convert TopoJSON to GeoJSON once for rendering. The first key inside
// `objects` is the layer name.
const sssiGeo = (() => {
  const layerName = Object.keys(sssiTopo.objects)[0];
  return topoFeature(sssiTopo, sssiTopo.objects[layerName]);
})();

const PROTECTED_COLOR = '#4a7c2a';
const UNPROTECTED_COLOR = '#b83a2a';

export default function ConflictMap() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const sssiLayerRef = useRef(null);
  const cromeLayerRef = useRef(null);
  const dotLayerRef = useRef(null);

  const [activeSpeciesId, setActiveSpeciesId] = useState(null);
  const [showCROME, setShowCROME] = useState(false);
  const [showSSSI, setShowSSSI] = useState(true);

  // Species with at least one English site
  const englandSpecies = useMemo(
    () => SPECIES.filter(s => SPECIES_CONFLICT[s.id]).sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  // Headline numbers across all priority species
  const overall = useMemo(() => {
    let inside = 0, total = 0;
    for (const id of Object.keys(SPECIES_CONFLICT)) {
      inside += SPECIES_CONFLICT[id].inside;
      total += SPECIES_CONFLICT[id].total;
    }
    return { inside, total, outsidePct: total ? Math.round(((total - inside) / total) * 100) : 0 };
  }, []);

  // Init map
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const m = L.map(mapEl.current, { zoomControl: false }).setView([52.5, -1.5], 6);
    L.control.zoom({ position: 'topright' }).addTo(m);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors',
      maxZoom: 16, updateWhenZooming: false, keepBuffer: 4,
    }).addTo(m);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16, updateWhenZooming: false, keepBuffer: 4,
    }).addTo(m);
    mapRef.current = m;

    // SSSI layer (always built; visibility toggled separately)
    sssiLayerRef.current = L.geoJSON(sssiGeo, {
      style: {
        color: PROTECTED_COLOR,
        weight: 0.4,
        fillColor: PROTECTED_COLOR,
        fillOpacity: 0.18,
      },
      interactive: false,
    });
    if (showSSSI) sssiLayerRef.current.addTo(m);

    return () => { m.remove(); mapRef.current = null; };
  }, []);

  // Toggle SSSI visibility
  useEffect(() => {
    const map = mapRef.current;
    const layer = sssiLayerRef.current;
    if (!map || !layer) return;
    if (showSSSI) {
      if (!map.hasLayer(layer)) layer.addTo(map);
    } else {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    }
  }, [showSSSI]);

  // Toggle CROME WMS layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (showCROME && !cromeLayerRef.current) {
      cromeLayerRef.current = L.tileLayer.wms(
        'https://environment.data.gov.uk/spatialdata/crop-map-of-england-2024/wms',
        {
          layers: 'Crop_Map_of_England_2024',
          format: 'image/png',
          transparent: true,
          version: '1.3.0',
          attribution: '© Defra (RPA) / OGL v3',
          opacity: 0.55,
        },
      ).addTo(map);
    } else if (!showCROME && cromeLayerRef.current) {
      map.removeLayer(cromeLayerRef.current);
      cromeLayerRef.current = null;
    }
  }, [showCROME]);

  // Render species dots for the selected species
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (dotLayerRef.current) {
      map.removeLayer(dotLayerRef.current);
      dotLayerRef.current = null;
    }
    if (!activeSpeciesId) return;
    const conflict = SPECIES_CONFLICT[activeSpeciesId];
    if (!conflict) return;

    const group = L.layerGroup();
    conflict.sites.forEach(site => {
      const color = site.insideSSSI ? PROTECTED_COLOR : UNPROTECTED_COLOR;
      L.circleMarker([site.lat, site.lng], {
        radius: 7,
        color: '#fff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      }).bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;font-size:12px">
          <strong>${site.insideSSSI ? '✓ Inside an SSSI' : '⚠ Outside any SSSI'}</strong><br/>
          ${site.lat.toFixed(3)}, ${site.lng.toFixed(3)}
        </div>`,
      ).addTo(group);
    });
    group.addTo(map);
    dotLayerRef.current = group;

    // Fit to the species' sites
    const bounds = L.latLngBounds(conflict.sites.map(s => [s.lat, s.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 9, animate: true, duration: 0.7 });
    }
  }, [activeSpeciesId]);

  const activeSpecies = activeSpeciesId ? SPECIES.find(s => s.id === activeSpeciesId) : null;
  const activeConflict = activeSpeciesId ? SPECIES_CONFLICT[activeSpeciesId] : null;

  return (
    <div className="cm-app">
      <Styles />

      <div className="cm-sidebar">
        <div className="cm-header">
          <div className="cm-title">Conflict Map — England</div>
          <div className="cm-desc">
            Where do legally protected sites stop, and where do priority species sit on land with no protection? This MVP overlays Natural England&apos;s Sites of Special Scientific Interest with the curated site locations of {englandSpecies.length} threatened species. England only — Scotland, Wales and Northern Ireland use separate datasets.
          </div>
        </div>

        <div className="cm-headline">
          <div className="cm-stat">
            <div className="cm-stat-num">{overall.outsidePct}%</div>
            <div className="cm-stat-label">of priority-species sites in England fall <strong>outside</strong> any SSSI</div>
          </div>
          <div className="cm-stat-sub">
            ({overall.total - overall.inside} of {overall.total} sites across {englandSpecies.length} species)
          </div>
        </div>

        <div className="cm-toggles">
          <label className="cm-toggle">
            <input type="checkbox" checked={showSSSI} onChange={e => setShowSSSI(e.target.checked)} />
            <span style={{ color: PROTECTED_COLOR }}>■</span> SSSI boundaries
          </label>
          <label className="cm-toggle">
            <input type="checkbox" checked={showCROME} onChange={e => setShowCROME(e.target.checked)} />
            <span>🌾</span> Crop / land use (Defra CROME)
          </label>
          {showCROME && (
            <div className="cm-warning">
              ⚠ CROME tiles stream from Defra and can take 10–20s to load on first view. Be patient.
            </div>
          )}
        </div>

        <div className="cm-species-section">
          <div className="cm-section-title">Pick a species</div>
          <div className="cm-species-list">
            <div
              className={`cm-species-row ${!activeSpeciesId ? 'cm-species-row-active' : ''}`}
              onClick={() => setActiveSpeciesId(null)}
            >
              <div className="cm-species-name">All species (overview)</div>
              <div className="cm-species-meta">{overall.total} sites</div>
            </div>
            {englandSpecies.map(s => {
              const c = SPECIES_CONFLICT[s.id];
              const outside = c.total - c.inside;
              const outsidePct = Math.round((outside / c.total) * 100);
              return (
                <div
                  key={s.id}
                  className={`cm-species-row ${activeSpeciesId === s.id ? 'cm-species-row-active' : ''}`}
                  onClick={() => setActiveSpeciesId(s.id)}
                >
                  <div className="cm-species-icon">{s.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cm-species-name">{s.name}</div>
                    <div className="cm-species-meta">
                      {c.inside}/{c.total} inside SSSI · <strong style={{ color: outsidePct >= 50 ? UNPROTECTED_COLOR : '#888' }}>{outsidePct}% outside</strong>
                    </div>
                  </div>
                  <div className="cm-species-status" style={{ background: THREAT_COLOR[s.status] }} />
                </div>
              );
            })}
          </div>
        </div>

        {activeSpecies && (
          <div className="cm-detail">
            <div className="cm-detail-name">{activeSpecies.icon} {activeSpecies.name}</div>
            <div className="cm-detail-stat">
              <div>
                <div className="cm-detail-num" style={{ color: PROTECTED_COLOR }}>{activeConflict.inside}</div>
                <div className="cm-detail-num-label">inside SSSI</div>
              </div>
              <div>
                <div className="cm-detail-num" style={{ color: UNPROTECTED_COLOR }}>{activeConflict.total - activeConflict.inside}</div>
                <div className="cm-detail-num-label">outside</div>
              </div>
              <div>
                <div className="cm-detail-num">{activeConflict.total}</div>
                <div className="cm-detail-num-label">total English sites</div>
              </div>
            </div>
            <div className="cm-detail-cause">⚠ {activeSpecies.cause.split(';')[0].trim()}</div>
          </div>
        )}
      </div>

      <div className="cm-map-wrap">
        <div ref={mapEl} className="cm-map" />
        <div className="cm-legend">
          <div className="cm-legend-title">Map key</div>
          <div className="cm-legend-row">
            <span className="cm-legend-poly" style={{ background: PROTECTED_COLOR }} /> SSSI (legally protected)
          </div>
          <div className="cm-legend-row">
            <span className="cm-legend-dot" style={{ background: PROTECTED_COLOR }} /> Site inside SSSI
          </div>
          <div className="cm-legend-row">
            <span className="cm-legend-dot" style={{ background: UNPROTECTED_COLOR }} /> Site outside any SSSI
          </div>
          <div className="cm-legend-foot">
            Sites: hand-curated headline locations from the Biodiversity Outlook dataset, not full GBIF distributions.
          </div>
        </div>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      :root { --cm-cream:#f5f2ec;--cm-dark:#1a2318;--cm-green-deep:#2d5016;--cm-green-mid:#4a7c2a;
        --cm-amber:#c8760a;--cm-red:#b83a2a;--cm-panel:rgba(245,242,236,0.98); }
      .cm-app { position:fixed;top:70px;left:0;right:0;bottom:0;display:flex;
        font-family:'DM Sans',sans-serif;color:var(--cm-dark);background:var(--cm-cream);overflow:hidden; }
      .cm-sidebar { width:340px;flex-shrink:0;background:var(--cm-panel);
        border-right:1px solid rgba(26,35,24,0.09);display:flex;flex-direction:column;overflow:hidden; }
      .cm-header { padding:18px 20px 14px;border-bottom:1px solid rgba(26,35,24,.07); }
      .cm-title { font-family:'Playfair Display',serif;font-size:17px;color:var(--cm-green-deep);margin-bottom:6px; }
      .cm-desc { font-size:11px;color:#6b7a68;line-height:1.55; }
      .cm-headline { padding:14px 20px;border-bottom:1px solid rgba(26,35,24,.07);
        background:linear-gradient(180deg,rgba(184,58,42,.06),rgba(184,58,42,0)); }
      .cm-stat { display:flex;align-items:baseline;gap:10px;margin-bottom:4px; }
      .cm-stat-num { font-family:'Playfair Display',serif;font-size:34px;color:var(--cm-red);line-height:1;font-weight:600; }
      .cm-stat-label { font-size:11px;color:#5a6a56;line-height:1.5; }
      .cm-stat-sub { font-size:10px;color:#999;font-style:italic; }

      .cm-toggles { padding:12px 20px;border-bottom:1px solid rgba(26,35,24,.07);
        display:flex;flex-direction:column;gap:6px; }
      .cm-toggle { font-size:12px;color:#5a6a56;display:flex;align-items:center;gap:8px;cursor:pointer;
        line-height:1.4; }
      .cm-toggle input { cursor:pointer; }
      .cm-warning { font-size:10px;color:var(--cm-amber);background:#fef3e2;padding:6px 10px;
        border-radius:6px;border-left:3px solid var(--cm-amber);line-height:1.4; }

      .cm-species-section { flex:1;overflow:hidden;display:flex;flex-direction:column;padding:10px 14px 4px; }
      .cm-section-title { font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#bbb;
        margin:4px 6px 8px; }
      .cm-species-list { flex:1;overflow-y:auto; }
      .cm-species-list::-webkit-scrollbar { width:3px; }
      .cm-species-list::-webkit-scrollbar-thumb { background:rgba(26,35,24,.1);border-radius:3px; }
      .cm-species-row { display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;
        cursor:pointer;border:1px solid transparent;margin-bottom:3px;background:white;transition:all .14s; }
      .cm-species-row:hover { border-color:rgba(26,35,24,.12); }
      .cm-species-row-active { border-color:var(--cm-green-mid);background:rgba(74,124,42,.05); }
      .cm-species-icon { width:26px;height:26px;border-radius:6px;display:flex;align-items:center;
        justify-content:center;font-size:14px;background:rgba(26,35,24,.04);flex-shrink:0; }
      .cm-species-name { font-size:12px;font-weight:500;color:var(--cm-dark); }
      .cm-species-meta { font-size:10px;color:#888;margin-top:1px; }
      .cm-species-status { width:6px;height:6px;border-radius:50%;flex-shrink:0; }

      .cm-detail { padding:14px 18px;border-top:1px solid rgba(26,35,24,.07);background:white; }
      .cm-detail-name { font-family:'Playfair Display',serif;font-size:14px;color:var(--cm-dark);margin-bottom:8px; }
      .cm-detail-stat { display:flex;gap:8px;margin-bottom:8px; }
      .cm-detail-stat > div { flex:1;background:rgba(26,35,24,.04);padding:7px 8px;border-radius:7px; }
      .cm-detail-num { font-family:'Playfair Display',serif;font-size:18px;font-weight:600;line-height:1; }
      .cm-detail-num-label { font-size:9px;color:#888;margin-top:3px; }
      .cm-detail-cause { font-size:10px;color:#aaa;line-height:1.4; }

      .cm-map-wrap { flex:1;position:relative; }
      .cm-map { width:100%;height:100%; }
      .cm-legend { position:absolute;bottom:18px;right:14px;z-index:800;background:var(--cm-panel);
        border-radius:9px;padding:11px 13px;border:1px solid rgba(26,35,24,.09);font-size:11px;
        box-shadow:0 3px 12px rgba(0,0,0,.07);max-width:240px; }
      .cm-legend-title { font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#bbb;margin-bottom:7px; }
      .cm-legend-row { display:flex;align-items:center;gap:8px;margin-bottom:5px;color:#5a6a56;font-size:11px; }
      .cm-legend-poly { width:14px;height:10px;border-radius:2px;display:inline-block;opacity:.5; }
      .cm-legend-dot { width:11px;height:11px;border-radius:50%;border:2px solid white;
        box-shadow:0 1px 3px rgba(0,0,0,.2);display:inline-block; }
      .cm-legend-foot { margin-top:8px;padding-top:8px;border-top:1px solid rgba(26,35,24,.08);
        font-size:10px;color:#aaa;line-height:1.4;font-style:italic; }
    `}</style>
  );
}
