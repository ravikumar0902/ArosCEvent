'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, PieChart, Users, Clock, CheckCircle } from 'lucide-react';
import { Event, Performance, Registration, Score } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { formatSecondsToMinutes, formatTime } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportsViewerProps {
  eventId: string;
}

export function ReportsViewer({ eventId }: ReportsViewerProps) {
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    setEvent(db.getEvent(eventId));
    setPerformances(db.getPerformances(eventId));
    setRegistrations(db.getRegistrations(eventId));
    setScores(db.getScores().filter((s) => s.event_id === eventId));
  }, [eventId]);

  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const checkedInCount = performances.filter((p) => p.status === 'checked_in' || p.status === 'ready' || p.status === 'on_stage' || p.status === 'completed').length;
  const completedCount = performances.filter((p) => p.status === 'completed').length;
  const noShows = performances.filter((p) => p.status === 'no_show').length;

  const exportCSV = () => {
    const headers = ['Act Number', 'Performance Title', 'Category', 'Duration (Min)', 'Status', 'Scheduled Start', 'Scheduled End'];
    const rows = performances.map((p) => [
      p.performance_number,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category?.name || 'General'}"`,
      (p.duration_seconds / 60).toFixed(1),
      p.status,
      formatTime(p.scheduled_start_at),
      formatTime(p.scheduled_end_at),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SocietyStage_${event?.slug || 'event'}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report CSV exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            Festival Analytics
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Cultural Event Summary & Attendance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{event?.name}</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-102"
        >
          <Download className="w-4 h-4" />
          <span>Export Lineup & Scores CSV</span>
        </button>
      </div>

      {/* METRIC GRIDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs font-medium">Submissions Received</span>
          <div className="text-2xl font-black text-white font-mono">{registrations.length}</div>
          <span className="text-[11px] text-emerald-400">100% evaluated</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs font-medium">Stage Approvals</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{approvedCount}</div>
          <span className="text-[11px] text-slate-400">Qualified for Lineup</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs font-medium">Attendance & Check-ins</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{checkedInCount} / {performances.length}</div>
          <span className="text-[11px] text-purple-300">
            {performances.length ? Math.round((checkedInCount / performances.length) * 100) : 0}% turn-out
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs font-medium">Acts Completed</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{completedCount}</div>
          <span className="text-[11px] text-slate-400">{noShows} No-Shows</span>
        </div>
      </div>

      {/* DETAILED LINEUP RUN-TIME BREAKDOWN TABLE */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white">Full Event Lineup Timeline</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Slot</th>
                <th className="py-3 px-3">Act Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Allotted</th>
                <th className="py-3 px-3">Scheduled Slot</th>
                <th className="py-3 px-3">Stage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {performances.map((perf) => (
                <tr key={perf.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">#{perf.performance_number}</td>
                  <td className="py-3 px-3 font-bold text-white">{perf.title}</td>
                  <td className="py-3 px-3 text-slate-300">{perf.category?.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{formatSecondsToMinutes(perf.duration_seconds)}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {formatTime(perf.scheduled_start_at)} - {formatTime(perf.scheduled_end_at)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold capitalize text-slate-300">{perf.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
