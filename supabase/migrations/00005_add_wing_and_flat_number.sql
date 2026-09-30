-- 00005_add_wing_and_flat_number.sql
-- Add wing and flat_number columns to registrations and registration_members for resident identification

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS wing TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS flat_number TEXT;

ALTER TABLE registration_members ADD COLUMN IF NOT EXISTS wing TEXT;
ALTER TABLE registration_members ADD COLUMN IF NOT EXISTS flat_number TEXT;

-- Index for searching/filtering by flat and wing
CREATE INDEX IF NOT EXISTS idx_registrations_wing_flat ON registrations(wing, flat_number);

-- Populate existing seed data with wing and flat numbers
UPDATE registrations SET wing = 'Wing A', flat_number = 'A-102' WHERE wing IS NULL AND title ILIKE '%Group Dance%';
UPDATE registrations SET wing = 'Wing A', flat_number = 'A-101' WHERE wing IS NULL AND title ILIKE '%Welcome Dance%';
UPDATE registrations SET wing = 'Wing B', flat_number = 'B-101' WHERE wing IS NULL AND title ILIKE '%Kids Solo%';
UPDATE registrations SET wing = 'Wing C', flat_number = 'C-101' WHERE wing IS NULL AND title ILIKE '%Classical Singing%';
UPDATE registrations SET wing = 'Wing B', flat_number = 'B-202' WHERE wing IS NULL AND title ILIKE '%Acoustic Guitar%';
UPDATE registrations SET wing = 'Wing A', flat_number = 'A-201' WHERE wing IS NULL AND title ILIKE '%Comedy%';
UPDATE registrations SET wing = 'Wing A', flat_number = 'A-301' WHERE wing IS NULL AND title ILIKE '%Bollywood Dance%';
UPDATE registrations SET wing = 'Wing C', flat_number = 'C-201' WHERE wing IS NULL AND title ILIKE '%Poetry%';
UPDATE registrations SET wing = 'Wing B', flat_number = 'B-301' WHERE wing IS NULL AND title ILIKE '%Little Champions%';
UPDATE registrations SET wing = 'Wing A', flat_number = 'A-401' WHERE wing IS NULL AND title ILIKE '%Drama%';
UPDATE registrations SET wing = 'Wing C', flat_number = 'C-302' WHERE wing IS NULL AND title ILIKE '%Couple Dance%';
UPDATE registrations SET wing = 'Wing B', flat_number = 'B-402' WHERE wing IS NULL AND title ILIKE '%Melodies of the 90s%';
UPDATE registrations SET wing = 'Wing C', flat_number = 'C-401' WHERE wing IS NULL AND title ILIKE '%Fashion Show%';
UPDATE registrations SET wing = 'Wing B', flat_number = 'B-503' WHERE wing IS NULL AND title ILIKE '%Flute%';
UPDATE registrations SET wing = 'Wing A', flat_number = 'A-501' WHERE wing IS NULL;
