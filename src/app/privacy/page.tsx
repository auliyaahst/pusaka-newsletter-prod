'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPage() {
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
        <div className="max-w-4xl mx-auto">
          <div style={{ 
              backgroundColor: 'var(--primary-light)',
              boxShadow: 'var(--shadow-card)'
            }} className="rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8">
            
            <div className="text-center mb-6 sm:mb-8">
              <h1 style={{ color: 'var(--text-primary)' }} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4">
                Privacy Policy
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                How we collect, use, and protect your personal information
              </p>
            </div>

            {/* English Version */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
                English Version
              </h2>
              
              <div className="space-y-4 sm:space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
                <section>
                  <p className="mb-4 text-sm sm:text-base bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    Pusaka Newsletter (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy as a visitor and subscriber to our newsletter. This Privacy Policy explains how we collect, use, and protect your personal information, particularly in relation to our email newsletter subscription feature.
                  </p>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">1. Information We Collect</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Email Address:</strong> When you subscribe to our newsletter through our website, we collect your email address.</li>
                    <li><strong>Additional Data:</strong> If you voluntarily provide additional information (like your name), we may store it contextually.</li>
                    <li><strong>Usage Data:</strong> We may collect data on how you interact with our newsletter (e.g., email opens, link clicks).</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">2. Purpose of Data Use</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Newsletter Delivery:</strong> Your email address is used to send newsletters containing news, articles, and updates from Pusaka Newsletter.</li>
                    <li><strong>Communication:</strong> We may contact you for matters related to the newsletter or our services.</li>
                    <li><strong>Analytics:</strong> Usage data may be used to improve content and user experience.</li>
                    <li><strong>Promotions (with Consent):</strong> If you opt-in, we may send promotional offers or special offers.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">3. Data Sharing</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Third Parties:</strong> We do not sell or rent your email address to third parties without your consent, except:
                      <ul className="list-disc list-inside ml-4 sm:ml-6 mt-1 sm:mt-2 space-y-1 text-xs sm:text-sm">
                        <li>As required by law.</li>
                        <li>For service providers (like email marketing platforms), bound by confidentiality obligations.</li>
                      </ul>
                    </li>
                    <li><strong>Service Partners:</strong> Providers like email marketing platforms may have limited access for operational purposes.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">4. Data Security</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Protection:</strong> We implement security measures to protect your data.</li>
                    <li><strong>Risk:</strong> Though we strive to protect data, no system is entirely immune to risks.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">5. Your Choices</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Unsubscribe:</strong> You can unsubscribe from our newsletter at any time by clicking the unsubscribe link in our emails.</li>
                    <li><strong>Access and Correction:</strong> You may have rights to access and request correction of your data under applicable laws.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">6. Cookies and Tracking Technologies</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Use:</strong> Our website may use cookies to enhance user experience.</li>
                    <li><strong>Options:</strong> You can manage cookie preferences through your browser settings.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">7. Changes to Privacy Policy</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Updates:</strong> We may update this Privacy Policy from time to time.</li>
                    <li><strong>Notice:</strong> Changes will be posted on this website; continued use signifies acceptance.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">8. Governing Law</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Jurisdiction:</strong> This policy is governed by the laws of Indonesia.</li>
                    <li><strong>Dispute Resolution:</strong> Disputes will be resolved according to applicable mechanisms.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">9. Contact</h3>
                  <p className="text-sm sm:text-base mb-2">
                    For questions about this Privacy Policy or our data practices, contact us at:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                    <ul className="list-disc list-inside space-y-1 ml-2 text-sm sm:text-base">
                      <li><strong>Email:</strong> <a href="mailto:tpadmin@thepusaka.id" className="text-blue-600 hover:underline">tpadmin@thepusaka.id</a></li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>

            {/* Indonesian Version */}
            <div className="border-t-2 border-gray-200 pt-6 sm:pt-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
                Versi Bahasa Indonesia
              </h2>
              
              <div className="space-y-4 sm:space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
                <section>
                  <p className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    Pusaka Newsletter (&quot;kami&quot;, &quot;kita&quot;) berkomitmen untuk melindungi privasi Anda sebagai pengunjung dan pelanggan newsletter kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda, terutama terkait fitur subscribe email newsletter kami.
                  </p>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">1. Informasi yang Kami Kumpulkan</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Alamat Email:</strong> Ketika Anda berlangganan (subscribe) newsletter kami melalui website, kami mengumpulkan alamat email Anda.</li>
                    <li><strong>Data Tambahan:</strong> Jika Anda memberikan informasi tambahan secara sukarela (seperti nama), kami mungkin menyimpannya sesuai konteks.</li>
                    <li><strong>Data Penggunaan:</strong> Kami mungkin mengumpulkan data tentang bagaimana Anda berinteraksi dengan newsletter kami (misalnya, pembukaan email, klik link).</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">2. Tujuan Penggunaan Informasi</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Pengiriman Newsletter:</strong> Alamat email digunakan untuk mengirim newsletter berisi berita, artikel, dan pembaruan dari Pusaka Newsletter.</li>
                    <li><strong>Komunikasi:</strong> Kami mungkin menghubungi Anda untuk keperluan terkait newsletter atau layanan kami.</li>
                    <li><strong>Analisis:</strong> Data penggunaan dapat digunakan untuk meningkatkan konten dan pengalaman pengguna.</li>
                    <li><strong>Promosi (dengan Persetujuan):</strong> Jika Anda setuju, kami mungkin mengirim promosi atau penawaran khusus.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">3. Berbagi Informasi</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Pihak Ketiga:</strong> Kami tidak menjual atau menyewakan alamat email Anda kepada pihak ketiga tanpa izin Anda, kecuali:
                      <ul className="list-disc list-inside ml-4 sm:ml-6 mt-1 sm:mt-2 space-y-1 text-xs sm:text-sm">
                        <li>Diperlukan oleh hukum.</li>
                        <li>Untuk layanan yang kami gunakan (seperti penyedia email marketing), dengan kewajiban kerahasiaan.</li>
                      </ul>
                    </li>
                    <li><strong>Mitra Layanan:</strong> Penyedia jasa seperti penyedia platform email marketing mungkin memiliki akses terbatas untuk operasional.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">4. Keamanan Data</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Perlindungan:</strong> Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda.</li>
                    <li><strong>Risiko:</strong> Meskipun kami berusaha melindungi data, tidak ada sistem yang sepenuhnya kebal terhadap risiko.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">5. Pilihan Anda</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Berhenti Berlangganan (Unsubscribe):</strong> Anda dapat berhenti berlangganan newsletter kapan saja dengan mengklik tautan unsubscribe di email kami.</li>
                    <li><strong>Akses dan Koreksi:</strong> Anda mungkin memiliki hak untuk mengakses dan meminta koreksi data Anda sesuai hukum yang berlaku.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">6. Cookie dan Teknologi Pelacakan</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Penggunaan:</strong> Website kami mungkin menggunakan cookie untuk meningkatkan pengalaman pengguna.</li>
                    <li><strong>Pilihan:</strong> Anda dapat mengatur preferensi cookie melalui browser Anda.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">7. Perubahan Kebijakan Privasi</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Update:</strong> Kami mungkin memperbarui Kebijakan Privasi ini sewaktu-waktu.</li>
                    <li><strong>Pemberitahuan:</strong> Perubahan akan diposting di website ini; lanjutkan menggunakan berarti Anda menerima perubahan.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">8. Hukum yang Berlaku</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-sm sm:text-base">
                    <li><strong>Jurisdiksi:</strong> Kebijakan ini diatur oleh hukum Indonesia.</li>
                    <li><strong>Penyelesaian Sengketa:</strong> Sengketa akan diselesaikan sesuai mekanisme yang berlaku.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">9. Kontak</h3>
                  <p className="text-sm sm:text-base mb-2">
                    Untuk pertanyaan tentang Kebijakan Privasi ini atau praktik data kami, hubungi kami di:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                    <ul className="list-disc list-inside space-y-1 ml-2 text-sm sm:text-base">
                      <li><strong>Email:</strong> <a href="mailto:tpadmin@thepusaka.id" className="text-blue-600 hover:underline">tpadmin@thepusaka.id</a></li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <h3 className="text-center text-base sm:text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link 
                  href="/terms"
                  target="_blank"
                  className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  📄 Terms & Conditions
                </Link>
                <Link 
                  href="/register"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  ✓ Back to Registration
                </Link>
                <a 
                  href="mailto:tpadmin@thepusaka.id"
                  className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors text-center"
                >
                  ✉️ Contact Support
                </a>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By continuing with registration, you confirm that you have read and agree to this privacy policy.
              </p>
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
