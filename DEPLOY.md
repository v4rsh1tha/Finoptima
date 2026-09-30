# Deploying FinOptima Live (so you have a real clickable link)

This gets you a working URL you can put in job applications, like
`https://finoptima.vercel.app` — no terminal needed for the actual
hosting, just GitHub uploads and a couple of web dashboards.

Your repo: **https://github.com/v4rsh1tha/FINOPTIMA-CODE**

You're deploying two separate pieces:
- **Backend** (Flask API) → Render
- **Frontend** (React app) → Vercel

---

## Step 1 — Update your GitHub repo with the fixed code

1. Go to **https://github.com/v4rsh1tha/FINOPTIMA-CODE**.
2. Click **Add file → Upload files**.
3. Drag in everything from this project folder (the one with
   `backend/`, `frontend/`, `RUN.md`, etc.) — this overwrites the old
   version in your repo with the fixed one.
4. Commit the changes (bottom of the page — you can just use the
   default commit message).

---

## Step 2 — Deploy the backend on Render

1. Go to **render.com**, sign up/log in (GitHub login works).
2. **New + → Web Service**.
3. Connect your GitHub account, select the **FINOPTIMA-CODE** repo.
4. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - **Instance Type:** Free
5. Click **Create Web Service**. Wait for the build to finish (a few
   minutes). You'll get a live URL like:
   ```
   https://finoptima-backend.onrender.com
   ```
   **Copy this URL** — you need it in Step 3.

Note: Render's free tier "sleeps" after 15 min of no traffic and takes
~30-50 seconds to wake up on the first request after that. Fine for a
portfolio link, just don't be surprised by the first slow load.

---

## Step 3 — Point the frontend at your real backend URL

In `frontend/.env.production`, replace the placeholder with the real
Render URL from Step 2:

```
REACT_APP_API_URL=https://finoptima-backend.onrender.com
```

(No trailing slash.) Save the file, then re-upload it to GitHub the
same way as Step 1 (or just edit it directly on github.com — click the
file, click the pencil/edit icon, change the line, commit).

---

## Step 4 — Deploy the frontend on Vercel

1. Go to **vercel.com**, sign up/log in (GitHub login works).
2. **Add New → Project**.
3. Import the **FINOPTIMA-CODE** repo.
4. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App (should auto-detect)
   - **Build Command:** `npm run build` (default, leave as is)
   - **Output Directory:** `build` (default, leave as is)
5. Click **Deploy**. Wait a minute or two.
6. You'll get a live URL like:
   ```
   https://finoptima.vercel.app
   ```
   **This is the link you share in job applications.**

---

## Step 5 — Test it

Open the Vercel URL in a browser (or your phone), go through the
survey, and confirm you get real card recommendations at the end. If
you see "Failed to fetch" here, double check:
- The `.env.production` value matches your actual Render URL exactly
  (no typo, correct `https://`, no trailing slash).
- The Render backend shows "Live" (not "Failed") in the Render
  dashboard.

---

## After this: your application link

Once both are live, use the **Vercel URL** as your "something you've
built" link in job applications — clicking it opens the actual working
app, not source code.
