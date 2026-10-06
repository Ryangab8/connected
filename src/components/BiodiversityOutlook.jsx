import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SPECIES, POP_STATS, THREAT_COLOR, THREAT_LABEL, THREAT_ORDER, BADGE_CLS,
  STATUS_CONFIG, GROUP_CONFIG
} from '../data/biodiversitySpecies';
import { groupSVG, STATUS_SIZE } from '../utils/markerShapes';

const GROUP_GLABELS = {
  critical:  'Critical — at risk of extinction',
  severe:    'Severe decline',
  declining: 'Significant decline',
  recovering:'Recovering but vulnerable',
};

function buildPopupHtml(s, col, secondaryLabel) {
  const cause = s.cause.split(';')[0].trim();
  const groupLabel = s.group.charAt(0).toUpperCase() + s.group.slice(1);
  const tag2 = secondaryLabel || groupLabel;
  return `
    <div class="bo-pi">
      <div class="bo-ptitle">${s.icon} ${s.name}</div>
      <div class="bo-platin">${s.latin}</div>
      <div class="bo-ptags">
        <span class="bo-ptag" style="background:${col}18;color:${col}">${THREAT_LABEL[s.status]}</span>
        <span class="bo-ptag" style="background:#f0ede6;color:#6b7a68">${tag2}</span>
      </div>
      <div class="bo-pdesc">${s.desc}</div>
      <div class="bo-pstat">
        📉 <strong>${s.decline}</strong><br>
        ⚠ ${cause}<br>
        🔒 ${s.protection}
      </div>
    </div>`;
}

export default function BiodiversityOutlook() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const primaryMarkersRef = useRef([]);
  const expandedMarkersRef = useRef([]);

  const [activeStatus, setActiveStatus] = useState('all');
  const [activeGroup, setActiveGroup] = useState('all');
  const [activeId, setActiveId] = useState(null);

  // Filtered species, sorted by threat severity then name
  const filtered = useMemo(() => {
    return SPECIES
      .filter(s => (activeStatus === 'all' || s.status === activeStatus)
                && (activeGroup === 'all' || s.group === activeGroup))
      .sort((a, b) => THREAT_ORDER[a.status] - THREAT_ORDER[b.status] || a.name.localeCompare(b.name));
  }, [activeStatus, activeGroup]);

  const grouped = useMemo(() => {
    const buckets = { critical: [], severe: [], declining: [], recovering: [] };
    filtered.forEach(s => buckets[s.status].push(s));
    return buckets;
  }, [filtered]);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const m = L.map(mapEl.current, { zoomControl: false }).setView([54.5, -4.8], 6);
    L.control.zoom({ position: 'topright' }).addTo(m);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors',
      maxZoom: 16, updateWhenZooming: false, keepBuffer: 4,
    }).addTo(m);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16, updateWhenZooming: false, keepBuffer: 4,
    }).addTo(m);
    mapRef.current = m;
    return () => { m.remove(); mapRef.current = null; };
  }, []);

  // Rebuild primary markers when filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    primaryMarkersRef.current.forEach(mk => map.removeLayer(mk));
    primaryMarkersRef.current = [];
    expandedMarkersRef.current.forEach(mk => map.removeLayer(mk));
    expandedMarkersRef.current = [];

    filtered.forEach(s => {
      const col = THREAT_COLOR[s.status];
      const sz = STATUS_SIZE[s.status];
      const ll = s.latlng[0];
      if (!ll) return;
      const siteCount = s.latlng.length;
      const icon = L.divIcon({
        className: '',
        html: `<div class="bo-marker">${groupSVG(s.group, sz, col)}</div>`,
        iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
      });
      const mk = L.marker(ll, { icon }).addTo(map);
      const sitesNote = siteCount > 1
        ? `<div style="font-size:10px;color:#aaa;margin-top:4px">📍 ${siteCount} known sites — click to see all</div>`
        : '';
      mk.bindPopup(buildPopupHtml(s, col) + (sitesNote ? `<div class="bo-extra">${sitesNote}</div>` : ''), { maxWidth: 280 });
      mk.on('click', () => setActiveId(prev => prev === s.id ? null : s.id));
      primaryMarkersRef.current.push(mk);
    });
  }, [filtered]);

  // When a species is selected, expand its sites + fly the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    expandedMarkersRef.current.forEach(mk => map.removeLayer(mk));
    expandedMarkersRef.current = [];
    if (!activeId) return;

    const s = SPECIES.find(x => x.id === activeId);
    if (!s || !s.latlng.length) return;

    const col = THREAT_COLOR[s.status];
    const sz = STATUS_SIZE[s.status];

    if (s.latlng.length === 1) {
      map.setView(s.latlng[0], 7, { animate: true, duration: 0.8 });
    } else {
      const bounds = L.latLngBounds(s.latlng);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8, animate: true, duration: 0.8 });
    }

    s.latlng.forEach((ll, i) => {
      const isFirst = i === 0;
      const secSz = Math.round(sz * 0.78);
      const ringHtml = isFirst
        ? `<div class="bo-pulse" style="--ring:${col}"></div>`
        : '';
      const icon = L.divIcon({
        className: '',
        html: `<div class="bo-marker bo-marker-relative">${ringHtml}${groupSVG(s.group, isFirst ? sz : secSz, col)}</div>`,
        iconSize: [isFirst ? sz : secSz, isFirst ? sz : secSz],
        iconAnchor: [(isFirst ? sz : secSz) / 2, (isFirst ? sz : secSz) / 2],
      });
      const mk = L.marker(ll, { icon }).addTo(map);
      const locLabel = i === 0 ? 'Primary site' : `Site ${i + 1} of ${s.latlng.length}`;
      mk.bindPopup(buildPopupHtml(s, col, locLabel), { maxWidth: 280 });
      mk.on('click', () => setActiveId(prev => prev === s.id ? null : s.id));
      expandedMarkersRef.current.push(mk);
    });

    const t = setTimeout(() => {
      expandedMarkersRef.current[0]?.openPopup();
    }, 850);
    return () => clearTimeout(t);
  }, [activeId]);

  const activeSpecies = activeId ? SPECIES.find(s => s.id === activeId) : null;

  return (
    <div className="bo-app">
      <Styles />
      <div className="bo-sidebar">
        <div className="bo-sb-header">
          <div className="bo-sb-title">Protected & Endangered Species</div>
          <div className="bo-sb-desc">All species shown are legally protected or on the UK Red List. Filter by threat status or taxonomic group. Click any species to fly to it on the map.</div>
        </div>

        <div className="bo-filters">
          <div className="bo-filter-row">
            <div className="bo-flabel">Threat status</div>
            {STATUS_CONFIG.map(cfg => (
              <Pill key={cfg.v} cfg={cfg} active={activeStatus === cfg.v} onClick={() => setActiveStatus(cfg.v)} />
            ))}
          </div>
          <div className="bo-filter-row">
            <div className="bo-flabel">Group</div>
            {GROUP_CONFIG.map(cfg => (
              <Pill key={cfg.v} cfg={cfg} active={activeGroup === cfg.v} onClick={() => setActiveGroup(cfg.v)} />
            ))}
          </div>
        </div>

        <div className="bo-slist">
          {Object.entries(grouped).map(([st, sps]) => sps.length > 0 && (
            <React.Fragment key={st}>
              <div className="bo-glabel">{GROUP_GLABELS[st]}</div>
              {sps.map(s => (
                <div
                  key={s.id}
                  className={`bo-scard ${activeId === s.id ? 'bo-scard-active' : ''}`}
                  onClick={() => setActiveId(prev => prev === s.id ? null : s.id)}
                >
                  <div className="bo-sicon">{s.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bo-sname">{s.name}</div>
                    <div className="bo-slatin">{s.latin}</div>
                  </div>
                  <div className={`bo-tbadge bo-${BADGE_CLS[s.status]}`}>{THREAT_LABEL[s.status]}</div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <DetailPanel species={activeSpecies} />
      </div>

      <div className="bo-map-wrap">
        <div ref={mapEl} className="bo-map" />
        <div className="bo-map-count">
          <div className="bo-mc-num">{filtered.length}</div>
          <div className="bo-mc-label">species shown</div>
        </div>
        <Legend />
      </div>
    </div>
  );
}

function Pill({ cfg, active, onClick }) {
  const cls = active
    ? (cfg.v === 'all' ? 'bo-pill bo-pill-active-all' : 'bo-pill bo-pill-active')
    : 'bo-pill';
  return (
    <div className={cls} style={{ ...parseInlineStyle(cfg.style), ...(active && cfg.v !== 'all' ? { borderColor: 'currentColor', background: 'white' } : {}) }} onClick={onClick}>
      {cfg.label}
    </div>
  );
}

function parseInlineStyle(str) {
  if (!str) return {};
  const out = {};
  str.split(';').forEach(rule => {
    const [k, v] = rule.split(':').map(s => s && s.trim());
    if (!k || !v) return;
    const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  });
  return out;
}

function DetailPanel({ species }) {
  if (!species) {
    return (
      <div className="bo-detail">
        <div style={{ color: '#ccc', fontStyle: 'italic', fontSize: 12, lineHeight: 1.5 }}>
          Select a species from the list<br />to view full details
        </div>
      </div>
    );
  }
  const s = species;
  const pct = { critical: 92, severe: 65, declining: 45, recovering: 25 }[s.status];
  const col = THREAT_COLOR[s.status];
  const siteCount = s.latlng.length;
  const pop = POP_STATS[s.id];
  return (
    <div className="bo-detail">
      <div className="bo-dname">{s.icon} {s.name}</div>
      <div className="bo-dtype">{s.latin} · {s.group.charAt(0).toUpperCase() + s.group.slice(1)}</div>
      <div className="bo-ddesc">{s.desc}</div>
      {pop && (
        <>
          <div className="bo-dpop-title">Population facts</div>
          <div className="bo-dpop-grid">
            {pop.map((p, i) => (
              <div key={i} className="bo-dpop-card">
                <div className="bo-dpop-val" style={{ color: col }} dangerouslySetInnerHTML={{ __html: p.val }} />
                <div className="bo-dpop-label">{p.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="bo-dbar-labels">
        <span>Decline severity</span>
        <span style={{ color: col, fontWeight: 500 }}>{s.decline}</span>
      </div>
      <div className="bo-dbar-track">
        <div className="bo-dbar-fill" style={{ width: `${pct}%`, background: col }} />
      </div>
      <div className="bo-dcause">⚠ {s.cause}</div>
      <div className="bo-dprot">🔒 {s.protection}</div>
      {siteCount > 1 && (
        <div style={{ fontSize: 10, color: col, marginTop: 5, fontWeight: 500 }}>
          📍 {siteCount} known sites — click to expand all on map
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="bo-map-legend">
      <div className="bo-leg-title">Colour = threat status</div>
      {[
        ['#b83a2a','Critical'],
        ['#c8760a','Severe'],
        ['#5c3d7a','Declining'],
        ['#4a7c2a','Recovering'],
      ].map(([col, lab]) => (
        <div className="bo-leg-row" key={lab}>
          <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="6" fill={col} stroke="white" strokeWidth="1.5" />
          </svg>
          {lab}
        </div>
      ))}
      <div className="bo-leg-divider">Shape = group</div>
      <div className="bo-leg-row">
        <svg width="14" height="14"><polygon points="7,1 13.3,5.1 10.9,12.4 3.1,12.4 0.7,5.1" fill="#6b7a68" stroke="white" strokeWidth="1.5"/></svg> Bird — pentagon
      </div>
      <div className="bo-leg-row">
        <svg width="14" height="14"><polygon points="7,1 13,7 7,13 1,7" fill="#6b7a68" stroke="white" strokeWidth="1.5"/></svg> Mammal — diamond
      </div>
      <div className="bo-leg-row">
        <svg width="14" height="14"><polygon points="7,1 13,10 1,10" fill="#6b7a68" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg> Fish — triangle
      </div>
      <div className="bo-leg-row">
        <svg width="14" height="14"><polygon points="7,1.5 12.5,4.5 12.5,9.5 7,12.5 1.5,9.5 1.5,4.5" fill="#6b7a68" stroke="white" strokeWidth="1.5"/></svg> Invertebrate — hexagon
      </div>
      <div className="bo-leg-row">
        <svg width="14" height="14"><polygon points="7,1.5 9.2,5 12.5,7 9.2,9 7,12.5 4.8,9 1.5,7 4.8,5" fill="#6b7a68" stroke="white" strokeWidth="1.5"/></svg> Amphibian — 4-point star
      </div>
      <div className="bo-leg-row">
        <svg width="14" height="14"><rect x="2" y="2" width="10" height="10" rx="2" fill="#6b7a68" stroke="white" strokeWidth="1.5"/></svg> Plant — square
      </div>
      <div className="bo-leg-foot">Larger shape = more critical</div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      :root { --bo-cream:#f5f2ec;--bo-dark:#1a2318;--bo-green-deep:#2d5016;--bo-green-mid:#4a7c2a;
        --bo-amber:#c8760a;--bo-red:#b83a2a;--bo-purple:#5c3d7a;--bo-teal:#1e6b6b;--bo-blue:#1e4d8c;
        --bo-panel:rgba(245,242,236,0.98); }
      .bo-app { position:fixed;top:70px;left:0;right:0;bottom:0;display:flex;
        font-family:'DM Sans',sans-serif;color:var(--bo-dark);background:var(--bo-cream);overflow:hidden; }
      .bo-sidebar { width:320px;flex-shrink:0;background:var(--bo-panel);border-right:1px solid rgba(26,35,24,0.09);
        display:flex;flex-direction:column;overflow:hidden; }
      .bo-sb-header { padding:18px 20px 12px;border-bottom:1px solid rgba(26,35,24,0.07); }
      .bo-sb-title { font-family:'Playfair Display',serif;font-size:16px;color:var(--bo-green-deep);margin-bottom:5px; }
      .bo-sb-desc { font-size:11px;color:#6b7a68;line-height:1.55; }
      .bo-filters { padding:12px 20px;border-bottom:1px solid rgba(26,35,24,0.07); }
      .bo-filter-row { display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px; }
      .bo-filter-row:last-child { margin-bottom:0; }
      .bo-flabel { font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#bbb;width:100%;margin-bottom:3px; }
      .bo-pill { padding:4px 10px;border-radius:16px;font-size:11px;font-weight:500;cursor:pointer;
        border:1.5px solid transparent;background:white;transition:all .18s;color:#888; }
      .bo-pill-active-all { background:var(--bo-dark)!important;color:white!important;border-color:var(--bo-dark)!important; }
      .bo-pill-active { border-color:currentColor;background:white; }
      .bo-slist { flex:1;overflow-y:auto;padding:10px 14px; }
      .bo-slist::-webkit-scrollbar { width:3px; }
      .bo-slist::-webkit-scrollbar-thumb { background:rgba(26,35,24,.12);border-radius:3px; }
      .bo-glabel { font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#ccc;padding:6px 6px 2px;margin-top:4px; }
      .bo-scard { display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;cursor:pointer;
        border:1px solid transparent;margin-bottom:3px;background:white;transition:all .16s; animation:bo-fi .3s ease forwards; }
      .bo-scard:hover { border-color:rgba(26,35,24,.1);transform:translateX(2px); }
      .bo-scard-active { border-color:var(--bo-green-mid)!important;background:rgba(74,124,42,.05)!important; }
      .bo-sicon { width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;
        font-size:15px;flex-shrink:0;background:rgba(26,35,24,0.04); }
      .bo-sname { font-size:12px;font-weight:500;color:var(--bo-dark); }
      .bo-slatin { font-size:10px;color:#bbb;font-style:italic; }
      .bo-tbadge { font-size:9px;font-weight:600;padding:2px 6px;border-radius:5px;text-transform:uppercase;flex-shrink:0;letter-spacing:.03em; }
      .bo-tc { background:#fde8e6;color:var(--bo-red); }
      .bo-ts { background:#fef3e2;color:var(--bo-amber); }
      .bo-td { background:#ece8f5;color:var(--bo-purple); }
      .bo-tr { background:#e6f4e6;color:var(--bo-green-mid); }

      .bo-detail { padding:14px 18px;border-top:1px solid rgba(26,35,24,.07);background:white;min-height:100px;max-height:340px;overflow-y:auto; }
      .bo-dname { font-family:'Playfair Display',serif;font-size:14px;color:var(--bo-dark);margin-bottom:2px; }
      .bo-dtype { font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#bbb;margin-bottom:5px; }
      .bo-ddesc { font-size:11px;color:#5a6a56;line-height:1.6;margin-bottom:7px; }
      .bo-dbar-labels { display:flex;justify-content:space-between;font-size:10px;color:#bbb;margin-bottom:3px; }
      .bo-dbar-track { height:3px;background:rgba(26,35,24,.07);border-radius:2px; }
      .bo-dbar-fill { height:3px;border-radius:2px;transition:width .5s ease; }
      .bo-dcause { font-size:10px;color:#aaa;margin-top:5px;line-height:1.4; }
      .bo-dprot { font-size:10px;color:var(--bo-green-mid);margin-top:4px;font-weight:500; }
      .bo-dpop-title { font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#ccc;margin:10px 0 6px; }
      .bo-dpop-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:10px; }
      .bo-dpop-card { background:rgba(26,35,24,.04);border-radius:7px;padding:7px 8px;border:1px solid rgba(26,35,24,.07); }
      .bo-dpop-val { font-size:14px;font-weight:600;font-family:'Playfair Display',serif;line-height:1.1;margin-bottom:2px; }
      .bo-dpop-label { font-size:9px;color:#8a9a86;line-height:1.3; }

      .bo-map-wrap { flex:1;position:relative; }
      .bo-map { width:100%;height:100%; }
      .bo-map-legend { position:absolute;bottom:20px;right:14px;z-index:800;background:var(--bo-panel);
        border-radius:9px;padding:11px 13px;border:1px solid rgba(26,35,24,.09);font-size:11px;
        box-shadow:0 3px 12px rgba(0,0,0,.07);max-height:calc(100% - 40px);overflow-y:auto; }
      .bo-leg-title { font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#bbb;margin-bottom:7px; }
      .bo-leg-row { display:flex;align-items:center;gap:7px;margin-bottom:5px;color:#5a6a56;font-size:11px; }
      .bo-leg-divider { margin:8px 0 6px;padding-top:8px;border-top:1px solid rgba(26,35,24,.08);
        font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#bbb; }
      .bo-leg-foot { margin-top:8px;padding-top:8px;border-top:1px solid rgba(26,35,24,.08);font-size:10px;color:#bbb; }
      .bo-map-count { position:absolute;top:14px;left:14px;z-index:800;background:var(--bo-panel);
        border-radius:9px;padding:9px 14px;border:1px solid rgba(26,35,24,.09);font-size:11px;
        box-shadow:0 3px 12px rgba(0,0,0,.07); }
      .bo-mc-num { font-family:'Playfair Display',serif;font-size:22px;color:var(--bo-green-deep);line-height:1; }
      .bo-mc-label { font-size:10px;color:#aaa;margin-top:1px; }

      .bo-marker { transition:transform .18s;transform-origin:center; }
      .bo-marker:hover { transform:scale(1.4); }
      .bo-marker-relative { position:relative; }
      .bo-pulse { position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--ring);opacity:.4;
        animation:bo-pulse 1.6s ease-out infinite;pointer-events:none; }

      @keyframes bo-fi { from { opacity:0;transform:translateY(3px); } to { opacity:1; } }
      @keyframes bo-pulse { 0% { transform:scale(1);opacity:.5; } 70% { transform:scale(2.2);opacity:0; } 100% { transform:scale(2.2);opacity:0; } }

      /* Leaflet popup styling — scoped via classnames in popup HTML */
      .leaflet-popup-content-wrapper { background:var(--bo-panel);border-radius:11px;
        box-shadow:0 6px 24px rgba(0,0,0,.12);border:1px solid rgba(26,35,24,.09);
        font-family:'DM Sans',sans-serif;padding:0; }
      .leaflet-popup-content { margin:0; }
      .leaflet-popup-tip { background:var(--bo-panel); }
      .bo-pi { padding:13px 16px; }
      .bo-ptitle { font-family:'Playfair Display',serif;font-size:15px;color:var(--bo-dark);margin-bottom:2px; }
      .bo-platin { font-size:10px;color:#bbb;font-style:italic;margin-bottom:8px; }
      .bo-ptags { display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px; }
      .bo-ptag { font-size:10px;padding:2px 8px;border-radius:8px; }
      .bo-pdesc { font-size:11px;color:#5a6a56;line-height:1.55; }
      .bo-pstat { font-size:10px;color:#aaa;margin-top:8px;padding-top:7px;border-top:1px solid rgba(26,35,24,.07);line-height:1.5; }
      .bo-pstat strong { color:var(--bo-dark); }
      .bo-extra { padding:0 16px 13px; }
    `}</style>
  );
}
