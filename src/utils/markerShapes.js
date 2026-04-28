// SVG markers for the Biodiversity Outlook map.
// shape encodes taxonomic group; fill encodes threat status.
// Both visual channels must be present — do not collapse to colour-only.
export function groupSVG(group, s, col) {
  const h2 = s / 2;
  const sd = 'filter:drop-shadow(0 2px 4px rgba(0,0,0,.28))';
  const base = `width="${s}" height="${s}" style="cursor:pointer;${sd}" xmlns="http://www.w3.org/2000/svg"`;

  switch (group) {
    case 'bird': {
      const r = h2 - 1.5, cx = h2, cy = h2;
      const pts = [0, 1, 2, 3, 4]
        .map(i => { const a = (i * 72 - 90) * Math.PI / 180; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; })
        .join(' ');
      return `<svg ${base}><polygon points="${pts}" fill="${col}" stroke="white" stroke-width="2"/></svg>`;
    }
    case 'mammal':
      return `<svg ${base}><polygon points="${h2},1.5 ${s - 1.5},${h2} ${h2},${s - 1.5} 1.5,${h2}" fill="${col}" stroke="white" stroke-width="2"/></svg>`;
    case 'fish':
      return `<svg ${base}><polygon points="${h2},2 ${s - 2},${s - 2} 2,${s - 2}" fill="${col}" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>`;
    case 'invertebrate': {
      const r = h2 - 1.5, cx = h2, cy = h2;
      const pts = [0, 1, 2, 3, 4, 5]
        .map(i => { const a = (i * 60 - 90) * Math.PI / 180; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; })
        .join(' ');
      return `<svg ${base}><polygon points="${pts}" fill="${col}" stroke="white" stroke-width="2"/></svg>`;
    }
    case 'amphibian': {
      const or = h2 - 1.5, ir = h2 * 0.40, cx = h2, cy = h2;
      const pts = [0, 1, 2, 3, 4, 5, 6, 7]
        .map(i => { const a = (i * 45 - 90) * Math.PI / 180; const r = i % 2 === 0 ? or : ir; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; })
        .join(' ');
      return `<svg ${base}><polygon points="${pts}" fill="${col}" stroke="white" stroke-width="1.5"/></svg>`;
    }
    case 'plant':
      return `<svg ${base}><rect x="2" y="2" width="${s - 4}" height="${s - 4}" rx="3" fill="${col}" stroke="white" stroke-width="2"/></svg>`;
    default:
      return `<svg ${base}><circle cx="${h2}" cy="${h2}" r="${h2 - 1.5}" fill="${col}" stroke="white" stroke-width="2"/></svg>`;
  }
}

export const STATUS_SIZE = { critical: 20, severe: 16, declining: 13, recovering: 13 };
