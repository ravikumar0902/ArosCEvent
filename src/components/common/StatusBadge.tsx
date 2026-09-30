'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { RegistrationStatus, PerformanceStatus, EventStatus } from '@/types/database';

type BadgeType = 'registration' | 'performance' | 'event';

interface StatusBadgeProps {
  type: BadgeType;
  status: RegistrationStatus | PerformanceStatus | EventStatus | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ type, status, className, size = 'md' }: StatusBadgeProps) {
  let label = status.replace(/_/g, ' ');
  let colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'registration') {
    switch (status as RegistrationStatus) {
      case 'draft':
        colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';
        break;
      case 'submitted':
        colorStyles = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
        break;
      case 'under_review':
        colorStyles = 'bg-amber-950/80 text-amber-300 border-amber-800/60';
        break;
      case 'changes_requested':
        colorStyles = 'bg-orange-950/80 text-orange-300 border-orange-800/60';
        label = 'Changes Required';
        break;
      case 'approved':
        colorStyles = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
        break;
      case 'rejected':
        colorStyles = 'bg-red-950/80 text-red-300 border-red-800/60';
        break;
      case 'waitlisted':
        colorStyles = 'bg-purple-950/80 text-purple-300 border-purple-800/60';
        break;
      case 'cancelled':
        colorStyles = 'bg-zinc-900 text-zinc-400 border-zinc-700';
        break;
    }
  } else if (type === 'performance') {
    switch (status as PerformanceStatus) {
      case 'queued':
        colorStyles = 'bg-slate-900/90 text-slate-300 border-slate-700';
        break;
      case 'checked_in':
        colorStyles = 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60';
        break;
      case 'ready':
        colorStyles = 'bg-amber-950/90 text-amber-300 border-amber-600/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
        break;
      case 'on_stage':
        colorStyles = 'bg-red-950/90 text-red-200 border-red-600 shadow-[0_0_16px_rgba(239,68,68,0.4)] animate-pulse';
        break;
      case 'completed':
        colorStyles = 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60';
        break;
      case 'delayed':
        colorStyles = 'bg-yellow-950/90 text-yellow-300 border-yellow-700/60';
        break;
      case 'no_show':
        colorStyles = 'bg-rose-950/90 text-rose-300 border-rose-800/60';
        break;
      case 'cancelled':
        colorStyles = 'bg-zinc-900 text-zinc-400 border-zinc-700';
        break;
    }
  } else if (type === 'event') {
    switch (status as EventStatus) {
      case 'draft':
        colorStyles = 'bg-slate-900 text-slate-400 border-slate-700';
        break;
      case 'published':
        colorStyles = 'bg-blue-950/80 text-blue-300 border-blue-700/60';
        break;
      case 'registration_open':
        colorStyles = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
        break;
      case 'registration_closed':
        colorStyles = 'bg-slate-900 text-slate-300 border-slate-700';
        break;
      case 'live':
        colorStyles = 'bg-red-950/90 text-red-200 border-red-600 shadow-[0_0_16px_rgba(239,68,68,0.4)] animate-pulse';
        break;
      case 'completed':
        colorStyles = 'bg-teal-950/80 text-teal-300 border-teal-700/60';
        break;
      case 'archived':
        colorStyles = 'bg-zinc-900 text-zinc-400 border-zinc-800';
        break;
      case 'cancelled':
        colorStyles = 'bg-red-950/80 text-red-400 border-red-800';
        break;
    }
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide uppercase',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide capitalize',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wide capitalize',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border shadow-sm transition-all',
        sizeClasses,
        colorStyles,
        className
      )}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
