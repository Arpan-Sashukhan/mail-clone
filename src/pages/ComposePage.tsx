import {
  ChevronDown,
  Image,
  MoreVertical,
  Paperclip,
  Palette,
  Save,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IconButton } from '../components/IconButton'
import { gmailService } from '../services/gmailService'
import { getStoredProfile } from '../services/googleProfile'
import type { Email } from '../types/email'

type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward'

type ComposeState = {
  mode?: ComposeMode
  email?: Email
}

const DRAFT_KEY = 'mailx_compose_draft'
const SEND_QUEUE_KEY = 'mailx-send-queue'

function splitRecipients(value: string) {
  return value
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function prefixSubject(subject: string, mode: ComposeMode) {
  if (mode === 'forward') {
    return subject.toLowerCase().startsWith('fw:') ? subject : `FW: ${subject}`
  }

  if (mode === 'reply' || mode === 'replyAll') {
    return subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`
  }

  return subject
}

function buildQuotedMessage(email: Email, mode: ComposeMode) {
  if (mode === 'new') {
    return ''
  }

  const heading =
    mode === 'forward'
      ? `\n\n---------- Forwarded message ---------\nFrom: ${email.senderEmail}\nDate: ${email.date || email.timestamp}\nSubject: ${email.subject}\nTo: ${(email.to || []).join(', ')}\n\n`
      : `\n\nOn ${email.date || email.timestamp}, ${email.senderEmail} wrote:\n`

  return `${heading}${email.bodyPlain || email.body || email.preview}`
}

function queueDraftForRetry(input: unknown) {
  const value = localStorage.getItem(SEND_QUEUE_KEY)
  const queue = value ? (JSON.parse(value) as unknown[]) : []
  queue.push({
    input,
    queuedAt: Date.now(),
  })
  localStorage.setItem(SEND_QUEUE_KEY, JSON.stringify(queue.slice(-10)))
}

export function ComposePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as ComposeState
  const mode = state.mode || 'new'
  const sourceEmail = state.email
  const recoveredDraft = !sourceEmail ? localStorage.getItem(DRAFT_KEY) : null
  const draft = recoveredDraft ? (JSON.parse(recoveredDraft) as { to?: string; cc?: string; bcc?: string; subject?: string; body?: string }) : {}
  const [to, setTo] = useState(() => {
    if (mode === 'reply' && sourceEmail) {
      return sourceEmail.replyTo || sourceEmail.senderEmail
    }

    if (mode === 'replyAll' && sourceEmail) {
      const currentEmail = getStoredProfile()?.email.toLowerCase()
      return [sourceEmail.replyTo || sourceEmail.senderEmail, ...(sourceEmail.to || []), ...(sourceEmail.cc || [])]
        .filter((recipient) => !currentEmail || !recipient.toLowerCase().includes(currentEmail))
        .join(', ')
    }

    return draft.to || ''
  })
  const [cc, setCc] = useState(draft.cc || '')
  const [bcc, setBcc] = useState(draft.bcc || '')
  const [subject, setSubject] = useState(() => (sourceEmail ? prefixSubject(sourceEmail.subject, mode) : draft.subject || ''))
  const [body, setBody] = useState(() => (sourceEmail ? buildQuotedMessage(sourceEmail, mode) : draft.body || ''))
  const [showCopies, setShowCopies] = useState(() => Boolean(cc || bcc))
  const [sending, setSending] = useState(false)
  const [autosavedAt, setAutosavedAt] = useState<Date | null>(null)
  const [snackbar, setSnackbar] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ to, cc, bcc, subject, body }))
      setAutosavedAt(new Date())
    }, 1800)

    return () => window.clearTimeout(timeout)
  }, [bcc, body, cc, subject, to])

  useEffect(() => {
    if (!textareaRef.current) {
      return
    }

    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.max(260, textareaRef.current.scrollHeight)}px`
  }, [body])

  useEffect(() => {
    if (!snackbar) {
      return undefined
    }

    const timeout = window.setTimeout(() => setSnackbar(''), 3400)
    return () => window.clearTimeout(timeout)
  }, [snackbar])

  const recipientChips = useMemo(() => splitRecipients(to), [to])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (sending) {
      return
    }

    const accessToken = localStorage.getItem('gmail_access_token')

    if (!accessToken) {
      setSnackbar('No Gmail Connected')
      return
    }

    setSending(true)

    try {
      const messageInput = {
        to: splitRecipients(to),
        cc: splitRecipients(cc),
        bcc: splitRecipients(bcc),
        subject: subject || '(no subject)',
        body,
        threadId: sourceEmail?.threadId,
        inReplyTo: sourceEmail?.rawHeaders?.['Message-ID'],
      }

      if (!navigator.onLine) {
        queueDraftForRetry(messageInput)
        localStorage.removeItem(DRAFT_KEY)
        setSnackbar('No Internet. Message queued.')
        window.setTimeout(() => navigate('/inbox'), 650)
        return
      }

      await gmailService.sendMail(accessToken, messageInput)
      localStorage.removeItem(DRAFT_KEY)
      setSnackbar('Message sent')
      window.setTimeout(() => navigate('/inbox'), 650)
    } catch {
      queueDraftForRetry({ to: splitRecipients(to), cc: splitRecipients(cc), bcc: splitRecipients(bcc), subject: subject || '(no subject)', body, threadId: sourceEmail?.threadId })
      setSnackbar('Unable to send. Draft queued.')
      setSending(false)
    }
  }

  function discard() {
    localStorage.removeItem(DRAFT_KEY)
    navigate(-1)
  }

  return (
    <main className="compose-motion gmail-scroll mx-auto min-h-svh max-w-2xl bg-white dark:bg-[#202124]">
      <form onSubmit={handleSubmit} className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-1 bg-white/96 px-2 pt-[env(safe-area-inset-top)] shadow-[0_1px_2px_rgba(60,64,67,0.08)] backdrop-blur dark:bg-[#202124]/95">
          <IconButton label="Close compose" onClick={() => (to || subject || body ? setConfirmDiscard(true) : navigate(-1))}>
            <X size={22} />
          </IconButton>
          <div className="ml-1 min-w-0 flex-1">
            <h1 className="truncate text-lg font-normal text-[#202124] dark:text-[#e3e3e3]">Compose</h1>
            <p className="truncate text-xs text-[#5f6368] dark:text-[#c4c7c5]">
              {sending ? 'Sending...' : autosavedAt ? `Saved ${autosavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Saving draft...'}
            </p>
          </div>
          <IconButton label="Attach file">
            <Paperclip size={21} />
          </IconButton>
          <button
            type="submit"
            aria-label="Send message"
            title="Send message"
            disabled={sending || !to.trim()}
            className="grid size-11 place-items-center rounded-full text-[#0b57d0] transition hover:bg-[#e8f0fe] active:scale-95 disabled:pointer-events-none disabled:opacity-45 dark:text-[#a8c7fa] dark:hover:bg-[#1d2c43]"
          >
            {sending ? <span className="size-5 animate-spin rounded-full border-2 border-[#0b57d0] border-t-transparent" /> : <Send size={21} />}
          </button>
          <IconButton label="More options">
            <MoreVertical size={21} />
          </IconButton>
        </header>

        <section className="px-5">
          <div className="flex min-h-14 items-center border-b border-[#e0e3e7] text-sm dark:border-[#303134]">
            <span className="w-12 shrink-0 text-[#5f6368] dark:text-[#c4c7c5]">To</span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-2">
              {recipientChips.slice(0, 3).map((recipient) => (
                <span key={recipient} className="max-w-[180px] truncate rounded-full bg-[#eaf1fb] px-3 py-1 text-sm text-[#0b57d0] dark:bg-[#1d2b44] dark:text-[#a8c7fa]">
                  {recipient}
                </span>
              ))}
              <input
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="min-w-[140px] flex-1 bg-transparent text-base text-[#202124] outline-none dark:text-[#e3e3e3]"
                inputMode="email"
                aria-label="Recipients"
              />
            </div>
            <button type="button" aria-label="Show CC and BCC" onClick={() => setShowCopies((value) => !value)} className="grid size-10 place-items-center rounded-full text-[#5f6368] transition hover:bg-[#f1f3f4] dark:text-[#c4c7c5] dark:hover:bg-white/[0.08]">
              <ChevronDown size={19} className={`transition ${showCopies ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showCopies ? (
            <>
              <label className="flex min-h-14 items-center border-b border-[#e0e3e7] text-sm dark:border-[#303134]">
                <span className="w-12 text-[#5f6368] dark:text-[#c4c7c5]">Cc</span>
                <input value={cc} onChange={(event) => setCc(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base text-[#202124] outline-none dark:text-[#e3e3e3]" inputMode="email" />
              </label>
              <label className="flex min-h-14 items-center border-b border-[#e0e3e7] text-sm dark:border-[#303134]">
                <span className="w-12 text-[#5f6368] dark:text-[#c4c7c5]">Bcc</span>
                <input value={bcc} onChange={(event) => setBcc(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base text-[#202124] outline-none dark:text-[#e3e3e3]" inputMode="email" />
              </label>
            </>
          ) : null}

          <label className="flex min-h-14 items-center border-b border-[#e0e3e7] text-sm dark:border-[#303134]">
            <span className="w-20 text-[#5f6368] dark:text-[#c4c7c5]">Subject</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base text-[#202124] outline-none dark:text-[#e3e3e3]" />
          </label>
        </section>

        <textarea
          ref={textareaRef}
          aria-label="Message body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Compose email"
          className="min-h-[50svh] flex-1 resize-none bg-transparent px-5 py-5 text-base leading-7 text-[#202124] outline-none placeholder:text-[#9aa0a6] dark:text-[#e3e3e3] dark:placeholder:text-[#80868b]"
        />

        <div className="sticky bottom-0 flex items-center justify-between border-t border-[#e0e3e7] bg-white/96 px-3 py-2 backdrop-blur dark:border-[#303134] dark:bg-[#202124]/95">
          <div className="flex items-center gap-1">
            <IconButton label="Attach file">
              <Paperclip size={20} />
            </IconButton>
            <IconButton label="Insert image">
              <Image size={20} />
            </IconButton>
            <IconButton label="Formatting options">
              <Palette size={20} />
            </IconButton>
          </div>
          <div className="flex items-center gap-1">
            <IconButton label="Save draft">
              <Save size={20} />
            </IconButton>
            <IconButton label="Discard draft" onClick={() => setConfirmDiscard(true)}>
              <Trash2 size={20} />
            </IconButton>
          </div>
        </div>
      </form>

      {confirmDiscard ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-6" role="dialog" aria-modal="true" aria-label="Discard draft">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-[0_12px_34px_rgba(60,64,67,0.28)] dark:bg-[#202124]">
            <h2 className="text-xl font-normal text-[#202124] dark:text-[#e3e3e3]">Discard draft?</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f6368] dark:text-[#c4c7c5]">This draft will be removed from this device.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDiscard(false)} className="h-10 rounded-full px-4 text-sm font-medium text-[#0b57d0] transition hover:bg-[#e8f0fe] dark:text-[#a8c7fa]">
                Cancel
              </button>
              <button type="button" onClick={discard} className="h-10 rounded-full px-4 text-sm font-medium text-[#b3261e] transition hover:bg-[#fce8e6] dark:text-[#f2b8b5] dark:hover:bg-[#3f201d]">
                Discard
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 min-w-[220px] -translate-x-1/2 rounded-xl bg-[#323232] px-4 py-3 text-sm font-medium text-white shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition duration-200 ${
          snackbar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        {snackbar}
      </div>
    </main>
  )
}
