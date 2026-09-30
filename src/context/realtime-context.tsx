'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/services/data-store';
import { useAuth } from './auth-context';
import { Announcement, Notification } from '@/types/database';
import { toast } from 'sonner';

interface RealtimeContextType {
  lastEvent: { type: string; payload: any; timestamp: number } | null;
  activeAnnouncements: Announcement[];
  unreadNotifsCount: number;
  triggerRefresh: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, currentSociety } = useAuth();
  const [lastEvent, setLastEvent] = useState<{ type: string; payload: any; timestamp: number } | null>(null);
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [tick, setTick] = useState(0);

  const refreshCounts = () => {
    if (user) {
      const notifs = db.getNotifications(user.id);
      const unread = notifs.filter((n) => !n.read_at).length;
      setUnreadNotifsCount(unread);
    }
  };

  useEffect(() => {
    refreshCounts();

    const unsub = db.subscribe((event, payload) => {
      setLastEvent({ type: event, payload, timestamp: Date.now() });

      if (event === 'ANNOUNCEMENT_BROADCAST') {
        toast(`📢 Announcement: ${payload.title}`, {
          description: payload.message,
          duration: 6000,
        });
      } else if (event === 'NOTIFICATION_CREATED') {
        if (payload.recipient_profile_id === user?.id) {
          toast(payload.title, {
            description: payload.body,
          });
        }
        refreshCounts();
      } else if (event === 'PERFORMANCE_STATUS_CHANGED') {
        // Broadcast subtle toast for stage managers / operators
        if (payload.status === 'on_stage') {
          toast.success(`Act #${payload.performance_number} is now ON STAGE!`, {
            description: payload.title,
          });
        }
      }

      setTick((t) => t + 1);
    });

    return () => unsub();
  }, [user, currentSociety]);

  return (
    <RealtimeContext.Provider
      value={{
        lastEvent,
        activeAnnouncements,
        unreadNotifsCount,
        triggerRefresh: () => setTick((t) => t + 1),
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
