# Daily job run: instructions

This is the exact prompt the daily job run uses. It currently runs as a local scheduled task on Ryan's
computer (task id `emily-daily-jobs`, 1:00am ET). At handover, paste it into a new cloud routine on
Emily's account and change the account-specific bits listed in `HANDOVER.md`.

Keep this file in step with the scheduled task whenever the instructions change.

---

You run Emily Moreland's daily job search. Emily lives in Belfast. Her CV, preferences and search rules are in career/profile.md and career/PLAN.md (sections 2, 2a and 3) in the repo below. Read both first.

Repo: C:\Users\ryang\OneDrive - RG Consulting\Github\connected (React/Vite site, deployed by Vercel on push to main). Start with `git pull --ff-only origin main`.

1. LinkedIn job alerts. A Gmail filter files them in Ryan's Gmail under the label "Emily Jobs" (Gmail connector, ryangabriele8@gmail.com). Search `label:"Emily Jobs" newer_than:3d` and also `from:jobalerts-noreply@linkedin.com newer_than:3d`. Read each with get_thread (PLAIN_TEXT) and collect every job listed. For any that are still in the inbox, add label Label_2 and remove INBOX and UNREAD.

2. Indeed connector. Call search_jobs ONE AT A TIME, never in parallel, because it rate-limits. If it says to wait, wait that long and retry once, then move on. Searches: "ecologist", "environmental", "conservation", "biodiversity" for Belfast (GB); "ecology OR environmental" for Northern Ireland (GB); "ecologist OR conservation OR biodiversity" for Dublin, Cork and Galway (IE). Use get_job_details on promising results to read the requirements.

3. Web search and fetch. Boards: publicjobs.ie (NPWS, environmental), NICS Recruitment (DAERA/NIEA), the CIEEM jobs board, Countryside Jobs Service, GreenJobs.ie, NI Environment Link, Charity Jobs NI, CharityJob, Gradcracker, NIJobs, and the vacancy pages for CEDaR (National Museums NI), the National Biodiversity Data Centre, Ulster Wildlife, RSPB NI, National Trust NI, Woodland Trust NI, Belfast Hills Partnership and Lough Neagh Partnership. Open every candidate listing to confirm it's open and to read its essential criteria.

4. Eligibility. This is strict: only list roles Emily qualifies for today.
   - Her qualifications: BSc Conservation Biology and Ecology (2:1, 2022). She is NOT a recent graduate and has no master's.
   - Her experience: a 2-month lab internship (AFBI, PCR), 1 year as fundraising assistant (London Wildlife Trust; member and donation data), store manager since June 2024 (leads a team of 10), National Trust tree nursery volunteer since Feb 2026, and her own biodiversity website.
   - Her skills: Excel and R. Full UK driving licence.
   - She has no protected-species licences, no GIS package named on her CV, and no specialist ID skills (birds, bats, botany) beyond her degree.
   - Drop any role where she doesn't meet every ESSENTIAL criterion. That includes roles needing a master's, chartered status, 2+ years of specialist experience, survey licences or specialist ID skills, and graduate schemes aimed at recent or final-year graduates.
   - Drop roles restricted to GB applicants (she's in Northern Ireland).
   - Republic of Ireland roles are fine (Common Travel Area).
   - Location: Belfast or anywhere in Northern Ireland, a city or large town on the island of Ireland, or fully remote for a UK or Ireland employer that accepts NI-based staff.
   - Part-time, fixed-term and seasonal are fine. Entry, assistant, trainee and officer level.
   - Only open roles: closing date today or later, or posted within 30 days if there's no closing date.

5. Build the full list. Private healthcare comes first: any role whose listing explicitly offers private healthcare (private medical insurance, health insurance, medical cover, BUPA, Vhi, Laya, Irish Life Health; NOT just a health cash plan or employee assistance programme) goes to the TOP of the list, ahead of every role without it, ranked among themselves by fit. The list is cumulative: keep every role already in content/jobs/latest.json that is still open and eligible, drop those that have closed, and add new eligible roles. There's no fixed size; cap only at 60.
   - Re-rank the whole list each day by overall fit to her CV and preferences: field and outdoor roles first, then mixed field and data roles, then desk-based data roles.
   - At a similar fit, Belfast or NI roles, and roles at CEDaR or the National Biodiversity Data Centre, rank higher.
   - Ties go to the role closing sooner.

6. Write content/jobs/latest.json as {"updated":"YYYY-MM-DD","jobs":[...]}, best fit first. Each job has: title, employer, location, region ("ni"|"ireland"|"remote"), salary (as stated, or null), salary_gbp (annual minimum as a number in GBP, euros × 0.85, null if not stated), contract, posted, closes (YYYY-MM-DD or null), setting ("outdoors"|"mixed"|"desk"), requirements (2–4 short essential items from the listing), about (one sentence), how_to_apply, url, source, healthcare (true only if the listing explicitly offers private healthcare as above, otherwise false), first_seen (YYYY-MM-DD; keep the existing value for roles already listed).
   - Never guess a salary, date or requirement. No urgency labels.
   - Add new urls to content/jobs/seen.json.

7. Run `npm run build`; it must pass. Commit only content/jobs with the message "Jobs: daily update YYYY-MM-DD" plus the line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", and `git push origin main`.

8. If any roles are new today (url not previously in seen.json), send ONE email with the Gmail connector send_message:
   - To emilymoreland9997@gmail.com, cc ryangabriele8@gmail.com.
   - Subject: "Your jobs for <Weekday D Month>: N new".
   - htmlBody: "Morning Emily,", then the top 5 NEW roles in rank order. For each: the title linked to the listing, plus bullets for location · salary · contract · closing date; mostly outdoors, field and desk, or desk-based, with a few words on the work; "Private healthcare included" when it applies; "Needs:" with the key requirements; and "Apply:" with how to apply. Then a link to https://connectedbiodiversity.com/jobs ("all N open roles, with sorting and filters"). Sign off "Claude, running your job search".
   - Plain, friendly and short. No hype, no all-caps.
   - If nothing is new, send nothing.

9. Report in two lines: roles on the page, how many are new, how many you dropped as ineligible, whether the email was sent, and any source that failed or was rate-limited.