'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, CheckCircle2, Plus, Phone, MapPin } from 'lucide-react';
import { Volunteer, Performance } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { toast } from 'sonner';

interface VolunteerManagerProps {
  eventId: string;
}

export function VolunteerManager({ eventId }: VolunteerManagerProps) {
  const { user } = useAuth();
  const { lastEvent } = useRealtime();

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');

  const [newVolunteerModal, setNewVolunteerModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [responsibility, setResponsibility] = useState('Backstage & Green Room Coordination');
  const [area, setArea] = useState('Green Room Wing B');

  const profiles = db.getProfiles();

  const loadData = () => {
    setVolunteers(db.getVolunteers(eventId));
    setPerformances(db.getPerformances(eventId));
  };

  useEffect(() => {
    loadData();
  }, [eventId, lastEvent]);

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) {
      toast.error('Please select a resident to assign');
      return;
    }
    db.addVolunteer(eventId, selectedProfileId, responsibility, area);
    toast.success('Volunteer duty assigned successfully');
    setNewVolunteerModal(false);
    loadData();
  };

  const handleFastCheckin = (performanceId: string) => {
    try {
      db.recordCheckin(performanceId, user?.id || 'volunteer', 'present', 'Volunteer verified backstage');
      toast.success('Performer marked present and checked in!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleMarkReady = (performanceId: string) => {
    try {
      db.updatePerformanceLiveStatus(performanceId, 'ready', user?.id || 'volunteer', 'Group ready in wing');
      toast.success('Act marked READY in stage wings');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs uppercase tracking-wider">
            Event Operations Crew
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Volunteers & Backstage Duty Roster
          </h2>
        </div>

        <button
          onClick={() => setNewVolunteerModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Volunteer Duty</span>
        </button>
      </div>

      {/* Volunteer duty cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {volunteers.map((vol) => (
          <div key={vol.id} className="p-4 rounded-2xl glass-panel border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-800">
                {vol.responsibility.split('&')[0]}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400">● Active</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{vol.profile?.full_name || 'Volunteer'}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{vol.area}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Duties: Stage calls, costume verification & mic handover
            </div>
          </div>
        ))}
      </div>

      {/* VOLUNTEER RAPID QR GATE SCANNER */}
      <div className="glass-panel-highlight rounded-3xl p-6 border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Shield className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Digital QR Gate & Badge Scanner</h3>
              <p className="text-xs text-slate-400">Scan resident badge QR or enter performer Act #</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Scanner Live 🟢
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Scan QR or Enter Act # (e.g. 4 or 5)..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value.trim();
                const match = performances.find(
                  (p) => String(p.performance_number) === query || p.id === query || p.title.toLowerCase().includes(query.toLowerCase())
                );
                if (match) {
                  handleFastCheckin(match.id);
                  (e.target as HTMLInputElement).value = '';
                } else {
                  toast.error(`No act found matching "${query}"`);
                }
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="button"
            onClick={() => {
              const queued = performances.find((p) => p.status === 'queued');
              if (queued) {
                handleFastCheckin(queued.id);
              } else {
                toast.info('All acts are already checked in!');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Simulate QR Scan
          </button>
        </div>
      </div>

      {/* VOLUNTEER RAPID CHECK-IN & BACKSTAGE CALL ROSTER */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Backstage Check-in Desk</h3>
            <p className="text-xs text-slate-400">
              Verify arrival of resident troupes and advance them to ready status
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {performances.slice(0, 8).map((perf) => (
            <div
              key={perf.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  #{perf.performance_number}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{perf.title}</h4>
                    {(() => {
                      const reg = db.getRegistration(perf.registration_id);
                      if (reg?.wing || reg?.flat_number) {
                        return (
                          <span className="text-[10px] text-amber-300 font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                            {reg.wing ? `${reg.wing} • ` : ''}Flat {reg.flat_number}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <span className="text-[11px] text-slate-400">{perf.category?.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {perf.status === 'queued' ? (
                  <button
                    onClick={() => handleFastCheckin(perf.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Check In Group
                  </button>
                ) : perf.status === 'checked_in' ? (
                  <button
                    onClick={() => handleMarkReady(perf.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    Mark Group Ready in Wings
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{perf.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {newVolunteerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-highlight rounded-3xl max-w-md w-full p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Assign Volunteer Duty</h3>

            <form onSubmit={handleAddVolunteer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Resident</label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Responsibility</label>
                <select
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Backstage & Green Room Coordination">Backstage & Green Room Coordination</option>
                  <option value="Resident & Participant Check-in Gate">Resident & Participant Check-in Gate</option>
                  <option value="Sound & Audio Track Cueing">Sound & Audio Track Cueing</option>
                  <option value="Kids Care & Green Room Attendant">Kids Care & Green Room Attendant</option>
                  <option value="Stage Left Prop Master">Stage Left Prop Master</option>
                  <option value="Refreshments & Refreshment Booth">Refreshments & Refreshment Booth</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Station Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Green Room Wing B"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewVolunteerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Confirm Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
