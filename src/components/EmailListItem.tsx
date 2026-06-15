import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from './Avatar'
import type { Email } from '../types/email'

interface EmailListItemProps {
  email: Email
}

export function EmailListItem({ email }: EmailListItemProps) {
  return (
    <Link
      to={`/email/${email.id}`}
      className="grid grid-cols-[48px_1fr_auto] gap-3 px-4 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-[#1f2023] dark:active:bg-[#24262a]"
    >
      <Avatar name={email.sender} className="mt-1" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className={`truncate text-[15px] leading-5 text-slate-900 dark:text-slate-100 ${email.read ? 'font-medium' : 'font-bold'}`}>
            {email.sender}
          </p>
        </div>
        <p className={`truncate text-[14px] leading-5 text-slate-900 dark:text-slate-100 ${email.read ? 'font-normal' : 'font-semibold'}`}>
          {email.subject}
        </p>
        <p className="truncate text-[14px] leading-5 text-slate-500 dark:text-slate-400">{email.preview}</p>
      </div>
      <div className="flex min-w-[54px] flex-col items-end gap-4 pt-0.5">
        <span className={`text-xs ${email.read ? 'text-slate-500 dark:text-slate-400' : 'font-bold text-[#0b57d0] dark:text-[#8ab4f8]'}`}>
          {email.timestamp}
        </span>
        <Star
          size={19}
          className={email.starred ? 'fill-[#fbbc04] text-[#fbbc04]' : 'text-slate-400 dark:text-slate-500'}
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}
