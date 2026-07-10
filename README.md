## HealthyMuch

> Sebelumnya bernama "BMI Analyzer" — rebrand 2026-07-10 mengikuti domain
> production **https://healthymuch.prahastagiri.com**. Nama folder repo dan
> tabel database tidak berubah.

Aplikasi web untuk menghitung **BMI + analisis nutrisi dasar** (kalori, protein, lemak), dengan aturan produk:

- User boleh hitung tanpa login
- User **wajib login hanya jika** ingin **menyimpan** hasil atau **export** hasil (JPG/PDF)
- Riwayat (history) hanya untuk user yang sudah login

Stack:
- Next.js App Router (JavaScript)
- Tailwind CSS + komponen UI bergaya shadcn
- Supabase Auth + Supabase Postgres (RLS)

## Fitur
- Kalkulator BMI + kategori
- Berat ideal (target) + **range** berat ideal
- BMR (Mifflin-St Jeor) + target kalori harian
- Target protein & lemak harian
- Save hasil ke Supabase (tabel `bmi_histories`)
- History list + **detail view** (bisa export ulang, dan “gunakan lagi di kalkulator”)
- Export:
  - JPG: `html-to-image`
  - PDF: browser print dialog (“Save as PDF”)

## Setup Lokal

### 1) Install dependency

```bash
npm install
```

### 2) Siapkan environment variable

Copy `.env.example` ke `.env.local`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Catatan:
- File `.env.local` **jangan** di-commit.
- Jika env belum diisi, app akan berjalan dalam **mode demo** (kalkulator aktif, auth/history/save/export dibatasi).

### 3) Setup Supabase (Auth + Database)

Di dashboard Supabase:
- Buat project Supabase
- Aktifkan Email/Password auth
- Jalankan SQL schema dari file `supabase/schema.sql` (SQL Editor)

Schema membuat tabel:
- `public.bmi_histories`

…dengan RLS policy supaya user hanya bisa baca/insert data miliknya sendiri.

### 4) Jalankan app

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Commands yang Dipakai

```bash
npm run lint
npm run build
npm test
```

## Testing

Project memakai `vitest` untuk test formula inti.

- Test file: `lib/calculations.test.js`

Jalankan:

```bash
npm test
```

## Deploy (ringkas)

### Deploy ke Vercel
- Push repo ke GitHub
- Import project di Vercel
- Isi Environment Variables di Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Catatan:
- Kamu tetap perlu menjalankan `supabase/schema.sql` di project Supabase yang dipakai deploy.
- Pastikan URL project Supabase benar (prod vs dev).

## Referensi Dokumentasi Internal

- `PROGRAMMER_GUIDE.md`: arsitektur, flow, dan titik masuk perubahan fitur
- `PLAN.md`, `FRONTEND.md`, `BACKEND.md`, `DATABASE.md`: requirement & desain tahap awal

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
