'use client'

import * as React from 'react'
import {
  CornerUpLeft,
  Eye,
  Loader2,
  MapPin,
  Mic,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  Square,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { ContactDialog, LocationDialog } from '@/components/chat/send-extras'
import { avatarEmojis, cn, formatBytes } from '@/lib/utils'

type Attachment = { file: File; kind: 'image' | 'video' | 'audio' | 'document'; previewUrl?: string }

interface Props {
  sessionId: string
  chatId: string
  disabled?: boolean
  onSent: () => void
  onTyping: (state: 'composing' | 'paused') => void
  /** Pesan yang sedang dibalas (null = pesan biasa). */
  replyTo?: { id: string; text: string; fromMe: boolean } | null
  onCancelReply?: () => void
}

const MAX_MB = 64
const ATTACHMENT_LABELS = { image: 'Gambar', video: 'Video', audio: 'Audio', document: 'Dokumen' } as const

export function MessageComposer({
  sessionId,
  chatId,
  disabled,
  onSent,
  onTyping,
  replyTo = null,
  onCancelReply,
}: Props) {
  const [text, setText] = React.useState('')
  const [attachment, setAttachment] = React.useState<Attachment | null>(null)
  const [viewOnce, setViewOnce] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [recording, setRecording] = React.useState(false)
  const [seconds, setSeconds] = React.useState(0)
  const [emojiOpen, setEmojiOpen] = React.useState(false)
  const [locationOpen, setLocationOpen] = React.useState(false)
  const [contactOpen, setContactOpen] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const recordingCancelledRef = React.useRef(false)
  const mountedRef = React.useRef(false)
  const recordingStartingRef = React.useRef(false)
  const chunksRef = React.useRef<Blob[]>([])
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const typingRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (typingRef.current) clearTimeout(typingRef.current)
      recordingCancelledRef.current = true
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])
  React.useEffect(() => {
    if (!disabled) return
    recordingCancelledRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    setRecording(false)
  }, [disabled])
  React.useEffect(() => () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl)
  }, [attachment])

  function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Berkas terlalu besar. Maksimal ${MAX_MB} MB.`)
      return
    }
    const kind: Attachment['kind'] = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
          ? 'audio'
          : 'document'
    setAttachment({
      file,
      kind,
      previewUrl: kind === 'image' ? URL.createObjectURL(file) : undefined,
    })
  }

  function handleTyping(value: string) {
    setText(value)
    if (typingRef.current) clearTimeout(typingRef.current)
    onTyping('composing')
    typingRef.current = setTimeout(() => onTyping('paused'), 2500)
  }

  async function send() {
    if (sending || disabled) return
    const trimmed = text.trim()

    if (attachment) {
      setSending(true)
      try {
        const form = new FormData()
        form.append('file', attachment.file)
        form.append('kind', attachment.kind)
        if (trimmed) form.append('caption', trimmed)
        if (replyTo) form.append('quotedMessageId', replyTo.id)
        if (viewOnce && (attachment.kind === 'image' || attachment.kind === 'video')) {
          form.append('viewOnce', 'true')
        }
        await fetch(`/api/chats/${chatId}/messages`, { method: 'POST', body: form }).then(
          async (response) => {
            if (!response.ok) {
              const payload = (await response.json().catch(() => null)) as { error?: string } | null
              throw new Error(payload?.error ?? 'Gagal mengunggah berkas')
            }
          },
        )
        setAttachment(null)
        setText('')
        setViewOnce(false)
        onCancelReply?.()
        onSent()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal mengirim media')
      } finally {
        setSending(false)
      }
      return
    }

    if (!trimmed) return

    setSending(true)
    setText('')
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: trimmed, quotedMessageId: replyTo?.id }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Gagal mengirim pesan')
      }
      onCancelReply?.()
      onSent()
      onTyping('paused')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim pesan')
      setText(trimmed)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  /* ------------------------- rekaman pesan suara ------------------------- */

  async function startRecording() {
    if (disabled || sending || recordingStartingRef.current) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error('Perekaman tidak didukung. Gunakan browser terbaru melalui HTTPS.')
      return
    }
    recordingStartingRef.current = true
    recordingCancelledRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mountedRef.current || recordingCancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      const preferred = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type))

      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined)
      chunksRef.current = []
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        if (recordingCancelledRef.current) { chunksRef.current = []; return }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size < 1200) {
          toast.error('Rekaman terlalu pendek')
          return
        }

        const file = new File([blob], `voice-note.${blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm'}`, {
          type: blob.type,
        })

        setSending(true)
        try {
          const form = new FormData()
          form.append('file', file)
          form.append('kind', 'audio')
          form.append('ptt', 'true')
          if (replyTo) form.append('quotedMessageId', replyTo.id)
          const response = await fetch(`/api/chats/${chatId}/messages`, { method: 'POST', body: form })
          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null
            throw new Error(payload?.error ?? 'Gagal mengirim pesan suara')
          }
          toast.success('Pesan suara terkirim')
          onCancelReply?.()
          onSent()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Gagal mengirim pesan suara')
        } finally {
          setSending(false)
        }
      }

      recorder.start(250)
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000)
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (mountedRef.current) toast.error('Mikrofon tidak dapat diakses. Periksa izin browser dan perangkat audio.')
    } finally {
      recordingStartingRef.current = false
    }
  }

  function stopRecording(cancel = false) {
    const recorder = recorderRef.current
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
    if (!recorder) return
    recordingCancelledRef.current = cancel
    if (recorder.state !== 'inactive') recorder.stop()
  }

  /* ------------------------------- render -------------------------------- */

  if (recording) {
    return (
      <div className="message-composer flex items-center gap-3 border-t border-border bg-card p-3">
        <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
        <span className="font-mono text-sm tabular-nums">
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:
          {String(seconds % 60).padStart(2, '0')}
        </span>
        <span className="text-xs text-muted-foreground">Sedang merekam pesan suara…</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => stopRecording(true)}>
          <X /> Batal
        </Button>
        <Button size="sm" onClick={() => stopRecording(false)}>
          <Square /> Kirim
        </Button>
      </div>
    )
  }

  return (
    <div className="message-composer border-t border-border bg-card p-3">
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-primary bg-muted/80 px-3 py-2">
          <CornerUpLeft className="h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-primary">
              {replyTo.fromMe ? 'Membalas pesan Anda sendiri' : 'Membalas'}
            </div>
            <div className="truncate text-xs text-muted-foreground">{replyTo.text}</div>
          </div>
          <Button variant="ghost" size="iconSm" onClick={onCancelReply} aria-label="Batalkan balasan">
            <X />
          </Button>
        </div>
      )}

      {attachment && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-muted/70 p-2">
          {attachment.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.previewUrl} alt="Pratinjau lampiran" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/70">
              <Paperclip className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">{attachment.file.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {ATTACHMENT_LABELS[attachment.kind]} · {formatBytes(attachment.file.size)}
            </div>
          </div>
          {(attachment.kind === 'image' || attachment.kind === 'video') && (
            <Button
              variant={viewOnce ? 'subtle' : 'ghost'}
              size="sm"
              className="shrink-0 text-[11px]"
              onClick={() => setViewOnce((value) => !value)}
              title="Kirim sebagai foto/video sekali lihat"
            >
              <Eye /> {viewOnce ? 'Sekali lihat: AKTIF' : 'Sekali lihat'}
            </Button>
          )}
          <Button variant="ghost" size="iconSm" onClick={() => setAttachment(null)} aria-label="Hapus lampiran">
            <X />
          </Button>
        </div>
      )}

      {emojiOpen && (
        <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/70 p-2">
          {avatarEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setText((value) => value + emoji)
                textareaRef.current?.focus()
              }}
              className="rounded-lg px-1.5 py-1 text-lg transition hover:bg-muted/70"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input ref={fileInputRef} type="file" hidden onChange={pickFile} />

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setEmojiOpen((value) => !value)}
          disabled={disabled || sending} aria-label="Emoji"
        >
          <Smile />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending} aria-label="Lampirkan media"
        >
          <Paperclip />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0" disabled={disabled || sending} aria-label="Kirim lainnya">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setLocationOpen(true)
              }}
            >
              <MapPin className="h-4 w-4" /> Kirim lokasi
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setContactOpen(true)
              }}
            >
              <UserRound className="h-4 w-4" /> Kirim kontak
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => handleTyping(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              void send()
            }
          }}
          rows={1}
          aria-label="Tulis pesan"
          title={disabled ? 'Perangkat belum terhubung. Sambungkan untuk mengirim.' : undefined}
          placeholder={disabled ? 'Tidak aktif' : 'Tulis pesan…'}
          disabled={disabled}
          className={cn('max-h-32 min-h-11 flex-1 py-3', disabled && 'opacity-60')}
        />

        {text.trim() || attachment ? (
          <Button onClick={() => void send()} loading={sending} size="icon" className="shrink-0" disabled={disabled || sending} aria-label="Kirim">
            <Send />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            className="shrink-0"
            onClick={() => void startRecording()}
            disabled={disabled || sending}
            aria-label="Rekam pesan suara"
          >
            {sending ? <Loader2 className="animate-spin" /> : <Mic />}
          </Button>
        )}
      </div>

      <LocationDialog
        chatId={chatId}
        open={locationOpen}
        onOpenChange={setLocationOpen}
        onSent={onSent}
      />
      <ContactDialog chatId={chatId} open={contactOpen} onOpenChange={setContactOpen} onSent={onSent} />
    </div>
  )
}
