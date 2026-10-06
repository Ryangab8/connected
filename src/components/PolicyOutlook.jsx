import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart, registerables } from 'chart.js';
import {
  NATIONS, TYPE_COLOR, NATION_COLOR, YEAR_CONTEXT, CHART_LABELS, CHART_CONTEXTS,
} from '../data/policyNations';
import { SITES } from '../data/policySites';
import { ACTION_DATA } from '../data/actionData';

Chart.register(...registerables);

const YEARS = Array.from({ length: 27 }, (_, i) => 2024 + i);
const lerp = (a, b, t) => a + (b - a) * t;

function getSpeciesSeries(scenario) {
  return YEARS.map(y => {
    const t = (y - 2024) / 26;
    if (scenario === 'current') return +(48.4 - t * 14.4).toFixed(1);
    if (y <= 2028) return +(48.4 - ((y - 2024) / 4) * 1.2).toFixed(1);
    return +(lerp(43, 58, (y - 2028) / 22)).toFixed(1);
  });
}
function getCarbonSeries(scenario) {
  return YEARS.map(y => {
    const t = (y - 2024) / 26;
    return scenario === 'current' ? +(3.1 + t * 0.4).toFixed(2) : +(3.1 + t * 2.3).toFixed(2);
  });
}
function getPolicyAvgSeries(scenario) {
  const avg = NATIONS.reduce((s, n) => s + n.policyScore, 0) / NATIONS.length;
  const req = NATIONS.reduce((s, n) => s + n.required, 0) / NATIONS.length;
  return YEARS.map(y => {
    const t = (y - 2024) / 26;
    return scenario === 'current' ? +(avg + t * 10).toFixed(0) : +(lerp(avg, req, t)).toFixed(0);
  });
}

export default function PolicyOutlook() {
  const [mode, setMode] = useState('species');
  const [year, setYear] = useState(2024);
  const [actionOpen, setActionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('peatland');

  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const nationMarkersRef = useRef([]);
  const siteMarkersRef = useRef([]);
  const chartRef = useRef(null);
  const chartCanvasRef = useRef(null);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const m = L.map(mapEl.current, { zoomControl: true }).setView([55.2, -5.0], 6);
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

  // Rebuild markers when year changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    nationMarkersRef.current.forEach(mk => map.removeLayer(mk));
    siteMarkersRef.current.forEach(mk => map.removeLayer(mk));
    nationMarkersRef.current = [];
    siteMarkersRef.current = [];

    NATIONS.forEach(n => {
      const score = Math.round(lerp(n.policyScore, n.policyScore + 10, (year - 2024) / 26));
      const gap = n.required - n.policyScore;
      const ringColor = gap > 35 ? '#b83a2a' : gap > 20 ? '#c8760a' : '#4a7c2a';
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:52px;height:52px">
            <div style="position:absolute;inset:0;border-radius:50%;border:3px solid ${ringColor}40"></div>
            <div style="position:absolute;inset:4px;border-radius:50%;background:${n.color};
              display:flex;flex-direction:column;align-items:center;justify-content:center;
              color:white;font-family:'DM Sans',sans-serif;cursor:pointer;
              box-shadow:0 3px 12px rgba(0,0,0,.2)">
              <span style="font-size:13px;font-weight:600;line-height:1">${score}</span>
              <span style="font-size:8px;opacity:.8">/100</span>
            </div>
          </div>`,
        iconSize: [52, 52], iconAnchor: [26, 26],
      });
      const m = L.marker(n.center, { icon }).addTo(map);
      m.bindPopup(`
        <div class="po-pi">
          <div class="po-ptitle">${n.flag} ${n.name}</div>
          <div class="po-ptags">
            <span class="po-ptag" style="background:${n.color}18;color:${n.color}">${n.ratingLabel}</span>
          </div>
          <div class="po-prow"><span>Policy score (2024)</span><strong style="color:${n.color}">${n.policyScore}/100</strong></div>
          <div class="po-prow"><span>Required to meet targets</span><strong style="color:#4a7c2a">${n.required}/100</strong></div>
          <div class="po-prow"><span>Land protected</span><strong>${n.protectedPct}% <span style="color:#aaa">(need 30%)</span></strong></div>
          <div class="po-prow"><span>Carbon stored</span><strong>${n.carbonGt} Gt CO₂e</strong></div>
          <div class="po-ptext">${n.keyPolicies}</div>
          <div class="po-pgap">⚠ Gap: ${n.gap}</div>
        </div>`, { maxWidth: 300 });
      nationMarkersRef.current.push(m);
    });

    SITES.forEach(s => {
      const col = TYPE_COLOR[s.type] || '#888';
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="width:26px;height:26px;border-radius:7px;background:${col}15;
            border:1.5px solid ${col};display:flex;align-items:center;justify-content:center;
            font-size:12px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.1)">${s.icon}</div>`,
        iconSize: [26, 26], iconAnchor: [13, 13],
      });
      const m = L.marker([s.lat, s.lng], { icon }).addTo(map);
      const typeLabel = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      m.bindPopup(`
        <div class="po-pi">
          <div class="po-ptitle">${s.icon} ${s.name}</div>
          <div class="po-site-type" style="color:${col}">${typeLabel} · <span style="color:${NATION_COLOR[s.nation] || '#888'}">${s.nation}</span></div>
          <div class="po-ptext">${s.desc}</div>
          <div class="po-carbon-note">💚 Carbon stored: <strong>${s.carbon} Gt CO₂e</strong><br>
            <span style="font-size:10px;color:#aaa">1 Gt = 1 billion tonnes of CO₂ equivalent — roughly equal to removing all UK cars from roads for ~18 years</span>
          </div>
          ${s.projects ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(26,35,24,.08)">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#aaa;margin-bottom:5px">Active conservation projects</div>
            <div style="font-size:11px;color:#5a6a56;line-height:1.6">${s.projects}</div>
          </div>` : ''}
        </div>`, { maxWidth: 320 });
      siteMarkersRef.current.push(m);
    });
  }, [year]);

  // Build / rebuild chart when mode or year changes
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    let curr, tran;
    if (mode === 'species') { curr = getSpeciesSeries('current'); tran = getSpeciesSeries('target'); }
    else if (mode === 'carbon') { curr = getCarbonSeries('current'); tran = getCarbonSeries('target'); }
    else { curr = getPolicyAvgSeries('current'); tran = getPolicyAvgSeries('target'); }

    const yIdx = year - 2024;
    const nowLinePlugin = {
      id: 'po-nl',
      afterDatasetsDraw(c) {
        const { ctx, chartArea, scales } = c;
        const x = scales.x.getPixelForValue(yIdx);
        ctx.save();
        ctx.strokeStyle = 'rgba(26,35,24,.18)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
        ctx.font = '10px DM Sans';
        ctx.fillStyle = 'rgba(26,35,24,.4)';
        ctx.textAlign = 'center';
        ctx.fillText(year, x, chartArea.top - 4);
        ctx.restore();
      },
    };

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(chartCanvasRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: YEARS,
        datasets: [
          {
            label: 'Current trajectory', data: curr, borderColor: '#b83a2a',
            backgroundColor: 'rgba(184,58,42,0.07)', borderWidth: 2, fill: true,
            tension: 0.4, pointRadius: 0, pointHoverRadius: 4,
          },
          {
            label: 'Transformative action', data: tran, borderColor: '#4a7c2a',
            backgroundColor: 'rgba(74,124,42,0.07)', borderWidth: 2, fill: true,
            tension: 0.4, borderDash: [6, 3], pointRadius: 0, pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(245,242,236,0.97)', titleColor: '#1a2318',
            bodyColor: '#6b7a68', borderColor: 'rgba(26,35,24,.1)', borderWidth: 1,
            titleFont: { family: 'Playfair Display', size: 12 },
            bodyFont: { family: 'DM Sans', size: 11 },
          },
        },
        scales: {
          x: { ticks: { font: { family: 'DM Sans', size: 9 }, color: '#ccc', maxTicksLimit: 6 }, grid: { color: 'rgba(26,35,24,.04)' } },
          y: { ticks: { font: { family: 'DM Sans', size: 9 }, color: '#ccc' }, grid: { color: 'rgba(26,35,24,.04)' } },
        },
      },
      plugins: [nowLinePlugin],
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [mode, year]);

  // Dashboard values derived from year
  const dash = useMemo(() => {
    const t = (year - 2024) / 26;
    const abundance = +(48.4 - t * 14.4).toFixed(1);
    const abundanceTransformative = year <= 2028
      ? +(48.4 - ((year - 2024) / 4) * 1.2).toFixed(1)
      : +(lerp(43, 58, (year - 2028) / 22)).toFixed(1);
    const carbon = +(3.1 + t * 0.4).toFixed(2);
    const prot = +Math.min(8.4 + t * 3.2, 30).toFixed(1);
    return { abundance, abundanceTransformative, carbon, prot };
  }, [year]);

  const sliderPct = ((year - 2024) / 26 * 100).toFixed(1);

  return (
    <div className="po-app">
      <Styles />

      {/* "What you can do" floating button */}
      <button className="po-act-btn" onClick={() => setActionOpen(true)}>🌿 What You Can Do</button>

      {/* LEFT PANEL */}
      <div className="po-panel">
        <div className="po-ph">
          <div className="po-ph-title">Policy & Climate Outlook</div>
          <div className="po-ph-desc">How does current policy compare to what's needed? Drag the timeline to see how the gap between current trajectory and targets grows or closes to 2050.</div>
        </div>

        <div className="po-modes">
          <ModeBtn id="species" current={mode} onClick={setMode} label={<>Species<br />Abundance</>} />
          <ModeBtn id="carbon" current={mode} onClick={setMode} label={<>Carbon<br />in Nature</>} />
          <ModeBtn id="policy" current={mode} onClick={setMode} label={<>Policy<br />Delivery</>} />
        </div>

        <div className="po-year-section">
          <div className="po-year-top">
            <div>
              <div className="po-year-label">Year</div>
              <div className="po-year-display">{year}</div>
            </div>
            <div className="po-year-context">{YEAR_CONTEXT[year] || `${year} — monitoring ongoing`}</div>
          </div>
          <input
            type="range" min="2024" max="2050" value={year} step="1"
            onChange={e => setYear(parseInt(e.target.value, 10))}
            style={{ '--pct': `${sliderPct}%` }}
          />
          <div className="po-year-marks">
            <span>2024</span><span>2030</span><span>2035</span><span>2040</span><span>2045</span><span>2050</span>
          </div>
          <div className="po-milestone-tags">
            <span className="po-m-tag" style={{ color: '#5c3d7a', borderColor: '#5c3d7a20', background: '#ece8f510' }}>2030 30by30</span>
            <span className="po-m-tag" style={{ color: '#c8760a', borderColor: '#c8760a20', background: '#fef3e210' }}>2042 Env. Act</span>
            <span className="po-m-tag" style={{ color: '#b83a2a', borderColor: '#b83a2a20', background: '#fde8e610' }}>2050 Net Zero</span>
          </div>
        </div>

        <div className="po-chart-section">
          <div className="po-chart-label">{CHART_LABELS[mode]}</div>
          <div className="po-chart-context" dangerouslySetInnerHTML={{ __html: CHART_CONTEXTS[mode] }} />
          <div className="po-chart-wrap"><canvas ref={chartCanvasRef} /></div>
          <div className="po-chart-legend">
            <span><span className="po-cl-dot" style={{ background: '#b83a2a' }} />Current trajectory</span>
            <span><span className="po-cl-dot" style={{ background: '#4a7c2a' }} />Transformative action</span>
          </div>
        </div>

        <div className="po-nations-section">
          <div className="po-ns-title">Policy delivery gap — current score vs. required to meet commitments</div>
          {NATIONS.map(n => (
            <NationCard key={n.id} nation={n} year={year} onFlyTo={(c, z) => mapRef.current?.flyTo(c, z, { duration: 1.2 })} />
          ))}
        </div>
      </div>

      {/* RIGHT: DASHBOARD + MAP */}
      <div className="po-right-area">
        <div className="po-dashboard">
          <div className="po-dash-card">
            <div className="po-dc-label">Abundance index</div>
            <div className="po-dc-metric">{dash.abundance}</div>
            <div className="po-dc-sub">Baseline was 100 in 1970</div>
            <div className="po-dc-context">
              <span className="po-trend-down">↓ {Math.abs((dash.abundance - 48.4)).toFixed(1)} pts on current trajectory</span>
              <span style={{ fontSize: 10, color: '#4a7c2a', display: 'block', marginTop: 2 }}>
                Transformative action: {dash.abundanceTransformative} (+{(dash.abundanceTransformative - dash.abundance).toFixed(1)} pts)
              </span>
            </div>
          </div>
          <div className="po-dash-card">
            <div className="po-dc-label">Carbon stored in nature</div>
            <div className="po-dc-metric">{dash.carbon} Gt</div>
            <div className="po-dc-sub">Gt CO₂e stored · but UK nature is a net <em>source</em>, not sink</div>
            <div className="po-dc-context">
              {year <= 2030
                ? <span className="po-trend-down">⚠ Net source since 2019 — degraded peatlands emit ~23 Mt/yr vs forests absorbing ~17 Mt/yr</span>
                : (dash.carbon - 3.1) > 0.5
                  ? <span className="po-trend-up">↑ Peatland restoration shifting balance</span>
                  : <span className="po-trend-flat">⚠ Still net source — restoration pace too slow</span>
              }
            </div>
          </div>
          <div className="po-dash-card">
            <div className="po-dc-label">Land protected</div>
            <div className="po-dc-metric">{dash.prot}%</div>
            <div className="po-dc-sub">UK average · 30% target by 2030</div>
            <div className="po-prot-bar">
              <div className="po-prot-bar-label"><span>Now: {dash.prot}%</span><span>Target: 30%</span></div>
              <div className="po-prot-bar-track">
                <div className="po-prot-bar-fill" style={{ width: `${(dash.prot / 30) * 100}%` }} />
                <div className="po-prot-bar-target" />
              </div>
            </div>
            <div className="po-dc-context">
              {dash.prot >= 28
                ? <span className="po-trend-up">✓ Approaching 30% target</span>
                : <span className="po-trend-flat">{(30 - dash.prot).toFixed(1)}% still to protect — 2030 target at risk</span>
              }
            </div>
          </div>
          <div className="po-dash-card">
            <div className="po-dc-label">Carbon — the real picture</div>
            <div className="po-dc-metric po-dc-warning">Net source since 2019</div>
            <div className="po-dc-sub" style={{ marginTop: 4, lineHeight: 1.5 }}>
              UK woodlands absorb ~17 Mt CO₂e/yr. But <strong>degraded peatlands emit ~23 Mt CO₂e/yr</strong> — making UK land use a net carbon source. Only 22% of UK peatland is in near-natural condition. Restoring the rest is the single biggest nature-based lever for reaching net zero.
            </div>
          </div>
        </div>

        <div className="po-map-area">
          <div ref={mapEl} className="po-map" />
          <div className="po-milestone-bar">
            <div className="po-mstone"><div className="po-ms-dot" style={{ background: '#5c3d7a' }} /><span className="po-ms-year">2030</span> 30by30 & carbon milestone</div>
            <div className="po-mstone"><div className="po-ms-dot" style={{ background: '#c8760a' }} /><span className="po-ms-year">2042</span> Environment Act species target</div>
            <div className="po-mstone"><div className="po-ms-dot" style={{ background: '#b83a2a' }} /><span className="po-ms-year">2050</span> Net zero deadline</div>
          </div>
        </div>
      </div>

      {actionOpen && (
        <ActionPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => setActionOpen(false)}
        />
      )}
    </div>
  );
}

function ModeBtn({ id, current, onClick, label }) {
  return (
    <div className={`po-mode-btn ${current === id ? 'po-mode-btn-active' : ''}`} onClick={() => onClick(id)}>
      {label}
    </div>
  );
}

function NationCard({ nation: n, year, onFlyTo }) {
  const gap = n.required - n.policyScore;
  const gapColor = gap > 35 ? '#b83a2a' : gap > 20 ? '#c8760a' : '#4a7c2a';
  const ratingClass = { strong: 'po-r-strong', moderate: 'po-r-moderate', weak: 'po-r-weak' }[n.rating];
  return (
    <div className="po-ncard" onClick={() => onFlyTo(n.center, n.zoom)}>
      <div className="po-ncard-top">
        <div className="po-ndot" style={{ background: n.color }} />
        <div className="po-nname">{n.flag} {n.name}</div>
        <div className={`po-nrating ${ratingClass}`}>{n.ratingLabel}</div>
      </div>
      <div className="po-gap-row">
        <div className="po-gap-label" style={{ fontSize: 9 }}>Current</div>
        <div className="po-gap-track">
          <div className="po-gap-current" style={{ width: `${n.policyScore}%`, background: n.color }} />
          <div className="po-gap-target-mark" style={{ left: `${n.required}%` }} />
        </div>
        <div className="po-gap-val" style={{ color: n.color }}>{n.policyScore}</div>
      </div>
      <div className="po-gap-row">
        <div className="po-gap-label" style={{ fontSize: 9 }}>Required</div>
        <div className="po-gap-track">
          <div className="po-gap-current" style={{ width: `${n.required}%`, background: n.color + '40' }} />
        </div>
        <div className="po-gap-val" style={{ color: n.color + '80' }}>{n.required}</div>
      </div>
      <div className="po-gap-needed" style={{ color: gapColor }}>
        Gap: {gap} points needed · Land protected: {n.protectedPct}%
      </div>
    </div>
  );
}

function ActionPanel({ activeTab, onTabChange, onClose }) {
  const d = ACTION_DATA[activeTab];
  return (
    <div className="po-act-overlay po-act-overlay-open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="po-act-drawer">
        <div className="po-act-header">
          <div className="po-act-title">🌿 What You Can Do</div>
          <button className="po-act-close" onClick={onClose}>✕</button>
        </div>
        <div className="po-act-tabs">
          {Object.entries(ACTION_DATA).map(([key, dd]) => (
            <button
              key={key}
              className={`po-act-tab ${activeTab === key ? 'po-act-tab-active' : ''}`}
              onClick={() => onTabChange(key)}
            >
              {dd.label}
            </button>
          ))}
        </div>
        <div className="po-act-body">
          <ActionSection title="🙋 Volunteer & get involved" items={d.volunteer} color={d.color} />
          <ActionSection title="📣 Take action & campaign" items={d.actions} color="#6b7a68" tagBg="#f0ede615" />
        </div>
      </div>
    </div>
  );
}

function ActionSection({ title, items, color, tagBg }) {
  return (
    <div className="po-act-section">
      <div className="po-act-section-title">{title}</div>
      {items.map((c, i) => (
        <div className="po-act-card" key={i}>
          <div className="po-act-card-icon">{c.icon}</div>
          <div>
            <div className="po-act-tag" style={{ background: tagBg || `${color}15`, color }}>{c.tag}</div>
            <div className="po-act-card-name">{c.name}</div>
            <div className="po-act-card-desc">{c.desc}</div>
            <a className="po-act-card-link" href={c.link} target="_blank" rel="noopener noreferrer">Find out more →</a>
          </div>
        </div>
      ))}
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      :root { --po-cream:#f5f2ec;--po-dark:#1a2318;--po-green-deep:#2d5016;--po-green-mid:#4a7c2a;
        --po-amber:#c8760a;--po-red:#b83a2a;--po-purple:#5c3d7a;--po-teal:#1e6b6b;--po-blue:#1e4d8c;
        --po-panel:rgba(245,242,236,0.98); }
      .po-app { position:fixed;top:70px;left:0;right:0;bottom:0;display:flex;
        font-family:'DM Sans',sans-serif;color:var(--po-dark);background:var(--po-cream);overflow:hidden; }
      .po-act-btn { position:absolute;bottom:14px;right:14px;z-index:1100;
        background:var(--po-green-deep);color:var(--po-cream);font-size:12px;font-weight:500;
        padding:8px 16px;border-radius:20px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;
        box-shadow:0 3px 12px rgba(0,0,0,.15);transition:opacity .15s; }
      .po-act-btn:hover { opacity:.85; }

      .po-panel { width:360px;flex-shrink:0;background:var(--po-panel);
        border-right:1px solid rgba(26,35,24,0.09);display:flex;flex-direction:column;overflow:hidden; }
      .po-ph { padding:16px 20px 12px;border-bottom:1px solid rgba(26,35,24,.07); }
      .po-ph-title { font-family:'Playfair Display',serif;font-size:16px;color:var(--po-green-deep);margin-bottom:5px; }
      .po-ph-desc { font-size:11px;color:#6b7a68;line-height:1.55; }

      .po-modes { display:flex;padding:10px 16px;gap:5px;border-bottom:1px solid rgba(26,35,24,.07); }
      .po-mode-btn { flex:1;padding:6px 4px;border-radius:7px;border:1px solid rgba(26,35,24,.1);
        font-size:10px;font-weight:500;cursor:pointer;background:white;color:#888;transition:all .18s;text-align:center;line-height:1.3; }
      .po-mode-btn-active { background:var(--po-green-deep)!important;color:white!important;border-color:var(--po-green-deep)!important; }

      .po-year-section { padding:14px 20px;border-bottom:1px solid rgba(26,35,24,.07); }
      .po-year-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px; }
      .po-year-label { font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#bbb;margin-bottom:1px; }
      .po-year-display { font-family:'Playfair Display',serif;font-size:32px;color:var(--po-green-deep);line-height:1; }
      .po-year-context { font-size:11px;color:#888;max-width:160px;text-align:right;line-height:1.4; }
      .po-year-section input[type=range] { width:100%;-webkit-appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;
        background:linear-gradient(to right,var(--po-green-deep) 0%,var(--po-green-deep) var(--pct,0%),rgba(26,35,24,.12) var(--pct,0%)); }
      .po-year-section input[type=range]::-webkit-slider-thumb { -webkit-appearance:none;width:16px;height:16px;border-radius:50%;
        background:var(--po-green-deep);border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer; }
      .po-year-marks { display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:#ccc; }
      .po-milestone-tags { display:flex;gap:5px;flex-wrap:wrap;margin-top:8px; }
      .po-m-tag { font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid;font-weight:500; }

      .po-chart-section { padding:12px 20px 8px;border-bottom:1px solid rgba(26,35,24,.07); }
      .po-chart-label { font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#bbb;margin-bottom:4px; }
      .po-chart-context { font-size:11px;color:#5a6a56;line-height:1.5;margin-bottom:8px;
        padding:8px 10px;background:rgba(74,124,42,.06);border-radius:7px;border-left:3px solid var(--po-green-mid); }
      .po-chart-wrap { position:relative;height:150px; }
      .po-chart-legend { display:flex;gap:12px;margin-top:6px;font-size:10px;color:#888; }
      .po-cl-dot { width:10px;height:3px;border-radius:2px;display:inline-block;margin-right:4px;vertical-align:middle; }

      .po-nations-section { flex:1;overflow-y:auto;padding:10px 16px 14px; }
      .po-nations-section::-webkit-scrollbar { width:3px; }
      .po-nations-section::-webkit-scrollbar-thumb { background:rgba(26,35,24,.1);border-radius:3px; }
      .po-ns-title { font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#bbb;margin-bottom:8px;padding:0 4px; }
      .po-ncard { padding:10px 12px;border-radius:9px;border:1px solid rgba(26,35,24,.08);
        background:white;margin-bottom:6px;cursor:pointer;transition:all .16s; }
      .po-ncard:hover { border-color:rgba(26,35,24,.16);transform:translateY(-1px); }
      .po-ncard-top { display:flex;align-items:center;gap:8px;margin-bottom:6px; }
      .po-ndot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
      .po-nname { font-size:12px;font-weight:500;flex:1; }
      .po-nrating { font-size:10px;padding:2px 7px;border-radius:5px;font-weight:500; }
      .po-r-strong { background:#e6f4e6;color:#2d5016; }
      .po-r-moderate { background:#fef3e2;color:#c8760a; }
      .po-r-weak { background:#fde8e6;color:#b83a2a; }

      .po-gap-row { display:flex;align-items:center;gap:6px;margin-bottom:4px; }
      .po-gap-label { font-size:10px;color:#aaa;width:70px;flex-shrink:0; }
      .po-gap-track { flex:1;height:5px;background:rgba(26,35,24,.07);border-radius:3px;position:relative; }
      .po-gap-current { height:5px;border-radius:3px;position:absolute;left:0;top:0;transition:width .5s; }
      .po-gap-target-mark { position:absolute;top:-3px;width:2px;height:11px;background:var(--po-green-mid);border-radius:1px; }
      .po-gap-val { font-size:10px;font-weight:600;min-width:32px;text-align:right; }
      .po-gap-needed { font-size:10px;color:var(--po-red);margin-top:2px; }

      .po-right-area { flex:1;display:flex;flex-direction:column;overflow:hidden; }
      .po-dashboard { flex-shrink:0;display:flex;gap:0;border-bottom:1px solid rgba(26,35,24,.09);background:var(--po-cream); }
      .po-dash-card { flex:1;padding:12px 16px;border-right:1px solid rgba(26,35,24,.07); }
      .po-dash-card:last-child { border-right:none; }
      .po-dc-label { font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#bbb;margin-bottom:3px; }
      .po-dc-metric { font-family:'Playfair Display',serif;font-size:22px;color:var(--po-green-deep);line-height:1; }
      .po-dc-warning { font-size:13px!important;margin-top:4px!important;color:var(--po-red)!important;line-height:1.3; }
      .po-dc-sub { font-size:10px;color:#aaa;margin-top:2px; }
      .po-dc-context { font-size:11px;margin-top:4px;line-height:1.4; }
      .po-trend-up { color:var(--po-green-mid); }
      .po-trend-down { color:var(--po-red); }
      .po-trend-flat { color:var(--po-amber); }

      .po-prot-bar { margin-top:6px; }
      .po-prot-bar-track { height:5px;background:rgba(26,35,24,.08);border-radius:3px;position:relative;margin-top:3px; }
      .po-prot-bar-fill { height:5px;border-radius:3px;background:var(--po-green-mid);transition:width .5s; }
      .po-prot-bar-target { position:absolute;right:0;top:-3px;width:2px;height:11px;background:rgba(26,35,24,.3);border-radius:1px; }
      .po-prot-bar-label { display:flex;justify-content:space-between;font-size:10px;color:#bbb; }

      .po-map-area { flex:1;position:relative; }
      .po-map { width:100%;height:100%; }
      .po-milestone-bar { position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:800;display:flex;gap:6px; }
      .po-mstone { background:var(--po-panel);border-radius:7px;padding:5px 11px;border:1px solid rgba(26,35,24,.09);
        font-size:10px;color:#6b7a68;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;align-items:center;gap:5px;white-space:nowrap; }
      .po-ms-dot { width:6px;height:6px;border-radius:50%; }
      .po-ms-year { font-weight:600;color:var(--po-dark); }

      /* ACTION OVERLAY */
      .po-act-overlay { position:fixed;inset:0;background:rgba(10,20,8,.35);z-index:1500;
        display:none;align-items:flex-end;justify-content:center; }
      .po-act-overlay-open { display:flex; }
      .po-act-drawer { background:var(--po-cream);border-radius:18px 18px 0 0;width:100%;max-width:860px;
        max-height:78vh;display:flex;flex-direction:column;box-shadow:0 -6px 40px rgba(0,0,0,.18);overflow:hidden;
        animation:po-slideUp .3s cubic-bezier(.22,.8,.36,1); }
      @keyframes po-slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
      .po-act-header { display:flex;align-items:center;justify-content:space-between;padding:18px 22px 12px;
        border-bottom:1px solid rgba(26,35,24,.08);flex-shrink:0; }
      .po-act-title { font-family:'Playfair Display',serif;font-size:17px;color:var(--po-green-deep); }
      .po-act-close { background:none;border:none;cursor:pointer;font-size:20px;color:#aaa;line-height:1;padding:4px; }
      .po-act-tabs { display:flex;gap:6px;padding:12px 22px 0;overflow-x:auto;flex-shrink:0;scrollbar-width:none; }
      .po-act-tabs::-webkit-scrollbar { display:none; }
      .po-act-tab { font-size:11px;padding:5px 13px;border-radius:20px;border:1px solid rgba(26,35,24,.15);
        background:none;cursor:pointer;font-family:'DM Sans',sans-serif;color:#6b7a68;white-space:nowrap;transition:all .15s; }
      .po-act-tab-active { background:var(--po-green-deep)!important;color:var(--po-cream)!important;border-color:var(--po-green-deep)!important; }
      .po-act-body { overflow-y:auto;padding:16px 22px 28px;flex:1; }
      .po-act-section { margin-bottom:18px; }
      .po-act-section-title { font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#bbb;margin-bottom:10px; }
      .po-act-card { background:white;border-radius:10px;padding:13px 15px;margin-bottom:8px;
        border:1px solid rgba(26,35,24,.07);display:flex;gap:12px;align-items:flex-start; }
      .po-act-card-icon { font-size:20px;flex-shrink:0;margin-top:1px; }
      .po-act-card-name { font-size:13px;font-weight:500;color:var(--po-dark);margin-bottom:2px; }
      .po-act-card-desc { font-size:11px;color:#6b7a68;line-height:1.5;margin-bottom:6px; }
      .po-act-card-link { font-size:11px;color:var(--po-green-mid);text-decoration:none;font-weight:500; }
      .po-act-card-link:hover { text-decoration:underline; }
      .po-act-tag { display:inline-block;font-size:9px;text-transform:uppercase;letter-spacing:.08em;
        padding:2px 7px;border-radius:8px;margin-bottom:6px; }

      /* Popup styling — scoped via classnames */
      .po-pi { padding:13px 16px; }
      .po-ptitle { font-family:'Playfair Display',serif;font-size:15px;color:var(--po-dark);margin-bottom:3px; }
      .po-ptags { display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px; }
      .po-ptag { font-size:10px;padding:2px 8px;border-radius:8px; }
      .po-prow { display:flex;justify-content:space-between;font-size:11px;color:#888;padding:4px 0;
        border-top:1px solid rgba(26,35,24,.06); }
      .po-prow strong { color:var(--po-dark); }
      .po-ptext { font-size:11px;color:#5a6a56;line-height:1.55;margin-top:6px; }
      .po-pgap { font-size:11px;color:var(--po-red);margin-top:5px; }
      .po-site-type { font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px; }
      .po-carbon-note { font-size:10px;color:#888;margin-top:6px;padding-top:6px;border-top:1px solid rgba(26,35,24,.06); }
    `}</style>
  );
}
