'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Lock, ArrowLeft, Key } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isAdmin, switchRole } = useAuth();

  // ACCESS RESTRICTION: Only persons with administrator clearance can use the Admin Console
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl glass-panel-highlight border border-red-500/30 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Restricted Access (403 Forbidden)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Administrator Clearance Required
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The SocietyStage Admin Console is strictly restricted to authorized Society Administrators and Event Committee heads only.
          </p>
        </div>

        {/* Current Identity Panel */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 max-w-md mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Current Authenticated Session
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">{user?.full_name || 'Anonymous User'}</span>
            <span className="text-slate-400 font-mono text-[11px]">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Assigned Role:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-bold text-[11px] capitalize">
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Quick Resolution Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => switchRole('society_admin')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all hover:scale-102"
          >
            <Key className="w-4 h-4" />
            <span>Switch to Society Admin (Demo Auth)</span>
          </button>

          <Link
            href="/resident"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Resident Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
