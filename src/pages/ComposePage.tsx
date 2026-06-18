import { ArrowLeft, Paperclip, Send, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '../components/IconButton'
import { gmailService } from '../services/gmailService.mock'

export function ComposePage() {
  const navigate = useNavigate()
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await gmailService.sendMail({ senderEmail: to || 'draft@mailx.local', subject: subject || '(no subject)', body })
    setSent(true)
    window.setTimeout(() => navigate('/inbox'), 650)
  }

  return (
    <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-white dark:bg-[#0f1113]">
      <form onSubmit={handleSubmit} className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-1 bg-white/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur dark:bg-[#0f1113]/95">
          <IconButton label="Discard and go back" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </IconButton>
          <h1 className="ml-1 flex-1 text-lg font-normal text-[#202124] dark:text-[#e3e3e3]">Compose</h1>
          <IconButton label="Attach file">
            <Paperclip size={21} />
          </IconButton>
          <button
            type="submit"
            aria-label="Send message"
            title="Send message"
            className="grid size-11 place-items-center rounded-full text-[#0b57d0] transition hover:bg-[#e8f0fe] active:scale-95 dark:text-[#a8c7fa] dark:hover:bg-[#1d2c43]"
          >
            <Send size={21} />
          </button>
          <IconButton label="Discard">
            <Trash2 size={20} />
          </IconButton>
        </header>
        <label className="flex min-h-14 items-center border-b border-[#e0e3e7] px-5 text-sm dark:border-[#303134]">
          <span className="w-16 text-[#5f6368] dark:text-[#c4c7c5]">To</span>
          <input
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-base text-[#202124] outline-none dark:text-[#e3e3e3]"
            inputMode="email"
          />
        </label>
        <label className="flex min-h-14 items-center border-b border-[#e0e3e7] px-5 text-sm dark:border-[#303134]">
          <span className="w-16 text-[#5f6368] dark:text-[#c4c7c5]">Subject</span>
          <input value={subject} onChange={(event) => setSubject(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base text-[#202124] outline-none dark:text-[#e3e3e3]" />
        </label>
        <textarea
          aria-label="Message body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Compose email"
          className="min-h-[50svh] flex-1 resize-none bg-transparent px-5 py-5 text-base leading-7 text-[#202124] outline-none placeholder:text-[#9aa0a6] dark:text-[#e3e3e3] dark:placeholder:text-[#80868b]"
        />
        <div className="flex items-center justify-between border-t border-[#e0e3e7] px-5 py-3 dark:border-[#303134]">
          <div className="flex items-center gap-2 text-sm text-[#5f6368] dark:text-[#c4c7c5]">
            <Paperclip size={18} />
            <span>Attachment placeholder</span>
          </div>
          {sent ? <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-sm font-medium text-[#137333] dark:bg-[#143820] dark:text-[#81c995]">Sent</span> : null}
        </div>
      </form>
    </main>
  )
}
