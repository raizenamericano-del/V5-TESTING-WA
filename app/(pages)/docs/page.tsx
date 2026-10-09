import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, BellRing, BookOpen, CloudUpload, Code2, HelpCircle, LockKeyhole, MessagesSquare, ShieldCheck, Smartphone, Terminal, Workflow } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { APP_VERSION } from '@/lib/branding'

export const metadata = { title: 'Panduan' }
const sections = [
  { id: 'mulai', label: 'Menghubungkan nomor' },
  { id: 'instalasi', label: 'Pemasangan lokal' },
  { id: 'railway', label: 'Deploy ke Railway' },
  { id: 'keamanan', label: 'Keamanan & data' },
  { id: 'pwa', label: 'Aplikasi & notifikasi' },
  { id: 'otomasi', label: 'Otomasi & integrasi' },
  { id: 'variabel', label: 'Konfigurasi server' },
  { id: 'bantuan', label: 'Pemecahan masalah' },
]
const envVars = [
  ['DATABASE_URL', 'SQLite untuk lokal (file:./dev.db), PostgreSQL untuk produksi. Provider dipilih otomatis.'],
  ['AUTH_PASSWORD', 'Mengaktifkan autentikasi seluruh panel, API, media, dan koneksi Socket.io. Wajib diatur untuk akses publik.'],
  ['AUTH_USERNAME', 'Nama pengguna untuk masuk. Nilai awal: admin.'],
  ['AUTH_SECRET', 'Kunci untuk menandatangani cookie sesi. Gunakan string acak minimal 32 karakter.'],
  ['AUTH_SESSION_DAYS', 'Masa berlaku login dalam hari. Nilai awal: 7. Opsi Tetap masuk berlaku 30 hari.'],
  ['PORT / HOSTNAME', 'Port HTTP dan alamat bind. Nilai awal: 3000 dan 0.0.0.0.'],
  ['WA_AUTH_DIR / WA_MEDIA_DIR', 'Direktori kredensial perangkat dan media. Nilai awal: ./data/auth dan ./data/media.'],
  ['WA_AUTO_RESTORE', 'Pulihkan koneksi perangkat saat server dimulai. Nilai awal: true.'],
  ['WA_SYNC_FULL_HISTORY', 'Minta riwayat penuh saat penautan. Nilai awal: false, untuk membatasi penggunaan sumber daya.'],
  ['WA_HISTORY_MESSAGE_LIMIT', 'Batas pesan yang diimpor per sesi dari sinkronisasi riwayat. Nilai awal: 3000.'],
  ['WA_MAX_MEDIA_MB', 'Batas ukuran media yang disimpan. Nilai awal: 64 MB.'],
  ['VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY', 'Kunci Web Push. Jika kosong, dibuat otomatis dan disimpan pada data/vapid.json.'],
  ['VAPID_SUBJECT', 'Kontak administrator untuk layanan push. Atur ke mailto:alamat-email-Anda.'],
  ['NEXT_PUBLIC_APP_NAME / NEXT_PUBLIC_APP_SHORT_NAME', 'Nama lengkap dan nama singkat produk. Nilai awal: MultiWA Workspace dan MultiWA. Ditentukan saat build.'],
  ['LOG_LEVEL', 'Tingkat log: trace, debug, info, warn, error, atau silent.'],
]

function DocsSection({ id, icon: Icon, title, children }: { id: string; icon: typeof BookOpen; title: string; children: ReactNode }) {
  return <Card id={id} className="scroll-mt-24 p-5 sm:p-7"><div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/[0.06] text-primary"><Icon className="h-[18px] w-[18px]" strokeWidth={1.6} /></span><h2>{title}</h2></div>{children}</Card>
}

export default function DocsPage() {
  return (
    <div className="page-container">
      <PageHeader eyebrow="Pusat bantuan" title="Panduan penggunaan" description="Dari penautan pertama hingga pengaturan server. Semua yang diperlukan untuk menjalankan ruang kerja Anda."><span className="rounded-lg border bg-card px-3 py-2 text-[10px] font-semibold text-muted-foreground">Versi {APP_VERSION}</span></PageHeader>
      <div className="mb-7 grid gap-3 sm:grid-cols-3">{[
        { href: '/pair', title: 'Hubungkan nomor', text: 'Mulai penautan perangkat', icon: Smartphone },
        { href: '/notifikasi', title: 'Atur notifikasi', text: 'Izin dan diagnostik perangkat', icon: BellRing },
        { href: '#keamanan', title: 'Amankan ruang kerja', text: 'Autentikasi dan penyimpanan', icon: ShieldCheck },
      ].map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"><item.icon className="h-5 w-5 shrink-0 text-[#7b9468]" strokeWidth={1.5} /><span className="flex-1"><span className="block text-[12px] font-bold">{item.title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{item.text}</span></span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></Link>)}</div>
      <div className="grid items-start gap-7 xl:grid-cols-[190px_minmax(0,1fr)]">
        <nav className="sticky top-24 hidden xl:block" aria-label="Daftar isi panduan"><p className="eyebrow mb-4 px-3">Dalam panduan ini</p>{sections.map((section) => <a key={section.id} href={`#${section.id}`} className="block rounded-lg px-3 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary">{section.label}</a>)}<p className="mt-6 border-t px-3 pt-4 text-[10px] leading-[1.8] text-muted-foreground">Konfigurasi teknis lengkap tersedia pada README di dalam proyek.</p></nav>
        <div className="docs-content min-w-0 space-y-5">
          <DocsSection id="mulai" icon={Smartphone} title="Menghubungkan nomor pertama">
            <ol className="space-y-4">{[
              ['Tambahkan nomor', 'Pada Ikhtisar, pilih Hubungkan nomor. Gunakan format internasional, misalnya 6281234567890. Nama perangkat bersifat opsional.'],
              ['Minta kode penautan', 'Konfirmasikan nomor pada halaman penautan, lalu pilih Minta kode. Kode biasanya berlaku sekitar 3 menit; sisa waktunya ditampilkan pada halaman.'],
              ['Lanjutkan pada ponsel utama', 'Buka WhatsApp → Pengaturan (menu ⋮ pada Android) → Perangkat Tertaut → Tautkan perangkat → Tautkan dengan nomor telepon. Masukkan kode. QR juga tersedia jika dikirim oleh WhatsApp.'],
              ['Mulai mengelola percakapan', 'Setelah status menjadi Terhubung, pilih Percakapan pada perangkat tersebut. Pesan, reaksi, perubahan status, dan balasan disinkronkan melalui koneksi waktu nyata.'],
            ].map(([title, text], index) => <li key={title} className="flex gap-3.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/[0.06] text-[10px] font-bold text-primary">{index + 1}</span><div><strong className="text-[12px] text-foreground">{title}</strong><p className="mt-1">{text}</p></div></li>)}</ol>
            <div className="mt-5 rounded-lg bg-muted/70 p-4"><p>Gunakan hanya nomor milik Anda atau nomor yang pemiliknya memberikan izin. Jangan membagikan kode penautan.</p></div>
          </DocsSection>
          <DocsSection id="instalasi" icon={Terminal} title="Pemasangan lokal">
            <p className="mb-4">Siapkan Node.js 20 atau lebih baru. Buka terminal pada direktori proyek, kemudian jalankan:</p>
            <pre className="docs-code"><code>{'npm ci\n# Atur AUTH_PASSWORD dan konfigurasi pada .env\nnpm run db:push\nnpm run dev'}</code></pre>
            <p className="mt-4">Berkas <code>.env</code> dibuat otomatis dari <code>.env.example</code> jika belum tersedia. Ganti kata sandi contoh sebelum menjalankan panel. Buka <code>http://localhost:3000</code>.</p>
            <p className="mt-3">Aplikasi memakai server kustom untuk Next.js, Socket.io, dan Baileys dalam satu proses. Gunakan <code>npm run dev</code>, bukan <code>next dev</code>. Untuk produksi:</p>
            <pre className="docs-code mt-4"><code>{'npm run build\nnpm start'}</code></pre>
            <p className="mt-4">Pasang <code>ffmpeg</code> agar rekaman browser dapat dikonversi menjadi pesan suara OGG/Opus. Docker sudah menyertakannya. Database SQLite lokal berada pada <code>prisma/dev.db</code>.</p>
          </DocsSection>
          <DocsSection id="railway" icon={CloudUpload} title="Deploy ke Railway">
            <ol className="list-decimal space-y-2.5 pl-4">
              <li>Unggah proyek ke repositori Anda, lalu pilih <strong className="text-foreground">New Project → Deploy from GitHub repo</strong> pada Railway.</li>
              <li>Tambahkan PostgreSQL dan tautkan <code>DATABASE_URL</code> dari layanan database ke layanan aplikasi.</li>
              <li>Tambahkan volume permanen dengan mount path <code>/app/data</code>. Volume ini menyimpan kredensial WhatsApp, media, dan kunci push.</li>
              <li>Atur <code>AUTH_PASSWORD</code>, <code>AUTH_USERNAME</code>, dan <code>AUTH_SECRET</code> pada Variables.</li>
              <li>Deploy menggunakan Dockerfile yang tersedia. Jalankan satu layanan aplikasi, lalu buat domain HTTPS melalui Settings → Networking.</li>
              <li>Buka domain, masuk, lalu hubungkan nomor WhatsApp.</li>
            </ol>
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="!text-amber-900"><strong>Volume wajib untuk sesi permanen.</strong> Tanpa volume, data perangkat dapat hilang ketika container dibuat ulang. Gunakan PostgreSQL untuk database produksi dan layanan Node yang berjalan terus-menerus, bukan fungsi serverless.</p></div>
          </DocsSection>
          <DocsSection id="keamanan" icon={LockKeyhole} title="Keamanan dan penyimpanan data">
            <p>Atur <code>AUTH_PASSWORD</code> untuk mewajibkan login pada halaman, API, media, dan koneksi Socket.io. Jika variabel ini kosong, panel terbuka untuk siapa pun yang mengetahui alamatnya.</p>
            <ul className="mt-4 list-disc space-y-2 pl-4"><li>Gunakan kata sandi panjang dan unik, HTTPS, serta <code>AUTH_SECRET</code> acak minimal 32 karakter.</li><li>Cookie login bersifat HttpOnly dan ditandatangani HMAC-SHA256. Percobaan login dibatasi untuk mengurangi percobaan tebak kata sandi.</li><li>Tombol Keluar pada akun sidebar mengakhiri sesi login. Mengganti kata sandi juga membatalkan sesi jika kunci tanda tangan menggunakan turunan kata sandi.</li><li>Jangan membagikan <code>.env</code>, database, <code>data/auth</code>, <code>data/media</code>, atau <code>data/vapid.json</code>. Cadangan JSON memuat percakapan dan harus disimpan secara privat.</li><li>Sebelum mengubah skema atau memperbarui aplikasi, buat cadangan database serta volume.</li></ul>
            <p className="mt-4">Buat kunci acak melalui terminal:</p><pre className="docs-code mt-3"><code>{'node -e "console.log(require(\'node:crypto\').randomBytes(32).toString(\'hex\'))"'}</code></pre>
          </DocsSection>
          <DocsSection id="pwa" icon={BellRing} title="Aplikasi dan notifikasi">
            <ul className="list-disc space-y-2.5 pl-4"><li><strong className="text-foreground">Android dan desktop:</strong> gunakan menu Instal aplikasi atau Tambahkan ke layar utama pada Chrome/Edge.</li><li><strong className="text-foreground">iPhone/iPad:</strong> buka melalui Safari, pilih Bagikan → Tambahkan ke Layar Utama, lalu jalankan dari ikon yang terpasang. Push memerlukan iOS 16.4 atau lebih baru.</li><li>Buka Notifikasi, pilih Aktifkan di perangkat ini, lalu izinkan saat browser meminta. Kirim notifikasi percobaan untuk memeriksa pendaftaran perangkat.</li><li>Ikon lonceng di bagian atas mengatur suara pesan, notifikasi desktop, dan notifikasi push. Pengaturan berlaku per perangkat.</li><li>Push untuk pesan baru ditahan pada perangkat yang panelnya sedang terlihat agar pemberitahuan tidak berulang. Pesan hasil impor riwayat tidak memicu push massal.</li></ul>
            <Button variant="secondary" asChild size="sm" className="mt-5"><Link href="/notifikasi">Buka diagnostik notifikasi <ArrowRight /></Link></Button>
          </DocsSection>
          <DocsSection id="otomasi" icon={Workflow} title="Otomasi dan integrasi">
            <p>Aturan balasan dibuat per nomor pada menu Otomasi. Pilih pencocokan mengandung, sama persis, diawali, atau ekspresi reguler. Aturan pertama yang cocok akan membalas pesan masuk; jeda antarbalasan membantu membatasi pengiriman berulang.</p>
            <p className="mt-3">Webhook meneruskan event sebagai <code>POST</code> JSON ke URL tujuan. Jika kunci penandatanganan diatur, verifikasi header <code>x-wa-signature: sha256=…</code> pada sistem penerima. Gunakan tombol Kirim percobaan untuk memeriksa integrasi.</p>
            <p className="mt-3">Pada menu Analitik Anda dapat melihat tren pesan, percakapan teraktif, penyimpanan media, dan mengunduh cadangan JSON. Ekspor percakapan individual tersedia melalui menu pada header percakapan.</p>
          </DocsSection>
          <DocsSection id="variabel" icon={Code2} title="Konfigurasi server">
            <div className="overflow-hidden rounded-lg border"><table className="w-full table-fixed text-left"><thead className="bg-muted/70"><tr><th className="w-[42%] px-4 py-3 text-[11px] font-semibold">Variabel</th><th className="px-4 py-3 text-[11px] font-semibold">Keterangan</th></tr></thead><tbody>{envVars.map(([name, description]) => <tr key={name} className="border-t"><td className="break-words px-4 py-3 align-top font-mono text-[10px] leading-relaxed text-primary">{name}</td><td className="px-4 py-3 text-[11px] leading-[1.8] text-muted-foreground">{description}</td></tr>)}</tbody></table></div>
            <p className="mt-4">Perubahan nama produk membutuhkan build ulang. Untuk identitas PWA kustom, sesuaikan juga <code>public/manifest.webmanifest</code> dan aset pada <code>public/brand</code>.</p>
          </DocsSection>
          <DocsSection id="bantuan" icon={HelpCircle} title="Pemecahan masalah">
            <div className="divide-y">{[
              ['Kode tidak diterima atau kedaluwarsa', 'Pastikan nomor menggunakan kode negara dan ponsel utama memiliki koneksi internet. Minta kode baru, lalu ikuti alur Tautkan dengan nomor telepon. Kode lama tidak digunakan lagi.'],
              ['Status terhubung tetapi pesan tidak masuk', 'Pada Ikhtisar → menu perangkat, pilih Jalankan diagnostik. Jika koneksi server belum aktif, gunakan Sambungkan ulang. Tombol Kirim pesan uji membantu memeriksa aliran pesan.'],
              ['Kontak kosong atau nomor masih disembunyikan', 'WhatsApp hanya membagikan kontak yang tersinkron ke perangkat. Pengirim pesan baru akan dicatat otomatis. Kontak LID dapat diperbaiki dari menu perangkat setelah WhatsApp membagikan nomor aslinya.'],
              ['Media atau pesan sekali lihat belum tersedia', 'Panel mencoba mengunduh media saat pesan masuk. Jika berkas belum dibagikan atau URL sudah kedaluwarsa, alasan ditampilkan pada pesan. Gunakan Coba lagi jika tersedia. Ketersediaan media lama tetap mengikuti batas WhatsApp.'],
              ['Notifikasi belum muncul', 'Periksa HTTPS, izin situs, pendaftaran service worker, dan izin notifikasi sistem. Buka diagnostik Notifikasi untuk melihat penolakan layanan push. Untuk uji pesan masuk, tutup panel lalu kirim dari nomor lain.'],
              ['Sesi hilang setelah deploy', 'Pastikan volume /app/data terpasang dan DATABASE_URL mengarah ke PostgreSQL produksi. Folder runtime tidak boleh masuk ke arsip sumber atau dibuang saat redeploy.'],
            ].map(([question, answer]) => <details key={question} className="group py-4"><summary className="cursor-pointer text-[12px] font-semibold text-foreground marker:text-[#88a276]">{question}</summary><p className="pl-4 pt-3">{answer}</p></details>)}</div>
          </DocsSection>
          <div className="rounded-xl border border-border bg-muted/40 p-5"><p className="text-[11px] leading-[1.9] text-muted-foreground"><strong className="text-foreground">Penggunaan yang bertanggung jawab.</strong> MultiWA bukan produk resmi WhatsApp atau Meta. Gunakan hanya dengan persetujuan pemilik nomor, tanpa spam atau pengawasan tanpa izin, serta ikuti Ketentuan Layanan WhatsApp dan hukum yang berlaku.</p></div>
        </div>
      </div>
    </div>
  )
}
