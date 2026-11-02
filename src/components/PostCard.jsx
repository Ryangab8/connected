import React, { useEffect, useState } from 'react';
import outline from '../data/uk-ireland-outline.json';
import { SPECIES, POP_STATS, THREAT_COLOR, THREAT_LABEL } from '../data/biodiversitySpecies';
import { NATIONS, TYPE_COLOR } from '../data/policyNations';
import { SITES } from '../data/policySites';
import { getAllCascades, getSpeciesById } from '../lib/dataLoader';
import { siteSlug } from '../utils/siteSlug';

// 4:5 portrait, the shape LinkedIn shows largest in the feed
const W = 1080;
const H = 1350;
const PAD = 80;
const C = {
  bg: '#f5f2ec', dark: '#1a2318', green: '#2d5016', muted: '#6b7a68', faint: '#b9c1b5',
  land: '#e4ded1', coast: '#c3baa8', rule: 'rgba(26,35,24,0.12)',
};
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';
const TYPE_LABEL = {
  species: 'Species spotlight', cascade: 'Ecological cascade', nations: 'Nature policy', site: 'Site spotlight',
};
const STEP_COLOR = {
  declining: '#b83a2a', affected: '#c8760a', pressured: '#c8760a', adapting: '#1e6b6b', recovering: '#4a7c2a',
};

// Map extent: all of Great Britain and Ireland, equirectangular scaled for latitude
const BOUNDS = { w: -10.8, e: 2.0, s: 49.8, n: 61.0 };
const KX = Math.cos((55.4 * Math.PI) / 180);

const stripHtml = s => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');

function wrap(ctx, text, x, y, maxW, lh) {
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, y);
      y += lh;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}

function pill(ctx, text, x, y, color) {
  ctx.font = `600 28px ${SANS}`;
  const w = ctx.measureText(text).width + 44;
  ctx.fillStyle = `${color}22`;
  ctx.beginPath();
  ctx.moveTo(x + 24, y); ctx.arcTo(x + w, y, x + w, y + 48, 24); ctx.arcTo(x + w, y + 48, x, y + 48, 24);
  ctx.arcTo(x, y + 48, x, y, 24); ctx.arcTo(x, y, x + w, y, 24); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, x + 22, y + 34);
}

// Draws Great Britain and Ireland with `points` ([lat, lng]) highlighted; returns the map width
function drawMap(ctx, x, y, h, points, color) {
  const scale = h / (BOUNDS.n - BOUNDS.s);
  const w = (BOUNDS.e - BOUNDS.w) * KX * scale;
  const px = (lng, lat) => [x + (lng - BOUNDS.w) * KX * scale, y + (BOUNDS.n - lat) * scale];

  ctx.fillStyle = C.land;
  ctx.strokeStyle = C.coast;
  ctx.lineWidth = 1.5;
  outline.features.forEach(f => f.geometry.coordinates.forEach(poly => {
    ctx.beginPath();
    poly.forEach(ring => ring.forEach(([lng, lat], i) => {
      const [a, b] = px(lng, lat);
      if (i) ctx.lineTo(a, b); else ctx.moveTo(a, b);
    }));
    ctx.fill('evenodd');
    ctx.stroke();
  }));

  points.slice().reverse().forEach(([lat, lng], ri) => {
    const first = ri === points.length - 1;
    const [a, b] = px(lng, lat);
    if (first) {
      ctx.strokeStyle = `${color}66`;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(a, b, 26, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(a, b, first ? 14 : 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  return w;
}

function frame(ctx, type) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `700 30px ${SANS}`;
  ctx.fillStyle = C.green;
  ctx.fillText(TYPE_LABEL[type] || '', PAD, 112);
  ctx.textAlign = 'right';
  ctx.font = `400 28px ${SANS}`;
  ctx.fillStyle = C.muted;
  ctx.fillText('Connected Biodiversity', W - PAD, 112);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.rule;
  ctx.fillRect(PAD, 140, W - PAD * 2, 2);
  ctx.fillRect(PAD, H - 110, W - PAD * 2, 2);
  ctx.font = `400 30px ${SANS}`;
  ctx.fillStyle = C.muted;
  ctx.fillText('connectedbiodiversity.com', PAD, H - 56);
}

// Name, subtitle and pill, then a stat column on the left and the map on the right
function drawPlace(ctx, { name, subtitle, pillText, color, stat, statLabel, note, points }) {
  ctx.fillStyle = C.dark;
  ctx.font = `700 84px ${SERIF}`;
  let y = wrap(ctx, name, PAD, 250, W - PAD * 2, 94);
  ctx.font = `italic 400 38px ${SERIF}`;
  ctx.fillStyle = C.muted;
  y = wrap(ctx, subtitle, PAD, y - 20, W - PAD * 2, 48);
  pill(ctx, pillText, PAD, y + 4, color);

  const mapTop = Math.max(y + 90, 500);
  const mapH = H - 140 - mapTop;
  const mapW = (BOUNDS.e - BOUNDS.w) * KX * (mapH / (BOUNDS.n - BOUNDS.s));
  drawMap(ctx, W - PAD - mapW, mapTop, mapH, points, color);

  // Largest stat size that still fits the left column
  const colW = W - PAD * 2 - 40 - mapW;
  let size = 132;
  ctx.font = `700 ${size}px ${SERIF}`;
  while (size > 56 && ctx.measureText(stat).width > colW) {
    size -= 4;
    ctx.font = `700 ${size}px ${SERIF}`;
  }
  ctx.fillStyle = color;
  ctx.fillText(stat, PAD, mapTop + 120);
  ctx.fillStyle = C.dark;
  ctx.font = `400 36px ${SANS}`;
  let sy = wrap(ctx, statLabel, PAD, mapTop + 190, colW, 48);
  if (note) {
    ctx.fillStyle = C.muted;
    ctx.font = `400 30px ${SANS}`;
    wrap(ctx, note, PAD, sy + 40, colW, 42);
  }
}

function drawSpecies(ctx, d) {
  const s = SPECIES.find(x => x.id === d.species);
  if (!s) return;
  const pop = (POP_STATS[s.id] || [])[0];
  drawPlace(ctx, {
    name: s.name,
    subtitle: s.latin,
    pillText: THREAT_LABEL[s.status],
    color: THREAT_COLOR[s.status],
    stat: d.stat || stripHtml(pop?.val),
    statLabel: d.stat_label || stripHtml(pop?.label),
    note: d.note,
    points: s.latlng,
  });
}

function drawSite(ctx, d) {
  const s = SITES.find(x => siteSlug(x.name) === d.site);
  if (!s) return;
  const nation = s.nation === 'N. Ireland' ? 'Northern Ireland' : s.nation;
  drawPlace(ctx, {
    name: s.name,
    subtitle: nation,
    pillText: s.type.charAt(0).toUpperCase() + s.type.slice(1),
    color: TYPE_COLOR[s.type] || C.green,
    stat: d.stat || '',
    statLabel: d.stat_label || '',
    note: d.note,
    points: [[s.lat, s.lng]],
  });
}

function drawNations(ctx, d) {
  ctx.fillStyle = C.dark;
  ctx.font = `700 72px ${SERIF}`;
  let y = wrap(ctx, d.card_title || 'Nature policy delivery', PAD, 250, W - PAD * 2, 84);
  ctx.font = `400 32px ${SANS}`;
  ctx.fillStyle = C.muted;
  y = wrap(ctx, 'Policy delivery score out of 100 in 2024. The tick marks the score each nation needs to meet its own commitments.', PAD, y + 4, W - PAD * 2, 44);

  const barX = 420;
  const barW = W - PAD - barX;
  const rowH = 92;
  let ry = Math.max(y + 50, 500);
  NATIONS.forEach(n => {
    const focus = n.id === d.nation;
    const name = n.id === 'ni' ? 'Northern Ireland' : n.name;
    ctx.fillStyle = focus ? n.color : C.dark;
    ctx.font = `${focus ? 700 : 400} 36px ${SANS}`;
    ctx.fillText(name, PAD, ry + 34);
    ctx.fillStyle = 'rgba(26,35,24,0.07)';
    ctx.fillRect(barX, ry, barW, 46);
    ctx.globalAlpha = focus ? 1 : 0.45;
    ctx.fillStyle = n.color;
    ctx.fillRect(barX, ry, (barW * n.policyScore) / 100, 46);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 28px ${SANS}`;
    ctx.fillText(String(n.policyScore), barX + 14, ry + 33);
    const rx = barX + (barW * n.required) / 100;
    ctx.fillStyle = C.dark;
    ctx.fillRect(rx - 2, ry - 10, 4, 66);
    ctx.font = `400 24px ${SANS}`;
    ctx.fillStyle = C.muted;
    ctx.fillText(`needs ${n.required}`, Math.min(rx + 8, W - PAD - 110), ry + 76);
    ry += rowH;
  });

  if (d.stat) {
    const focus = NATIONS.find(n => n.id === d.nation);
    ctx.fillStyle = focus ? focus.color : C.green;
    ctx.font = `700 84px ${SERIF}`;
    ctx.fillText(d.stat, PAD, ry + 80);
    ctx.fillStyle = C.dark;
    ctx.font = `400 32px ${SANS}`;
    wrap(ctx, d.stat_label || '', PAD, ry + 135, W - PAD * 2, 42);
  }
}

function drawCascade(ctx, d) {
  const c = getAllCascades().find(x => x.id === d.cascade);
  if (!c) return;
  ctx.fillStyle = C.dark;
  ctx.font = `700 80px ${SERIF}`;
  let y = wrap(ctx, c.title, PAD, 250, W - PAD * 2, 90);
  ctx.font = `400 36px ${SANS}`;
  ctx.fillStyle = C.muted;
  y = wrap(ctx, c.subtitle, PAD, y + 4, W - PAD * 2, 48);

  // "What's changing" box along the bottom, sized to the first sentence of the resolution
  const fix = (c.resolution || '').split(/(?<=\.)\s/)[0];
  ctx.font = `400 32px ${SANS}`;
  let lines = 1;
  let line = '';
  for (const word of fix.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > W - PAD * 2 - 60) { lines++; line = word; } else line = test;
  }
  const boxH = fix ? 100 + lines * 42 : 0;
  const boxTop = H - 140 - boxH;
  if (fix) {
    ctx.fillStyle = 'rgba(74,124,42,0.10)';
    ctx.fillRect(PAD, boxTop, W - PAD * 2, boxH);
    ctx.fillStyle = C.green;
    ctx.font = `700 28px ${SANS}`;
    ctx.fillText("What's changing", PAD + 30, boxTop + 52);
    ctx.fillStyle = C.dark;
    ctx.font = `400 32px ${SANS}`;
    wrap(ctx, fix, PAD + 30, boxTop + 98, W - PAD * 2 - 60, 42);
  }

  const top = Math.max(y + 70, 500);
  const gap = Math.min(150, (boxTop - 60 - top) / Math.max(1, c.steps.length - 1));
  const cx = PAD + 26;
  c.steps.forEach((step, i) => {
    const sy = top + i * gap;
    const color = STEP_COLOR[step.status] || C.muted;
    if (i < c.steps.length - 1) {
      ctx.fillStyle = C.faint;
      ctx.fillRect(cx - 2, sy + 30, 4, gap - 60);
      ctx.beginPath();
      ctx.moveTo(cx - 12, sy + gap - 42); ctx.lineTo(cx + 12, sy + gap - 42); ctx.lineTo(cx, sy + gap - 28);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx, sy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.dark;
    ctx.font = `700 50px ${SERIF}`;
    const name = getSpeciesById(step.species)?.commonName || step.species;
    ctx.fillText(name, cx + 56, sy + 16);
    const nameW = ctx.measureText(name).width;
    ctx.fillStyle = color;
    ctx.font = `600 30px ${SANS}`;
    ctx.fillText(step.status.charAt(0).toUpperCase() + step.status.slice(1), cx + 56 + nameW + 26, sy + 14);
  });
}

export function drawCard(ctx, draft) {
  frame(ctx, draft.type);
  if (draft.type === 'species') drawSpecies(ctx, draft);
  else if (draft.type === 'site') drawSite(ctx, draft);
  else if (draft.type === 'nations') drawNations(ctx, draft);
  else if (draft.type === 'cascade') drawCascade(ctx, draft);
}

export default function PostCard({ draft }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    drawCard(canvas.getContext('2d'), draft);
    setSrc(canvas.toDataURL('image/png'));
  }, [draft]);

  const save = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${draft.slug}.png`;
    a.click();
  };

  return (
    <div className="dr-card">
      {src && <img src={src} alt={`Post image: ${draft.title}`} />}
      <button className="dr-btn" onClick={save} disabled={!src}>Save image</button>
    </div>
  );
}
