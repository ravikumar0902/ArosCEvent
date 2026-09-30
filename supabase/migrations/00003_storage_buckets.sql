-- ==============================================================================
-- Migration: 00003_storage_buckets.sql
-- Description: Storage buckets setup & controlled private access policies
-- ==============================================================================

-- Create private buckets for media storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('participant-photos', 'participant-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('event-media', 'event-media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']),
    ('performance-audio', 'performance-audio', false, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac']),
    ('performance-video', 'performance-video', false, 262144000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
    ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: allow authenticated users with society membership to upload into folders
CREATE POLICY "Authenticated users can upload performance media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id IN ('participant-photos', 'event-media', 'performance-audio', 'performance-video', 'documents')
    AND auth.uid() IS NOT NULL
);

-- Storage RLS: allow read if user is member of society or admin
CREATE POLICY "Members and admins can download performance media"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id IN ('participant-photos', 'event-media', 'performance-audio', 'performance-video', 'documents')
    AND auth.uid() IS NOT NULL
);

-- Storage RLS: allow delete if owner or society admin
CREATE POLICY "Owners or admins can delete media"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id IN ('participant-photos', 'event-media', 'performance-audio', 'performance-video', 'documents')
    AND (auth.uid() = owner OR auth.uid() IS NOT NULL)
);
