# Moving Emily's daily job run to the cloud

Goal: the daily run and its job alerts live entirely on Emily's accounts, on her Claude Pro usage, as a
cloud scheduled task, so nobody's computer has to be on. Ryan's email drops out. The repo and site stay
as they are; she's already a collaborator.

## Emily

1. **Job alerts:** sign up with her own email. Daily emails where offered.

   | Site | Alerts |
   | --- | --- |
   | linkedin.com/jobs (search, then turn on **Set alert**) | ecology, environmental and conservation in Northern Ireland; laboratory technician in Belfast; ecology in Ireland |
   | nijobs.com | ecology, environmental and conservation in Belfast |
   | environmentjob.co.uk | environmental jobs in Northern Ireland, plus remote |
   | greenjobs.co.uk | Northern Ireland |
   | nienvironmentlink.org | jobs and opportunities emails |

   Worth adding: indeed.co.uk (ecology, environmental, laboratory technician, water quality, Belfast) and
   publicjobs.ie (environmental).

2. **Gmail:** create a label called `Emily Jobs`, then a filter with From set to
   `jobs.nijobs.com OR jobalerts-noreply@linkedin.com OR servms.co.uk OR greenjobs.co.uk OR nienvironmentlink.org`.
   Tick **Skip the Inbox**, **Mark as read** and **Apply the label: Emily Jobs**. environmentjob's alerts
   come from `servms.co.uk`.
3. **Connectors:** at claude.ai/customize/connectors, connect **Gmail** and **Indeed**.
4. **Scheduled task:** at claude.ai/code/routines, choose new, connect GitHub if asked, then set:
   - **Name:** Daily job search
   - **Prompt:** the block below
   - **Trigger:** Schedule, daily, 6:07am Belfast time
   - **Advanced settings → Repository:** `Ryangab8/connected`. If it isn't listed, Ryan installs the Claude
     GitHub app on the repo.
   - **Advanced settings → Cloud environment:** edit it and set **Network access** to **Full**. The default
     blocks job boards.
   - **Advanced settings → Connectors:** keep Gmail and Indeed; remove the rest.

   ```
   Follow career/cloud-routine-instructions.md in this repository exactly, from start to finish.
   Commit and push directly to main, not to a claude/ branch.
   ```

5. Click **Run now** and watch the first run. Her first alerts may take a day to arrive; the run still
   works from Indeed and the job boards until then.

## Check the first run

- GitHub shows a commit "Jobs: daily update <date>" on main from Emily's account.
- Vercel deployed it, and connectedbiodiversity.com/jobs shows the new date.
- If there were roles she hadn't been sent, the email arrived, copied to Ryan.
- The run's report lists no boards blocked by the network.

## Ryan, once that works

6. **Pause the local task the same day:** in the sidebar under Scheduled, pause "Emily's daily job feed". If
   both run, they compete on main and repeat the work. `content/jobs/emailed.json` lives in the repo, so
   Emily won't be re-sent what she has already had.
7. Delete his alerts and filters whenever he likes, and `career/daily-jobs-routine.md`, which
   `career/cloud-routine-instructions.md` replaces.

## Good to know

- Commits and emails from the run appear as Emily, and it draws on her Pro usage. One run a day should
  be comfortable, but check claude.ai/settings/usage after the first week.
- Scheduled tasks are in research preview, so details can change.
- Her full CV (`career/*.docx`) is gitignored. `career/profile.md` is what the run reads; keep it current.
