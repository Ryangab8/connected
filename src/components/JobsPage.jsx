import React, { useEffect } from 'react';
import feed from '../../content/jobs/latest.json';

// Unlisted page (not in the menu, not indexed) with Emily's daily job shortlist.
// content/jobs/latest.json is rewritten each morning by the daily job run, ranked best fit first.
const SETTING = {
  outdoors: { label: 'Mostly outdoors', color: '#2d6a4f', bg: '#e6f4e6' },
  mixed: { label: 'Field and desk', color: '#8a5a00', bg: '#fef3e2' },
  desk: { label: 'Desk-based', color: '#5c3d7a', bg: '#ece8f5' },
};

export default function JobsPage() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const updated = new Date(`${feed.updated}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="jb-page">
      <Styles />
      <h1 className="jb-title">Jobs for Emily</h1>
      <p className="jb-lead">
        {feed.jobs.length} roles, best fit first. Updated {updated}. Tap a title to open the listing and apply.
      </p>
      {feed.jobs.map((job, i) => <Job key={job.url} job={job} rank={i + 1} />)}
    </div>
  );
}

const shortDate = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function Job({ job, rank }) {
  const setting = SETTING[job.setting];
  const facts = [
    job.salary,
    job.contract,
    job.closes ? `Closes ${shortDate(job.closes)}` : job.posted ? `Posted ${shortDate(job.posted)}` : null,
  ].filter(Boolean);

  return (
    <section className="jb-item">
      <div className="jb-rank">{rank}</div>
      <div className="jb-body">
        <a className="jb-job" href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
        <div className="jb-where">{job.employer} · {job.location}</div>
        <div className="jb-tags">
          {setting && <span className="jb-tag" style={{ color: setting.color, background: setting.bg }}>{setting.label}</span>}
          {facts.map(f => <span key={f} className="jb-tag">{f}</span>)}
        </div>
        {job.about && <p className="jb-about">{job.about}</p>}
        {job.requirements?.length > 0 && (
          <ul className="jb-reqs">
            {job.requirements.map(r => <li key={r}>{r}</li>)}
          </ul>
        )}
        <div className="jb-foot">
          <span>{job.how_to_apply}</span>
          <a className="jb-btn" href={job.url} target="_blank" rel="noopener noreferrer">Open listing</a>
        </div>
      </div>
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .jb-page { max-width: 820px; margin: 0 auto; padding: 100px 16px 64px; font-family: 'DM Sans', 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a2318; }
      .jb-title { font-family: Georgia, serif; font-size: 2rem; color: #2d5016; margin: 0 0 0.5rem; }
      .jb-lead { color: #6b7a68; line-height: 1.6; margin: 0 0 1.5rem; }
      .jb-item { display: flex; gap: 16px; padding: 18px 20px; margin-bottom: 14px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; }
      .jb-rank { flex: 0 0 32px; height: 32px; border-radius: 50%; background: #2d6a4f; color: #ffffff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
      .jb-body { flex: 1; min-width: 0; }
      .jb-job { font-family: Georgia, serif; font-size: 1.2rem; font-weight: 700; color: #1a2318; text-decoration: none; }
      .jb-job:hover { color: #2d6a4f; text-decoration: underline; }
      .jb-where { color: #6b7a68; margin: 4px 0 10px; font-size: 0.95rem; }
      .jb-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
      .jb-tag { font-size: 0.8rem; padding: 3px 10px; border-radius: 12px; background: #f1f0ec; color: #3d4a3a; }
      .jb-about { margin: 0 0 8px; line-height: 1.55; font-size: 0.95rem; }
      .jb-reqs { margin: 0 0 10px; padding-left: 18px; line-height: 1.55; font-size: 0.9rem; color: #3d4a3a; }
      .jb-foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; font-size: 0.85rem; color: #6b7a68; }
      .jb-btn { font-size: 0.9rem; padding: 7px 14px; border-radius: 8px; background: #2d6a4f; color: #ffffff; text-decoration: none; }
      @media (max-width: 600px) {
        .jb-item { padding: 14px; gap: 12px; }
        .jb-rank { flex-basis: 28px; height: 28px; }
      }
    `}</style>
  );
}
