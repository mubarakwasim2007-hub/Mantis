<div align="center">
  <img width="1200" height="475" alt="Mantis - Google AI Studio Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

<h1 align="center">Mantis</h1>

<p align="center">
  <strong>A local-first study planner, habit tracker, and productivity dashboard.</strong>
  <br />
  Plan your studies, build consistent habits, manage goals, and keep your notes in one workspace.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Storage" src="https://img.shields.io/badge/Storage-IndexedDB-0A7EA4" />
  <img alt="License" src="https://img.shields.io/badge/License-Personal%20Project-lightgrey" />
</p>

## Overview

Mantis is a personal productivity app created to bring academic planning and everyday routines together. It is designed around a **local-first** approach: application records are saved in the browser's **IndexedDB** database on the device where Mantis is used.

There is no sign-in or cloud database in the current version. Your study tasks, habit logs, goals, notes, and study sessions are managed locally.

## Features

| Area | What you can do |
|---|---|
| **Dashboard** | Review task completion, study activity, deadlines, habits, and goals using your saved data |
| **Study Planner** | Organize tasks by subject, set priorities and due dates, and track study time |
| **Habit Tracker** | Create habits, record daily check-ins, and review streaks and calendar history |
| **Goals** | Set academic or personal goals and track progress and milestones |
| **Notes** | Create, edit, and organize notes by subject |
| **Analytics** | Review study-hour trends and productivity summaries derived from your records |
| **Settings** | View and manage your Mantis workspace preferences |

### Current subjects

The initial subject list is:

- EEC
- DLMS
- Signals and Systems
- Maths
- Medical Physics

You can use the Study Planner to organize your work around these subjects.

## Local-first data

Mantis uses IndexedDB through Dexie.js for persistent browser storage.

```text
Mantis UI (React)
       |
       v
Dexie.js data layer
       |
       v
Browser IndexedDB
       |
       v
Stored locally in this browser profile
```

- **No account required:** open the app without signing in.
- **Local persistence:** saved records remain available when you close and reopen the app in the same browser profile.
- **No automatic sync:** data is not shared between browsers or devices.
- **Back up your data:** clearing browser site data or removing the browser profile may erase locally stored records. Export/restore functionality is not currently included.

> Local-first describes where app data is stored; it does not mean the development server can be shut down while using the Vite development URL.

## Tech stack

- **React** — component-based user interface
- **TypeScript** — application types and logic
- **Vite** — development server and build tooling
- **Tailwind CSS** — styling
- **Dexie.js** and **dexie-react-hooks** — IndexedDB access and reactive queries
- **Lucide React** — interface icons
- **Motion** — interface animation

## Run locally

### Requirements

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/mubarakwasim2007-hub/Mantis.git
cd Mantis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite prints the local URL in your terminal (commonly `http://localhost:5173`). Open the URL shown in your terminal to use Mantis.

Stop the development server with `Ctrl + C`.

> The current local-first app does not require a Gemini API key or cloud account for its core planner and tracking features.

## Project structure

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
│   ├── db/
│   │   ├── db.ts
│   │   └── dbService.ts
│   ├── types/
│   │   └── dashboard.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Roadmap

Potential next steps for Mantis include:

- Package the responsive app for Android with Capacitor
- Add a reliable local data export and restore workflow
- Continue refining the mobile experience
- Consider optional cloud backup or account features separately from local storage

These are future possibilities, not features promised in the current version.

## Project links

- **Repository:** [mubarakwasim2007-hub/Mantis](https://github.com/mubarakwasim2007-hub/Mantis)
- **Google AI Studio project:** [Open in AI Studio](https://ai.studio/apps/1ab7c9b6-a8aa-4968-8d60-2df7fac3d2e0)

---

<p align="center">
  Built by <strong>Mohammed Wasim M</strong> · B.Tech Biomedical Engineering
</p>
