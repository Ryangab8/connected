// LinkedIn post drafts live in content/drafts/*.md: a front-matter block of
// `key: value` lines, then the post text. `{link}` in the text becomes the full
// site URL for that draft. Files are sorted by name, so number them in posting order.
const files = import.meta.glob('/content/drafts/*.md', { query: '?raw', import: 'default', eager: true });

export const SITE_URL = 'https://connectedbiodiversity.com';

function parseDraft(path, raw) {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const meta = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  const slug = path.split('/').pop().replace(/\.md$/, '');
  const url = meta.link ? SITE_URL + meta.link : SITE_URL;
  return { ...meta, slug, url, status: meta.status || 'draft', text: m[2].trim().replace(/\{link\}/g, url) };
}

export const DRAFTS = Object.entries(files)
  .map(([path, raw]) => parseDraft(path, raw))
  .filter(Boolean)
  .sort((a, b) => a.slug.localeCompare(b.slug));
