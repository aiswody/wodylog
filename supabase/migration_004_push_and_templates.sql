-- Adds Web Push reminders + user-defined recurring event templates.
-- Run once in the Supabase SQL Editor (schema.sql/policies.sql must already be applied).

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;
create policy "push_subscriptions_owner_all" on push_subscriptions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table events add column if not exists reminder_sent_at timestamptz;

create table if not exists event_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

alter table event_templates enable row level security;
create policy "event_templates_owner_all" on event_templates
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table if not exists event_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references event_templates on delete cascade not null,
  event_type text not null,
  day_offset integer not null default 0,
  sort_order integer not null default 0
);

alter table event_template_items enable row level security;
create policy "event_template_items_owner_all" on event_template_items
  for all
  using (exists (select 1 from event_templates t where t.id = template_id and t.user_id = auth.uid()))
  with check (exists (select 1 from event_templates t where t.id = template_id and t.user_id = auth.uid()));
