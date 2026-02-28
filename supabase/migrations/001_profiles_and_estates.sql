-- ============================================
-- EstateIQ: Profiles & Estates Schema
-- ============================================

-- 1. Profiles table (auto-created on signup)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Estates table (stores triage data from intake)
create table public.estates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  state_of_residence text not null,
  county text,
  date_of_death date,
  total_value numeric not null default 0,
  legal_path text not null check (legal_path in ('no-probate', 'small-estate', 'formal-probate')),
  executor_role text not null check (executor_role in ('executor', 'administrator')),
  has_will boolean not null default false,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  intake_data jsonb not null default '{}',
  urgent_tasks jsonb not null default '[]',
  immediate_tasks jsonb not null default '[]',
  short_term_tasks jsonb not null default '[]',
  long_term_tasks jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Indexes
create index estates_user_id_idx on public.estates(user_id);

-- 4. Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger estates_updated_at
  before update on public.estates
  for each row execute function public.handle_updated_at();

-- 5. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Row-Level Security
alter table public.profiles enable row level security;
alter table public.estates enable row level security;

-- Profiles: users can only read/update their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Estates: users can only CRUD their own estates
create policy "Users can view own estates"
  on public.estates for select
  using (auth.uid() = user_id);

create policy "Users can insert own estates"
  on public.estates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own estates"
  on public.estates for update
  using (auth.uid() = user_id);

create policy "Users can delete own estates"
  on public.estates for delete
  using (auth.uid() = user_id);
