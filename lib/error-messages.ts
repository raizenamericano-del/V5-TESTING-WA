/** Terjemahan pada batas antarmuka; kode HTTP dan pesan internal tetap dipertahankan. */
export function formatErrorMessage(message: string): string {
  const value = message.trim()
  const exact: Record<string, string> = {
    'Session not found': 'Perangkat tidak ditemukan.',
    'Message not found': 'Pesan tidak ditemukan.',
    'Chat not found': 'Percakapan tidak ditemukan.',
    'Media not found': 'Media tidak ditemukan.',
    'Invalid media path': 'Lokasi berkas media tidak valid.',
    'Media file is missing on disk': 'Berkas media sudah tidak tersedia pada server.',
    'Message has no WhatsApp id': 'Pesan ini belum memiliki ID WhatsApp yang diperlukan.',
    'Message text cannot be empty': 'Pesan tidak boleh kosong.',
    'Baileys failed to send the message': 'WhatsApp belum dapat mengirim pesan. Silakan coba kembali.',
    'Phone number is too short': 'Nomor WhatsApp terlalu pendek.',
    'Phone number is too long': 'Nomor WhatsApp terlalu panjang.',
    'Invalid phone number': 'Nomor WhatsApp tidak valid. Gunakan format internasional.',
    'Session is not running. Reconnect it from the dashboard first.': 'Perangkat belum terhubung ke server. Gunakan Sambungkan ulang pada menu perangkat.',
    'Socket is not running — tap Reconnect on the dashboard first': 'Koneksi perangkat belum aktif. Gunakan Sambungkan ulang pada Ikhtisar.',
    'Session is offline — reconnect it first': 'Perangkat tidak terhubung. Sambungkan kembali terlebih dahulu.',
    'Session is still connecting — try again in a moment': 'Perangkat masih dalam proses menghubungkan. Coba kembali setelah beberapa saat.',
    'This session is already registered. Logout first to pair a new device.': 'Perangkat ini sudah tertaut. Lepaskan perangkat sebelum meminta kode penautan baru.',
    'This message has no media attached': 'Pesan ini tidak memiliki lampiran media.',
    'WhatsApp has not shared this media yet — try again in a moment': 'WhatsApp belum membagikan media ini. Coba kembali setelah beberapa saat.',
    'Only your own messages can be deleted for everyone (group admins can delete others)': 'Anda hanya dapat menghapus pesan sendiri untuk semua orang, kecuali memiliki izin administrator grup.',
    'No file uploaded (field name must be "file")': 'Belum ada berkas yang dilampirkan.',
    'Missing ?id=<messageId>': 'ID pesan diperlukan untuk membuka media.',
    'Username atau password salah': 'Nama pengguna atau kata sandi tidak sesuai.',
    'Password wajib diisi': 'Kata sandi wajib diisi.',
    'Connection Closed': 'Koneksi WhatsApp terputus. Coba sambungkan ulang.',
    'Connection Failure': 'Koneksi WhatsApp tidak berhasil. Periksa jaringan server.',
    'Timed Out': 'Permintaan melewati batas waktu. Silakan coba kembali.',
    'Invalid url': 'URL tujuan tidak valid.',
    'Required': 'Kolom ini wajib diisi.',
  }
  if (exact[value]) return exact[value]
  if (/^Invalid phone number\./i.test(value)) return 'Nomor WhatsApp tidak valid. Gunakan format internasional, misalnya 6281234567890.'
  const duplicate = value.match(/^Session for (\+\d+) already exists$/i)
  if (duplicate) return `Nomor ${duplicate[1]} sudah ditambahkan. Buka perangkat yang tersimpan untuk melanjutkan.`
  const unknown = value.match(/^(\+\d+) is not registered on WhatsApp$/i)
  if (unknown) return `Nomor ${unknown[1]} tidak terdaftar pada WhatsApp.`
  const size = value.match(/^File too large\. Maximum ([\d.]+) MB\.$/i)
  if (size) return `Berkas terlalu besar. Ukuran maksimal ${size[1]} MB.`
  if (value.startsWith('Failed to get pairing code: ')) return `Kode penautan belum tersedia: ${formatErrorMessage(value.slice('Failed to get pairing code: '.length))}`
  if (/^Request failed with status \d+$/.test(value)) return value.replace('Request failed with status', 'Permintaan gagal dengan status HTTP')
  if (value === 'Request failed') return 'Permintaan tidak berhasil. Silakan coba kembali.'
  if (value.startsWith('phoneNumber: ')) return `Nomor WhatsApp: ${formatErrorMessage(value.slice(13))}`
  const minimum = value.match(/^String must contain at least (\d+) character\(s\)$/)
  if (minimum) return `Masukkan minimal ${minimum[1]} karakter.`
  const maximum = value.match(/^String must contain at most (\d+) character\(s\)$/)
  if (maximum) return `Batas maksimal ${maximum[1]} karakter.`
  return value || 'Terjadi kesalahan. Silakan coba kembali.'
}
