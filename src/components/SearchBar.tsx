import { Menu, Search } from 'lucide-react'
import { Avatar } from './Avatar'
import { IconButton } from './IconButton'

interface SearchBarProps {
  onOpenDrawer: () => void
}

export function SearchBar({ onOpenDrawer }: SearchBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 px-3 pb-2 pt-3 backdrop-blur dark:bg-[#111315]/95">
      <div className="flex h-14 items-center gap-1 rounded-full bg-[#eef3f8] px-1 shadow-[0_1px_2px_rgba(60,64,67,0.18)] dark:bg-[#202124]">
        <IconButton label="Open navigation" onClick={onOpenDrawer}>
          <Menu size={23} />
        </IconButton>
        <Search size={20} className="shrink-0 text-slate-500 dark:text-slate-300" aria-hidden="true" />
        <input
          aria-label="Search mail"
          placeholder="Search in mail"
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-base text-slate-800 outline-none placeholder:text-slate-600 dark:text-slate-100 dark:placeholder:text-slate-300"
        />
        <Avatar name="Kashyap" className="mr-2 size-9 text-xs" />
      </div>
    </header>
  )
}
