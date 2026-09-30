-- ==============================================================================
-- Migration: 00002_rls_policies.sql
-- Description: Row Level Security (RLS) Policies & RBAC Helper Functions
-- ==============================================================================

-- Helper function: Get profile ID for current auth user
CREATE OR REPLACE FUNCTION get_auth_profile_id()
RETURNS UUID AS $$
    SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check if current user is platform super admin
CREATE OR REPLACE FUNCTION is_platform_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM memberships m
        JOIN profiles p ON p.id = m.profile_id
        WHERE p.auth_user_id = auth.uid()
        AND m.role = 'platform_super_admin'
        AND m.status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check society membership
CREATE OR REPLACE FUNCTION is_society_member(target_society_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM memberships m
        JOIN profiles p ON p.id = m.profile_id
        WHERE p.auth_user_id = auth.uid()
        AND m.society_id = target_society_id
        AND m.status = 'active'
    ) OR is_platform_super_admin();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check specific role in society
CREATE OR REPLACE FUNCTION has_society_role(target_society_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM memberships m
        JOIN profiles p ON p.id = m.profile_id
        WHERE p.auth_user_id = auth.uid()
        AND m.society_id = target_society_id
        AND m.role = ANY(allowed_roles)
        AND m.status = 'active'
    ) OR is_platform_super_admin();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ENABLE RLS ON ALL TABLES
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Public or authenticated users can view basic profiles" ON profiles;
CREATE POLICY "Public or authenticated users can view basic profiles"
ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- 2. SOCIETIES POLICIES
DROP POLICY IF EXISTS "Society members or platform admins can view society" ON societies;
CREATE POLICY "Society members or platform admins can view society"
ON societies FOR SELECT USING (is_society_member(id));

DROP POLICY IF EXISTS "Society admins can update their society" ON societies;
CREATE POLICY "Society admins can update their society"
ON societies FOR UPDATE USING (has_society_role(id, ARRAY['society_admin']));

DROP POLICY IF EXISTS "Platform admins or verified users can insert society" ON societies;
CREATE POLICY "Platform admins or verified users can insert society"
ON societies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. BUILDINGS & UNITS POLICIES
DROP POLICY IF EXISTS "Society members can view buildings" ON buildings;
CREATE POLICY "Society members can view buildings"
ON buildings FOR SELECT USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can manage buildings" ON buildings;
CREATE POLICY "Admins can manage buildings"
ON buildings FOR ALL USING (has_society_role(society_id, ARRAY['society_admin']));

DROP POLICY IF EXISTS "Society members can view units" ON units;
CREATE POLICY "Society members can view units"
ON units FOR SELECT USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can manage units" ON units;
CREATE POLICY "Admins can manage units"
ON units FOR ALL USING (has_society_role(society_id, ARRAY['society_admin']));

-- 4. MEMBERSHIPS POLICIES
DROP POLICY IF EXISTS "Society members can view memberships in their society" ON memberships;
CREATE POLICY "Society members can view memberships in their society"
ON memberships FOR SELECT USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can insert and manage memberships" ON memberships;
CREATE POLICY "Admins can insert and manage memberships"
ON memberships FOR ALL USING (has_society_role(society_id, ARRAY['society_admin']));

-- 5. EVENTS POLICIES
DROP POLICY IF EXISTS "Society members can view published or live events" ON events;
CREATE POLICY "Society members can view published or live events"
ON events FOR SELECT USING (
    is_society_member(society_id) AND (
        status IN ('published', 'registration_open', 'registration_closed', 'live', 'completed', 'archived')
        OR has_society_role(society_id, ARRAY['society_admin', 'event_manager', 'stage_manager'])
    )
);

DROP POLICY IF EXISTS "Admins and event managers can manage events" ON events;
CREATE POLICY "Admins and event managers can manage events"
ON events FOR ALL USING (has_society_role(society_id, ARRAY['society_admin', 'event_manager']));

-- 6. EVENT CATEGORIES & FORMS
DROP POLICY IF EXISTS "Members can view event categories" ON event_categories;
CREATE POLICY "Members can view event categories"
ON event_categories FOR SELECT USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can manage categories" ON event_categories;
CREATE POLICY "Admins can manage categories"
ON event_categories FOR ALL USING (has_society_role(society_id, ARRAY['society_admin', 'event_manager']));

DROP POLICY IF EXISTS "Members can view active forms" ON event_forms;
CREATE POLICY "Members can view active forms"
ON event_forms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage forms" ON event_forms;
CREATE POLICY "Admins can manage forms"
ON event_forms FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_forms.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

DROP POLICY IF EXISTS "Members can view form fields" ON form_fields;
CREATE POLICY "Members can view form fields"
ON form_fields FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage form fields" ON form_fields;
CREATE POLICY "Admins can manage form fields"
ON form_fields FOR ALL USING (
    EXISTS (SELECT 1 FROM event_forms ef JOIN events e ON e.id = ef.event_id WHERE ef.id = form_fields.form_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

-- 7. REGISTRATIONS & DETAILS
DROP POLICY IF EXISTS "Submitter or admins can view registrations" ON registrations;
CREATE POLICY "Submitter or admins can view registrations"
ON registrations FOR SELECT USING (
    submitted_by = get_auth_profile_id()
    OR EXISTS (SELECT 1 FROM events e WHERE e.id = registrations.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager', 'stage_manager', 'volunteer', 'judge']))
);

DROP POLICY IF EXISTS "Members can submit registration" ON registrations;
CREATE POLICY "Members can submit registration"
ON registrations FOR INSERT WITH CHECK (
    submitted_by = get_auth_profile_id()
    AND EXISTS (SELECT 1 FROM events e WHERE e.id = registrations.event_id AND is_society_member(e.society_id))
);

DROP POLICY IF EXISTS "Submitters can update draft registrations; Admins can update status" ON registrations;
CREATE POLICY "Submitters can update draft registrations; Admins can update status"
ON registrations FOR UPDATE USING (
    (submitted_by = get_auth_profile_id() AND status IN ('draft', 'submitted', 'changes_requested'))
    OR EXISTS (SELECT 1 FROM events e WHERE e.id = registrations.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

DROP POLICY IF EXISTS "Registration members view policy" ON registration_members;
CREATE POLICY "Registration members view policy"
ON registration_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM registrations r WHERE r.id = registration_members.registration_id AND (
        r.submitted_by = get_auth_profile_id()
        OR EXISTS (SELECT 1 FROM events e WHERE e.id = r.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager', 'stage_manager']))
    ))
);

DROP POLICY IF EXISTS "Registration members insert/update policy" ON registration_members;
CREATE POLICY "Registration members insert/update policy"
ON registration_members FOR ALL USING (
    EXISTS (SELECT 1 FROM registrations r WHERE r.id = registration_members.registration_id AND (
        r.submitted_by = get_auth_profile_id()
        OR EXISTS (SELECT 1 FROM events e WHERE e.id = r.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
    ))
);

DROP POLICY IF EXISTS "Registration answers policy" ON registration_answers;
CREATE POLICY "Registration answers policy"
ON registration_answers FOR ALL USING (
    EXISTS (SELECT 1 FROM registrations r WHERE r.id = registration_answers.registration_id AND (
        r.submitted_by = get_auth_profile_id()
        OR EXISTS (SELECT 1 FROM events e WHERE e.id = r.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
    ))
);

-- 8. MEDIA ASSETS
DROP POLICY IF EXISTS "Media assets select policy" ON media_assets;
CREATE POLICY "Media assets select policy"
ON media_assets FOR SELECT USING (
    visibility = 'event_public'
    OR uploaded_by = get_auth_profile_id()
    OR (is_society_member(society_id) AND visibility = 'participants')
    OR has_society_role(society_id, ARRAY['society_admin', 'event_manager', 'stage_manager'])
);

DROP POLICY IF EXISTS "Media assets insert policy" ON media_assets;
CREATE POLICY "Media assets insert policy"
ON media_assets FOR INSERT WITH CHECK (
    uploaded_by = get_auth_profile_id()
    AND is_society_member(society_id)
);

DROP POLICY IF EXISTS "Media assets delete policy" ON media_assets;
CREATE POLICY "Media assets delete policy"
ON media_assets FOR DELETE USING (
    uploaded_by = get_auth_profile_id()
    OR has_society_role(society_id, ARRAY['society_admin', 'event_manager'])
);

-- 9. PERFORMANCES & SCHEDULE
DROP POLICY IF EXISTS "Performances select policy" ON performances;
CREATE POLICY "Performances select policy"
ON performances FOR SELECT USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = performances.event_id AND is_society_member(e.society_id))
);

DROP POLICY IF EXISTS "Performances management policy" ON performances;
CREATE POLICY "Performances management policy"
ON performances FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = performances.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager', 'stage_manager']))
);

DROP POLICY IF EXISTS "Schedule items select policy" ON schedule_items;
CREATE POLICY "Schedule items select policy"
ON schedule_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = schedule_items.event_id AND is_society_member(e.society_id))
);

DROP POLICY IF EXISTS "Schedule items management policy" ON schedule_items;
CREATE POLICY "Schedule items management policy"
ON schedule_items FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = schedule_items.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager', 'stage_manager']))
);

-- 10. CHECKINS & VOLUNTEERS
DROP POLICY IF EXISTS "Checkins select policy" ON checkins;
CREATE POLICY "Checkins select policy"
ON checkins FOR SELECT USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = checkins.event_id AND is_society_member(e.society_id))
);

DROP POLICY IF EXISTS "Checkins mutation policy" ON checkins;
CREATE POLICY "Checkins mutation policy"
ON checkins FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = checkins.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager', 'stage_manager', 'volunteer']))
);

DROP POLICY IF EXISTS "Volunteers view policy" ON volunteers;
CREATE POLICY "Volunteers view policy"
ON volunteers FOR SELECT USING (
    profile_id = get_auth_profile_id()
    OR EXISTS (SELECT 1 FROM events e WHERE e.id = volunteers.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager', 'stage_manager']))
);

DROP POLICY IF EXISTS "Volunteers manage policy" ON volunteers;
CREATE POLICY "Volunteers manage policy"
ON volunteers FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = volunteers.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

-- 11. JUDGES & SCORING
DROP POLICY IF EXISTS "Judges view policy" ON judges;
CREATE POLICY "Judges view policy"
ON judges FOR SELECT USING (
    profile_id = get_auth_profile_id()
    OR EXISTS (SELECT 1 FROM events e WHERE e.id = judges.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

DROP POLICY IF EXISTS "Judges manage policy" ON judges;
CREATE POLICY "Judges manage policy"
ON judges FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = judges.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

DROP POLICY IF EXISTS "Scorecards view policy" ON scorecards;
CREATE POLICY "Scorecards view policy"
ON scorecards FOR SELECT USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = scorecards.event_id AND (
        has_society_role(e.society_id, ARRAY['society_admin', 'event_manager'])
        OR EXISTS (SELECT 1 FROM judges j WHERE j.event_id = e.id AND j.profile_id = get_auth_profile_id())
    ))
);

DROP POLICY IF EXISTS "Scores view policy" ON scores;
CREATE POLICY "Scores view policy"
ON scores FOR SELECT USING (
    judge_id = get_auth_profile_id()
    OR EXISTS (SELECT 1 FROM events e WHERE e.id = scores.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

DROP POLICY IF EXISTS "Scores insert/update policy" ON scores;
CREATE POLICY "Scores insert/update policy"
ON scores FOR ALL USING (
    judge_id = get_auth_profile_id()
    OR EXISTS (SELECT 1 FROM events e WHERE e.id = scores.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager']))
);

-- 12. ANNOUNCEMENTS & NOTIFICATIONS
DROP POLICY IF EXISTS "Announcements view policy" ON announcements;
CREATE POLICY "Announcements view policy"
ON announcements FOR SELECT USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = announcements.event_id AND is_society_member(e.society_id))
);

DROP POLICY IF EXISTS "Announcements manage policy" ON announcements;
CREATE POLICY "Announcements manage policy"
ON announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = announcements.event_id AND has_society_role(e.society_id, ARRAY['society_admin', 'event_manager', 'stage_manager']))
);

DROP POLICY IF EXISTS "Notifications select policy" ON notifications;
CREATE POLICY "Notifications select policy"
ON notifications FOR SELECT USING (recipient_profile_id = get_auth_profile_id());

DROP POLICY IF EXISTS "Notifications update policy" ON notifications;
CREATE POLICY "Notifications update policy"
ON notifications FOR UPDATE USING (recipient_profile_id = get_auth_profile_id());

DROP POLICY IF EXISTS "Notifications insert policy" ON notifications;
CREATE POLICY "Notifications insert policy"
ON notifications FOR INSERT WITH CHECK (
    has_society_role(society_id, ARRAY['society_admin', 'event_manager', 'stage_manager'])
    OR is_platform_super_admin()
);

-- 13. DEVICE TOKENS & AUDIT LOGS
DROP POLICY IF EXISTS "Device tokens policy" ON device_tokens;
CREATE POLICY "Device tokens policy"
ON device_tokens FOR ALL USING (profile_id = get_auth_profile_id());

DROP POLICY IF EXISTS "Audit logs view policy" ON audit_logs;
CREATE POLICY "Audit logs view policy"
ON audit_logs FOR SELECT USING (has_society_role(society_id, ARRAY['society_admin']));

DROP POLICY IF EXISTS "Audit logs insert policy" ON audit_logs;
CREATE POLICY "Audit logs insert policy"
ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
