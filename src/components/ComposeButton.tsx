import { Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ComposeButton() {
  return (
    <Link
      to="/compose"
      aria-label="Compose"
      className="fixed bottom-6 right-5 z-20 flex h-14 items-center gap-3 rounded-2xl bg-[#c2e7ff] px-5 text-[15px] font-semibold text-[#001d35] shadow-lg shadow-slate-300/70 transition hover:bg-[#b5ddf6] active:scale-95 dark:bg-[#a8c7fa] dark:shadow-black/40"
    >
      <Pencil size={20} />
      <span>Compose</span>
    </Link>
  )
}
