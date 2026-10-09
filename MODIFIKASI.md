# Ringkasan modifikasi

## Arah desain

Identitas produk: **MultiWA Workspace**. Antarmuka memakai monogram percakapan berbentuk M, sidebar warna ink, aksen lime, area kerja terang, dan font Manrope lokal. Logo SVG, favicon, ikon PWA/maskable, serta ikon layar utama diperbarui secara konsisten.

Tidak ada kredit personal pada antarmuka. Lisensi MIT asli dan lisensi font tetap disertakan.

## Bagian yang diperbarui

- Layout utama, sidebar, breadcrumb, menu seluler, pencarian cepat, preferensi notifikasi, dan akses keluar.
- Halaman masuk beserta pesan kesalahan, visibilitas kata sandi, dan tujuan navigasi yang aman.
- Ikhtisar, ringkasan statistik, pencarian/filter perangkat, kartu perangkat, serta alur penambahan nomor dua langkah.
- Halaman penautan kode/QR, instruksi perangkat utama, penghitung kedaluwarsa, dan tindakan salin.
- Halaman pilihan nomor untuk percakapan, daftar chat, gelembung pesan, perekam suara, pratinjau media, dan tata letak riwayat pada ponsel.
- Kontak, balasan otomatis/webhook, notifikasi, analitik, serta panduan penggunaan dan deployment.
- Grafik analitik berdasarkan data server, periode 7/14/30/90 hari, penyimpanan, aktivitas per nomor, dan cadangan JSON.
- Label, instruksi, empty state, dan kesalahan umum dalam bahasa Indonesia yang konsisten.
- Dokumentasi awal, README, serta pembuat ZIP tanpa ketergantungan pada Git atau aplikasi zip sistem.

## Fungsi yang dipertahankan

Arsitektur server tunggal Next.js + Baileys + Socket.io, skema Prisma, endpoint backend, penautan WhatsApp, manajemen sesi, riwayat/media, kontak, otomasi, webhook, push, SQLite/PostgreSQL, dan konfigurasi Railway/Docker tetap digunakan.

Tidak ada penggantian database atau layanan WhatsApp. Perubahan backend terbatas pada identitas pesan percobaan, lokalisasi kesalahan pada batas API/UI, akses aset publik yang diperlukan, serta perbaikan pengujian dan arsip. Penanganan internal/classifikasi kesalahan manager tetap dipertahankan.

## Perbaikan yang diperlukan

- Route pilihan perangkat `/percakapan` ditambahkan agar navigasi Percakapan tidak berakhir pada halaman yang tidak tersedia.
- Font, aset brand, service worker, dan ikon PWA dapat dibuka tanpa login; API privat/media dan websocket tetap dilindungi.
- Precache service worker menggunakan file yang benar, bukan alamat direktori. API privat tidak di-cache.
- Halaman masuk tidak lagi melakukan permintaan data perangkat sebelum login.
- Koneksi Socket.io dibuat ulang setelah keluar/masuk; cache data privat dibersihkan pada perubahan akses.
- Tujuan setelah login dibatasi ke alamat lokal, bukan URL eksternal, skrip, atau putaran login.
- Judul halaman mempertahankan metadata yang benar ketika badge pesan belum dibaca diperbarui.
- Data satu perangkat tidak dibawa ke perangkat lainnya saat pemilihan berubah.
- Tinggi area chat mengikuti ruang kerja, bukan menambahkan viewport kedua di dalam layout.
- Perangkat yang tidak terhubung tetap dapat membaca riwayat; pembuatan chat dan pengiriman pesan dinonaktifkan.
- Batal pada rekaman suara tidak memicu pengiriman. Mikrofon dan timer dibersihkan ketika dibatalkan, halaman ditinggalkan, perangkat terputus, atau izin mikrofon baru selesai setelah komponen dilepas.
- Tata letak pemilihan perangkat dan kode penautan disesuaikan untuk layar kecil.
- Pengujian socket memakai cookie autentikasi dan batas waktu, bukan menunggu koneksi tanpa batas.
- Pembuat ZIP menyertakan file sumber baru meskipun belum di-stage, dan menolak file privat/generated.

## Verifikasi

Pengujian dilakukan dengan database, direktori autentikasi, media, serta kontak/pesan tiruan yang terpisah dari sumber. Data pengujian tidak disertakan dalam ZIP.

- Pemeriksaan TypeScript: lulus.
- Build produksi Next.js: lulus.
- Pengujian fungsional backend/gateway: **162 lulus, 0 gagal**.
- Pengujian presentasi/keamanan navigasi/aset: **7 lulus**.
- Pengujian pembuat arsip dan pengecualian berkas: **6 lulus**.
- Pengujian browser Chromium: **123 pemeriksaan lulus** (118 pemeriksaan alur/tampilan dan 5 pemeriksaan pergantian perangkat/chat dengan respons tertunda). Cakupan: login, pesan kesalahan, cookie, pencarian/filter, route, menu seluler, penautan antarmuka, koneksi ulang, riwayat offline, perekam suara, metadata, PWA, dan tata letak desktop/ponsel.

Lebar tampilan yang diperiksa mencakup 320, 390, 768, 1024, dan 1440 piksel. Uji perekam memakai mikrofon sintetis dan status online yang disimulasikan di browser; sesi WhatsApp pada database tetap tidak terhubung. Uji tampilan kode penautan memakai respons tiruan, bukan meminta kode pada nomor nyata.

**Batas verifikasi:** penautan nomor WhatsApp nyata, pengiriman ke akun sebenarnya, konversi suara oleh ffmpeg, serta pengiriman Web Push melalui layanan browser ke perangkat nyata memerlukan akun, perangkat, konfigurasi server, dan izin pengguna. Pengujian otomatis dan browser di atas tidak menggantikan pengujian tersebut. Deployment Railway/PostgreSQL dan browser Safari/iOS juga tidak dilakukan di lingkungan ini.

## Isi arsip

ZIP memuat sumber lengkap, konfigurasi deployment, package lock, `.env.example`, logo/ikon/font, dokumentasi, dan lisensi.

Tidak disertakan: kredensial `.env`, database, akun/sesi WhatsApp, media runtime, kunci push, `.git`, dependensi terinstal, cache, hasil build, log, atau data browser pengujian.

Untuk pemasangan baru, ikuti `MULAI-DI-SINI.md`. Jika memperbarui instalasi yang sudah digunakan, cadangkan dan pertahankan database, `.env`, serta direktori data/volume instalasi lama.
