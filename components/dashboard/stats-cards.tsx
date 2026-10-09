'use client'
import { ImageIcon, MessagesSquare, Radio, Smartphone, SquarePen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { StatsDTO } from '@/lib/types'
const ITEMS = [
  { key: 'sessions', label: 'Total perangkat', help: 'Nomor dalam ruang kerja', icon: Smartphone },
  { key: 'connected', label: 'Terhubung', help: 'Sesi WhatsApp aktif', icon: Radio },
  { key: 'chats', label: 'Percakapan', help: 'Percakapan tersimpan', icon: MessagesSquare },
  { key: 'messages', label: 'Total pesan', help: 'Pesan masuk dan keluar', icon: SquarePen },
  { key: 'media', label: 'Berkas media', help: 'Media yang tersimpan', icon: ImageIcon },
] as const
export function StatsCards({ stats, failed = false }: { stats: StatsDTO | null; failed?: boolean }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{ITEMS.map((item) => (
    <Card key={item.key} className={item.key === 'media' ? 'stat-card col-span-2 sm:col-span-1' : 'stat-card'}>
      <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-medium text-muted-foreground">{item.label}</span><span className="stat-icon"><item.icon className="h-[16px] w-[16px]" strokeWidth={1.6} /></span></div>
      <div className="mt-2 text-[29px] font-bold leading-tight tracking-[-1px] tabular-nums">{stats ? stats[item.key].toLocaleString('id-ID') : failed ? '—' : <Skeleton className="h-9 w-14" />}</div>
      <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground/80">{item.help}</p>
    </Card>
  ))}</div>
}
