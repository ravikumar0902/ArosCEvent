'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Building2,
  Bell,
  User,
  Radio,
  Tv,
  RotateCcw,
  CheckCircle,
  Menu,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { Role } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { toast } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, currentSociety, role, isAdmin, switchRole, switchSociety, societies } = useAuth();
  const { unreadNotifsCount } = useRealtime();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSocietyMenu, setShowSocietyMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // If in Display Mode, hide application shell so full screen TV/projector view has zero clutter
  const isDisplayMode = pathname?.includes('/display');
  if (isDisplayMode) {
    return <main className="min-h-screen bg-slate-950 text-white">{children}</main>;
  }

  const roleLabels: Record<Role, { name: string; color: string; desc: string }> = {
    society_admin: { name: 'Society Admin', color: 'bg-amber-500 text-slate-950', desc: 'Full event, member & lineup control' },
    platform_super_admin: { name: 'Super Admin', color: 'bg-red-500 text-white', desc: 'Platform-wide configuration' },
    event_manager: { name: 'Event Manager', color: 'bg-emerald-500 text-slate-950', desc: 'Event planning & approvals' },
    stage_manager: { name: 'Stage Manager', color: 'bg-purple-500 text-white', desc: 'Live event command center' },
    volunteer: { name: 'Volunteer', color: 'bg-blue-500 text-white', desc: 'Gate check-in & backstage assistance' },
    judge: { name: 'Judge', color: 'bg-pink-500 text-white', desc: 'Scorecards & performance judging' },
    resident: { name: 'Resident', color: 'bg-teal-500 text-slate-950', desc: 'Participant registration & viewing' },
  };

  const handleResetData = () => {
    if (confirm('Reset demo data back to initial Green Valley Residency state?')) {
      db.resetToDefault();
      toast.success('Demo data restored to initial state');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d14] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. TOP DEMO BANNER & TEST SWITCHER */}
      <div className="bg-gradient-to-r from-amber-950/80 via-purple-950/70 to-slate-900 border-b border-amber-500/20 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-amber-300">SocietyStage Interactive Demo</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Switch roles instantly to test any viewpoint:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['society_admin', 'stage_manager', 'volunteer', 'judge', 'resident'] as Role[]).map((r) => {
            const isCurrent = role === r;
            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-all text-[11px] whitespace-nowrap ${
                  isCurrent
                    ? `${roleLabels[r].color} font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-105`
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {roleLabels[r].name}
              </button>
            );
          })}

          <button
            onClick={handleResetData}
            title="Reset demo data"
            className="p-1 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 ml-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Society Selector */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl stage-gradient flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight stage-text-gradient block leading-none">
                  SocietyStage
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 font-semibold block mt-0.5">
                  Cultural Ops Platform
                </span>
              </div>
            </Link>

            {/* Society Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowSocietyMenu(!showSocietyMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[140px]">{currentSociety?.name || 'Select Society'}</span>
              </button>

              {showSocietyMenu && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl glass-panel-highlight p-2 shadow-2xl z-50 border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Tenant Societies
                  </div>
                  {societies.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        switchSociety(s.id);
                        setShowSocietyMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        s.id === currentSociety?.id ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      {s.id === currentSociety?.id && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts: Live Center, Display Mode, Admin Console, Resident Portal */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Command Center button */}
            <Link
              href="/events/f8c2e5d3-9520-5b0d-0ec9-234567890bcd/live"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-700/60 text-red-200 text-xs font-bold transition-all shadow-[0_0_12px_rgba(239,68,68,0.25)] hover:scale-102"
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="hidden sm:inline">Live Stage</span>
            </Link>

            {/* Display Mode (Projector/TV) */}
            <Link
              href="/events/f8c2e5d3-9520-5b0d-0ec9-234567890bcd/display"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all hover:text-white"
              title="Open Stage Display Mode for TV/Projector"
            >
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">TV Display</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>

            {/* Navigation links based on role */}
            <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            <Link
              href="/admin"
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                pathname?.startsWith('/admin')
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Admin Console</span>
              {!isAdmin && (
                <span className="p-0.5 rounded bg-slate-800/80 text-amber-400 border border-amber-500/30 text-[10px]" title="Restricted Access">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}
            </Link>

            <Link
              href="/resident"
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                pathname?.startsWith('/resident')
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Resident Portal
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <Link
                href="/resident/notifications"
                className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors block"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse" />
                )}
              </Link>
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80'}
                alt={user?.full_name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
              />
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-slate-200 block leading-tight">{user?.full_name}</span>
                <span className="text-[10px] text-amber-400 font-medium capitalize block">{roleLabels[role]?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <p>SocietyStage • Multi-Tenant Cultural Event & Live Stage Operations</p>
      </footer>
    </div>
  );
}
