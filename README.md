<![CDATA[# 🧠 NeuroLearn

**NeuroLearn** is an AI-powered learning disability detection and adaptive education platform. It identifies learning challenges such as dyslexia, ADHD, and attention/focus difficulties in students through automated assessments, and then guides students, teachers, and parents with personalised learning paths, risk insights, and actionable recommendations.

---

## 🌐 Live Architecture

```
Frontend (React + Vite)  ←→  Backend (FastAPI)  ←→  Supabase (PostgreSQL)
                                     ↕
                           AI/ML Models (XGBoost, Whisper)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **TypeScript** | Type-safe development |
| **Vite 5** | Blazing-fast build tool and dev server |
| **React Router v6** | Client-side navigation and routing |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Data visualisation (charts, graphs) |
| **Lucide React** | Icon library |
| **jsPDF + html2canvas** | PDF report export |
| **Supabase JS Client** | Auth, real-time data, database |
| **MediaPipe** | Webcam-based attention tracking |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.x** | Primary backend language |
| **FastAPI** | High-performance REST API framework |
| **Uvicorn** | ASGI server |
| **Supabase Python** | Database queries via PostgREST |
| **XGBoost** | ADHD/attention risk prediction model |
| **Faster-Whisper** | Speech-to-text for reading assessments |
| **OpenAI API** | AI-generated insights and recommendations |
| **scikit-learn / pandas** | ML scoring pipelines |
| **PyJWT** | JWT token parsing and auth validation |

### Database
| Technology | Purpose |
|---|---|
| **Supabase (PostgreSQL)** | Primary database with Row Level Security |
| **Supabase Auth** | User authentication and sessions |
| **Supabase RLS Policies** | Fine-grained access control per user role |

---

## 👥 User Roles

NeuroLearn supports four distinct user roles, each with their own tailored portal:

| Role | Access |
|---|---|
| **Student** | Take assessments, view learning journey, access recommendations |
| **Teacher** | Monitor students, assign activities/assessments, track interventions |
| **Parent** | View child's progress, monitoring, and home support plan (read-only) |
| **Admin** | System-wide analytics, school & user management |

---

## ✨ Features

### 🎓 Student Portal
- **Multi-modal Assessments**: Reading fluency (via microphone + Whisper AI), comprehension, attention (CPT), focus, typing speed, and learning behaviour tests
- **Personal Dashboard**: Overall readiness score, active learning path, and recent performance
- **Learning Journey**: Visual timeline of completed and upcoming learning path milestones
- **Personalised Recommendations**: AI-generated activity suggestions based on detected risk areas
- **Activity Player**: Interactive in-app learning activities

### 🏫 Teacher Portal
- **Student Roster Management**: View all assigned students, their risk levels, and current status
- **Student Monitoring**: Deep-dive view per student with risk heatmaps, assessment history, and learning path progress
- **Assign Activities & Assessments**: Directly assign tasks to students with due dates and priority levels
- **Intervention Tracking**: Log teacher interventions and track their outcomes
- **Teacher Notes**: Leave private or parent-visible notes on individual students
- **Parent Communication**: View linked parents, send updates, and track engagement
- **Analytics Dashboard**: Class-wide trends, risk distribution, and comparative performance analytics

### 👨‍👩‍👧 Parent Portal
- **Child Dashboard**: At-a-glance view of the child's readiness score and recent activity
- **Progress Tracking**: Historical charts and trend analysis for all assessed skills
- **Monitoring Center**: Real-time status of risk areas expressed in parent-friendly language (e.g. "Reading Support Recommended" instead of technical scores)
- **Recommendations & Home Support Center**:
  - Priority queue of teacher-assigned tasks (activities and assessments)
  - Upcoming deadlines view (within 7 days)
  - Home support activities generated from the child's risk profile
  - Daily Support Plan with "Today's Focus" and action steps
  - Parent-visible teacher notes and guidance
  - Home activity completion logging with optional parent notes
  - Complete activity history timeline

### 🔐 Admin Portal
- School management and enrollment
- System-wide student and teacher management
- Cross-school analytics and comparison dashboards

---

## 🤖 AI & ML Models

### Risk Detection Engine
The platform assesses students across multiple learning dimensions:

| Risk Area | Assessment Method | Model |
|---|---|---|
| **Dyslexia / Reading** | Read-aloud passage + Whisper transcription | WER/accuracy scoring |
| **ADHD** | XGBoost classification model | Pre-trained `.pkl` model |
| **Attention (CPT)** | Continuous Performance Test | Reaction time + accuracy heuristics |
| **Focus** | Webcam gaze tracking (MediaPipe) | Position-based scoring |
| **Learning Behaviour** | Questionnaire | Rule-based scoring |
| **Typing Skills** | Speed and accuracy test | WPM + error rate |

### Report & Insights Generation
- A **Risk Engine** aggregates all individual scores into an overall student readiness score
- An **Insights Service** uses OpenAI to generate human-readable explanations and next-step recommendations
- A **Learning Path Engine** dynamically creates personalised learning paths based on detected risk levels

---

## 🗃️ Database Schema

Key tables in the Supabase PostgreSQL database:

| Table | Purpose |
|---|---|
| `student_profiles` | Core student records |
| `parent_profiles` | Core parent records |
| `teacher_profiles` | Core teacher records |
| `student_parent_relationships` | Secure parent-student linkage |
| `teacher_student_assignments` | Teacher-student linkage |
| `assessment_sessions` | Per-session assessment state tracking |
| `student_reports` | Generated risk reports with scores |
| `student_recommendations` | Teacher-generated recommendations |
| `learning_paths` | Adaptive learning path definitions |
| `learning_activities` | Activity library |
| `teacher_student_notes` | Teacher notes (with visibility control) |
| `teacher_assigned_activities` | Activities assigned to students |
| `teacher_assigned_assessments` | Assessments assigned to students |
| `teacher_interventions` | Logged teacher interventions |
| `parent_home_activity_logs` | Parent-completed home activities |

---

## 📁 Project Structure

```
neurolearn/
├── src/                          # Frontend React app
│   ├── pages/                    # All page components
│   │   ├── assessments/          # 7 assessment types
│   │   ├── teacher/              # Teacher portal pages
│   │   ├── ParentDashboard.tsx
│   │   ├── ParentMonitoringPage.tsx
│   │   ├── ParentProgressPage.tsx
│   │   └── ParentRecommendationsPage.tsx
│   ├── services/                 # API service layer
│   ├── components/               # Shared UI components
│   ├── context/                  # React context providers
│   └── lib/                      # Supabase client and utilities
│
├── backend/                      # FastAPI Python backend
│   ├── main.py                   # Application entry point
│   ├── routers/                  # 26 API route modules
│   ├── services/                 # 35 business logic services
│   ├── adhd_xgboost_model.pkl   # Pre-trained ADHD model
│   └── requirements.txt
│
└── supabase/
    └── migrations/               # 24 ordered SQL migration scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Supabase project with the SQL migrations applied

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd neurolearn
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create a `.env` file in the project root:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Create a `backend/.env` file:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Set Up the Database
Run all SQL files inside `supabase/migrations/` in order in your Supabase SQL Editor.

### 4. Start the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will be running at `http://127.0.0.1:8000`.

### 5. Start the Frontend
```bash
# From the project root
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🔒 Security Architecture

- All routes are protected by **Supabase JWT authentication**
- Role-based access is enforced at both the **API layer** and **database RLS layer**
- Parents are strictly limited to data linked via `student_parent_relationships` — they can never access another child's information
- Teachers can only view students assigned to them via `teacher_student_assignments`
- Sensitive data (e.g. raw ML risk probabilities) are never exposed to parents — only parent-friendly summaries are returned

---

## 📄 License

This project is for academic and educational purposes.
]]>