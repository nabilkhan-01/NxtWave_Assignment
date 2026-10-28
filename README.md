# ShipScope — AI Capstone Scope Diagnostic

> Turn an ambitious AI capstone idea into a realistic, buildable first version.

ShipScope is a deterministic, rule-based diagnostic application built for final-year engineering students. It evaluates capstone project specifications, identifies high-risk architecture layers, isolates the essential Version 1 feature set, outlines features to postpone, and provides an observable acceptance test paired with a realistic first-60-minute execution roadmap.

It also includes an interactive growth planning instrument modeling a hypothetical 7-day campaign to reach 500 workshop registrations with a ₹2,000 budget.

---

## 1. Overview & Core Philosophy

Engineering capstones frequently suffer from overscoping: students bundle multi-subject vector indexing, live streaming media, custom deep learning models, mobile apps, user authentication, and admin portals into a single project before verifying that their central input-output transformation works.

ShipScope provides an objective, transparent, and explainable scoping evaluation:
- **Rule-Based & Deterministic:** No non-deterministic LLM calls or external AI APIs. Identical inputs will always produce identical diagnostic verdicts.
- **Intentional Visual Identity (No AI Slop):** Designed as an editorial engineering workbench using paper and ink tones, hairline borders, and a singular cobalt accent. No generic purple gradients, neon glowing blobs, or decorative placeholders.
- **Privacy First:** 100% client-side execution. No user tracking, no authentication, no external databases.

---

## 2. Intentional Teaching Case Studies

ShipScope includes four preloaded case studies demonstrating how distinct types of scope complexity can be narrowed down:

| Preset | Initial Broad Ambition | Scoped Version 1 Direction | Features Postponed |
| :--- | :--- | :--- | :--- |
| **Course Notes Q&A** | Multi-subject vector search, citations, user study accounts, quizzes | Single-document plain text or PDF retrieval with verbatim passage citation | Multi-subject indexing, vector DB clusters, persistent user accounts, quiz generation |
| **Resume–Job Matcher** | Web scraping job boards, candidate ranking, interview probability claims | 1:1 text comparison of one resume against one job description | Automated scrapers, candidate ranking heuristics, portal integrations |
| **Campus Issue Triage** | Grievance portal, role-based auth, SMS/email alerts, admin dashboard | Text classification of single complaint into a predefined department | Live ticketing queues, auth hierarchies, notification gateways |
| **AI Lecture Companion** | Real-time classroom audio recording, live speech-to-text, smartphone sync | Structured summary and 3 revision questions from an existing transcript | Live audio capture, speaker diarization, real-time cross-device WebSockets |

---

## 3. Scope Assessment Engine

The diagnostic engine ([`src/logic/assessment.ts`](src/logic/assessment.ts)) evaluates submitted text against transparent complexity criteria:

### Complexity Heuristics
- **Streaming Media & Computer Vision:** Detects live camera, audio streaming, speech recognition, and OpenCV/YOLO pipelines.
- **Custom Model Training & Datasets:** Flags custom model training from scratch, annotation pipelines, and fine-tuning overhead.
- **Multi-Platform Deployment:** Identifies dual mobile/web codebases, React Native/Flutter, and cross-device sync.
- **Infrastructure & Auth:** Detects role-based access control, JWT/OAuth, and administrative portals.
- **Payments & Commerce:** Flags payment gateways, wallets, and subscription workflows.
- **External Gateways:** Detects SMS, email, and WhatsApp notification systems.
- **Heavy Retrieval (RAG):** Identifies multi-document parsing and vector database clusters.

### Diagnostic Classifications
- **`Manageable First Version` (`Strong fit`):** Focused single-input to single-output flow with a clear proof of concept.
- **`Scope Needs Narrowing` (`Moderate fit`):** Strong core idea with secondary workflow, infrastructure, or account bloat that should be postponed.
- **`Too Broad for a 1st Version` (`Low fit`):** High-risk architecture (streaming media, custom training, multi-platform sync) likely to stall a student team.
- **`Needs More Definition` (`Needs definition`):** Vague, conceptual, or career-goal text lacking concrete inputs, transformation mechanisms, or output formats. Rather than inventing technical architecture, ShipScope guides the student to define input/output contracts first.

---

## 4. Growth Simulator Model (Hypothetical Campaign)

ShipScope includes an interactive scenario simulator ([`src/components/GrowthSimulator.tsx`](src/components/GrowthSimulator.tsx) and [`src/logic/growthSimulator.ts`](src/logic/growthSimulator.ts)) modeling a hypothetical 7-day campus outreach campaign (₹2,000 budget, 500 registration target):

### Pure Funnel Formulas
```text
Gross Exposures = Connectors × Groups per Connector × Average Group Size
Estimated Unique Reach = Gross Exposures × (1 - Overlap Rate)
Estimated Visits = Estimated Unique Reach × Visit Rate
Estimated Direct Registrations = Estimated Visits × Registration Conversion Rate
Estimated Referral Registrations = Estimated Direct Registrations × K
Estimated Total Registrations = Estimated Direct Registrations + Estimated Referral Registrations
Estimated Cost per Registration = Budget / Estimated Total Registrations
```

*Note: $K$ represents estimated incremental unique referral registrations per direct registration. All campaign metrics are explicit mathematical estimates for planning purposes, not measured live data.*

### Planning Scenarios
1. **Conservative Assumptions:** Low connector count and cautious conversion (8 connectors, 3 groups, 100 students, 30% overlap, 5% visit rate, 12% reg rate, $K=0.15$) $\rightarrow$ ~12 registrations, flags distribution bottleneck.
2. **Base Planning Assumptions:** Realistic middle-ground planning model (15 connectors, 4 groups, 120 students, 25% overlap, 8% visit rate, 20% reg rate, $K=0.25$) $\rightarrow$ 108 registrations, ₹18.52 CPR, highlights remaining gap to 500.
3. **Stretch Assumptions:** High-engagement model required to approach or exceed target (30 connectors, 5 groups, 150 students, 15% overlap, 12% visit rate, 25% reg rate, $K=0.40$) $\rightarrow$ 804 registrations, target met.

### Decision Guidance & Sensitivity Logic
- Identifies current primary constraints dynamically (Distribution Bottleneck, Invitation-to-Visit Bottleneck, Conversion Bottleneck, or Weak Peer Multiplier).
- Surfaces practical sensitivity cues: **Biggest Lever** and **Biggest Risk**.

### 7-Day Campaign Playbook
- **Days 1–2 (Seed Distribution):** Recruit campus connectors, club leads, and distribute attribution-tagged WhatsApp links.
- **Days 3–4 (Diagnose Funnel):** Analyze early incoming metrics to locate conversion drop-offs.
- **Days 5–6 (Concentrate Effort):** Reallocate attention toward high-performing engineering channels and refine messaging hooks.
- **Day 7 (Final Push & Reconciliation):** Send final session reminders, tally unique registrations, and compute final cost per acquisition.

---

## 5. Technology Stack

- **Framework:** React 18 + TypeScript (strict mode, isolated modules)
- **Build Tool:** Vite 5
- **Testing:** Vitest 2
- **Styling:** Vanilla CSS with custom design tokens (no bulky component libraries)
- **Zero External Runtime Bloat:** Self-contained, lightweight, and fast.

---

## 6. Getting Started

### Prerequisites
- Node.js (v18+ recommended, verified on v24)
- npm (v9+ recommended, verified on v12)

### Installation
```bash
git clone https://github.com/nabilkhan-01/NxtWave_Assignment.git
cd NxtWave_Assignment
npm install
```

### Development Server
```bash
npm run dev
```
Starts the local development server at `http://localhost:5173`.

### Automated Unit Tests
```bash
npm test
```
Executes all 28 Vitest tests covering assessment heuristics, preset classifications, edge cases, underspecified input handling, growth calculations, and attribution logic.

### Production Build & Preview
```bash
npm run build
npm run preview
```
Compiles TypeScript and outputs the optimized static production bundle to `dist/`.

### Deployment Notes
ShipScope is built as a zero-backend, pure client-side static web application with relative asset bundling. It can be deployed to any static host without server configuration:

- **Vercel / Netlify:** Connect the GitHub repository `https://github.com/nabilkhan-01/NxtWave_Assignment.git`, set build command to `npm run build`, and output directory to `dist`.
- **GitHub Pages:** Run `npm run build`, push `dist/` to the `gh-pages` branch, or configure GitHub Actions with `actions/deploy-pages`.
- **Surge / S3:** Deploy the compiled `dist/` directory directly (`npx surge dist`).

---

## 7. Limitations & Stated Assumptions

- **Heuristic Diagnostic:** ShipScope is an engineering planning tool. The rule-based scope indicator does **not** predict academic marks, viva outcomes, faculty approval, or hiring chances.
- **No Remote AI Backend:** All parsing is deterministic and executes locally in the student's browser. No non-deterministic LLM APIs or cloud dependencies are involved.
- **Simulation Disclaimer:** The growth campaign simulation is a hypothetical projection tool designed to demonstrate funnel mechanics; it does not represent live campus registrations or verified outcomes.
- **Privacy & Data Security:** Zero personal data is requested or collected. User project drafts and specifications remain entirely local and are never logged, transmitted to external servers, or placed into sharing URLs.
- **No Workshop Backend:** The workshop CTA (*"Simulate registration"*) is an explicit client-side prototype demonstration; no real workshop submissions are created, and no student contact information is gathered.
