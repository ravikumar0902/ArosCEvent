'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Sparkles,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
} from 'lucide-react';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export function EventCreationWizard() {
  const router = useRouter();
  const { currentSociety, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80');
  const [eventType, setEventType] = useState('Cultural Fest');

  // Step 2: Schedule
  const [venue, setVenue] = useState('Society Clubhouse & Amphitheatre');
  const [startDate, setStartDate] = useState('2026-11-15T18:00');
  const [endDate, setEndDate] = useState('2026-11-15T22:30');
  const [regOpenDate, setRegOpenDate] = useState('2026-10-01T09:00');
  const [regCloseDate, setRegCloseDate] = useState('2026-11-10T23:59');

  // Step 3: Categories
  const [categories, setCategories] = useState([
    { name: 'Solo Dance', duration: 300, maxParticipants: 1, requiresMedia: true, requiresJudging: true },
    { name: 'Group Dance', duration: 360, maxParticipants: 10, requiresMedia: true, requiresJudging: true },
    { name: 'Singing (Solo/Duet)', duration: 300, maxParticipants: 2, requiresMedia: false, requiresJudging: true },
    { name: 'Drama & Skit', duration: 480, maxParticipants: 12, requiresMedia: true, requiresJudging: true },
  ]);

  // Step 4: Form Builder questions
  const [customFields, setCustomFields] = useState([
    { label: 'Performer Experience Level', type: 'select', required: true },
    { label: 'Stage AV & Lighting Requirements', type: 'text', required: false },
  ]);

  // Step 5: Rules & Policies
  const [rules, setRules] = useState(
    '1. All participants must report backstage 20 minutes before assigned performance time.\n2. Audio tracks must be high quality MP3.\n3. Parental consent required for children under 18.'
  );

  const addCategory = () => {
    setCategories([
      ...categories,
      { name: 'New Category', duration: 300, maxParticipants: 5, requiresMedia: true, requiresJudging: true },
    ]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, idx) => idx !== index));
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { label: 'New Question Field', type: 'text', required: false },
    ]);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async (publishDirectly: boolean) => {
    if (!currentSociety) return;
    if (!name.trim()) {
      toast.error('Event name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = db.createEvent({
        society_id: currentSociety.id,
        name,
        slug: slug || `event-${Date.now()}`,
        description,
        cover_image_url: coverImageUrl,
        event_type: eventType,
        venue,
        start_at: new Date(startDate).toISOString(),
        end_at: new Date(endDate).toISOString(),
        registration_open_at: new Date(regOpenDate).toISOString(),
        registration_close_at: new Date(regCloseDate).toISOString(),
        status: publishDirectly ? 'registration_open' : 'draft',
        created_by: user?.id || 'admin',
        settings_json: {
          rules_and_guidelines: rules,
          max_registrations_per_user: 3,
        },
      });

      // Add categories
      categories.forEach((c) => {
        db.addCategory(currentSociety.id, {
          name: c.name,
          default_duration_seconds: c.duration,
          default_transition_seconds: 60,
          max_participants: c.maxParticipants,
          requires_media: c.requiresMedia,
          requires_judging: c.requiresJudging,
        });
      });

      toast.success(publishDirectly ? 'Event published successfully! 🎉' : 'Draft event saved.');
      router.push('/admin/events');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel-highlight rounded-3xl p-6 sm:p-8 border border-white/10 max-w-4xl mx-auto shadow-2xl">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Step {currentStep} of 6
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">
              {currentStep === 1 && 'Basic Event Info'}
              {currentStep === 2 && 'Date, Time & Venue'}
              {currentStep === 3 && 'Performance Categories'}
              {currentStep === 4 && 'Registration Form Builder'}
              {currentStep === 5 && 'Rules & Consent Policies'}
              {currentStep === 6 && 'Review & Publish Event'}
            </h2>
          </div>
        </div>
      </div>

      {/* STEP 1: BASIC DETAILS */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Holi Sangeet Utsav / Spring Talent Gala"
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="holi-sangeet-utsav"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Event Type
              </label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g. Cultural Gala / Drama Night"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Event Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the cultural extravaganza and community participation guidelines..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
        </div>
      )}

      {/* STEP 2: SCHEDULE */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Venue Location
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Stage Start Date/Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Stage End Date/Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Registration Opens</label>
              <input
                type="datetime-local"
                value={regOpenDate}
                onChange={(e) => setRegOpenDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Registration Closes</label>
              <input
                type="datetime-local"
                value={regCloseDate}
                onChange={(e) => setRegCloseDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CATEGORIES */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Define categories participants can register for.</p>
            <button
              type="button"
              onClick={addCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[180px]">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const updated = [...categories];
                      updated[idx].name = e.target.value;
                      setCategories(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Dur:</span>
                  <input
                    type="number"
                    value={cat.duration / 60}
                    onChange={(e) => {
                      const updated = [...categories];
                      updated[idx].duration = Number(e.target.value) * 60;
                      setCategories(updated);
                    }}
                    className="w-14 bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-xs text-white text-center"
                  />
                  <span className="text-slate-400">mins</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(idx)}
                  className="p-1 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: FORM BUILDER */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Add custom registration questions for applicants.</p>
            <button
              type="button"
              onClick={addCustomField}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-3">
            {customFields.map((field, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[idx].label = e.target.value;
                    setCustomFields(updated);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={field.type}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[idx].type = e.target.value;
                    setCustomFields(updated);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="text">Text Input</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: RULES */}
      {currentStep === 5 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-400">Establish society stage etiquette, rehearsal calls, and minor consent policies.</p>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={6}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-white leading-relaxed outline-none"
          />
        </div>
      )}

      {/* STEP 6: PUBLISH PREVIEW */}
      {currentStep === 6 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-xs text-slate-300">{description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div>Venue: <strong className="text-white">{venue}</strong></div>
              <div>Categories: <strong className="text-amber-400">{categories.length} categories</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 6))}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleCreate(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleCreate(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg"
            >
              Publish Event & Open Registrations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
