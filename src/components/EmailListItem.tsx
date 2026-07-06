import { memo } from 'react'
import { FileText, Star } from 'lucide-react'
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
  const hasAttachments = Boolean(email.attachments?.length)
  const isDraft = email.labels?.some((label) => label.toLowerCase() === 'draft')

  return (
    <Link
      to={`/email/${email.id}`}
      aria-label={`Open email from ${email.sender}`}
      onClick={() => {
        localStorage.setItem('selected_email', JSON.stringify(email))
      }}
      className="gmail-mail-item relative grid grid-cols-[var(--mail-avatar)_minmax(0,1fr)] items-center gap-4 overflow-hidden bg-white text-left transition duration-150 hover:bg-[#F8FAFD] active:bg-[#EDF2FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1a73e8]"
    >
      <Avatar name={email.sender} className="mail-avatar text-[16px] font-medium" />

      <div className="flex min-w-0 flex-col justify-center gap-[2px]">
        {/* Line 1: sender ... timestamp */}
        <div className="flex min-w-0 items-baseline gap-2">
          <p
            className={`min-w-0 flex-1 truncate font-['Roboto',Arial,sans-serif] text-[15px] leading-[1.3] tracking-normal text-[#202124] ${
              email.read ? 'font-normal' : 'font-semibold'
            }`}
          >
            <Highlight value={email.sender} query={searchQuery} />
          </p>
          <span
            className={`gmail-time shrink-0 truncate ${email.read ? 'font-normal' : 'font-semibold'}`}
          >
            {email.timestamp}
          </span>
        </div>

        {/* Line 2: subject - preview ... star */}
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 flex-1 truncate font-['Roboto',Arial,sans-serif] text-[14px] leading-[1.3] tracking-normal">
            {isDraft ? <span className="font-medium text-[#d93025]">Draft </span> : null}
            <span className={`text-[#202124] ${email.read ? 'font-normal' : 'font-semibold'}`}>
              <Highlight value={email.subject} query={searchQuery} />
            </span>
            <span className="text-[#5f6368]"> - <Highlight value={email.preview} query={searchQuery} /></span>
          </p>

          <button
            type="button"
            aria-label={email.starred ? 'Starred email' : 'Star email'}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onToggleStar?.(email.id)
            }}
            className="gmail-star-btn shrink-0 text-[#bdc1c6] transition duration-150 hover:bg-[#F1F3F4] active:scale-90"
          >
            <Star
              size={20}
              strokeWidth={1.75}
              className={email.starred ? 'fill-[#fbc02d] text-[#fbc02d]' : ''}
              aria-hidden="true"
            />
          </button>
        </div>

        {hasAttachments ? (
          <div className="mt-1 flex min-w-0">
            <span className="attachment-chip inline-flex items-center gap-1.5">
              <FileText size={15} strokeWidth={1.8} />
              <span className="truncate">{email.attachments?.[0]?.filename}</span>
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}

export const EmailListItem = memo(EmailListItemComponent)
