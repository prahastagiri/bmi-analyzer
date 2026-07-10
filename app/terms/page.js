import Link from "next/link";

export const metadata = {
  title: "Ketentuan Layanan — BMI Analyzer",
  description:
    "Ketentuan penggunaan BMI Analyzer: layanan gratis, batasan medis, dan tanggung jawab pengguna.",
};

/**
 * Static terms-of-service page, kept short and in plain Indonesian.
 *
 * @returns {import("react").JSX.Element}
 */
export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-slate-900">
        Ketentuan Layanan
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Berlaku sejak 10 Juli 2026.
      </p>

      <div className="mt-8 space-y-8 text-slate-700">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Tentang layanan
          </h2>
          <p>
            BMI Analyzer adalah kalkulator BMI dan kebutuhan nutrisi yang bisa
            dipakai gratis. Fitur akun (menyimpan riwayat dan export hasil)
            juga gratis saat ini; jika suatu saat ada fitur berbayar, ketentuan
            ini akan diperbarui lebih dulu.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Bukan nasihat medis
          </h2>
          <p>
            Seluruh hasil perhitungan (BMI, berat ideal, kebutuhan kalori dan
            makronutrien) dihitung dari rumus umum seperti Mifflin-St Jeor.
            Gunakan sebagai panduan umum, bukan pengganti konsultasi medis.
            Untuk keputusan kesehatan — diet, kondisi medis, kehamilan, atau
            program latihan — konsultasikan dengan dokter atau ahli gizi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Akun dan tanggung jawab pengguna
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Jaga kerahasiaan password akunmu.</li>
            <li>
              Isikan data pengukuran dengan wajar; hasil perhitungan hanya
              seakurat data yang kamu masukkan.
            </li>
            <li>
              Jangan menyalahgunakan layanan (mis. mencoba mengakses data
              pengguna lain atau membebani sistem secara sengaja).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Batasan tanggung jawab
          </h2>
          <p>
            Layanan disediakan &quot;sebagaimana adanya&quot; tanpa jaminan
            ketersediaan atau akurasi. Kami tidak bertanggung jawab atas
            keputusan kesehatan yang diambil berdasarkan hasil perhitungan di
            aplikasi ini.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Data dan privasi
          </h2>
          <p>
            Cara kami menangani datamu dijelaskan di{" "}
            <Link href="/privacy" className="font-medium text-sky-700">
              Kebijakan Privasi
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Kontak</h2>
          <p>
            Pertanyaan tentang ketentuan ini:{" "}
            <a
              href="mailto:qcumberlarry@gmail.com"
              className="font-medium text-sky-700"
            >
              qcumberlarry@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
