'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Music, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { Registration, Performance, Event, MediaAsset } from '@/types/database';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { QRCodeBadge } from '@/components/common/QRCodeBadge';
import { formatTime, formatDate } from '@/lib/utils';

interface MyParticipationCardProps {
  registration: Registration;
  event?: Event;
  performance?: Performance;
  media?: MediaAsset[];
}

export function MyParticipationCard({ registration, event, performance, media }: MyParticipationCardProps) {
  const audioAsset = media?.find((m) => m.media_type === 'audio');

  return (
    <div className="glass-panel-highlight rounded-3xl p-6 border border-white/10 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              {registration.category?.name || 'Performance'}
            </span>
            {performance && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                Slot #{performance.performance_number}
              </span>
            )}
            {(registration.wing || registration.flat_number) && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-semibold flex items-center gap-1 border border-slate-700">
                <Building2 className="w-3 h-3 text-amber-400" />
                {registration.wing ? `${registration.wing} • ` : ''}Flat {registration.flat_number}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-white">{registration.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{event?.name || 'Cultural Night'}</p>
        </div>

        <div className="flex items-center gap-2">
          <QRCodeBadge registration={registration} performance={performance} event={event} />
          {performance ? (
            <StatusBadge type="performance" status={performance.status} size="md" />
          ) : (
            <StatusBadge type="registration" status={registration.status} size="md" />
          )}
        </div>
      </div>

      {/* Timing and Venue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div>
          <span className="text-slate-400 block font-medium">Event Date</span>
          <span className="text-white font-bold">{formatDate(event?.start_at)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Scheduled Stage Time</span>
          <span className="text-amber-400 font-bold font-mono">
            {performance?.scheduled_start_at ? formatTime(performance.scheduled_start_at) : 'Lineup Pending'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Venue</span>
          <span className="text-white font-bold truncate block">{event?.venue || 'Clubhouse Stage'}</span>
        </div>
      </div>

      {/* Participants */}
      {registration.members && registration.members.length > 0 && (
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Registered Performers ({registration.members.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {registration.members.map((m) => (
              <span
                key={m.id}
                className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200"
              >
                {m.display_name} <span className="text-slate-400 text-[10px]">({m.role_in_performance})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audio Player if present */}
      {audioAsset && (
        <div className="pt-2">
          <AudioPlayer
            src={audioAsset.public_url || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=bollywood-groove-112194.mp3'}
            title={`Uploaded Music: ${audioAsset.file_name}`}
          />
        </div>
      )}

      {/* Stage Check-in Alert */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-300 font-bold">Event Day Backstage Requirement</strong>
          Please report to Green Room Wing B at least 20 minutes before your scheduled slot for mic assignment and volunteer check-in.
        </div>
      </div>
    </div>
  );
}
