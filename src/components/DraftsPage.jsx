import React, { useEffect, useState } from 'react';
import { DRAFTS } from '../lib/drafts';
import PostCard from './PostCard';

// Unlisted page (not in the menu, not indexed) where Emily picks up LinkedIn drafts
export default function DraftsPage() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const queued = DRAFTS.filter(d => d.status !== 'posted');
  const posted = DRAFTS.filter(d => d.status === 'posted');

  return (
    <div className="dr-page">
      <Styles />
      <h1 className="dr-title">Post drafts</h1>
      <p className="dr-lead">
        Rewrite each one in your own words, then post it on LinkedIn with the image. The link takes people to the exact map view.
      </p>
      {queued.map(d => <Draft key={d.slug} draft={d} />)}
      {posted.length > 0 && <h2 className="dr-subtitle">Posted</h2>}
      {posted.map(d => <Draft key={d.slug} draft={d} />)}
    </div>
  );
}

function Draft({ draft }) {
  const [copied, setCopied] = useState('');

  const copy = async (what, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(what);
    setTimeout(() => setCopied(''), 1800);
  };

  return (
    <section className="dr-item">
      <PostCard draft={draft} />
      <div className="dr-body">
        <div className="dr-meta">
          <span className="dr-type">{draft.title}</span>
          {draft.status === 'posted' && draft.linkedin_url && (
            <a href={draft.linkedin_url} target="_blank" rel="noopener noreferrer">View on LinkedIn</a>
          )}
        </div>
        <div className="dr-text">{draft.text}</div>
        <div className="dr-actions">
          <button className="dr-btn dr-btn-primary" onClick={() => copy('text', draft.text)}>
            {copied === 'text' ? 'Copied' : 'Copy text'}
          </button>
          <button className="dr-btn" onClick={() => copy('link', draft.url)}>
            {copied === 'link' ? 'Copied' : 'Copy link'}
          </button>
          <a className="dr-btn" href={draft.link || '/'} target="_blank" rel="noopener noreferrer">Open map view</a>
        </div>
        {draft.sources && <div className="dr-sources">Sources: {draft.sources}</div>}
      </div>
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .dr-page { max-width: 1040px; margin: 0 auto; padding: 100px 16px 64px; font-family: 'DM Sans', 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a2318; }
      .dr-title { font-family: Georgia, serif; font-size: 2rem; color: #2d5016; margin: 0 0 0.5rem; }
      .dr-subtitle { font-family: Georgia, serif; font-size: 1.4rem; color: #2d5016; margin: 3rem 0 1rem; }
      .dr-lead { color: #6b7a68; line-height: 1.6; margin: 0 0 2rem; max-width: 640px; }
      .dr-item { display: flex; gap: 28px; align-items: flex-start; padding: 24px; margin-bottom: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; }
      .dr-card { flex: 0 0 340px; display: flex; flex-direction: column; gap: 10px; }
      .dr-card img { width: 100%; border-radius: 6px; border: 1px solid #e5e7eb; display: block; }
      .dr-body { flex: 1; min-width: 0; }
      .dr-meta { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; font-size: 0.85rem; }
      .dr-meta a { color: #2d6a4f; }
      .dr-type { font-weight: 600; color: #2d5016; }
      .dr-text { white-space: pre-wrap; line-height: 1.6; font-size: 0.95rem; background: #f8f7f4; border-radius: 8px; padding: 16px; overflow-wrap: anywhere; }
      .dr-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .dr-btn { font: inherit; font-size: 0.9rem; text-transform: none; letter-spacing: normal; padding: 8px 14px; border-radius: 8px; border: 1px solid #c9d2c6; background: #ffffff; color: #1a2318; cursor: pointer; text-decoration: none; }
      .dr-btn:disabled { opacity: 0.5; cursor: default; }
      .dr-btn-primary { background: #2d6a4f; border-color: #2d6a4f; color: #ffffff; }
      .dr-sources { margin-top: 12px; font-size: 0.8rem; color: #8a9a86; line-height: 1.5; }
      @media (max-width: 720px) {
        .dr-item { flex-direction: column; padding: 16px; }
        .dr-card { flex: none; width: 100%; }
      }
    `}</style>
  );
}
