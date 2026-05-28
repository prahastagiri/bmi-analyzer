create extension if not exists "pgcrypto";

create table if not exists public.bmi_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  height_cm numeric not null check (height_cm > 0),
  weight_kg numeric not null check (weight_kg > 0),
  age integer not null check (age > 0),
  gender text not null,
  activity_level text not null,
  bmi_value numeric not null,
  bmi_category text not null,
  ideal_weight_kg numeric not null,
  daily_calories integer not null,
  daily_protein_g numeric not null,
  daily_fat_g numeric not null,
  created_at timestamptz not null default now()
);

alter table public.bmi_histories enable row level security;

create policy "Users can read own bmi histories"
on public.bmi_histories
for select
using (auth.uid() = user_id);

create policy "Users can insert own bmi histories"
on public.bmi_histories
for insert
with check (auth.uid() = user_id);
