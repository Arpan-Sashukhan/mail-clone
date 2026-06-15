import { useOutletContext } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { ComposeButton } from '../components/ComposeButton'
import { EmailListItem } from '../components/EmailListItem'
import { SearchBar } from '../components/SearchBar'
import { useEmails } from '../hooks/useEmails'
import type { Mailbox } from '../types/email'

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
      <main className="mx-auto min-h-svh max-w-2xl bg-white dark:bg-[#111315]">
        <SearchBar onOpenDrawer={openDrawer} />
        <section className="px-5 py-8">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {['Default account', 'Notifications', 'Inbox density', 'Offline mail', 'Signature'].map((item) => (
              <button key={item} type="button" className="flex h-14 w-full items-center px-4 text-left text-sm font-medium">
                {item}
              </button>
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-svh max-w-2xl bg-white pb-24 dark:bg-[#111315]">
      <SearchBar onOpenDrawer={openDrawer} />
      <section className="px-4 pb-1 pt-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{mailboxTitles[mailbox]}</h1>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#202124]"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing' : 'Pull to refresh'}
          </button>
        </div>
      </section>
      <section aria-label={`${mailboxTitles[mailbox]} emails`}>
        {loading ? (
          <div className="space-y-4 px-4 py-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-[#202124]" />
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
