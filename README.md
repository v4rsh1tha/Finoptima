FinOptima 💳

Find your perfect credit card, ranked by how well it actually fits you.

FinOptima is a full-stack credit card recommendation engine. You answer a short survey about your spending habits and preferences, and a multi-layer scoring engine ranks ~60 real credit cards to find your best matches — with clear, explainable reasons for every recommendation.

Live Demo • Report a bug

Note: the backend runs on Render's free tier, which sleeps after 15 minutes of inactivity. The first request after a while may take 30–50 seconds to respond while it wakes up — totally normal, just give it a moment.

✨ Features
Multi-step survey — spending habits, travel patterns, and preferences, captured through an intuitive, icon-based UI (no boring dropdowns).
Five-layer scoring engine — every card is scored across:
Intent detection — figures out why you want a card (cashback, travel, building credit, etc.) from your answers.
Eligibility — checks whether you'd realistically qualify, based on credit score, income, and existing bank relationships.
Weighted fit — blends ~10 factors (fees, reward rate, welcome bonus, lounge access, digital features, lifestyle perks) with weights that shift based on your detected intent.
Rupee-value math — calculates real projected annual value from your actual spend across categories, minus fees.
Competitive scoring — avoids returning five near-identical cards by nudging results based on how they complement each other.
Explainable results — every recommendation comes with plain-language reasons, not just a black-box score.
~60-card dataset — covers major Indian banks, with logos and detailed fee/reward/eligibility data for each.
🛠️ Tech Stack
Layer	Technology
Frontend	React, React Router, Context API
Backend	Flask (Python), Flask-CORS
Scoring	Custom rule-based + weighted scoring engine
Data	JSON-based card catalog with a sanitization/validation layer
Deployment	Vercel (frontend) + Render (backend)
🚀 Getting Started (run it locally)
Prerequisites
Python 3.10+
Node.js (includes npm)
Setup
bash
# Clone the repo
git clone https://github.com/v4rsh1tha/FINOPTIMA-CODE.git
cd FINOPTIMA-CODE

# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
cp .env.example .env
Run it

You need two terminals, since the frontend and backend are separate servers:

bash
# Terminal 1 — backend (Flask API, port 5000)
cd backend
python app.py

# Terminal 2 — frontend (React app, port 3000)
cd frontend
npm start

Open http://localhost:3000 in your browser.

Windows users: setup-finoptima.bat (first-time install) and start-finoptima.bat (every run after that) in the project root automate the steps above — just double-click.

🧠 How the Scoring Works

When you submit the survey, your answers hit POST /api/recommend, where each candidate card is run through the five scoring layers described above. The layer scores are combined with configurable weights (see backend/config/scoring_functions.json) into one final score, and the top 5 cards are returned — each with a short explanation of why it was recommended.

📁 Project Structure
finoptima/
├── backend/
│   ├── app.py                 # Flask API entrypoint
│   ├── engine/
│   │   ├── scorer.py          # Core scoring logic (5 layers)
│   │   ├── intent.py          # Intent detection from survey answers
│   │   ├── explainer.py       # Generates human-readable reasons
│   │   └── data_sanitizer.py  # Cleans/validates the card dataset
│   ├── config/                # Scoring weights & adjacency configs (JSON)
│   ├── data/                  # Card catalog (cards_data.json)
│   └── tests/                 # Backtesting across sample user profiles
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── survey/        # Multi-step survey UI
│       │   ├── LandingPage.jsx
│       │   └── Results.jsx
│       └── context/           # Shared survey state (React Context)
└── logos/                     # Bank/card logo assets
🌐 Deployment

This project is deployed as two independent services:

Backend on Render — backend/ as root directory, pip install -r requirements.txt to build, python app.py to run.
Frontend on Vercel — frontend/ as root directory, Create React App preset, REACT_APP_API_URL set to the live Render backend URL.

Full step-by-step deployment instructions are in DEPLOY.md.

📄 License

This project is for portfolio/educational purposes.
