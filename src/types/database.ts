export type Role =
  | 'platform_super_admin'
  | 'society_admin'
  | 'event_manager'
  | 'stage_manager'
  | 'volunteer'
  | 'judge'
  | 'resident';

export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'removed';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'registration_closed'
  | 'live'
  | 'completed'
  | 'archived'
  | 'cancelled';

export type RegistrationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'waitlisted'
  | 'cancelled';

export type PerformanceStatus =
  | 'queued'
  | 'checked_in'
  | 'ready'
  | 'on_stage'
  | 'completed'
  | 'no_show'
  | 'cancelled'
  | 'delayed';

export type MediaType = 'image' | 'audio' | 'video' | 'document';

export type MediaVisibility = 'private' | 'participants' | 'event_admins' | 'event_public';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'audio'
  | 'video'
  | 'image';

export interface Society {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_phone: string;
  timezone: string;
  settings_json?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  society_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Unit {
  id: string;
  society_id: string;
  building_id: string;
  unit_number: string;
  floor: number;
  created_at: string;
  building?: Building;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  society_id: string;
  profile_id: string;
  unit_id?: string | null;
  role: Role;
  status: MembershipStatus;
  joined_at: string;
  created_at: string;
  updated_at: string;
  society?: Society;
  profile?: Profile;
  unit?: Unit;
}

export interface EventCategory {
  id: string;
  society_id: string;
  name: string;
  description?: string | null;
  default_duration_seconds: number;
  default_transition_seconds: number;
  max_participants: number;
  requires_media: boolean;
  requires_judging: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  society_id: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url?: string | null;
  event_type: string;
  venue: string;
  start_at: string;
  end_at: string;
  registration_open_at: string;
  registration_close_at: string;
  status: EventStatus;
  created_by?: string;
  settings_json?: {
    max_registrations_per_user?: number;
    allow_guests?: boolean;
    require_guardian_consent_under_age?: number;
    rules_and_guidelines?: string;
    media_limits_mb?: {
      image: number;
      audio: number;
      video: number;
      document: number;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface EventForm {
  id: string;
  event_id: string;
  title: string;
  description?: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
  fields?: FormField[];
}

export interface FormField {
  id: string;
  form_id: string;
  field_key: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  placeholder?: string | null;
  help_text?: string | null;
  options_json?: Array<{ label: string; value: string }> | null;
  validation_json?: Record<string, any> | null;
  display_order: number;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  category_id: string;
  submitted_by: string;
  title: string;
  wing?: string | null;
  flat_number?: string | null;
  status: RegistrationStatus;
  duration_seconds: number;
  special_requirements?: string | null;
  admin_notes?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
  category?: EventCategory;
  submitter?: Profile;
  members?: RegistrationMember[];
  answers?: RegistrationAnswer[];
  media?: MediaAsset[];
  performance?: Performance;
}

export interface RegistrationMember {
  id: string;
  registration_id: string;
  profile_id?: string | null;
  display_name: string;
  wing?: string | null;
  flat_number?: string | null;
  age?: number | null;
  role_in_performance: string;
  guardian_profile_id?: string | null;
  guardian_consent: boolean;
  created_at: string;
  profile?: Profile;
}

export interface RegistrationAnswer {
  id: string;
  registration_id: string;
  field_id: string;
  answer_text?: string | null;
  answer_json?: any;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  society_id: string;
  event_id: string;
  registration_id?: string | null;
  uploaded_by: string;
  media_type: MediaType;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  duration_seconds?: number | null;
  visibility: MediaVisibility;
  created_at: string;
  public_url?: string;
}

export interface Performance {
  id: string;
  event_id: string;
  registration_id: string;
  performance_number: number;
  title: string;
  category_id: string;
  duration_seconds: number;
  transition_seconds: number;
  equipment_notes?: string | null;
  stage_notes?: string | null;
  status: PerformanceStatus;
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  actual_start_at?: string | null;
  actual_end_at?: string | null;
  created_at: string;
  updated_at: string;
  category?: EventCategory;
  registration?: Registration;
  checkins?: Checkin[];
}

export interface ScheduleItem {
  id: string;
  event_id: string;
  performance_id: string;
  sequence_number: number;
  scheduled_start_at: string;
  scheduled_end_at: string;
  buffer_seconds: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  performance?: Performance;
}

export interface Checkin {
  id: string;
  event_id: string;
  performance_id: string;
  profile_id?: string | null;
  checked_in_by: string;
  checked_in_at: string;
  status: 'present' | 'partial' | 'absent';
  notes?: string | null;
  checker?: Profile;
}

export interface Volunteer {
  id: string;
  event_id: string;
  profile_id: string;
  responsibility: string; // e.g. Gate, Check-in, Backstage, Stage, Kids, Sound, Photography, Green Room, Refreshments
  area: string;
  shift_start?: string | null;
  shift_end?: string | null;
  status: 'assigned' | 'active' | 'completed' | 'absent';
  notes?: string | null;
  profile?: Profile;
}

export interface Judge {
  id: string;
  event_id: string;
  profile_id: string;
  assigned_categories: string[];
  created_at: string;
  profile?: Profile;
}

export interface ScoringCriterion {
  id: string;
  name: string;
  description?: string;
  max_score: number;
  weight?: number;
}

export interface Scorecard {
  id: string;
  event_id: string;
  category_id: string;
  name: string;
  criteria_json: ScoringCriterion[];
  max_score: number;
  created_at: string;
  category?: EventCategory;
}

export interface Score {
  id: string;
  event_id: string;
  performance_id: string;
  judge_id: string;
  scorecard_id: string;
  score_json: Record<string, number>;
  total_score: number;
  comments?: string | null;
  submitted_at: string;
  judge?: Profile;
}

export interface Announcement {
  id: string;
  event_id: string;
  created_by: string;
  title: string;
  message: string;
  announcement_type: 'general' | 'urgent' | 'stage_call' | 'schedule_change' | 'results';
  sent_at: string;
  created_at: string;
  author?: Profile;
}

export interface Notification {
  id: string;
  society_id: string;
  event_id?: string | null;
  recipient_profile_id: string;
  type: string;
  title: string;
  body: string;
  data_json?: Record<string, any> | null;
  read_at?: string | null;
  created_at: string;
}

export interface DeviceToken {
  id: string;
  profile_id: string;
  platform: 'web' | 'ios' | 'android';
  push_token: string;
  device_id: string;
  is_active: boolean;
  last_seen_at: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  society_id: string;
  actor_profile_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_json?: any;
  after_json?: any;
  ip_hash?: string | null;
  user_agent?: string | null;
  created_at: string;
  actor?: Profile;
}
