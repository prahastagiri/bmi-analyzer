# Alur Autentikasi (Daftar & Login)

Dokumen ini menjelaskan alur **daftar (register)** dan **login**, serta bagaimana komunikasi dengan **Supabase** terjadi dari awal pendaftaran sampai user benar-benar punya sesi login.

## File yang Terlibat

| Lapisan | File | Peran |
|---|---|---|
| Konfigurasi Supabase | `lib/supabase.js` | Membuat client Supabase (singleton) + cek env |
| Penyedia sesi global | `components/auth-provider.js` | Menyimpan `session`/`user` dan mendengarkan perubahan auth |
| Pemasangan provider | `app/layout.js` | Membungkus seluruh app dengan `AuthProvider` |
| Halaman daftar | `app/register/page.js` | Form daftar + memanggil `supabase.auth.signUp` |
| Halaman login | `app/login/page.js` | Form login + memanggil `supabase.auth.signInWithPassword` |
| Penyimpanan niat lanjutan | `lib/bmi-session.js` | Menyimpan `resumeAction` (save/export) lewat `sessionStorage` |
| Halaman terproteksi | `app/history/page.js` | Contoh halaman yang butuh `user` login |

## Fondasi: Client & Sesi

### 1. Membuat client Supabase (`lib/supabase.js`)
Aplikasi membuat **satu** client browser (singleton) memakai env publik:

- `hasSupabaseEnv()` → cek apakah `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` tersedia.
- `createSupabaseBrowserClient()` → kalau env ada, panggil `createClient(url, anonKey)` dan simpan di variabel modul agar dipakai bersama semua komponen. Kalau env tidak ada → mengembalikan `null` (**mode demo**).

Karena pakai *anon key* publik, semua komunikasi auth terjadi **langsung dari browser ke server Supabase** (tidak lewat backend sendiri).

### 2. Menyebarkan sesi ke seluruh app (`components/auth-provider.js`)
`AuthProvider` dipasang di `app/layout.js` sehingga membungkus semua halaman. Saat mount, ia:

1. Memanggil `supabase.auth.getSession()` untuk membaca sesi awal (kalau user sudah pernah login).
2. Mendaftarkan listener `supabase.auth.onAuthStateChange(...)` yang otomatis memperbarui state `session` setiap kali user login/logout.
3. Mengekspos `{ session, user, loading, authEnabled }` lewat hook `useAuth()` yang dipakai banyak komponen.

Inilah yang membuat halaman lain langsung "tahu" begitu user berhasil login, tanpa reload manual.

## Alur Daftar (Register)

Berlangsung di `app/register/page.js` → fungsi `handleSubmit`.

1. **Cegah submit default** dan reset pesan error/status.
2. **Cek mode**: kalau `authEnabled` false → tampilkan pesan "Supabase belum dikonfigurasi", berhenti.
3. **Validasi sisi klien**:
   - semua field wajib diisi
   - password minimal 6 karakter
   - `password` harus sama dengan `confirmPassword`
4. **Komunikasi ke Supabase**:

```js
const { error: signUpError } = await supabase.auth.signUp({
  email: form.email,
  password: form.password,
});
```

   Supabase membuat user baru di sistem auth-nya. Jika *email confirmation* diaktifkan di project Supabase, user perlu mengonfirmasi email sebelum bisa login.
5. **Simpan niat lanjutan (opsional)**: kalau halaman dibuka dengan `resumeAction=save|export` (mis. user tadi klik "Simpan" tanpa login), panggil `writeContinuationIntent(...)` agar aksi bisa dilanjutkan nanti.
6. **Arahkan ke login**: `router.push(loginHref)` — register **tidak** otomatis membuat sesi; user diarahkan untuk login.

## Alur Login

Berlangsung di `app/login/page.js` → fungsi `handleSubmit`.

1. **Cegah submit default** dan reset pesan.
2. **Cek mode** `authEnabled`; kalau off → pesan error, berhenti.
3. **Validasi**: email & password wajib diisi.
4. **Komunikasi ke Supabase**:

```js
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: form.email,
  password: form.password,
});
```

   Bila berhasil, Supabase mengeluarkan **sesi** (token akses + refresh) dan menyimpannya di storage browser. Listener `onAuthStateChange` di `AuthProvider` langsung menangkap sesi baru ini dan memperbarui `user` di seluruh app.
5. **Tangani niat lanjutan**: kalau ada `resumeAction` (`save`/`export`), simpan lewat `writeContinuationIntent(...)`; kalau tidak, bersihkan dengan `clearContinuationIntent()`.
6. **Redirect**: arahkan ke `nextPath` (default `/history`). Kalau ada `resumeAction`, URL tujuan diberi query `?resumeAction=...` supaya kalkulator bisa melanjutkan aksi sebelumnya, lalu `router.refresh()`.

> Catatan: kedua halaman juga punya `useEffect` yang otomatis me-redirect ke `nextPath` bila `user` sudah ada — jadi user yang sudah login tidak akan melihat form login/register lagi.

## Komunikasi dengan Supabase: Daftar → Login (Ringkas)

```
[Register Page]
   handleSubmit → supabase.auth.signUp({ email, password })
        │  (Supabase auth membuat user baru)
        ▼
   router.push("/login")        ← register TIDAK otomatis login
        │
        ▼
[Login Page]
   handleSubmit → supabase.auth.signInWithPassword({ email, password })
        │  (Supabase mengeluarkan session + token)
        ▼
[AuthProvider]
   onAuthStateChange menangkap session → set user secara global
        │
        ▼
   router.push(nextPath)  (mis. /history atau / dengan resumeAction)
```

## Bagaimana Sesi Dipakai Setelah Login

- **`useAuth()`** memberi `user` ke komponen mana pun. Contoh di `app/history/page.js`: kalau `!user` → tampilkan kartu "Login diperlukan"; kalau ada `user` → query data:

```js
const { data } = await supabase
  .from("bmi_histories")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

- **Continuation intent / `resumeAction`**: mekanisme ini menjembatani aksi yang butuh login. Saat user (yang belum login) menekan Simpan/Export di kalkulator, app menyimpan niatnya, mengarahkan ke login dengan `resumeAction`, lalu setelah login berhasil aksi tersebut dilanjutkan otomatis di halaman kalkulator. (Detail alur kalkulator ada di `ALUR-PERHITUNGAN-BMI.md`.)

## Mode Demo (tanpa Supabase)

Kalau env Supabase belum diisi:
- `hasSupabaseEnv()` → `false`, sehingga `authEnabled` juga `false`.
- `createSupabaseBrowserClient()` mengembalikan `null`.
- Form daftar & login menampilkan pesan bahwa Supabase belum dikonfigurasi.
- Fitur hitung BMI tetap berjalan; hanya daftar, login, history, save, dan export yang nonaktif.
