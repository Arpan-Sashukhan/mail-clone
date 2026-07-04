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
      className="gmail-mail-item relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-[var(--mail-gap)] overflow-hidden px-[var(--mail-horizontal-padding)] py-[var(--mail-row-padding-y)] text-left transition duration-150 before:pointer-events-none before:absolute before:inset-0 before:bg-[#1a73e8]/0 before:transition before:duration-150 hover:bg-[#f8fafd] active:bg-[#edf2fa] active:before:bg-[#1a73e8]/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1a73e8] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.06] dark:active:before:bg-white/[0.08]"

    >
      <Avatar name={email.sender} className="mail-avatar mt-px text-sm font-medium" />

      <div className="flex min-w-0 flex-col">
        <div className="flex min-h-5 items-center">
          <p
            className={`line-clamp-1 text-[length:var(--sender-font)] leading-[1.3] tracking-normal dark:text-[#e3e3e3] ${
              email.read ? 'font-medium text-[#3c4043]' : 'font-semibold text-[#202124]'
            }`}
          >
            <Highlight value={email.sender} query={searchQuery} />
          </p>
        </div>

        <p className={ `line-clamp-1 mt-px overflow-hidden text-[length:var(--subject-font)] leading-[1.3] tracking-normal text-[#202124] dark:text-[#e3e3e3] ${
            email.read ? 'font-normal' : 'font-semibold'
          }`}
        >
          {isDraft ? <span className="font-medium text-[#d93025]">Draft </span> : null}
          <Highlight value={email.subject} query={searchQuery} />
        </p>

        <p className="line-clamp-2 mt-px overflow-hidden text-[length:var(--preview-font)] leading-[1.4] tracking-normal text-[#5f6368] dark:text-[#c4c7c5]">
          <Highlight value={email.preview} query={searchQuery} />
        </p>

        {hasAttachments ? (
          <div className="mt-1 flex min-w-0">
            <span className="inline-flex h-[var(--attachment-chip-height)] max-w-[var(--attachment-chip-max-width)] items-center gap-1.5 rounded-full border border-[#dadce0] px-[clamp(10px,3vw,14px)] text-xs font-medium text-[#5f6368] dark:border-[#5f6368] dark:text-[#c4c7c5]">
              <FileText size={15} strokeWidth={1.8} />
              <span className="truncate">{email.attachments?.[0]?.filename}</span>
            </span>
          </div>
        ) : null}
      </div>

      <div className="relative flex min-w-0 flex-col items-end justify-start gap-2 pt-px">
        <span
          className={`w-[var(--time-column-width)] text-right truncate text-[length:var(--time-font)] leading-[1.3] tracking-normal text-[#5f6368] dark:text-[#c4c7c5] ${
            email.read
              ? 'font-medium'
              : 'font-semibold'
          }`}
        >
          {email.timestamp}
        </span>

        <button
          type="button"
          aria-label={email.starred ? 'Starred email' : 'Star email'}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onToggleStar?.(email.id)
          }}
          className="grid size-[var(--star-button-size)] place-items-center rounded-full text-[#bdc1c6] transition duration-150 hover:bg-[#f1f3f4] hover:text-[#fbc02d] active:scale-90 transition-transform active:bg-[#feefc3] dark:text-[#5f6368] dark:hover:bg-white/[0.08]"
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
