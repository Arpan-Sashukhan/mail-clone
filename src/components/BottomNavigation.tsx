import { Mail, Video } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function BottomNavigation() {
  const location = useLocation()
  const mailActive = location.pathname !== '/settings' && location.pathname !== '/compose' && !location.pathname.startsWith('/email/')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#e8eaed] bg-white/98 pb-[env(safe-area-inset-bottom)] text-[#444746] backdrop-blur dark:border-[#3c4043] dark:bg-[#202124]/98 dark:text-[#c4c7c5]" aria-label="Primary navigation">
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-2">
        <Link
          to="/inbox"
          className="flex min-w-0 flex-col items-center justify-center gap-1 text-xs font-medium"
        >
          <span className={`grid h-8 w-16 place-items-center rounded-full transition-colors ${mailActive ? 'bg-[#d3e3fd] text-[#041e49] dark:bg-[#0842a0] dark:text-[#d3e3fd]' : ''}`}>
            <Mail size={24} strokeWidth={1.9} />
          </span>
          <span className={mailActive ? 'font-bold text-[#202124] dark:text-[#e3e3e3]' : ''}>Mail</span>
        </Link>

        <button type="button" className="flex min-w-0 flex-col items-center justify-center gap-1 text-xs font-medium" aria-label="Meet">
          <span className="grid h-8 w-16 place-items-center rounded-full">
            <Video size={24} strokeWidth={1.9} />
          </span>
          <span>Meet</span>
        </button>
      </div>
    </nav>
  )
}
