import { Archive, Edit3, Inbox, Mail, Moon, Send, Settings, Star, Sun, Trash2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { MailXLogo } from './MailXLogo'

interface NavigationDrawerProps {
  open: boolean
  darkMode: boolean
  onClose: () => void
  onToggleTheme: () => void
}

const navItems = [
  { to: '/inbox', label: 'Inbox', icon: Inbox, count: 8 },
  { to: '/starred', label: 'Starred', icon: Star },
  { to: '/sent', label: 'Sent', icon: Send },
  { to: '/drafts', label: 'Drafts', icon: Edit3, count: 2 },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/custom', label: 'Custom Mail', icon: Archive },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function NavigationDrawer({ open, darkMode, onClose, onToggleTheme }: NavigationDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-30 bg-black/35 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[82vw] max-w-[320px] transform bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#111315] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <MailXLogo />
        <nav className="px-3">
          {navItems.map(({ to, label, icon: Icon, count }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 flex h-12 items-center gap-5 rounded-r-full px-4 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#fce8e6] text-[#c5221f] dark:bg-[#3c1d1b] dark:text-[#f2b8b5]'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#202124]'
                }`
              }
            >
              <Icon size={21} />
              <span className="flex-1">{label}</span>
              {count ? <span className="text-xs">{count}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="mx-4 my-4 h-px bg-slate-200 dark:bg-slate-800" />
        <button
          type="button"
          onClick={onToggleTheme}
          className="mx-3 flex h-12 w-[calc(100%-24px)] items-center gap-5 rounded-r-full px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#202124]"
        >
          {darkMode ? <Sun size={21} /> : <Moon size={21} />}
          <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-[#f8fafd] p-4 dark:bg-[#202124]">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-[#0b57d0] dark:text-[#8ab4f8]" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">kashyap@mailx.local</p>
          </div>
        </div>
      </aside>
    </>
  )
}
