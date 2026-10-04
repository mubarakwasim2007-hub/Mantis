<div align="center">
  <img width="1200" height="475" alt="Mantis - AI Studio Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Mantis

> A local-first productivity dashboard, study planner, and habit tracker built for students.

Mantis is a personal productivity application designed to bring **study planning, task management, habit tracking, goals, notes, and study analytics** into one focused workspace.

It uses a **local-first architecture**, so your data is stored directly on your device using **IndexedDB**. No account, backend, or cloud database is required.

---

## ✨ Features

### 📊 Productivity Dashboard
- Daily task completion
- Study-hour tracking
- Upcoming deadlines
- Habit progress
- Active goals
- Real-time statistics based on your local data

### 📚 Study Planner
- Organize work by subject
- Create and manage study tasks
- Set due dates and priorities
- Track estimated and actual study time
- Mark tasks as completed

### ✅ Habit Tracker
- Create personal habits
- Daily habit check-ins
- Streak tracking
- Best-streak tracking
- Dynamic habit calendar
- Consistency tracking

### 🎯 Goals
- Create personal and academic goals
- Track goal progress
- Manage milestones
- Update progress directly from the application

### 📝 Notes
- Create and edit notes
- Organize notes by subject
- Markdown-friendly writing
- Local persistence

### 📈 Analytics
- Study-hour trends
- Productivity statistics
- Data calculated from your actual study sessions

### 💾 Local-First Storage

```text
React
   ↓
Dexie.js
   ↓
IndexedDB
   ↓
Your Device
```

Your tasks, habits, goals, notes, and study sessions are stored locally in the browser/device.

No cloud account is required.

---

## 🎓 Current Academic Subjects

The current version is configured for:

- EEC
- DLMS
- Signals and Systems
- Maths
- Medical Physics

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application logic |
| Vite | Development and build tooling |
| Tailwind CSS | UI styling |
| Dexie.js | IndexedDB database layer |
| IndexedDB | Local persistent storage |
| Lucide React | Icons |
| Motion | UI animations |

---

## 🚀 Run Locally

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/mubarakwasim2007-hub/Mantis.git
```

### 2. Open the project

```bash
cd Mantis
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will display a local development URL, usually similar to:

```text
http://localhost:3000
```

Open that address in your browser.

> **No Gemini API key is required to run the current version of Mantis.**

---

## 🗂️ Project Structure

```text
Mantis/
├── src/
│   ├── components/
│   │   ├── AnalyticsView.tsx
│   │   ├── DashboardGrid.tsx
│   │   ├── GoalsView.tsx
│   │   ├── HabitCalendar.tsx
│   │   ├── HabitTrackerView.tsx
│   │   ├── NotesView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── Sidebar.tsx
│   │   └── StudyPlannerView.tsx
│   │
│   ├── db/
│   │   ├── db.ts
│   │   └── dbService.ts
│   │
│   ├── types/
│   │   └── dashboard.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔐 Privacy & Data

Mantis is designed to be **local-first**.

Application data is stored using IndexedDB on the device where the application is running.

This means:

- No login is required
- No cloud database is required
- No server is required for normal use
- Your personal productivity data remains on your device

Clearing the browser's site data can remove locally stored application data, so backups may be considered for a future version.

---

## 📱 Future Direction

The application is currently developed as a responsive web application.

A future version may package the same application for mobile platforms using **Capacitor**, while maintaining the local-first approach.

---

## 🤖 Development

Mantis was developed with the assistance of modern AI coding tools alongside manual testing, debugging, and refinement.

The goal is not just to generate a UI, but to build a functional application with:

- Real local persistence
- Reactive data updates
- CRUD operations
- Dynamic calculations
- Offline-first behavior
- Responsive design

---

## 🔗 Links

**GitHub:**  
https://github.com/mubarakwasim2007-hub/Mantis

**AI Studio Project:**  
https://ai.studio/apps/1ab7c9b6-a8aa-4968-8d60-2df7fac3d2e0

---

## 📄 License

This project is currently maintained as a personal project.
