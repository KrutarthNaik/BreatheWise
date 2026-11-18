# Contributing to BreatheWise

Thank you for your interest in contributing to **BreatheWise**! Our mission is to deliver reliable, evidence-backed environmental wellness intelligence for urban families navigating severe winter smog, diurnal temperature inversions, and fine particulate air pollution.

---

## 🧭 Code of Conduct & Core Scientific Principles

When contributing code, documentation, or advice to BreatheWise, you must adhere to the following non-negotiable principles:

1. **Modelled vs. Sensor Data Honesty:**
   - Always clearly distinguish regional atmospheric numerical model data (e.g., Open-Meteo Copernicus CAMS & NOAA GFS) from official government continuous ambient air monitoring stations (e.g., CPCB CAAQMS).
   - Never present simulated, modeled, or cached readings as live sensor observations.
2. **Medical Boundaries:**
   - BreatheWise provides environmental exposure mitigation strategies, **not clinical medical diagnoses, drug prescriptions, or treatment regimens**.
   - Always frame health recommendations cautiously, advising users to consult licensed medical practitioners for clinical needs.
3. **Exposure vs. Emission Distinction:**
   - Always maintain a clear separation between **Personal Exposure Reduction** (actions filtering what enters a user's lungs, such as wearing an N95 mask or operating a room HEPA purifier) and **Community Emission Reduction** (actions reducing primary pollutants emitted into the airshed, such as electric transit or avoiding waste burning).
   - Never claim personal protective equipment cleans the city's outdoor ambient air.
4. **Houseplant Myth Reality:**
   - Never claim indoor houseplants substitute for mechanical HEPA air filtration during severe smog events. Any botanical references must cite empirical chamber vs. room findings (e.g., Waring et al., 2019).
5. **No Invented Metrics:**
   - Never invent arbitrary kilograms of $CO_2$ saved or percentages of health benefit without citing verified, peer-reviewed methodologies. If an empirical emission factor is not available, use transparent qualitative impact labels.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **Git:** v2.30+

### Clone & Install
```bash
# Clone your fork
git clone https://github.com/<your-username>/BreatheWise.git
cd BreatheWise

# Install client and server dependencies
cd client && npm install
cd ../server && npm install
cd ..
```

### Running Locally
You can run both frontend and backend concurrently:
```bash
npm run dev
```
Or in separate terminal tabs:
```bash
# Tab 1: Express Server (Port 5000)
npm run dev:server

# Tab 2: Vite Client (Port 3000)
npm run dev:client
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌿 Branching & Git Workflow

1. **Create a topic branch from `main`:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
2. **Commit Hygiene:**
   - Use clear, descriptive commit messages adhering to conventional commits (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
   - **Never commit `.env` files or API credentials.** Check `git status` before committing.
3. **Verify Builds Before Submitting:**
   Both the frontend and backend must build cleanly without TypeScript errors or broken imports:
   ```bash
   # From root:
   npm run build
   ```
4. **Submit a Pull Request:**
   - Push your branch to GitHub: `git push origin feature/your-feature-name`
   - Open a Pull Request targeting the `main` branch.
   - Provide a clear description of the problem solved, testing steps performed, and any UI changes (with screenshots).

---

## 🐛 Reporting Bugs & Suggesting Enhancements

- Use the GitHub Issues tracker to report bugs.
- Include your operating system, browser version, reproduction steps, and console logs.
- For feature suggestions, explain how the proposal aligns with BreatheWise's core mission of winter smog resilience and data transparency.
