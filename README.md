# 🌬️ BreatheWise — Clean-Air Intelligence for Families

<div align="center">

![BreatheWise Banner](https://img.shields.io/badge/BreatheWise-Clean--Air%20Intelligence-0284c7?style=for-the-badge&logo=airplay&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing%20(TypeScript%205.6)-10b981?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%205%20%7C%20Node.js%20%7C%20Gemini-0ea5e9?style=for-the-badge)
![API Attribution](https://img.shields.io/badge/Data-Open--Meteo%20CAMS%20%26%20NOAA%20GFS-8b5cf6?style=for-the-badge)

<p align="center">
  <strong>A modern, scientific environmental wellness web application empowering urban households navigating severe winter smog, diurnal atmospheric inversion layers, and fine particulate pollution.</strong>
</p>

[Key Features](#-key-features) • [Architecture](#-project-architecture) • [Screenshots](#-ui-preview--screenshots) • [Quick Start](#-quick-start-guide) • [API Configuration](#-api--environment-configuration) • [Deployment](#-deployment-guide)

</div>

---

## 📖 Project Overview

During winter in northern India and urban industrial valleys worldwide, cold nighttime air creates an **atmospheric temperature inversion ceiling**, trapping vehicle exhaust, crop residue smoke, and industrial particulate matter within 100 metres of the ground. 

**BreatheWise** is engineered specifically for families facing these hazardous winter smog conditions. Rather than presenting generic AQI numbers, BreatheWise:
1. **Tracks fine particulate matter (PM2.5 and PM10)** in micrograms per cubic metre ($\mu\text{g/m}^3$) against WHO health benchmarks.
2. **Predicts diurnal boundary layer movements** using Open-Meteo atmospheric dispersion modeling to identify the safest outdoor windows of the day.
3. **Personalizes household routines** based on family vulnerabilities (infants, elderly, asthma), commute habits, kitchen combustion, and room filtration capacity.
4. **Busts dangerous environmental myths** — such as the widespread misconception that potted houseplants can substitute for mechanical HEPA air filtration during smog emergencies.
5. **Separates Personal Exposure Reduction from Community Emission Reduction** in dual transparent impact ledgers.
6. **Delivers conversational AI intelligence** via the official Google Gemini SDK (`@google/genai`) with structured JSON validation and a grounded offline demo fallback.

---

## 🌟 Key Features

### 1. Real-Time Air Quality Dashboard
- **Primary Hero Pollutants:** Accurate PM2.5 and PM10 metrics displayed in $\mu\text{g/m}^3$ with instant WHO 24-hour guideline comparison ratios.
- **Secondary Pollutants:** Tracks Nitrogen Dioxide ($\text{NO}_2$), Ozone ($\text{O}_3$), Sulphur Dioxide ($\text{SO}_2$), and Carbon Monoxide ($\text{CO}$).
- **Explicit AQI Index Standards:** Displays European AQI (EAQI) and US EPA AQI with clearly identified standard curves — never conflated with India's National AQI (NAQI).
- **24-Hour Diurnal Forecast Chart:** Interactive bar visualization projecting hourly particulate concentrations to highlight night inversion peaks vs. afternoon dispersion.
- **Location Geocoding & GPS:** Instant search for Indian and global cities with single-click browser GPS auto-detection.
- **15-Minute Intelligent Cache:** Client-side TTL caching in memory and `sessionStorage` avoids repetitive API calls.
- **Scientific Attribution:** Explicitly labeled as regional atmospheric numerical model data from Open-Meteo (Copernicus CAMS & NOAA GFS), not official Central Pollution Control Board (CPCB) continuous ground-sensor readings.

### 2. ⚡ Simulated Severe Winter Smog Demo Scenario
- **Instant One-Click Simulation:** A dedicated `⚡ Demo Scenario: Severe Winter Smog` toggle allows judges and users in clean-air regions to experience the application's high-smog alerts and emergency routines ($\text{PM2.5} = 225\,\mu\text{g/m}^3$, Severe Smog Tier).
- **Data Honesty:** Prominently flagged with an amber disclaimer banner: *Simulated scenario for demonstration, not live sensor readings*. Includes a one-click *Switch to Live Air Quality* button.

### 3. Household Clean-Air Profile
- **Family Vulnerabilities:** Stepper for adults count, checkable flags for children/infants, seniors (60+), respiratory illness/asthma history, and household pets.
- **Commute Profiling:** Commute transit mode (two-wheeler, open auto, walking, public transit, car) and timing (early morning, morning rush, midday, evening, night).
- **CADR Room Sizing:** Automatically calculates recommended Clean Air Delivery Rate ($\text{CADR} \ge \text{roomSqft} \times 1.55\text{ CFM}$) based on the AHAM AC-1 building standard.
- **Indoor Smoke Sources:** Flags incense/agarbatti burning, indoor tobacco smoking, and dhoop/candles.
- **Persistence:** Saved locally in browser `localStorage`.

### 4. Personalized Daily Routine Planner
- **Diurnal Timeline:** Segmented into Morning (peak nocturnal inversion), Afternoon (solar boundary expansion), and Evening (descending smog plume).
- **Forecast-Derived Safest Window:** Analyzes the 24-hour hourly forecast array to surface the lowest-PM2.5 outdoor window for errands and commutes.
- **Commute Alternatives:** Provides targeted shielding guidance based on transport mode and commute timing.
- **Interactive Checklist:** Checkable action items persisted per day in `localStorage`.

### 5. Evidence-Based Indoor Clean-Air Guide
- **Scientific Myth-Buster:** Cites Waring et al. (2019) to dismantle the myth that indoor plants can filter particulate smog from domestic rooms.
- **The Diurnal Ventilation Rule:** Guidance on the 15-minute midday airing window (1:00 PM – 2:30 PM) to clear indoor $\text{CO}_2$ without admitting dense morning soot plumes.
- **Cooking Containment:** Pre-heating exhaust fans 2 minutes before cooking, keeping lids on frying pans, and isolating kitchen doors.
- **HEPA Maintenance & Placement:** 360° intake clearance, bi-weekly pre-filter vacuuming, and nighttime bedroom sanctuary protocols.
- **Corsi-Rosenthal Box:** Open-source 4-filter + box fan building science alternative for affordable, high-CADR air cleaning.
- **Applied Toggles:** Interactive checklist saving acknowledgments to browser storage.

### 6. Gemini-Powered Clean-Air Assistant
- **Backend AI Integration:** Direct connection to Google Gemini models via `@google/genai` on Express backend.
- **Structured JSON Schema:** Returns typed `summary`, `pollutionContext`, `recommendations` (with effort and personal vs. community impacts), `precautions`, and `sources`.
- **Grounded Safety Boundaries:** Injects current PM2.5, city coordinates, and household profile into the system prompt; strictly forbids hallucinations, medical diagnoses, or invented data.
- **Zero-Key Demo Engine:** Built-in client and server fallback engine responds intelligently using validated environmental facts even when no API key is configured.

### 7. Clean-Air Impact & Exposure Tracker
- **Dual-Ledger Separation:**
  - **Column A — Personal Exposure Reductions:** Physical barriers filtering the user's airways (N95 masks, HEPA purifiers). Clarifies that this does *not* clean outdoor ambient air.
  - **Column B — Community Emission Reductions:** Actions preventing primary pollutants from entering the shared airshed (electric transit, zero burning).
- **Transparent Methodologies:** Displays scientific basis for each entry (e.g. NIOSH 42 CFR 84 for N95 filtration).
- **Zero Hallucinated Numbers:** Refuses to invent arbitrary kilograms of $CO_2$ or health percentage claims without validated factors.
- **Checkable History:** Persists completed action IDs and timestamps in `localStorage`.

---

## 🏗️ Project Architecture

```
breathewise/
├── client/                     # Frontend Single Page Application (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── assistant/      # Structured Gemini Assistant Drawer (ChatDrawer.tsx)
│   │   │   ├── common/         # Header, Card, Safety Disclaimer Banner
│   │   │   ├── dashboard/      # Location Search, AQI Gauges, 24-hr Forecast Chart
│   │   │   ├── guide/          # Indoor Clean-Air Guide & Plant Myth Buster
│   │   │   ├── impact/         # Dual-Ledger Exposure vs. Emission Tracker
│   │   │   ├── profile/        # Household Clean-Air & Vulnerability Profile
│   │   │   └── routine/        # Diurnal Daily Routine & Checklist
│   │   ├── services/
│   │   │   ├── openMeteo.ts    # Geocoding, Reverse Geocoding, Air Quality with 15-min TTL cache
│   │   │   ├── api.ts          # Backend API client with local grounded routine & assistant fallback
│   │   │   └── storage.ts      # Typed localStorage persistence
│   │   ├── types/              # AirQuality, Profile, Routine, Impact data models
│   │   └── utils/              # AQI bands, formatters
│   ├── package.json            # Client dependencies & scripts
│   ├── tsconfig.json           # Client TypeScript configuration
│   ├── tailwind.config.js      # Environmental wellness palette styling
│   ├── vercel.json             # Vercel SPA routing configuration
│   └── vite.config.ts          # Vite configuration with /api proxy to backend
├── server/                     # Backend API Service (Port 5000)
│   ├── src/
│   │   ├── gemini.ts           # @google/genai SDK setup & structured schema instruction
│   │   ├── routes/
│   │   │   ├── assistant.ts    # POST /api/assistant/chat (structured JSON, rate-limited)
│   │   │   ├── advisor.ts      # POST /api/advisor/routine
│   │   │   └── chat.ts         # POST /api/chat
│   │   └── index.ts            # Express application entry & /api/health endpoint
│   ├── .env.example            # Backend environment template
│   ├── package.json            # Server dependencies & scripts
│   └── tsconfig.json           # Server TypeScript configuration
├── .env.example                # Root environment template
├── .gitignore                  # Comprehensive Git exclusion rules
├── CONTRIBUTING.md             # Developer contribution guidelines
├── package.json                # Monorepo root scripts (concurrently dev & build)
├── vercel.json                 # Monorepo root Vercel deployment configuration
└── README.md
```

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TypeScript 5.6, Tailwind CSS 3.4, Lucide React |
| **Backend** | Node.js 20+, Express 4.21, TypeScript 5.6, official `@google/genai` SDK (`^3.6.0`) |
| **APIs** | Open-Meteo Air Quality API, Open-Meteo Geocoding API, OpenStreetMap Nominatim |
| **AI / GenAI** | Google Gemini (`gemini-2.5-flash`), Structured JSON Generation, Custom System Prompts |
| **Storage** | Browser `localStorage` & `sessionStorage` (Zero external database required) |
| **Hosting Targets** | Vercel (Frontend), Render / Railway / Cloud Run (Backend) |

---

## 📸 UI Preview & Screenshots

<div align="center">

| Module | Description |
| :--- | :--- |
| **Air Quality Dashboard** | Hero PM2.5/PM10 cards, European & US AQI gauges, 24-hour diurnal trend chart with pollutant selector tabs. |
| **Simulated Smog Scenario** | Clear amber banner demonstrating severe winter smog ($225\,\mu\text{g/m}^3$) with instant live/simulation toggle. |
| **Household Profile** | Customization of family composition, commute mode and timing, room size CADR, and indoor smoke sources. |
| **Personalized Daily Routine** | Diurnal morning, afternoon, and evening guidance with forecast safest window callout and checklist items. |
| **Indoor Clean-Air Guide** | Actionable cards covering source control, damp dusting, kitchen exhaust, HEPA CADR formulas, and plant myth buster. |
| **Gemini AI Assistant** | Structured clean-air advisor drawer with summary, recommendations, precautions, and scientific source citations. |
| **Impact Tracker** | Dual independent ledgers distinguishing personal exposure shield from community emissions reductions. |

</div>

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **Git:** v2.30+

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/BreatheWise.git
cd BreatheWise
```

### 2. Install Dependencies
Install dependencies for both frontend and backend:
```bash
# Using the root helper script:
npm run install-all

# Or manually:
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Configure Environment Variables
Copy the template to `server/.env`:
```bash
cp .env.example server/.env
```
*(See [API & Environment Configuration](#-api--environment-configuration) for key setup).*

### 4. Start the Application
Run both backend (Port 5000) and frontend (Port 3000) concurrently:
```bash
npm run dev
```

Or run them in separate terminal tabs:
```bash
# Terminal 1 — Backend API
npm run dev:server

# Terminal 2 — Frontend Client
npm run dev:client
```

Open your browser at **`http://localhost:3000`**.

---

## 🔑 API & Environment Configuration

### Environment Variables Reference
BreatheWise uses the following variables (configured in `server/.env`):

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Optional | `5000` | Port for the Express backend server. |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key from [Google AI Studio](https://aistudio.google.com). |
| `GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Gemini model to invoke (`gemini-2.5-flash`, `gemini-1.5-flash`). |
| `VITE_API_URL` | Optional | `""` | Target backend URL if frontend and backend are hosted on separate domains. |

### Grounded Demo Mode (No Key Required)
If `GEMINI_API_KEY` is omitted or blank:
- The backend continues running normally.
- The assistant operates in **Grounded Demo Mode**, returning structured, factual clean-air responses and citations directly from client and server heuristics.
- Daily routine generation operates locally without external API dependencies.
- You can test and demonstrate the entire application without needing an API key.

---

## 🌐 Deployment Guide

### Option 1: Frontend on Vercel + Backend on Render/Railway (Recommended)

#### A. Deploy the Backend (e.g. on Render)
1. Create a new **Web Service** on [Render](https://render.com) connected to your repository.
2. Configure settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `GEMINI_API_KEY`: *your-api-key*
   - `GEMINI_MODEL`: `gemini-2.5-flash`
4. Note your deployed backend URL (e.g., `https://breathewise-backend.onrender.com`).

#### B. Deploy the Frontend on Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Configure settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client` (or use root with included `vercel.json`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://breathewise-backend.onrender.com`
4. Deploy! Vercel will build the React SPA, and all `/api` calls will route to your hosted backend.

---

## 🧪 Testing & Production Build

### Monorepo Build Check
Verify TypeScript compilation and asset bundling across both projects:
```bash
npm run build
```

### Individual Package Builds
```bash
# Build Vite Client
npm run build:client

# Build Express Server
npm run build:server
```

---

## 🔒 Security & Data Privacy

- **Zero Client-Side Credentials:** The Google Gemini API key is accessed exclusively by the server backend. Client JavaScript bundles contain no credentials or tokens.
- **Git Safety:** Root `.gitignore` explicitly prevents `.env` and sensitive local files from ever being staged or committed.
- **Rate Limiting:** The backend enforces a 30 req/min sliding-window IP rate limiter and a 2,000-character input ceiling.
- **Local Storage Isolation:** Household profile details, checklists, and impact logs remain exclusively on the user's browser device.

---

## ⚠️ Scientific Limitations & Disclaimers

1. **Atmospheric Model Estimates:** Air quality metrics are retrieved from the Open-Meteo Air Quality API (Copernicus Atmosphere Monitoring Service - CAMS & NOAA GFS). These are regional numerical dispersion models with $\sim 11\text{ km}$ grid resolution, **not official Central Pollution Control Board (CPCB) continuous ambient air quality monitoring (CAAQMS) sensor measurements**.
2. **AQI Standard Distinctions:** Modelled European AQI (EAQI) and US EPA AQI values follow their respective regulatory formulas and must not be confused with India's National AQI (NAQI). BreatheWise presents raw pollutant concentrations in $\mu\text{g/m}^3$ as the primary scientific metric.
3. **Environmental Guidance, Not Medical Diagnoses:** BreatheWise provides exposure mitigation strategies for households. It does not provide medical diagnoses, clinical treatment plans, or drug prescriptions.

---

## 🤝 Contributing

Contributions are welcomed! Please review [`CONTRIBUTING.md`](CONTRIBUTING.md) for local development workflows, code standards, and the scientific honesty principles that govern the project.

---

## 📄 License

This project's license will be specified upon formal repository release. All original code is copyright (c) 2026 BreatheWise contributors.
