'use client'

import * as React from 'react'
import { Loader2, MessageSquarePlus, MessagesSquare, Pin, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/fetcher'
import type { ChatDTO } from '@/lib/types'
import { chatDisplayName, cn, formatChatTimestamp, truncate } from '@/lib/utils'

interface Props {
  sessionId: string
  chats: ChatDTO[]
  isLoading: boolean
  activeChatId: string | null
  onSelect: (chatId: string) => void
  onChanged: () => void
  canCreate?: boolean
}

export function ChatList({
  sessionId,
  chats,
  isLoading,
  activeChatId,
  onSelect,
  onChanged,
  canCreate = true,
}: Props) {
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'groups'>('all')
  const searchRef = React.useRef<HTMLInputElement>(null)
  const [newOpen, setNewOpen] = React.useState(false)
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  // Pintasan PWA "Cari pesan" membuka /?cari=1 → langsung fokus ke kolom pencarian chat.
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('cari') !== '1') return
    searchRef.current?.focus()
    params.delete('cari')
    const query = params.toString()
    window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
  }, [])

  const filtered = React.useMemo(() => {
    const needle = search.toLowerCase().trim()
    return chats.filter((chat) => {
      const category = filter === 'all' || (filter === 'unread' ? chat.unreadCount > 0 : chat.isGroup)
      const text = !needle || `${chat.name || ''} ${chat.jid} ${chat.lastMessagePreview || ''}`.toLowerCase().includes(needle)
      return category && text
    })
  }, [chats, search, filter])

  async function openByNumber() {
    setCreating(true)
    try {
      const { chat } = await api.post<{ chat: ChatDTO }>(`/api/sessions/${sessionId}/chats`, {
        phoneNumber,
      })
      toast.success('Chat siap', { description: chat.name ?? chat.jid })
      setNewOpen(false)
      setPhoneNumber('')
      onChanged()
      onSelect(chat.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nomor tersebut tidak bisa dibuka')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border bg-card">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><h2 className="text-[15px] font-bold tracking-tight">Percakapan</h2><span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{chats.length}</span></div>
          <Button variant="secondary" size="iconSm" onClick={() => setNewOpen(true)} disabled={!canCreate} aria-label="Percakapan baru" title={canCreate ? 'Percakapan baru' : 'Hubungkan perangkat untuk memulai percakapan'}>
            <MessageSquarePlus />
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau nomor…"
            className="h-10 bg-muted/40 pl-9" aria-label="Cari percakapan"
          />
        </div>
        <div className="flex gap-1" aria-label="Filter percakapan">{([{ id: 'all', label: 'Semua' }, { id: 'unread', label: 'Belum dibaca' }, { id: 'groups', label: 'Grup' }] as const).map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={cn('rounded-md px-2.5 py-1.5 text-[10px] font-medium', filter === item.id ? 'bg-primary/[0.07] text-primary' : 'text-muted-foreground hover:bg-muted')}>{item.label}</button>)}</div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {isLoading && chats.length === 0 ? (
          <div className="space-y-2 p-3">
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/50"><MessagesSquare className="h-5 w-5 text-[#8ba07d]" strokeWidth={1.5} /></span>
            {chats.length === 0 ? (
              <>
                <span>Belum ada percakapan. Pesan baru akan ditampilkan di sini.</span>
                <span className="mt-1 max-w-[280px] text-[11px] text-muted-foreground/70">
                  Percakapan di ponsel belum muncul di sini? Buka{' '}
                  <b>Ikhtisar → ⋮ → Jalankan diagnostik</b> untuk memeriksa apakah server
                  menerima pembaruan dari WhatsApp.
                </span>
              </>
            ) : (
              'Tidak ada percakapan yang sesuai dengan filter ini.'
            )}
          </div>
        ) : (
          filtered.map((chat) => {
            const isActive = chat.id === activeChatId
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelect(chat.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-border/60 px-4 py-4 text-left transition-colors',
                  isActive ? 'bg-primary/[0.08]' : 'hover:bg-muted/70',
                )}
              >
                <Avatar name={chat.name ?? chat.jid} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                      {chat.pinned && <Pin className="h-3 w-3 text-primary" />}
                      {chat.isGroup && <Users className="h-3 w-3 text-muted-foreground" />}
                      <span className="truncate">
                        {chatDisplayName(chat)}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatChatTimestamp(chat.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {truncate(chat.lastMessagePreview || 'Belum ada pesan', 42)}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Percakapan baru</DialogTitle>
            <DialogDescription>
              Masukkan nomor tujuan dalam format internasional (tanpa <code>+</code>).
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={phoneNumber}
            inputMode="numeric"
            placeholder="6281234567890"
            onChange={(event) => setPhoneNumber(event.target.value.replace(/[^\d+]/g, ''))}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Batal
            </Button>
            <Button onClick={openByNumber} loading={creating} disabled={phoneNumber.length < 8}>
              {creating ? <Loader2 className="animate-spin" /> : null} Buka percakapan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
