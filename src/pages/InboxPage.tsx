import { useOutletContext } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { BottomNavigation } from '../components/BottomNavigation'
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
  const [pullDistance, setPullDistance] = useState(0)
  const pullStartY = useRef<number | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(searchInput), 360)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const { emails, loading, refreshing, error, refresh, updateEmail } = useEmails(mailbox, searchQuery)
  const searching = useMemo(() => searchInput !== searchQuery || (Boolean(searchQuery) && loading), [loading, searchInput, searchQuery])
  const showPullIndicator = refreshing || pullDistance > 8

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (window.scrollY <= 0) {
      pullStartY.current = event.touches[0]?.clientY ?? null
    }
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (pullStartY.current === null || window.scrollY > 0) {
      return
    }

    const nextDistance = Math.max(0, (event.touches[0]?.clientY ?? pullStartY.current) - pullStartY.current)
    setPullDistance(Math.min(nextDistance * 0.45, 72))
  }

  function handleTouchEnd() {
    if (pullDistance > 56 && !refreshing) {
      void refresh()
    }

    pullStartY.current = null
    setPullDistance(0)
  }

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
    <main
      className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-white pb-40 dark:bg-[#202124]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <SearchBar
        profile={profile}
        onOpenDrawer={openDrawer}
        onLogout={onLogout}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searching={searching}
      />

      <div
        className="grid place-items-center overflow-hidden bg-white transition-[height] duration-150 dark:bg-[#202124]"
        style={{ height: showPullIndicator ? Math.max(32, pullDistance) : 0 }}
        aria-hidden={!showPullIndicator}
      >
        {showPullIndicator ? <span className="size-6 animate-spin rounded-full border-2 border-[#1a73e8] border-t-transparent" /> : null}
      </div>

      <section className="bg-white px-4 pb-3 pt-2 dark:bg-[#202124]">
        <h1 className="text-[16px] font-medium leading-5 tracking-normal text-[#3c4043] dark:text-[#e3e3e3]">{mailboxTitles[mailbox]}</h1>
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
      <BottomNavigation />
    </main>
  )
}
