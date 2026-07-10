# Roadmap: BMI Analyzer → Production & Freemium

Tujuan: membawa aplikasi dari "portfolio project di localhost" menjadi produk
live yang stabil, lalu membangun nilai berulang yang layak dibayar, baru
memasang pembayaran. Urutannya sengaja: **stabil dulu → bernilai dulu →
monetize terakhir**. Setiap fase kecil, selesai-able, dan meninggalkan
aplikasi dalam kondisi lebih stabil dari sebelumnya.

Aturan main antar fase:
- Satu fase selesai = semua checklist-nya tercentang + Definition of Done terpenuhi.
- Jangan mulai fase pembayaran (Fase 4) sebelum gerbang validasi di Fase 3 terlewati.
- Setiap perubahan logika di `lib/` wajib disertai unit test.

---

## Fase 0 — Rapikan Fondasi (repo, schema, env)

> Catatan status (2026-07-08): aplikasi **sudah live di Vercel** dengan Supabase
> production (konfirmasi owner 2026-07-06). Yang belum beres adalah sisi repo
> dan lingkungan lokal — lokal selalu berjalan demo mode tanpa `.env.local`.

- [x] Commit pekerjaan yang masih menggantung (refactor export, karbohidrat, hapus history).
- [x] `supabase/schema.sql` di repo — sudah ada sejak awal; diperbarui: **policy DELETE**
      (wajib untuk fitur hapus history — tanpa ini delete gagal diam-diam karena RLS),
      index `(user_id, created_at desc)`, dan guard idempotent.
- [x] **Jalankan ulang `supabase/schema.sql` di SQL Editor project Supabase production**
      — dilakukan owner 2026-07-08; policy DELETE terverifikasi bekerja dari uji lokal.
- [x] `.env.example` dibuat (+ pengecualian di `.gitignore`).
- [x] `.env.local` lokal terisi (2026-07-08). Uji lokal lengkap terhadap Supabase nyata
      LULUS: register → login (email confirmation aktif) → auto-resume simpan via
      continuation → history termuat → hapus (terbukti hilang permanen setelah reload)
      → export JPG → logout. Catatan: export PDF belum teruji otomatis (print dialog
      tidak bisa dijalankan headless) — cek manual sekali di browser.

**Definition of Done:** repo bersih (semua ter-commit), schema production sinkron
dengan `supabase/schema.sql`, app lokal berjalan dengan Supabase nyata dan seluruh
alur auth+data terverifikasi manual.

> ✅ **FASE 0 SELESAI (2026-07-08).** Temuan untuk Fase 1: (a) pesan error Supabase
> tampil mentah bahasa Inggris ("Email not confirmed") di UI berbahasa Indonesia —
> perlu pemetaan pesan; (b) pesan sukses hapus tidak terlihat saat entri terakhir
> dihapus (kartu detail ikut hilang); (c) fitur baru belum di-push ke production.

---

## Fase 1 — Stabilitas Production Minimum

Aplikasi sudah live — fase ini memastikan yang live itu layak dipakai orang asing.

> URL production: **https://bmi-analyzer-phi.vercel.app**

- [ ] Uji alur lengkap di URL production: register (termasuk email confirmation +
      redirect URL Supabase), login, simpan, history, hapus, export.
- [x] Deploy production memuat fitur terbaru — di-push 2026-07-08 atas perintah owner,
      terverifikasi live (landing baru + fitur karbo tayang).
- [x] **Reset password** (2026-07-10) — `/forgot-password` (kirim link via
      `resetPasswordForEmail`) + `/reset-password` (form password baru, tangani link
      kedaluwarsa via hash error), link "Lupa password?" di login. Teruji lokal:
      kirim email sukses, state tanpa-sesi & link-kedaluwarsa tampil benar.
      **Aksi owner:** tambahkan `https://bmi-analyzer-phi.vercel.app/reset-password`
      dan `http://localhost:3210/reset-password` ke Supabase → Auth → URL
      Configuration → Redirect URLs, lalu klik link reset di inbox untuk uji
      end-to-end penggantian password.
- [x] **Pemetaan pesan error Supabase → Indonesia** (2026-07-10) — `lib/auth-errors.js`
      (map per `error.code` + fallback pola pesan + fallback generik, error mentah
      tetap di-log) dipakai di login, register, forgot/reset password. Ada unit test.
      Terverifikasi lokal: "Invalid login credentials" tampil sebagai pesan Indonesia.
- [x] CI sederhana (2026-07-10): `.github/workflows/ci.yml` — lint + test + build di
      tiap push/PR (Node 20, npm cache). Build tanpa env Supabase = demo mode,
      diverifikasi lokal. Status hijau di GitHub baru terbukti setelah push berikutnya.
- [ ] Error monitoring (Sentry free tier) — tanpa ini, bug pengguna tidak akan pernah
      kamu ketahui.
- [x] Analytics ringan (2026-07-10): `@vercel/analytics` terpasang, `<Analytics />` di
      `app/layout.js`. Terverifikasi lokal (debug mode mencatat pageview tanpa error).
      **Aksi owner:** aktifkan toggle Analytics di dashboard Vercel project ini —
      tanpa itu data production tidak terkumpul.
- [x] Halaman privacy policy + terms (2026-07-10): `/privacy` + `/terms` statis dalam
      bahasa Indonesia (isi jujur: data yang disimpan, Supabase+RLS, analytics agregat,
      hak hapus, disclaimer medis), tertaut dari footer baru di `app/layout.js`.
      Kontak memakai `qcumberlarry@gmail.com` — ganti jika owner mau alamat lain.
- [x] SEO dasar (2026-07-10): `metadata` per halaman (title template + layout wrapper
      untuk halaman client; history & reset-password noindex), root title mengangkat
      "Kalkulator BMI", Open Graph lengkap + OG image tergenerate
      (`app/opengraph-image.js`, 1200×630), `app/sitemap.js` + `app/robots.js`
      (URL production di `lib/site.js`). Semua terverifikasi lokal.

**Definition of Done:** URL production bisa dipakai orang asing tanpa bantuanmu,
error masuk ke Sentry, pengunjung terhitung, CI hijau.

---

## Fase 2 — Nilai Berulang (dari kalkulator jadi tracker)

Ini fase yang menciptakan alasan orang **kembali** — prasyarat mutlak freemium.
Tanpa fase ini tidak ada yang layak dibayar.

- [ ] Grafik tren berat & BMI di halaman history (SVG sendiri, tanpa library baru),
      dengan pita zona BMI normal 18,5–24,9. Empty state mengajak mengukur rutin.
- [ ] Estimasi waktu ke berat target di kartu hasil (rumus 7.700 kkal/kg; pakai defisit
      efektif `maintenanceCalories − dailyCalories`, bukan `calorieAdjustment` mentah;
      target = batas range normal terdekat; kategori normal → tampilkan "sudah di range").
- [ ] Tabel `profiles`: nama tampilan + target berat pribadi (opsional, override target default).
- [ ] Edit-tanggal tidak perlu — tapi cegah duplikat wajar: konfirmasi jika menyimpan
      dua kali dalam hari yang sama.
- [ ] Unit test untuk semua rumus baru.

**Definition of Done:** pengguna yang menyimpan ≥3 hasil melihat grafik progres dan
proyeksi waktu ke target; kamu sendiri memakai aplikasi ini tiap minggu.

---

## Fase 3 — Gating Free vs Premium (tanpa pembayaran dulu)

Pisahkan tier lebih dulu, validasi minat, baru bangun pembayaran. Gerbang murah
sebelum investasi mahal.

- [ ] Definisikan tier di satu file konfigurasi:
      **Free** = hitung unlimited, simpan 10 hasil terakhir, grafik 30 hari terakhir.
      **Premium** = history & grafik unlimited, estimasi target, export JPG/PDF, (nanti) meal plan AI.
- [ ] Tabel `entitlements` (atau kolom di `profiles`): `plan`, `valid_until`. Semua user
      default `free`.
- [ ] Enforcement di dua lapis: UI (tombol terkunci + ajakan upgrade) **dan** database
      (RLS/trigger membatasi jumlah insert untuk free) — gating client-only mudah dilewati.
- [ ] Halaman `/upgrade` dengan harga (mis. Rp 15rb/bulan) dan tombol **"Gabung waitlist"**
      (simpan email ke tabel) — belum ada pembayaran.
- [ ] Ukur selama 2–4 minggu: pengunjung → register → simpan rutin → klik upgrade → isi waitlist.

**Definition of Done:** funnel terukur end-to-end.
**Gerbang ke Fase 4:** ada sinyal nyata (mis. puluhan pengguna aktif mingguan ATAU
beberapa email waitlist). Jika tidak tercapai → perbaiki Fase 2/akuisisi dulu,
jangan bangun pembayaran.

---

## Fase 4 — Pembayaran

Baru dibangun setelah ada bukti minat. Untuk pasar Indonesia: Midtrans atau Xendit
(QRIS + VA + e-wallet); alternatif lebih cepat namun berbasis kartu: Lemon Squeezy/Polar.

- [ ] Integrasi checkout (mulai dari satu metode saja, mis. QRIS via Midtrans Snap).
- [ ] Webhook pembayaran → update `entitlements` (server-side, idempotent, terverifikasi signature).
- [ ] Halaman billing: status langganan, perpanjang, berhenti.
- [ ] Downgrade path yang jujur: premium habis → data tidak dihapus, hanya terkunci lagi.
- [ ] Uji sandbox end-to-end + uji satu transaksi asli kecil.
- [ ] Email transaksional minimum (kwitansi, langganan berakhir) — bisa pakai Resend free tier.

**Definition of Done:** orang asing bisa bayar dan langsung terbuka fitur premiumnya
tanpa campur tanganmu; pembayaran gagal tidak merusak state.

---

## Fase 5 — Fitur Premium Unggulan & Growth

Setelah mesin uang jalan, tambah amunisi premium dan perbesar corong masuk.

- [ ] **Meal plan AI**: target kalori/protein/lemak/karbo yang sudah dihitung → rencana
      makan mingguan masakan Indonesia via Claude API. Premium-only, rate-limited,
      dibingkai "saran umum, bukan nasihat medis".
- [ ] Reminder ukur mingguan (email via Resend atau Supabase cron).
- [ ] Konten SEO: 5–10 artikel pendek seputar BMI/kalori yang menaut ke kalkulator.
- [ ] Share card hasil BMI (gambar cantik untuk dibagikan — mesin export JPG sudah ada).
- [ ] Evaluasi bulanan: churn, konversi, fitur yang benar-benar dipakai.

**Definition of Done:** tidak pernah selesai — ini mode operasi permanen.

---

## Keputusan Tech Stack (2026-07-08)

Dievaluasi atas pertanyaan "perlukah ganti stack demi stabilitas?" — jawabannya:
**stack dipertahankan**. Ketidakstabilan saat ini berasal dari infrastruktur yang
belum dikerjakan (env lokal tidak dikonfigurasi sehingga alur auth tak pernah teruji
lokal, tanpa monitoring/CI), bukan dari pilihan teknologi. Menulis ulang fitur yang
sudah jalan adalah risiko terbesar.

- **Next.js + Vercel** — tetap. Route handler-nya dibutuhkan untuk webhook Fase 4.
  Disiplin: versi 16 sangat baru, selalu cek `node_modules/next/dist/docs/` sebelum
  menulis kode (lihat AGENTS.md).
- **Supabase** — tetap. Auth + Postgres + RLS + free tier paling cocok untuk freemium.
  Catatan arsitektur: mulai Fase 3, enforcement entitlement & webhook wajib server-side
  (route handler), bukan hanya client.
- **Satu perubahan yang disetujui: migrasi bertahap JS → TypeScript.** Dilakukan
  setelah Fase 1 (app live), selesai sebelum Fase 3 (sebelum kode entitlement/
  pembayaran ditulis). Alasan: kesalahan tipe di kode billing/entitlement berdampak
  uang. Migrasi incremental — TS/JS berdampingan, app selalu deployable.

---

## Prinsip yang dijaga di semua fase

1. **Disclaimer medis** tetap tampil di semua permukaan hasil, gratis maupun berbayar.
2. **Jangan simpan yang tidak perlu** — data kesehatan adalah tanggung jawab; minimal viable data.
3. **Setiap fase harus deployable** — tidak ada branch panjang yang hidup berminggu-minggu.
4. **Ukur sebelum membangun** — analytics dari Fase 1 adalah hakim untuk semua keputusan setelahnya.
