'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Radio,
  Tv,
  ListOrdered,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Music,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export default function HomePage() {
  const { switchRole } = useAuth();

  const workflowSteps = [
    { title: 'Create Society', desc: 'Buildings, towers, flats & resident memberships', role: 'society_admin' as const },
    { title: 'Create Event', desc: 'Categories, dates, dynamic form questions & AV rules', role: 'society_admin' as const },
    { title: 'Resident Registers', desc: 'Performers roster, audio MP3 track & minor consent', role: 'resident' as const },
    { title: 'Admin Reviews', desc: 'Audition audio player, photo check & 1-click approvals', role: 'society_admin' as const },
    { title: 'Build Lineup', desc: 'Reorder run-order, schedule math & auto-pacing', role: 'society_admin' as const },
    { title: 'Live Stage Console', desc: 'Countdown timers, stage calls & live state machine', role: 'stage_manager' as const },
    { title: 'Event Display Mode', desc: 'Big-screen TV/projector view updated in realtime', role: 'resident' as const },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* HERO SECTION */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
          <span>Next-Gen Cultural Ops for Housing Societies</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight">
          Where Society Talent Meets <span className="stage-text-gradient">The Main Stage.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From participant registration and audio track uploads to real-time backstage cueing, countdown timers, and live projector screens.
        </p>

        {/* PRIMARY CTA BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href={`/events/${DEMO_EVENT_ID}/live`}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-black text-sm shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
          >
            <Radio className="w-5 h-5 animate-pulse" />
            <span>Launch Live Stage Console</span>
          </Link>

          <Link
            href={`/events/${DEMO_EVENT_ID}/display`}
            target="_blank"
            className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm shadow-xl transition-all flex items-center gap-2"
          >
            <Tv className="w-4 h-4 text-purple-400" />
            <span>Open TV / Projector Display</span>
          </Link>

          <Link
            href="/admin"
            className="px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Admin Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* COMPLETE END-TO-END WORKFLOW CAROUSEL */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            Engineered Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            The Complete SocietyStage Workflow
          </h2>
          <p className="text-xs text-slate-400">Click any stage to instantly switch into that viewpoint:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => switchRole(step.role)}
              className="p-5 rounded-3xl glass-panel text-left border border-white/5 hover:border-amber-500/40 hover:bg-slate-900/60 transition-all duration-300 group hover:scale-102 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block mb-3">
                  Stage 0{idx + 1}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-amber-400">
                <span>View as {step.role.replace('_', ' ')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODULE SHOWCASES: LIVE CONSOLE, RESIDENT REGISTRATION, LINEUP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-panel-highlight border border-red-500/30 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Live Event Command Center</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            High-contrast dark operator station with live countdown clocks, next-in-wings queuing, one-click stage state transitions, and audio player.
          </p>
          <Link
            href={`/events/${DEMO_EVENT_ID}/live`}
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl glass-panel-highlight border border-amber-500/30 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ListOrdered className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Lineup & Run-Order Builder</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Calculate accurate start and end times, buffer transitions, auto-pacing by category, and lock finalized stage schedules.
          </p>
          <Link
            href="/admin/lineup"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Open Lineup Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl glass-panel-highlight border border-purple-500/30 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Resident Mobile Experience</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Simplified mobile portal for browsing cultural events, 6-step registration with audio MP3 upload, and backstage notifications.
          </p>
          <Link
            href="/resident"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Open Resident Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
