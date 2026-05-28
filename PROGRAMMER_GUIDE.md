# Programmer Guide

## Tujuan Dokumen
Dokumen ini dibuat sebagai panduan kerja untuk programmer yang akan melanjutkan atau memodifikasi aplikasi `BMI Analyzer`.

Fokus dokumen ini adalah:
- menjelaskan alur aplikasi dari awal sampai akhir
- menunjukkan peran setiap folder penting
- menjelaskan hubungan antar file utama
- memberi titik masuk yang jelas saat ingin mengubah fitur tertentu

Dokumen ini melengkapi dokumentasi requirement seperti `PLAN.md`, `FRONTEND.md`, `BACKEND.md`, dan `DATABASE.md`.

## Gambaran Umum Aplikasi
Aplikasi ini adalah web app berbasis Next.js App Router untuk:
- menghitung BMI
- menentukan kategori BMI
- menghitung berat badan ideal
- menghitung kebutuhan kalori harian
- menghitung kebutuhan protein dan lemak harian
- menyimpan hasil perhitungan ke akun pengguna
- menampilkan riwayat hasil
- mengekspor hasil ke JPG atau PDF

Aturan produk yang penting:
- user boleh menghitung tanpa login
- login wajib hanya saat ingin menyimpan hasil
- login wajib hanya saat ingin export hasil
- halaman history hanya bisa diakses user yang sudah login

## Stack yang Dipakai
- Next.js App Router
- JavaScript
- Tailwind CSS
- komponen UI bergaya shadcn
- Supabase Auth
- Supabase Postgres

## Struktur Folder Penting
### `app/`
Berisi route utama aplikasi.

- `app/layout.js`: root layout, metadata, auth provider, header
- `app/page.js`: landing page dan host untuk kalkulator BMI
- `app/login/page.js`: halaman login
- `app/register/page.js`: halaman register
- `app/history/page.js`: halaman riwayat hasil user
- `app/globals.css`: global style dan theme token

### `components/`
Berisi komponen aplikasi.

- `components/bmi-analyzer.js`: shell UI untuk menyusun section BMI
- `components/bmi/BmiForm.js`: form input dan feedback state
- `components/bmi/BmiResult.js`: kartu hasil, interpretasi, dan tips
- `components/bmi/BmiActions.js`: panel aksi save dan export
- `components/auth-provider.js`: context auth dan session tracking
- `components/app-header.js`: header global aplikasi
- `components/ui/*`: primitive UI reusable seperti button, card, input, label, select, badge

### `hooks/`
Berisi custom hook yang menyimpan orchestration state.

- `hooks/useBmiAnalyzer.js`: state form BMI, validasi, hasil analisis, save, export, dan reset

### `lib/`
Berisi logic yang dipisah dari UI.

- `lib/calculations.js`: rumus BMI dan validasi input
- `lib/explanations.js`: copy kategori BMI, label aktivitas, dan ringkasan hasil
- `lib/supabase.js`: helper env, client Supabase, dan payload insert
- `lib/export.js`: helper export JPG dan PDF
- `lib/utils.js`: helper umum seperti class merge dan formatter

### `supabase/`
- `supabase/schema.sql`: schema tabel `bmi_histories` dan policy RLS

### File dokumentasi lain
- `request.md`: brief awal project
- `PLAN.md`: roadmap implementasi
- `TECHSTACK.md`: alasan pemilihan stack
- `FRONTEND.md`: requirement frontend
- `BACKEND.md`: requirement backend
- `DATABASE.md`: requirement database

## Alur Aplikasi
## 1. Startup aplikasi
Saat aplikasi dibuka:
1. Next.js merender `app/layout.js`
2. `AuthProvider` dipasang di level root
3. `AppHeader` tampil di semua halaman
4. route aktif dirender di dalam `<main>`

Jika env Supabase belum tersedia:
- aplikasi tetap jalan
- mode auth dianggap nonaktif
- kalkulator tetap bisa dipakai
- fitur save, history, dan export akan menampilkan peringatan

## 2. Alur halaman utama
Halaman utama berada di `app/page.js`.

Tanggung jawab file ini:
- menampilkan hero section
- menampilkan ringkasan value aplikasi
- memasang komponen `BmiAnalyzer`

Semua orchestrator logic utama kalkulator ada di:
- `hooks/useBmiAnalyzer.js`

Markup fitur dibagi ke:
- `components/bmi-analyzer.js`
- `components/bmi/BmiForm.js`
- `components/bmi/BmiResult.js`
- `components/bmi/BmiActions.js`

## 3. Alur perhitungan BMI
Flow lengkap perhitungan:

1. user mengisi form di `BmiForm`
2. `components/bmi-analyzer.js` mengambil state dan handler dari `useBmiAnalyzer()`
3. tombol `Hitung BMI sekarang` menjalankan `handleCalculate()`
4. `handleCalculate()` memanggil `validateCalculatorInput()`
5. jika valid, hook memanggil `calculateAnalysis()`
6. hasil disimpan ke state `result`
7. `BmiResult` merender ringkasan hasil
8. `BmiActions` mengaktifkan tombol save dan export

### Detail logic perhitungan
File: `lib/calculations.js`

Urutan perhitungannya:
1. normalisasi input menjadi number
2. hitung BMI
3. tentukan kategori BMI
4. hitung berat badan ideal dengan BMI target 22
5. hitung BMR dengan formula Mifflin-St Jeor
6. hitung maintenance calories dengan activity multiplier
7. sesuaikan target kalori berdasarkan kategori BMI
8. hitung kebutuhan protein
9. hitung kebutuhan lemak

Output akhirnya berupa object `AnalysisResult` yang dipakai oleh:
- UI hasil
- helper penjelasan
- helper simpan ke database
- helper export

## 4. Alur penjelasan hasil
File: `lib/explanations.js`

Setelah hasil hitungan tersedia:
- `getCategoryContent()` mengambil label, summary, dan tips berdasarkan kategori BMI
- `getActivityLabel()` mengubah kode aktivitas menjadi label yang dibaca user
- `buildSummary()` membuat narasi singkat yang menggabungkan hasil BMI dan arah kalori

Tujuannya agar UI tidak menulis logic penjelasan langsung di komponen.

## 5. Alur auth
File utama:
- `components/auth-provider.js`
- `app/login/page.js`
- `app/register/page.js`
- `components/app-header.js`

### Cara auth bekerja
1. `AuthProvider` memeriksa apakah env Supabase tersedia
2. jika tersedia, provider membuat browser client Supabase
3. provider mengambil session awal dengan `supabase.auth.getSession()`
4. provider subscribe ke perubahan auth lewat `onAuthStateChange()`
5. state auth dibagikan lewat `useAuth()`

Data auth yang dipakai komponen:
- `user`
- `session`
- `loading`
- `authEnabled`

### Flow login
1. user mengisi email dan password di `app/login/page.js`
2. `handleSubmit()` memanggil `supabase.auth.signInWithPassword()`
3. jika sukses, user diarahkan ke `/history`

### Flow register
1. user mengisi email, password, dan konfirmasi password
2. form melakukan validasi dasar
3. `handleSubmit()` memanggil `supabase.auth.signUp()`
4. jika sukses, user diarahkan ke halaman login

### Flow logout
Logout dilakukan dari `components/app-header.js`:
1. tombol logout memanggil `handleSignOut()`
2. `supabase.auth.signOut()` dijalankan
3. user diarahkan kembali ke halaman utama

## 6. Alur save hasil
Flow save hasil diorkestrasi dari `hooks/useBmiAnalyzer.js` dan tombolnya ditampilkan di `components/bmi/BmiActions.js`.

Urutannya:
1. user menekan tombol `Simpan hasil`
2. `handleSave()` memastikan hasil perhitungan sudah ada
3. komponen mengecek apakah auth aktif
4. komponen mengecek apakah user sudah login
5. jika belum login, tampil pesan dan CTA ke halaman login/register
6. jika login, komponen memanggil `mapAnalysisToInsertPayload()`
7. payload dikirim ke tabel `bmi_histories` lewat Supabase

File yang terlibat:
- `components/bmi-analyzer.js`
- `lib/supabase.js`
- `supabase/schema.sql`

## 7. Alur history
Halaman history berada di `app/history/page.js`.

Urutannya:
1. komponen membaca auth state dari `useAuth()`
2. jika auth belum aktif, tampil mode nonaktif
3. jika session masih loading, tampil state loading
4. jika user belum login, tampil CTA login/register
5. jika user login, komponen memanggil query Supabase:
   - select dari `bmi_histories`
   - filter `user_id = user.id`
   - urutkan dari `created_at` terbaru
6. hasil query ditampilkan sebagai daftar card

## 8. Alur export
Flow export juga diorkestrasi dari `hooks/useBmiAnalyzer.js` dan tombolnya ditampilkan di `components/bmi/BmiActions.js`.

Aturannya:
- user wajib login
- hasil perhitungan harus sudah ada

### Export JPG
1. tombol `Export JPG` memanggil `handleExport("jpg")`
2. komponen memanggil `exportElementToJpg()`
3. helper merender DOM ke image menggunakan `html-to-image`
4. file diunduh sebagai JPG

### Export PDF
1. tombol `Export PDF` memanggil `handleExport("pdf")`
2. komponen memanggil `exportElementToPdf()`
3. helper membuka popup print-friendly
4. browser print dialog muncul
5. user bisa memilih `Save as PDF`

Catatan:
- implementasi PDF saat ini belum berupa generated PDF engine
- pendekatan ini dipilih karena lebih ringan untuk fase awal

## 9. Alur database
Schema utama saat ini ada di `supabase/schema.sql`.

Tabel yang dipakai:
- `public.bmi_histories`

Kolom yang disimpan:
- data input tubuh
- kategori BMI
- berat ideal
- target kalori
- protein
- lemak
- timestamp simpan

Keamanan data:
- Row Level Security aktif
- user hanya bisa membaca datanya sendiri
- user hanya bisa menyimpan data miliknya sendiri

## Titik Masuk Saat Ingin Mengubah Fitur
### Jika ingin mengubah rumus BMI atau nutrisi
Masuk ke:
- `lib/calculations.js`

### Jika ingin mengubah teks penjelasan dan tips
Masuk ke:
- `lib/explanations.js`

### Jika ingin mengubah tampilan form dan hasil
Masuk ke:
- `components/bmi-analyzer.js`
- `components/bmi/BmiForm.js`
- `components/bmi/BmiResult.js`
- `components/bmi/BmiActions.js`

### Jika ingin mengubah orchestration state BMI
Masuk ke:
- `hooks/useBmiAnalyzer.js`

### Jika ingin mengubah login/register/history
Masuk ke:
- `app/login/page.js`
- `app/register/page.js`
- `app/history/page.js`
- `components/auth-provider.js`

### Jika ingin mengubah gaya komponen umum
Masuk ke:
- `components/ui/*`
- `app/globals.css`

### Jika ingin mengubah penyimpanan data
Masuk ke:
- `lib/supabase.js`
- `supabase/schema.sql`

## Kontrak Data Penting
### Bentuk input form
Input utama yang diharapkan:
- `heightCm`
- `weightKg`
- `age`
- `gender`
- `activityLevel`

### Bentuk hasil analisis
Object hasil analisis yang paling penting berisi:
- `bmi`
- `bmiCategory`
- `idealWeightKg`
- `dailyCalories`
- `dailyProteinGrams`
- `dailyFatGrams`
- `maintenanceCalories`

### Bentuk payload ke database
Sebelum dikirim ke Supabase, hasil analisis dipetakan ke field SQL:
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

## Setup Lokal
### Environment
File yang perlu disiapkan:
- `.env.local`

Minimal isi:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Menjalankan app
```bash
npm install
npm run dev
```

### Menjalankan lint
```bash
npm run lint
```

### Menjalankan build check
```bash
npm run build
```

## Checklist Saat Menambah Fitur Baru
Saat menambah fitur, cek hal ini:
1. apakah logic baru sebaiknya masuk ke `lib/` atau `components/`
2. apakah perubahan butuh update di requirement docs
3. apakah perubahan butuh penyesuaian schema database
4. apakah aturan login tetap konsisten
5. apakah state loading, success, dan error sudah ditangani
6. apakah feature bisa dipahami dari JSDoc dan nama function

## Masalah yang Paling Mungkin Terjadi
### Save gagal
Kemungkinan penyebab:
- `.env.local` belum benar
- schema belum dijalankan di Supabase
- user belum login
- policy RLS belum aktif atau query tidak cocok

### History kosong
Kemungkinan penyebab:
- belum ada hasil yang disimpan
- query gagal
- data milik user berbeda

### Export PDF tidak jalan
Kemungkinan penyebab:
- popup diblokir browser
- user belum login
- hasil analisis belum muncul

## Catatan untuk Developer Berikutnya
- project ini sengaja memisahkan logic utama dari UI agar lebih mudah dipelajari
- fase awal menekankan flow yang sederhana dan jelas, bukan arsitektur yang terlalu rumit
- `components/bmi-analyzer.js` sekarang menjadi shell UI, sedangkan orchestration state dipindahkan ke `hooks/useBmiAnalyzer.js`
- jika formula makin banyak, pertimbangkan pisahkan per domain, misalnya `bmi`, `nutrition`, dan `recommendations`

## Rekomendasi Refactor Selanjutnya
Jika project ingin dilanjutkan, urutan refactor yang sehat:
1. pertimbangkan memecah `useBmiAnalyzer()` menjadi hook yang lebih kecil jika flow save/export/history makin kompleks
2. tambahkan test untuk `lib/calculations.js`
3. tambahkan typed contracts lewat JSDoc yang lebih detail atau migrasi ke TypeScript
4. tambahkan profile table jika butuh data user tambahan
5. tambahkan fitur domisili dan rekomendasi menu sebagai fase kedua
