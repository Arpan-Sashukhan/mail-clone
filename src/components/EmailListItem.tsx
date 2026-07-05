import { memo, useEffect, useRef, useState } from 'react'
import { FileText, MoreVertical, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from './Avatar'
import type { Email } from '../types/email'

interface EmailListItemProps {
  email: Email
  searchQuery?: string
  onToggleStar?: (id: string) => void
}

function getHighlightTerm(query = '') {
  return query
    .split(/\s+/)
    .find((part) => part && !part.includes(':'))
    ?.trim()
}

function Highlight({ value, query }: { value: string; query?: string }) {
  const term = getHighlightTerm(query)

  if (!term) {
    return <>{value}</>
  }

  const index = value.toLowerCase().indexOf(term.toLowerCase())

  if (index < 0) {
    return <>{value}</>
  }

  return (
    <>
      {value.slice(0, index)}
      <mark className="rounded bg-[#feefc3] px-0.5 text-inherit dark:bg-[#5c4700]">
        {value.slice(index, index + term.length)}
      </mark>
      {value.slice(index + term.length)}
    </>
  )
}

function EmailListItemComponent({ email, searchQuery, onToggleStar }: EmailListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const hasAttachments = Boolean(email.attachments?.length)
  const isDraft = email.labels?.some((label) => label.toLowerCase() === 'draft')

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

  return (
    <Link
      to={`/email/${email.id}`}
      aria-label={`Open email from ${email.sender}`}
      onClick={() => {
        localStorage.setItem('selected_email', JSON.stringify(email))
      }}
      className="gmail-mail-item relative grid grid-cols-[var(--mail-avatar)_minmax(0,1fr)_var(--time-column-compact)] gap-3 overflow-hidden bg-white text-left transition duration-150 hover:bg-[#F8FAFD] active:bg-[#EDF2FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1a73e8]"
    >
      <Avatar name={email.sender} className="mail-avatar text-[16px] font-medium" />

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`truncate text-[14px] leading-[1.3] tracking-normal text-[#202124] ${
                email.read ? 'font-medium' : 'font-semibold'
              }`}
            >
              <Highlight value={email.sender} query={searchQuery} />
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Open email options"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setMenuOpen((value) => !value)
              }}
              className="grid h-9 w-9 place-items-center rounded-full text-[#5f6368] transition hover:bg-[#f1f3f4] active:scale-95 dark:text-[#c4c7c5] dark:hover:bg-white/[0.08]"
            >
              <MoreVertical size={18} />
            </button>
            <div
              className={`absolute right-0 top-[calc(100%+6px)] z-50 w-[220px] overflow-hidden rounded-[20px] bg-white text-[#202124] shadow-[0_10px_32px_rgba(60,64,67,0.18)] transition duration-180 ease-[cubic-bezier(0.2,0,0,1)] ${
                menuOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.96] opacity-0'
              }`}
              role="menu"
              aria-label="Email options"
            >
              {[
                'Move to',
                'Snooze',
                'Change labels',
                'Mark important',
                'Unsubscribe',
                'Mute',
                'Print',
                'Report spam',
                'Add to Tasks',
                'Help & feedback',
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setMenuOpen(false)
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8eaed]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className={`truncate text-[14px] leading-[1.3] tracking-normal text-[#202124] ${email.read ? 'font-normal' : 'font-semibold'}`}>
            {isDraft ? <span className="font-medium text-[#d93025]">Draft </span> : null}
            <Highlight value={email.subject} query={searchQuery} />
          </p>
          <p className="line-clamp-1 mt-1 overflow-hidden text-[13px] leading-[1.2] tracking-normal text-[#5f6368] gmail-preview">
            <Highlight value={email.preview} query={searchQuery} />
          </p>
          {hasAttachments ? (
            <div className="mt-2 flex min-w-0">
              <span className="attachment-chip inline-flex items-center gap-1.5">
                <FileText size={15} strokeWidth={1.8} />
                <span className="truncate">{email.attachments?.[0]?.filename}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col items-end justify-between gap-2 pt-px">
        <span className={`gmail-time truncate ${email.read ? 'font-medium' : 'font-semibold'}`}>{email.timestamp}</span>

        <button
          type="button"
          aria-label={email.starred ? 'Starred email' : 'Star email'}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onToggleStar?.(email.id)
          }}
          className="gmail-star-btn text-[#bdc1c6] transition duration-150 hover:bg-[#F1F3F4] active:scale-90"
        >
          <Star
            size={20}
            strokeWidth={1.75}
            className={email.starred ? 'fill-[#fbc02d] text-[#fbc02d]' : ''}
            aria-hidden="true"
          />
        </button>
      </div>
    </Link>
  )
}

export const EmailListItem = memo(EmailListItemComponent)
