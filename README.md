# LegalConnect — MERN Prototype

A working scaffold of the LegalConnect platform from the capstone report:
a MongoDB + Express (Node) + React app implementing provider discovery,
tiers, and the incentive/gamification logic from Section VI of the report.

```
legalconnect-app/
├── backend/                 Node.js + Express + Mongoose API
│   └── src/
│       ├── config/db.js         MongoDB connection
│       ├── models/Provider.js   Provider schema (tier, rating, etc.)
│       ├── controllers/         Route handlers (search, onboarding, tier logic)
│       ├── routes/              Express routes
│       ├── utils/tier.js        Tier computation (mirrors Table II)
│       └── seed/                CSV → MongoDB import script + sample data
└── frontend/                React (Vite) app
    └── src/
        ├── pages/            Home, Discovery (search/filter), Provider detail
        ├── components/       ProviderCard, TierBadge, SearchFilters
        └── api.js            Fetch wrapper for the backend API
```

---

## 1. Where to get real data

You don't have to hand-enter providers — there are free, legitimate
datasets you can seed the database with:

| Source | What it has | Link |
|---|---|---|
| **data.gov.in — "All India Advocate List"** | District-wise advocates: enrollment number, name, address, date of enrollment | https://www.data.gov.in/catalog/all-india-advocate-list |
| **eCourts India** | Case, order, and litigant/lawyer records across SC/HC/District courts | https://ecourts.gov.in |
| **Justice Hub (DAKSH)** | State-level indicators for police, prisons, judiciary, legal aid (India Justice Report) | https://www.justicehub.in/dataset |
| **Development Data Lab — "Big Data for Justice"** | 80M+ de-identified lower-court case records (2010–2018), includes advocate gender/name fields | https://devdatalab.medium.com/big-data-for-justice-f53e0e14c9c9 |

**Recommended for this project:** the data.gov.in Advocate List, because
its columns (enrollment number, name, address, district, state, date of
enrollment) map almost directly onto the `Provider` model's regulatory
fields. It won't contain marketplace-only fields like rating or tier —
the seed script fabricates those for demo purposes (see below), and in
a real deployment they'd instead be populated as your platform runs
(client ratings, actual engagement counts, etc.), exactly as described
in Section VI of the report.

None of the datasets above include phone numbers or emails for public
redistribution — for a real product you'd collect that directly from
providers during onboarding, not scrape or buy a contact-info database.

## 2. How the sample data works

`backend/src/seed/sample_advocates.csv` is a small, fabricated CSV in
the same shape as the data.gov.in file, so you can run the whole app
immediately without downloading anything. When you're ready to use
real data:

1. Download the CSV from data.gov.in (or export the columns you need
   from any of the sources above).
2. Make sure the columns are named (or rename them to):
   `enrollment_number, name, address, district, state, date_of_enrollment`
3. Drop the file anywhere and run:
   ```bash
   npm run seed -- path/to/your_real_data.csv
   ```
   (Edit `mapRow()` in `importAdvocates.js` if your column names differ.)

The import script enriches each row with the fields a regulatory list
doesn't have — specialization, rating, engagement count, response
time, tier — using simple randomization so you have a realistic-looking
marketplace to demo. Swap that randomization for real numbers once the
platform is actually running.

## 3. Running it

**Prerequisites:** Node.js 18+, and MongoDB running locally (or a
MongoDB Atlas connection string).

```bash
# 1. Backend
cd backend
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run seed               # loads sample_advocates.csv into MongoDB
npm run dev                 # starts API on http://localhost:5000

# 2. Frontend (in a new terminal)
cd frontend
npm install
npm run dev                 # starts React app on http://localhost:5173
```

Open http://localhost:5173 — the Discover page lets you search/filter
providers by type, district, and tier, matching the discovery service
described in Section V-D of the report.

## 4. How this maps to the report

| Report section | Where it lives in the code |
|---|---|
| V-C Incentive Engine | `utils/tier.js`, `controllers/providerController.js` (`recordEngagement`) |
| V-D Discovery Service | `GET /api/providers` with `type`/`district`/`specialization`/`tier` filters |
| VI. Incentive Design (Table II) | Tier thresholds in `computeTier()` |
| VII. Stakeholder personas | `providerType` enum on the `Provider` model |
| VIII. Technology stack | This is literally it: MongoDB + Node/Express + React |

## 5. Extending it

This is a scaffold, not the full platform — natural next steps:
- Add authentication (JWT) for providers and clients.
- Add a real onboarding form (`POST /api/providers`) as a multi-step
  React form instead of API calls only.
- Add the referral/milestone bonus payout logic as a scheduled job.
- Add the verification workflow (credential upload + admin review).
- Deploy: MongoDB Atlas (free tier) + Render/Railway for the API +
  Vercel/Netlify for the frontend.
