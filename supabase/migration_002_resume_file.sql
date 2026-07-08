-- Adds file attachment support to resume_versions.
-- Run once in the Supabase SQL Editor (schema.sql/policies.sql must already be applied).

alter table resume_versions add column if not exists file_path text;
alter table resume_versions add column if not exists file_name text;
