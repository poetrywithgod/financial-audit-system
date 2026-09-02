create extension if not exists "pgcrypto";

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  description text not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(15, 2) not null check (amount > 0),
  transaction_date date not null,
  status text not null default 'Completed'
    check (status in ('Completed', 'Pending', 'Cancelled')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_date_idx
  on public.transactions(transaction_date desc);

create index if not exists transactions_type_idx
  on public.transactions(type);

create index if not exists transactions_category_idx
  on public.transactions(category);

create index if not exists transactions_status_idx
  on public.transactions(status);

alter table public.transactions enable row level security;

create policy "Authenticated users can view transactions"
  on public.transactions
  for select
  to authenticated
  using (true);

create policy "Authenticated users can create transactions"
  on public.transactions
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update transactions"
  on public.transactions
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete transactions"
  on public.transactions
  for delete
  to authenticated
  using (true);

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_updated_at on public.transactions;

create trigger transactions_updated_at
before update on public.transactions
for each row
execute function public.update_updated_at();
