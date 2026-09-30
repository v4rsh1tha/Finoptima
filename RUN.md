# Running FinOptima

## First time only

Double-click **`setup-finoptima.bat`** in this folder.

This installs everything needed (Python packages for the backend, Node
packages for the frontend) and sets up the frontend's `.env` file. It
can take a minute or two — just let it finish.

## Every time after that

Double-click **`start-finoptima.bat`**.

This opens two windows automatically:
- **FinOptima Backend** — the Flask API on `http://127.0.0.1:5000`
- **FinOptima Frontend** — the React app on `http://localhost:3000`
  (your browser should open to this automatically)

**Keep both windows open** while you use the app. When you're done,
just close them (or click into each and press `Ctrl+C`).

## Troubleshooting

- **"Failed to fetch" / "Something went wrong" in the app** — usually
  means the backend window isn't running. Check that its window shows
  `Running on http://127.0.0.1:5000` with no errors.
- **A red `WARNING: This is a development server...` line** — this is
  normal and safe to ignore for local use. It's Flask reminding you
  its built-in server isn't meant for real public deployment.
- **"python" or "npm" not recognized** — Python and/or Node.js aren't
  installed, or aren't on your system PATH. Install them from
  python.org and nodejs.org, then re-run `setup-finoptima.bat`.
