import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/lib/services/data-store';
import { isValidTransition, VALID_PERFORMANCE_TRANSITIONS } from '../src/lib/validation/schemas';
import { DEMO_SOCIETY_ID, DEMO_EVENT_ID } from '../src/lib/demo/demo-data';

describe('SocietyStage Suite', () => {
  beforeEach(() => {
    db.resetToDefault();
  });

  describe('1. Tenant Isolation & Multi-Tenancy', () => {
    it('isolates events between societies', () => {
      // Create a second society
      const socB = db.createSociety({
        name: 'Palm Meadows Society',
        slug: 'palm-meadows',
        address: 'Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        contact_phone: '+91 99999 88888',
        timezone: 'Asia/Kolkata',
      });

      // Create an event for society B
      const evtB = db.createEvent({
        society_id: socB.id,
        name: 'Palm Meadows Diwali Mela',
        slug: 'palm-diwali-mela',
        description: 'Diwali celebration for Palm Meadows residents',
        event_type: 'Festival',
        venue: 'Main Courtyard',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        registration_open_at: new Date().toISOString(),
        registration_close_at: new Date().toISOString(),
        status: 'published',
      });

      // Events for Society A must not include Society B event
      const socAEvents = db.getEvents(DEMO_SOCIETY_ID);
      expect(socAEvents.some((e) => e.id === evtB.id)).toBe(false);

      // Events for Society B only contains Society B events
      const socBEvents = db.getEvents(socB.id);
      expect(socBEvents.length).toBe(1);
      expect(socBEvents[0].id).toBe(evtB.id);
    });
  });

  describe('2. Registration & Validation', () => {
    it('submits a valid registration with wing and flat number', () => {
      const categories = db.getCategories(DEMO_SOCIETY_ID);
      const reg = db.submitRegistration({
        eventId: DEMO_EVENT_ID,
        categoryId: categories[0].id,
        submittedBy: 'prof-resident',
        title: 'Fusion Sitar Solo',
        wing: 'Wing B',
        flatNumber: 'B-302',
        durationSeconds: 300,
        specialRequirements: '1 Instrument mic',
        members: [
          { display_name: 'Aarav Patel', wing: 'Wing B', flat_number: 'B-302', age: 32, role_in_performance: 'Sitarist', guardian_consent: false },
        ],
      });

      expect(reg.id).toBeDefined();
      expect(reg.status).toBe('submitted');
      expect(reg.title).toBe('Fusion Sitar Solo');
      expect(reg.wing).toBe('Wing B');
      expect(reg.flat_number).toBe('B-302');

      const retrieved = db.getRegistration(reg.id);
      expect(retrieved?.members?.length).toBe(1);
      expect(retrieved?.members?.[0].display_name).toBe('Aarav Patel');
      expect(retrieved?.members?.[0].flat_number).toBe('B-302');
    });

    it('creates audit log and notification on registration submission', () => {
      const categories = db.getCategories(DEMO_SOCIETY_ID);
      const reg = db.submitRegistration({
        eventId: DEMO_EVENT_ID,
        categoryId: categories[0].id,
        submittedBy: 'prof-resident',
        title: 'Classical Vocal Act',
        durationSeconds: 240,
        members: [{ display_name: 'Aarav Patel', age: 30, role_in_performance: 'Vocalist' }],
      });

      const notifs = db.getNotifications('prof-resident');
      expect(notifs.some((n) => n.title.includes('Registration Submitted'))).toBe(true);

      const auditLogs = db.getAuditLogs(DEMO_SOCIETY_ID);
      expect(auditLogs.some((a) => a.action === 'registration_submitted' && a.entity_id === reg.id)).toBe(true);
    });
  });

  describe('3. Admin Approvals & Lineup Addition', () => {
    it('updates registration status and notifies submitter', () => {
      const reg = db.updateRegistrationStatus('reg-01', 'approved', 'Looks great on audition', 'prof-admin');
      expect(reg.status).toBe('approved');
      expect(reg.admin_notes).toBe('Looks great on audition');

      const notifs = db.getNotifications(reg.submitted_by);
      expect(notifs.some((n) => n.title.includes('Approved'))).toBe(true);
    });

    it('adds approved performance to official lineup with calculated timings', () => {
      // reg-01 is approved, add to lineup if not already added
      const perf = db.addApprovedToLineup('reg-01', 'prof-admin');
      expect(perf).toBeDefined();
      expect(perf.status).toBe('completed'); // demo reg-01 is act #1
      expect(perf.performance_number).toBeGreaterThan(0);
    });
  });

  describe('4. Lineup Scheduling & Run-Order Reordering', () => {
    it('reorders lineup and recalculates start/end times sequentially', () => {
      const perfs = db.getPerformances(DEMO_EVENT_ID);
      const id1 = perfs[0].id;
      const id2 = perfs[1].id;

      // Swap first two performances
      const newOrder = [id2, id1, ...perfs.slice(2).map((p) => p.id)];
      db.reorderPerformances(DEMO_EVENT_ID, newOrder, 'prof-admin');

      const updated = db.getPerformances(DEMO_EVENT_ID);
      expect(updated[0].id).toBe(id2);
      expect(updated[0].performance_number).toBe(1);
      expect(updated[1].id).toBe(id1);
      expect(updated[1].performance_number).toBe(2);

      // Verify second item start time is after first item end time
      const firstEnd = new Date(updated[0].scheduled_end_at!).getTime();
      const secondStart = new Date(updated[1].scheduled_start_at!).getTime();
      expect(secondStart).toBeGreaterThanOrEqual(firstEnd);
    });
  });

  describe('5. Live Stage State Transitions', () => {
    it('validates allowed state transitions correctly', () => {
      expect(isValidTransition('queued', 'checked_in')).toBe(true);
      expect(isValidTransition('checked_in', 'ready')).toBe(true);
      expect(isValidTransition('ready', 'on_stage')).toBe(true);
      expect(isValidTransition('on_stage', 'completed')).toBe(true);

      // Invalid transitions
      expect(isValidTransition('queued', 'on_stage')).toBe(false);
      expect(isValidTransition('completed', 'queued')).toBe(false);
    });

    it('rejects illegal stage state jumps', () => {
      const perfs = db.getPerformances(DEMO_EVENT_ID);
      const queuedPerf = perfs.find((p) => p.status === 'queued');
      expect(queuedPerf).toBeDefined();

      if (queuedPerf) {
        // Direct jump from queued to on_stage without checkin should throw
        expect(() => {
          db.updatePerformanceLiveStatus(queuedPerf.id, 'on_stage', 'prof-stage');
        }).toThrow(/Invalid state transition/);
      }
    });

    it('executes valid live state transition and timestamps actual start', () => {
      const perfs = db.getPerformances(DEMO_EVENT_ID);
      const readyPerf = perfs.find((p) => p.status === 'ready');
      expect(readyPerf).toBeDefined();

      if (readyPerf) {
        const onStage = db.updatePerformanceLiveStatus(readyPerf.id, 'on_stage', 'prof-stage');
        expect(onStage.status).toBe('on_stage');
        expect(onStage.actual_start_at).toBeDefined();
      }
    });

    it('dispatches automated proximity stage-call alert to act 2 slots away', () => {
      // Move act 4 (which is in 'ready' state) to 'on_stage'
      const perfs = db.getPerformances(DEMO_EVENT_ID);
      const act4 = perfs.find((p) => p.performance_number === 4);
      expect(act4).toBeDefined();
      if (act4) {
        db.updatePerformanceLiveStatus(act4.id, 'on_stage', 'prof-stage');

        // Act 6 (2 slots away) submitter should have received an automated proximity call
        const act6 = perfs.find((p) => p.performance_number === 6);
        expect(act6).toBeDefined();
        if (act6) {
          const reg = db.getRegistration(act6.registration_id);
          const notifs = db.getNotifications(reg!.submitted_by);
          expect(notifs.some((n) => n.type === 'stage_call_proximity')).toBe(true);
        }
      }
    });
  });

  describe('6. Check-in & Volunteer Operations', () => {
    it('records checkin and advances queued performance to checked_in', () => {
      const perfs = db.getPerformances(DEMO_EVENT_ID);
      const queuedPerf = perfs.find((p) => p.status === 'queued');
      expect(queuedPerf).toBeDefined();

      if (queuedPerf) {
        const checkin = db.recordCheckin(queuedPerf.id, 'prof-volunteer', 'present', 'Costumes ready');
        expect(checkin.status).toBe('present');

        const updatedPerf = db.getPerformances(DEMO_EVENT_ID).find((p) => p.id === queuedPerf.id);
        expect(updatedPerf?.status).toBe('checked_in');
      }
    });
  });

  describe('7. Judge Scoring Rubric', () => {
    it('submits scorecard and computes total score', () => {
      const scorecards = db.getScorecards(DEMO_EVENT_ID);
      expect(scorecards.length).toBeGreaterThan(0);

      const score = db.submitScore({
        eventId: DEMO_EVENT_ID,
        performanceId: 'perf-04',
        judgeId: 'prof-judge',
        scorecardId: scorecards[0].id,
        scores: {
          'crit-sync': 25,
          'crit-expr': 28,
        },
        comments: 'Great energy and rhythm!',
      });

      expect(score.total_score).toBe(53);
      expect(score.comments).toBe('Great energy and rhythm!');

      const allScores = db.getScores('perf-04');
      expect(allScores.length).toBeGreaterThan(0);
    });
  });

  describe('8. Admin Settings & Operational Policies', () => {
    it('updates society profile and operational policies in database and audit logs', () => {
      const updated = db.updateSociety(
        DEMO_SOCIETY_ID,
        {
          name: 'Green Valley Grand Residency',
          city: 'Bengaluru South',
          contact_phone: '+91 80 9999 8888',
          settings_json: {
            media_limits_mb: {
              image: 25,
              audio: 80,
              video: 400,
              document: 30,
            },
            stage_operations: {
              default_transition_buffer_seconds: 90,
              proximity_call_threshold: 3,
              allow_performer_badge_download: true,
              auto_delay_recalculation: true,
            },
          },
        },
        'prof-admin'
      );

      expect(updated.name).toBe('Green Valley Grand Residency');
      expect(updated.city).toBe('Bengaluru South');
      expect(updated.settings_json?.media_limits_mb?.audio).toBe(80);
      expect(updated.settings_json?.stage_operations?.proximity_call_threshold).toBe(3);

      // Verify retrieval from getSociety
      const retrieved = db.getSociety(DEMO_SOCIETY_ID);
      expect(retrieved?.name).toBe('Green Valley Grand Residency');
      expect(retrieved?.settings_json?.stage_operations?.default_transition_buffer_seconds).toBe(90);

      // Verify audit log
      const logs = db.getAuditLogs(DEMO_SOCIETY_ID);
      expect(logs.some((l) => l.action === 'society_settings_updated' && l.actor_profile_id === 'prof-admin')).toBe(true);
    });

    it('propagates proximity_call_threshold dynamically during stage transitions', () => {
      // Configure proximity threshold to 3 acts away
      db.updateSociety(DEMO_SOCIETY_ID, {
        settings_json: {
          stage_operations: {
            proximity_call_threshold: 3,
          },
        },
      });

      const perfs = db.getPerformances(DEMO_EVENT_ID);
      // Find act 5 (which is in checked_in state), advance to ready and then on_stage
      const act5 = perfs.find((p) => p.performance_number === 5);
      expect(act5).toBeDefined();

      if (act5) {
        db.updatePerformanceLiveStatus(act5.id, 'ready', 'prof-stage');
        db.updatePerformanceLiveStatus(act5.id, 'on_stage', 'prof-stage');

        // Act 8 (5 + 3 away) submitter should have received an automated proximity call
        const act8 = perfs.find((p) => p.performance_number === 8);
        expect(act8).toBeDefined();
        if (act8) {
          const reg = db.getRegistration(act8.registration_id);
          const notifs = db.getNotifications(reg!.submitted_by);
          expect(notifs.some((n) => n.type === 'stage_call_proximity' && n.title.includes('3 Acts Away'))).toBe(true);
        }
      }
    });
  });
});

