import {
  Archive,
  ArrowDown,
  ArrowLeft,
  Download,
  Eye,
  File,
  FileArchive,
  FileText,
  Forward,
  Inbox,
  MailOpen,
  MoreVertical,
  Move,
  Printer,
  Reply,
  ReplyAll,
  ShieldAlert,
  Star,
  Tag,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Avatar } from '../components/Avatar'
import { IconButton } from '../components/IconButton'
import { gmailService } from '../services/gmailService'
import type { Email, EmailAttachment } from '../types/email'

function labelClass(label: string) {
  const normalized = label.toLowerCase()

  if (normalized.includes('important')) {
    return 'bg-[#feefc3] text-[#7c4a00]'
  }

  if (normalized.includes('starred')) {
    return 'bg-[#fef7e0] text-[#b06000]'
  }

  if (normalized.includes('social')) {
    return 'bg-[#e8f0fe] text-[#174ea6]'
  }

  if (normalized.includes('promotion')) {
    return 'bg-[#e6f4ea] text-[#137333]'
  }

  return 'bg-[#f1f3f4] text-[#5f6368] dark:bg-[#2b2c2f] dark:text-[#c4c7c5]'
}

function attachmentIcon(attachment: EmailAttachment) {
  if (attachment.mimeType.includes('pdf') || attachment.mimeType.includes('document')) {
    return <FileText size={23} />
  }

  if (attachment.mimeType.includes('zip') || attachment.mimeType.includes('archive')) {
    return <FileArchive size={23} />
  }

  return <File size={23} />
}

function formatSize(size: number) {
  if (!size) {
    return ''
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function DetailSkeleton() {
  return (
    <div className="px-5 py-4">
      <div className="mail-shimmer h-8 w-10/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
      <div className="mt-6 flex gap-3">
        <div className="mail-shimmer size-10 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
        <div className="flex-1 space-y-3">
          <div className="mail-shimmer h-4 w-5/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
          <div className="mail-shimmer h-3 w-8/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="mail-shimmer h-4 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
        ))}
      </div>
    </div>
  )
}

export function EmailDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [email, setEmail] = useState<Email | undefined>(() => {
    const storedEmail = localStorage.getItem('selected_email')
    return storedEmail ? (JSON.parse(storedEmail) as Email) : undefined
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [starred, setStarred] = useState(false)
  const [attachmentData, setAttachmentData] = useState<Record<string, string>>({})
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    async function loadMessage() {
      const accessToken = localStorage.getItem('gmail_access_token')

      if (!accessToken || !id) {
        setError('No Gmail Connected')
        setLoading(false)
        return
      }

      try {
        const message = await gmailService.getMessage(accessToken, id)

        if (!active) {
          return
        }

        setEmail(message)
        setStarred(message.starred)
        localStorage.setItem('selected_email', JSON.stringify(message))
        setError('')

        const imageAttachments = message.attachments?.filter((attachment) => attachment.inline && attachment.mimeType.startsWith('image/')) || []
        const dataEntries = await Promise.all(
          imageAttachments.map(async (attachment) => {
            try {
              const data = await gmailService.downloadAttachment(accessToken, message.id, attachment.id)
              return [attachment.contentId || attachment.id, `data:${attachment.mimeType};base64,${data.replace(/-/g, '+').replace(/_/g, '/')}`] as const
            } catch {
              return undefined
            }
          }),
        )

        if (active) {
          setAttachmentData(Object.fromEntries(dataEntries.filter(Boolean) as Array<readonly [string, string]>))
        }
      } catch {
        if (active) {
          setError('Unable to load this email.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadMessage()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const html = useMemo(() => {
    let nextHtml = email?.bodyHtml || ''

    for (const [contentId, dataUrl] of Object.entries(attachmentData)) {
      nextHtml = nextHtml.replaceAll(`cid:${contentId}`, dataUrl)
    }

    return nextHtml
  }, [attachmentData, email?.bodyHtml])

  const replyState = useMemo(
    () => ({
      email,
    }),
    [email],
  )

  const visibleLabels = (email?.labels || []).filter((label) =>
    ['Inbox', 'Important', 'Starred', 'Social', 'Promotions', 'Updates', 'Forums'].some((item) => label.includes(item)),
  )

  return (
    <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-white pb-10 dark:bg-[#202124]">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-1 bg-white/96 px-2 pt-[env(safe-area-inset-top)] shadow-[0_1px_2px_rgba(60,64,67,0.08)] backdrop-blur dark:bg-[#202124]/95">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </IconButton>

        <div className="flex-1" />

        <IconButton label="Archive">
          <Archive size={21} />
        </IconButton>
        <IconButton label="Delete">
          <Trash2 size={21} />
        </IconButton>
        <IconButton label="Mark unread">
          <MailOpen size={21} />
        </IconButton>
        <IconButton label="Move">
          <Move size={21} />
        </IconButton>
        <div className="relative" ref={menuRef}>
          <IconButton label="More options" onClick={() => setMenuOpen((value) => !value)}>
            <MoreVertical size={21} />
          </IconButton>
          <div
            role="menu"
            className={`absolute right-1 top-12 z-30 w-64 origin-top-right overflow-hidden rounded-[20px] bg-white py-2 text-sm font-medium text-[#202124] shadow-[0_8px_28px_rgba(60,64,67,0.24)] transition duration-180 dark:bg-[#202124] dark:text-[#e3e3e3] ${
              menuOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
            }`}
          >
            {[
              ['Reply All', ReplyAll],
              ['Forward', Forward],
              [starred ? 'Remove Star' : 'Add Star', Star],
              ['Move', Move],
              ['Labels', Tag],
              ['Mark unread', MailOpen],
              ['Print', Printer],
              ['Report spam', ShieldAlert],
              ['Report phishing', ShieldAlert],
              ['Block sender', ShieldAlert],
              ['Mute conversation', Inbox],
              ['Delete forever', Trash2],
            ].map(([label, Icon]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => {
                  if (label === 'Add Star' || label === 'Remove Star') {
                    setStarred((value) => !value)
                  }
                  setMenuOpen(false)
                }}
                className="flex h-11 w-full items-center gap-4 px-5 text-left transition hover:bg-[#f1f3f4] active:bg-[#e8eaed] dark:hover:bg-white/[0.08]"
              >
                <Icon size={18} />
                <span>{label as string}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? <DetailSkeleton /> : null}

      {!loading && error ? (
        <section className="grid min-h-[60svh] place-items-center px-8 text-center">
          <div>
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#fce8e6] text-[#b3261e] dark:bg-[#3f201d] dark:text-[#f2b8b5]">
              <Inbox size={42} strokeWidth={1.7} />
            </div>
            <h1 className="mt-6 text-xl font-normal text-[#202124] dark:text-[#e3e3e3]">{error}</h1>
            <p className="mt-2 text-sm leading-6 text-[#5f6368] dark:text-[#c4c7c5]">The message may have moved, been deleted, or Gmail may be unavailable.</p>
          </div>
        </section>
      ) : null}

      {!loading && email ? (
        <article className="px-5">
          <div className="flex items-start gap-2 pt-3">
            <h1 className="min-w-0 flex-1 text-[26px] font-normal leading-[1.18] tracking-normal text-[#202124] dark:text-[#e3e3e3]">
              {email.subject}
            </h1>
            <button
              type="button"
              aria-label={starred ? 'Remove star' : 'Add star'}
              onClick={() => setStarred((value) => !value)}
              className="grid size-11 shrink-0 place-items-center rounded-full text-[#bdc1c6] transition hover:bg-[#f1f3f4] hover:text-[#fbbc04] active:scale-90 dark:hover:bg-white/[0.08]"
            >
              <Star size={22} className={starred ? 'fill-[#fbbc04] text-[#fbbc04]' : ''} />
            </button>
          </div>

          {visibleLabels.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleLabels.map((label) => (
                <span key={label} className={`rounded-md px-2 py-1 text-xs font-medium ${labelClass(label)}`}>
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          <section className="mt-6 flex items-start gap-3">
            <Avatar name={email.sender} className="size-10" />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => setDetailsOpen((value) => !value)} className="min-w-0 text-left">
                  <p className="truncate text-[15px] font-semibold leading-5 text-[#202124] dark:text-[#e3e3e3]">{email.sender}</p>
                  <p className="truncate text-xs leading-5 text-[#5f6368] dark:text-[#c4c7c5]">
                    to me • {email.senderEmail}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <time className="text-xs leading-5 text-[#5f6368] dark:text-[#c4c7c5]">{email.timestamp}</time>
                  <button
                    type="button"
                    aria-label="Show message details"
                    onClick={() => setDetailsOpen((value) => !value)}
                    className="grid size-8 place-items-center rounded-full text-[#5f6368] transition hover:bg-[#f1f3f4] dark:text-[#c4c7c5] dark:hover:bg-white/[0.08]"
                  >
                    <ArrowDown size={16} className={`transition ${detailsOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <div
                className={`mt-3 overflow-hidden rounded-2xl bg-[#f8fafd] text-xs leading-6 text-[#3c4043] transition-all duration-200 dark:bg-[#303134] dark:text-[#c4c7c5] ${
                  detailsOpen ? 'max-h-80 p-4 opacity-100' : 'max-h-0 p-0 opacity-0'
                }`}
              >
                <p>
                  <span className="text-[#5f6368]">From:</span> {email.senderEmail}
                </p>
                <p>
                  <span className="text-[#5f6368]">To:</span> {(email.to || ['me']).join(', ')}
                </p>
                {email.cc?.length ? (
                  <p>
                    <span className="text-[#5f6368]">Cc:</span> {email.cc.join(', ')}
                  </p>
                ) : null}
                {email.bcc?.length ? (
                  <p>
                    <span className="text-[#5f6368]">Bcc:</span> {email.bcc.join(', ')}
                  </p>
                ) : null}
                <p>
                  <span className="text-[#5f6368]">Date:</span> {email.date}
                </p>
                {email.replyTo ? (
                  <p>
                    <span className="text-[#5f6368]">Reply-To:</span> {email.replyTo}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div
            className="gmail-message-body mt-7 overflow-x-auto text-[15px] leading-7 text-[#202124] dark:text-[#e3e3e3]"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {email.attachments?.filter((attachment) => !attachment.inline || attachment.filename !== 'Inline image').length ? (
            <section className="mt-8 grid gap-3" aria-label="Attachments">
              {email.attachments
                .filter((attachment) => !attachment.inline || attachment.filename !== 'Inline image')
                .map((attachment) => (
                  <div key={`${attachment.id}-${attachment.filename}`} className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#dadce0] px-3 py-2 dark:border-[#3c4043]">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf1fb] text-[#0b57d0] dark:bg-[#1d2b44] dark:text-[#a8c7fa]">
                      {attachment.mimeType.startsWith('image/') && attachmentData[attachment.contentId || attachment.id] ? (
                        <img src={attachmentData[attachment.contentId || attachment.id]} alt="" className="size-full rounded-xl object-cover" loading="lazy" />
                      ) : (
                        attachmentIcon(attachment)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#202124] dark:text-[#e3e3e3]">{attachment.filename}</p>
                      <p className="text-xs text-[#5f6368] dark:text-[#c4c7c5]">{formatSize(attachment.size) || attachment.mimeType}</p>
                    </div>
                    <IconButton label="Preview attachment" className="size-10">
                      <Eye size={18} />
                    </IconButton>
                    <IconButton label="Download attachment" className="size-10">
                      <Download size={18} />
                    </IconButton>
                  </div>
                ))}
            </section>
          ) : null}

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link to="/compose" state={{ mode: 'reply', ...replyState }} className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#dadce0] text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]">
              <Reply size={18} />
              Reply
            </Link>
            <Link to="/compose" state={{ mode: 'replyAll', ...replyState }} className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#dadce0] text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]">
              <ReplyAll size={18} />
              Reply all
            </Link>
            <Link to="/compose" state={{ mode: 'forward', ...replyState }} className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#dadce0] text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]">
              <Forward size={18} />
              Forward
            </Link>
          </div>
        </article>
      ) : null}
    </main>
  )
}
