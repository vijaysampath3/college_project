# NeuroLearn — AI-Powered Learning Assessment Platform
 
> **Early detection. Personalised learning. Better outcomes.**
> NeuroLearn helps schools identify learning challenges like dyslexia and ADHD through automated AI assessments, and empowers students, teachers, and parents with actionable insights and adaptive learning paths.
 
🌐 **Live Demo:** [neurolearn-two.vercel.app](https://neurolearn-two.vercel.app)
 
---
 
## Table of Contents
 
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [User Roles & Portals](#user-roles--portals)
- [Features](#features)
- [AI & ML Models](#ai--ml-models)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Security](#security)
- [License](#license)
---
 
## Overview
 
NeuroLearn is a full-stack, AI-driven platform designed for schools to screen students for learning difficulties — including dyslexia, ADHD, and attention/focus challenges — through non-invasive, multi-modal assessments. Results are translated into clear, role-appropriate dashboards for students, teachers, parents, and administrators.
 
**Key capabilities at a glance:**
 
- 🎙️ Reading fluency assessment using speech recognition (Faster-Whisper)
- 🧠 ADHD/attention risk scoring via a pre-trained XGBoost model
- 👁️ Real-time focus tracking with MediaPipe webcam analysis
- 📊 Personalised AI-generated learning paths and recommendations (OpenAI)
- 🔐 Role-based access control enforced at both API and database levels
---
 
## Architecture
 
```
┌─────────────────────────┐         ┌──────────────────────────┐
│  Frontend               │         │  Backend                  │
│  React 18 + Vite        │◄───────►│  FastAPI (Python)         │
│  TypeScript + Tailwind  │         │  26 route modules         │
└─────────────────────────┘         │  35 service modules       │
                                    └────────────┬─────────────┘
                                                 │
                          ┌──────────────────────┼──────────────────────┐
                          ▼                      ▼                      ▼
               ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
               │  Supabase        │   │  XGBoost Model   │   │  OpenAI API      │
               │  PostgreSQL      │   │  ADHD Prediction │   │  Insights + Recs │
               │  Auth + RLS      │   └──────────────────┘   └──────────────────┘
               └──────────────────┘
```
 
---
 
## Tech Stack
 
### Frontend
 
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Component-based UI with type safety |
| Vite 5 | Fast build tool and dev server |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Recharts | Data visualisation (charts and graphs) |
| Lucide React | Icon library |
| jsPDF + html2canvas | PDF report export |
| Supabase JS Client | Auth, real-time data, database access |
| MediaPipe | Webcam-based attention and focus tracking |
 
### Backend
 
| Technology | Purpose |
|---|---|
| Python 3.x + FastAPI | High-performance REST API |
| Uvicorn | ASGI server |
| XGBoost | ADHD/attention risk prediction |
| Faster-Whisper | Speech-to-text for reading assessments |
| OpenAI API | AI-generated insights and recommendations |
| scikit-learn + pandas | ML scoring pipelines |
| Supabase Python | Database access via PostgREST |
| PyJWT | JWT token parsing and auth validation |
 
### Database & Auth
 
| Technology | Purpose |
|---|---|
| Supabase (PostgreSQL) | Primary database with Row Level Security |
| Supabase Auth | User authentication and session management |
| Supabase RLS Policies | Fine-grained, role-based data access control |
 
---
 
## User Roles & Portals
 
NeuroLearn supports four distinct roles, each with a tailored portal:
 
| Role | Description |
|---|---|
| 🎓 **Student** | Take assessments, track their learning journey, view AI-generated recommendations |
| 🏫 **Teacher** | Monitor students, assign activities and assessments, log interventions |
| 👨‍👩‍👧 **Parent** | View child's progress, home support plan, and teacher notes (read-only) |
| 🔐 **Admin** | School management, system-wide analytics, user administration |
 
---
 
## Features
 
### 🎓 Student Portal
 
- **Multi-modal Assessments** — Reading fluency (microphone + Whisper AI), comprehension, attention (CPT), focus (webcam), typing speed, and learning behaviour
- **Personal Dashboard** — Overall readiness score, active learning path, and recent performance
- **Learning Journey** — Visual timeline of completed and upcoming milestones
- **Personalised Recommendations** — AI-generated activity suggestions mapped to detected risk areas
- **Activity Player** — Interactive in-app learning activities
### 🏫 Teacher Portal
 
- **Student Roster** — Overview of all assigned students, their risk levels, and current status
- **Deep-Dive Student View** — Risk heatmaps, full assessment history, and learning path progress per student
- **Assign Tasks** — Directly assign activities and assessments with due dates and priority levels
- **Intervention Tracking** — Log and track the outcomes of teacher interventions
- **Teacher Notes** — Private or parent-visible notes on individual students
- **Parent Communication** — View linked parents, track engagement, send updates
- **Analytics Dashboard** — Class-wide risk distribution, trends, and comparative performance
### 👨‍👩‍👧 Parent Portal
 
- **Child Dashboard** — At-a-glance view of readiness score and recent activity
- **Progress Tracking** — Historical charts for all assessed skills
- **Monitoring Centre** — Risk summaries in plain, parent-friendly language (e.g. "Reading Support Recommended")
- **Home Support Centre**
  - Priority queue of teacher-assigned tasks with upcoming deadlines (within 7 days)
  - Home support activities generated from the child's risk profile
  - Daily Support Plan with "Today's Focus" and actionable steps
  - Parent-visible teacher notes and guidance
  - Home activity completion logging with optional notes
  - Complete activity history timeline
### 🔐 Admin Portal
 
- School management and student enrollment
- System-wide student and teacher administration
- Cross-school analytics and comparison dashboards
---
 
## AI & ML Models
 
### Risk Detection Engine
 
NeuroLearn assesses students across six learning dimensions:
 
| Risk Area | Assessment Method | Scoring Approach |
|---|---|---|
| Dyslexia / Reading | Read-aloud passage + Whisper transcription | WER and accuracy scoring |
| ADHD | Behavioural and reaction-time data | Pre-trained XGBoost classifier |
| Attention (CPT) | Continuous Performance Test | Reaction time + accuracy heuristics |
| Focus | Webcam gaze tracking (MediaPipe) | Position-based scoring |
| Learning Behaviour | Questionnaire | Rule-based scoring |
| Typing Skills | Speed and accuracy test | WPM + error rate |
 
### Intelligence Pipeline
 
1. **Risk Engine** — Aggregates all individual scores into a single student readiness score
2. **Insights Service** — Uses OpenAI to generate human-readable explanations and next-step recommendations
3. **Learning Path Engine** — Dynamically builds personalised learning paths based on detected risk levels
---
 
## Database Schema
 
Key tables in the Supabase PostgreSQL database:
 
| Table | Purpose |
|---|---|
| `student_profiles` | Core student records |
| `parent_profiles` | Core parent records |
| `teacher_profiles` | Core teacher records |
| `student_parent_relationships` | Secure parent–student linkage |
| `teacher_student_assignments` | Teacher–student linkage |
| `assessment_sessions` | Per-session assessment state tracking |
| `student_reports` | Generated risk reports with scores |
| `student_recommendations` | Teacher-generated recommendations |
| `learning_paths` | Adaptive learning path definitions |
| `learning_activities` | Activity library |
| `teacher_student_notes` | Teacher notes with visibility control |
| `teacher_assigned_activities` | Activities assigned to students |
| `teacher_assigned_assessments` | Assessments assigned to students |
| `teacher_interventions` | Logged teacher interventions |
| `parent_home_activity_logs` | Parent-completed home activity records |
 
24 ordered SQL migration scripts manage the full schema lifecycle.
 
---
 
## Project Structure
 
```
neurolearn/
├── src/                              # Frontend (React + TypeScript)
│   ├── pages/
│   │   ├── assessments/              # 7 assessment types
│   │   ├── teacher/                  # Teacher portal pages
│   │   ├── ParentDashboard.tsx
│   │   ├── ParentMonitoringPage.tsx
│   │   ├── ParentProgressPage.tsx
│   │   └── ParentRecommendationsPage.tsx
│   ├── services/                     # API service layer
│   ├── components/                   # Shared UI components
│   ├── context/                      # React context providers
│   └── lib/                          # Supabase client and utilities
│
├── backend/                          # FastAPI (Python)
│   ├── main.py                       # Application entry point
│   ├── routers/                      # 26 API route modules
│   ├── services/                     # 35 business logic services
│   ├── adhd_xgboost_model.pkl        # Pre-trained ADHD model
│   └── requirements.txt
│
└── supabase/
    └── migrations/                   # 24 ordered SQL migration scripts
```
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js 18+
- Python 3.10+
- A Supabase project with migrations applied
### 1. Clone the Repository
 
```bash
git clone https://github.com/vijaysampath3/college_project.git
cd neurolearn
```
 
### 2. Configure Environment Variables
 
**Frontend** — create `.env.local` in the project root:
 
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
 
**API base URL** — create `.env` in the project root:
 
```env
VITE_API_URL=http://127.0.0.1:8000/api
```
 
**Backend** — create `backend/.env`:
 
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```
 
### 3. Apply Database Migrations
 
Run all SQL files inside `supabase/migrations/` in order via the Supabase SQL Editor.
 
### 4. Start the Backend
 
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```
 
Backend runs at: `http://127.0.0.1:8000`
 
### 5. Start the Frontend
 
```bash
# From project root
npm install
npm run dev
```
 
Frontend runs at: `http://localhost:5173`
 
---
 
## Security
 
NeuroLearn enforces a multi-layer security model:
 
- **JWT Authentication** — All routes are protected via Supabase JWT tokens
- **API-Level Role Guards** — Role-based access enforced in FastAPI route handlers
- **Database RLS Policies** — Supabase Row Level Security provides a second enforcement layer independently of the API
- **Parent Data Isolation** — Parents are strictly scoped to their own child's data via `student_parent_relationships`; cross-child access is architecturally impossible
- **Teacher Scoping** — Teachers can only view and manage students assigned to them via `teacher_student_assignments`
- **Sensitive Data Protection** — Raw ML risk probabilities are never exposed to parents; only human-friendly summaries are returned
---
 
## License
 
This project is built for academic and educational purposes.
 
