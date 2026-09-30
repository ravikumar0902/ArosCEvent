'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Sparkles, CheckCircle2 } from 'lucide-react';
import { Notification } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { formatDate, formatTime } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { lastEvent } = useRealtime();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) return;
    setNotifications(db.getNotifications(user.id));
  }, [user, lastEvent]);

  const handleMarkAsRead = (id: string) => {
    db.markNotificationAsRead(id);
    if (user) {
      setNotifications(db.getNotifications(user.id));
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            Activity Stream
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Notifications & Stage Cues
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filter === 'unread' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Unread ({notifications.filter((n) => !n.read_at).length})
          </button>
        </div>
      </div>

      {filteredNotifs.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl glass-panel border transition-all flex items-start justify-between gap-4 ${
                !n.read_at ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${!n.read_at ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.body}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {formatDate(n.created_at)} at {formatTime(n.created_at)}
                  </span>
                </div>
              </div>

              {!n.read_at && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You're all caught up"
          description="No unread notifications at this time."
        />
      )}
    </div>
  );
}
