import { Link, useLocation } from 'react-router-dom'
import { Inbox, MessageSquare, Video, Bookmark } from 'lucide-react'

export function BottomNavigation() {
  const location = useLocation()
  const mailActive = location.pathname !== '/settings' && location.pathname !== '/compose' && !location.pathname.startsWith('/email/')

  function openMeet() {
    window.open('https://meet.google.com/landing', '_blank', 'noopener,noreferrer')
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 gmail-bottom-nav pb-[env(safe-area-inset-bottom)] text-[#5f6368]" aria-label="Primary navigation">
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-5 items-center">
        <Link
          to="/inbox"
          className={`nav-item flex flex-col items-center justify-center pt-2 pb-3 font-['Google_Sans',Roboto,sans-serif] text-[11px] font-medium leading-4 transition-colors ${mailActive ? 'selected' : ''}`}
          aria-label="Inbox"
        >
          <Inbox size={22} strokeWidth={1.8} className={`nav-icon ${mailActive ? 'fill-[#1A73E8]' : ''}`} />
          <span className="mt-1">Inbox</span>
        </Link>

        <button
          type="button"
          className="nav-item flex flex-col items-center justify-center pt-2 pb-3 font-['Google_Sans',Roboto,sans-serif] text-[11px] font-medium leading-4 text-[#5f6368]"
          aria-label="Chat"
        >
          <MessageSquare size={22} strokeWidth={1.8} className="nav-icon" />
          <span className="mt-1">Chat</span>
        </button>

        <button
          type="button"
          onClick={openMeet}
          className="nav-item flex flex-col items-center justify-center pt-2 pb-3 font-['Google_Sans',Roboto,sans-serif] text-[11px] font-medium leading-4 text-[#5f6368]"
          aria-label="Meet"
        >
          <Video size={22} strokeWidth={1.8} className="nav-icon" />
          <span className="mt-1">Meet</span>
        </button>

        <Link
          to="/inbox"
          className="nav-item flex flex-col items-center justify-center pt-2 pb-3 font-['Google_Sans',Roboto,sans-serif] text-[11px] font-medium leading-4 text-[#5f6368]"
          aria-label="Primary"
        >
          <Inbox size={22} strokeWidth={1.8} className="nav-icon" />
          <span className="mt-1">Primary</span>
        </Link>

        <button
          type="button"
          className="nav-item flex flex-col items-center justify-center pt-2 pb-3 font-['Google_Sans',Roboto,sans-serif] text-[11px] font-medium leading-4 text-[#5f6368]"
          aria-label="Labels"
        >
          <Bookmark size={22} strokeWidth={1.8} className="nav-icon" />
          <span className="mt-1">Labels</span>
        </button>
      </div>
    </nav>
  )
}
