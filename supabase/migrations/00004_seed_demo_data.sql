-- ==============================================================================
-- Migration: 00004_seed_demo_data.sql
-- Description: Seed data for Green Valley Residency & Green Valley Cultural Night
-- ==============================================================================

-- 1. Insert Society
INSERT INTO societies (id, name, slug, logo_url, address, city, state, pincode, contact_phone, timezone, settings_json)
VALUES (
    'e7b1e4c2-8419-4a9c-9db8-123456789abc',
    'Green Valley Residency',
    'green-valley-residency',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&auto=format&fit=crop&q=80',
    'Plot 42, Harmony Boulevard, Phase 2',
    'Bengaluru',
    'Karnataka',
    '560100',
    '+91 98765 43210',
    'Asia/Kolkata',
    '{"max_registrations_per_user": 3, "allow_guests": true, "require_guardian_consent_under_age": 18}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Buildings
INSERT INTO buildings (id, society_id, name, code)
VALUES
    ('ba111111-1111-1111-1111-111111111111', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Tower A - Aspen', 'TA'),
    ('ba222222-2222-2222-2222-222222222222', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Tower B - Birch', 'TB'),
    ('ba333333-3333-3333-3333-333333333333', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Tower C - Cedar', 'TC')
ON CONFLICT DO NOTHING;

-- 3. Insert Units
INSERT INTO units (id, society_id, building_id, unit_number, floor)
VALUES
    ('aa111111-1111-1111-1111-111111111111', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ba111111-1111-1111-1111-111111111111', 'A-101', 1),
    ('aa222222-2222-2222-2222-222222222222', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ba111111-1111-1111-1111-111111111111', 'A-102', 1),
    ('aa333333-3333-3333-3333-333333333333', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ba111111-1111-1111-1111-111111111111', 'A-201', 2),
    ('aa444444-4444-4444-4444-444444444444', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ba222222-2222-2222-2222-222222222222', 'B-101', 1),
    ('aa555555-5555-5555-5555-555555555555', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ba333333-3333-3333-3333-333333333333', 'C-101', 1)
ON CONFLICT DO NOTHING;

-- 4. Insert Profiles
INSERT INTO profiles (id, full_name, email, phone, avatar_url, date_of_birth, gender)
VALUES
    ('ca111111-1111-1111-1111-111111111111', 'Vikram Malhotra', 'admin@greenvalley.demo', '+91 98200 11223', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', '1982-05-14', 'male'),
    ('ca222222-2222-2222-2222-222222222222', 'Ananya Sharma', 'stage@greenvalley.demo', '+91 98200 44556', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', '1988-11-20', 'female'),
    ('ca333333-3333-3333-3333-333333333333', 'Rohan Deshmukh', 'volunteer@greenvalley.demo', '+91 98200 77889', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', '1995-03-12', 'male'),
    ('ca444444-4444-4444-4444-444444444444', 'Dr. Meenakshi Iyer', 'judge@greenvalley.demo', '+91 98200 99001', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', '1975-08-30', 'female'),
    ('ca555555-5555-5555-5555-555555555555', 'Aarav Patel', 'resident@greenvalley.demo', '+91 98111 22334', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', '1990-07-22', 'male')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Memberships
INSERT INTO memberships (id, society_id, profile_id, unit_id, role, status)
VALUES
    ('da111111-1111-1111-1111-111111111111', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ca111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', 'society_admin', 'active'),
    ('da222222-2222-2222-2222-222222222222', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ca222222-2222-2222-2222-222222222222', 'aa333333-3333-3333-3333-333333333333', 'stage_manager', 'active'),
    ('da333333-3333-3333-3333-333333333333', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ca333333-3333-3333-3333-333333333333', 'aa444444-4444-4444-4444-444444444444', 'volunteer', 'active'),
    ('da444444-4444-4444-4444-444444444444', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ca444444-4444-4444-4444-444444444444', 'aa555555-5555-5555-5555-555555555555', 'judge', 'active'),
    ('da555555-5555-5555-5555-555555555555', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'ca555555-5555-5555-5555-555555555555', 'aa222222-2222-2222-2222-222222222222', 'resident', 'active')
ON CONFLICT DO NOTHING;

-- 6. Insert Categories
INSERT INTO event_categories (id, society_id, name, description, default_duration_seconds, default_transition_seconds, max_participants, requires_media, requires_judging)
VALUES
    ('fa111111-1111-1111-1111-111111111111', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Bollywood Dance', 'Solo and group choreography', 300, 60, 12, true, true),
    ('fa222222-2222-2222-2222-222222222222', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Kids Performance', 'Kids under 12 solo or duo acts', 240, 60, 6, true, true),
    ('fa333333-3333-3333-3333-333333333333', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Classical Singing & Vocal', 'Classical & semiclassical vocals', 360, 90, 3, false, true),
    ('fa444444-4444-4444-4444-444444444444', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Instrumental Music', 'Guitar, Tabla, Flute recitals', 300, 90, 4, false, true),
    ('fa555555-5555-5555-5555-555555555555', 'e7b1e4c2-8419-4a9c-9db8-123456789abc', 'Drama & Skit', 'Theatrical comedy and social skits', 480, 120, 15, true, true)
ON CONFLICT DO NOTHING;

-- 7. Insert Events
INSERT INTO events (id, society_id, name, slug, description, cover_image_url, event_type, venue, start_at, end_at, registration_open_at, registration_close_at, status, created_by)
VALUES (
    'f8c2e5d3-9520-5b0d-0ec9-234567890bcd',
    'e7b1e4c2-8419-4a9c-9db8-123456789abc',
    'Green Valley Cultural Night 2026',
    'green-valley-cultural-night-2026',
    'The premier annual cultural extravaganza of Green Valley Residency featuring dance, music, theater, kids shows, and awards!',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    'Annual Cultural Festival',
    'Society Central Amphitheatre & Clubhouse Lawn',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days 4 hours',
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '1 day',
    'live',
    'ca111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;
