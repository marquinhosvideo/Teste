-- Histórico de versões do roteiro (até 5) + documento atual compartilhado
-- Rode no SQL Editor se o projeto já tinha o schema antigo.

create table if not exists public.trip_document (
  id text primary key default 'current' check (id = 'current'),
  trip jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_versions (
  id text primary key,
  created_at timestamptz not null default now(),
  reason text not null check (reason in ('import', 'reset', 'manual')),
  file_name text,
  label text not null,
  days_count integer not null default 0,
  activities_count integer not null default 0,
  tips_count integer not null default 0,
  expenses_count integer not null default 0,
  trip jsonb not null
);

create index if not exists trip_versions_created_at_idx
  on public.trip_versions (created_at desc);

alter table public.trip_document enable row level security;
alter table public.trip_versions enable row level security;

drop policy if exists "trip_document_select_auth" on public.trip_document;
drop policy if exists "trip_document_write_auth" on public.trip_document;
drop policy if exists "trip_versions_select_auth" on public.trip_versions;
drop policy if exists "trip_versions_write_auth" on public.trip_versions;

create policy "trip_document_select_auth" on public.trip_document
  for select to authenticated using (true);

create policy "trip_document_write_auth" on public.trip_document
  for all to authenticated using (true) with check (true);

create policy "trip_versions_select_auth" on public.trip_versions
  for select to authenticated using (true);

create policy "trip_versions_write_auth" on public.trip_versions
  for all to authenticated using (true) with check (true);

do $$
begin
  begin
    alter publication supabase_realtime add table public.trip_document;
  exception when duplicate_object then null;
  end;
end $$;
