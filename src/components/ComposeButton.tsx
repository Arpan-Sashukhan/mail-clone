import { Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ComposeButton() {
  return (
    <Link
      to="/compose"
      aria-label="Compose"
      className="fixed bottom-[max(88px,calc(env(safe-area-inset-bottom)+88px))] right-4 z-20 flex h-14 items-center gap-3 rounded-2xl bg-[#c2e7ff] px-6 text-[16px] font-medium tracking-normal text-[#001d35] shadow-[0_2px_4px_rgba(60,64,67,0.18),0_1px_3px_rgba(60,64,67,0.16)] transition duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[#b5ddf6] hover:shadow-[0_3px_6px_rgba(60,64,67,0.2)] active:scale-95 dark:bg-[#a8c7fa] dark:text-[#062e6f] dark:shadow-black/30"
    >
      <Pencil size={20} />
      <span>Compose</span>
    </Link>
  )
}
