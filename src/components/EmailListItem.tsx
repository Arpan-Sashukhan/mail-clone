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
onClick={() => {
localStorage.setItem(
'selected_email',
JSON.stringify(email)
)
}}
className="grid min-h-[72px] grid-cols-[40px_1fr_auto] gap-3 px-4 py-2.5 text-left transition duration-150 hover:bg-[#f8fafd] active:bg-[#eef3f8] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.08]"
> <Avatar
     name={email.sender}
     className="mt-1 size-10"
   />

  <div className="min-w-0">
    <div className="flex min-h-5 items-center gap-2">
      <p
        className={`truncate text-[15px] leading-5 text-[#202124] dark:text-[#e3e3e3] ${
          email.read ? 'font-normal' : 'font-bold'
        }`}
      >
        {email.sender}
      </p>
    </div>

    <p
      className={`truncate text-[14px] leading-5 text-[#202124] dark:text-[#e3e3e3] ${
        email.read ? 'font-normal' : 'font-bold'
      }`}
    >
      {email.subject}
    </p>

    <p className="truncate text-[14px] leading-5 text-[#5f6368] dark:text-[#c4c7c5]">
      {email.preview}
    </p>
  </div>

  <div className="flex min-w-[52px] flex-col items-end gap-3 pt-0.5">
    <span
      className={`text-xs leading-5 ${
        email.read
          ? 'text-[#5f6368] dark:text-[#c4c7c5]'
          : 'font-bold text-[#0b57d0] dark:text-[#a8c7fa]'
      }`}
    >
      {email.timestamp}
    </span>

    <Star
      size={18}
      className={
        email.starred
          ? 'fill-[#fbbc04] text-[#fbbc04]'
          : 'text-[#bdc1c6] dark:text-[#5f6368]'
      }
      aria-hidden="true"
    />
  </div>
</Link>


)
}
