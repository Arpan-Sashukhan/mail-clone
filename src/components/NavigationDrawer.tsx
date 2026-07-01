import { NavLink } from 'react-router-dom'
import type { GoogleProfile } from '../services/googleProfile'

interface NavigationDrawerProps {
  open: boolean
  darkMode: boolean
  profile: GoogleProfile
  onClose: () => void
  onLogout: () => void
  onToggleTheme: () => void
}

type DrawerItem = {
  label: string
  icon: string
  count?: string
}

type CategoryItem = DrawerItem & {
  to: string
  badge: string
  badgeClassName: string
}

const categories: CategoryItem[] = [
  {
    to: '/inbox',
    label: 'Primary',
    icon: 'inbox',
    badge: '8 new',
    badgeClassName: 'bg-[#dadce0] text-[#202124]',
  },
  {
    to: '/promotions',
    label: 'Promotions',
    icon: 'sell',
    badge: '2 new',
    badgeClassName: 'bg-[#81c995] text-[#202124]',
  },
  {
    to: '/social',
    label: 'Social',
    icon: 'groups',
    badge: '4 new',
    badgeClassName: 'bg-[#8ab4f8] text-[#202124]',
  },
]

const recentItems: DrawerItem[] = [
  { label: 'Unwanted', icon: 'report', count: '1' },
  { label: 'Starred', icon: 'star', count: '3' },
  { label: 'Snoozed', icon: 'schedule' },
  { label: 'Important', icon: 'label_important', count: '5' },
]

const allLabelItems: DrawerItem[] = [
  { label: 'Sent', icon: 'send', count: '12' },
  { label: 'Scheduled', icon: 'schedule_send' },
  { label: 'Outbox', icon: 'outbox' },
]

function SymbolIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-rounded text-2xl leading-none ${className}`}>
      {name}
    </span>
  )
}

function Badge({ children, className = 'bg-transparent text-[#202124]' }: { children?: string; className?: string }) {
  if (!children) {
    return null
  }

  return (
    <span className={`ml-auto flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-base font-medium leading-none ${className}`}>
      {children}
    </span>
  )
}

function StaticRow({ item }: { item: DrawerItem }) {
  return (
    <div className="mx-3 flex h-14 items-center rounded-full px-3 text-[#202124]">
      <SymbolIcon name={item.icon} />
      <span className="ml-6 min-w-0 flex-1 truncate font-['Google_Sans',Roboto,sans-serif] text-lg font-normal leading-6">
        {item.label}
      </span>
      <Badge>{item.count}</Badge>
    </div>
  )
}

function SectionHeader({ children }: { children: string }) {
  return (
    <div className="mt-6 mb-3 px-6 font-['Google_Sans',Roboto,sans-serif] text-base font-medium uppercase leading-5 tracking-[2px] text-[#5f6368]">
      {children}
    </div>
  )
}

export function NavigationDrawer({
  open,
  onClose,
}: NavigationDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-30 bg-black/45 transition-opacity duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)] ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[86vw] max-w-[320px] transform flex-col overflow-hidden rounded-br-[28px] rounded-tr-[28px] bg-white shadow-[4px_0_18px_rgba(60,64,67,0.18)] transition-transform duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <header className="flex h-[88px] shrink-0 items-end border-b border-[#e0e0e0] px-6 pb-4 pt-[env(safe-area-inset-top)]">
          <div className="font-['Google_Sans',Roboto,sans-serif] text-2xl font-normal leading-8 text-[#ea4335]">
            Gmail
          </div>
        </header>

        <nav className="min-h-0 flex-1 overflow-y-auto py-2">
          <div className="mx-3 flex h-14 items-center rounded-full px-3 text-[#202124]">
            <SymbolIcon name="inbox" />
            <span className="ml-6 min-w-0 flex-1 truncate font-['Google_Sans',Roboto,sans-serif] text-lg font-normal leading-6">
              All Inboxes
            </span>
          </div>

          <div className="mx-6 my-2 h-px bg-[#e0e0e0]" />

          {categories.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `mx-3 flex h-14 items-center rounded-full px-3 transition-colors duration-150 ${
                  isActive ? 'bg-[#d3e3fd] text-[#174ea6]' : 'text-[#202124] hover:bg-[#f1f3f4] active:bg-[#e8eaed]'
                }`
              }
            >
              <SymbolIcon name={item.icon} />
              <span className="ml-6 min-w-0 flex-1 truncate font-['Google_Sans',Roboto,sans-serif] text-lg font-normal leading-6">
                {item.label}
              </span>
              <Badge className={item.label === 'Primary' ? 'bg-[#dadce0] text-[#202124]' : item.badgeClassName}>
                {item.badge}
              </Badge>
            </NavLink>
          ))}

          <SectionHeader>Recent labels</SectionHeader>
          {recentItems.map((item) => (
            <StaticRow key={item.label} item={item} />
          ))}

          <SectionHeader>All labels</SectionHeader>
          {allLabelItems.map((item) => (
            <StaticRow key={item.label} item={item} />
          ))}
        </nav>
      </aside>
    </>
  )
}
