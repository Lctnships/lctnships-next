-- ============================================================================
-- 017_storage_insert_folder_check.sql
-- L1 from the 2026-04-11 security audit closeout.
--
-- Before: the INSERT policy on storage.objects for the "images" bucket
-- only required the caller be authenticated — it did not verify that the
-- file's first folder segment matched the caller's auth.uid(). A malicious
-- authenticated user could therefore upload objects into another user's
-- folder (e.g. user A uploading to user-B-uuid/avatar/foo.jpg), potentially
-- replacing their avatar if the application used upsert: true.
--
-- The DELETE and UPDATE policies already have the folder check; the upload
-- route also constructs file paths as `${user.id}/...`, so tightening INSERT
-- does not break any legitimate client flow. This migration simply replaces
-- the permissive INSERT policy with one that enforces the folder-prefix
-- ownership check already used by UPDATE and DELETE.
-- ============================================================================

DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;

CREATE POLICY "Users can upload images to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
