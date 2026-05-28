# BMI Analyzer Plan

## Ringkasan
Project ini adalah web app BMI Analyzer untuk menghitung BMI dan memberi analisis nutrisi dasar. Targetnya bukan hanya kalkulator sederhana, tetapi aplikasi yang cukup matang untuk portfolio, dengan fitur auth, penyimpanan riwayat hasil, dan export hasil.

Fitur rekomendasi menu berdasarkan domisili pengguna dipindahkan ke fase lanjutan agar scope fase awal tetap realistis dan lebih sehat untuk proses belajar.

## Tujuan Produk
- Membantu pengguna menghitung BMI dengan cepat.
- Menjelaskan arti hasil BMI dalam bahasa sederhana.
- Menghitung berat badan ideal.
- Menghitung kebutuhan kalori harian.
- Menghitung kebutuhan protein dan lemak harian.
- Menyimpan riwayat hasil untuk user yang login.
- Menyediakan export hasil dalam format JPG atau PDF.

## Aturan Akses
- Pengguna dapat menghitung BMI dan melihat hasil tanpa login.
- Login wajib hanya saat pengguna ingin menyimpan hasil perhitungan.
- Login wajib hanya saat pengguna ingin mengekspor hasil ke JPG atau PDF.
- Halaman riwayat hasil hanya untuk pengguna yang sudah login.

## Scope Fase Awal
- Form input data tubuh pengguna.
- Perhitungan BMI.
- Kategori BMI dan penjelasan singkat.
- Perhitungan berat badan ideal.
- Perhitungan kalori harian.
- Perhitungan kebutuhan protein dan lemak.
- Tampilan hasil yang rapi dan mudah dipahami.
- Register, login, logout.
- Simpan hasil perhitungan ke database.
- Halaman riwayat hasil.
- Export hasil ke JPG atau PDF.

## Scope Fase Lanjutan
- Rekomendasi menu diet berdasarkan domisili pengguna.
- Dataset menu lokal atau rule-based recommendation.
- Pengembangan ke AI/API jika memang dibutuhkan.

## Rekomendasi Arsitektur
- Frontend: Next.js App Router (JavaScript)
- Styling: Tailwind CSS
- UI component: shadcn/ui
- Backend: Supabase
- Auth: Supabase Auth
- Database: Supabase Postgres
- Storage opsional: Supabase Storage
- Export: client-side export untuk versi awal

## Alasan Rekomendasi
- Setup lebih cepat untuk project belajar.
- Tetap terlihat seperti full-stack project.
- Mudah di-deploy.
- Cocok untuk JavaScript murni.
- Auth dan database lebih cepat siap dibanding stack backend tradisional.

## Struktur Awal yang Disarankan
- `app/layout.js`
- `app/page.js`
- `app/login/page.js`
- `app/register/page.js`
- `app/history/page.js`
- `components/bmi/`
- `lib/calculations.js`
- `lib/explanations.js`
- `lib/export.js`
- `lib/supabase.js`

## Tahapan Implementasi
### Phase 1 - Setup Project
- Inisialisasi Next.js App Router dengan JavaScript.
- Pasang Tailwind CSS.
- Inisialisasi shadcn/ui.
- Rapikan struktur folder dasar.
- Hubungkan project ke Supabase.

### Phase 2 - Business Logic
- Tentukan field input yang wajib.
- Buat fungsi perhitungan BMI.
- Buat fungsi perhitungan berat badan ideal.
- Buat fungsi perhitungan kalori harian.
- Buat fungsi perhitungan protein dan lemak.

### Phase 3 - Frontend UI
- Buat form input.
- Buat komponen hasil.
- Tampilkan angka, kategori, dan penjelasan.
- Tambahkan tips umum untuk perbaikan berat badan.
- Pastikan responsive untuk mobile dan desktop.

### Phase 4 - Auth dan Riwayat
- Tambahkan register, login, dan logout.
- Simpan hasil ke database.
- Tampilkan riwayat hasil user.

### Phase 5 - Export
- Buat fitur export hasil ke JPG.
- Buat fitur export hasil ke PDF.
- Pastikan output mudah dibaca.

### Phase 6 - Finishing Portfolio
- Tambahkan loading state.
- Tambahkan empty state.
- Tambahkan error state.
- Tambahkan test untuk logic perhitungan utama.
- Siapkan deployment.

### Phase 7 - Fitur Lanjutan
- Tambahkan domisili user.
- Buat rekomendasi menu sederhana berbasis domisili.
- Evaluasi kebutuhan AI/API.

## Masukan untuk Belajar
Brief awalmu sudah bagus, tetapi lebih mudah dipakai jika dibagi menjadi beberapa bagian:
- tujuan aplikasi
- fitur fase awal
- fitur fase lanjutan
- stack wajib
- output yang diminta dari AI

Dengan format seperti ini, model yang lebih murah atau programmer junior akan lebih mudah memahami scope dan urutan kerja.
