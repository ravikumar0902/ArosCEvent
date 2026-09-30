'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users2,
  Clock,
  CheckCircle,
  Radio,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Event, Registration, Performance } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatTime, formatDate, formatSecondsToMinutes } from '@/lib/utils';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export function AdminDashboard() {
  const { currentSociety } = useAuth();
  const { lastEvent } = useRealtime();

  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);

  useEffect(() => {
    if (!currentSociety) return;
    const evts = db.getEvents(currentSociety.id);
    setEvents(evts);
    const regs = db.getRegistrations(DEMO_EVENT_ID);
    setRegistrations(regs);
    const perfs = db.getPerformances(DEMO_EVENT_ID);
    setPerformances(perfs);
  }, [currentSociety, lastEvent]);

  const nextEvent = events.find((e) => e.status === 'live' || e.status === 'registration_open' || e.status === 'published') || events[0];

  const pendingReviews = registrations.filter((r) => r.status === 'submitted' || r.status === 'under_review');
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const checkedInCount = performances.filter((p) => p.status === 'checked_in' || p.status === 'ready' || p.status === 'on_stage' || p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Society Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organizing cultural festivals, stage lineups, and resident participations for {currentSociety?.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
          <Link
            href={`/events/${DEMO_EVENT_ID}/live`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all hover:scale-102"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Live Console</span>
          </Link>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Upcoming Events</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{events.length}</div>
          <span className="text-[10px] text-emerald-400 font-semibold block">Active Society Season</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registrations</span>
            <Users2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{registrations.length}</div>
          <span className="text-[10px] text-slate-400 font-semibold block">Total Act Submissions</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-400 font-mono">{pendingReviews.length}</div>
          <span className="text-[10px] text-yellow-300 font-semibold block">Requires Attention</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Approved Acts</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{approvedCount}</div>
          <span className="text-[10px] text-emerald-400 font-semibold block">Ready for Lineup</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Stage Check-ins</span>
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {checkedInCount} / {performances.length}
          </div>
          <span className="text-[10px] text-purple-300 font-semibold block">Event Day Attendance</span>
        </div>
      </div>

      {/* FEATURED NEXT EVENT HERO BANNER */}
      {nextEvent && (
        <div className="glass-panel-highlight rounded-3xl p-6 sm:p-8 border border-amber-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <StatusBadge type="event" status={nextEvent.status} size="sm" />
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Featured Event
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {nextEvent.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                {nextEvent.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span>📅 {formatDate(nextEvent.start_at)}</span>
                <span>⏰ {formatTime(nextEvent.start_at)} - {formatTime(nextEvent.end_at)}</span>
                <span>📍 {nextEvent.venue}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto shrink-0">
              <Link
                href={`/events/${nextEvent.id}/live`}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Launch Live Stage</span>
              </Link>
              <Link
                href="/admin/lineup"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Edit Lineup Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/participants"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center transition-colors"
              >
                Review Submissions ({pendingReviews.length} Pending)
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RECENT SUBMISSIONS AWAITING REVIEW */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Recent Act Submissions</h3>
            <p className="text-xs text-slate-400">Incoming registrations from society members</p>
          </div>
          <Link
            href="/admin/participants"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All ({registrations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Performance Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Submitter / Unit</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {registrations.slice(0, 6).map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    {reg.title}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {reg.category?.name || 'Category'}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className="font-semibold block">{reg.submitter?.full_name || 'Resident'}</span>
                    <span className="text-[10px] text-slate-400">Tower A</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {formatSecondsToMinutes(reg.duration_seconds)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge type="registration" status={reg.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/admin/participants?selected=${reg.id}`}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition-colors"
                    >
                      Review
                    </Link>
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
