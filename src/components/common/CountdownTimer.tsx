'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { formatSecondsToMinutes } from '@/lib/utils';

interface CountdownTimerProps {
  allottedDurationSeconds: number;
  actualStartTime?: string | null;
  isRunning?: boolean;
  onTimeExceeded?: () => void;
  className?: string;
}

export function CountdownTimer({
  allottedDurationSeconds,
  actualStartTime,
  isRunning = false,
  onTimeExceeded,
  className,
}: CountdownTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!actualStartTime) {
      setElapsed(0);
      return;
    }

    const startMs = new Date(actualStartTime).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startMs) / 1000));
      setElapsed(diffSecs);
    }, 1000);

    return () => clearInterval(interval);
  }, [actualStartTime, isRunning]);

  const remaining = allottedDurationSeconds - elapsed;
  const isOvertime = remaining < 0;

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl glass-panel-highlight border border-white/10 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
        Stage Timer
      </span>

      <div className="flex items-baseline gap-3">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-white tracking-tight">
            {formatSecondsToMinutes(elapsed)}
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">Elapsed</span>
        </div>

        <span className="text-2xl text-slate-600 font-mono">/</span>

        <div className="text-center">
          <div
            className={`text-3xl font-mono font-bold tracking-tight ${
              isOvertime ? 'text-red-400 animate-pulse' : 'text-amber-400'
            }`}
          >
            {isOvertime ? `+${formatSecondsToMinutes(Math.abs(remaining))}` : formatSecondsToMinutes(remaining)}
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">
            {isOvertime ? 'Overtime' : 'Remaining'}
          </span>
        </div>
      </div>

      {isOvertime && (
        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Exceeding allotted time</span>
        </div>
      )}
    </div>
  );
}
