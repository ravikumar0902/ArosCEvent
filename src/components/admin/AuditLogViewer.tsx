'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, User, Eye, Search } from 'lucide-react';
import { AuditLog } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { formatDate, formatTime } from '@/lib/utils';

export function AuditLogViewer() {
  const { currentSociety } = useAuth();
  const { lastEvent } = useRealtime();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    if (!currentSociety) return;
    setLogs(db.getAuditLogs(currentSociety.id));
  }, [currentSociety, lastEvent]);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.actor?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold text-xs uppercase tracking-wider">
            Security & Governance
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            System Audit Trail & Access Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all administrative changes, approvals, scoring entries and stage operations.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Recorded Actions: <strong className="text-white">{logs.length}</strong>
        </div>
      </div>

      {/* Filter / Search input */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by action, entity, or actor..."
          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2 text-xs text-white outline-none"
        />
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/40">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {formatDate(log.created_at)} {formatTime(log.created_at)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {log.actor?.full_name || 'System / Admin'}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300 capitalize">
                    {log.entity_type}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px]"
                    >
                      View Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIFF MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-highlight rounded-3xl max-w-xl w-full p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Audit Entry Diff Details</h3>
            <div className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-amber-400">
              Action: {selectedLog.action} • Entity: {selectedLog.entity_type} ({selectedLog.entity_id})
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold mb-1">State Before:</span>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 overflow-x-auto text-[10px] max-h-48">
                  {JSON.stringify(selectedLog.before_json || 'None', null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-emerald-400 block font-semibold mb-1">State After:</span>
                <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 overflow-x-auto text-[10px] max-h-48">
                  {JSON.stringify(selectedLog.after_json || 'None', null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
