'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Volume2,
  Tv,
  Megaphone,
  UserCheck,
  ChevronRight,
  Sparkles,
  RotateCw,
  Pause,
  FastForward,
  XCircle,
  Eye,
  Maximize2,
} from 'lucide-react';
import { Performance, Event, Checkin, Announcement } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { formatTime, formatSecondsToMinutes } from '@/lib/utils';
import { toast } from 'sonner';

interface LiveCommandCenterProps {
  eventId: string;
}

export function LiveCommandCenter({ eventId }: LiveCommandCenterProps) {
  const { user } = useAuth();
  const { lastEvent } = useRealtime();

  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementType, setAnnouncementType] = useState<'stage_call' | 'general' | 'urgent'>('stage_call');

  const refreshData = () => {
    const ev = db.getEvent(eventId);
    setEvent(ev);
    const perfs = db.getPerformances(eventId);
    setPerformances(perfs);
    const chks = db.getCheckins(eventId);
    setCheckins(chks);
  };

  useEffect(() => {
    refreshData();
  }, [eventId, lastEvent]);

  // Derive Current Performance (on_stage, or first ready/checked_in/queued)
  const currentPerformance = performances.find((p) => p.status === 'on_stage') ||
    performances.find((p) => p.status === 'ready') ||
    performances.find((p) => p.status === 'checked_in') ||
    performances.find((p) => p.status === 'queued');

  // Derive Next Performance
  const nextPerformance = currentPerformance
    ? performances.find((p) => p.performance_number === currentPerformance.performance_number + 1)
    : undefined;

  // Queue of upcoming performances
  const queuedPerformances = performances.filter((p) => p.status !== 'completed' && p.status !== 'cancelled');
  const completedPerformances = performances.filter((p) => p.status === 'completed');

  const handleStateChange = (performanceId: string, targetStatus: any, notes?: string) => {
    try {
      db.updatePerformanceLiveStatus(performanceId, targetStatus, user?.id || 'admin', notes);
      toast.success(`Act moved to ${targetStatus.replace('_', ' ').toUpperCase()}`);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || 'Cannot perform state transition');
    }
  };

  const handleCheckin = (performanceId: string) => {
    try {
      db.recordCheckin(performanceId, user?.id || 'admin', 'present', 'Checked in via Live Console');
      toast.success('Performer marked present and checked in');
      refreshData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMsg.trim()) return;

    db.broadcastAnnouncement(
      eventId,
      announcementTitle,
      announcementMsg,
      announcementType,
      user?.id || 'admin'
    );
    toast.success('Announcement broadcast to all screens!');
    setAnnouncementModalOpen(false);
    setAnnouncementTitle('');
    setAnnouncementMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Top Live Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px] uppercase tracking-wider">
                Live Air
              </span>
              <span className="text-xs text-slate-400">Real-time Stage Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {event?.name || 'Stage Command Center'}
            </h1>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setAnnouncementModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Cue</span>
          </button>

          <Link
            href={`/events/${eventId}/display`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <Tv className="w-4 h-4" />
            <span>Open Display Screen</span>
          </Link>
        </div>
      </div>

      {/* 3-COLUMN MAIN STAGE WORKSPACE: LEFT QUEUE, CENTER CURRENT, RIGHT NEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (4 COLS): STAGE QUEUE & ROSTER */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-3xl p-5 border border-white/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Lineup Queue ({queuedPerformances.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Done: {completedPerformances.length} / {performances.length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[640px] pr-1">
              {queuedPerformances.map((perf) => {
                const isCurrent = currentPerformance?.id === perf.id;
                const isNext = nextPerformance?.id === perf.id;

                return (
                  <div
                    key={perf.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-red-950/50 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : isNext
                        ? 'bg-amber-950/40 border-amber-500/60'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          #{perf.performance_number}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{perf.title}</h4>
                      </div>
                      <StatusBadge type="performance" status={perf.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{perf.category?.name || 'Act'}</span>
                      <span className="font-mono">{formatSecondsToMinutes(perf.duration_seconds)}</span>
                    </div>

                    {/* Quick stage action buttons inside list */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1">
                      {perf.status === 'queued' && (
                        <button
                          onClick={() => handleCheckin(perf.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold"
                        >
                          Check In
                        </button>
                      )}
                      {perf.status === 'checked_in' && (
                        <button
                          onClick={() => handleStateChange(perf.id, 'ready')}
                          className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-600/70 text-amber-300 text-[10px] font-bold"
                        >
                          Mark Ready
                        </button>
                      )}
                      {perf.status === 'ready' && (
                        <button
                          onClick={() => handleStateChange(perf.id, 'on_stage')}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold shadow-md"
                        >
                          Move On Stage
                        </button>
                      )}
                      {perf.status === 'on_stage' && (
                        <button
                          onClick={() => handleStateChange(perf.id, 'completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow-md"
                        >
                          Complete Act
                        </button>
                      )}

                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => handleStateChange(perf.id, 'delayed')}
                          title="Delay performance"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 text-[10px]"
                        >
                          Delay
                        </button>
                        <button
                          onClick={() => handleStateChange(perf.id, 'no_show')}
                          title="Mark no show"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 text-[10px]"
                        >
                          No Show
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (5 COLS): CURRENT ACTIVE PERFORMANCE */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel-highlight rounded-3xl p-6 border border-amber-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>ON STAGE NOW</span>
              </span>

              {currentPerformance && (
                <span className="font-mono text-xs font-bold text-amber-400">
                  Performance #{currentPerformance.performance_number}
                </span>
              )}
            </div>

            {currentPerformance ? (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {currentPerformance.category?.name || 'Performance'}
                  </span>
                  <h3 className="text-2xl font-black text-white leading-tight mt-1">
                    {currentPerformance.title}
                  </h3>
                </div>

                {/* Live Countdown & Elapsed Timer */}
                <CountdownTimer
                  allottedDurationSeconds={currentPerformance.duration_seconds}
                  actualStartTime={currentPerformance.actual_start_at}
                  isRunning={currentPerformance.status === 'on_stage'}
                />

                {/* Timing stats */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block font-medium">Scheduled</span>
                    <span className="text-slate-200 font-mono font-bold">
                      {formatTime(currentPerformance.scheduled_start_at)} - {formatTime(currentPerformance.scheduled_end_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Actual Start</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {currentPerformance.actual_start_at ? formatTime(currentPerformance.actual_start_at) : 'Waiting cue'}
                    </span>
                  </div>
                </div>

                {/* Stage Cues & Equipment */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <span className="font-bold text-amber-300 block mb-0.5">AV & Lighting Cues</span>
                  {currentPerformance.equipment_notes || 'Standard handheld mics and center illumination.'}
                </div>

                {/* Embedded Audio Track Player */}
                <AudioPlayer
                  src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=bollywood-groove-112194.mp3"
                  title={`Track for #${currentPerformance.performance_number} - ${currentPerformance.title}`}
                />

                {/* STAGE OPERATOR PRIMARY CONTROLS */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
                  {currentPerformance.status !== 'on_stage' ? (
                    <button
                      onClick={() => handleStateChange(currentPerformance.id, 'on_stage')}
                      className="col-span-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-102 active:scale-98 transition-all"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>START PERFORMANCE NOW</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStateChange(currentPerformance.id, 'completed')}
                      className="col-span-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-102 active:scale-98 transition-all"
                    >
                      <CheckCircle className="w-5 h-5 fill-white" />
                      <span>COMPLETE & ADVANCE NEXT</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleStateChange(currentPerformance.id, 'delayed', 'Paused by stage manager')}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 text-xs font-bold transition-colors"
                  >
                    Pause / Delay
                  </button>

                  <button
                    onClick={() => handleStateChange(currentPerformance.id, 'no_show', 'Performer unavailable')}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-300 text-xs font-bold transition-colors"
                  >
                    Skip / No-Show
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="font-bold text-white">All acts completed!</p>
                <p className="text-xs">Great job team, the cultural lineup is finished.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (3 COLS): NEXT PERFORMANCE IN THE WINGS */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel rounded-3xl p-5 border border-white/10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  In The Wings (Next)
                </h3>
              </div>

              {nextPerformance ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30">
                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800">
                      Act #{nextPerformance.performance_number}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2 leading-tight">
                      {nextPerformance.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {nextPerformance.category?.name || 'Category'} • {formatSecondsToMinutes(nextPerformance.duration_seconds)}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                      <span className="text-slate-400 block font-medium">Stage Status</span>
                      <StatusBadge type="performance" status={nextPerformance.status} size="sm" className="mt-1" />
                    </div>

                    <div className="mt-3 text-xs">
                      <span className="text-slate-400 block font-medium">Props / Requirements</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {nextPerformance.equipment_notes || 'Standard setup'}
                      </p>
                    </div>
                  </div>

                  {nextPerformance.status === 'checked_in' && (
                    <button
                      onClick={() => handleStateChange(nextPerformance.id, 'ready')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                    >
                      Call to Stage Wing (Mark Ready)
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No subsequent act scheduled in the lineup.
                </div>
              )}
            </div>

            {/* Quick Emergency Broadcast shortcuts */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Stage Cues
              </span>
              <button
                onClick={() => {
                  db.broadcastAnnouncement(
                    eventId,
                    '5-Minute Intermission',
                    'A short 5-minute break is in progress. Refreshments available in Zone C.',
                    'general',
                    user?.id || 'admin'
                  );
                  toast.success('Intermission broadcasted');
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors"
              >
                ☕ 5-Min Intermission
              </button>
              <button
                onClick={() => {
                  db.broadcastAnnouncement(
                    eventId,
                    'Mic Check in Progress',
                    'Audio engineers are calibrating stage monitors.',
                    'stage_call',
                    user?.id || 'admin'
                  );
                  toast.success('Mic check broadcasted');
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors"
              >
                🎤 Audio Calibration Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-highlight rounded-3xl max-w-md w-full p-6 border border-amber-500/40 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Stage Broadcast Cue</h3>
            <p className="text-xs text-slate-400 mb-4">
              Send an instant broadcast to all participant mobile screens and public stage displays.
            </p>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Next Act Call / Awards Ceremony"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                <textarea
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  rows={3}
                  placeholder="Announcement body text..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="stage_call">Stage Call (Performer Notice)</option>
                  <option value="general">General Society Announcement</option>
                  <option value="urgent">Urgent Announcement</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Broadcast Cue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
