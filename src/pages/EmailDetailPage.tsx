import {
  ArrowLeft,
  Archive,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Avatar } from '../components/Avatar'
import { IconButton } from '../components/IconButton'
import type { Email } from '../types/email'

export function EmailDetailPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState<Email | undefined>()

  useEffect(() => {
    const storedEmail =
      localStorage.getItem('selected_email')

    if (storedEmail) {
      setEmail(JSON.parse(storedEmail))
    }
  }, [])

  if (!email) {
    return (
      <main className="mx-auto min-h-svh max-w-2xl bg-white dark:bg-[#0f1113]">
        <div className="flex h-16 items-center px-2 pt-[env(safe-area-inset-top)]">
          <IconButton
            label="Back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={22} />
          </IconButton>
        </div>
      </main>
    )
  }

  return (
    <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-white pb-8 dark:bg-[#0f1113]">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-1 bg-white/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur dark:bg-[#0f1113]/95">
        <IconButton
          label="Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </IconButton>

        <div className="flex-1" />

        <IconButton label="Archive">
          <Archive size={21} />
        </IconButton>

        <IconButton label="Delete">
          <Trash2 size={21} />
        </IconButton>

        <IconButton label="More options">
          <MoreVertical size={21} />
        </IconButton>
      </header>

      <article className="px-5">
        <h1 className="pt-3 text-[26px] font-normal leading-[1.18] tracking-normal text-[#202124] dark:text-[#e3e3e3]">
          {email.subject}
        </h1>

        <div className="mt-6 flex items-start gap-3">
          <Avatar
            name={email.sender}
            className="size-10"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold leading-5 text-[#202124] dark:text-[#e3e3e3]">
                  {email.sender}
                </p>

                <p className="truncate text-xs leading-5 text-[#5f6368] dark:text-[#c4c7c5]">
                  to me • {email.senderEmail}
                </p>
              </div>

              <time className="shrink-0 text-xs leading-5 text-[#5f6368] dark:text-[#c4c7c5]">
                {email.timestamp}
              </time>
            </div>
          </div>
        </div>

        <div className="mt-7 whitespace-pre-line text-[15px] leading-7 text-[#202124] dark:text-[#e3e3e3]">
          {email.body}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/compose"
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#dadce0] text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]"
          >
            <Reply size={18} />
            Reply
          </Link>

          <Link
            to="/compose"
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#dadce0] text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]"
          >
            <ReplyAll size={18} />
            Reply all
          </Link>

          <Link
            to="/compose"
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#dadce0] text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8f0fe] dark:border-[#5f6368] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]"
          >
            <Forward size={18} />
            Forward
          </Link>
        </div>
      </article>
    </main>
  )
}