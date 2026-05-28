# Frontend Requirement

## Tujuan Frontend
Frontend bertugas menjadi tempat interaksi utama pengguna untuk:
- mengisi data tubuh
- melihat hasil perhitungan
- memahami arti hasil BMI
- melihat riwayat hasil
- mengekspor hasil

Frontend harus terasa sederhana, rapi, dan mudah dipahami oleh pengguna umum.

## Stack Frontend
- Next.js App Router
- JavaScript
- Tailwind CSS
- shadcn/ui

## Halaman Utama yang Dibutuhkan
### 1. Landing / Calculator Page
Halaman utama tempat user mengisi data dan melihat hasil analisis.

Minimal berisi:
- form input data tubuh
- tombol hitung
- area hasil perhitungan
- penjelasan hasil
- tips umum
- tombol export

### 2. Login Page
Halaman untuk user masuk ke akun.

Minimal berisi:
- email
- password
- tombol login
- link ke halaman register

### 3. Register Page
Halaman untuk membuat akun baru.

Minimal berisi:
- nama atau username opsional
- email
- password
- konfirmasi password jika diperlukan
- tombol daftar

### 4. History Page
Halaman untuk melihat hasil perhitungan sebelumnya.

Minimal berisi:
- daftar riwayat hasil
- tanggal perhitungan
- ringkasan BMI dan analisis
- aksi lihat detail

## Komponen Utama
### Input Form
Komponen untuk menerima data pengguna.

Input yang disarankan:
- tinggi badan
- berat badan
- usia
- jenis kelamin
- tingkat aktivitas

Validasi dasar:
- semua field wajib terisi
- angka harus valid
- tidak boleh bernilai nol atau negatif

### Result Card
Komponen untuk menampilkan hasil utama.

Minimal menampilkan:
- nilai BMI
- kategori BMI
- berat badan ideal
- kebutuhan kalori harian
- kebutuhan protein harian
- kebutuhan lemak harian

### Explanation Section
Komponen untuk menjelaskan hasil BMI dalam bahasa sederhana.

Contoh isi:
- arti kategori BMI user
- apakah user perlu menurunkan, menaikkan, atau menjaga berat badan
- penjelasan singkat yang tidak terlalu medis

### Tips Section
Komponen untuk memberi tips praktis.

Contoh isi:
- kurangi asupan kalori jika overweight
- tingkatkan aktivitas fisik
- atur porsi makan
- jaga konsistensi pola tidur dan aktivitas

### Export Button
Komponen untuk mengekspor hasil ke:
- JPG
- PDF

## Alur Pengguna
### User belum login
- membuka halaman utama
- mengisi form
- melihat hasil
- boleh menghitung tanpa login
- diminta login jika ingin menyimpan hasil
- diminta login jika ingin export hasil

### User sudah login
- membuka halaman utama
- mengisi form
- melihat hasil
- menyimpan hasil
- membuka halaman history
- export hasil

## Aturan Akses
- user tidak wajib login untuk menggunakan kalkulator BMI
- user wajib login jika ingin menyimpan hasil perhitungan
- user wajib login jika ingin mengekspor hasil ke JPG atau PDF
- halaman history hanya dapat diakses oleh user yang sudah login

## Requirement UI/UX
- desain bersih dan modern
- mudah dipakai di mobile dan desktop
- form mudah dipahami
- hasil mudah dibaca dalam sekali lihat
- gunakan card, badge, alert, button, dialog, dan input yang konsisten
- hindari tampilan terlalu padat

## State yang Harus Ditangani
- initial state saat belum ada hasil
- loading state saat proses hitung atau simpan
- success state saat data berhasil disimpan
- error state saat input tidak valid atau request gagal
- empty state pada halaman history jika belum ada data

## Requirement Teknis Frontend
- pisahkan logic perhitungan dari komponen UI
- buat komponen reusable jika memungkinkan
- gunakan folder yang rapi untuk `app`, `components`, dan `lib`
- hindari menyimpan rumus langsung di dalam komponen UI
- siapkan struktur agar mudah ditambah fitur baru

## Struktur File yang Disarankan
- `app/page.js`
- `app/login/page.js`
- `app/register/page.js`
- `app/history/page.js`
- `components/bmi/BmiForm.js`
- `components/bmi/BmiResult.js`
- `components/bmi/BmiExplanation.js`
- `components/bmi/BmiTips.js`
- `components/bmi/ExportActions.js`
- `lib/calculations.js`
- `lib/explanations.js`

## Requirement Konten
Bahasa pada frontend harus:
- sederhana
- tidak terlalu teknis
- mudah dimengerti pengguna umum
- cocok untuk portfolio yang ingin terlihat ramah dan jelas

## Out of Scope untuk Fase Awal
- rekomendasi menu berbasis domisili
- dashboard admin
- integrasi AI real-time
- analisis kesehatan yang terlalu medis

## Definition of Done Frontend
Frontend dianggap selesai untuk fase awal jika:
- user bisa mengisi data tubuh
- hasil BMI dan analisis muncul dengan benar
- tampilan responsive
- user bisa login dan register
- user bisa melihat history
- user bisa export hasil
- UI terlihat rapi dan konsisten
