import {
  ChevronDown,
  Download,
  Eye,
  File,
  FileArchive,
  FileText,
  Inbox,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Avatar } from '../components/Avatar'
import { EmailDetailBottomNav } from '../components/EmailDetailBottomNav'
import { IconButton } from '../components/IconButton'
import { MessageDetails } from '../components/MessageDetails'
import { gmailService } from '../services/gmailService'
import { mailAggregator } from '../services/mailAggregator'
import type { Email, EmailAttachment } from '../types/email'

function labelClass() {
  return 'bg-[#f1f3f4] text-[#5f6368] dark:bg-[#2b2c2f] dark:text-[#c4c7c5]'
}

function SymbolIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-rounded leading-none ${className}`}>
      {name}
    </span>
  )
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

const SENDER_MENU_ITEMS: Array<[string, string]> = [
  ['Reply all', 'reply_all'],
  ['Forward', 'forward'],
  ['Add star', 'star'],
  ['Print', 'print'],
  ['Mark unread from here', 'mark_email_unread'],
  ['Block user', 'block'],
]

function DetailSkeleton() {
  return (
    <div className="px-4 py-4">
      <div className="mail-shimmer h-6 w-10/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
      <div className="mt-5 flex gap-3">
        <div className="mail-shimmer size-10 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
        <div className="flex-1 space-y-3">
          <div className="mail-shimmer h-4 w-5/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
          <div className="mail-shimmer h-3 w-8/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [senderMenuOpen, setSenderMenuOpen] = useState(false)
  const [starred, setStarred] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [attachmentData, setAttachmentData] = useState<Record<string, string>>({})
  const menuRef = useRef<HTMLDivElement>(null)
  const senderMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    async function loadMessage() {
      const accessToken = localStorage.getItem('gmail_access_token')
      const storedEmail = localStorage.getItem('selected_email')
      const selectedEmail = storedEmail ? (JSON.parse(storedEmail) as Email) : undefined

      if (!id) {
        setError('Unable to load this email.')
        setLoading(false)
        return
      }

      try {
        const message = await mailAggregator.getMessage(accessToken, id, selectedEmail?.id === id ? selectedEmail.provider : undefined)

        if (!active) {
          return
        }

        if (!message) {
          setError('Unable to load this email.')
          setLoading(false)
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
              if (message.provider !== 'gmail' || !accessToken) {
                return undefined
              }

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
    if (!menuOpen && !senderMenuOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (menuOpen && !menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }

      if (senderMenuOpen && !senderMenuRef.current?.contains(event.target as Node)) {
        setSenderMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setSenderMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, senderMenuOpen])

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
    <main
      className="gmail-scroll min-h-svh w-full bg-white dark:bg-[#202124]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--email-detail-nav-height) + 16px)' }}
    >
      <header className="sticky top-0 z-20 flex h-14 items-center border-b border-[var(--gmail-divider)] bg-white px-2 pt-[env(safe-area-inset-top)] dark:border-[#303134] dark:bg-[#202124]">
        <IconButton label="Back" onClick={() => navigate(-1)} className="size-10 text-[#5f6368]">
          <SymbolIcon name="arrow_back" className="text-xl" />
        </IconButton>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <IconButton label="Archive" className="size-10 text-[#5f6368]">
            <SymbolIcon name="archive" className="text-xl" />
          </IconButton>
          <IconButton label="Delete" onClick={() => navigate(-1)} className="size-10 text-[#5f6368]">
            <SymbolIcon name="delete" className="text-xl" />
          </IconButton>
          <IconButton label="Mark unread" className="size-10 text-[#5f6368]">
            <SymbolIcon name="mail" className="text-xl" />
          </IconButton>
          <div className="relative" ref={menuRef}>
            <IconButton label="More options" onClick={() => setMenuOpen((value) => !value)} className="size-10 text-[#5f6368]">
              <SymbolIcon name="more_vert" className="text-xl" />
            </IconButton>
            <div
              role="menu"
              className={`absolute right-0 top-12 z-30 w-64 origin-top-right overflow-hidden rounded-[20px] bg-white py-2 text-sm font-medium text-[#202124] shadow-[0_8px_28px_rgba(60,64,67,0.24)] transition duration-180 dark:bg-[#202124] dark:text-[#e3e3e3] ${
                menuOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              {[
                ['Reply All', 'reply_all'],
                ['Forward', 'forward'],
                [starred ? 'Remove Star' : 'Add Star', 'star'],
                ['Delete', 'delete'],
                ['Move', 'drive_file_move'],
                ['Labels', 'label'],
                ['Mark unread', 'mail'],
                ['Print', 'print'],
                ['Report spam', 'report'],
                ['Report phishing', 'gpp_maybe'],
                ['Block sender', 'block'],
                ['Mute conversation', 'inbox'],
              ].map(([label, icon]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (label === 'Add Star' || label === 'Remove Star') {
                      setStarred((value) => !value)
                    }
                    setMenuOpen(false)
                  }}
                  className="flex h-11 w-full items-center gap-4 px-5 text-left transition hover:bg-[#f1f3f4] active:bg-[#e8eaed] dark:hover:bg-white/[0.08]"
                >
                  <SymbolIcon name={icon} className="text-[20px] text-[#5f6368]" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
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
        <article className="email-detail-enter">
          <div className="mx-4 mt-4 flex items-center gap-3">
            <h1 className="min-w-0 flex-1 font-['Google_Sans',Roboto,sans-serif] text-[22px] font-normal leading-[28px] tracking-normal text-[#202124] dark:text-[#e3e3e3]">
              {email.subject}
            </h1>
            <button
              type="button"
              aria-label={starred ? 'Remove star' : 'Add star'}
              onClick={() => setStarred((value) => !value)}
              className="star-button grid size-8 shrink-0 place-items-center rounded-full text-[#bdc1c6] transition duration-150 hover:bg-[#f1f3f4] hover:text-[#fbbc04] active:scale-110 dark:hover:bg-white/[0.08]"
            >
              <SymbolIcon name="star" className={`text-2xl ${starred ? 'material-symbols-filled text-[#fbbc04]' : ''}`} />
          </div>

          {visibleLabels.length ? (
            <div className="mx-4 mt-3 flex flex-wrap gap-1.5">
              {visibleLabels.map((label) => (
                <span key={label} className={`flex h-6 items-center rounded-full px-2.5 text-xs font-medium leading-4 ${labelClass()}`}>
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          <section className="mx-4 mt-4 flex items-start gap-3 pb-3">
            <Avatar name={email.sender} src={email.avatar} className="size-10 text-sm" />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-left">
                  <p className="truncate font-['Google_Sans',Roboto,sans-serif] text-base font-medium leading-5 text-[#202124] dark:text-[#e3e3e3]">{email.sender}</p>
                  <button
                    type="button"
                    onClick={() => setDetailsOpen((value) => !value)}
                    aria-expanded={detailsOpen}
                    aria-label={detailsOpen ? 'Hide sender and recipient details' : 'Show sender and recipient details'}
                    className="mt-0.5 flex max-w-full items-center gap-1 rounded text-left transition hover:text-[#202124] dark:hover:text-[#e3e3e3]"
                  >
                    <span className="truncate text-[13px] font-normal leading-[18px] text-[#5f6368] dark:text-[#c4c7c5]">to me</span>
                    <ChevronDown
                      size={15}
                      strokeWidth={2}
                      className={`shrink-0 text-[#5f6368] transition-transform duration-150 dark:text-[#c4c7c5] ${detailsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                <div className="flex shrink-0 items-center gap-1 pt-0.5">
                  <time className="mr-1 text-[13px] font-normal leading-[18px] text-[#5f6368] dark:text-[#c4c7c5]">{email.timestamp}</time>
                  <Link
                    to="/compose"
                    state={{ mode: 'reply', ...replyState }}
                    aria-label="Reply"
                    className="grid size-8 place-items-center rounded-full text-[#5f6368] transition duration-150 hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:text-[#c4c7c5] dark:hover:bg-white/[0.08]"
                  >
                    <SymbolIcon name="reply" className="text-lg" />
                  </Link>
                  <div className="relative" ref={senderMenuRef}>
                    <IconButton
                      label="More options for this message"
                      onClick={() => setSenderMenuOpen((value) => !value)}
                      className="size-8 text-[#5f6368]"
                    >
                      <SymbolIcon name="more_vert" className="text-lg" />
                    </IconButton>
                    <div
                      role="menu"
                      className={`absolute right-0 top-9 z-30 w-56 origin-top-right overflow-hidden rounded-[20px] bg-white py-2 text-sm font-medium text-[#202124] shadow-[0_8px_28px_rgba(60,64,67,0.24)] transition duration-180 dark:bg-[#202124] dark:text-[#e3e3e3] ${
                        senderMenuOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
                      }`}
                    >
                      {SENDER_MENU_ITEMS.map(([label, icon]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (label === 'Add star') {
                              setStarred((value) => !value)
                            }
                            setSenderMenuOpen(false)
                          }}
                          className="flex h-11 w-full items-center gap-4 px-5 text-left transition hover:bg-[#f1f3f4] active:bg-[#e8eaed] dark:hover:bg-white/[0.08]"
                        >
                          <SymbolIcon name={icon} className="text-[20px] text-[#5f6368]" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {detailsOpen ? <MessageDetails email={email} /> : null}

          <div
            className="gmail-message-body mx-4 mt-4 overflow-x-auto font-['Roboto',Arial,sans-serif] text-base font-normal leading-6 text-[#202124] dark:text-[#e3e3e3]"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {email.attachments?.filter((attachment) => !attachment.inline || attachment.filename !== 'Inline image').length ? (
            <section className="mx-4 mt-6 grid gap-3" aria-label="Attachments">
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

          <div className="mx-4 mt-6 grid grid-cols-3 gap-2">
            <Link to="/compose" state={{ mode: 'reply', ...replyState }} className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#dadce0] text-[13px] font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]">
              <SymbolIcon name="reply" className="text-base" />
              Reply
            </Link>
            <Link to="/compose" state={{ mode: 'replyAll', ...replyState }} className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#dadce0] text-[13px] font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]">
              <SymbolIcon name="reply_all" className="text-base" />
              Reply all
            </Link>
            <Link to="/compose" state={{ mode: 'forward', ...replyState }} className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#dadce0] text-[13px] font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]">
              <SymbolIcon name="forward" className="text-base" />
              Forward
            </Link>
          </div>
        </article>
      ) : null}

      <EmailDetailBottomNav />
    </main>
  )
}
