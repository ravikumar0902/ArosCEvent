'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Music,
  Users,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  Home,
} from 'lucide-react';
import { Event, EventCategory, Profile } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { MediaUploader, UploadedFileMeta } from '@/components/common/MediaUploader';
import { toast } from 'sonner';

interface RegistrationWizardProps {
  event: Event;
  categories: EventCategory[];
  onComplete?: () => void;
}

export function RegistrationWizard({ event, categories, onComplete }: RegistrationWizardProps) {
  const router = useRouter();
  const { user, currentMembership, currentSociety } = useAuth();

  const buildings = db.getBuildings(event.society_id);
  const units = db.getUnits(event.society_id);
  const userUnit = units.find((u) => u.id === currentMembership?.unit_id);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(300);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [wing, setWing] = useState(userUnit?.building?.name || 'Wing A');
  const [flatNumber, setFlatNumber] = useState(userUnit?.unit_number || 'A-102');

  // Participants
  const [members, setMembers] = useState<Array<{
    display_name: string;
    wing: string;
    flat_number: string;
    age: string;
    role_in_performance: string;
    guardian_consent: boolean;
  }>>([
    {
      display_name: user?.full_name || 'My Name',
      wing: userUnit?.building?.name || 'Wing A',
      flat_number: userUnit?.unit_number || 'A-102',
      age: '28',
      role_in_performance: 'Lead Performer',
      guardian_consent: false,
    },
  ]);

  // Dynamic Details / Form answers
  const [answers, setAnswers] = useState<Record<string, string>>({
    experience: 'Intermediate',
    lighting_preference: 'Warm ambient with follow spotlight',
  });

  // Media
  const [audioFile, setAudioFile] = useState<UploadedFileMeta | null>(null);
  const [photoFile, setPhotoFile] = useState<UploadedFileMeta | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const addMember = () => {
    setMembers([
      ...members,
      {
        display_name: '',
        wing: wing || 'Wing A',
        flat_number: flatNumber || 'A-102',
        age: '',
        role_in_performance: 'Dancer / Vocalist',
        guardian_consent: false,
      },
    ]);
  };

  const removeMember = (index: number) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, idx) => idx !== index));
  };

  const updateMember = (index: number, field: string, value: any) => {
    const updated = [...members];
    (updated[index] as any)[field] = value;
    setMembers(updated);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title.trim() || title.length < 3) {
        toast.error('Please enter a performance title (at least 3 characters)');
        return;
      }
      if (!categoryId) {
        toast.error('Please select an event category');
        return;
      }
      if (!wing.trim()) {
        toast.error('Please select or specify your Wing / Tower');
        return;
      }
      if (!flatNumber.trim()) {
        toast.error('Please enter your Flat / Unit number');
        return;
      }
    }

    if (currentStep === 2) {
      const hasEmpty = members.some((m) => !m.display_name.trim());
      if (hasEmpty) {
        toast.error('Please fill in participant names');
        return;
      }

      // Check minor consent
      const missingConsent = members.some((m) => {
        const ageNum = parseInt(m.age, 10);
        return ageNum < 18 && !m.guardian_consent;
      });
      if (missingConsent) {
        toast.error('Parental / Guardian consent is required for participants under 18');
        return;
      }
    }

    if (currentStep === 4) {
      if (selectedCategory?.requires_media && !audioFile) {
        toast.error('This category requires an audio track. Please upload one.');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to register');
      return;
    }

    setIsSubmitting(true);
    try {
      const mediaList: Array<{ name: string; type: 'image' | 'audio' | 'video' | 'document'; size: number; url?: string }> = [];
      if (audioFile) mediaList.push(audioFile);
      if (photoFile) mediaList.push(photoFile);

      db.submitRegistration({
        eventId: event.id,
        categoryId,
        submittedBy: user.id,
        title,
        wing: wing.trim(),
        flatNumber: flatNumber.trim(),
        durationSeconds: Number(durationSeconds),
        specialRequirements,
        members: members.map((m) => ({
          display_name: m.display_name,
          wing: m.wing || wing.trim(),
          flat_number: m.flat_number || flatNumber.trim(),
          age: m.age ? parseInt(m.age, 10) : null,
          role_in_performance: m.role_in_performance,
          guardian_consent: m.guardian_consent,
        })),
        mediaFiles: mediaList,
      });

      toast.success('Registration submitted successfully! 🎉');
      if (onComplete) {
        onComplete();
      } else {
        router.push('/resident/my-participation');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Performance', icon: Sparkles },
    { num: 2, title: 'Participants', icon: Users },
    { num: 3, title: 'Details', icon: FileText },
    { num: 4, title: 'Media Track', icon: UploadCloud },
    { num: 5, title: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="glass-panel-highlight rounded-3xl p-6 sm:p-8 border border-white/10 max-w-3xl mx-auto shadow-2xl">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative mb-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -z-0" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110'
                      : isDone
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-semibold mt-2 hidden sm:block ${isCurrent ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PERFORMANCE DETAILS */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Performance Overview</h2>
            <p className="text-xs text-slate-400">Tell us what cultural act you are presenting for {event.name}.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Select Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    setDurationSeconds(cat.default_duration_seconds);
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    categoryId === cat.id
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100">{cat.name}</span>
                    {cat.requires_media && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Music Req
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{cat.description || 'Cultural showcase'}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Performance Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Retro Bollywood Dhamaka / Classical Thumri"
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Duration (Minutes)
              </label>
              <select
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value={180}>3 minutes</option>
                <option value={240}>4 minutes</option>
                <option value={300}>5 minutes (Standard)</option>
                <option value={360}>6 minutes</option>
                <option value={480}>8 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Special Stage / AV Needs
              </label>
              <input
                type="text"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. 2 Cordless mics, center spotlight, smoke machine"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          {/* RESIDENCE LOCATION (WING & FLAT NUMBER) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Society Residence Address (Wing & Flat Number) <span className="text-red-400">*</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Required for backstage gate passes, proximity call notifications, and prize distribution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Wing / Tower / Block <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                  >
                    {buildings.length > 0 ? (
                      buildings.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Wing A">Wing A</option>
                        <option value="Wing B">Wing B</option>
                        <option value="Wing C">Wing C</option>
                        <option value="Wing D">Wing D</option>
                      </>
                    )}
                    <option value="Custom">Custom / Other Wing</option>
                  </select>
                  {wing === 'Custom' && (
                    <input
                      type="text"
                      placeholder="Wing name"
                      onChange={(e) => setWing(e.target.value)}
                      className="w-28 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Flat / Apartment Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="e.g. A-102, B-401, 302"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono font-bold placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PARTICIPANTS */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Participants Roster</h2>
              <p className="text-xs text-slate-400">Add individual performers or group members participating in this act.</p>
            </div>
            <button
              type="button"
              onClick={addMember}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="space-y-3">
            {members.map((member, idx) => {
              const isMinor = parseInt(member.age, 10) < 18;

              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      Member #{idx + 1}
                    </span>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(idx)}
                        className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={member.display_name}
                        onChange={(e) => updateMember(idx, 'display_name', e.target.value)}
                        placeholder="Resident or child name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age</label>
                      <input
                        type="number"
                        value={member.age}
                        onChange={(e) => updateMember(idx, 'age', e.target.value)}
                        placeholder="Age (e.g. 10 or 32)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Flat / Wing</label>
                      <input
                        type="text"
                        value={member.flat_number}
                        onChange={(e) => updateMember(idx, 'flat_number', e.target.value)}
                        placeholder="e.g. A-102"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Role in Act</label>
                      <input
                        type="text"
                        value={member.role_in_performance}
                        onChange={(e) => updateMember(idx, 'role_in_performance', e.target.value)}
                        placeholder="e.g. Lead, Chorus"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Minor Consent requirement */}
                  {isMinor && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id={`consent-${idx}`}
                        checked={member.guardian_consent}
                        onChange={(e) => updateMember(idx, 'guardian_consent', e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor={`consent-${idx}`} className="text-xs text-amber-200">
                        <strong className="block text-amber-300">Guardian / Parental Consent for Minor</strong>
                        I confirm that the parent/guardian authorizes this child’s participation and stage rehearsal schedule.
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS & LOGISTICS */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Stage Logistics & Details</h2>
            <p className="text-xs text-slate-400">Help the stage operations crew prepare sound cues and props.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Performer Experience Level
              </label>
              <select
                value={answers.experience}
                onChange={(e) => setAnswers({ ...answers, experience: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="Beginner">Beginner (First time on stage)</option>
                <option value="Intermediate">Intermediate (Participated before)</option>
                <option value="Advanced">Advanced / Trained Performer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Stage Lighting & Intro Announcement Cues
              </label>
              <textarea
                value={answers.lighting_preference}
                onChange={(e) => setAnswers({ ...answers, lighting_preference: e.target.value })}
                rows={3}
                placeholder="e.g. Please play audio immediately as performers enter from left wing."
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: MEDIA TRACK & PHOTO */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Audio & Media Track</h2>
            <p className="text-xs text-slate-400">
              Upload your performance soundtrack (MP3/WAV) and optional costume/group photo.
            </p>
          </div>

          <div className="space-y-4">
            <MediaUploader
              acceptType="audio"
              label="Performance Soundtrack (Audio MP3)"
              description={`Upload your high-fidelity MP3/WAV performance audio track (up to ${currentSociety?.settings_json?.media_limits_mb?.audio || 50}MB)`}
              maxSizeMb={currentSociety?.settings_json?.media_limits_mb?.audio || 50}
              currentFile={audioFile}
              onFileUpload={(file) => setAudioFile(file)}
              onFileRemove={() => setAudioFile(null)}
            />

            <MediaUploader
              acceptType="image"
              label="Group / Performer Costume Reference Photo"
              description={`Upload a photo for backstage volunteer identification (up to ${currentSociety?.settings_json?.media_limits_mb?.image || 10}MB)`}
              maxSizeMb={currentSociety?.settings_json?.media_limits_mb?.image || 10}
              currentFile={photoFile}
              onFileUpload={(file) => setPhotoFile(file)}
              onFileRemove={() => setPhotoFile(null)}
            />
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & SUBMISSION */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Review Registration</h2>
            <p className="text-xs text-slate-400">Review all details before submitting to the event committee.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Title</span>
                <p className="text-base font-bold text-white">{title}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-xs">
                {selectedCategory?.name}
              </span>
            </div>

            {/* Primary Residence Info */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    Residence / Household
                  </span>
                  <span className="text-white font-bold text-xs">{wing} • Flat {flatNumber}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                Verified Resident
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Duration</span>
                <span className="text-slate-200 font-bold">{Math.round(durationSeconds / 60)} minutes</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Participants</span>
                <span className="text-slate-200 font-bold">{members.length} performer(s)</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-xs font-medium mb-1">Roster</span>
              <div className="space-y-1">
                {members.map((m, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center justify-between py-1 border-t border-slate-800/60">
                    <span>{m.display_name} {m.age ? `(${m.age} yrs)` : ''}</span>
                    <span className="text-slate-400">{m.role_in_performance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-xs font-medium mb-1">Soundtrack</span>
              <p className="text-xs font-mono text-emerald-400">
                {audioFile ? `✓ ${audioFile.name}` : 'No audio uploaded (Live vocal / Acoustic)'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
            By submitting, you confirm that you and all group members agree to attend the rehearsal call and adhere to stage safety guidelines.
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-102"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5 fill-slate-950" />
            <span>{isSubmitting ? 'Submitting Act...' : 'Confirm & Submit Act'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
