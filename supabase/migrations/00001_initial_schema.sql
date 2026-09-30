-- ==============================================================================
-- Migration: 00001_initial_schema.sql
-- Description: Core Schema for SocietyStage - Cultural Event Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. SOCIETIES
CREATE TABLE IF NOT EXISTS societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    settings_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_societies_updated_at ON societies;
CREATE TRIGGER update_societies_updated_at
BEFORE UPDATE ON societies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. BUILDINGS
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_society_building_code UNIQUE(society_id, code)
);

CREATE INDEX IF NOT EXISTS idx_buildings_society_id ON buildings(society_id);

-- 3. UNITS
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_building_unit UNIQUE(building_id, unit_number)
);

CREATE INDEX IF NOT EXISTS idx_units_society_id ON units(society_id);
CREATE INDEX IF NOT EXISTS idx_units_building_id ON units(building_id);

-- 4. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. MEMBERSHIPS
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN (
        'platform_super_admin',
        'society_admin',
        'event_manager',
        'stage_manager',
        'volunteer',
        'judge',
        'resident'
    )),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_society_profile_role UNIQUE(society_id, profile_id, role)
);

CREATE INDEX IF NOT EXISTS idx_memberships_society_id ON memberships(society_id);
CREATE INDEX IF NOT EXISTS idx_memberships_profile_id ON memberships(profile_id);

DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON memberships
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. EVENTS
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_image_url TEXT,
    event_type TEXT NOT NULL DEFAULT 'cultural',
    venue TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    registration_open_at TIMESTAMPTZ NOT NULL,
    registration_close_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',
        'published',
        'registration_open',
        'registration_closed',
        'live',
        'completed',
        'archived',
        'cancelled'
    )),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    settings_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_society_event_slug UNIQUE(society_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_events_society_id ON events(society_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. EVENT_CATEGORIES
CREATE TABLE IF NOT EXISTS event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    default_duration_seconds INTEGER NOT NULL DEFAULT 300,
    default_transition_seconds INTEGER NOT NULL DEFAULT 60,
    max_participants INTEGER NOT NULL DEFAULT 10,
    requires_media BOOLEAN NOT NULL DEFAULT false,
    requires_judging BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_society ON event_categories(society_id);

-- 8. EVENT_FORMS
CREATE TABLE IF NOT EXISTS event_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forms_event_id ON event_forms(event_id);

-- 9. FORM_FIELDS
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES event_forms(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    label TEXT NOT NULL,
    field_type TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    placeholder TEXT,
    help_text TEXT,
    options_json JSONB,
    validation_json JSONB,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);

-- 10. REGISTRATIONS
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES event_categories(id) ON DELETE RESTRICT,
    submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'draft',
        'submitted',
        'under_review',
        'changes_requested',
        'approved',
        'rejected',
        'waitlisted',
        'cancelled'
    )),
    duration_seconds INTEGER NOT NULL DEFAULT 300,
    special_requirements TEXT,
    admin_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_submitter ON registrations(submitted_by);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. REGISTRATION_MEMBERS
CREATE TABLE IF NOT EXISTS registration_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    age INTEGER,
    role_in_performance TEXT NOT NULL,
    guardian_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guardian_consent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_members_reg_id ON registration_members(registration_id);

-- 12. REGISTRATION_ANSWERS
CREATE TABLE IF NOT EXISTS registration_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_answers_reg_id ON registration_answers(registration_id);

-- 13. MEDIA_ASSETS
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'audio', 'video', 'document')),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    duration_seconds INTEGER,
    visibility TEXT NOT NULL DEFAULT 'event_admins' CHECK (visibility IN ('private', 'participants', 'event_admins', 'event_public')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_registration ON media_assets(registration_id);
CREATE INDEX IF NOT EXISTS idx_media_event ON media_assets(event_id);

-- 14. PERFORMANCES
CREATE TABLE IF NOT EXISTS performances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    performance_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES event_categories(id) ON DELETE RESTRICT,
    duration_seconds INTEGER NOT NULL DEFAULT 300,
    transition_seconds INTEGER NOT NULL DEFAULT 60,
    equipment_notes TEXT,
    stage_notes TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued',
        'checked_in',
        'ready',
        'on_stage',
        'completed',
        'no_show',
        'cancelled',
        'delayed'
    )),
    scheduled_start_at TIMESTAMPTZ,
    scheduled_end_at TIMESTAMPTZ,
    actual_start_at TIMESTAMPTZ,
    actual_end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performances_event ON performances(event_id);
CREATE INDEX IF NOT EXISTS idx_performances_status ON performances(status);
CREATE INDEX IF NOT EXISTS idx_performances_number ON performances(event_id, performance_number);

DROP TRIGGER IF EXISTS update_performances_updated_at ON performances;
CREATE TRIGGER update_performances_updated_at
BEFORE UPDATE ON performances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. SCHEDULE_ITEMS
CREATE TABLE IF NOT EXISTS schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    scheduled_start_at TIMESTAMPTZ NOT NULL,
    scheduled_end_at TIMESTAMPTZ NOT NULL,
    buffer_seconds INTEGER NOT NULL DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_event_performance_schedule UNIQUE(event_id, performance_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_items_event ON schedule_items(event_id, sequence_number);

DROP TRIGGER IF EXISTS update_schedule_items_updated_at ON schedule_items;
CREATE TRIGGER update_schedule_items_updated_at
BEFORE UPDATE ON schedule_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. CHECKINS
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    checked_in_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'partial', 'absent')),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_checkins_performance ON checkins(performance_id);

-- 17. VOLUNTEERS
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    responsibility TEXT NOT NULL,
    area TEXT NOT NULL,
    shift_start TIMESTAMPTZ,
    shift_end TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'absent')),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_volunteers_event ON volunteers(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_profile ON volunteers(profile_id);

-- 18. JUDGES
CREATE TABLE IF NOT EXISTS judges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_event_judge UNIQUE(event_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_judges_event ON judges(event_id);

-- 19. SCORECARDS
CREATE TABLE IF NOT EXISTS scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    criteria_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. SCORES
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scorecard_id UUID NOT NULL REFERENCES scorecards(id) ON DELETE CASCADE,
    score_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    comments TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_judge_performance_score UNIQUE(performance_id, judge_id, scorecard_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_performance ON scores(performance_id);

-- 21. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    announcement_type TEXT NOT NULL DEFAULT 'general' CHECK (announcement_type IN ('general', 'urgent', 'stage_call', 'schedule_change', 'results')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_event ON announcements(event_id);

-- 22. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    recipient_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data_json JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_profile_id, read_at);

-- 23. DEVICE_TOKENS
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
    push_token TEXT NOT NULL,
    device_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_device_token UNIQUE(profile_id, push_token)
);

-- 24. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    actor_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    before_json JSONB,
    after_json JSONB,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_society ON audit_logs(society_id, created_at DESC);
