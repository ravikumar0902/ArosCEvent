'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Maximize,
  Minimize,
  Radio,
  Clock,
  Music,
  Users,
  Award,
  Megaphone,
  Coffee,
} from 'lucide-react';
import { Event, Performance, Announcement } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useRealtime } from '@/context/realtime-context';
import { formatTime, formatSecondsToMinutes } from '@/lib/utils';

interface EventDisplayModeProps {
  eventId: string;
}

export function EventDisplayMode({ eventId }: EventDisplayModeProps) {
  const { lastEvent } = useRealtime();

  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | undefined>(undefined);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Display mode tabs: 'now_playing' | 'welcome' | 'next' | 'break' | 'announcement' | 'results'
  const [displayMode, setDisplayMode] = useState<'now_playing' | 'welcome' | 'next' | 'break' | 'announcement' | 'results'>('now_playing');

  const refresh = () => {
    const ev = db.getEvent(eventId);
    setEvent(ev);
    const perfs = db.getPerformances(eventId);
    setPerformances(perfs);
    const anns = db.getAnnouncements(eventId);
    if (anns.length > 0) {
      setLatestAnnouncement(anns[0]);
    }
  };

  useEffect(() => {
    refresh();
  }, [eventId, lastEvent]);

  // Live wall clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const currentPerformance = performances.find((p) => p.status === 'on_stage') ||
    performances.find((p) => p.status === 'ready') ||
    performances[0];

  const nextPerformance = currentPerformance
    ? performances.find((p) => p.performance_number === currentPerformance.performance_number + 1)
    : undefined;

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Background ambient light effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* TOP BAR: SOCIETY BRAND, LIVE TIME, FULLSCREEN BUTTON */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl stage-gradient flex items-center justify-center text-slate-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            <Sparkles className="w-7 h-7 fill-slate-950" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight stage-text-gradient">
              {event?.name || 'Green Valley Cultural Night'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Green Valley Residency • {event?.venue || 'Central Stage'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live digital clock */}
          <div className="text-right">
            <div suppressHydrationWarning className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
              Live Stage Time
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10"
            title="Toggle Projector Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* CENTER STAGE HERO AREA BASED ON DISPLAY MODE */}
      <main className="my-auto py-8 relative z-10">
        {displayMode === 'now_playing' && currentPerformance && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Live on-stage pill badge */}
            <div className="flex items-center justify-center">
              <span className="flex items-center gap-3 px-6 py-2 rounded-full bg-red-600 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse">
                <Radio className="w-5 h-5" />
                <span>NOW PERFORMING ON STAGE</span>
              </span>
            </div>

            {/* Huge readable act title */}
            <div className="text-center space-y-3">
              <div className="inline-block px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-base font-bold border border-amber-500/30">
                ACT #{currentPerformance.performance_number} • {currentPerformance.category?.name}
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                {currentPerformance.title}
              </h1>

              <p className="text-xl sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto">
                Presented by Green Valley Resident Performers
              </p>
            </div>

            {/* Next act ticker footer on projector */}
            {nextPerformance && (
              <div className="glass-panel-highlight rounded-3xl p-6 border border-white/10 flex items-center justify-between gap-4 max-w-3xl mx-auto shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
                  <div>
                    <span className="text-xs uppercase font-bold text-purple-400 tracking-wider block">
                      UP NEXT IN THE WINGS
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      #{nextPerformance.performance_number} {nextPerformance.title}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">
                    {nextPerformance.category?.name}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Est. {formatTime(nextPerformance.scheduled_start_at)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {displayMode === 'welcome' && (
          <div className="text-center max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Sparkles className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight">
              Welcome to {event?.name}!
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Please take your seats. The evening celebration of talent, rhythm and community is in progress.
            </p>
          </div>
        )}

        {displayMode === 'break' && (
          <div className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Coffee className="w-16 h-16 text-amber-400 mx-auto" />
            <h1 className="text-5xl sm:text-6xl font-black text-white">Intermission Break</h1>
            <p className="text-xl text-slate-300">
              Refreshments, snacks and community booths are open in Zone C. Stage performances will resume in 5 minutes.
            </p>
          </div>
        )}

        {displayMode === 'announcement' && latestAnnouncement && (
          <div className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Megaphone className="w-16 h-16 text-amber-400 mx-auto" />
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm uppercase tracking-wider">
              {latestAnnouncement.announcement_type.replace('_', ' ')}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white">{latestAnnouncement.title}</h1>
            <p className="text-2xl text-slate-200 leading-relaxed max-w-2xl mx-auto">
              {latestAnnouncement.message}
            </p>
          </div>
        )}

        {displayMode === 'results' && (
          <div className="text-center max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Award className="w-16 h-16 text-amber-400 mx-auto" />
            <h1 className="text-5xl sm:text-6xl font-black text-white">Grand Awards Ceremony</h1>
            <p className="text-xl text-slate-300">
              The jury has submitted the scores. Announcing category winners and prize distributions shortly!
            </p>
          </div>
        )}
      </main>

      {/* BOTTOM MODE SELECTOR (for stage technician or touch display) */}
      <footer className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Display View:</span>
          {(['now_playing', 'welcome', 'break', 'announcement', 'results'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setDisplayMode(m)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                displayMode === m
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-slate-500 font-medium">
          SocietyStage Public Stage Projector Feed
        </div>
      </footer>
    </div>
  );
}
