'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with Brand */}
      <div className="w-full py-4 px-8 flex justify-center sm:justify-start items-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <Link href="/">
          <Image
            src="/logo_title.svg"
            alt="The Pusaka Newsletter"
            width={150}
            height={56}
            className="h-14 w-auto cursor-pointer"
            style={{
              filter: 'brightness(0) invert(1)'
            }}
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="max-w-4xl mx-auto">
          <div style={{ 
              backgroundColor: 'var(--primary-light)',
              boxShadow: 'var(--shadow-card)'
            }} className="rounded-xl p-8">
            
            <div className="text-center mb-8">
              <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-gray-600">
                How we collect, use, and protect your personal information
              </p>
            </div>

            {/* English Version */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                English Version
              </h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <section>
                  <p className="mb-4">
                    Pusaka Newsletter ("we", "us", "our") is committed to protecting your privacy as a visitor and subscriber to our newsletter. This Privacy Policy explains how we collect, use, and protect your personal information, particularly in relation to our email newsletter subscription feature.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Email Address:</strong> When you subscribe to our newsletter through our website, we collect your email address.</li>
                    <li><strong>Additional Data:</strong> If you voluntarily provide additional information (like your name), we may store it contextually.</li>
                    <li><strong>Usage Data:</strong> We may collect data on how you interact with our newsletter (e.g., email opens, link clicks).</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Purpose of Data Use</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Newsletter Delivery:</strong> Your email address is used to send newsletters containing news, articles, and updates from Pusaka Newsletter.</li>
                    <li><strong>Communication:</strong> We may contact you for matters related to the newsletter or our services.</li>
                    <li><strong>Analytics:</strong> Usage data may be used to improve content and user experience.</li>
                    <li><strong>Promotions (with Consent):</strong> If you opt-in, we may send promotional offers or special offers.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Data Sharing</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Third Parties:</strong> We do not sell or rent your email address to third parties without your consent, except:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>As required by law.</li>
                        <li>For service providers (like email marketing platforms), bound by confidentiality obligations.</li>
                      </ul>
                    </li>
                    <li><strong>Service Partners:</strong> Providers like email marketing platforms may have limited access for operational purposes.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Protection:</strong> We implement security measures to protect your data.</li>
                    <li><strong>Risk:</strong> Though we strive to protect data, no system is entirely immune to risks.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Your Choices</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Unsubscribe:</strong> You can unsubscribe from our newsletter at any time by clicking the unsubscribe link in our emails.</li>
                    <li><strong>Access and Correction:</strong> You may have rights to access and request correction of your data under applicable laws.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Cookies and Tracking Technologies</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Use:</strong> Our website may use cookies to enhance user experience.</li>
                    <li><strong>Options:</strong> You can manage cookie preferences through your browser settings.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Changes to Privacy Policy</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Updates:</strong> We may update this Privacy Policy from time to time.</li>
                    <li><strong>Notice:</strong> Changes will be posted on this website; continued use signifies acceptance.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Governing Law</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Jurisdiction:</strong> This policy is governed by the laws of Indonesia.</li>
                    <li><strong>Dispute Resolution:</strong> Disputes will be resolved according to applicable mechanisms.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h3>
                  <p>
                    For questions about this Privacy Policy or our data practices, contact us at:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li><strong>Email:</strong> <a href="mailto:tpadmin@thepusaka.id" className="text-blue-600 hover:underline">tpadmin@thepusaka.id</a></li>
                  </ul>
                </section>
              </div>
            </div>

            {/* Indonesian Version */}
            <div className="border-t-2 border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Versi Bahasa Indonesia
              </h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <section>
                  <p className="mb-4">
                    Pusaka Newsletter ("kami", "kita") berkomitmen untuk melindungi privasi Anda sebagai pengunjung dan pelanggan newsletter kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda, terutama terkait fitur subscribe email newsletter kami.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Informasi yang Kami Kumpulkan</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Alamat Email:</strong> Ketika Anda berlangganan (subscribe) newsletter kami melalui website, kami mengumpulkan alamat email Anda.</li>
                    <li><strong>Data Tambahan:</strong> Jika Anda memberikan informasi tambahan secara sukarela (seperti nama), kami mungkin menyimpannya sesuai konteks.</li>
                    <li><strong>Data Penggunaan:</strong> Kami mungkin mengumpulkan data tentang bagaimana Anda berinteraksi dengan newsletter kami (misalnya, pembukaan email, klik link).</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Tujuan Penggunaan Informasi</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Pengiriman Newsletter:</strong> Alamat email digunakan untuk mengirim newsletter berisi berita, artikel, dan pembaruan dari Pusaka Newsletter.</li>
                    <li><strong>Komunikasi:</strong> Kami mungkin menghubungi Anda untuk keperluan terkait newsletter atau layanan kami.</li>
                    <li><strong>Analisis:</strong> Data penggunaan dapat digunakan untuk meningkatkan konten dan pengalaman pengguna.</li>
                    <li><strong>Promosi (dengan Persetujuan):</strong> Jika Anda setuju, kami mungkin mengirim promosi atau penawaran khusus.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Berbagi Informasi</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Pihak Ketiga:</strong> Kami tidak menjual atau menyewakan alamat email Anda kepada pihak ketiga tanpa izin Anda, kecuali:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Diperlukan oleh hukum.</li>
                        <li>Untuk layanan yang kami gunakan (seperti penyedia email marketing), dengan kewajiban kerahasiaan.</li>
                      </ul>
                    </li>
                    <li><strong>Mitra Layanan:</strong> Penyedia jasa seperti penyedia platform email marketing mungkin memiliki akses terbatas untuk operasional.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Keamanan Data</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Perlindungan:</strong> Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda.</li>
                    <li><strong>Risiko:</strong> Meskipun kami berusaha melindungi data, tidak ada sistem yang sepenuhnya kebal terhadap risiko.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Pilihan Anda</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Berhenti Berlangganan (Unsubscribe):</strong> Anda dapat berhenti berlangganan newsletter kapan saja dengan mengklik tautan unsubscribe di email kami.</li>
                    <li><strong>Akses dan Koreksi:</strong> Anda mungkin memiliki hak untuk mengakses dan meminta koreksi data Anda sesuai hukum yang berlaku.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Cookie dan Teknologi Pelacakan</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Penggunaan:</strong> Website kami mungkin menggunakan cookie untuk meningkatkan pengalaman pengguna.</li>
                    <li><strong>Pilihan:</strong> Anda dapat mengatur preferensi cookie melalui browser Anda.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Perubahan Kebijakan Privasi</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Update:</strong> Kami mungkin memperbarui Kebijakan Privasi ini sewaktu-waktu.</li>
                    <li><strong>Pemberitahuan:</strong> Perubahan akan diposting di website ini; lanjutkan menggunakan berarti Anda menerima perubahan.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Hukum yang Berlaku</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Jurisdiksi:</strong> Kebijakan ini diatur oleh hukum Indonesia.</li>
                    <li><strong>Penyelesaian Sengketa:</strong> Sengketa akan diselesaikan sesuai mekanisme yang berlaku.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Kontak</h3>
                  <p>
                    Untuk pertanyaan tentang Kebijakan Privasi ini atau praktik data kami, hubungi kami di:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li><strong>Email:</strong> <a href="mailto:tpadmin@thepusaka.id" className="text-blue-600 hover:underline">tpadmin@thepusaka.id</a></li>
                  </ul>
                </section>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-x-4">
              <Link 
                href="/terms"
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link 
                href="/register"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center sm:text-left py-4 px-8">
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">© The Pusaka Newsletter</p>
      </div>
    </div>
  )
}
