import React from 'react';
import { Award, Clock, Target, TrendingUp } from 'lucide-react';

export interface GoalsOverviewMetric {
  id: string;
  title: string;
  value: string;
  subtext: string;
  caption?: string;
  icon: 'award' | 'clock' | 'target' | 'trending';
  iconColor: string;
  progressPercent?: number;
}

interface GoalsCardProps {
  title: string;
  value: string;
  subtext: string;
  caption?: string;
  icon: React.ReactNode;
  progressPercent?: number;
  subtextColor?: string;
}

export const GoalsCard: React.FC<GoalsCardProps> = ({
  title,
  value,
  subtext,
  caption,
  icon,
  progressPercent,
  subtextColor = 'text-indigo-300',
}) => {
  return (
    <div className="glass-card rounded-3xl p-5 border border-white/20 relative overflow-hidden flex flex-col justify-between min-h-[124px]">
      {/* 
        SURGICAL FIX: Contained metadata container positioned absolute top-4 right-4 
        with max-w-[42%] and text-right, preventing overflow of text like "2024 Graduation"
      */}
      <div className="absolute top-4 right-4 max-w-[42%] text-right flex flex-col items-end pointer-events-none z-10">
        <div className="mb-1">{icon}</div>
        <span
          className={`text-xs ${subtextColor} font-medium block truncate max-w-full leading-tight`}
          title={subtext}
        >
          {subtext}
        </span>
      </div>

      {/* Main Metric content on left with safe padding right */}
      <div className="pr-20 min-w-0">
        <span className="text-xs text-slate-400 block truncate" title={title}>
          {title}
        </span>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono block truncate">
            {value}
          </span>
        </div>
      </div>

      {/* Bottom caption or progress bar */}
      <div className="mt-3">
        {progressPercent !== undefined ? (
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full"
            />
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 truncate" title={caption}>
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};
