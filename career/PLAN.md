# Emily's kit: post drafts and job search

Runs on Claude Code: a local scheduled task on Ryan's computer for now, then a cloud routine on Emily's
Pro plan after handover (see `HANDOVER.md`). No LinkedIn API, no automatic posting, no Duet.
Emily's checklist: https://claude.ai/artifact/CQT62sPkExq4Aw9JUfrBzh

## 1. LinkedIn post drafts (live)

Claude writes the drafts. Emily rewrites them in her own words and posts them herself.

- Where she finds them: `connectedbiodiversity.com/drafts` (DraftsPage.jsx). The page isn't in the
  menu and isn't indexed. Each draft shows the image (with a save button), the post text (with a copy
  button), the link back to the site, and its sources.
- Storage: one file per draft in `content/drafts/`. Front matter: `title`, `type` (species, cascade,
  nations, site), `status` (draft, posted), the id it draws on (`species`, `cascade`, `nation`, `site`),
  `link`, `stat`, `stat_label`, `note`, `sources`, `linkedin_url`, `posted_on`. In the post text,
  `{link}` becomes the full site address. Adding a file and pushing to main updates the page.
- Image: drawn from the site's own data (PostCard.jsx). It shows the name, status, one key number and a
  map of Britain and Ireland with the sites marked. It saves with one click.
- Link back: every post links to the exact view on the site: `/biodiversity-outlook?species=<id>`,
  `/policy-outlook?site=<slug>` or `?nation=<id>`, `/stories/<cascade>`, `/map/<species>`.
- Rotation, one post a week:
  1. Species spotlight: one of the 78 species, with its status, decline, cause and where it lives.
  2. Cascade story: one of the 8 chain reactions.
  3. Finding from the site, such as Conflict Map results or Policy Outlook delivery scores.
  4. News from the past week in the UK and Ireland, tied back to a species or site.
- Facts in posts come only from the site's data, which is checked against cited sources.
- Not built yet: the weekly drafts routine, and a public `/notes` page listing what she has posted.

## 2. Job feed (live)

- Page: `connectedbiodiversity.com/jobs` (JobsPage.jsx), unlisted and not indexed. Data lives in
  `content/jobs/latest.json`, best fit first; `content/jobs/seen.json` lists every role already shown.
- Sorting: best fit, salary, closing soonest or newest. Filters: work setting (mostly outdoors, field
  and desk, desk-based) and region (Belfast and NI, rest of Ireland, remote).
- Daily run: the instructions are in `career/daily-jobs-routine.md`. It runs at 1:00am ET (6:00am in
  Belfast) as the local scheduled task `emily-daily-jobs`.
  - Sources: LinkedIn alert emails (filed under the Gmail label "Emily Jobs"), the Indeed connector
    (one search at a time; it rate-limits), and the boards listed in section 3.
  - The list is cumulative. Roles stay while they're open and she qualifies, closed roles drop off, and
    the whole list is re-ranked each day (cap 60).
  - Eligibility: the run judges each listing against her CV. "Graduate" jobs open to anyone with a degree
    are in. Gaps she could close in a few weeks (GIS course, CIEEM membership, CSCS card, PA1/PA6) keep the
    role in, with a "Needs first" note on the page. Long gaps drop it: years of specialist experience, a
    master's, chartered status, survey licences, specialist ID skills, GB-only roles.
  - Role types: ecology and conservation, plus related roles she qualifies for: field and water-quality
    sampling, environmental and lab technicians, fisheries, countryside and ranger, council biodiversity
    and parks, records and data, nursery and horticulture, and admin or outreach at conservation charities.
  - Sites that block automated reading or need a login (CEDaR, NICS, NIJobs, Gradcracker, CharityJob,
    WildTeam) aren't fetched; their jobs come in through alert emails filed under "Emily Jobs".
  - Ranking: roles offering private healthcare go to the top. Then field and outdoor roles, then field
    and desk, then desk-based. At a similar fit, Belfast or NI roles and CEDaR or NBDC roles rank higher.
    The page tags private healthcare and can filter on it.
  - Email: only on days with new roles. It goes from ryangabriele8@gmail.com to
    emilymoreland9997@gmail.com, copied to Ryan, with the top 5 new roles and a link to the full page.
- Each listing shows salary, location, contract, closing or posting date, key requirements, setting and
  how to apply. No urgency labels.
- What employers ask for: LinkedIn Easy Apply usually wants only the CV. NICS and publicjobs.ie use their
  own application forms with competency questions. Charities and consultancies often want a CV plus a
  cover letter or supporting statement.
- Easy Apply stays on her account, and no bot ever clicks Apply.
- Not built yet: the People line (public LinkedIn profiles at the employer, found by web search, for the
  top 5 roles) and the Tailor button (section 2a).

## 2a. Tailoring: light touch, only on request (not built yet)

The current CV is a fair picture of her, so a tailored CV is a reweighting of what's already there, not a
rewrite. The cover letter is where tailoring adds the most.

- Allowed CV changes, about three to five per job:
  - Reorder bullets within a role so the most relevant comes first.
  - Reorder the Key Skills lines.
  - Reword the Profile's opening sentence toward the role.
  - Use the job's own terms where they truly describe her experience (for example "biological records"
    for species data she compiled).
- Never: add a skill, tool, survey type, number, date or duty that isn't in the base CV; change the layout;
  remove a role.
- If the job asks for something her CV doesn't show (a bat licence, a GIS package), ask her one or two
  short questions instead of guessing.
- Cover letter, only when the job asks for one: one page, built from her real experience, with
  connectedbiodiversity.com where it's relevant.
- Flow: she clicks Tailor. A small Vercel function starts a routine through its API trigger with that
  job's details. The routine emails her the tailored CV, a short list of what changed, any questions,
  and the cover letter if needed. She reviews it and sends the application herself.

## 3. Job sources

- Northern Ireland: NICS Recruitment (DAERA, NIEA), NIJobs, AFBI, the 11 councils, CEDaR (NI's local
  environmental records centre), Ulster Wildlife, RSPB NI, National Trust, Woodland Trust,
  Lough Neagh Partnership, Belfast Hills Partnership, NI Environment Link, Charity Jobs NI.
- Republic of Ireland: publicjobs.ie (NPWS, OPW), National Biodiversity Data Centre, EPA, Inland
  Fisheries Ireland, GreenJobs.ie, Activelink, gradireland.
- UK and Ireland wide: LinkedIn alerts, Indeed GB and IE, CIEEM, Countryside Jobs Service, CharityJob,
  Gradcracker, Conservation Careers.
- Possible additions: the Reed or Jooble job APIs. Each needs a free API key.

## 4. Handover

See `HANDOVER.md`.
