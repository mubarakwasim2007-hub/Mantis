import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Target,
  FileText,
  BarChart2,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { MantisLogo } from './MantisLogo.tsx';

export type NavTab =
  | 'dashboard'
  | 'study-planner'
  | 'habit-tracker'
  | 'goals'
  | 'notes'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  className?: string;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'study-planner', label: 'Study Planner', icon: BookOpen },
  { id: 'habit-tracker', label: 'Habit Tracker', icon: CheckSquare },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  className = '',
}) => {
  return (
    <aside
      className={`w-64 flex-shrink-0 flex flex-col justify-between py-6 px-4 ${className}`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-2 mb-8">
          <MantisLogo size={32} />
          <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Mantis
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                type="button"
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-slate-900/60 text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] border border-white/20 backdrop-blur-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-cyan-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Real Student Context Card */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-semibold text-white tracking-wide truncate">
              Mohammed Wasim M
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium">
            B.Tech Biomedical Eng.
          </p>
          <p className="text-[10px] text-slate-400">
            SRMIST • Trichy Campus
          </p>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>2nd Yr · Sem 3</span>
            <span className="text-emerald-400 font-semibold">CGPA 9.47</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
