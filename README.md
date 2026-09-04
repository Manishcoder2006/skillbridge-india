# SkillBridge India 🇮🇳
### *National Portal for Academia–Industry Collaboration for Skill Mapping, Internships & Placements*
**Smart India Hackathon (SIH 2026) — Problem Statement ID: 26044**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_1.5-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq LPU](https://img.shields.io/badge/AI-Groq_LPU_Inference-F05032?style=flat)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Executive Summary

**SkillBridge India** is a next-generation national digital infrastructure platform engineered to bridge the critical disconnect between tertiary academic curricula and high-velocity industry hiring expectations. Built with high security, multi-tenant isolation, and a hybrid AI engine (Google Gemini 1.5 + Groq LPU), SkillBridge India empowers institutions, students, and recruiters to collaboratively map skills, eliminate skill deficits, conduct mock interviews, and unlock verified placement pipelines.

---

## 🚀 Key Platform Capabilities

### 👨‍🎓 1. For Students
- **Real-Time AI Voice & Video Mock Interviews**: Interactive, role-tailored technical & behavioral interview simulation with camera & microphone integration, speech-to-text feedback, tone analysis, and actionable scorecards.
- **AI Micro-Learning Tutor**: On-demand conceptual breakdowns, bite-sized video learning modules, interactive flashcards, and diagnostic self-assessment quizzes.
- **Dynamic Skill Gap Analysis**: Automatically benchmarks student skill profiles against real market requirements and suggests personalized SWAYAM/NPTEL learning pathways.
- **ATS Resume Builder & Auditor**: Generates industry-standard resumes with instant AI scoring against target job descriptions.
- **Direct Opportunity Applications**: Direct application pipelines to verified internships, apprenticeships, and entry-level positions.

### 🏫 2. For Academicians & Faculty Mentors
- **Cohort Skill Analytics**: Real-time departmental dashboards tracking batch performance, skill gaps, and placement readiness.
- **Curriculum Alignment Engine**: AI-assisted insights pinpointing outdated modules and recommending market-relevant curriculum upgrades.
- **Institutional Governance**: Manage student cohorts, review verified achievements, and sanction academic project proposals.
- **Industry Collaboration Hub**: Direct collaboration channels between faculty and corporate R&D units.

### 🏢 3. For Industry Recruiters & Corporate HR
- **Multi-Tenant Corporate Portal**: Secure company workspace for posting internships, fellowships, and graduate job openings.
- **AI Hybrid Compatibility Matcher**: Scores applicants utilizing Gemini reasoning combined with Groq's high-throughput Llama 3.3 models to yield precise match ratings without recruiter bias.
- **Applicant Tracking System (ATS)**: Complete recruitment funnel from application triage to scheduling interviews and extending offers.
- **Skill Benchmark Insights**: Granular visibility into talent density across regional institutes and university tiers.

### 🛡️ 4. For Platform Super Administrators
- **National Institutional Governance**: Verification and on-boarding of universities, autonomous colleges, and corporate employers.
- **Multi-Tenant Row-Level Security (RLS)**: Enforces complete isolation between institutional tenants at the database engine level.
- **Audit Logs & Telemetry**: AI token usage tracking, system health analytics, and compliance monitoring.

---

## 🏗️ Technical Architecture

```text
                                  SkillBridge India Architecture
                                  
  [ Modern Web Client ] ──── React 18 + Vite SPA (Vanilla CSS Design System)
                                     │
                                     │  (HTTPS / REST APIs + JWT Auth)
                                     ▼
  [ API Gateway & Backend ] ─ FastAPI Python Engine (Uvicorn / ASGI)
                                ├── Role Guard & Multi-Tenant Middleware (RBAC)
                                ├── Context Sanitizer & Validation Layer (Pydantic v2)
                                └── Asynchronous Service Layer
                                     │                     │
                    ┌────────────────┴────────┐            │
                    ▼                         ▼            ▼
         [ Multi-Model AI Engine ]     [ Supabase Cloud Database ]
          ├── Google Gemini 1.5 Flash   ├── PostgreSQL 15+ Engine
          └── Groq LPU (Llama 3.3 70B)  ├── Row Level Security (RLS) Policies
                                        └── Encrypted Document Storage
```

---

## 🔒 Security & Privacy Guarantees

- **Zero Client-Side Secrets**: All third-party API credentials (`GEMINI_API_KEY`, `GROQ_API_KEY`, `SUPABASE_SECRET_KEY`) are kept strictly on the backend.
- **Multi-Tenant Isolation**: Row-Level Security (RLS) in PostgreSQL ensures students and faculty from Institution A cannot query data from Institution B.
- **Context Sanitization**: Prompts dispatched to AI models are stripped of personally identifiable metadata, secrets, and raw authentication credentials.
- **Strict Role-Based Access Control (RBAC)**: Enforced via cryptographic JWT verification across all endpoints (`student`, `academician`, `industry_hr`, `super_admin`).

---

## 💻 Tech Stack & Libraries

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Lucide React, Custom CSS Design System |
| **Backend** | Python 3.11/3.13, FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT), Requests |
| **Database & Auth** | Supabase (PostgreSQL 15), Row Level Security (RLS), Supabase Storage |
| **AI / Machine Learning** | Google Gemini 1.5 Flash API, Groq LPU Inference (Llama 3.3 70B Versatile) |
| **Testing & Quality** | Pytest, Pytest-Asyncio, HTTPX, Coverage |
| **Deployment** | Vercel (Frontend & Serverless Gateway) + Render (High-Performance Backend) |

---

## ⚙️ Getting Started Locally

### Prerequisites
- **Node.js**: v18.x or higher
- **Python**: v3.10 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Manishcoder2006/skillbridge-india.git
cd skillbridge-india
```

### 2. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and configure your keys:
# SUPABASE_URL=...
# SUPABASE_KEY=...
# GEMINI_API_KEY=...
# GROQ_API_KEY=...

# Run FastAPI backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`
- Redoc API Documentation: `http://127.0.0.1:8000/redoc`
- Health Check: `http://127.0.0.1:8000/api/v1/health`

### 3. Frontend Setup (React + Vite)
```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Open your browser at: `http://127.0.0.1:5173`
- **Development Quick-Login**: Access `/login` to test with instantaneous 1-click test credentials for each persona.

---

## 🧪 Automated Testing

All backend APIs, AI orchestrator endpoints, and tenant isolation policies are validated via automated Pytest suites:

```bash
cd backend
pytest -v
```

> ✅ **58 passing test cases** across Student, Academician, Industry, AI Learning, and Multi-Tenant RLS modules.

---

## 📂 Project Structure

```
skillbridge-india/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # REST endpoints (auth, student, academician, industry, interviews, ai)
│   │   ├── core/                # Database connections, config, JWT security, tenant middleware
│   │   ├── models/              # System enums & data structures
│   │   ├── repositories/        # Database access layer
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Business logic & AI multi-model orchestrator
│   │   └── main.py              # Application entrypoint
│   ├── tests/                   # Automated Pytest test suite
│   ├── requirements.txt         # Backend Python dependencies
│   └── .env.example             # Backend environment template
├── database/                    # SQL schema definitions, migrations, and seed scripts
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components & layouts
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register, Password Reset
│   │   │   ├── student/         # Student Portal, Mock Interviews, AI Learning, Resume Builder
│   │   │   ├── academician/     # Academician Dashboard & Cohort Analytics
│   │   │   ├── industry/        # Recruiter Portal & Job Management
│   │   │   └── admin/           # Platform Governance & System Monitoring
│   │   ├── services/            # Axios API clients & Supabase connector
│   │   └── styles/              # Global CSS & responsive design system
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite build configuration
├── vercel.json                  # Production deployment routing & headers
├── README.md                    # Project documentation
└── requirements.txt             # Root requirements
```

---

## 👥 Authors & Acknowledgments

- **Team SkillBridge India** — Smart India Hackathon (SIH 2026)
- Developed under Problem Statement **PS 26044**: *Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement*.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
