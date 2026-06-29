import { useOutletContext } from 'react-router-dom'
import { Inbox, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ComposeButton } from '../components/ComposeButton'
import { EmailListItem } from '../components/EmailListItem'
import { SearchBar } from '../components/SearchBar'
import { useEmails } from '../hooks/useEmails'
import type { Mailbox } from '../types/email'
import type { GoogleProfile } from '../services/googleProfile'

interface InboxPageProps {
  mailbox: Mailbox
  settingsView?: boolean
}

interface LayoutContext {
  openDrawer: () => void
  profile: GoogleProfile
  onLogout: () => void
}

const mailboxTitles: Record<Mailbox, string> = {
  inbox: 'Primary',
  starred: 'Starred',
  important: 'Important',
  sent: 'Sent',
  drafts: 'Drafts',
  trash: 'Trash',
  spam: 'Spam',
  social: 'Social',
  promotions: 'Promotions',
  updates: 'Updates',
  forums: 'Forums',
  all: 'All Mail',
  custom: 'Custom Mail',
}

export function InboxPage({ mailbox, settingsView = false }: InboxPageProps) {
  const { openDrawer, profile, onLogout } = useOutletContext<LayoutContext>()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(searchInput), 360)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const { emails, loading, refreshing, error, refresh, updateEmail } = useEmails(mailbox, searchQuery)
  const searching = useMemo(() => searchInput !== searchQuery || (Boolean(searchQuery) && loading), [loading, searchInput, searchQuery])

  if (settingsView) {
    return (
      <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-[#f8fafd] dark:bg-[#202124]">
        <SearchBar profile={profile} onOpenDrawer={openDrawer} onLogout={onLogout} />
        <section className="px-5 py-8">
          <h1 className="text-2xl font-normal text-[#202124] dark:text-[#e3e3e3]">Settings</h1>
          <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.15)] dark:bg-[#303134]">
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
    <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-white pb-24 dark:bg-[#202124]">
      <SearchBar
        profile={profile}
        onOpenDrawer={openDrawer}
        onLogout={onLogout}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searching={searching}
      />

      <section className="bg-white px-4 pb-1 pt-2 dark:bg-[#202124]">
        <div className="flex items-center justify-between">
          <h1 className="text-xs font-medium uppercase tracking-[0.08em] text-[#5f6368] dark:text-[#c4c7c5]">{mailboxTitles[mailbox]}</h1>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[#5f6368] transition hover:bg-[#f1f3f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b57d0] active:scale-[0.98] dark:text-[#c4c7c5] dark:hover:bg-white/[0.08]"
            aria-label="Refresh inbox"
          >
            <span
              className={`grid size-5 place-items-center rounded-full ${
                refreshing ? 'animate-spin border-2 border-[#0b57d0] border-t-transparent' : ''
              }`}
              aria-hidden="true"
            >
              {!refreshing ? <RefreshCw size={15} /> : null}
            </span>
            {refreshing ? 'Refreshing' : 'Pull to refresh'}
          </button>
        </div>
      </section>
      <section aria-label={`${mailboxTitles[mailbox]} emails`}>
        {loading ? (
          <div className="space-y-1 px-4 py-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid min-h-[76px] grid-cols-[40px_1fr_44px] gap-3 overflow-hidden rounded-2xl px-0 py-3">
                <div className="mail-shimmer size-10 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
                <div className="min-w-0 space-y-2">
                  <div className="mail-shimmer h-4 w-7/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
                  <div className="mail-shimmer h-4 w-11/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
                  <div className="mail-shimmer h-4 w-9/12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
                </div>
                <div className="mail-shimmer h-3 w-10 rounded-full bg-[#e8eef7] dark:bg-[#303134]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="grid min-h-[50svh] place-items-center px-8 text-center">
            <div>
              <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#fce8e6] text-[#b3261e] dark:bg-[#3f201d] dark:text-[#f2b8b5]">
                <Inbox size={42} strokeWidth={1.7} />
              </div>
              <h2 className="mt-6 text-xl font-normal text-[#202124] dark:text-[#e3e3e3]">{error}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f6368] dark:text-[#c4c7c5]">Check your connection, then pull to refresh.</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="grid min-h-[50svh] place-items-center px-8 text-center">
            <div>
              <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#eaf1fb] text-[#0b57d0] dark:bg-[#1d2b44] dark:text-[#a8c7fa]">
                <Inbox size={42} strokeWidth={1.7} />
              </div>
              <h2 className="mt-6 text-xl font-normal text-[#202124] dark:text-[#e3e3e3]">
                {searchQuery ? 'No matching emails' : 'No emails here'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5f6368] dark:text-[#c4c7c5]">
                {searchQuery
                  ? 'Try a different Gmail search such as from:, subject:, has:attachment, after:, or filename:.'
                  : 'Messages for this mailbox will appear as soon as Gmail returns them.'}
              </p>
            </div>
          </div>
        ) : (
          emails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              searchQuery={searchQuery}
              onToggleStar={(id) => updateEmail(id, (current) => ({ ...current, starred: !current.starred }))}
            />
          ))
        )}
      </section>
      <ComposeButton />
    </main>
  )
}
