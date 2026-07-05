-- Wodylog schema
-- Run this once in the Supabase SQL Editor, then run policies.sql.

-- 1. 지원 회사 (Application)
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  company_name text not null,
  position text,
  platform text,               -- 원티드/잡코리아/사람인/자체홈페이지/기타
  status text default '지원완료', -- 지원완료/서류합격/코테대기/면접대기/최종합격/탈락
  applied_date date,
  memo text,
  created_at timestamptz default now()
);

-- 2. 일정 (Event) - Application에 종속된 1:N
create table events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  event_type text not null,    -- 서류마감/코딩테스트/1차면접/2차면접/최종면접/결과발표
  event_date timestamptz not null,
  location text,
  is_completed boolean default false,
  memo text,
  created_at timestamptz default now()
);

-- 3. 자소서 버전 (Resume Version)
create table resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  version_name text not null,
  content text,
  created_at timestamptz default now()
);

-- 4. 지원-자소서 매칭 (N:M)
create table application_resumes (
  application_id uuid references applications(id) on delete cascade,
  resume_version_id uuid references resume_versions(id) on delete cascade,
  primary key (application_id, resume_version_id)
);
