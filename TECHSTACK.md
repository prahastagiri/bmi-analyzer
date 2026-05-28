# Tech Stack Summary

## Tujuan Pemilihan Stack
Stack dipilih agar project ini:
- cepat dibangun
- mudah dipelajari
- tetap terlihat profesional untuk portfolio
- tidak terlalu berat untuk developer solo

## Frontend
### Next.js App Router
Dipakai sebagai framework utama untuk membangun web app.

Alasan:
- cocok untuk aplikasi modern berbasis React
- routing sudah built-in
- mudah dipakai untuk page public dan page auth
- cocok jika nanti butuh API route atau server action

Catatan:
- gunakan JavaScript, bukan TypeScript, sesuai brief awal

### Tailwind CSS
Dipakai untuk styling utama.

Alasan:
- cepat untuk membangun UI
- konsisten
- cocok dipadukan dengan Next.js dan shadcn/ui
- mempermudah responsive design

### shadcn/ui
Dipakai sebagai kumpulan komponen UI siap pakai.

Alasan:
- hasil UI lebih rapi untuk portfolio
- komponen mudah dikustomisasi
- sangat cocok dengan Tailwind
- membantu mempercepat pembuatan form, dialog, card, table, button, dan alert

## Backend
### Supabase
Dipakai sebagai backend utama untuk fase awal.

Alasan:
- menyediakan auth dan database dalam satu platform
- setup lebih cepat
- cocok untuk project belajar dan portfolio
- integrasi dengan frontend relatif sederhana

Supabase akan dipakai untuk:
- login dan register user
- menyimpan riwayat hasil BMI
- membaca kembali data riwayat user

## Authentication
### Supabase Auth
Dipakai untuk:
- register
- login
- logout
- session management

Alasan:
- lebih cepat dibanding membangun auth dari nol
- sudah cukup kuat untuk project portfolio

## Database
### Supabase Postgres
Dipakai untuk penyimpanan data utama.

Alasan:
- relational database cocok untuk user dan history perhitungan
- stabil dan umum dipakai
- mudah dikembangkan jika nanti fitur makin besar

Kemungkinan data yang disimpan:
- data user
- hasil BMI
- hasil analisis nutrisi
- timestamp riwayat perhitungan

## Export
### Client-side Export
Versi awal disarankan memakai export di sisi client untuk JPG/PDF.

Alasan:
- implementasi lebih sederhana
- cocok untuk hasil ringkasan visual
- tidak perlu langsung membangun document generation di server

Catatan:
- jika nanti butuh export formal atau layout PDF yang lebih kompleks, bisa dipindahkan ke server-side

## Testing
### Rekomendasi
Untuk fase awal, cukup siapkan test terfokus pada logic perhitungan.

Prioritas:
- test fungsi BMI
- test fungsi berat badan ideal
- test fungsi kalori
- test fungsi protein dan lemak

Tujuan:
- memastikan hasil hitungan konsisten
- mengurangi risiko bug saat formula diubah

## Deployment
### Rekomendasi
Deploy frontend di Vercel dan gunakan Supabase sebagai layanan backend.

Alasan:
- integrasi Next.js sangat baik
- proses deploy sederhana
- cocok untuk demo portfolio

## Alternatif Jika Ingin Backend Lebih Dalam
Jika tujuan belajarnya ingin lebih fokus ke backend tradisional, alternatif stack:
- Next.js
- Auth.js
- Prisma
- PostgreSQL

Namun untuk project ini, jalur tersebut lebih kompleks dan akan memperpanjang setup serta debugging.

## Kesimpulan
Stack yang paling seimbang untuk project ini adalah:
- Next.js App Router (JavaScript)
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Client-side JPG/PDF export

Kombinasi ini paling realistis untuk project belajar yang tetap kuat sebagai portfolio.
