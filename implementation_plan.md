# Implementation Plan - Phase 1 Foundation: SkillBridge India (SIH 2026 Problem Statement 26044)

Phase 1 establishes the enterprise-grade foundation for the **"Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement"** (SkillBridge India). This phase strictly focuses on architectural foundation, database schema with multi-tenant institution isolation and Row Level Security (RLS), authentication flows, user roles, FastAPI backend structure, and React frontend with role-based routing and a responsive shell.

---

## User Review Required

> [!IMPORTANT]
> **Environment Variables & Supabase Connection:**
> - To test live database interactions with Supabase, we will provide local `.env` configuration files for both frontend and backend (`.env.example` and `.env.local`).
> - We will provide complete, production-ready SQL migration scripts (in `database/schema.sql` and `database/rls_policies.sql`) that can be executed directly in the Supabase SQL Editor.
> - A mock/local fallback authentication provider & mock database capability will also be included for offline demonstration and testing so all verification checks run without breaking if remote Supabase credentials are yet to be provisioned.

---

## Open Questions

- None blocking for Phase 1. All requirements align with the Phase 1 specification.

---

## Proposed Architecture & Directory Structure

```
Skill Bridge India SIH 2026/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py         # Auth profile & session verification endpoints
│   │   │   │   │   ├── health.py       # Health check (GET /health)
│   │   │   │   │   ├── institutions.py # Multi-tenant institution & department endpoints
│   │   │   │   │   └── users.py        # Role-based user profile management
│   │   │   │   └── api.py              # APIRouter aggregation
│   │   ├── core/
│   │   │   ├── config.py               # Settings & Environment configs (pydantic-settings)
│   │   │   ├── security.py             # Supabase JWT decoding, claims validation & RBAC
│   │   │   └── database.py             # Supabase / DB client connection manager
│   │   ├── middleware/
│   │   │   └── tenant.py               # Institution-level tenant context & security headers
│   │   ├── models/
│   │   │   └── enums.py                # UserRole, InstitutionType, VerificationStatus enums
│   │   ├── repositories/
│   │   │   ├── institution_repository.py
│   │   │   └── user_repository.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── institution.py
│   │   │   └── user.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   └── institution_service.py
│   │   ├── utils/
│   │   │   └── logger.py
│   │   └── main.py                     # FastAPI entry point & CORS
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                     # Logos, branding assets
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx       # App shell containing Sidebar & Header
│   │   │   │   ├── Header.jsx          # Top navigation with user dropdown & role badge
│   │   │   │   ├── Sidebar.jsx         # Responsive collapsible navigation
│   │   │   │   └── Footer.jsx
│   │   │   └── routing/
│   │   │       ├── ProtectedRoute.jsx  # Auth & session gate
│   │   │       └── RoleRoute.jsx       # Multi-role access control gate
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Supabase Auth provider & role state
│   │   │   └── ToastContext.jsx        # Notification/toast state manager
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useToast.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── dashboards/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── IndustryDashboard.jsx
│   │   │   │   ├── AcademicianDashboard.jsx
│   │   │   │   ├── InstitutionDashboard.jsx
│   │   │   │   └── SuperAdminDashboard.jsx
│   │   │   ├── LandingPage.jsx         # Modern government portal landing page
│   │   │   ├── Unauthorized.jsx        # 403 Forbidden page
│   │   │   └── NotFound.jsx            # 404 Not Found page
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client with JWT interceptors
│   │   │   └── supabaseClient.js       # Supabase client singleton
│   │   ├── styles/
│   │   │   ├── index.css               # Design system tokens, typography, CSS variables
│   │   │   └── layout.css              # Grid & flex layouts, responsive breakpoints
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
└── database/
    ├── 01_schema.sql                   # Schema DDL (tables, enums, triggers, indexes)
    ├── 02_rls_policies.sql             # Row Level Security policies (Multi-tenant isolation)
    └── 03_seed.sql                     # Seed data for demo institutions, departments & roles
```

---

## Proposed Changes

### Database Layer (`database/`)

#### [NEW] [01_schema.sql](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/database/01_schema.sql)
- Custom PostgreSQL Enums: `user_role` (`student`, `academician`, `industry_hr`, `institution_admin`, `super_admin`), `institution_type`, `verification_status`.
- `institutions`: Multi-tenant root entity with unique code, name, verification status, contact details, timestamps.
- `departments`: Associated with `institution_id` (`CASCADE`), name, code.
- `profiles`: Primary user table linked 1-to-1 with `auth.users(id)` with `role`, `institution_id`, `department_id`, `is_active`, `full_name`, `phone`, timestamps.
- `student_profiles`: Specialized profile with `roll_number`, `batch_year`, `cgpa`, linked to `profiles.id` and `institution_id`.
- `academician_profiles`: Specialized profile with `employee_id`, `designation`, `specialization`, linked to `profiles.id` and `institution_id`.
- `industry_profiles`: Specialized profile with `company_name`, `industry_sector`, `designation`, `website`.
- `institution_admin_profiles`: Specialized profile with `designation`, `permissions`, linked to `profiles.id` and `institution_id`.
- PostgreSQL triggers for `handle_new_user()` (auto-syncing Supabase Auth signups into `profiles`) and automatic `updated_at` timestamps.

#### [NEW] [02_rls_policies.sql](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/database/02_rls_policies.sql)
- Enables Row Level Security on all tables.
- **Institution Isolation Policies:**
  - Institution Admins can select/update profiles and departments only where `institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())`.
  - Students and Academicians can only view data within their registered `institution_id`.
  - Industry HR can view approved institutions and permitted candidate information.
  - Super Admins bypass tenant filters.
  - Individual users can read and update their own `profiles` record.

#### [NEW] [03_seed.sql](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/database/03_seed.sql)
- Sample institutions (e.g. National Institute of Technology, Indian Institute of Science & Technology), departments (Computer Science & Engineering, Electronics, Mechanical), and initial demo records.

---

### Backend Layer (`backend/`)

#### [NEW] [backend/requirements.txt](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/requirements.txt)
- `fastapi`, `uvicorn[standard]`, `pydantic`, `pydantic-settings`, `supabase`, `python-jose[cryptography]`, `httpx`, `python-dotenv`.

#### [NEW] [backend/app/main.py](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/app/main.py)
- FastAPI app initialization, CORS middleware configuration (supporting frontend URL), custom exception handlers, router inclusion under `/api/v1`, and root `/health` endpoint.

#### [NEW] [backend/app/core/config.py](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/app/core/config.py)
- Environment configuration with validation for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `API_V1_STR`, `PROJECT_NAME`, `ALLOWED_ORIGINS`.

#### [NEW] [backend/app/core/security.py](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/app/core/security.py)
- Supabase JWT token verification, user claim extraction, Role-Based Access Control (RBAC) dependency factory `require_roles([UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN])`, and institution-tenant verification.

#### [NEW] [backend/app/api/v1/endpoints/health.py](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/app/api/v1/endpoints/health.py)
- Health check endpoint `GET /api/v1/health` and `GET /health` with system status, timestamp, and active environment details.

#### [NEW] [backend/app/api/v1/endpoints/auth.py](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/app/api/v1/endpoints/auth.py)
- Endpoints for `GET /api/v1/auth/me` (returns validated user profile, role, institution details) and `POST /api/v1/auth/sync-profile`.

#### [NEW] [backend/app/api/v1/endpoints/institutions.py](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/app/api/v1/endpoints/institutions.py)
- `GET /api/v1/institutions` (public list for registration selection), `GET /api/v1/institutions/{id}/departments`, and protected tenant-isolated institution management routes.

#### [NEW] [backend/app/api/v1/endpoints/users.py](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/backend/app/api/v1/endpoints/users.py)
- Profile retrieval, profile update, and institution user listing (scoped to institution admin's institution).

---

### Frontend Layer (`frontend/`)

#### [NEW] [frontend/package.json](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/frontend/package.json)
- React 18 / 19, `react-router-dom`, `@supabase/supabase-js`, `axios`, `lucide-react` for clean icons.

#### [NEW] [frontend/src/styles/index.css](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/frontend/src/styles/index.css)
- Professional Design System:
  - Color Tokens: Deep Navy (`#0f172a`, `#1e293b`), Government Saffron/Gold accent (`#f59e0b`, `#d97706`), Professional Teal/Emerald (`#0d9488`, `#059669`), Slate neutrals (`#f8fafc` to `#334155`).
  - Clean Typography: Inter font family, crisp contrast ratios, accessibility compliance.
  - Modern elevation shadows, button styles, form input controls, badges, table styling, cards.
  - Fully responsive utility classes and media queries for desktop, tablet, and mobile.

#### [NEW] [frontend/src/context/AuthContext.jsx](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/frontend/src/context/AuthContext.jsx)
- Supabase session management, `onAuthStateChange` listener, profile fetching & caching, `login()`, `register()`, `logout()`, `resetPassword()`, `updatePassword()` methods.

#### [NEW] [frontend/src/components/routing/ProtectedRoute.jsx](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/frontend/src/components/routing/ProtectedRoute.jsx) & [RoleRoute.jsx](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/frontend/src/components/routing/RoleRoute.jsx)
- Ensures unauthenticated requests redirect to `/login` with `from` location state.
- Ensures users with incorrect roles get redirected to `/unauthorized` or their designated dashboard.

#### [NEW] [frontend/src/components/layout/AppLayout.jsx](file:///c:/Users/manav/Skill%20Bridge%20India%20SIH%202026/frontend/src/components/layout/AppLayout.jsx)
- Responsive application shell with collapsible sidebar, active route indicators, header with institution badge, role badge, user profile menu, and mobile navigation drawer.

#### [NEW] Auth Pages & Role Dashboards
- `LandingPage.jsx`: Modern portal landing page with portal overview, problem statement summary, and login/register entry points.
- `Login.jsx`: Secure sign-in with role-aware redirection.
- `Register.jsx`: Multi-role registration with dynamic institution & department selection.
- `ForgotPassword.jsx` & `ResetPassword.jsx`: Supabase password recovery flows.
- `StudentDashboard.jsx`: Student placeholder shell with profile card, quick stats placeholder, institution info.
- `IndustryDashboard.jsx`: Industry/HR placeholder shell with company overview placeholder.
- `AcademicianDashboard.jsx`: Academician placeholder shell with department info.
- `InstitutionDashboard.jsx`: Institution Admin placeholder shell with institution overview.
- `SuperAdminDashboard.jsx`: Super Admin platform management placeholder shell.
- `Unauthorized.jsx`: Professional 403 Forbidden notice with link back to user's assigned dashboard.

---

## Verification Plan

### Automated & Unit Tests
1. **Backend Verification:**
   - Run `pytest` or Python test scripts testing `GET /health`, `GET /api/v1/health`, public institutions endpoints, and JWT authentication handling.
   - Verify CORS headers are properly served.
2. **Frontend Verification:**
   - Execute `npm run build` to verify clean JSX/JS compilation without errors.
   - Run Vite development server and verify standard responses on all primary routes.

### Integration & Manual Verification
1. **Authentication Flow:**
   - Register a Student account with an institution and department.
   - Register an Academician account.
   - Register an Industry HR account.
   - Register an Institution Admin account.
   - Test Login -> verify automatic redirect to role-specific dashboard.
   - Test Logout -> verify session cleared and redirected to `/login`.
   - Test Password Reset flow triggers without errors.
2. **Role & Route Protection:**
   - Attempt accessing `/dashboard/institution` as a Student -> verify redirected to `/unauthorized`.
   - Attempt accessing `/dashboard/student` without login -> verify redirected to `/login`.
3. **Multi-Tenant Institution Isolation:**
   - Verify backend queries enforce `institution_id` filtering.
   - Verify SQL RLS policy tests ensure Student A cannot access Institution B records.
4. **Responsive Layout:**
   - Test responsive layout on Desktop (1440px), Tablet (768px), and Mobile (375px) viewports using the browser tool.
