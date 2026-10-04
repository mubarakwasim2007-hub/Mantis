/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { DashboardGrid } from './components/DashboardGrid.tsx';
import { HabitTrackerView } from './components/HabitTrackerView.tsx';
import { GoalsView } from './components/GoalsView.tsx';
import { StudyPlannerView } from './components/StudyPlannerView.tsx';
import { NotesView } from './components/NotesView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Menu, X, Sparkles, Flame } from 'lucide-react';
import { MantisLogo } from './components/MantisLogo.tsx';
import { seedDefaultData } from './db/dbService.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    seedDefaultData();
  }, []);

  // Render the full-page view cleanly based on active sidebar navigation
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardGrid onNavigate={setActiveTab} />;
      case 'study-planner':
        return <StudyPlannerView />;
      case 'habit-tracker':
        return <HabitTrackerView />;
      case 'goals':
        return <GoalsView />;
      case 'notes':
        return <NotesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardGrid onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden flex flex-col md:flex-row">
      {/* 
        MUTED CALM DARK AMBIENT BACKGROUND
        Deep charcoal/slate canvas with low-opacity soft indigo and graphite blurs
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep calm slate base */}
        <div className="absolute inset-0 bg-[#090d16]" />

        {/* Soft, low-opacity ambient blurs (no loud neons) */}
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[55vh] rounded-full bg-slate-800/25 blur-[150px]" />
        <div className="absolute top-[10%] left-[20%] w-[45vw] h-[50vh] rounded-full bg-indigo-950/35 blur-[160px]" />
        <div className="absolute top-[15%] left-[5%] w-[35vw] h-[40vh] rounded-full bg-cyan-950/15 blur-[140px]" />
        <div className="absolute top-[25%] -right-[5%] w-[40vw] h-[55vh] rounded-full bg-zinc-800/20 blur-[150px]" />
        <div className="absolute -bottom-[10%] right-[5%] w-[45vw] h-[50vh] rounded-full bg-slate-800/20 blur-[160px]" />

        {/* Subtle noise / specular texture overlay */}
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Mobile Top Navigation Header (visible only on small mobile viewports) */}
      <div className="md:hidden relative z-30 px-4 py-3.5 flex items-center justify-between glass-pill border-b border-white/10 m-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <MantisLogo size={24} />
            <span className="font-bold text-white text-base">Mantis</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
            BME · 3rd Sem
          </span>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-2xl p-6 pt-16 flex flex-col justify-between">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}
          />
        </div>
      )}

      {/* Fixed Desktop Left Sidebar */}
      <div className="hidden md:flex relative z-20 h-screen sticky top-0 border-r border-white/10 bg-slate-950/20 backdrop-blur-xl">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </div>

      {/* Main Full-Page Content Viewport */}
      <main className="relative z-10 flex-1 min-w-0 min-h-screen overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
}
