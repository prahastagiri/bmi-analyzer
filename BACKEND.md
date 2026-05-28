# Backend Requirement

## Tujuan Backend
Backend bertugas menangani proses yang tidak cukup dilakukan hanya di frontend, terutama:
- autentikasi user
- penyimpanan hasil perhitungan
- pengambilan riwayat hasil
- pengamanan akses data user

Untuk fase awal, backend tidak perlu terlalu kompleks. Fokus utamanya adalah membuat fitur auth dan persistence berjalan stabil.

## Rekomendasi Backend
Gunakan Supabase sebagai backend utama.

Komponen yang digunakan:
- Supabase Auth untuk login dan register
- Supabase Database untuk menyimpan data
- API atau server layer tambahan hanya jika memang diperlukan

## Tanggung Jawab Backend
### 1. Authentication
Backend harus mendukung:
- register user
- login user
- logout user
- validasi session
- pembatasan akses data hanya untuk pemilik akun

Aturan akses utama:
- user tidak wajib login untuk menghitung BMI dan melihat hasil di frontend
- user wajib login jika ingin menyimpan hasil
- user wajib login jika ingin menggunakan fitur export yang dibatasi akun
- user wajib login untuk membuka riwayat hasil

### 2. Data Persistence
Backend harus dapat:
- menyimpan hasil kalkulasi BMI user
- mengambil riwayat hasil milik user
- menampilkan detail hasil perhitungan
- menghapus riwayat jika nanti fitur itu dibutuhkan

### 3. Security
Backend harus memastikan:
- user hanya bisa melihat data miliknya sendiri
- session valid saat melakukan penyimpanan atau pengambilan data
- data sensitif tidak dibuka ke publik

## Data yang Perlu Ditangani Backend
Minimal data yang diproses:
- user id
- tinggi badan
- berat badan
- usia
- jenis kelamin
- tingkat aktivitas
- nilai BMI
- kategori BMI
- berat badan ideal
- kebutuhan kalori
- kebutuhan protein
- kebutuhan lemak
- catatan waktu perhitungan

## Apakah Perhitungan Dilakukan di Frontend atau Backend
### Rekomendasi Fase Awal
Perhitungan utama dilakukan di frontend, lalu hasil akhirnya disimpan ke backend.

Alasan:
- implementasi lebih sederhana
- feedback ke user lebih cepat
- backend lebih fokus pada auth dan penyimpanan data

### Kapan Perlu Dipindah ke Backend
Pertimbangkan memindahkan perhitungan ke backend jika:
- formula semakin kompleks
- ingin menjamin semua hasil dihitung dengan aturan tunggal di server
- ingin membuat audit trail atau validasi tambahan

## Endpoint atau Operasi yang Dibutuhkan
Jika memakai Supabase langsung dari app, tidak semua perlu dibuat sebagai custom API route. Namun secara konsep, sistem tetap membutuhkan operasi berikut:

### Auth Operations
- register user
- login user
- logout user
- get current session

### History Operations
- save calculation result
- get user calculation history
- get calculation detail

### Optional Operations
- delete history record
- update user profile

## Validasi Backend
Backend tetap perlu validasi dasar walaupun frontend sudah melakukan validasi.

Validasi yang disarankan:
- user harus login untuk menyimpan hasil
- user harus login untuk menggunakan fitur export jika proses export bergantung pada data akun atau history
- field numerik harus valid
- field wajib tidak boleh kosong
- relasi data ke user harus benar

## Error Handling
Backend harus mengembalikan respons yang jelas untuk kondisi seperti:
- login gagal
- email sudah dipakai
- session habis
- data gagal disimpan
- data tidak ditemukan
- akses tidak diizinkan

Pesan error sebaiknya sederhana agar mudah ditampilkan di frontend.

## Requirement Non-Fungsional
- respons auth cukup cepat
- penyimpanan hasil stabil
- struktur backend mudah dikembangkan
- tidak membutuhkan setup server yang rumit untuk fase awal

## Fitur yang Tidak Wajib di Backend Fase Awal
- AI recommendation engine
- rekomendasi menu berdasarkan domisili
- admin panel
- analytics dashboard
- background job

## Struktur Integrasi yang Disarankan
- `lib/supabase.js` untuk konfigurasi client
- `app/login/page.js` untuk flow login
- `app/register/page.js` untuk flow register
- `app/history/page.js` untuk membaca data riwayat
- `app/page.js` untuk menyimpan hasil setelah user login

Jika nanti dibutuhkan custom logic:
- `app/api/history/route.js`
- `app/api/export/route.js`

## Definition of Done Backend
Backend dianggap selesai untuk fase awal jika:
- user dapat register dan login
- session user dapat dipakai dengan benar
- hasil perhitungan bisa disimpan
- riwayat hasil bisa diambil kembali
- akses data user aman dan terpisah
