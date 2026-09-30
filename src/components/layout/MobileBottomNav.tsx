'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Trophy, Bell, User } from 'lucide-react';
import { useRealtime } from '@/context/realtime-context';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { unreadNotifsCount } = useRealtime();

  const tabs = [
    { name: 'Home', href: '/resident', icon: Home },
    { name: 'Events', href: '/resident/events', icon: Calendar },
    { name: 'My Act', href: '/resident/my-participation', icon: Trophy },
    { name: 'Alerts', href: '/resident/notifications', icon: Bell, badge: unreadNotifsCount },
    { name: 'Profile', href: '/resident/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
