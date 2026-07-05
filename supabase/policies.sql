-- Wodylog RLS policies
-- Run after schema.sql. One "for all" policy per table is enough here:
-- `using` gates select/update/delete, `with check` gates insert/update.

alter table applications enable row level security;
create policy "applications_owner_all" on applications
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table resume_versions enable row level security;
create policy "resume_versions_owner_all" on resume_versions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- events has no user_id of its own, so gate via the parent application.
alter table events enable row level security;
create policy "events_owner_all" on events
  for all
  using (
    exists (select 1 from applications a
            where a.id = events.application_id and a.user_id = auth.uid())
  )
  with check (
    exists (select 1 from applications a
            where a.id = events.application_id and a.user_id = auth.uid())
  );

-- application_resumes also checks the resume version's owner, as
-- defense-in-depth against cross-account linking.
alter table application_resumes enable row level security;
create policy "application_resumes_owner_all" on application_resumes
  for all
  using (
    exists (select 1 from applications a
            where a.id = application_resumes.application_id and a.user_id = auth.uid())
  )
  with check (
    exists (select 1 from applications a
            where a.id = application_resumes.application_id and a.user_id = auth.uid())
    and exists (select 1 from resume_versions r
                where r.id = application_resumes.resume_version_id and r.user_id = auth.uid())
  );
