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
      className="gmail-mail-item relative grid grid-cols-[var(--mail-avatar)_minmax(0,1fr)_var(--time-column-compact)] gap-3 overflow-hidden bg-white text-left transition duration-150 hover:bg-[#F8FAFD] active:bg-[#EDF2FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1a73e8]"
    >
      <Avatar name={email.sender} className="mail-avatar text-[16px] font-medium" />

      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="min-w-0">
          <p
            className={`gmail-sender truncate font-['Roboto',Arial,sans-serif] leading-[20px] tracking-normal text-[#202124] ${
              email.read ? 'font-medium' : 'font-semibold'
            }`}
          >
            <Highlight value={email.sender} query={searchQuery} />
          </p>
        </div>

        <div className="min-w-0">
          <p className={`gmail-subject truncate font-['Roboto',Arial,sans-serif] leading-[18px] tracking-normal text-[#202124] ${email.read ? 'font-normal' : 'font-semibold'}`}>
            {isDraft ? <span className="font-medium text-[#d93025]">Draft </span> : null}
            <Highlight value={email.subject} query={searchQuery} />
          </p>
          <p className="gmail-preview truncate font-['Roboto',Arial,sans-serif] leading-[16px] tracking-normal">
            <Highlight value={email.preview} query={searchQuery} />
            {hasAttachments ? (
              <span className="ml-1 inline-flex align-middle text-[#5f6368]">
                <FileText size={13} strokeWidth={1.8} />
              </span>
            ) : null}
          </p>
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
