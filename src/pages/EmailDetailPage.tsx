import { ArrowLeft, Archive, Forward, MoreVertical, Reply, ReplyAll, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { IconButton } from '../components/IconButton'
import { gmailService } from '../services/gmailService'
import type { Email } from '../types/email'

export function EmailDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState<Email | undefined>()

  useEffect(() => {
    if (id) {
      gmailService.getMessage(id).then(setEmail)
    }
  }, [id])

  if (!email) {
    return (
      <main className="mx-auto min-h-svh max-w-2xl bg-white dark:bg-[#111315]">
        <div className="flex h-16 items-center px-2">
          <IconButton label="Back" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </IconButton>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-svh max-w-2xl bg-white pb-8 dark:bg-[#111315]">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-1 bg-white/95 px-2 backdrop-blur dark:bg-[#111315]/95">
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
        <IconButton label="More options">
          <MoreVertical size={21} />
        </IconButton>
      </header>
      <article className="px-5">
        <h1 className="pt-3 text-[27px] font-normal leading-tight tracking-normal text-slate-900 dark:text-slate-50">{email.subject}</h1>
        <div className="mt-6 flex items-start gap-3">
          <Avatar name={email.sender} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">{email.sender}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">to me • {email.senderEmail}</p>
              </div>
              <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{email.timestamp}</time>
            </div>
          </div>
        </div>
        <div className="mt-7 whitespace-pre-line text-[15px] leading-7 text-slate-800 dark:text-slate-100">{email.body}</div>
        <div className="mt-10 grid grid-cols-3 gap-2">
          <Link to="/compose" className="flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-100">
            <Reply size={18} />
            Reply
          </Link>
          <Link to="/compose" className="flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-100">
            <ReplyAll size={18} />
            Reply all
          </Link>
          <Link to="/compose" className="flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-100">
            <Forward size={18} />
            Forward
          </Link>
        </div>
      </article>
    </main>
  )
}
