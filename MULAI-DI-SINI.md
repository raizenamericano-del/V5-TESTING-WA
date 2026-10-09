# Menjalankan MultiWA Workspace

## 1. Ekstrak ZIP

Buka terminal di folder `MultiWA-Workspace`, tempat `package.json` berada. Siapkan Node.js 20 atau versi lebih baru.

## 2. Instal dependensi

```bash
npm ci
```

File `.env` akan dibuat otomatis dari `.env.example` jika belum tersedia.

## 3. Atur akses

Edit `.env`:

```dotenv
AUTH_USERNAME=admin
AUTH_PASSWORD=kata-sandi-panjang-dan-unik-Anda
```

Ganti kata sandi contoh. Jangan membagikan file `.env`. Untuk server publik, gunakan HTTPS dan tambahkan `AUTH_SECRET` acak minimal 32 karakter.

## 4. Siapkan database dan jalankan

```bash
npm run db:push
npm run dev
```

Buka `http://localhost:3000`, masuk dengan kredensial pada `.env`, lalu pilih **Hubungkan nomor**.

## 5. Versi produksi

```bash
npm run build
npm start
```

## Railway

Unggah sumber ke repositori Anda, deploy menggunakan Dockerfile, hubungkan PostgreSQL melalui `DATABASE_URL`, pasang volume **`/app/data`**, atur kredensial, dan buat domain HTTPS.

Konfigurasi serta penjelasan fitur lengkap tersedia pada `README.md`. Ringkasan perubahan dan hasil verifikasi tersedia pada `MODIFIKASI.md`.

Arsip hanya berisi sumber. Tidak ada `node_modules`, hasil build, database, media, akun contoh, sesi WhatsApp, atau kredensial pribadi. Data dan konfigurasi instalasi lama tidak disertakan; jika memperbarui server yang sudah berjalan, cadangkan database dan direktori runtime terlebih dahulu, lalu pertahankan `.env` serta volume lama.
