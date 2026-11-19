# 🎯 GoalFlow — Autonomous AI Personal Productivity Agent

> **Dream It. Plan It. Achieve It.**  
> An intelligent, autonomous productivity platform powered by **Google Gemini 2.5 Flash** that decomposes high-level goals into prioritized subtasks, executes verification tools autonomously, and generates daily progress insights.

---

## ✨ Features

- 🧠 **AI-Powered Goal Decomposition**: Type any high-level objective (e.g. *"Launch an AI SaaS"*, *"Master Full-Stack React"*), and **Gemini 2.5 Flash** decomposes it into an actionable, structured execution plan.
- ⚡ **Eisenhower Priority Matrix (P1–P4)**:
  - **P1** (Urgent & Important): Core critical path deliverables
  - **P2** (Important, Not Urgent): Architecture, database models & planning
  - **P3** (Urgent, Not Important): Supporting integration tasks
  - **P4** (Low Priority): Refinements & post-launch tasks
- 🤖 **Autonomous Tool Execution Engine**:
  - `workspace_file_checker`: Verifies file system artifacts and directory structures.
  - `code_syntax_validator`: Inspects code syntax balance, lint checks, and builds.
  - `git_commit_inspector`: Verifies commit logs, branch histories, and diffs.
  - `api_endpoint_verifier`: Pings internal Next.js endpoints for health and schema validity.
  - `focus_timer_tracker`: Simulates and tracks deep-work focus intervals.
- 🔄 **Auto-Execute Agent Loop**: One-click autonomous batch execution that runs tool verifications across all pending tasks and auto-updates status to completed.
- 📊 **Real-time Analytics & Daily Summaries**:
  - SVG Circular Donut Progress Gauges.
  - Daily productivity scores (`X / 100`).
  - Milestone highlights & personalized AI coaching recommendations.
- 🔒 **Multi-Tenant JWT Authentication**: Secure password hashing with bcrypt, JWT token management, and per-user data isolation.
- 🎨 **Modern Frosted-Glass UI**: Sticky deep purple sidebar, sticky frosted glass top navbar (`Ctrl + K` search), and clean responsive card grids built with Tailwind CSS.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Engine**: [Google Gemini 2.5 Flash](https://aistudio.google.com/)
- **Auth**: JWT (`jsonwebtoken`) & bcrypt password hashing (`bcryptjs`)
- **Database**: Local JSON Multi-tenant Store (`data.json`)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/TANISHA-KAUSHAL/goalflow.git
cd goalflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key_here
```
> Obtain your Gemini API key for free at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
productivity-agent/
├── app/
│   ├── api/
│   │   ├── agent/auto-run/   # Autonomous agent loop execution
│   │   ├── auth/login/       # User login & JWT issuance
│   │   ├── auth/register/    # User registration & bcrypt hashing
│   │   ├── goals/            # Goal planning with Gemini 2.5 Flash
│   │   ├── summary/          # Daily reflection synthesis
│   │   └── tasks/            # CRUD task management & tool runners
│   ├── globals.css           # Tailwind CSS styling
│   ├── layout.tsx            # Root application layout
│   └── page.tsx              # View orchestrator (Auth, Sidebar, Views)
├── components/
│   ├── AuthModal.tsx         # Responsive login & signup modal
│   ├── DashboardView.tsx     # Main dashboard with goal cards & insights
│   ├── GoalsView.tsx         # Goals archive with expandable task accordions
│   ├── Navbar.tsx            # Sticky frosted top header (Search, Profile)
│   ├── Settings.tsx          # System settings & AI engine connectivity
│   ├── Sidebar.tsx           # Sticky navigation sidebar
│   ├── SummaryView.tsx       # Daily summaries & productivity coaching
│   └── TasksView.tsx         # Backlog board with priority filters & tool execution
├── lib/
│   ├── ai.ts                 # Google Gemini 2.5 Flash API connector
│   ├── auth.ts               # JWT verification & password hashing
│   ├── db.ts                 # Local database read/write schema
│   └── tools.ts              # Autonomous verification tool runners
└── data.json                 # Persistent multi-tenant JSON database
```

---

## 📄 License
MIT License. Built with passion by [Tanisha Kaushal](https://github.com/TANISHA-KAUSHAL).
