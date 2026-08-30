# SkillBridge India (SIH 2026 — PS 26044)

> **Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement**

---

## 1. Project Overview

**SkillBridge India** is a national-scale platform engineered to bridge the gap between academic curricula and evolving industry hiring requirements. It provides:
- **For Students:** Verified skill mapping, AI-driven diagnostic skill gap analysis, personalized SWAYAM/NPTEL learning pathways, ATS resume optimization, and direct internship/job applications.
- **For Academicians & Faculty:** Authorized student cohort tracking, department skill gap analytics, pedagogical interventions, curriculum alignment recommendations, and industry collaboration proposals.
- **For Industry & Corporate HR:** Multi-tenant corporate hiring portal, structured job/internship posting manager, multi-model AI candidate compatibility matching (Gemini + Groq), and recruitment funnel analytics.
- **For Platform Super Admins:** National multi-tenant institutional governance, corporate partner verification, macro skill benchmark dashboards, opportunity moderation, and AI engine telemetry.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, React Router v6, Lucide Icons, Vanilla CSS Design System.
- **Backend:** Python 3.13, FastAPI, Pydantic v2, RESTful Architecture.
- **Database & Security:** Supabase PostgreSQL with Multi-Tenant Row Level Security (RLS) policies and JWT Role-Based Access Control (RBAC).
- **AI Multi-Model Engine:**
  - **Google Gemini 1.5 Flash:** Deep taxonomic reasoning, curriculum mapping, resume critique, cohort diagnostics.
  - **Groq LPU (Llama 3.3 70B):** Ultra-fast real-world candidate analysis, recruiter compatibility scoring, and AI chat assistant.
  - **Hybrid Synthesis Layer:** Parallel model synthesis for high-stakes candidate-job matching.

---

## 3. Architecture & Security

```
React 18 Frontend (Vite)
       │ (REST APIs + JWT Auth)
       ▼
FastAPI Backend (Role Guard, Tenant Scoping, Context Sanitization)
       ├──► Multi-Model AI Orchestrator ──► [Google Gemini 1.5 & Groq LPU]
       └──► Supabase PostgreSQL (Multi-Tenant Row Level Security - RLS)
```

### Security Principles:
- **Zero Client-Side Secrets:** `GEMINI_API_KEY`, `GROQ_API_KEY`, and `SUPABASE_SECRET_KEY` are strictly server-side (`backend/.env`).
- **Context Sanitization:** Prompts are stripped of passwords, tokens, and out-of-scope records before LLM transmission.
- **Tenant Isolation:** Institution A cannot access Institution B's private student records.
- **Role Boundary Protection:** Backend endpoints enforce strict role dependencies (`student`, `academician`, `industry_hr`, `super_admin`).

---

## 4. How to Run the Project Locally

### Prerequisites
- Node.js v18+ & npm
- Python 3.10+ (Python 3.13 supported)

### A. Backend Setup (FastAPI)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables (Copy .env.example to .env)
# Populate SUPABASE_URL, SUPABASE_SECRET_KEY, GEMINI_API_KEY, GROQ_API_KEY in backend/.env

# 4. Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- **Interactive Swagger API Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/v1/health`

### B. Frontend Setup (React + Vite)
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
- **Web Portal:** `http://127.0.0.1:5173`
- **Development Quick-Login:** Access `/login` to test with 1-click authentication as **Student**, **Academician**, **Industry/HR**, **Institution Admin**, or **Super Admin**.

### C. Running Automated Tests
```bash
cd backend
pytest -v
```
*(All 58 test cases across Phases 1 through 6 pass with 100% success rate)*

---

## 5. Repository Structure
```
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # REST APIs (student, academician, industry, ai, admin)
│   │   ├── core/              # Config, Security, Database
│   │   ├── models/            # Enums and core models
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic & AI Orchestrator
│   │   └── utils/
│   ├── tests/                 # 58 Pytest test cases
│   ├── .env.example           # Server-side configuration template
│   └── requirements.txt
├── database/                  # 17 PostgreSQL Schema, RLS, and Seed migrations
├── frontend/
│   ├── src/
│   │   ├── components/        # UI design system, AI assistant widget, Layout
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── pages/             # Student, Academician, Industry, Admin, Auth views
│   │   ├── services/          # API client & Supabase client
│   │   └── styles/            # CSS tokens & layout
│   ├── .env.example
│   └── package.json
└── README.md
```
