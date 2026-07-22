# Roadmap: HealthyMuch (dh. BMI Analyzer) → Production & Freemium

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

> URL production: **https://healthymuch.prahastagiri.com** (rebrand 2026-07-10;
> URL lama https://bmi-analyzer-phi.vercel.app tetap aktif sebagai domain Vercel
> bawaan). Domain baru butuh aksi owner: (1) Vercel project → Settings → Domains
> → tambah `healthymuch.prahastagiri.com`, (2) DNS `prahastagiri.com` → CNAME
> `healthymuch` ke `cname.vercel-dns.com`, (3) Supabase → Auth → URL
> Configuration → ganti Site URL ke domain baru.

- [x] Uji alur lengkap di URL production: register (termasuk email confirmation +
      redirect URL Supabase), login, simpan, history, hapus, export.
      > Pasca push 2026-07-10: seluruh halaman (termasuk `/forgot-password`,
      > `/privacy`, `/terms`, sitemap, robots, OG image) 200 di
      > https://healthymuch.prahastagiri.com. **Uji auth end-to-end LULUS oleh owner
      > (2026-07-10):** register → email confirmation → login → simpan → history →
      > hapus → export berjalan di domain production.
- [x] Deploy production memuat fitur terbaru — di-push 2026-07-08 atas perintah owner,
      terverifikasi live (landing baru + fitur karbo tayang). Push kedua 2026-07-10
      (10 commit): seluruh Fase 1 + rebrand HealthyMuch tayang di
      https://healthymuch.prahastagiri.com — domain custom aktif, halaman baru 200,
      title/OG/sitemap/robots semua menunjuk domain baru.
- [x] **Reset password** (2026-07-10) — `/forgot-password` (kirim link via
      `resetPasswordForEmail`) + `/reset-password` (form password baru, tangani link
      kedaluwarsa via hash error), link "Lupa password?" di login. Teruji lokal:
      kirim email sukses, state tanpa-sesi & link-kedaluwarsa tampil benar.
      **Aksi owner:** tambahkan `https://healthymuch.prahastagiri.com/reset-password`,
      `https://bmi-analyzer-phi.vercel.app/reset-password`, dan
      `http://localhost:3210/reset-password` ke Supabase → Auth → URL
      Configuration → Redirect URLs, lalu klik link reset di inbox untuk uji
      end-to-end penggantian password.
- [x] **Pemetaan pesan error Supabase → Indonesia** (2026-07-10) — `lib/auth-errors.js`
      (map per `error.code` + fallback pola pesan + fallback generik, error mentah
      tetap di-log) dipakai di login, register, forgot/reset password. Ada unit test.
      Terverifikasi lokal: "Invalid login credentials" tampil sebagai pesan Indonesia.
- [x] CI sederhana (2026-07-10): `.github/workflows/ci.yml` — lint + test + build di
      tiap push/PR (Node 20, npm cache). Build tanpa env Supabase = demo mode,
      diverifikasi lokal. CI HIJAU pada run pertama pasca push 2026-07-10
      (https://github.com/prahastagiri/bmi-analyzer/actions/runs/29081185322).
- [x] Error monitoring — Sentry (2026-07-10): `@sentry/nextjs` v10 terpasang
      (instrumentation-client/server/edge + `app/global-error.js` + `withSentryConfig`),
      DSN via `NEXT_PUBLIC_SENTRY_DSN` (.env.local; .env.example diperbarui). Mode:
      error-only (tanpa tracing/replay, hemat kuota free tier), aktif hanya di
      production. Teruji end-to-end: event percobaan terkirim 200 ke ingest Sentry
      (cek dashboard: "Uji integrasi Sentry HealthyMuch — abaikan event ini").
      Env `NEXT_PUBLIC_SENTRY_DSN` di Vercel **sudah ditambahkan owner (2026-07-10)** —
      diverifikasi bahwa nilai DSN benar-benar ter-inline di bundle production, jadi
      error live akan masuk ke dashboard Sentry. Opsional nanti: SENTRY_AUTH_TOKEN +
      org/project di next.config.mjs agar stack trace tidak ter-minify.
- [x] Analytics ringan (2026-07-10): `@vercel/analytics` terpasang, `<Analytics />` di
      `app/layout.js`. Terverifikasi lokal (debug mode mencatat pageview tanpa error).
      Toggle Analytics di dashboard Vercel **sudah diaktifkan owner (2026-07-10)** —
      pengunjung production kini terhitung.
- [x] Halaman privacy policy + terms (2026-07-10): `/privacy` + `/terms` statis dalam
      bahasa Indonesia (isi jujur: data yang disimpan, Supabase+RLS, analytics agregat,
      hak hapus, disclaimer medis), tertaut dari footer baru di `app/layout.js`.
      Kontak memakai `qcumberlarry@gmail.com` — ganti jika owner mau alamat lain.
- [x] UX kecil dari temuan Fase 0 (2026-07-10): feedback hapus history pindah ke area
      status level halaman (`notice` emerald + `error`), jadi tetap terlihat saat entri
      terakhir dihapus dan kartu detail ikut hilang. Error hapus kini berbahasa
      Indonesia, error mentah di-log. (Belum diuji ulang di browser dengan akun login —
      butuh sesi login; tercakup di uji production oleh owner.)
- [x] UX feedback aksi (2026-07-10, permintaan owner): feedback simpan/export kini
      dirender tepat di bawah tombolnya di panel "Aksi lanjutan" (sebelumnya nyasar di
      kartu form kiri sehingga tak terlihat), plus state sibuk — tombol disable,
      spinner, label "Menyimpan...", "Menyiapkan JPG/PDF...", dan pesan sukses/gagal.
      CTA login (continuation) ikut pindah ke panel aksi. Jalur sukses/busy penuh
      butuh sesi login — tercakup di uji production owner.
- [x] SEO dasar (2026-07-10): `metadata` per halaman (title template + layout wrapper
      untuk halaman client; history & reset-password noindex), root title mengangkat
      "Kalkulator BMI", Open Graph lengkap + OG image tergenerate
      (`app/opengraph-image.js`, 1200×630), `app/sitemap.js` + `app/robots.js`
      (URL production di `lib/site.js`). Semua terverifikasi lokal dan (2026-07-10,
      pasca push) terverifikasi live di domain production.

**Definition of Done:** URL production bisa dipakai orang asing tanpa bantuanmu,
error masuk ke Sentry, pengunjung terhitung, CI hijau.

> ✅ **FASE 1 SELESAI (2026-07-10).** App live sebagai **HealthyMuch** di
> https://healthymuch.prahastagiri.com (domain custom aktif). Semua tercapai:
> reset password, pesan error Indonesia, CI hijau, Sentry (DSN aktif di
> production), Vercel Analytics (toggle aktif), privacy+terms, SEO
> (metadata/OG/sitemap/robots), feedback aksi simpan/export & hapus history.
> Uji alur auth end-to-end di production LULUS oleh owner. Definition of Done
> terpenuhi. Catatan untuk Fase 2: sebelum menulis kode entitlement/pembayaran
> (Fase 3), lakukan dulu migrasi bertahap JS → TypeScript (lihat Keputusan Tech
> Stack di bawah).

---

## Fase 2 — Nilai Berulang (dari kalkulator jadi tracker)

Ini fase yang menciptakan alasan orang **kembali** — prasyarat mutlak freemium.
Tanpa fase ini tidak ada yang layak dibayar.

- [x] Grafik tren berat & BMI di halaman history (2026-07-11): `components/bmi/
      BmiTrendChart.js` — SVG mandiri tanpa library, toggle BMI/Berat, pita zona BMI
      normal 18,5–24,9 (dan zona berat sehat untuk mode berat, dari tinggi terakhir),
      empty state <3 data mengajak mengukur rutin. Terverifikasi via DOM (path, band,
      toggle) dengan data contoh.
- [x] Estimasi waktu ke berat target di kartu hasil (2026-07-11): `estimateTimeToTarget`
      di `lib/calculations.js` — defisit efektif `dailyCalories − maintenanceCalories`,
      7.700 kkal/kg, target = batas range normal terdekat. Status in_range/no_timeline/
      direction_mismatch + override target pribadi. Tampil di kartu hasil (kalkulator &
      detail history). Unit test lengkap; terverifikasi live (overweight → "sekitar N
      bulan menurunkan berat ...").
- [x] Tabel `profiles` (2026-07-11): nama tampilan + target berat pribadi opsional
      (override target default). Schema + RLS di `supabase/schema.sql`, editor
      `components/bmi/ProfileCard.js` di history, helper `lib/profile.js`. Render +
      validasi terverifikasi via DOM. **Aksi owner: jalankan ulang seluruh
      `supabase/schema.sql` di SQL Editor Supabase production** (menambah tabel
      `profiles` + policy) — sebelum itu fitur profil tampil tapi simpan/muat gagal
      (ditangani gracefully, app tidak rusak).
- [x] Cegah duplikat wajar (2026-07-11): konfirmasi (`window.confirm`) jika sudah ada
      entri hari ini sebelum menyimpan lagi — di `handleSave` (useBmiAnalyzer).
- [x] Unit test untuk semua rumus baru (2026-07-11): estimateTimeToTarget (7 kasus).
      Total suite 22 tes hijau.

**Definition of Done:** pengguna yang menyimpan ≥3 hasil melihat grafik progres dan
proyeksi waktu ke target; kamu sendiri memakai aplikasi ini tiap minggu.

> ✅ **FASE 2 SELESAI (2026-07-13).** Migrasi DB (tabel `profiles` + RLS)
> dijalankan owner di Supabase SQL Editor, kode di-push ke production, uji
> end-to-end LULUS oleh owner: grafik tren tampil, estimasi target tampil, profil
> (nama + target pribadi) tersimpan, konfirmasi duplikat harian muncul, history
> lengkap. Definition of Done terpenuhi. Catatan: sebelum Fase 3
> (entitlement/pembayaran), migrasi bertahap JS → TS dulu (lihat Keputusan
> Tech Stack).

---

## Fase 3 — Gating Free vs Premium (tanpa pembayaran dulu)

Pisahkan tier lebih dulu, validasi minat, baru bangun pembayaran. Gerbang murah
sebelum investasi mahal.

- [x] Definisikan tier di satu file konfigurasi (2026-07-22): `lib/tiers.ts` —
      FREE_SAVE_LIMIT=10, FREE_CHART_DAYS=30, harga premium, daftar PREMIUM_FEATURES,
      helper `isPremium`/`saveLimitFor` (+ 7 unit test). **Free** = hitung unlimited,
      simpan 10 hasil, grafik 30 hari. **Premium** = history & grafik unlimited,
      estimasi target, export JPG/PDF, (nanti) meal plan AI.
- [x] Entitlement sebagai **kolom di `profiles`** (2026-07-22): `plan` (default 'free')
      + `valid_until`. `lib/profile.ts` memuatnya. Plan hanya bisa diubah service_role
      (bukan dari client). Semua user default free.
- [x] Enforcement dua lapis (2026-07-22): **UI** — export terkunci + teaser estimasi
      terkunci + banner upgrade (BmiActions/BmiResult/BmiTrendChart), grafik free 30 hari;
      **DB** — trigger `enforce_free_save_limit` menolak insert bmi_histories ke-11 untuk
      free (backstop tak bisa dilewati). Client menangkap error trigger jadi ajakan upgrade.
- [x] Halaman `/upgrade` (2026-07-22): harga Rp 15rb/bulan, banding Free vs Premium,
      tombol "Gabung waitlist" → `lib/waitlist.ts` simpan email ke tabel `waitlist`
      (RLS insert publik, tanpa SELECT client). Belum ada pembayaran.
- [ ] Ukur selama 2–4 minggu: pengunjung → register → simpan rutin → klik upgrade → isi waitlist.

**Definition of Done:** funnel terukur end-to-end.
**Gerbang ke Fase 4:** ada sinyal nyata (mis. puluhan pengguna aktif mingguan ATAU
beberapa email waitlist). Jika tidak tercapai → perbaiki Fase 2/akuisisi dulu,
jangan bangun pembayaran.

> Status 2026-07-22: SEMUA KODE FASE 3 SELESAI (commit 9d1d805 + 59b3ac3),
> tsc/29 tes/lint/build hijau, gating teruji di browser (user free: BMI tampil,
> estimasi terkunci, banner upgrade, /upgrade render). **Belum di-push & belum
> migrasi DB.** Prasyarat: (1) owner jalankan ulang `supabase/schema.sql`
> (kolom plan/valid_until, trigger batas simpan, tabel waitlist), (2) push,
> (3) uji e2e free vs premium (set 1 profil ke plan='premium' via dashboard utk
> uji sisi premium), (4) mulai fase ukur 2-4 minggu. Premium diset MANUAL sampai
> Fase 4 (pembayaran).

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
- **Migrasi JS → TypeScript — ✅ SELESAI (2026-07-21).** Seluruh kode (46 file:
  lib, komponen UI + BMI, hook, semua halaman app, config Sentry/instrumentation/
  vitest) dimigrasikan ke `.ts`/`.tsx`. Tidak ada file `.js` tersisa (hanya
  `.mjs` config). `tsconfig.json` strict; `tsc --noEmit` bersih, 22 tes hijau,
  lint & build hijau. Belum di-push. Alasan migrasi: kesalahan tipe di kode
  billing/entitlement (Fase 3+) berdampak uang. Sekarang siap masuk Fase 3.

---

## Prinsip yang dijaga di semua fase

1. **Disclaimer medis** tetap tampil di semua permukaan hasil, gratis maupun berbayar.
2. **Jangan simpan yang tidak perlu** — data kesehatan adalah tanggung jawab; minimal viable data.
3. **Setiap fase harus deployable** — tidak ada branch panjang yang hidup berminggu-minggu.
4. **Ukur sebelum membangun** — analytics dari Fase 1 adalah hakim untuk semua keputusan setelahnya.
