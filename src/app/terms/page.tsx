'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with Brand */}
      <div className="w-full py-2 sm:py-3 px-4 sm:px-6 flex justify-center sm:justify-start items-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <Link href="/">
          <Image
            src="/logo_title.svg"
            alt="The Pusaka Newsletter"
            width={120}
            height={45}
            className="h-10 sm:h-12 w-auto cursor-pointer"
            style={{
              filter: 'brightness(0) invert(1)'
            }}
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="max-w-3xl mx-auto">
          <div style={{ 
              backgroundColor: 'var(--primary-light)',
              boxShadow: 'var(--shadow-card)'
            }} className="rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8">
            
            <div className="text-center mb-6 sm:mb-8">
              <h1 style={{ color: 'var(--text-primary)' }} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">
                Terms and Conditions
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Pusaka Newsletter Terms and Conditions
              </p>
            </div>

            {/* English Version */}
            <div className="mb-8 sm:mb-10">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5 pb-2 border-b border-gray-200">
                English Version
              </h2>
              
              <div className="space-y-4 sm:space-y-5 text-gray-700 leading-relaxed text-sm sm:text-base">
                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">1. Introduction</h3>
                  <p className="mb-0">
                    By subscribing to the Pusaka Newsletter ("Newsletter") from Pusaka Newsletter ("we", "us", "our"), you agree to these Terms and Conditions ("Terms").
                  </p>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">2. Definitions</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Newsletter:</strong> Refers to the periodic email content we send with information, or updates.</li>
                    <li><strong>Subscriber:</strong> You, the user who registers to receive the Newsletter.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">3. Subscription</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Process:</strong> Subscription is done by entering your email address on the subscription form at our website.</li>
                    <li><strong>Confirmation:</strong> We may send a confirmation email to verify your email address.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">4. Content and Frequency</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Content Type:</strong> The Newsletter may include news, articles, or other information related to our field.</li>
                    <li><strong>Frequency:</strong> The Newsletter is sent biweekly or as per our policy.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">5. Rights and Obligations</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Email Sending:</strong> We have the right to send the Newsletter to the email address you provide.</li>
                    <li><strong>Email Accuracy:</strong> You are responsible for ensuring the email address provided is valid.</li>
                    <li><strong>Changes:</strong> We may change the content or frequency of the Newsletter without prior notice.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">6. Privacy and Data</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Data Use:</strong> Your data (including email address) is used in accordance with our <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>.</li>
                    <li><strong>Data Protection:</strong> We implement measures to protect your data.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">7. Unsubscribe</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Method:</strong> You can unsubscribe by clicking the "Unsubscribe" link typically found at the bottom of each Newsletter email.</li>
                    <li><strong>Timing:</strong> Unsubscription is usually effective within 1-2 business days.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">8. Limitation of Liability</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Technical:</strong> We do not guarantee the availability or technical accuracy of email delivery.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">9. Governing Law</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Jurisdiction:</strong> These Terms are governed by the laws of Indonesia.</li>
                    <li><strong>Dispute Resolution:</strong> Disputes will be resolved according to applicable mechanisms.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">10. Changes to Terms</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Updates:</strong> We may modify these Terms at any time.</li>
                    <li><strong>Notice:</strong> Changes are effective upon posting; continued subscription signifies acceptance.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">11. Contact</h3>
                  <p className="mb-0">
                    For questions about the Newsletter or these Terms, contact us at <a href="mailto:tpadmin@thepusaka.id" className="text-blue-600 hover:underline font-medium">tpadmin@thepusaka.id</a>.
                  </p>
                </section>
              </div>
            </div>

            {/* Indonesian Version */}
            <div className="border-t border-gray-200 pt-6 sm:pt-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5 pb-2 border-b border-gray-200">
                Versi Bahasa Indonesia
              </h2>
              
              <div className="space-y-4 sm:space-y-5 text-gray-700 leading-relaxed text-sm sm:text-base">
                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">1. Latar Belakang</h3>
                  <p className="mb-0">
                    Dengan berlangganan Pusaka Newsletter ("Newsletter") dari Pusaka Newsletter ("kami", "kita"), Anda menyetujui Terms and Conditions ("Ketentuan") ini.
                  </p>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">2. Definisi</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Newsletter:</strong> Merujuk pada konten email berkala yang kami kirim berisi informasi, atau pembaruan.</li>
                    <li><strong>Pelanggan:</strong> Anda sebagai pengguna yang mendaftar untuk menerima Newsletter.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">3. Pendaftaran</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Proses:</strong> Pendaftaran dilakukan dengan memasukkan alamat email pada formulir langganan di website kami.</li>
                    <li><strong>Konfirmasi:</strong> Kami mungkin mengirim email konfirmasi untuk verifikasi alamat email Anda.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">4. Konten dan Frekuensi</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Jenis Konten:</strong> Newsletter mungkin berisi berita, artikel, atau informasi lain terkait bidang kami.</li>
                    <li><strong>Frekuensi:</strong> Newsletter dikirim dua mingguan atau sesuai kebijakan kami.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">5. Hak dan Kewajiban</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Kirim Email:</strong> Kami berhak mengirim Newsletter ke alamat email yang Anda daftarkan.</li>
                    <li><strong>Akurasi Email:</strong> Anda bertanggung jawab memastikan alamat email yang diberikan valid.</li>
                    <li><strong>Perubahan:</strong> Kami dapat mengubah konten atau frekuensi Newsletter tanpa pemberitahuan sebelumnya.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">6. Privasi dan Data</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Penggunaan Data:</strong> Data Anda (termasuk alamat email) digunakan sesuai dengan <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Kebijakan Privasi kami</Link>.</li>
                    <li><strong>Perlindungan Data:</strong> Kami menerapkan langkah-langkah untuk melindungi data Anda.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">7. Berhenti Berlangganan (Unsubscribe)</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Cara:</strong> Anda dapat berhenti berlangganan dengan mengklik tautan "Unsubscribe" di bagian bawah setiap email Newsletter.</li>
                    <li><strong>Waktu:</strong> Proses berhenti berlangganan biasanya efektif dalam 1-2 hari kerja.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">8. Keterbatasan Tanggung Jawab</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Teknis:</strong> Kami tidak menjamin ketersediaan atau kebenaran teknis pengiriman email.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">9. Hukum yang Berlaku</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Jurisdiksi:</strong> Ketentuan ini diatur oleh hukum Indonesia.</li>
                    <li><strong>Penyelesaian Sengketa:</strong> Sengketa akan diselesaikan sesuai mekanisme yang berlaku.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">10. Perubahan Ketentuan</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                    <li><strong>Update:</strong> Kami dapat mengubah Ketentuan ini sewaktu-waktu.</li>
                    <li><strong>Pemberitahuan:</strong> Perubahan efektif setelah diposting; lanjutkan berlangganan berarti Anda menerima perubahan.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">11. Kontak</h3>
                  <p className="mb-0">
                    Untuk pertanyaan tentang Newsletter atau Ketentuan ini, hubungi kami di <a href="mailto:tpadmin@thepusaka.id" className="text-blue-600 hover:underline font-medium">tpadmin@thepusaka.id</a>.
                  </p>
                </section>
              </div>
            </div>

            {/* Back to Register Button */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
              <Link 
                href="/register"
                className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center sm:text-left py-3 sm:py-4 px-4 sm:px-8">
        <p style={{ color: 'var(--text-muted)' }} className="text-xs sm:text-sm">© The Pusaka Newsletter</p>
      </div>
    </div>
  )
}
