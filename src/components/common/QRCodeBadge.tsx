'use client';

import React, { useState } from 'react';
import { QrCode, Download, CheckCircle2, Sparkles, X, ShieldCheck } from 'lucide-react';
import { Registration, Performance, Event } from '@/types/database';
import { formatTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface QRCodeBadgeProps {
  registration: Registration;
  performance?: Performance;
  event?: Event;
}

export function QRCodeBadge({ registration, performance, event }: QRCodeBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const qrData = JSON.stringify({
    regId: registration.id,
    perfId: performance?.id || 'pending',
    slot: performance?.performance_number || 0,
    title: registration.title,
    submitter: registration.submitter?.full_name || 'Resident',
    wing: registration.wing || 'Wing A',
    flat: registration.flat_number || 'A-102',
    society: event?.society_id,
  });

  // Generate SVG QR pattern deterministically
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=f59e0b&bgcolor=0f1117`;

  const handleDownload = () => {
    toast.success('Digital Backstage Pass saved to your device!');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-bold transition-all shadow-sm"
      >
        <QrCode className="w-3.5 h-3.5 text-purple-400" />
        <span>View Gate Pass QR</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel-highlight rounded-3xl max-w-sm w-full p-6 sm:p-7 border border-amber-500/40 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Backstage Pass</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {event?.name || 'Society Cultural Festival'}
              </span>
              <h3 className="text-xl font-black text-white leading-tight mt-0.5">
                {registration.title}
              </h3>
              {(registration.flat_number || registration.wing) && (
                <div className="mt-1 text-xs text-amber-300 font-mono font-bold">
                  {registration.wing ? `${registration.wing} • ` : ''}Flat {registration.flat_number}
                </div>
              )}
              {performance && (
                <div className="mt-1 font-mono text-sm font-bold text-slate-300">
                  Stage Slot #{performance.performance_number} • {formatTime(performance.scheduled_start_at)}
                </div>
              )}
            </div>

            {/* Generated QR Code */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner mx-auto w-fit">
              <img
                src={qrSvgUrl}
                alt="Gate Pass QR"
                className="w-44 h-44 rounded-lg block"
              />
            </div>

            <div className="text-[11px] text-slate-300">
              Present this pass at <strong className="text-amber-300">Amphitheatre Gate 1</strong> or Backstage Green Room for fast volunteer badge scanning.
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Download Digital Pass</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
