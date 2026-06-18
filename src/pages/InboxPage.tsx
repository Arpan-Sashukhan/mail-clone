import { useOutletContext } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { ComposeButton } from '../components/ComposeButton'
import { EmailListItem } from '../components/EmailListItem'
import { SearchBar } from '../components/SearchBar'
import { useEmails } from '../hooks/useEmails'
import type { Mailbox } from '../types/email'

import GmailLogin from '../components/GmailLogin'



interface InboxPageProps {
  mailbox: Mailbox
  settingsView?: boolean
}

interface LayoutContext {
  openDrawer: () => void
}

const mailboxTitles: Record<Mailbox, string> = {
  inbox: 'Primary',
  starred: 'Starred',
  sent: 'Sent',
  drafts: 'Drafts',
  trash: 'Trash',
  custom: 'Custom Mail',
}

export function InboxPage({ mailbox, settingsView = false }: InboxPageProps) {
  const { openDrawer } = useOutletContext<LayoutContext>()
  const { emails, loading, refreshing, refresh } = useEmails(mailbox)

  if (settingsView) {
    return (
      <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-[#f8fafd] dark:bg-[#0f1113]">
        <SearchBar onOpenDrawer={openDrawer} />
        <section className="px-5 py-8">
          <h1 className="text-2xl font-normal text-[#202124] dark:text-[#e3e3e3]">Settings</h1>
          <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.15)] dark:bg-[#17191c]">
            {['Default account', 'Notifications', 'Inbox density', 'Offline mail', 'Signature'].map((item) => (
              <button key={item} type="button" className="flex h-14 w-full items-center border-b border-[#e0e3e7] px-5 text-left text-sm font-medium last:border-b-0 dark:border-[#303134]">
                {item}
              </button>
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-white pb-24 dark:bg-[#0f1113]">
      <SearchBar onOpenDrawer={openDrawer} />

      <div className="px-4 py-2">
        <GmailLogin />
      </div>

      <section className="bg-white px-4 pb-1 pt-2 dark:bg-[#0f1113]">
        <div className="flex items-center justify-between">
          <h1 className="text-xs font-medium uppercase tracking-[0.08em] text-[#5f6368] dark:text-[#c4c7c5]">{mailboxTitles[mailbox]}</h1>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[#5f6368] transition hover:bg-[#f1f3f4] dark:text-[#c4c7c5] dark:hover:bg-white/[0.08]"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing' : 'Pull to refresh'}
          </button>
        </div>
      </section>
      <section aria-label={`${mailboxTitles[mailbox]} emails`}>
        {loading ? (
          <div className="space-y-3 px-4 py-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[72px] animate-pulse rounded-2xl bg-[#eef3f8] dark:bg-[#1f2226]" />
            ))}
          </div>
        ) : (
          emails.map((email) => <EmailListItem key={email.id} email={email} />)
        )}
      </section>
      <ComposeButton />
    </main>
  )
}
