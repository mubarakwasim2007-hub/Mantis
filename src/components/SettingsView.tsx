import React, { useState } from 'react';
import { Settings, Moon, Bell, Shield, User, Sliders, RotateCcw } from 'lucide-react';
import { db } from '../db/db.ts';
import { REAL_INITIAL_SUBJECTS } from '../db/dbService.ts';

export const SettingsView: React.FC = () => {
  const [glassBlur, setGlassBlur] = useState(24);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleResetData = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    await db.transaction(
      'rw',
      [db.subjects, db.tasks, db.habits, db.habitLogs, db.goals, db.notes, db.studySessions],
      async () => {
        await db.subjects.clear();
        await db.tasks.clear();
        await db.habits.clear();
        await db.habitLogs.clear();
        await db.goals.clear();
        await db.notes.clear();
        await db.studySessions.clear();
        await db.subjects.bulkAdd(REAL_INITIAL_SUBJECTS);
      }
    );
    setResetConfirm(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
          Settings & Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Local-first offline workspace preferences • 100% on-device IndexedDB storage
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/20 space-y-6">
        {/* Real User Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10 flex-wrap sm:flex-nowrap">
          {/* Real user monogram avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] border-2 border-cyan-300 shrink-0">
            MW
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white">Mohammed Wasim M</h3>
            <p className="text-xs sm:text-sm text-cyan-300 font-medium">
              B.Tech Biomedical Engineering
            </p>
            <p className="text-xs text-slate-300">
              SRM Institute of Science and Technology • Trichy Campus
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-slate-200 border border-white/15">
                2nd Year • 3rd Semester
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                CGPA: 9.47
              </span>
            </div>
          </div>
        </div>

        {/* Visual Experience Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Liquid Glass Visual Aesthetics</span>
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Backdrop Glass Blur</span>
              <span className="font-mono text-cyan-300">{glassBlur}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="40"
              value={glassBlur}
              onChange={(e) => setGlassBlur(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-200">Ambient Background Glow</p>
              <p className="text-xs text-slate-400">Deep slate and muted indigo lighting</p>
            </div>
            <button
              onClick={() => setAmbientGlow(!ambientGlow)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                ambientGlow ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  ambientGlow ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-200">Daily Study Reminders</p>
              <p className="text-xs text-slate-400">Keep track of your real current semester subjects</p>
            </div>
            <button
              onClick={() => setDailyReminders(!dailyReminders)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                dailyReminders ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  dailyReminders ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Database & Privacy Section */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Local Storage & Privacy</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All tasks, habits, goals, notes, and study sessions are saved exclusively on your local device in IndexedDB. No cloud storage, no account tracking, and 100% offline-first.
          </p>

          <div className="pt-2">
            <button
              onClick={handleResetData}
              type="button"
              className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
                resetConfirm
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {resetConfirm
                  ? 'Confirm Clear All & Reset to 5 Real Subjects?'
                  : 'Reset to Clean 5 Subjects'}
              </span>
            </button>
            {resetConfirm && (
              <button
                onClick={() => setResetConfirm(false)}
                type="button"
                className="ml-3 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
