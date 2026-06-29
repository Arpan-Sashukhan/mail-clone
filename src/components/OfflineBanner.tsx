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
      className={`fixed left-3 right-3 top-[max(12px,env(safe-area-inset-top))] z-50 mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-[#303134] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition duration-300 ${
        online ? 'pointer-events-none -translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <WifiOff size={18} />
      <span className="min-w-0 flex-1">No Internet. Recent mail is available offline.</span>
      <button type="button" onClick={() => window.location.reload()} className="rounded-full px-3 py-1 text-[#a8c7fa] transition hover:bg-white/10">
        Retry
      </button>
    </div>
  )
}
