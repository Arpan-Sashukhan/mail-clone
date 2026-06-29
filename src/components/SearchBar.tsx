import { LogOut, Menu, Plus, RefreshCw, Search, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from './Avatar'
import { IconButton } from './IconButton'
import type { GoogleProfile } from '../services/googleProfile'

interface SearchBarProps {
  profile: GoogleProfile
  onOpenDrawer: () => void
  onLogout: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searching?: boolean
}

export function SearchBar({ profile, onOpenDrawer, onLogout, searchValue = '', onSearchChange, searching = false }: SearchBarProps) {
  const [accountOpen, setAccountOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!accountOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAccountOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountOpen])

  return (
    <header className="sticky top-0 z-20 bg-white/96 px-3 pb-2 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur dark:bg-[#202124]/95">
      <div className="relative flex h-14 items-center gap-1 rounded-full bg-[#f0f4f9] px-1 shadow-[0_1px_2px_rgba(60,64,67,0.22),0_1px_3px_1px_rgba(60,64,67,0.12)] transition-shadow focus-within:shadow-[0_2px_8px_rgba(60,64,67,0.2)] dark:bg-[#303134] dark:shadow-black/40">
        <IconButton label="Open navigation" onClick={onOpenDrawer}>
          <Menu size={24} />
        </IconButton>
        {searching ? (
          <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-[#0b57d0] border-t-transparent" aria-hidden="true" />
        ) : (
          <Search size={20} className="shrink-0 text-[#5f6368] dark:text-[#c4c7c5]" aria-hidden="true" />
        )}
        <input
          aria-label="Search emails"
          placeholder="Search in emails"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-base font-normal text-[#202124] outline-none placeholder:text-[#5f6368] dark:text-[#e3e3e3] dark:placeholder:text-[#c4c7c5]"
        />
        <button
          type="button"
          aria-label="Open Google account menu"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((value) => !value)}
          className="mr-2 grid size-10 shrink-0 place-items-center rounded-full transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b57d0] active:scale-95 active:bg-black/10 dark:hover:bg-white/[0.08]"
        >
          <Avatar name={profile.name} src={profile.picture} className="size-8 text-xs shadow-[0_0_0_2px_white] dark:shadow-[0_0_0_2px_#303134]" />
        </button>

        <div
          ref={menuRef}
          className={`absolute right-0 top-[calc(100%+10px)] z-40 w-[min(360px,calc(100vw-24px))] origin-top-right rounded-[28px] bg-[#f8fafd] p-2 text-[#202124] shadow-[0_12px_34px_rgba(60,64,67,0.28)] transition duration-200 dark:bg-[#202124] dark:text-[#e3e3e3] ${
            accountOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
          }`}
          role="menu"
          aria-label="Google account"
        >
          <div className="rounded-[24px] bg-white px-4 pb-4 pt-5 text-center dark:bg-[#303134]">
            <Avatar name={profile.name} src={profile.picture} className="mx-auto size-20 text-2xl" />
            <p className="mt-3 truncate text-lg font-medium">{profile.name}</p>
            <p className="truncate text-sm text-[#5f6368] dark:text-[#c4c7c5]">{profile.email}</p>
            <button
              type="button"
              className="mt-5 h-10 rounded-full border border-[#dadce0] px-5 text-sm font-medium text-[#0b57d0] transition hover:bg-[#eef3fd] active:scale-[0.98] dark:border-[#5f6368] dark:text-[#a8c7fa] dark:hover:bg-[#1d2b44]"
            >
              Manage your Google Account
            </button>
          </div>

          <div className="mt-2 overflow-hidden rounded-[24px] bg-white dark:bg-[#303134]">
            <div className="flex min-h-14 items-center gap-4 px-4 text-sm font-medium">
              <Avatar name={profile.name} src={profile.picture} className="size-9 text-xs" />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate">Current Account</p>
                <p className="truncate text-xs font-normal text-[#5f6368] dark:text-[#c4c7c5]">{profile.email}</p>
              </div>
            </div>
            <button type="button" className="flex h-12 w-full items-center gap-4 px-5 text-left text-sm font-medium transition hover:bg-[#f1f3f4] active:bg-[#e8eaed] dark:hover:bg-white/[0.08]">
              <Plus size={20} />
              Add another account
            </button>
            <button type="button" className="flex h-12 w-full items-center gap-4 px-5 text-left text-sm font-medium transition hover:bg-[#f1f3f4] active:bg-[#e8eaed] dark:hover:bg-white/[0.08]">
              <RefreshCw size={20} />
              Switch Account
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-12 w-full items-center gap-4 px-5 text-left text-sm font-medium transition hover:bg-[#fce8e6] active:bg-[#f9dedc] dark:hover:bg-[#3f201d]"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2 py-2 text-xs text-[#5f6368] dark:text-[#c4c7c5]">
            <UserRound size={14} />
            <span>MailX</span>
          </div>
        </div>
      </div>
    </header>
  )
}
