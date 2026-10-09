# Notifikasi MultiWA

MultiWA mendukung suara pesan, notifikasi desktop ketika panel terbuka, serta Web Push ketika panel ditutup. Semua preferensi berlaku per perangkat.

## Persyaratan

- Gunakan **HTTPS** untuk akses publik. `localhost` dapat dipakai untuk pengujian lokal.
- Gunakan browser terbaru yang mendukung Web Push.
- Pada iPhone/iPad, gunakan iOS/iPadOS 16.4 atau lebih baru, pasang melalui Safari, dan jalankan dari ikon layar utama.
- Izinkan notifikasi pada pengaturan situs dan sistem operasi.
- Jalankan backend terus-menerus. Server menerima pesan WhatsApp dan meneruskannya ke layanan push.

## Aktifkan pada perangkat

1. Buka **Notifikasi** dari menu ruang kerja.
2. Pilih **Aktifkan di perangkat ini**.
3. Pilih **Izinkan** ketika browser meminta izin.
4. Pilih **Kirim notifikasi percobaan**.
5. Jika percobaan diterima, tutup panel dan kirim pesan baru dari nomor lain untuk menguji alur pesan masuk.

Ikon lonceng pada header menyediakan kontrol suara pesan dan notifikasi desktop. Notifikasi push dan desktop merupakan dua pengaturan berbeda.

## iPhone / iPad

1. Buka domain panel melalui **Safari**.
2. Pilih **Bagikan → Tambahkan ke Layar Utama → Tambah**.
3. Tutup Safari dan buka panel dari ikon yang terpasang.
4. Masuk, buka Notifikasi, dan aktifkan izin.
5. Periksa pengaturan notifikasi sistem untuk aplikasi yang terpasang.

Jika panel masih dibuka sebagai tab Safari, status dapat meminta pemasangan terlebih dahulu.

## Android

1. Gunakan Chrome atau browser yang mendukung push.
2. Pemasangan melalui menu Instal aplikasi / Tambahkan ke layar utama bersifat disarankan.
3. Aktifkan notifikasi pada panel dan izinkan permintaan browser.
4. Periksa Setelan Android → Notifikasi → Browser serta mode Jangan Ganggu.

## Desktop

Gunakan Chrome, Edge, Firefox, atau Safari yang mendukung push pada sistem operasi Anda. Izinkan notifikasi browser pada pengaturan sistem. Mode Fokus/Jangan Ganggu dapat menyembunyikan pemberitahuan yang sebenarnya sudah diterima.

## Memahami status

| Status | Tindakan |
|---|---|
| Aktif | Perangkat terdaftar. Kirim percobaan untuk memeriksa pengiriman. |
| Nonaktif | Aktifkan pendaftaran dan izinkan permintaan browser. |
| Diblokir | Buka pengaturan situs → Notifikasi → Izinkan, kemudian muat ulang. |
| Tidak didukung | Periksa HTTPS dan gunakan browser/perangkat yang mendukung. |
| Perlu pemasangan | Pada iOS, pasang ke layar utama dan buka dari ikon yang terpasang. |
| Gagal | Baca pesan kesalahan dan diagnostik server, lalu perbarui pendaftaran. |

## Diagnostik

Halaman Notifikasi memeriksa:

- alamat HTTPS dan secure context;
- ketersediaan serta pendaftaran service worker;
- izin notifikasi browser;
- langganan push pada perangkat;
- mode aplikasi yang diperlukan pada iOS;
- kunci VAPID dan jumlah perangkat pada server;
- percobaan pengiriman terakhir, kode HTTP, dan pesan kegagalan layanan push.

Kode **404/410** biasanya berarti langganan sudah tidak berlaku. Perbarui pendaftaran pada perangkat yang bersangkutan. Langganan tidak valid dibersihkan oleh server.

## Mengapa pesan baru tidak memunculkan push?

1. **Panel terlihat pada perangkat yang sama.** Push ditahan untuk mencegah pemberitahuan berulang; suara/toast di panel tetap dapat digunakan. Perangkat lain tetap dapat menerima push.
2. **Pesan berasal dari riwayat.** Pesan yang lebih lama dari batas pemberitahuan tidak memicu push agar sinkronisasi riwayat tidak menghasilkan pemberitahuan massal.
3. **Izin situs atau sistem diblokir.** Periksa kedua tempat tersebut, bukan hanya preferensi panel.
4. **Koneksi WhatsApp pada server belum aktif.** Jalankan diagnostik perangkat dan Sambungkan ulang pada Ikhtisar.
5. **Layanan push menolak langganan.** Periksa riwayat pengiriman dan kode HTTP.
6. **Mode hemat baterai atau Fokus aktif.** Sistem dapat menunda atau menyembunyikan notifikasi.

Untuk uji pesan masuk yang representatif: tutup seluruh tab panel pada perangkat tujuan, kirim pesan baru dari nomor lain ke nomor tertaut, kemudian buka percakapan melalui pemberitahuan.

## Kunci VAPID

Jika variabel `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY` kosong, server membuat pasangan kunci otomatis dan menyimpannya pada direktori data yang permanen. Pada konfigurasi awal, file tersebut adalah `data/vapid.json`.

Pertahankan volume `/app/data` pada Railway. Bila kunci diganti atau volume dihapus, perangkat dapat memerlukan pendaftaran ulang. Kunci privat dan file runtime tidak boleh masuk ke Git atau ZIP sumber.

Pengaturan utama, alamat API, dan mekanisme pengiriman tetap mengikuti backend proyek. Web Push nyata membutuhkan izin perangkat, pendaftaran browser, HTTPS, serta koneksi server ke layanan push; pengujian sumber saja tidak menggantikan uji pada perangkat sebenarnya.
