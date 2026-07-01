import { Link, useLocation } from 'react-router-dom'

function SymbolIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-rounded text-2xl leading-none ${className}`}>
      {name}
    </span>
  )
}

export function BottomNavigation() {
  const location = useLocation()
  const mailActive = location.pathname !== '/settings' && location.pathname !== '/compose' && !location.pathname.startsWith('/email/')

  function openMeet() {
    window.open('https://meet.google.com/landing', '_blank', 'noopener,noreferrer')
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#e8eaed] bg-white pb-[env(safe-area-inset-bottom)] text-[#5f6368]" aria-label="Primary navigation">
      <div className="mx-auto grid h-20 max-w-2xl grid-cols-2">
        <Link
          to="/inbox"
          className="flex min-w-0 flex-col items-center justify-center pt-2 pb-3 font-['Google_Sans',Roboto,sans-serif] text-xs font-medium leading-4"
        >
          <span className={`relative grid h-8 w-16 place-items-center rounded-[20px] transition-colors ${mailActive ? 'bg-[#d3e3fd] text-[#174ea6]' : 'text-[#5f6368]'}`}>
            <SymbolIcon name="mail" /> 
            <span className="absolute right-[13px] top-[-4px] flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-[#c5221f] px-1 text-[11px] font-medium leading-none text-white shadow-[0_0_0_1px_white]">
              99+
            </span>
          </span>
         
        </Link>

        <button
          type="button"
          onClick={openMeet}
          className="flex min-w-0 flex-col items-center justify-center pt-2 pb-3 font-['Google_Sans',Roboto,sans-serif] text-xs font-medium leading-4 text-[#5f6368]"
          aria-label="Meet"
        >
          <span className="grid h-8 w-16 place-items-center rounded-[20px]">
            <SymbolIcon name="videocam" />
          </span>
          
        </button>
      </div>
    </nav>
  )
}
