# Moving Emily's daily job run to the cloud

Goal: the daily run lives on Emily's Claude account as a cloud scheduled task, so nobody's computer has
to be on. Ryan keeps his job alerts, the GitHub repo and the Vercel site. His alerts forward to Emily's
Gmail, so she can add her own alerts and they all land in one place. About 20 minutes, done together.

## Ryan

1. **GitHub:** repo Settings → Collaborators → add Emily with write access. The site stays on Ryan's
   Vercel and keeps deploying from main.
2. **Gmail forwarding:** Settings → Forwarding and POP/IMAP → Add a forwarding address →
   `emilymoreland9997@gmail.com`. Emily gets a confirmation email; she clicks the link or reads you the code.
   Leave the page set to **Disable forwarding**, so only the filter below forwards anything.
3. **Gmail filter:** Create a filter with From set to
   `jobs.nijobs.com OR jobalerts-noreply@linkedin.com OR servms.co.uk OR greenjobs.co.uk OR nienvironmentlink.org`.
   Tick **Skip the Inbox**, **Mark as read**, **Apply the label: Emily Jobs** and
   **Forward it to: emilymoreland9997@gmail.com**. Add new senders here as alerts are added.

## Emily

4. **GitHub:** create a free account if needed and accept Ryan's invite.
5. **Gmail:** create a label called `Emily Jobs`, then a filter with the same From list:
   **Skip the Inbox**, **Mark as read**, **Apply the label: Emily Jobs**. Add her own alert senders over time.
6. **Connectors:** at claude.ai/customize/connectors, connect **Gmail** and **Indeed**.
7. **Scheduled task:** at claude.ai/code/routines, choose new, connect GitHub if asked, then set:
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

8. Click **Run now** and watch the first run.

## Check the first run

- GitHub shows a commit "Jobs: daily update <date>" on main from Emily's account.
- Vercel deployed it, and connectedbiodiversity.com/jobs shows the new date.
- If there were roles she hadn't been sent, the email arrived, copied to Ryan.
- The run's report lists no boards blocked by the network.

## Then

9. **Ryan: turn off the local task the same day.** In the sidebar under Scheduled, pause
   "Emily's daily job feed". If both run, they compete on main and repeat the work.
   `content/jobs/emailed.json` lives in the repo, so Emily won't be re-sent what she has already had.
10. `career/daily-jobs-routine.md` can then be deleted; `career/cloud-routine-instructions.md` replaces it.

## Good to know

- Commits and emails from the run appear as Emily, and it draws on her Pro usage. One run a day should
  be comfortable, but check claude.ai/settings/usage after the first week.
- Scheduled tasks are in research preview, so details can change.
- Her full CV (`career/*.docx`) is gitignored. `career/profile.md` is what the run reads; keep it current.
