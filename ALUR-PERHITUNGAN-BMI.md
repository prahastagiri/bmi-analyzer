# Alur Perhitungan BMI

Dokumen ini menjelaskan alur dari saat user mengisi form sampai hasil analisis tampil di layar, beserta file dan fungsi yang bekerja di tiap langkah.

## Peta File yang Terlibat

| Lapisan | File | Peran |
|---|---|---|
| Halaman (entry) | `app/page.js` | Merender fitur kalkulator |
| Shell komponen | `components/bmi-analyzer.js` | Merangkai UI + memanggil hook |
| Otak / state | `hooks/useBmiAnalyzer.js` | Menyimpan state, validasi, memicu kalkulasi |
| Form UI | `components/bmi/BmiForm.js` | Input data tubuh |
| Logika hitung | `lib/calculations.js` | Validasi + rumus BMI/kalori |
| Hasil UI | `components/bmi/BmiResult.js` | Menampilkan angka hasil |
| Narasi / teks | `lib/explanations.js` | Label kategori, tips, ringkasan |
| Format angka | `lib/utils.js` | `formatNumber` |
| Persistensi | `lib/bmi-session.js` | Simpan state ke `sessionStorage` |

## Alur Langkah demi Langkah

### 1. User mengetik di form
Setiap input di `BmiForm` memanggil `updateField(field, value)` lewat event `onChange`. Fungsi ini ada di hook `useBmiAnalyzer` dan memperbarui satu field di state `form`.

Setiap perubahan `form` memicu `useEffect` yang menyimpan snapshot ke `sessionStorage` via `writePersistedCalculatorState` — agar data tidak hilang saat user diarahkan ke halaman login/register.

### 2. User klik "Hitung BMI sekarang"
Tombol `type="submit"` memicu `onSubmit={onCalculate}` pada elemen `<form>`. Handler `onCalculate` ini adalah `handleCalculate` dari hook.

### 3. Validasi
`handleCalculate` memanggil `validateCalculatorInput(form)` dari `lib/calculations.js`. Pengecekan meliputi:
- Field wajib terisi
- Tinggi, berat, dan usia harus angka positif
- Rentang realistis: tinggi 100–250 cm, berat 20–400 kg, usia 10–100 tahun

Jika validasi gagal → set `error`, proses berhenti, dan `BmiForm` menampilkan kotak pesan merah.

### 4. Kalkulasi
Jika lolos validasi, `calculateAnalysis(form)` dijalankan dan memanggil sub-fungsi secara berurutan:
- `getBmiCategory(bmi)` → kategori (`underweight` / `normal` / `overweight` / `obese`)
- `calculateIdealWeight` + `calculateIdealWeightRange` → berat ideal & rentangnya (memakai `NORMAL_BMI_TARGET`, `NORMAL_BMI_MIN`, `NORMAL_BMI_MAX`)
- `calculateBmr` → BMR (rumus Mifflin-St Jeor)
- `ACTIVITY_MULTIPLIERS[activityLevel]` → `maintenanceCalories = bmr * multiplier`
- `getBaseCaloriesDelta`, `getProteinMultiplier`, `getFatRatio`, `getMinimumCalories` → target kalori, protein, dan lemak harian
- karbohidrat harian diturunkan dari sisa kalori setelah protein (4 kkal/g) dan lemak (9 kkal/g), di-clamp minimal 0

Hasilnya berupa satu objek `AnalysisResult` yang disimpan ke state lewat `setResult(...)`.

### 5. Turunan otomatis dari `result`
`categoryContent` dihitung ulang via `useMemo` yang memanggil `getCategoryContent(result.bmiCategory)` (sumber teks di `lib/explanations.js`).

### 6. Render hasil
`BmiAnalyzer` meneruskan `result`, `categoryContent`, dan `resultRef` ke `BmiResult`. Komponen ini menampilkan:
- Angka memakai `formatNumber` (`lib/utils.js`)
- Narasi via `buildSummary(result)` dan `getActivityLabel` (`lib/explanations.js`)
- Rincian rumus via `BmiFormulaSection`

## Diagram Ringkas

```
BmiForm (onChange → updateField)              [components/bmi/BmiForm.js]
        │
        ▼
form state di useBmiAnalyzer ───► sessionStorage   [hooks/useBmiAnalyzer.js + lib/bmi-session.js]
        │ (submit → handleCalculate)
        ▼
validateCalculatorInput ──► calculateAnalysis      [lib/calculations.js]
        │
        ▼
setResult(...) ──► useMemo getCategoryContent       [lib/explanations.js]
        │
        ▼
BmiResult menampilkan (formatNumber, buildSummary)  [components/bmi/BmiResult.js]
```

## Catatan: Alur Ini Terpisah dari Save / Export

Menghitung BMI **tidak membutuhkan login**. Login baru diperlukan untuk:
- `handleSave` → insert ke tabel Supabase `bmi_histories`
- `handleExport` → export hasil ke JPG / PDF

Kedua aksi tersebut melibatkan file lain (`lib/supabase.js`, `lib/export.js`, `components/auth-provider.js`) serta mekanisme **continuation intent** (`writeContinuationIntent` / `resumeAction`) yang melanjutkan aksi secara otomatis setelah user selesai login.
