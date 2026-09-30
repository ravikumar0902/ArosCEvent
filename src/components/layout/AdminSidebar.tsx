'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users2,
  ListOrdered,
  Radio,
  UserCheck,
  Award,
  BarChart3,
  Building,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Participants', href: '/admin/participants', icon: Users2 },
    { name: 'Lineup Builder', href: '/admin/lineup', icon: ListOrdered },
    { name: 'Live Stage Console', href: `/events/${DEMO_EVENT_ID}/live`, icon: Radio, highlight: true },
    { name: 'Volunteers', href: '/admin/volunteers', icon: UserCheck },
    { name: 'Judges & Scoring', href: '/admin/judges', icon: Award },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { name: 'Society Members', href: '/admin/members', icon: Building },
    { name: 'Audit Logs', href: '/admin/audit', icon: ShieldAlert },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 glass-panel rounded-2xl p-3 border border-white/5 h-fit mb-6 lg:mb-0">
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Admin Console
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                link.highlight
                  ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40'
                  : isActive
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${link.highlight ? 'text-red-400' : isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
