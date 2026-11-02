# Handing the kit over to Emily

Everything except the accounts below lives in this repo, so the handover is mostly moving ownership
and recreating one scheduled run on her account. Allow an afternoon, done together.

## 1. Code and site

1. GitHub: transfer `Ryangab8/connected` to Emily's GitHub account (Settings → Danger Zone → Transfer),
   or add her as an owner.
2. Vercel: transfer the project to her Vercel account, or invite her to it. Check that a push to main
   still deploys connectedbiodiversity.com, and that the domain stays connected.

## 2. Claude

1. Emily signs in to Claude Code with her Pro plan and connects her GitHub.
2. In claude.ai, she connects the Gmail and Indeed connectors to her account.
3. She creates a cloud routine (claude.ai/code/routines, or `/schedule` in Claude Code):
   - Repository: `connected`.
   - Schedule: daily, around 6:00am Belfast time.
   - Prompt: the text of `career/daily-jobs-routine.md`, with these changes:
     - Repo line: replace the Windows path with "this repository".
     - Step 1: read the LinkedIn alerts from her Gmail, using her own label and its label id.
     - Step 8: send the email from her Gmail to herself, or drop the email and just use the
       `/jobs` page.
4. On Ryan's computer, disable the local scheduled task `emily-daily-jobs` so it doesn't run twice.

## 3. Accounts to recreate on her side

- LinkedIn job alerts on her LinkedIn: biodiversity (Remote), biodiversity belfast, ecology belfast.
  Delivery: email only.
- A Gmail filter on her account: from `jobalerts-noreply@linkedin.com`, Skip the Inbox, Mark as read,
  apply her job label.
- Ryan can then delete his three alerts, his Gmail filter and the "Emily Jobs" label.

## 4. What stays local

- Her full CV (`career/*.docx`) is gitignored, so it never goes to GitHub or the site. Send her the
  latest copy directly. `career/profile.md` is the version the job run reads; keep it current when her
  CV changes.

## 5. Check after the first run on her account

- `/jobs` shows the new date.
- The commit "Jobs: daily update <date>" appears on GitHub.
- The email arrived, if it's still in use.
