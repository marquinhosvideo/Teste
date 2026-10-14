-- Segurança adicional para o app da família.
-- Rode UMA VEZ no SQL Editor depois de schema.sql / trip_versions.sql.
--
-- Usa a MESMA allowlist de supabase/allowlist.sql e VITE_ALLOWED_EMAILS.
-- Preencha explicitamente só com os familiares autorizados antes de rodar.

create table if not exists public.allowed_emails (
  email text primary key check (email = lower(trim(email))),
  created_at timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;
revoke all on table public.allowed_emails from public, anon, authenticated;

create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.allowed_emails allowed
    where lower(trim(allowed.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

revoke all on function public.is_allowed_user() from public, anon;
grant execute on function public.is_allowed_user() to authenticated;

create or replace function public.enforce_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.allowed_emails allowed
    where lower(trim(allowed.email)) = lower(trim(new.email))
  ) then
    raise exception 'EMAIL_NAO_AUTORIZADO: este e-mail não pode se cadastrar';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_allowed_email() from public, anon, authenticated;

drop trigger if exists trg_enforce_allowed_email on auth.users;
create trigger trg_enforce_allowed_email
  before insert on auth.users
  for each row
  execute function public.enforce_allowed_email();

drop policy if exists "checks_select_auth" on public.activity_checks;
drop policy if exists "checks_write_auth" on public.activity_checks;
drop policy if exists "expenses_select_auth" on public.expenses;
drop policy if exists "expenses_write_auth" on public.expenses;
drop policy if exists "trip_document_select_auth" on public.trip_document;
drop policy if exists "trip_document_write_auth" on public.trip_document;
drop policy if exists "trip_versions_select_auth" on public.trip_versions;
drop policy if exists "trip_versions_write_auth" on public.trip_versions;
drop policy if exists "checks_select_family" on public.activity_checks;
drop policy if exists "checks_write_family" on public.activity_checks;
drop policy if exists "expenses_select_family" on public.expenses;
drop policy if exists "expenses_write_family" on public.expenses;
drop policy if exists "trip_document_select_family" on public.trip_document;
drop policy if exists "trip_document_write_family" on public.trip_document;
drop policy if exists "trip_versions_select_family" on public.trip_versions;
drop policy if exists "trip_versions_write_family" on public.trip_versions;

create policy "checks_select_family" on public.activity_checks
  for select to authenticated
  using ((select public.is_allowed_user()));

create policy "checks_write_family" on public.activity_checks
  for all to authenticated
  using ((select public.is_allowed_user()))
  with check ((select public.is_allowed_user()));

create policy "expenses_select_family" on public.expenses
  for select to authenticated
  using ((select public.is_allowed_user()));

create policy "expenses_write_family" on public.expenses
  for all to authenticated
  using ((select public.is_allowed_user()))
  with check ((select public.is_allowed_user()));

create policy "trip_document_select_family" on public.trip_document
  for select to authenticated
  using ((select public.is_allowed_user()));

create policy "trip_document_write_family" on public.trip_document
  for all to authenticated
  using ((select public.is_allowed_user()))
  with check ((select public.is_allowed_user()));

create policy "trip_versions_select_family" on public.trip_versions
  for select to authenticated
  using ((select public.is_allowed_user()));

create policy "trip_versions_write_family" on public.trip_versions
  for all to authenticated
  using ((select public.is_allowed_user()))
  with check ((select public.is_allowed_user()));

-- Limites de abuso: impedem payloads gigantes e valores financeiros absurdos.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trip_document_payload_limit'
  ) then
    alter table public.trip_document
      add constraint trip_document_payload_limit
      check (octet_length(trip::text) <= 5242880);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_versions_payload_limit'
  ) then
    alter table public.trip_versions
      add constraint trip_versions_payload_limit
      check (octet_length(trip::text) <= 5242880);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'expenses_input_limits'
  ) then
    alter table public.expenses
      add constraint expenses_input_limits
      check (
        amount <= 1000000
        and char_length(id) <= 200
        and char_length(day_id) <= 200
        and char_length(description) between 1 and 500
      );
  end if;
end $$;

-- Para autorizar manualmente outro familiar no futuro:
-- insert into public.allowed_emails (email)
-- values ('pessoa@exemplo.com')
-- on conflict (email) do nothing;
