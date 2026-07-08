-- Resume file storage bucket + RLS.
-- Run once in the Supabase SQL Editor, after migration_002_resume_file.sql.

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Files are stored at {user_id}/{resume_version_id}.{ext}; RLS restricts
-- access to files under the caller's own user_id folder.
create policy "resumes_bucket_owner_all" on storage.objects
  for all
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
