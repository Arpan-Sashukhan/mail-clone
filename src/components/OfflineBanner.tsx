import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    function handleOnline() {
      setOnline(true)
    }

    function handleOffline() {
      setOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
      <div
      role="status"
      aria-live="polite"
      className={`sticky top-0 z-40 flex h-10 items-center gap-2 bg-[#303134] px-4 text-[13px] text-white transition-all duration-300 ${
        online
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <WifiOff size={16} className="shrink-0" />
      <span className="flex-1">
        No Internet connection. Sync will resume automatically.
      </span>
    </div>
  )
}
