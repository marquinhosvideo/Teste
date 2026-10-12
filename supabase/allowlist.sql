-- Lista de e-mails autorizados (rode no SQL Editor do Supabase)
-- 1) Cria a tabela e o bloqueio no cadastro
-- 2) Depois INSERTE só os e-mails que você liberar

create table if not exists public.allowed_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;

-- Ninguém lê a lista pelo anon key (só o trigger/server)
drop policy if exists "allowed_emails_no_public" on public.allowed_emails;

-- Bloqueia criação de usuário se o e-mail não estiver na lista
create or replace function public.enforce_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.allowed_emails a
    where lower(a.email) = lower(new.email)
  ) then
    raise exception 'EMAIL_NAO_AUTORIZADO: este e-mail não pode se cadastrar';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_allowed_email on auth.users;
create trigger trg_enforce_allowed_email
  before insert on auth.users
  for each row
  execute function public.enforce_allowed_email();

-- RLS: só e-mails da lista acessam checks/gastos
create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_emails a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "checks_select_auth" on public.activity_checks;
drop policy if exists "checks_write_auth" on public.activity_checks;
drop policy if exists "expenses_select_auth" on public.expenses;
drop policy if exists "expenses_write_auth" on public.expenses;

create policy "checks_select_allowed" on public.activity_checks
  for select to authenticated using (public.is_allowed_user());

create policy "checks_write_allowed" on public.activity_checks
  for all to authenticated
  using (public.is_allowed_user())
  with check (public.is_allowed_user());

create policy "expenses_select_allowed" on public.expenses
  for select to authenticated using (public.is_allowed_user());

create policy "expenses_write_allowed" on public.expenses
  for all to authenticated
  using (public.is_allowed_user())
  with check (public.is_allowed_user());

-- >>> SUBSTITUA pelos seus e-mails (1 ou 2) <<<
insert into public.allowed_emails (email) values
  ('voce@email.com'),
  ('outro@email.com')
on conflict (email) do nothing;
