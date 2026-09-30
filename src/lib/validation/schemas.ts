import { z } from 'zod';
import { PerformanceStatus, Role } from '@/types/database';

// File upload limits (configurable fallback)
export const DEFAULT_FILE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  audio: 50 * 1024 * 1024, // 50MB
  video: 250 * 1024 * 1024, // 250MB
  document: 20 * 1024 * 1024, // 20MB
};

export const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Event Creation & Update
export const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters').max(100),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  cover_image_url: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  event_type: z.string().min(2, 'Event type required'),
  venue: z.string().min(3, 'Venue is required'),
  start_at: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid start date/time is required' }),
  end_at: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid end date/time is required' }),
  registration_open_at: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid registration open time is required' }),
  registration_close_at: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid registration close time is required' }),
  status: z.enum(['draft', 'published', 'registration_open', 'registration_closed', 'live', 'completed', 'archived', 'cancelled']),
  rules_and_guidelines: z.string().optional(),
}).refine((data) => new Date(data.end_at) > new Date(data.start_at), {
  message: 'Event end time must be after start time',
  path: ['end_at'],
}).refine((data) => new Date(data.registration_close_at) > new Date(data.registration_open_at), {
  message: 'Registration closing date must be after opening date',
  path: ['registration_close_at'],
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  default_duration_seconds: z.coerce.number().min(30, 'Duration must be at least 30 seconds').max(3600),
  default_transition_seconds: z.coerce.number().min(0).max(600),
  max_participants: z.coerce.number().min(1).max(100),
  requires_media: z.boolean().default(false),
  requires_judging: z.boolean().default(false),
});

// Participant Member in Registration
export const participantMemberSchema = z.object({
  profile_id: z.string().optional().nullable(),
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be valid').max(120).optional().nullable(),
  role_in_performance: z.string().min(2, 'Role in performance is required'), // e.g. Lead Dancer, Vocalist, Actor
  guardian_profile_id: z.string().optional().nullable(),
  guardian_consent: z.boolean().default(false),
}).refine((member) => {
  // If age is under 18, guardian consent is required
  if (member.age && member.age < 18) {
    return member.guardian_consent === true;
  }
  return true;
}, {
  message: 'Parental/Guardian consent is required for participants under 18',
  path: ['guardian_consent'],
});

// Registration Form Submission Schema
export const registrationSubmissionSchema = z.object({
  category_id: z.string().uuid('Please select a valid category'),
  title: z.string().min(3, 'Performance title must be at least 3 characters'),
  duration_seconds: z.coerce.number().min(30, 'Performance must be at least 30 seconds').max(1800, 'Max duration is 30 minutes'),
  special_requirements: z.string().optional(),
  members: z.array(participantMemberSchema).min(1, 'At least one participant is required'),
  answers: z.record(z.string(), z.any()).optional(),
});

// Live State Valid Transitions Schema
export const VALID_PERFORMANCE_TRANSITIONS: Record<PerformanceStatus, PerformanceStatus[]> = {
  queued: ['checked_in', 'cancelled', 'delayed'],
  checked_in: ['ready', 'no_show', 'cancelled', 'delayed'],
  ready: ['on_stage', 'delayed', 'cancelled'],
  on_stage: ['completed', 'delayed'],
  delayed: ['ready', 'on_stage', 'cancelled'],
  completed: [],
  no_show: ['checked_in'],
  cancelled: ['queued'],
};

export function isValidTransition(from: PerformanceStatus, to: PerformanceStatus): boolean {
  if (from === to) return true;
  return VALID_PERFORMANCE_TRANSITIONS[from]?.includes(to) ?? false;
}

export const liveStatusTransitionSchema = z.object({
  performance_id: z.string().uuid(),
  current_status: z.enum(['queued', 'checked_in', 'ready', 'on_stage', 'completed', 'no_show', 'cancelled', 'delayed']),
  target_status: z.enum(['queued', 'checked_in', 'ready', 'on_stage', 'completed', 'no_show', 'cancelled', 'delayed']),
  notes: z.string().optional(),
}).refine((data) => isValidTransition(data.current_status, data.target_status), {
  message: 'Invalid state transition',
  path: ['target_status'],
});

// Check-in schema
export const checkinSchema = z.object({
  performance_id: z.string().uuid(),
  profile_id: z.string().uuid().optional().nullable(),
  status: z.enum(['present', 'partial', 'absent']),
  notes: z.string().optional(),
});

// Judge Score schema
export const scoreSubmissionSchema = z.object({
  performance_id: z.string().uuid(),
  scorecard_id: z.string().uuid(),
  scores: z.record(z.string(), z.coerce.number().min(0)),
  comments: z.string().optional(),
});

// Announcement Schema
export const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required').max(150),
  message: z.string().min(5, 'Message is required').max(1000),
  announcement_type: z.enum(['general', 'urgent', 'stage_call', 'schedule_change', 'results']),
});

// Society Settings Schema
export const societySettingsSchema = z.object({
  name: z.string().min(3, 'Society name is required'),
  slug: z.string().min(3),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(4, 'Valid postal code is required'),
  contact_phone: z.string().min(8, 'Phone number is required'),
  timezone: z.string().default('Asia/Kolkata'),
});
