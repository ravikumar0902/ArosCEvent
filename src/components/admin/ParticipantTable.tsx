'use client';

import React, { useState, useEffect } from 'react';
import {
  Users2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  FileAudio,
  Image as ImageIcon,
  ChevronRight,
  ListOrdered,
  X,
  MessageSquare,
} from 'lucide-react';
import { Registration, EventCategory, Event } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterBar } from '@/components/common/FilterBar';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { formatTime, formatDate, formatSecondsToMinutes } from '@/lib/utils';
import { toast } from 'sonner';

interface ParticipantTableProps {
  eventId: string;
  initialSelectedId?: string;
}

export function ParticipantTable({ eventId, initialSelectedId }: ParticipantTableProps) {
  const { user } = useAuth();
  const { lastEvent } = useRealtime();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [event, setEvent] = useState<Event | undefined>(undefined);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Review Modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = () => {
    const ev = db.getEvent(eventId);
    setEvent(ev);
    const regs = db.getRegistrations(eventId);
    setRegistrations(regs);
    if (ev) {
      setCategories(db.getCategories(ev.society_id));
    }
    if (initialSelectedId) {
      const match = regs.find((r) => r.id === initialSelectedId);
      if (match) setSelectedReg(match);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId, lastEvent]);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchSearch =
      reg.title.toLowerCase().includes(search.toLowerCase()) ||
      (reg.submitter?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (reg.category?.name || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || reg.category_id === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  const handleUpdateStatus = (status: 'approved' | 'changes_requested' | 'rejected') => {
    if (!selectedReg) return;
    setIsProcessing(true);
    try {
      db.updateRegistrationStatus(
        selectedReg.id,
        status,
        adminNotes,
        user?.id || 'admin'
      );
      toast.success(`Submission marked as ${status.replace('_', ' ').toUpperCase()}`);
      setSelectedReg(null);
      setAdminNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToLineup = () => {
    if (!selectedReg) return;
    setIsProcessing(true);
    try {
      db.addApprovedToLineup(selectedReg.id, user?.id || 'admin');
      toast.success('Performance added to official stage lineup!');
      setSelectedReg(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Counters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Participant Submissions & Auditions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review registered cultural acts, audio tracks, performer rosters, and grant approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            Total: {registrations.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-xs font-semibold text-emerald-300">
            Approved: {registrations.filter((r) => r.status === 'approved').length}
          </span>
        </div>
      </div>

      {/* FILTER BAR & SEARCH INPUT */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by act title, resident, or category..."
            className="w-full sm:max-w-md"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <FilterBar
          options={[
            { label: 'All Statuses', value: 'all', count: registrations.length },
            { label: 'Submitted', value: 'submitted', count: registrations.filter((r) => r.status === 'submitted').length },
            { label: 'Approved', value: 'approved', count: registrations.filter((r) => r.status === 'approved').length },
            { label: 'Changes Req.', value: 'changes_requested', count: registrations.filter((r) => r.status === 'changes_requested').length },
            { label: 'Rejected', value: 'rejected', count: registrations.filter((r) => r.status === 'rejected').length },
          ]}
          selectedValue={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      {/* PARTICIPANTS DATA TABLE */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/40">
                <th className="py-3.5 px-4">Performance</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Resident / Household</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Media Asset</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRegistrations.map((reg) => {
                const hasAudio = reg.media?.some((m) => m.media_type === 'audio');
                const hasPhoto = reg.media?.some((m) => m.media_type === 'image');

                return (
                  <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white text-sm block">{reg.title}</span>
                      <span className="text-[11px] text-slate-400">
                        {reg.members?.length || 1} participant(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {reg.category?.name || 'Category'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">
                        {reg.submitter?.full_name || 'Resident Performer'}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {(reg.wing || reg.flat_number) && (
                          <span className="text-[10px] text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                            {reg.wing ? `${reg.wing} • ` : ''}Flat {reg.flat_number}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {reg.submitter?.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatSecondsToMinutes(reg.duration_seconds)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {hasAudio ? (
                          <span className="p-1 rounded-md bg-purple-500/20 text-purple-300" title="Audio Track Attached">
                            <FileAudio className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Live mic</span>
                        )}
                        {hasPhoto && (
                          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300" title="Photo Attached">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="registration" status={reg.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReg(reg);
                          setAdminNotes(reg.admin_notes || '');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition-colors"
                      >
                        Review Act
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-COLUMN REVIEW DETAIL MODAL (SECTION 11) */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass-panel-highlight rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-white/10 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedReg(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                Audition & Submission Review
              </span>
              <StatusBadge type="registration" status={selectedReg.status} size="sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT COLUMN: PARTICIPANT & ROSTER DETAILS */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category: {selectedReg.category?.name}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">{selectedReg.title}</h3>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submitter:</span>
                    <span className="text-white font-bold">{selectedReg.submitter?.full_name}</span>
                  </div>
                  {(selectedReg.wing || selectedReg.flat_number) && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Residence:</span>
                      <span className="text-amber-300 font-mono font-bold">
                        {selectedReg.wing ? `${selectedReg.wing} • ` : ''}Flat {selectedReg.flat_number}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Duration:</span>
                    <span className="text-white font-mono">{formatSecondsToMinutes(selectedReg.duration_seconds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submitted:</span>
                    <span className="text-slate-300">{formatDate(selectedReg.submitted_at)}</span>
                  </div>
                </div>

                {/* Performer Roster */}
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2">
                    Performer Roster ({selectedReg.members?.length || 1})
                  </span>
                  <div className="space-y-2">
                    {selectedReg.members?.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block">{m.display_name}</span>
                          <span className="text-[11px] text-slate-400">{m.role_in_performance}</span>
                        </div>
                        {m.age && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {m.age} yrs {m.age < 18 ? '• Minor (Consent ✓)' : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment notes */}
                {selectedReg.special_requirements && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <span className="font-bold text-amber-300 block mb-0.5">Special Stage / AV Request:</span>
                    {selectedReg.special_requirements}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: PHOTO & AUDIO AUDITION PLAYER */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-300 block">
                  Media Tracks & Attachments
                </span>

                {/* Embedded Audio Audition Player */}
                <AudioPlayer
                  src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=bollywood-groove-112194.mp3"
                  title={`Track Audition: ${selectedReg.title}`}
                />

                {/* Costume Photo */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-48 bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80"
                    alt="Costume reference"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Reviewer Notes Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Committee Reviewer Feedback / Notes:
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Approved. Assigned to sequence slot #04 in Bollywood block."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    ✓ Approve Act
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('changes_requested')}
                    disabled={isProcessing}
                    className="py-2.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
                  >
                    Request Changes
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={isProcessing}
                    className="py-2.5 px-3.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition-colors"
                  >
                    Reject
                  </button>

                  {selectedReg.status === 'approved' && !selectedReg.performance && (
                    <button
                      onClick={handleAddToLineup}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all mt-1"
                    >
                      + Add to Official Lineup Schedule
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
