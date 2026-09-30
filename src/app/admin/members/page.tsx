'use client';

import React, { useState, useEffect } from 'react';
import { Building2, UserPlus, Users, Plus, Shield, CheckCircle } from 'lucide-react';
import { Building, Unit, Membership, Profile, Role } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { toast } from 'sonner';

export default function MembersPage() {
  const { currentSociety } = useAuth();
  const { lastEvent } = useRealtime();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<(Unit & { building?: Building })[]>([]);
  const [memberships, setMemberships] = useState<(Membership & { profile?: Profile; unit?: Unit })[]>([]);

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newBuildingModalOpen, setNewBuildingModalOpen] = useState(false);

  // Invite form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('resident');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  // Building form state
  const [bldName, setBldName] = useState('');
  const [bldCode, setBldCode] = useState('');

  const loadData = () => {
    if (!currentSociety) return;
    setBuildings(db.getBuildings(currentSociety.id));
    setUnits(db.getUnits(currentSociety.id));
    setMemberships(db.getMemberships(currentSociety.id));
  };

  useEffect(() => {
    loadData();
  }, [currentSociety, lastEvent]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSociety) return;
    if (!fullName.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    db.addMember(currentSociety.id, {
      full_name: fullName,
      email,
      phone,
      role,
      unitId: selectedUnitId || undefined,
    });

    toast.success(`Member ${fullName} added with role ${role}!`);
    setInviteModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
    loadData();
  };

  const handleAddBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSociety) return;
    if (!bldName.trim() || !bldCode.trim()) return;

    db.addBuilding(currentSociety.id, bldName, bldCode.toUpperCase());
    toast.success(`Building ${bldName} added!`);
    setNewBuildingModalOpen(false);
    setBldName('');
    setBldCode('');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            Tenant Directory
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Society Members & Buildings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage residential towers, flats, and authorized user memberships.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewBuildingModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Add Building / Tower</span>
          </button>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-102"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* TOWERS & BUILDINGS PILLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {buildings.map((b) => {
          const bUnits = units.filter((u) => u.building_id === b.id);
          return (
            <div key={b.id} className="p-4 rounded-2xl glass-panel border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {b.code}
                </span>
                <span className="text-xs text-slate-400 font-mono">{bUnits.length} Flats</span>
              </div>
              <h3 className="font-bold text-white text-sm">{b.name}</h3>
            </div>
          );
        })}
      </div>

      {/* RESIDENTS & MEMBERSHIP ROSTER TABLE */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">
            Active Members ({memberships.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/40">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Flat / Tower</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {memberships.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-white block">{mem.profile?.full_name || 'Resident'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{mem.profile?.email}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">
                    {mem.unit?.unit_number || 'Office'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    {mem.profile?.phone || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-[10px] uppercase">
                      {mem.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVITE MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-highlight rounded-3xl max-w-md w-full p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Invite Resident / Assign Role</h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Flat / Unit</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">-- Assign Unit --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.building?.name ? `${u.building.name} - ` : ''}{u.unit_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="resident">Resident</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="stage_manager">Stage Manager</option>
                  <option value="event_manager">Event Manager</option>
                  <option value="judge">Judge</option>
                  <option value="society_admin">Society Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW BUILDING MODAL */}
      {newBuildingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-highlight rounded-3xl max-w-md w-full p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Add Building / Tower</h3>

            <form onSubmit={handleAddBuilding} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tower Name</label>
                <input
                  type="text"
                  value={bldName}
                  onChange={(e) => setBldName(e.target.value)}
                  placeholder="e.g. Tower D - Dahlia"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tower Code</label>
                <input
                  type="text"
                  value={bldCode}
                  onChange={(e) => setBldCode(e.target.value)}
                  placeholder="TD"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBuildingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Create Tower
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
