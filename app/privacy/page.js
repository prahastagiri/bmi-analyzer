import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi",
  description:
    "Data apa yang disimpan BMI Analyzer, di mana disimpan, dan hak kamu atas data tersebut.",
};

/**
 * Static privacy-policy page. Content is intentionally short and honest:
 * it only describes what the app actually stores and does.
 *
 * @returns {import("react").JSX.Element}
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-slate-900">
        Kebijakan Privasi
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Berlaku sejak 10 Juli 2026.
      </p>

      <div className="mt-8 space-y-8 text-slate-700">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Data yang kami simpan
          </h2>
          <p>
            Kalkulator BMI bisa dipakai tanpa akun — dalam mode itu seluruh
            perhitungan terjadi di browser-mu dan tidak ada data yang dikirim
            atau disimpan di server.
          </p>
          <p>Jika kamu membuat akun dan menyimpan hasil, kami menyimpan:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Alamat email (untuk login dan reset password).</li>
            <li>
              Data pengukuran yang kamu simpan: tinggi, berat, usia, jenis
              kelamin, tingkat aktivitas, beserta hasil perhitungannya (BMI,
              berat ideal, kebutuhan kalori dan makronutrien).
            </li>
          </ul>
          <p>
            Kami tidak meminta nama lengkap, alamat, atau data identitas
            lainnya, dan kami tidak menjual atau membagikan datamu ke pihak
            ketiga.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Di mana data disimpan
          </h2>
          <p>
            Akun dan riwayat pengukuran disimpan di{" "}
            <a
              href="https://supabase.com"
              className="font-medium text-sky-700"
              rel="noreferrer"
              target="_blank"
            >
              Supabase
            </a>
            . Akses data dibatasi per akun: setiap pengguna hanya bisa membaca
            dan menghapus riwayat miliknya sendiri.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
          <p>
            Kami memakai Vercel Analytics untuk menghitung jumlah kunjungan
            halaman secara agregat. Alat ini tidak memakai cookie pelacak dan
            tidak membuat profil individual pengunjung.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Hak kamu</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Kamu bisa menghapus setiap entri riwayat kapan saja lewat{" "}
              <Link href="/history" className="font-medium text-sky-700">
                halaman riwayat
              </Link>
              . Penghapusan bersifat permanen.
            </li>
            <li>
              Untuk penghapusan akun sepenuhnya, hubungi kami melalui email di
              bawah — akun beserta seluruh riwayatnya akan dihapus.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Kontak</h2>
          <p>
            Pertanyaan tentang privasi atau permintaan penghapusan akun:{" "}
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
