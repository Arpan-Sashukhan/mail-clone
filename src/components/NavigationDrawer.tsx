import {
  AlertOctagon,
  Archive,
  Clock3,
  Edit3,
  HelpCircle,
  Inbox,
  Info,
  Mail,
  Moon,
  Plus,
  Send,
  Settings,
  ShieldAlert,
  Star,
  Sun,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Avatar } from './Avatar'
import { MailXLogo } from './MailXLogo'
import type { GoogleProfile } from '../services/googleProfile'

interface NavigationDrawerProps {
  open: boolean
  darkMode: boolean
  profile: GoogleProfile
  onClose: () => void
  onLogout: () => void
  onToggleTheme: () => void
}

const navItems = [
  { label: 'All Inboxes', icon: Mail, count: 8 },
  { to: '/inbox', label: 'Inbox', icon: Inbox, count: 8 },
  { to: '/starred', label: 'Starred', icon: Star },
  { label: 'Snoozed', icon: Clock3 },
  { label: 'Important', icon: Tag },
  { to: '/sent', label: 'Sent', icon: Send },
  { label: 'Scheduled', icon: Clock3 },
  { label: 'Outbox', icon: Upload },
  { to: '/drafts', label: 'Drafts', icon: Edit3, count: 2 },
  { label: 'All Mail', icon: Archive },
  { label: 'Spam', icon: ShieldAlert },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { label: 'Help & Feedback', icon: HelpCircle },
]

export function NavigationDrawer({
  open,
  darkMode,
  profile,
  onClose,
  onLogout,
  onToggleTheme,
}: NavigationDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-30 bg-black/38 transition-opacity duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[86vw] max-w-[328px] transform flex-col overflow-hidden rounded-br-[28px] rounded-tr-[28px] bg-white pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_rgba(60,64,67,0.28)] transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] dark:bg-[#303134] dark:shadow-black/60 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="shrink-0">
          <MailXLogo />
          <div className="mx-4 mb-3 rounded-[24px] bg-[#f8fafd] px-4 py-3 dark:bg-[#202124]">
            <div className="flex items-center gap-3">
              <Avatar name={profile.name} src={profile.picture} className="size-10 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#202124] dark:text-[#e3e3e3]">{profile.name}</p>
                <p className="truncate text-xs text-[#5f6368] dark:text-[#c4c7c5]">{profile.email}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-[#eaf1fb] px-3 text-xs font-medium text-[#0b57d0] transition hover:bg-[#d3e3fd] active:scale-[0.98] dark:bg-[#1d2b44] dark:text-[#a8c7fa]"
              >
                <Info size={16} />
                Active Status
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full bg-[#eaf1fb] text-[#0b57d0] transition hover:bg-[#d3e3fd] active:scale-95 dark:bg-[#1d2b44] dark:text-[#a8c7fa]"
                aria-label="Add status"
              >
                <Plus size={17} />
              </button>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto pb-3">
          {navItems.map(({ to, label, icon: Icon, count }) =>
            to ? (
              <NavLink
                key={label}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `mr-3 flex h-10 items-center gap-7 overflow-hidden rounded-r-full pl-6 pr-4 text-sm font-medium transition active:scale-[0.99] ${
                    isActive
                      ? 'bg-[#d3e3fd] text-[#0842a0] dark:bg-[#1d2b44] dark:text-[#a8c7fa]'
                      : 'text-[#3c4043] hover:bg-[#f1f3f4] active:bg-[#e8eaed] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]'
                  }`
                }
              >
                <Icon size={20} />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {count ? <span className="text-xs font-semibold">{count}</span> : null}
              </NavLink>
            ) : (
              <button
                key={label}
                type="button"
                onClick={onClose}
                className="mr-3 flex h-10 w-[calc(100%-12px)] items-center gap-7 overflow-hidden rounded-r-full pl-6 pr-4 text-left text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:scale-[0.99] active:bg-[#e8eaed] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]"
              >
                <Icon size={20} />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {count ? <span className="text-xs font-semibold">{count}</span> : null}
              </button>
            ),
          )}
        </nav>

        <div className="shrink-0 border-t border-[#e0e3e7] px-0 py-3 dark:border-[#303134]">
          <button
            type="button"
            onClick={onToggleTheme}
            className="mr-3 flex h-10 w-[calc(100%-12px)] items-center gap-7 rounded-r-full pl-6 pr-4 text-sm font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:scale-[0.99] active:bg-[#e8eaed] dark:text-[#e3e3e3] dark:hover:bg-white/[0.08]"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="mr-3 flex h-10 w-[calc(100%-12px)] items-center gap-7 rounded-r-full pl-6 pr-4 text-sm font-medium text-[#3c4043] transition hover:bg-[#fce8e6] active:scale-[0.99] dark:text-[#e3e3e3] dark:hover:bg-[#3f201d]"
          >
            <AlertOctagon size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
