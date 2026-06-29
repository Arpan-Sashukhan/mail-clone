import { memo } from 'react'
import { Star } from 'lucide-react'
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
  return (
    <Link
      to={`/email/${email.id}`}
      onClick={() => {
        localStorage.setItem('selected_email', JSON.stringify(email))
      }}
      className="relative grid min-h-[76px] grid-cols-[40px_minmax(0,1fr)_56px] gap-3 overflow-hidden px-4 py-2.5 text-left transition duration-150 before:absolute before:inset-0 before:bg-[#0b57d0]/0 before:transition hover:bg-[#f8fafd] active:before:bg-[#0b57d0]/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0b57d0] dark:hover:bg-white/[0.04] dark:active:before:bg-white/[0.08]"
    >
      <Avatar name={email.sender} className="mt-1 size-10" />

      <div className="relative min-w-0">
        <div className="flex min-h-5 items-center gap-2">
          <p
            className={`truncate text-[15px] leading-5 text-[#202124] dark:text-[#e3e3e3] ${
              email.read ? 'font-normal' : 'font-bold'
            }`}
          >
            <Highlight value={email.sender} query={searchQuery} />
          </p>
        </div>

        <p
          className={`truncate text-[14px] leading-5 text-[#202124] dark:text-[#e3e3e3] ${
            email.read ? 'font-normal' : 'font-bold'
          }`}
        >
          <Highlight value={email.subject} query={searchQuery} />
        </p>

        <p className="truncate text-[14px] leading-5 text-[#5f6368] dark:text-[#c4c7c5]">
          <Highlight value={email.preview} query={searchQuery} />
        </p>
      </div>

      <div className="relative flex min-w-0 flex-col items-end justify-between pb-0.5 pt-0.5">
        <span
          className={`max-w-full truncate text-xs leading-5 ${
            email.read
              ? 'text-[#5f6368] dark:text-[#c4c7c5]'
              : 'font-bold text-[#0b57d0] dark:text-[#a8c7fa]'
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
          className="grid size-9 place-items-center rounded-full text-[#bdc1c6] transition hover:bg-[#f1f3f4] hover:text-[#fbbc04] active:scale-90 active:bg-[#feefc3] dark:text-[#5f6368] dark:hover:bg-white/[0.08]"
        >
          <Star
            size={19}
            className={email.starred ? 'fill-[#fbbc04] text-[#fbbc04]' : ''}
            aria-hidden="true"
          />
        </button>
      </div>
    </Link>
  )
}

export const EmailListItem = memo(EmailListItemComponent)
