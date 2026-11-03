# Daily job run: instructions

This is the exact prompt the daily job run uses. It currently runs as a local scheduled task on Ryan's
computer (task id `emily-daily-jobs`, 1:00am ET). At handover, paste it into a new cloud routine on
Emily's account and change the account-specific bits listed in `HANDOVER.md`.

Keep this file in step with the scheduled task whenever the instructions change.

---

You run Emily Moreland's daily job search. Emily lives in Belfast. Her CV, preferences and search rules are in career/profile.md and career/PLAN.md (sections 2, 2a and 3) in the repo below. Read both first.

Repo: C:\Users\ryang\OneDrive - RG Consulting\Github\connected (React/Vite site, deployed by Vercel on push to main). Start with `git pull --ff-only origin main`.

1. Job alert emails. Gmail filters file alert emails from LinkedIn, Indeed, NIJobs, GreenJobs, NI Environment Link, environmentjob and other boards under the label "Emily Jobs" in Ryan's Gmail (Gmail connector, ryangabriele8@gmail.com). Search `newer_than:3d (label:"Emily Jobs" OR from:(jobs.nijobs.com OR jobalerts-noreply@linkedin.com OR jobalert.indeed.com OR alert@indeed.com OR greenjobs.co.uk OR greenjobs.ie OR nienvironmentlink.org OR environmentjob.co.uk OR charityjob.co.uk OR charityjobsni.com OR publicjobs.ie OR irishjobs.ie OR jobs.ie OR countryside-jobs.com OR cieem.net))` so alerts are found even if a filter missed them. NIJobs sends two kinds of alert ("N new \"ecology\" jobs in Belfast" and "New job opportunities for you"); read both. Alert links are click-tracked and NIJobs blocks automated reading, so judge NIJobs roles from the title, employer, location, contract and salary in the email. List them when the title clearly fits one of her role types at entry, technician, assistant or officer level, and set requirements to ["Full criteria on the listing; check before applying"]. Read each with get_thread (PLAIN_TEXT) and collect every job listed. Open the listing link to read the details where the site allows it; if it doesn't, use what the alert email says. For job-alert emails only (never other mail from these senders) that are still in the inbox, add label Label_2 and remove INBOX and UNREAD.

2. Indeed connector. Make ONE search_jobs call first. If it is rate-limited, skip Indeed entirely for today (Indeed alert emails cover it). If it works, run the rest ONE AT A TIME, never in parallel. Searches: "ecologist", "environmental", "conservation", "biodiversity", "laboratory technician", "water quality", "field technician", "countryside OR ranger" for Belfast (GB); "ecology OR environmental" for Northern Ireland (GB); "ecologist OR conservation OR biodiversity" for Dublin, Cork and Galway (IE). Use get_job_details on promising results to read the requirements.

3. Web search and fetch. Boards that can be read directly: publicjobs.ie (NPWS, environmental), NI Environment Link (https://www.nienvironmentlink.org/opportunitie_cats/job/), environmentjob.co.uk (remote UK roles), GreenJobs.ie, the CIEEM jobs board, Countryside Jobs Service, Charity Jobs NI, and the vacancy pages of the National Biodiversity Data Centre, Ulster Wildlife, RSPB NI, National Trust NI, Woodland Trust NI and Belfast Hills Partnership. Do NOT try CEDaR, NICS Recruitment, NIJobs, greenjobs.co.uk, Gradcracker, CharityJob, WildTeam, Loughs Agency, Inland Fisheries Ireland or Lough Neagh Partnership: they block automated reading or need a login, so their jobs arrive through the alert emails in step 1. Open every candidate listing that allows it, to confirm it's open and to read its essential criteria.

4. Eligibility. Your job is to judge from each listing whether Emily qualifies, and to list every role she does.
   - Her qualifications: BSc Conservation Biology and Ecology (2:1, 2022). No master's.
   - Her experience: a 2-month lab internship (AFBI; DNA extraction, PCR, real-time PCR, LIMS sample tracking), 1 year as fundraising assistant (London Wildlife Trust; member and donation data), store manager since June 2024 (leads a team of 10; stock, quality control, health and safety records), National Trust tree nursery volunteer since Feb 2026 (seed provenance and germination records), and her own biodiversity website (data research and interactive maps).
   - Her skills: Excel and R, data cleaning and validation. Full UK driving licence. First aid. No protected-species licences, no named GIS package, no specialist ID skills (birds, bats, botany) beyond her degree.
   - Role types to include, ranked by fit: ecology and conservation roles; field surveyor, ecological monitoring, ranger, countryside and estate roles; environmental, water-quality and field sampling technicians; environmental and biological lab technicians and analysts; fisheries assistants; council biodiversity, parks and environment roles; records centre and biodiversity data roles; nursery, tree and horticulture roles; environmental admin, data and outreach roles at conservation organisations.
   - "Graduate" in a title: read the description. If it's open to anyone with a relevant degree (entry level), include it. Drop it only if it's limited to recent, final-year or 2025–2027 graduates, or to a fixed graduation window she falls outside.
   - Fixable gaps: if she misses an essential criterion she could meet within a few weeks, include the role and list the gap in `gaps`, for example "GIS skills (a short QGIS course covers this)", "CIEEM membership (Qualifying member, about £118)", "CSCS card", "PA1/PA6 pesticide certificate", "chainsaw or brushcutter ticket", "Irish driving licence (exchange of her UK licence)".
   - Drop roles where the gap takes longer than a few weeks: years of specialist experience she doesn't have (2+ years beyond what's listed above), a master's, chartered status (CEnv, CEcol and similar need years of experience), protected-species survey licences, or specialist ID skills.
   - Drop roles restricted to GB applicants (she's in Northern Ireland). Republic of Ireland roles are fine (Common Travel Area).
   - Location: Belfast or anywhere in Northern Ireland, a city or large town on the island of Ireland, or fully remote for a UK or Ireland employer that accepts NI-based staff.
   - Part-time, fixed-term and seasonal are fine. Entry, assistant, trainee, technician and officer level.
   - Only open roles: closing date today or later, or posted within 30 days if there's no closing date.

5. Build the full list. Private healthcare comes first: any role whose listing explicitly offers private healthcare (private medical insurance, health insurance, medical cover, BUPA, Vhi, Laya, Irish Life Health; NOT just a health cash plan or employee assistance programme) goes to the TOP of the list, ahead of every role without it, ranked among themselves by fit. The list is cumulative: keep every role already in content/jobs/latest.json that is still open and eligible, drop those that have closed, and add new eligible roles. There's no fixed size; cap only at 60.
   - Re-rank the whole list each day by overall fit to her CV and preferences: field and outdoor roles first, then mixed field and data roles, then desk-based data roles.
   - At a similar fit, roles with no gaps rank above roles with a fixable gap, and Belfast or NI roles, and roles at CEDaR or the National Biodiversity Data Centre, rank higher.
   - Ties go to the role closing sooner.

6. Write content/jobs/latest.json as {"updated":"YYYY-MM-DD","jobs":[...]}, best fit first. Each job has: title, employer, location, region ("ni"|"ireland"|"remote"), salary (as stated, or null), salary_gbp (annual minimum as a number in GBP, euros × 0.85, null if not stated), contract, posted, closes (YYYY-MM-DD or null), setting ("outdoors"|"mixed"|"desk"), requirements (2–4 short essential items from the listing), about (one sentence), how_to_apply, url, source, healthcare (true only if the listing explicitly offers private healthcare as above, otherwise false), gaps (list of short fixable gaps from step 4, empty list if none), first_seen (YYYY-MM-DD; keep the existing value for roles already listed).
   - Never guess a salary, date or requirement. No urgency labels.
   - Add new urls to content/jobs/seen.json.
   - content/jobs/emailed.json lists the urls already sent to Emily by email.

7. Run `npm run build`; it must pass. Commit only content/jobs with the message "Jobs: daily update YYYY-MM-DD" plus the line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", and `git push origin main`.

8. If any role on the page is not yet in content/jobs/emailed.json, send ONE email with the Gmail connector send_message:
   - To emilymoreland9997@gmail.com, cc ryangabriele8@gmail.com.
   - Subject: "Your jobs for <Weekday D Month>: N new".
   - htmlBody: "Morning Emily,", then the top 5 roles not yet emailed, in rank order (if there are more, say how many more are on the page). For each: the title linked to the listing, plus bullets for location · salary · contract · closing date; mostly outdoors, field and desk, or desk-based, with a few words on the work; "Private healthcare included" when it applies; "Needs first:" with any fixable gaps; "Needs:" with the key requirements; and "Apply:" with how to apply. Then a link to https://connectedbiodiversity.com/jobs ("all N open roles, with sorting and filters"). Sign off "Claude, running your job search".
   - Plain, friendly and short. No hype, no all-caps.
   - After sending, add the urls you included to content/jobs/emailed.json, then commit and push that file too ("Jobs: emailed YYYY-MM-DD").
   - If every role on the page has already been emailed, send nothing.

9. Report in two lines: roles on the page, how many are new, how many you dropped as ineligible, whether the email was sent, and any source that failed or was rate-limited.