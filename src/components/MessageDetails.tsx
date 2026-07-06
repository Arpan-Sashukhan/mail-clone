import type { Email } from '../types/email'

interface MessageDetailsProps {
  email: Email
}

function SymbolIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-rounded text-2xl leading-none ${className}`}>
      {name}
    </span>
  )
}

function formatMessageDate(email: Email) {
  const source = email.internalDate ? Number(email.internalDate) : email.date
  const date = source ? new Date(source) : undefined

  if (!date || Number.isNaN(date.getTime())) {
    return email.date || email.timestamp || 'Unknown date'
  }

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const day = date.toLocaleDateString('en-GB', { day: '2-digit' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${weekday}, ${day} ${month} ${year} ${hours}:${minutes}`
}

export function MessageDetails({ email }: MessageDetailsProps) {
  const fromName = email.sender || email.senderName || 'Unknown sender'
  const fromEmail = email.senderEmail || 'unknown@example.com'
  const recipient = email.to?.length ? email.to.join(', ') : 'me'
  const date = formatMessageDate(email)

  return (
    <section className="mx-4 mt-2 rounded-2xl border border-[#dadce0] bg-white p-4 font-['Roboto',Arial,sans-serif] text-[13px] font-normal leading-5 text-[#3c4043] dark:border-[#3c4043] dark:bg-[#202124] dark:text-[#e3e3e3]" aria-label="Message details">
      <div className="grid gap-2">
        {[
          ['From', `${fromName} • ${fromEmail}`],
          ['To', recipient],
          ['Date', date],
        ].map(([label, value]) => (
          <div key={label} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2">
            <span className="text-[#5f6368]">{label}</span>
            <span className="min-w-0 break-words text-[#3c4043]">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[56px_minmax(0,1fr)] gap-2 text-[#3c4043]">
        <span className="flex h-6 items-center text-[#5f6368]">
          <SymbolIcon name="lock" className="text-[20px]" />
        </span>
        <div>
          <p>Standard encryption (TLS).</p>
          
            <a href="https://support.google.com/mail/answer/6330403"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-base font-normal leading-6 text-[#1a73e8]"
          >
            See security details
          </a>
        </div>
      </div>
    </section>
  )
}
