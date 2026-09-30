'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Users2,
  FileText,
  Radio,
  Tv,
} from 'lucide-react';
import { Event, EventCategory } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatTime } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  useEffect(() => {
    const ev = db.getEvent(resolvedParams.id);
    setEvent(ev);
    if (ev) {
      setCategories(db.getCategories(ev.society_id));
    }
  }, [resolvedParams.id]);

  if (!event) {
    return <div className="p-8 text-center text-slate-400">Event not found.</div>;
  }

  const isLive = event.status === 'live';
  const isRegOpen = event.status === 'registration_open';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Cover Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-highlight border border-white/10 shadow-2xl">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={event.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&fit=crop&q=80'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="absolute top-4 left-4">
            <StatusBadge type="event" status={event.status} size="md" />
          </div>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              {event.event_type}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {event.name}
            </h1>
          </div>
        </div>

        {/* Action bar under cover */}
        <div className="p-6 bg-slate-950/90 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{formatDate(event.start_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTime(event.start_at)} - {formatTime(event.end_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{event.venue}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLive ? (
              <Link
                href={`/events/${event.id}/live`}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all animate-pulse"
              >
                <Radio className="w-4 h-4" />
                <span>Open Live Stage</span>
              </Link>
            ) : isRegOpen ? (
              <Link
                href={`/resident/events/${event.id}/register`}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Register to Participate</span>
              </Link>
            ) : (
              <Link
                href="/resident/my-participation"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                View Participation
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Description & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-base font-bold text-white">About the Celebration</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Categories */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Performance Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="font-bold text-xs text-white block">{c.name}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{c.description || 'Cultural showcase'}</p>
                  <div className="flex items-center gap-2 text-[10px] text-amber-400 pt-1 font-mono">
                    <span>{Math.round(c.default_duration_seconds / 60)} mins</span>
                    <span>•</span>
                    <span>Max {c.max_participants} performers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Guidelines & Deadlines */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">Key Deadlines</h4>
            <div className="space-y-2 text-slate-300">
              <div>
                <span className="text-slate-400 block font-medium">Registration Closes:</span>
                <span className="text-amber-400 font-bold">{formatDate(event.registration_close_at)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Rehearsal Call:</span>
                <span className="text-slate-200 font-bold">1 Day Before Event</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-2 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-white text-sm">Stage Guidelines</h4>
            <p>1. Keep costume props safe and eco-friendly.</p>
            <p>2. Upload performance music soundtrack in MP3 format.</p>
            <p>3. Report to backstage 20 minutes prior to call time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
