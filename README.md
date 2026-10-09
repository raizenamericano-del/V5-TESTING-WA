<p align="center"><img src="public/brand/logo.svg" alt="MultiWA" width="220" /></p>

# MultiWA Workspace

Ruang kerja WhatsApp mandiri untuk mengelola beberapa nomor, percakapan, kontak, media, dan otomasi. Antarmuka berbahasa Indonesia, dengan sidebar gelap, area kerja terang, serta identitas visual MultiWA.

**Versi aplikasi: 1.7.0.** Arsitektur utama tetap menggunakan Next.js 14, Baileys, Socket.io, Prisma, dan Tailwind CSS dalam satu proses Node.

## Mulai cepat

Kebutuhan: **Node.js 20 atau lebih baru**, npm, dan koneksi internet. `ffmpeg` diperlukan untuk mengonversi rekaman browser menjadi pesan suara OGG/Opus; image Docker sudah menyertakannya.

```bash
npm ci
# .env dibuat otomatis dari .env.example jika belum tersedia.
# Ubah AUTH_PASSWORD dan konfigurasi sesuai kebutuhan.
npm run db:push
npm run dev
```

Buka `http://localhost:3000`, masuk menggunakan kredensial dari `.env`, lalu pilih **Hubungkan nomor**.

**Penting:** ganti kata sandi contoh `ganti-dengan-password-kuat` sebelum panel digunakan. Jika `AUTH_PASSWORD` kosong, autentikasi nonaktif dan panel dapat diakses siapa pun yang mengetahui alamatnya. Jangan menonaktifkannya pada server publik.

## Fitur

| Area | Kemampuan |
|---|---|
| Perangkat | Beberapa nomor dengan kredensial terpisah, kode penautan, alternatif QR, sambungkan ulang, putuskan, lepas perangkat, dan hapus sesi. |
| Percakapan | Pesan masuk/keluar waktu nyata, status terkirim/dibaca, pencarian, sematan, arsip, jumlah belum dibaca, riwayat, dan ekspor TXT/JSON. |
| Pesan | Teks, gambar, video, GIF, video bulat, dokumen, audio, rekaman suara, stiker, lokasi, kontak, polling, produk, dan acara. |
| Interaksi | Balasan dengan kutipan, reaksi, pesan yang diedit, teruskan teks/media, serta hapus lokal atau untuk semua orang sesuai izin WhatsApp. |
| Media | Unggah/unduh, pratinjau, pesan sekali lihat, unduh ulang, penyimpanan node media, dan retry ketika berkas belum dibagikan WhatsApp. |
| Kontak | Sinkronisasi, pengelompokan alfabet, pencarian nama/nomor, impor maksimal 50 nomor terverifikasi, dan penggabungan alamat LID. |
| Otomasi | Aturan kata kunci per nomor: mengandung, sama persis, diawali, atau regex; jeda antarbalasan, dukungan grup, dan penghitung penggunaan. |
| Webhook | POST JSON dengan filter event, tanda tangan HMAC-SHA256 melalui `x-wa-signature`, retry, status terakhir, dan pengiriman percobaan. |
| Analitik | Periode 7/14/30/90 hari, pesan masuk/keluar, percakapan teraktif, aktivitas per nomor, penyimpanan media, dan cadangan JSON. |
| Notifikasi | Suara pesan, notifikasi desktop, Web Push per perangkat, dan diagnostik izin, service worker, pendaftaran, serta percobaan pengiriman. |
| PWA | Pemasangan di desktop/ponsel, ikon dan manifest baru, cache aset statis, serta halaman ketika koneksi terputus. API privat tidak di-cache. |
| Autentikasi | Login, cookie HttpOnly bertanda tangan, middleware, proteksi API/media/websocket, dan pembatasan percobaan login. |
| Pemulihan | Reconnect, pemulihan sesi saat boot, watchdog koneksi, diagnostik, pembersihan percakapan kosong, dan perbaikan nomor kontak LID. |

Penghitung dan analitik menggunakan data server yang sebenarnya. Arsip sumber tidak menyertakan data contoh, akun, sesi WhatsApp, atau kredensial.

## Halaman aplikasi

| Alamat | Fungsi |
|---|---|
| `/` | Ikhtisar dan pengelolaan perangkat. |
| `/percakapan` | Pilihan nomor untuk membuka percakapan, termasuk riwayat perangkat yang tidak terhubung. |
| `/chat/:sessionId` | Daftar dan isi percakapan dari satu nomor. |
| `/pair` | Menambahkan atau memilih perangkat untuk ditautkan. |
| `/kontak` | Buku kontak. |
| `/otomatis` | Aturan balasan dan webhook. |
| `/analitik` | Statistik dan cadangan. |
| `/notifikasi` | Pengaturan dan diagnostik push. |
| `/docs` | Panduan operasional, pemasangan, dan keamanan. |
| `/login` | Akses ruang kerja. |

**Pintasan:** Ctrl/Cmd + K membuka pencarian menu/perangkat. Di halaman chat, pintasan tersebut tetap membuka pencarian pesan. Enter mengirim pesan, Shift + Enter membuat baris baru.

## Arsitektur

```text
Browser ── HTTP / WebSocket ── server.ts
                              ├─ Next.js App Router + API
                              ├─ Socket.io
                              └─ Baileys SessionManager ── WhatsApp
                                  ├─ Prisma ── SQLite / PostgreSQL
                                  └─ data/auth + data/media
```

- Jalankan server kustom melalui `npm run dev` atau `npm start`, **bukan** `next dev`/`next start`.
- Singleton server disimpan pada `globalThis` agar route Next.js dan server kustom memakai manager yang sama.
- Browser menggunakan URL API relatif dan koneksi Socket.io pada origin yang sama.
- SQLite digunakan untuk pengembangan lokal. PostgreSQL disarankan untuk produksi.
- Jangan jalankan backend pada fungsi serverless atau beberapa replica tanpa arsitektur penyimpanan/koneksi yang sesuai. Koneksi WhatsApp membutuhkan proses yang berjalan terus-menerus.

## Environment

Berkas `.env.example` hanya berisi konfigurasi contoh. `.env` dan variannya tidak masuk arsip.

| Variabel | Nilai awal / keterangan |
|---|---|
| `DATABASE_URL` | `file:./dev.db` untuk SQLite; `postgresql://…` untuk produksi. Provider Prisma dipilih oleh `scripts/prepare-db.mjs`. |
| `PORT` / `HOSTNAME` | `3000` / `0.0.0.0`. Untuk container, pertahankan alamat bind `0.0.0.0`. |
| `AUTH_PASSWORD` | Kata sandi panel. Contoh harus diganti. Nilai kosong menonaktifkan autentikasi. |
| `AUTH_USERNAME` | `admin`. |
| `AUTH_SECRET` | Kunci tanda tangan cookie; jika kosong, diturunkan dari kata sandi. Gunakan string acak minimal 32 karakter. |
| `AUTH_SESSION_DAYS` | `7`; opsi Tetap masuk menggunakan 30 hari. |
| `WA_AUTH_DIR` / `WA_MEDIA_DIR` | `./data/auth` / `./data/media`. |
| `WA_MAX_MEDIA_MB` | `64`. |
| `WA_AUTO_RESTORE` | `true`. |
| `WA_SYNC_FULL_HISTORY` | `false`; minta riwayat penuh saat penautan dengan mengaktifkannya. |
| `WA_HISTORY_MESSAGE_LIMIT` | `3000` per nomor. |
| `LOG_LEVEL` | `info`; opsi trace/debug/info/warn/error/silent. |
| `SOCKET_PATH` | `/api/socket/io`; default sesuai klien. Jika diubah, sesuaikan juga `NEXT_PUBLIC_SOCKET_PATH` saat build. |
| `FFMPEG_PATH` | `ffmpeg`. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Jika kosong, kunci dibuat otomatis dan disimpan di direktori data. |
| `VAPID_SUBJECT` | `mailto:admin@example.com`; ganti dengan email administrator. |
| `NEXT_PUBLIC_APP_NAME` | `MultiWA Workspace`; ditentukan saat build. |
| `NEXT_PUBLIC_APP_SHORT_NAME` | `MultiWA`; ditentukan saat build. |

Buat kunci acak:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Jika identitas produk disesuaikan, ubah juga `public/manifest.webmanifest`, ikon, dan aset pada `public/brand`, lalu build ulang. Font Manrope disertakan secara lokal pada `public/fonts`; tidak ada permintaan font eksternal saat aplikasi dibuka. Lisensi font tersedia dalam folder tersebut.

## Produksi lokal / VPS

```bash
npm ci
# Atur .env, pastikan kata sandi tidak memakai nilai contoh.
npm run db:push
npm run build
npm start
```

Tempatkan reverse proxy HTTPS di depan port aplikasi dan izinkan upgrade WebSocket. Cadangkan database dan direktori runtime sebelum mengubah skema atau memperbarui aplikasi.

## Railway

Konfigurasi `railway.json`, `nixpacks.toml`, dan Dockerfile tetap tersedia.

1. Unggah sumber ke repositori Anda.
2. Pada Railway, pilih **New Project → Deploy from GitHub repo**.
3. Tambahkan PostgreSQL dan referensikan `DATABASE_URL` pada layanan aplikasi.
4. Tambahkan volume permanen di **`/app/data`**.
5. Atur `AUTH_PASSWORD`, `AUTH_USERNAME`, serta `AUTH_SECRET`.
6. Deploy menggunakan Dockerfile dan buat domain HTTPS.
7. Masuk dan hubungkan nomor WhatsApp.

**Volume dan database adalah dua hal berbeda.** PostgreSQL menyimpan data panel; volume menyimpan kredensial perangkat, media, dan kunci push. Tanpa volume, penautan perangkat dapat hilang setelah redeploy. Jalankan satu service aplikasi. Probe kesehatan tersedia pada `/healthz` dan `/api/health`.

## Penautan nomor

1. Pilih **Hubungkan nomor**, masukkan nomor internasional, dan isi nama perangkat jika diperlukan.
2. Pada halaman perangkat, pilih **Minta kode**.
3. Pada ponsel utama: **WhatsApp → Pengaturan / menu ⋮ → Perangkat Tertaut → Tautkan perangkat → Tautkan dengan nomor telepon**.
4. Masukkan kode sebelum kedaluwarsa. QR tetap ditampilkan sebagai alternatif jika tersedia.
5. Setelah Terhubung, buka Percakapan.

Awalan `0` untuk nomor Indonesia diubah menjadi `62`. Penautan nyata membutuhkan nomor dan ponsel utama; pengujian otomatis memakai socket WhatsApp tiruan dan tidak menautkan akun pengguna.

## Notifikasi

Gunakan HTTPS. Pada iPhone/iPad, pasang melalui Safari → Bagikan → Tambahkan ke Layar Utama, lalu jalankan dari ikon tersebut sebelum meminta izin push.

Buka **Notifikasi**, pilih Aktifkan di perangkat ini, lalu kirim percobaan. Ikon lonceng di header menyediakan preferensi suara dan desktop. Push untuk pesan baru ditahan pada perangkat yang panelnya sedang terlihat; perangkat lain tetap dapat menerima. Pesan hasil impor riwayat tidak menimbulkan push massal.

Panduan lebih rinci: [`PANDUAN-NOTIFIKASI.md`](PANDUAN-NOTIFIKASI.md).

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm ci` | Instalasi sesuai lockfile dan pembuatan Prisma Client. |
| `npm run dev` | Server pengembangan dengan hot reload. |
| `npm run build` | Build produksi. |
| `npm start` | Sinkronisasi skema dan server produksi. |
| `npm run db:push` | Sinkronisasi database. |
| `npm run db:studio` | Prisma Studio. |
| `npm run typecheck` | Pemeriksaan TypeScript. |
| `npm test` | 162 pemeriksaan fungsional backend/gateway memakai socket WhatsApp tiruan. |
| `npm run test:presentation` | Pemeriksaan identitas, aset, lokalisasi error, dan tujuan aman setelah login. |
| `npm run test:archive` | Pemeriksaan ZIP, CRC, file baru, dan pengecualian data privat. |
| `npm run check` | Typecheck serta tes presentasi dan arsip. |
| `npm run zip` | Arsip sumber bersih `MultiWA-Workspace.zip`, tanpa memerlukan Git atau utilitas zip tambahan. |

Jalankan `db:push` sebelum tes fungsional. Tes membuat dan membersihkan record pada database yang dipilih `DATABASE_URL`; **gunakan database pengujian terpisah, bukan database produksi**. Contoh Linux/macOS:

```bash
DATABASE_URL="file:./test.db" npm run db:push
DATABASE_URL="file:./test.db" npm test
```

## Struktur sumber

```text
app/                     Halaman dan route API
components/              Layout, identitas, dashboard, chat, dan UI bersama
hooks/                   Data SWR, socket, notifikasi, dan push
lib/                     Auth, Prisma, Baileys, media, webhook, dan utilitas
public/brand/            Logo dan monogram SVG
public/fonts/            Font lokal dan lisensinya
public/                  Ikon PWA, manifest, dan service worker
prisma/schema.prisma     Skema SQLite / PostgreSQL
scripts/                 Persiapan database dan ZIP lintas platform
tests/                   Pengujian fungsional, presentasi, dan arsip
```

## Pemecahan masalah

| Gejala | Pemeriksaan |
|---|---|
| Kode penautan belum tersedia | Periksa format nomor dan jaringan ponsel. Tunggu hingga socket siap lalu minta ulang kode. |
| Status terhubung, tetapi pesan tidak masuk | Jalankan diagnostik dari menu perangkat. Periksa `socket.isLive`, counter event, dan recentEvents. Gunakan Sambungkan ulang jika socket tidak aktif. |
| Tidak dapat masuk | Periksa nilai AUTH_USERNAME/AUTH_PASSWORD. Jika percobaan terlalu sering, tunggu masa pembatasan sebelum mencoba kembali. |
| Sesi hilang setelah deploy | Periksa volume `/app/data`, PostgreSQL produksi, dan WA_AUTO_RESTORE. |
| Rekaman suara menjadi berkas biasa | Pastikan ffmpeg tersedia pada server. |
| Media tidak dapat diunduh | Ketersediaan mengikuti WhatsApp. Media lama atau URL kedaluwarsa tidak selalu dapat diambil ulang; periksa alasan dan tombol Coba lagi. |
| Kontak/riwayat belum lengkap | Tunggu sinkronisasi atau pesan baru. WA_SYNC_FULL_HISTORY berlaku untuk penautan berikutnya; pertimbangkan penggunaan memori. |
| Notifikasi tidak muncul | Periksa HTTPS, izin situs/sistem, pemasangan iOS, service worker, dan diagnostik pada Notifikasi. |
| Koneksi waktu nyata terputus | Periksa reverse proxy WebSocket. Panel menggunakan polling berkala sebagai cadangan. |

## Arsip bersih

`npm run zip` menyertakan sumber, file baru yang belum di-stage, lockfile, `.env.example`, konfigurasi deploy, serta lisensi. Direktori teratas arsip adalah `MultiWA-Workspace/`.

Tidak disertakan: `.git`, `node_modules`, `.next`, cache/build, `.env` dan variannya, database, log, laporan browser, kredensial WhatsApp, media runtime, kunci push, atau arsip lama. `.gitkeep` tetap disertakan agar struktur folder tersedia.

## Lisensi dan penggunaan

Lisensi MIT asli tetap tersedia pada [`LICENSE`](LICENSE). Lisensi font Manrope juga disertakan. Kredit personal tidak ditampilkan pada antarmuka produk.

MultiWA tidak berafiliasi dengan atau didukung oleh WhatsApp/Meta. Proyek menggunakan Baileys, pustaka tidak resmi. Otomasi WhatsApp dapat bertentangan dengan ketentuan layanan; gunakan hanya untuk nomor yang dikelola secara sah, tanpa spam, pengawasan tanpa izin, atau pesan massal yang tidak diminta. Pengguna bertanggung jawab atas kepatuhan terhadap ketentuan layanan dan hukum yang berlaku.
