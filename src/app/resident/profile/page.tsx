'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Building2, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, currentSociety, currentMembership, role, logout } = useAuth();

  const [name, setName] = useState(user?.full_name || 'Aarav Patel');
  const [phone, setPhone] = useState(user?.phone || '+91 98111 22334');
  const [email] = useState(user?.email || 'resident@greenvalley.demo');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="p-6 rounded-3xl glass-panel-highlight border border-white/10 flex items-center gap-4">
        <img
          src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&fit=crop&q=80'}
          alt="Avatar"
          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40"
        />
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            {role.replace('_', ' ')}
          </span>
          <h2 className="text-xl font-black text-white mt-1">{user?.full_name}</h2>
          <p className="text-xs text-slate-400">{currentSociety?.name} • Flat A-102</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Resident Profile Details
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch / Sign Out</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-102"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
