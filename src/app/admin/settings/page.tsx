'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  HardDrive,
  Shield,
  CheckCircle2,
  Phone,
  Clock,
  Radio,
  Sparkles,
  QrCode,
  Bell,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { currentSociety, updateSociety } = useAuth();

  // General Profile State
  const [societyName, setSocietyName] = useState(currentSociety?.name || 'Green Valley Residency');
  const [address, setAddress] = useState(currentSociety?.address || 'Plot 42, Harmony Boulevard, Phase 2');
  const [city, setCity] = useState(currentSociety?.city || 'Bengaluru');
  const [state, setState] = useState(currentSociety?.state || 'Karnataka');
  const [pincode, setPincode] = useState(currentSociety?.pincode || '560100');
  const [timezone, setTimezone] = useState(currentSociety?.timezone || 'Asia/Kolkata');
  const [contactPhone, setContactPhone] = useState(currentSociety?.contact_phone || '+91 80 4567 8900');

  // Configurable Storage Limits (MB)
  const [imageLimit, setImageLimit] = useState(10);
  const [audioLimit, setAudioLimit] = useState(50);
  const [videoLimit, setVideoLimit] = useState(250);
  const [docLimit, setDocLimit] = useState(20);

  // Stage Operations Policy
  const [transitionBuffer, setTransitionBuffer] = useState(60);
  const [proximityThreshold, setProximityThreshold] = useState(2);
  const [enableBadgePass, setEnableBadgePass] = useState(true);
  const [autoDelayCalc, setAutoDelayCalc] = useState(true);

  // Synchronize when currentSociety changes
  useEffect(() => {
    if (currentSociety) {
      setSocietyName(currentSociety.name || '');
      setAddress(currentSociety.address || '');
      setCity(currentSociety.city || '');
      setState(currentSociety.state || '');
      setPincode(currentSociety.pincode || '');
      setTimezone(currentSociety.timezone || 'Asia/Kolkata');
      setContactPhone(currentSociety.contact_phone || '');

      const limits = currentSociety.settings_json?.media_limits_mb;
      if (limits) {
        if (limits.image !== undefined) setImageLimit(limits.image);
        if (limits.audio !== undefined) setAudioLimit(limits.audio);
        if (limits.video !== undefined) setVideoLimit(limits.video);
        if (limits.document !== undefined) setDocLimit(limits.document);
      }

      const stageOps = currentSociety.settings_json?.stage_operations;
      if (stageOps) {
        if (stageOps.default_transition_buffer_seconds !== undefined) {
          setTransitionBuffer(stageOps.default_transition_buffer_seconds);
        }
        if (stageOps.proximity_call_threshold !== undefined) {
          setProximityThreshold(stageOps.proximity_call_threshold);
        }
        if (stageOps.allow_performer_badge_download !== undefined) {
          setEnableBadgePass(stageOps.allow_performer_badge_download);
        }
        if (stageOps.auto_delay_recalculation !== undefined) {
          setAutoDelayCalc(stageOps.auto_delay_recalculation);
        }
      }
    }
  }, [currentSociety]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!societyName.trim()) {
      toast.error('Society name cannot be empty');
      return;
    }

    try {
      updateSociety({
        name: societyName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        timezone: timezone.trim(),
        contact_phone: contactPhone.trim(),
        settings_json: {
          ...currentSociety?.settings_json,
          media_limits_mb: {
            image: Number(imageLimit),
            audio: Number(audioLimit),
            video: Number(videoLimit),
            document: Number(docLimit),
          },
          stage_operations: {
            default_transition_buffer_seconds: Number(transitionBuffer),
            proximity_call_threshold: Number(proximityThreshold),
            allow_performer_badge_download: Boolean(enableBadgePass),
            auto_delay_recalculation: Boolean(autoDelayCalc),
          },
        },
      });

      toast.success('Society settings & operational policies saved and applied site-wide! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update society settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="p-5 rounded-3xl glass-panel-highlight border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            Tenant Configuration
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Society Profile & Operational Policies
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure society identification, storage limits, and live stage management rules.
          </p>
        </div>

        {/* Live Active Society Badge */}
        <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center gap-2.5">
          <Building className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Tenant</span>
            <span className="text-xs font-bold text-white block">{currentSociety?.name}</span>
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 bg-amber-950/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Eye className="w-4 h-4" />
          <span>Live Site Impact Preview</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Updates made here immediately propagate to the <strong className="text-white">top navigation bar</strong>,{' '}
          <strong className="text-white">resident portal</strong>,{' '}
          <strong className="text-white">performer registration limits</strong>, and{' '}
          <strong className="text-white">live stage countdown schedules</strong>.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Society General Profile */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Society General Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Society Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                placeholder="e.g. Green Valley Residency"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. Asia/Kolkata"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 42, Harmony Boulevard, Phase 2"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Postal / Pin Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 560100"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Helpdesk / Admin Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +91 80 4567 8900"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Live Stage Operations Policies */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Live Stage Operations & Timing Policies</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Transition Buffer (Seconds)
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Stage reset & mic handover time scheduled between consecutive performances.
              </p>
              <input
                type="number"
                min={0}
                max={300}
                value={transitionBuffer}
                onChange={(e) => setTransitionBuffer(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Proximity Stage Call Alert (Acts Ahead)
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Dispatches an automated high-priority alert to performer when they are N acts away from stage.
              </p>
              <input
                type="number"
                min={1}
                max={10}
                value={proximityThreshold}
                onChange={(e) => setProximityThreshold(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Digital QR Backstage Badges</span>
                <span className="text-[11px] text-slate-400">Allow performers to download entry pass QR codes</span>
              </div>
              <input
                type="checkbox"
                checked={enableBadgePass}
                onChange={(e) => setEnableBadgePass(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Auto Live Delay Recalculation</span>
                <span className="text-[11px] text-slate-400">Dynamically cascade running overtime onto remaining slots</span>
              </div>
              <input
                type="checkbox"
                checked={autoDelayCalc}
                onChange={(e) => setAutoDelayCalc(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Private Storage Buckets Limit Configuration */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Media Storage Upload Limits (MB)</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Photo (MB)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={imageLimit}
                onChange={(e) => setImageLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none text-center font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Audio MP3 (MB)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={audioLimit}
                onChange={(e) => setAudioLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none text-center font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Video (MB)</label>
              <input
                type="number"
                min={5}
                max={500}
                value={videoLimit}
                onChange={(e) => setVideoLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none text-center font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Document (MB)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={docLimit}
                onChange={(e) => setDocLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none text-center font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-102 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Apply Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
