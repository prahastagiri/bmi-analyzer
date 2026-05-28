# Database Requirement

## Tujuan Database
Database digunakan untuk menyimpan data yang perlu bertahan setelah aplikasi ditutup, terutama:
- data akun pengguna
- riwayat hasil perhitungan BMI

Database tidak perlu terlalu kompleks di fase awal, tetapi harus cukup rapi agar mudah dikembangkan.

## Rekomendasi Database
Gunakan PostgreSQL melalui Supabase.

Alasan:
- relational database cocok untuk hubungan user dan history
- stabil dan umum dipakai
- mudah diintegrasikan dengan auth dan frontend
- cocok untuk project portfolio

## Entitas Utama
### 1. Users
Menyimpan identitas user.

Catatan:
- jika memakai Supabase Auth, sebagian data auth utama ditangani oleh sistem auth bawaan
- jika butuh data tambahan seperti nama tampilan, bisa dibuat tabel profile terpisah

### 2. Calculation History
Menyimpan hasil perhitungan BMI dan analisis nutrisi user.

Setiap record mewakili satu sesi perhitungan.

## Struktur Data yang Disarankan
### Table: profiles
Dipakai jika ingin menyimpan data tambahan user.

Field yang disarankan:
- `id`
- `email`
- `full_name`
- `created_at`
- `updated_at`

Keterangan:
- `id` terhubung ke user auth

### Table: bmi_histories
Menyimpan riwayat perhitungan.

Field yang disarankan:
- `id`
- `user_id`
- `height_cm`
- `weight_kg`
- `age`
- `gender`
- `activity_level`
- `bmi_value`
- `bmi_category`
- `ideal_weight_kg`
- `daily_calories`
- `daily_protein_g`
- `daily_fat_g`
- `created_at`

## Relasi Data
- satu user memiliki banyak history
- satu history hanya milik satu user

Relasi sederhananya:
- `profiles.id` -> `bmi_histories.user_id`

## Aturan Data
### Untuk tabel profile
- satu profile untuk satu user
- email harus unik jika disimpan di tabel tambahan

### Untuk tabel history
- semua record history harus punya `user_id`
- data numerik tidak boleh negatif
- `created_at` otomatis diisi

## Kebijakan Akses
Database harus mendukung aturan berikut:
- user hanya dapat membaca data miliknya sendiri
- user hanya dapat menambah data miliknya sendiri
- user tidak boleh membaca data user lain
- user tidak boleh mengubah atau menghapus data user lain

Jika memakai Supabase, ini sebaiknya diatur dengan Row Level Security.

## Data yang Tidak Perlu Disimpan Dulu
Untuk fase awal, tidak perlu menyimpan:
- rekomendasi menu berdasarkan domisili
- data AI prompt atau AI response
- analytics perilaku user
- log kompleks untuk admin

## Potensi Ekspansi di Masa Depan
Jika aplikasi berkembang, database bisa ditambah dengan:
- tabel domisili atau region
- tabel menu diet rekomendasi
- tabel export history
- tabel user preferences

## Contoh Kebutuhan Query
Database minimal harus mendukung query berikut:
- ambil profile user saat ini
- simpan hasil kalkulasi baru
- ambil semua riwayat hasil milik user
- ambil detail satu riwayat berdasarkan id

## Requirement Kualitas Data
- data user harus terhubung ke session auth
- field angka harus konsisten satuannya
- nama field harus jelas dan mudah dipahami
- struktur tabel jangan terlalu banyak di fase awal

## Definition of Done Database
Database dianggap siap jika:
- user bisa memiliki akun
- user bisa menyimpan riwayat hasil
- user bisa mengambil riwayatnya kembali
- data antar user terpisah dengan aman
- struktur tabel masih sederhana tetapi cukup untuk berkembang
