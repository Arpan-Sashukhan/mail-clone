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
  const [fabCompact, setFabCompact] = useState(false)
  const pullStartY = useRef<number | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(searchInput), 250)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const { emails, loading, refreshing, error, refresh, updateEmail } = useEmails(mailbox, searchQuery)
  const searching = useMemo(() => searchInput !== searchQuery || (Boolean(searchQuery) && loading), [loading, searchInput, searchQuery])
  const showPullIndicator = refreshing || pullDistance > 8

  const inboxRef = useRef<HTMLElement>(null)

  function handleTouchEnd() {
    if (pullDistance > 56 && !refreshing) {
      void refresh()
    }

    pullStartY.current = null
    setPullDistance(0)
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if ((inboxRef.current?.scrollTop ?? 0) <= 0) {
      pullStartY.current = event.touches[0]?.clientY ?? null
    }
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (
      pullStartY.current === null ||
      (inboxRef.current?.scrollTop ?? 0) > 0
    ) {
      return
    }

    const nextDistance = Math.max(
      0,
      (event.touches[0]?.clientY ?? pullStartY.current) - pullStartY.current
    )

    setPullDistance(Math.min(nextDistance * 0.45, 72))
  }

  function handleScroll() {
    const nextCompact = (inboxRef.current?.scrollTop ?? 0) > 72
    setFabCompact(nextCompact)
  }

  if (settingsView) {
    return (
      <main className="gmail-scroll gmail-inbox bg-[#f8fafd] dark:bg-[#202124]">
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
      ref={inboxRef}
      className="gmail-scroll gmail-inbox bg-white dark:bg-[#202124]"
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
    <div className="sticky top-0 z-40 bg-inherit pt-[env(safe-area-inset-top)]">
      <SearchBar
        profile={profile}
        onOpenDrawer={openDrawer}
        onLogout={onLogout}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searching={searching}
      />
      </div>

      <div
        className="grid place-items-center overflow-hidden bg-inherit transition-[height] duration-150 "
        style={{ height: showPullIndicator ? Math.max(32, pullDistance) : 0 }}
        aria-hidden={!showPullIndicator}
      >
        {showPullIndicator ? <span className="size-6 animate-spin rounded-full border-2 border-[#1a73e8] border-t-transparent" /> : null}
      </div>

      <section className="sticky top-[calc(env(safe-area-inset-top)+var(--header-height))] z-20 bg-inherit px-4 pt-1 pb-1">
        <h1 className="text-[12px] font-medium not-italic text-[#5f6368] pl-4 pt-1 pb-1">{mailboxTitles[mailbox]}</h1>
      </section>
      <section className="divide-y divide-transparent dark:divide-transparent" aria-label={`${mailboxTitles[mailbox]} emails`}>
        {loading ? (
          <div className="space-y-1 px-[var(--side-padding)] py-[var(--mail-row-padding-y)]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid min-h-[var(--mail-row-min-height)] grid-cols-[var(--mail-avatar)_1fr_var(--time-column-width)] gap-3 overflow-hidden rounded-2xl px-0 py-3">
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
          <div className="grid flex-1 place-items-center px-8 text-center">
            <div>
              <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#fce8e6] text-[#b3261e] dark:bg-[#3f201d] dark:text-[#f2b8b5]">
                <Inbox size={42} strokeWidth={1.7} />
              </div>
              <h2 className="mt-6 text-xl font-normal text-[#202124] dark:text-[#e3e3e3]">{error}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f6368] dark:text-[#c4c7c5]">Check your connection, then pull to refresh.</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="grid min-h-[40svh] place-items-center px-8 text-center">
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
      <div className="fixed bottom-[calc(var(--bottom-nav-height)+16px+env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-50">
        <ComposeButton compact={fabCompact} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-inherit pb-[env(safe-area-inset-bottom)]">
        <BottomNavigation />
      </div>
    </main>
  )
}