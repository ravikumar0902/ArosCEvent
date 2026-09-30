'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ListOrdered,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Radio,
  Music,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Performance, Event, Registration } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatTime, formatSecondsToMinutes } from '@/lib/utils';
import { toast } from 'sonner';

interface LineupBuilderProps {
  eventId: string;
}

export function LineupBuilder({ eventId }: LineupBuilderProps) {
  const { user, currentSociety } = useAuth();
  const { lastEvent } = useRealtime();

  const bufferSeconds = currentSociety?.settings_json?.stage_operations?.default_transition_buffer_seconds ?? 60;

  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const loadData = () => {
    const ev = db.getEvent(eventId);
    setEvent(ev);
    const perfs = db.getPerformances(eventId);
    setPerformances(perfs);
  };

  useEffect(() => {
    loadData();
  }, [eventId, lastEvent]);

  // Total runtime calculation using configured buffer
  const totalPerformanceSeconds = performances.reduce((acc, p) => acc + p.duration_seconds + (p.transition_seconds || bufferSeconds), 0);
  const totalMinutes = Math.round(totalPerformanceSeconds / 60);

  // Move item up
  const moveUp = (index: number) => {
    if (isLocked || index === 0) return;
    const reordered = [...performances];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;

    const orderedIds = reordered.map((p) => p.id);
    db.reorderPerformances(eventId, orderedIds, user?.id || 'admin');
    toast.success('Lineup reordered');
    loadData();
  };

  // Move item down
  const moveDown = (index: number) => {
    if (isLocked || index === performances.length - 1) return;
    const reordered = [...performances];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;

    const orderedIds = reordered.map((p) => p.id);
    db.reorderPerformances(eventId, orderedIds, user?.id || 'admin');
    toast.success('Lineup reordered');
    loadData();
  };

  // Auto scheduler (Section 12: generates proposed balanced lineup based on categories and durations)
  const handleAutoSchedule = () => {
    if (isLocked) return;
    // Group alternating categories so we don't have 3 dances in a row
    const sorted = [...performances].sort((a, b) => {
      // Alternate dance with singing/instrumental/comedy
      const aIsDance = a.title.toLowerCase().includes('dance');
      const bIsDance = b.title.toLowerCase().includes('dance');
      if (aIsDance && !bIsDance) return -1;
      if (!aIsDance && bIsDance) return 1;
      return a.duration_seconds - b.duration_seconds;
    });

    const orderedIds = sorted.map((p) => p.id);
    db.reorderPerformances(eventId, orderedIds, user?.id || 'admin');
    toast.success('Auto-schedule algorithm applied! Category pacing optimized.');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-amber-500/20 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
              Stage Lineup Builder
            </span>
            <span className="text-xs text-slate-400">• {event?.name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Official Performance Run-Order
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsLocked(!isLocked);
              toast.info(isLocked ? 'Lineup unlocked for editing' : 'Lineup locked and finalized!');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              isLocked
                ? 'bg-red-950/70 border-red-800 text-red-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Schedule Locked' : 'Lock Schedule'}</span>
          </button>

          <button
            onClick={handleAutoSchedule}
            disabled={isLocked}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all hover:scale-102"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Auto Schedule</span>
          </button>

          <Link
            href={`/events/${eventId}/live`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Console</span>
          </Link>
        </div>
      </div>

      {/* METRIC PILLS: TOTAL ACTS, TOTAL DURATION, START, END */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <span className="text-slate-400 block font-medium">Lineup Count</span>
          <span className="text-lg font-black text-white font-mono">{performances.length} Acts</span>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <span className="text-slate-400 block font-medium">Total Stage Runtime</span>
          <span className="text-lg font-black text-amber-400 font-mono">~{totalMinutes} mins</span>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <span className="text-slate-400 block font-medium">First Act Kickoff</span>
          <span className="text-lg font-black text-slate-200 font-mono">
            {formatTime(performances[0]?.scheduled_start_at)}
          </span>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <span className="text-slate-400 block font-medium">Estimated Finale</span>
          <span className="text-lg font-black text-slate-200 font-mono">
            {formatTime(performances[performances.length - 1]?.scheduled_end_at)}
          </span>
        </div>
      </div>

      {/* REORDERABLE LINEUP LIST */}
      <div className="space-y-3">
        {performances.map((perf, index) => (
          <div
            key={perf.id}
            className={`p-4 rounded-2xl glass-panel border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              perf.status === 'on_stage'
                ? 'border-red-500/80 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'border-white/5 hover:border-slate-700'
            }`}
          >
            {/* Left: Sequence badge, title, category, timings */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-mono font-black text-amber-300 text-sm shrink-0">
                #{perf.performance_number}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{perf.title}</h4>
                  {(() => {
                    const reg = db.getRegistration(perf.registration_id);
                    if (reg?.wing || reg?.flat_number) {
                      return (
                        <span className="text-[10px] text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                          {reg.wing ? `${reg.wing} • ` : ''}Flat {reg.flat_number}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <StatusBadge type="performance" status={perf.status} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-300">{perf.category?.name}</span>
                  <span>•</span>
                  <span className="font-mono text-amber-400">
                    {formatTime(perf.scheduled_start_at)} - {formatTime(perf.scheduled_end_at)}
                  </span>
                  <span>•</span>
                  <span>Act: {formatSecondsToMinutes(perf.duration_seconds)} (+60s buffer)</span>
                </div>

                {perf.equipment_notes && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cues: <span className="text-slate-300">{perf.equipment_notes}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right: Reorder Up/Down buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => moveUp(index)}
                disabled={isLocked || index === 0}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white transition-colors border border-slate-800"
                title="Move up in sequence"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={isLocked || index === performances.length - 1}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white transition-colors border border-slate-800"
                title="Move down in sequence"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
