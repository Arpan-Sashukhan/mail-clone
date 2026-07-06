import { Menu, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

type AccountRow = {
  name: string
  email: string
  unread: string
  color: string
}

const secondaryAccounts: AccountRow[] = [
  { name: 'Arpan Sadhukhan', email: 'arpan_pg_23@cse.nits.ac.in', unread: '99+', color: '#7baaf7' },
  { name: 'Arpan Sadhukhan', email: 'mailtosadhukhan@gmail.com', unread: '99+', color: '#ee6a5f' },
  { name: 'ARPAN SADHUKHAN', email: 'arpan40432@paruluniv.ac.in', unread: '99+', color: '#8d6e63' },
]

function SymbolIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-rounded text-2xl leading-none ${className}`}>
      {name}
    </span>
  )
}

function GoogleWordmark() {
  return (
    <div aria-label="Google" className="absolute left-1/2 -translate-x-1/2 font-['Google_Sans',Roboto,sans-serif] text-[22px] font-normal leading-7 tracking-normal">
      <span className="text-[#4285f4]">G</span>
      <span className="text-[#ea4335]">o</span>
      <span className="text-[#fbbc04]">o</span>
      <span className="text-[#4285f4]">g</span>
      <span className="text-[#34a853]">l</span>
      <span className="text-[#ea4335]">e</span>
    </div>
  )
}

function AccountAvatar({ name, src, size = 'size-12', textSize = 'text-base', color }: { name: string; src?: string; size?: string; textSize?: string; color?: string }) {
  return <Avatar name={name} src={src} color={color} className={`${size} ${textSize}`} />
}

export function SearchBar({ profile, onOpenDrawer, onLogout, searchValue = '', onSearchChange, searching = false }: SearchBarProps) {
  const [accountOpen, setAccountOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!accountOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
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
    <header className="sticky top-0 z-20 bg-white pb-2 pt-[env(safe-area-inset-top)] gmail-search">
      <div className="relative gmail-search-inner">
        <IconButton label="Open navigation" onClick={onOpenDrawer} className="size-12">
          <Menu size={20} />
        </IconButton>
        {searching ? (
          <span className="ml-2 size-6 shrink-0 animate-spin rounded-full border-2 border-[#1a73e8] border-t-transparent" aria-hidden="true" />
        ) : (
          <Search size={20} className="ml-2 shrink-0 text-[#5f6368] dark:text-[#c4c7c5]" aria-hidden="true" />
        )}
        <input
          aria-label="Search emails"
          placeholder="Search in emails"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          className="gmail-search-input h-full min-w-0 flex-1 bg-transparent pl-4 pr-2 text-[14px] font-normal leading-none text-[#202124] outline-none placeholder:text-[#5f6368]"
        />
        <div className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            aria-label="Open Google account menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((value) => !value)}
            className="grid size-12 shrink-0 place-items-center rounded-full transition duration-150 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a73e8] active:scale-95 active:bg-black/10 dark:hover:bg-white/[0.08]"
          >
            <Avatar name={profile.name} src={profile.picture} color="#8d6e63" className="gmail-avatar size-8 text-xs shadow-[0_0_0_2px_white]" />
          </button>

          {createPortal(
            <>
              {/* Scrim */}
              <button
                type="button"
                aria-label="Close account menu"
                tabIndex={-1}
                onClick={() => setAccountOpen(false)}
                className={`fixed inset-0 z-[90] bg-black transition-opacity duration-200 ${
                  accountOpen ? 'pointer-events-auto opacity-40' : 'pointer-events-none opacity-0'
                }`}
              />

              {/* Panel */}
              <div
                ref={panelRef}
                className={`fixed right-[max(12px,env(safe-area-inset-right))] top-[calc(env(safe-area-inset-top)+64px)] z-[95] max-h-[calc(100vh-env(safe-area-inset-top)-80px)] w-[min(320px,calc(100vw-32px))] origin-top-right overflow-y-auto rounded-[20px] bg-white text-[#202124] shadow-[0_8px_28px_rgba(60,64,67,0.26)] transition duration-180 ease-[cubic-bezier(0.2,0,0,1)] ${
                  accountOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.96] opacity-0'
                }`}
                role="menu"
                aria-label="Google account"
              >
              <div className="relative flex h-14 items-center px-5 pt-4 pb-3">
                <button
                  type="button"
                  aria-label="Close account menu"
                  onClick={() => setAccountOpen(false)}
                  className="grid size-6 place-items-center rounded-full text-[#5f6368] transition hover:bg-[#f1f3f4] active:bg-[#e8eaed]"
                >
                  <SymbolIcon name="close" />
                </button>
                <GoogleWordmark />
              </div>

              <div className="px-5">
                <div className="flex items-start">
                  <div className="relative shrink-0">
                    <AccountAvatar name={profile.name} src={profile.picture} size="size-12" textSize="text-base" color="#8d6e63" />
                    <span className="absolute -bottom-0.5 -left-0.5 grid size-5 place-items-center rounded-full bg-white text-[#5f6368] shadow-[0_0_0_1px_#dadce0]">
                      <SymbolIcon name="photo_camera" className="text-[16px]" />
                    </span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="truncate font-['Google_Sans',Roboto,sans-serif] text-base font-semibold leading-5 text-[#202124]">{profile.name}</p>
                    <p className="mt-0.5 truncate text-sm font-normal leading-5 text-[#5f6368]">{profile.email}</p>
                  </div>
                  <span className="ml-3 mt-0.5 shrink-0 text-sm font-medium leading-5 text-[#5f6368]">99+</span>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="mt-4 mb-4 h-10 rounded-full border border-[#dadce0] bg-white px-5 font-['Google_Sans',Roboto,sans-serif] text-sm font-medium leading-6 text-[#3c4043] transition hover:bg-[#f8fafd] active:bg-[#f1f3f4]"
                  >
                    Manage your Google Account
                  </button>
                </div>
              </div>

              <div className="h-px bg-[#e8eaed]" />

              <div className="flex h-12 items-center px-5 text-[#3c4043]">
                <SymbolIcon name="cloud" className="text-[18px] text-[#5f6368]" />
                <span className="ml-3 truncate text-sm font-normal leading-5">Storage used: 79% of 15 GB</span>
              </div>

              <div className="h-px bg-[#e8eaed]" />

              <div>
                {secondaryAccounts.map((account) => (
                  <div key={account.email} className="flex h-16 items-center px-5 transition hover:bg-[#f1f3f4] active:bg-[#e8eaed]">
                    <AccountAvatar name={account.name} color={account.color} size="size-10" textSize="text-sm" />
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="truncate font-['Google_Sans',Roboto,sans-serif] text-sm font-medium leading-5 text-[#202124]">{account.name}</p>
                      <p className="truncate text-xs font-normal leading-4 text-[#5f6368]">{account.email}</p>
                    </div>
                    <span className="ml-3 shrink-0 text-sm font-normal leading-5 text-[#5f6368]">{account.unread}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[#e8eaed]" />

              <button type="button" className="flex h-12 w-full items-center px-5 text-left transition hover:bg-[#f1f3f4] active:bg-[#e8eaed]">
                <SymbolIcon name="person_add" className="text-[18px]" />
                <span className="ml-3 font-['Google_Sans',Roboto,sans-serif] text-sm font-normal leading-5 text-[#202124]">Add another account</span>
              </button>
              <button type="button" className="flex h-12 w-full items-center px-5 text-left transition hover:bg-[#f1f3f4] active:bg-[#e8eaed]">
                <SymbolIcon name="manage_accounts" className="text-[18px]" />
                <span className="ml-3 font-['Google_Sans',Roboto,sans-serif] text-sm font-normal leading-5 text-[#202124]">Manage accounts on this device</span>
              </button>

              <div className="h-px bg-[#e8eaed]" />

              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false)
                  onLogout()
                }}
                className="flex h-12 w-full items-center px-5 text-left transition hover:bg-[#f1f3f4] active:bg-[#e8eaed]"
              >
                <SymbolIcon name="logout" className="text-[18px]" />
                <span className="ml-3 font-['Google_Sans',Roboto,sans-serif] text-sm font-normal leading-5 text-[#202124]">Sign out</span>
              </button>

              <div className="h-px bg-[#e8eaed]" />

              <div className="flex items-center justify-center pb-4 pt-3 text-xs font-normal leading-4 text-[#5f6368]">
                <span>Privacy Policy</span>
                <span className="px-2">•</span>
                <span>Terms of service</span>
              </div>
                </div>
            </>,
            document.body,
          )}
        </div>
      </div>
    </header>
  )
}
