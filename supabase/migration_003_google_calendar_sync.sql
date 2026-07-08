-- Adds Google Calendar one-way sync support.
-- Run once in the Supabase SQL Editor (schema.sql/policies.sql must already be applied).

create table if not exists google_calendar_connections (
  user_id uuid primary key references auth.users not null,
  calendar_id text not null,
  active boolean not null default true,
  connected_at timestamptz default now(),
  disconnected_at timestamptz
);

alter table google_calendar_connections enable row level security;
create policy "google_calendar_connections_owner_all" on google_calendar_connections
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table events add column if not exists google_event_id text;
