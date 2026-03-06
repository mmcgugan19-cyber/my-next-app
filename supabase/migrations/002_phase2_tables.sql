-- ============================================
-- EstateIQ Phase 2: Assets, Debts, Beneficiaries, Documents
-- ============================================

-- 1. Assets table
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  estate_id uuid not null references public.estates(id) on delete cascade,
  category text not null check (category in ('real_estate', 'financial', 'digital', 'vehicle', 'personal_property')),
  name text not null,
  description text,
  estimated_value numeric not null default 0,
  ownership_type text check (ownership_type in ('sole', 'joint', 'trust', 'beneficiary')),
  account_number text,
  institution text,
  status text not null default 'identified' check (status in ('identified', 'valued', 'claimed', 'transferred', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Debts table
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  estate_id uuid not null references public.estates(id) on delete cascade,
  category text not null check (category in ('funeral', 'medical', 'credit_card', 'mortgage', 'utilities', 'taxes', 'other')),
  creditor text not null,
  amount numeric not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'disputed', 'negotiating', 'forgiven')),
  due_date date,
  account_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Beneficiaries table
create table public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  estate_id uuid not null references public.estates(id) on delete cascade,
  name text not null,
  relationship text not null,
  share_percentage numeric,
  share_description text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Documents table (metadata only, no file storage)
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  estate_id uuid not null references public.estates(id) on delete cascade,
  doc_type text not null check (doc_type in ('death_certificate', 'will', 'trust', 'deed', 'title', 'insurance_policy', 'bank_statement', 'tax_return', 'court_filing', 'letters_of_office', 'affidavit', 'other')),
  name text not null,
  status text not null default 'needed' check (status in ('needed', 'obtained', 'filed', 'not_applicable')),
  copies_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Add legal authority tracking to estates
alter table public.estates add column if not exists legal_authority jsonb not null default '{}';

-- 6. Indexes
create index assets_estate_id_idx on public.assets(estate_id);
create index debts_estate_id_idx on public.debts(estate_id);
create index beneficiaries_estate_id_idx on public.beneficiaries(estate_id);
create index documents_estate_id_idx on public.documents(estate_id);

-- 7. Updated-at triggers (reuses handle_updated_at from migration 001)
create trigger assets_updated_at
  before update on public.assets
  for each row execute function public.handle_updated_at();

create trigger debts_updated_at
  before update on public.debts
  for each row execute function public.handle_updated_at();

create trigger beneficiaries_updated_at
  before update on public.beneficiaries
  for each row execute function public.handle_updated_at();

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

-- 8. Row-Level Security
alter table public.assets enable row level security;
alter table public.debts enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.documents enable row level security;

-- Assets RLS
create policy "Users can view own estate assets"
  on public.assets for select
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can insert own estate assets"
  on public.assets for insert
  with check (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can update own estate assets"
  on public.assets for update
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can delete own estate assets"
  on public.assets for delete
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

-- Debts RLS
create policy "Users can view own estate debts"
  on public.debts for select
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can insert own estate debts"
  on public.debts for insert
  with check (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can update own estate debts"
  on public.debts for update
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can delete own estate debts"
  on public.debts for delete
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

-- Beneficiaries RLS
create policy "Users can view own estate beneficiaries"
  on public.beneficiaries for select
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can insert own estate beneficiaries"
  on public.beneficiaries for insert
  with check (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can update own estate beneficiaries"
  on public.beneficiaries for update
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can delete own estate beneficiaries"
  on public.beneficiaries for delete
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

-- Documents RLS
create policy "Users can view own estate documents"
  on public.documents for select
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can insert own estate documents"
  on public.documents for insert
  with check (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can update own estate documents"
  on public.documents for update
  using (estate_id in (select id from public.estates where user_id = auth.uid()));

create policy "Users can delete own estate documents"
  on public.documents for delete
  using (estate_id in (select id from public.estates where user_id = auth.uid()));
