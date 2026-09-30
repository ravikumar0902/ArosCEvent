import {
  Society,
  Building,
  Unit,
  Profile,
  Membership,
  EventCategory,
  Event,
  EventForm,
  FormField,
  Registration,
  RegistrationMember,
  MediaAsset,
  Performance,
  ScheduleItem,
  Checkin,
  Volunteer,
  Judge,
  Scorecard,
  Score,
  Announcement,
  Notification,
  AuditLog,
  PerformanceStatus,
  RegistrationStatus,
  Role,
} from '@/types/database';
import {
  DEMO_SOCIETY,
  DEMO_BUILDINGS,
  DEMO_UNITS,
  DEMO_PROFILES,
  DEMO_MEMBERSHIPS,
  DEMO_CATEGORIES,
  DEMO_EVENTS,
  DEMO_REGISTRATIONS,
  DEMO_REGISTRATION_MEMBERS,
  DEMO_MEDIA,
  DEMO_PERFORMANCES,
  DEMO_SCHEDULE_ITEMS,
  DEMO_CHECKINS,
  DEMO_VOLUNTEERS,
  DEMO_JUDGES,
  DEMO_SCORECARDS,
  DEMO_SCORES,
  DEMO_ANNOUNCEMENTS,
  DEMO_NOTIFICATIONS,
  DEMO_AUDIT_LOGS,
} from '../demo/demo-data';
import { getSupabaseConfig } from '../supabase/config';
import { createClient } from '../supabase/client';
import { isValidTransition } from '../validation/schemas';

const STORAGE_KEY = 'societystage_local_db_v1';

interface DatabaseState {
  societies: Society[];
  buildings: Building[];
  units: Unit[];
  profiles: Profile[];
  memberships: Membership[];
  categories: EventCategory[];
  events: Event[];
  forms: EventForm[];
  formFields: FormField[];
  registrations: Registration[];
  registrationMembers: RegistrationMember[];
  media: MediaAsset[];
  performances: Performance[];
  scheduleItems: ScheduleItem[];
  checkins: Checkin[];
  volunteers: Volunteer[];
  judges: Judge[];
  scorecards: Scorecard[];
  scores: Score[];
  announcements: Announcement[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

function getInitialState(): DatabaseState {
  return {
    societies: [DEMO_SOCIETY],
    buildings: DEMO_BUILDINGS,
    units: DEMO_UNITS,
    profiles: DEMO_PROFILES,
    memberships: DEMO_MEMBERSHIPS,
    categories: DEMO_CATEGORIES,
    events: DEMO_EVENTS,
    forms: [],
    formFields: [],
    registrations: DEMO_REGISTRATIONS,
    registrationMembers: DEMO_REGISTRATION_MEMBERS,
    media: DEMO_MEDIA,
    performances: DEMO_PERFORMANCES,
    scheduleItems: DEMO_SCHEDULE_ITEMS,
    checkins: DEMO_CHECKINS,
    volunteers: DEMO_VOLUNTEERS,
    judges: DEMO_JUDGES,
    scorecards: DEMO_SCORECARDS,
    scores: DEMO_SCORES,
    announcements: DEMO_ANNOUNCEMENTS,
    notifications: DEMO_NOTIFICATIONS,
    auditLogs: DEMO_AUDIT_LOGS,
  };
}

class DataStore {
  private state: DatabaseState;
  private listeners: Set<(event: string, payload?: any) => void> = new Set();
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    this.state = getInitialState();
    if (this.isBrowser) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.state = { ...getInitialState(), ...parsed };
        }
      } catch (err) {
        console.warn('Could not read from local storage, using initial seed data', err);
      }

      // Listen to cross-tab updates via BroadcastChannel
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('societystage_realtime');
        channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC') {
            try {
              const saved = localStorage.getItem(STORAGE_KEY);
              if (saved) {
                this.state = JSON.parse(saved);
                this.notify('SYNC', event.data.payload);
              }
            } catch (e) {
              console.error(e);
            }
          }
        };
      }
    }
  }

  private persist(eventName: string, payload?: any) {
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('societystage_realtime');
          channel.postMessage({ type: 'SYNC', eventName, payload });
        }
      } catch (err) {
        console.error('Failed to persist database state', err);
      }
    }
    this.notify(eventName, payload);
  }

  public resetToDefault() {
    this.state = getInitialState();
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.persist('RESET');
  }

  public subscribe(listener: (event: string, payload?: any) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: string, payload?: any) {
    this.listeners.forEach((fn) => {
      try {
        fn(event, payload);
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  // --- Audit Log Utility ---
  public logAudit(societyId: string, actorId: string, action: string, entityType: string, entityId: string, before?: any, after?: any) {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      society_id: societyId,
      actor_profile_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_json: before,
      after_json: after,
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(entry);
    this.persist('AUDIT_LOG_ADDED', entry);
    return entry;
  }

  // --- Notification Utility ---
  public sendNotification(societyId: string, recipientId: string, type: string, title: string, body: string, data?: any, eventId?: string) {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      society_id: societyId,
      event_id: eventId,
      recipient_profile_id: recipientId,
      type,
      title,
      body,
      data_json: data,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    this.state.notifications.unshift(notif);
    this.persist('NOTIFICATION_CREATED', notif);
    return notif;
  }

  // --- Societies & Buildings & Units ---
  public getSocieties(): Society[] {
    return this.state.societies;
  }

  public getSociety(idOrSlug: string): Society | undefined {
    return this.state.societies.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
  }

  public createSociety(data: Omit<Society, 'id' | 'created_at' | 'updated_at'>): Society {
    const newSociety: Society = {
      ...data,
      id: `soc-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.societies.push(newSociety);
    this.persist('SOCIETY_CREATED', newSociety);
    return newSociety;
  }

  public updateSociety(id: string, updates: Partial<Society>, actorId?: string): Society {
    const idx = this.state.societies.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Society with id "${id}" not found`);

    const existing = this.state.societies[idx];
    const updated: Society = {
      ...existing,
      ...updates,
      settings_json: {
        ...(existing.settings_json || {}),
        ...(updates.settings_json || {}),
      },
      updated_at: new Date().toISOString(),
    };

    this.state.societies[idx] = updated;

    this.logAudit(id, actorId || 'admin', 'society_settings_updated', 'societies', id, existing, updated);

    this.persist('SOCIETY_UPDATED', updated);
    return updated;
  }

  public getBuildings(societyId: string): Building[] {
    return this.state.buildings.filter((b) => b.society_id === societyId);
  }

  public addBuilding(societyId: string, name: string, code: string): Building {
    const bld: Building = {
      id: `bld-${Date.now()}`,
      society_id: societyId,
      name,
      code,
      created_at: new Date().toISOString(),
    };
    this.state.buildings.push(bld);
    this.persist('BUILDING_CREATED', bld);
    return bld;
  }

  public getUnits(societyId: string): (Unit & { building?: Building })[] {
    return this.state.units
      .filter((u) => u.society_id === societyId)
      .map((u) => ({
        ...u,
        building: this.state.buildings.find((b) => b.id === u.building_id),
      }));
  }

  public addUnit(societyId: string, buildingId: string, unitNumber: string, floor: number): Unit {
    const unit: Unit = {
      id: `unit-${Date.now()}`,
      society_id: societyId,
      building_id: buildingId,
      unit_number: unitNumber,
      floor,
      created_at: new Date().toISOString(),
    };
    this.state.units.push(unit);
    this.persist('UNIT_CREATED', unit);
    return unit;
  }

  // --- Profiles & Memberships ---
  public getProfiles(): Profile[] {
    return this.state.profiles;
  }

  public getProfile(id: string): Profile | undefined {
    return this.state.profiles.find((p) => p.id === id || p.auth_user_id === id);
  }

  public getMemberships(societyId?: string): (Membership & { profile?: Profile; unit?: Unit })[] {
    let list = this.state.memberships;
    if (societyId) {
      list = list.filter((m) => m.society_id === societyId);
    }
    return list.map((m) => ({
      ...m,
      profile: this.state.profiles.find((p) => p.id === m.profile_id),
      unit: this.state.units.find((u) => u.id === m.unit_id),
    }));
  }

  public addMember(societyId: string, profileData: { full_name: string; email: string; phone?: string; role: Role; unitId?: string }): { profile: Profile; membership: Membership } {
    let profile = this.state.profiles.find((p) => p.email.toLowerCase() === profileData.email.toLowerCase());
    if (!profile) {
      profile = {
        id: `prof-${Date.now()}`,
        auth_user_id: `auth-${Date.now()}`,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone || '',
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.state.profiles.push(profile);
    }

    const membership: Membership = {
      id: `mem-${Date.now()}`,
      society_id: societyId,
      profile_id: profile.id,
      unit_id: profileData.unitId || null,
      role: profileData.role,
      status: 'active',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.memberships.push(membership);
    this.persist('MEMBER_ADDED', { profile, membership });
    return { profile, membership };
  }

  // --- Events & Categories ---
  public getEvents(societyId: string): Event[] {
    return this.state.events.filter((e) => e.society_id === societyId);
  }

  public getEvent(idOrSlug: string): Event | undefined {
    return this.state.events.find((e) => e.id === idOrSlug || e.slug === idOrSlug);
  }

  public createEvent(data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Event {
    const event: Event = {
      ...data,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.events.unshift(event);
    this.logAudit(event.society_id, event.created_by || 'system', 'event_created', 'events', event.id, null, event);
    this.persist('EVENT_CREATED', event);
    return event;
  }

  public updateEvent(id: string, updates: Partial<Event>, actorId: string): Event {
    const index = this.state.events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found');
    const before = { ...this.state.events[index] };
    const updated = {
      ...this.state.events[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.state.events[index] = updated;
    this.logAudit(updated.society_id, actorId, 'event_updated', 'events', id, before, updated);
    this.persist('EVENT_UPDATED', updated);
    return updated;
  }

  public getCategories(societyId: string): EventCategory[] {
    return this.state.categories.filter((c) => c.society_id === societyId);
  }

  public addCategory(societyId: string, data: Omit<EventCategory, 'id' | 'society_id' | 'created_at'>): EventCategory {
    const cat: EventCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      society_id: societyId,
      created_at: new Date().toISOString(),
    };
    this.state.categories.push(cat);
    this.persist('CATEGORY_CREATED', cat);
    return cat;
  }

  // --- Registrations ---
  public getRegistrations(eventId: string): (Registration & { category?: EventCategory; submitter?: Profile; members?: RegistrationMember[]; media?: MediaAsset[]; performance?: Performance })[] {
    return this.state.registrations
      .filter((r) => r.event_id === eventId)
      .map((r) => ({
        ...r,
        category: this.state.categories.find((c) => c.id === r.category_id),
        submitter: this.state.profiles.find((p) => p.id === r.submitted_by),
        members: this.state.registrationMembers.filter((m) => m.registration_id === r.id),
        media: this.state.media.filter((m) => m.registration_id === r.id),
        performance: this.state.performances.find((p) => p.registration_id === r.id),
      }));
  }

  public getRegistration(id: string) {
    const r = this.state.registrations.find((reg) => reg.id === id);
    if (!r) return undefined;
    return {
      ...r,
      category: this.state.categories.find((c) => c.id === r.category_id),
      submitter: this.state.profiles.find((p) => p.id === r.submitted_by),
      members: this.state.registrationMembers.filter((m) => m.registration_id === r.id),
      media: this.state.media.filter((m) => m.registration_id === r.id),
      performance: this.state.performances.find((p) => p.registration_id === r.id),
    };
  }

  public submitRegistration(params: {
    eventId: string;
    categoryId: string;
    submittedBy: string;
    title: string;
    wing?: string;
    flatNumber?: string;
    flat_number?: string;
    durationSeconds: number;
    specialRequirements?: string;
    members: Array<{
      display_name: string;
      wing?: string;
      flat_number?: string;
      flatNumber?: string;
      age?: number | null;
      role_in_performance: string;
      guardian_consent?: boolean;
    }>;
    mediaFiles?: Array<{ name: string; type: 'image' | 'audio' | 'video' | 'document'; size: number; url?: string }>;
  }): Registration {
    const event = this.getEvent(params.eventId);
    if (!event) throw new Error('Event not found');

    const regId = `reg-${Date.now()}`;
    const flatNum = params.flatNumber || params.flat_number || null;
    const wingVal = params.wing || null;

    const newReg: Registration = {
      id: regId,
      event_id: params.eventId,
      category_id: params.categoryId,
      submitted_by: params.submittedBy,
      title: params.title,
      wing: wingVal,
      flat_number: flatNum,
      status: 'submitted',
      duration_seconds: params.durationSeconds,
      special_requirements: params.specialRequirements || null,
      admin_notes: null,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.registrations.push(newReg);

    // Add members
    params.members.forEach((m, idx) => {
      this.state.registrationMembers.push({
        id: `rm-${regId}-${idx + 1}`,
        registration_id: regId,
        display_name: m.display_name,
        wing: m.wing || wingVal,
        flat_number: m.flatNumber || m.flat_number || flatNum,
        age: m.age ?? null,
        role_in_performance: m.role_in_performance,
        guardian_consent: m.guardian_consent ?? false,
        created_at: new Date().toISOString(),
      });
    });

    // Add media if provided
    if (params.mediaFiles) {
      params.mediaFiles.forEach((file, idx) => {
        this.state.media.push({
          id: `med-${Date.now()}-${idx}`,
          society_id: event.society_id,
          event_id: params.eventId,
          registration_id: regId,
          uploaded_by: params.submittedBy,
          media_type: file.type,
          file_name: file.name,
          storage_path: `performance-${file.type}/${file.name}`,
          mime_type: file.type === 'audio' ? 'audio/mpeg' : file.type === 'video' ? 'video/mp4' : 'image/jpeg',
          file_size: file.size,
          duration_seconds: params.durationSeconds,
          visibility: 'event_admins',
          created_at: new Date().toISOString(),
          public_url: file.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        });
      });
    }

    this.logAudit(event.society_id, params.submittedBy, 'registration_submitted', 'registrations', regId, null, newReg);
    this.sendNotification(
      event.society_id,
      params.submittedBy,
      'registration_submitted',
      'Registration Submitted! 📋',
      `Your registration for "${params.title}" has been received and is under review.`,
      { registration_id: regId },
      event.id
    );

    this.persist('REGISTRATION_SUBMITTED', newReg);
    return newReg;
  }

  public updateRegistrationStatus(
    regId: string,
    status: RegistrationStatus,
    adminNotes: string,
    reviewedBy: string
  ): Registration {
    const index = this.state.registrations.findIndex((r) => r.id === regId);
    if (index === -1) throw new Error('Registration not found');

    const before = { ...this.state.registrations[index] };
    const reg = {
      ...this.state.registrations[index],
      status,
      admin_notes: adminNotes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    };
    this.state.registrations[index] = reg;

    const event = this.getEvent(reg.event_id);
    if (event) {
      this.logAudit(event.society_id, reviewedBy, `registration_${status}`, 'registrations', regId, before, reg);
      
      let title = `Registration Status: ${status.replace('_', ' ').toUpperCase()}`;
      let body = `Your submission "${reg.title}" status is now ${status}. Notes: ${adminNotes || 'None'}`;
      if (status === 'approved') {
        title = 'Performance Approved! 🌟';
        body = `Congratulations! Your performance "${reg.title}" has been approved for ${event.name}.`;
      } else if (status === 'changes_requested') {
        title = 'Action Required on Registration ⚠️';
        body = `Reviewer notes for "${reg.title}": ${adminNotes}`;
      }
      this.sendNotification(event.society_id, reg.submitted_by, `registration_${status}`, title, body, { registration_id: regId }, event.id);
    }

    this.persist('REGISTRATION_STATUS_UPDATED', reg);
    return reg;
  }

  // --- Lineup & Performances ---
  public getPerformances(eventId: string): (Performance & { category?: EventCategory; registration?: Registration; checkins?: Checkin[] })[] {
    return this.state.performances
      .filter((p) => p.event_id === eventId)
      .sort((a, b) => a.performance_number - b.performance_number)
      .map((p) => ({
        ...p,
        category: this.state.categories.find((c) => c.id === p.category_id),
        registration: this.state.registrations.find((r) => r.id === p.registration_id),
        checkins: this.state.checkins.filter((ch) => ch.performance_id === p.id),
      }));
  }

  public addApprovedToLineup(regId: string, actorId: string): Performance {
    const reg = this.state.registrations.find((r) => r.id === regId);
    if (!reg) throw new Error('Registration not found');
    if (reg.status !== 'approved') throw new Error('Only approved registrations can be added to lineup');

    const existing = this.state.performances.find((p) => p.registration_id === regId);
    if (existing) return existing;

    const currentPerformances = this.getPerformances(reg.event_id);
    const nextNumber = currentPerformances.length + 1;

    // Calculate scheduled times based on previous items or event start
    const event = this.getEvent(reg.event_id);
    const baseTime = event ? new Date(event.start_at).getTime() : Date.now();
    let scheduledStart = baseTime;
    if (currentPerformances.length > 0) {
      const last = currentPerformances[currentPerformances.length - 1];
      scheduledStart = new Date(last.scheduled_end_at || last.scheduled_start_at || Date.now()).getTime() + (last.transition_seconds || 60) * 1000;
    }
    const scheduledEnd = scheduledStart + reg.duration_seconds * 1000;

    const newPerf: Performance = {
      id: `perf-${Date.now()}`,
      event_id: reg.event_id,
      registration_id: reg.id,
      performance_number: nextNumber,
      title: reg.title,
      category_id: reg.category_id,
      duration_seconds: reg.duration_seconds,
      transition_seconds: 60,
      equipment_notes: reg.special_requirements,
      stage_notes: null,
      status: 'queued',
      scheduled_start_at: new Date(scheduledStart).toISOString(),
      scheduled_end_at: new Date(scheduledEnd).toISOString(),
      actual_start_at: null,
      actual_end_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.performances.push(newPerf);
    this.recalculateSchedule(reg.event_id);

    if (event) {
      this.logAudit(event.society_id, actorId, 'added_to_lineup', 'performances', newPerf.id, null, newPerf);
    }
    this.persist('PERFORMANCE_ADDED', newPerf);
    return newPerf;
  }

  public reorderPerformances(eventId: string, orderedIds: string[], actorId: string) {
    const event = this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    const baseStartTime = new Date(event.start_at).getTime();
    let rollingTime = baseStartTime;

    orderedIds.forEach((id, index) => {
      const perfIndex = this.state.performances.findIndex((p) => p.id === id);
      if (perfIndex !== -1) {
        const perf = this.state.performances[perfIndex];
        const start = rollingTime;
        const end = start + perf.duration_seconds * 1000;
        rollingTime = end + (perf.transition_seconds || 60) * 1000;

        this.state.performances[perfIndex] = {
          ...perf,
          performance_number: index + 1,
          scheduled_start_at: new Date(start).toISOString(),
          scheduled_end_at: new Date(end).toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    });

    this.logAudit(event.society_id, actorId, 'lineup_reordered', 'events', eventId, null, { orderedIds });
    this.persist('LINEUP_REORDERED', { eventId, orderedIds });
  }

  public recalculateSchedule(eventId: string) {
    const event = this.getEvent(eventId);
    if (!event) return;

    const perfs = this.getPerformances(eventId);
    let rollingTime = new Date(event.start_at).getTime();

    perfs.forEach((perf, idx) => {
      const start = rollingTime;
      const end = start + perf.duration_seconds * 1000;
      rollingTime = end + (perf.transition_seconds || 60) * 1000;

      const pIndex = this.state.performances.findIndex((p) => p.id === perf.id);
      if (pIndex !== -1) {
        this.state.performances[pIndex] = {
          ...this.state.performances[pIndex],
          performance_number: idx + 1,
          scheduled_start_at: new Date(start).toISOString(),
          scheduled_end_at: new Date(end).toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    });
  }

  // --- Live Event Transitions ---
  public updatePerformanceLiveStatus(
    performanceId: string,
    targetStatus: PerformanceStatus,
    actorId: string,
    notes?: string
  ): Performance {
    const index = this.state.performances.findIndex((p) => p.id === performanceId);
    if (index === -1) throw new Error('Performance not found');

    const perf = this.state.performances[index];
    if (!isValidTransition(perf.status, targetStatus)) {
      throw new Error(`Invalid state transition from ${perf.status} to ${targetStatus}`);
    }

    const before = { ...perf };
    const nowIso = new Date().toISOString();

    let actualStart = perf.actual_start_at;
    let actualEnd = perf.actual_end_at;

    if (targetStatus === 'on_stage') {
      actualStart = nowIso;
    } else if (targetStatus === 'completed') {
      actualEnd = nowIso;
    }

    const updated: Performance = {
      ...perf,
      status: targetStatus,
      actual_start_at: actualStart,
      actual_end_at: actualEnd,
      stage_notes: notes || perf.stage_notes,
      updated_at: nowIso,
    };
    this.state.performances[index] = updated;

    const event = this.getEvent(updated.event_id);
    if (event) {
      this.logAudit(event.society_id, actorId, `stage_transition_${targetStatus}`, 'performances', performanceId, before, updated);
    }

    // Automatically ready the next performance if current is moved to on_stage
    if (targetStatus === 'on_stage') {
      const nextPerf = this.state.performances.find(
        (p) => p.event_id === updated.event_id && p.performance_number === updated.performance_number + 1 && p.status === 'checked_in'
      );
      if (nextPerf) {
        const nextIndex = this.state.performances.findIndex((p) => p.id === nextPerf.id);
        if (nextIndex !== -1) {
          this.state.performances[nextIndex] = {
            ...this.state.performances[nextIndex],
            status: 'ready',
            updated_at: nowIso,
          };
        }
      }

      // Feature: Dynamic Proximity Backstage Call alert to act at performance_number + proximityOffset
      const society = event ? this.getSociety(event.society_id) : undefined;
      const proximityOffset = society?.settings_json?.stage_operations?.proximity_call_threshold || 2;
      const targetPerf = this.state.performances.find(
        (p) => p.event_id === updated.event_id && p.performance_number === updated.performance_number + proximityOffset
      );
      if (targetPerf && event) {
        const reg = this.state.registrations.find((r) => r.id === targetPerf.registration_id);
        if (reg) {
          this.sendNotification(
            event.society_id,
            reg.submitted_by,
            'stage_call_proximity',
            `⚠️ Stage Call: ${proximityOffset} Acts Away! (Act #${targetPerf.performance_number})`,
            `Act #${updated.performance_number} "${updated.title}" is now on stage. Please report to Green Room Wing B immediately for audio mic check.`,
            { performance_id: targetPerf.id },
            event.id
          );
        }
      }
    }

    this.persist('PERFORMANCE_STATUS_CHANGED', updated);
    return updated;
  }

  // --- Check-ins ---
  public recordCheckin(performanceId: string, actorId: string, status: 'present' | 'partial' | 'absent', notes?: string): Checkin {
    const perf = this.state.performances.find((p) => p.id === performanceId);
    if (!perf) throw new Error('Performance not found');

    const checkin: Checkin = {
      id: `chk-${Date.now()}`,
      event_id: perf.event_id,
      performance_id: performanceId,
      checked_in_by: actorId,
      checked_in_at: new Date().toISOString(),
      status,
      notes: notes || null,
    };
    this.state.checkins.push(checkin);

    // If status is present and performance is queued, advance to checked_in
    if (status === 'present' && perf.status === 'queued') {
      this.updatePerformanceLiveStatus(performanceId, 'checked_in', actorId, 'Checked in by volunteer');
    }

    this.persist('CHECKIN_RECORDED', checkin);
    return checkin;
  }

  public getCheckins(eventId: string): Checkin[] {
    return this.state.checkins.filter((c) => c.event_id === eventId);
  }

  // --- Volunteers & Judges ---
  public getVolunteers(eventId: string): (Volunteer & { profile?: Profile })[] {
    return this.state.volunteers
      .filter((v) => v.event_id === eventId)
      .map((v) => ({
        ...v,
        profile: this.state.profiles.find((p) => p.id === v.profile_id),
      }));
  }

  public addVolunteer(eventId: string, profileId: string, responsibility: string, area: string): Volunteer {
    const vol: Volunteer = {
      id: `vol-${Date.now()}`,
      event_id: eventId,
      profile_id: profileId,
      responsibility,
      area,
      status: 'active',
      notes: null,
    };
    this.state.volunteers.push(vol);
    this.persist('VOLUNTEER_ADDED', vol);
    return vol;
  }

  public getJudges(eventId: string): (Judge & { profile?: Profile })[] {
    return this.state.judges
      .filter((j) => j.event_id === eventId)
      .map((j) => ({
        ...j,
        profile: this.state.profiles.find((p) => p.id === j.profile_id),
      }));
  }

  public getScorecards(eventId: string): Scorecard[] {
    return this.state.scorecards.filter((s) => s.event_id === eventId);
  }

  public submitScore(params: {
    eventId: string;
    performanceId: string;
    judgeId: string;
    scorecardId: string;
    scores: Record<string, number>;
    comments?: string;
  }): Score {
    const total = Object.values(params.scores).reduce((sum, val) => sum + Number(val || 0), 0);
    const score: Score = {
      id: `score-${Date.now()}`,
      event_id: params.eventId,
      performance_id: params.performanceId,
      judge_id: params.judgeId,
      scorecard_id: params.scorecardId,
      score_json: params.scores,
      total_score: total,
      comments: params.comments || null,
      submitted_at: new Date().toISOString(),
    };
    this.state.scores.push(score);

    const event = this.getEvent(params.eventId);
    if (event) {
      this.logAudit(event.society_id, params.judgeId, 'judge_score_submitted', 'scores', score.id, null, score);
    }

    this.persist('SCORE_SUBMITTED', score);
    return score;
  }

  public getScores(performanceId?: string): Score[] {
    if (!performanceId) return this.state.scores;
    return this.state.scores.filter((s) => s.performance_id === performanceId);
  }

  // --- Announcements ---
  public getAnnouncements(eventId: string): (Announcement & { author?: Profile })[] {
    return this.state.announcements
      .filter((a) => a.event_id === eventId)
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
      .map((a) => ({
        ...a,
        author: this.state.profiles.find((p) => p.id === a.created_by),
      }));
  }

  public broadcastAnnouncement(eventId: string, title: string, message: string, type: 'general' | 'urgent' | 'stage_call' | 'schedule_change' | 'results', authorId: string): Announcement {
    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      event_id: eventId,
      created_by: authorId,
      title,
      message,
      announcement_type: type,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.state.announcements.unshift(ann);

    const event = this.getEvent(eventId);
    if (event) {
      this.logAudit(event.society_id, authorId, 'announcement_broadcast', 'announcements', ann.id, null, ann);
    }

    this.persist('ANNOUNCEMENT_BROADCAST', ann);
    return ann;
  }

  // --- Notifications ---
  public getNotifications(profileId: string): Notification[] {
    return this.state.notifications
      .filter((n) => n.recipient_profile_id === profileId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(id: string) {
    const index = this.state.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.state.notifications[index].read_at = new Date().toISOString();
      this.persist('NOTIFICATION_READ', id);
    }
  }

  // --- Audit Logs ---
  public getAuditLogs(societyId: string): (AuditLog & { actor?: Profile })[] {
    return this.state.auditLogs
      .filter((a) => a.society_id === societyId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((a) => ({
        ...a,
        actor: this.state.profiles.find((p) => p.id === a.actor_profile_id),
      }));
  }
}

// Singleton instance
export const db = new DataStore();
