-- Skema database BMI Analyzer (Supabase / PostgreSQL).
-- Sumber kebenaran skema ada di file ini, bukan di dashboard Supabase.
-- Aman dijalankan ulang (idempotent) — jalankan ULANG seluruh file ini di
-- SQL Editor Supabase setiap kali ada perubahan, termasuk untuk mengaktifkan
-- policy DELETE yang dibutuhkan fitur hapus history.

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

-- Query utama halaman history: semua record milik user, terbaru dulu.
create index if not exists bmi_histories_user_created_idx
on public.bmi_histories (user_id, created_at desc);

alter table public.bmi_histories enable row level security;

drop policy if exists "Users can read own bmi histories" on public.bmi_histories;
create policy "Users can read own bmi histories"
on public.bmi_histories
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own bmi histories" on public.bmi_histories;
create policy "Users can insert own bmi histories"
on public.bmi_histories
for insert
with check (auth.uid() = user_id);

-- Dibutuhkan fitur "hapus history" (app/history/page.js). Tanpa policy ini,
-- delete dari client "berhasil" tetapi 0 baris terhapus (silent failure RLS).
drop policy if exists "Users can delete own bmi histories" on public.bmi_histories;
create policy "Users can delete own bmi histories"
on public.bmi_histories
for delete
using (auth.uid() = user_id);

-- =====================================================================
-- Fase 2: profil pengguna (nama tampilan + target berat pribadi opsional).
-- Satu baris per user (id = auth.users.id). target_weight_kg boleh NULL —
-- artinya pakai target default (batas zona BMI normal terdekat).
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  target_weight_kg numeric check (target_weight_kg is null or target_weight_kg > 0),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- UPDATE dibutuhkan agar upsert (INSERT ... ON CONFLICT UPDATE) dari client
-- bisa memperbarui baris profil yang sudah ada.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =====================================================================
-- Fase 3: entitlement free vs premium.
-- Kolom di profiles (bukan tabel terpisah — 1:1 per user). Default 'free';
-- premium diset MANUAL sampai Fase 4 (pembayaran). valid_until NULL = premium
-- tanpa batas / tidak relevan untuk free. Angka batas sinkron dgn lib/tiers.ts.
-- CATATAN: client TIDAK boleh bisa menaikkan plan-nya sendiri. Policy UPDATE di
-- atas mengizinkan user memperbarui barisnya, jadi plan/valid_until HANYA boleh
-- diubah lewat service_role (server/admin), bukan dari browser. Upsert profil
-- dari client sengaja tidak menyertakan kolom plan/valid_until.
-- =====================================================================
alter table public.profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'premium'));

alter table public.profiles
  add column if not exists valid_until timestamptz;

-- Backstop server-side untuk batas simpan pengguna free (maks 10 hasil).
-- Gating di UI mudah dilewati; trigger ini memastikan batas tetap berlaku di DB.
-- Premium aktif (belum kedaluwarsa) dikecualikan. FREE_SAVE_LIMIT = 10.
create or replace function public.enforce_free_save_limit()
returns trigger
language plpgsql
as $$
declare
  user_plan text;
  user_valid_until timestamptz;
  existing_count integer;
begin
  select plan, valid_until
    into user_plan, user_valid_until
    from public.profiles
   where id = new.user_id;

  -- Premium aktif tidak dibatasi.
  if user_plan = 'premium'
     and (user_valid_until is null or user_valid_until > now()) then
    return new;
  end if;

  select count(*)
    into existing_count
    from public.bmi_histories
   where user_id = new.user_id;

  if existing_count >= 10 then
    raise exception
      'FREE_SAVE_LIMIT_REACHED: pengguna free maksimal 10 hasil tersimpan'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_free_save_limit on public.bmi_histories;
create trigger trg_enforce_free_save_limit
before insert on public.bmi_histories
for each row
execute function public.enforce_free_save_limit();
