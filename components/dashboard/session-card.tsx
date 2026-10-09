'use client'

import * as React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import {
  Activity,
  Bug,
  Eraser,
  Wand2,
  FlaskConical,
  LogOut,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plug,
  PlugZap,
  QrCode,
  Trash2,
  Unplug,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SessionStatusBadge } from '@/components/session-status-badge'
import { api } from '@/lib/fetcher'
import { formatErrorMessage } from '@/lib/error-messages'
import type { SessionWithStats } from '@/lib/types'
import { cn, formatDateTime } from '@/lib/utils'

interface Props {
  session: SessionWithStats
  onChanged: () => void
  onDeleted: () => void
}

export function SessionCard({ session, onChanged, onDeleted }: Props) {
  const [busy, setBusy] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [name, setName] = React.useState(session.name)
  const [confirmLogout, setConfirmLogout] = React.useState(false)
  React.useEffect(() => { if (renameOpen) setName(session.name) }, [renameOpen, session.name])

  const { data } = useSWR<{ url: string | null }>(
    session.status === 'connected' ? `/api/sessions/${session.id}/avatar` : null,
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  )

  async function run(action: string, fn: () => Promise<unknown>, successMessage: string) {
    setBusy(action)
    try {
      const result = await fn()
      toast.success(typeof result === 'string' ? result : successMessage)
      onChanged()
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Aksi gagal dijalankan')
      return false
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="session-card group p-4 transition-colors hover:border-primary/25">

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={session.pushName || session.name}
            src={session.status === 'connected' ? data?.url : null}
            size="md"
            ring={session.status === 'connected'}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[13px] font-bold">{session.name}</h3>
            </div>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              +{session.phoneNumber}
              {session.pushName ? ` · ${session.pushName}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="iconSm" aria-label="Aksi perangkat" disabled={Boolean(busy)}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Kelola perangkat</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
                <Pencil className="h-4 w-4" /> Ganti nama
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  run(
                    'connect',
                    () => api.post(`/api/sessions/${session.id}/connect`),
                    'Menyambungkan ulang sesi…',
                  )
                }
              >
                <PlugZap className="h-4 w-4" /> Sambungkan ulang
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  run(
                    'disconnect',
                    () => api.post(`/api/sessions/${session.id}/disconnect`),
                    'Koneksi perangkat diputus',
                  )
                }
              >
                <Unplug className="h-4 w-4" /> Putuskan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() =>
                  run(
                    'test',
                    () => api.post(`/api/sessions/${session.id}/test-message`),
                    'Pesan uji terkirim — cek chat “Pesan ke diri sendiri”',
                  )
                }
              >
                <FlaskConical className="h-4 w-4" /> Kirim pesan uji
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  run(
                    'debug',
                    async () => {
                      const info = (await api.get<Record<string, unknown>>(
                        `/api/sessions/${session.id}/debug`,
                      )) as {
                        socket: { isLive: boolean; wsReadyStateLabel: string }
                        counters: { upsert: number; stored: number; skipped: number } | null
                        storage: { chatCount: number; messageCount: number }
                        recentEvents: Array<{ reason: string; jid?: string }>
                      }
                      toast.info('Diagnostik', {
                        description:
                          `socket: ${info.socket.isLive ? info.socket.wsReadyStateLabel : 'TIDAK JALAN'} · ` +
                          `event: ${info.counters?.upsert ?? 0} (disimpan ${info.counters?.stored ?? 0}, dilewati ${info.counters?.skipped ?? 0}) · ` +
                          `chat: ${info.storage.chatCount} · pesan: ${info.storage.messageCount}`,
                        duration: 12000,
                      })
                      if (info.recentEvents[0]) {
                        toast.info('Event terakhir yang diterima', {
                          description: `${info.recentEvents[0].jid ?? '-'} → ${info.recentEvents[0].reason}`,
                          duration: 12000,
                        })
                      }
                    },
                    'Selesai (lihat notifikasi)',
                  )
                }
              >
                <Bug className="h-4 w-4" /> Jalankan diagnostik
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  run(
                    'prune',
                    async () => {
                      const { result } = await api.post<{ result: { removed: number } }>(
                        `/api/sessions/${session.id}/prune-chats`,
                      )
                      return result.removed === 0
                        ? 'Daftar chat sudah bersih — tidak ada chat kosong.'
                        : `${result.removed} chat kosong dibersihkan. Chat muncul lagi otomatis kalau ada pesan baru.`
                    },
                    'Daftar chat dirapikan',
                  )
                }
              >
                <Eraser className="h-4 w-4" /> Rapikan daftar chat (hapus yang kosong)
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  run(
                    'repair',
                    async () => {
                      const { result } = await api.post<{
                        result: {
                          scanned: number
                          repaired: number
                          unresolved: number
                          failed: number
                          contactsRepaired: number
                        }
                      }>(`/api/sessions/${session.id}/repair-lid`)
                      const message =
                        result.scanned === 0
                          ? 'Tidak ada chat beralamat @lid — semua sudah bernomor.'
                          : `${result.repaired} dari ${result.scanned} chat dikembalikan ke nomor aslinya` +
                            (result.unresolved > 0
                              ? `. ${result.unresolved} masih disembunyikan WhatsApp (nomornya belum dibagikan).`
                              : '.') +
                            (result.failed > 0 ? ` ${result.failed} gagal diproses (lihat log server).` : '') +
                            (result.contactsRepaired > 0
                              ? ` ${result.contactsRepaired} kontak ikut dirapikan.`
                              : '')
                      return message
                    },
                    'Perbaikan selesai',
                  )
                }
              >
                <Wand2 className="h-4 w-4" /> Perbaiki nomor kontak (LID)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-amber-700 focus:text-amber-700"
                onSelect={() => setConfirmLogout(true)}
              >
                <LogOut className="h-4 w-4" /> Keluar / lepas perangkat
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-700 focus:text-red-700"
                onSelect={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" /> Hapus perangkat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 flex items-center"><SessionStatusBadge status={session.status} pulse={false} /></div>

      {session.status === 'connected' && !session.isLive && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2 text-[11px] text-amber-700">
          <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Socket belum jalan di server ini (status tersimpan “connected”). Klik <b>Sambungkan ulang</b> —
            pesan baru belum akan masuk sebelum ini aktif.
          </span>
        </div>
      )}

      {session.lastError && (
        <p className="mt-3 line-clamp-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.07] px-3 py-2 text-[11px] text-amber-700">
          {formatErrorMessage(session.lastError)}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
        <Stat label="Percakapan" value={session.stats.chats} />
        <Stat label="Pesan" value={session.stats.messages} />
        <Stat label="Belum dibaca" value={session.stats.unread} highlight={session.stats.unread > 0} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {session.status === 'connected' ? (
          <>
            <Button asChild size="sm" className="flex-1">
              <Link href={`/chat/${session.id}`}>
                <MessageSquare /> Percakapan
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/pair?session=${session.id}`}>
                <QrCode /> Kode
              </Link>
            </Button>
          </>
        ) : session.status === 'pairing' ? (
          <Button asChild size="sm" className="flex-1">
            <Link href={`/pair?session=${session.id}`}>
              <QrCode /> Lihat kode penautan
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="sm" className="flex-1">
              <Link href={`/pair?session=${session.id}`}>
                <QrCode /> Tautkan perangkat
              </Link>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={busy === 'connect'}
              onClick={() =>
                run(
                  'connect',
                  () => api.post(`/api/sessions/${session.id}/connect`),
                  'Menyambungkan…',
                )
              }
            >
              <Plug /> Sambung ulang
            </Button>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground">
        <span>Ditambahkan {formatDateTime(session.createdAt)}</span>
        {session.connectedAt && (
          <span className={cn('flex items-center gap-1 text-primary')}>
            <span className="h-1 w-1 rounded-full bg-primary" />
            terhubung sejak {formatDateTime(session.connectedAt)}
          </span>
        )}
      </div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ubah nama perangkat</DialogTitle>
            <DialogDescription>Perubahan ini hanya berlaku pada label ruang kerja, bukan nama akun WhatsApp.</DialogDescription>
          </DialogHeader>
          <Input aria-label="Nama perangkat" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} disabled={busy === 'rename'} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>
              Batal
            </Button>
            <Button
              loading={busy === 'rename'}
              disabled={!name.trim()}
              onClick={async () => {
                const saved = await run(
                  'rename',
                  () => api.patch(`/api/sessions/${session.id}`, { name }),
                  'Nama sesi diubah',
                )
                if (saved) setRenameOpen(false)
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout confirmation */}
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Keluar & lepas perangkat?"
        description="Perangkat akan dilepas dari WhatsApp. Untuk menyambungkan nomor ini lagi Anda perlu kode pairing baru. Riwayat chat tetap tersimpan di panel ini."
        confirmLabel="Keluar"
        busy={busy === 'logout'}
        onConfirm={async () => {
          const done = await run('logout', () => api.post(`/api/sessions/${session.id}/logout`), 'Perangkat berhasil dilepas')
          if (done) setConfirmLogout(false)
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Hapus perangkat ini?"
        description="Semua data perangkat ini — chat, pesan, dan media yang tersimpan — akan dihapus dari server. Akun WhatsApp-nya sendiri tidak terpengaruh sampai Anda juga melakukan keluar/lepas perangkat."
        confirmLabel="Hapus semua"
        busy={busy === 'delete'}
        onConfirm={async () => {
          const done = await run('delete', () => api.delete(`/api/sessions/${session.id}`), 'Perangkat dihapus')
          if (done) { setConfirmDelete(false); onDeleted() }
        }}
      />
    </Card>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-muted/70 px-2 py-2',
        highlight && 'border-primary/[0.25] bg-primary/[0.08]',
      )}
    >
      <div className={cn('text-[15px] font-bold tabular-nums', highlight && 'text-primary')}>
        {value.toLocaleString()}
      </div>
      <div className="text-[9px] font-medium text-muted-foreground">{label}</div>
    </div>
  )
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  busy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
  busy?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="destructive" loading={busy} onClick={() => void onConfirm()}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
