import { useLocation } from 'react-router-dom'
import {
  Inbox,
  Tag,
  Users,
  Star,
  Clock3,
  BadgeAlert,
  Send,
  CalendarClock,
  SendHorizontal,
  FileText,
  Mail,
  CircleAlert,
  Trash2,
  Calendar,
  ContactRound,
  Settings,
  CircleHelp,
  type LucideIcon,
} from 'lucide-react'
import type { GoogleProfile } from '../services/googleProfile'

interface NavigationDrawerProps {
  open: boolean
  darkMode: boolean
  profile: GoogleProfile
  onClose: () => void
  onLogout: () => void
  onToggleTheme: () => void
}

interface DrawerItemConfig {
  label: string
  icon: LucideIcon
  to?: string
  count?: string
  badge?: string
}

// Badge colors - Gmail Material You
const BADGE_COLORS = {
  primary: { bg: '#DADCE0', text: '#202124' },
  promotions: { bg: '#81C995', text: '#202124' },
  social: { bg: '#8AB4F8', text: '#202124' },
}

const CATEGORIES: DrawerItemConfig[] = [
  { label: 'Primary', icon: Inbox, to: '/inbox', badge: '1 new' },
  { label: 'Promotions', icon: Tag, to: '/promotions', badge: '63 new' },
  { label: 'Social', icon: Users, to: '/social', badge: '10 new' },
]

const ALL_LABELS: DrawerItemConfig[] = [
  { label: 'Starred', icon: Star, count: '19' },
  { label: 'Snoozed', icon: Clock3 },
  { label: 'Important', icon: BadgeAlert, count: '99+' },
  { label: 'Sent', icon: Send, count: '3' },
  { label: 'Scheduled', icon: CalendarClock },
  { label: 'Outbox', icon: SendHorizontal },
  { label: 'Drafts', icon: FileText, count: '9' },
  { label: 'All Mail', icon: Mail, count: '99+' },
  { label: 'Spam', icon: CircleAlert, count: '25' },
  { label: 'Bin', icon: Trash2 },
]

const GOOGLE_APPS: DrawerItemConfig[] = [
  { label: 'Calendar', icon: Calendar },
  { label: 'Contacts', icon: ContactRound },
]

// ============================================
// Reusable Components
// ============================================

interface DrawerDividerProps {
  className?: string
}

function DrawerDivider({ className = '' }: DrawerDividerProps) {
  return <div className={`h-px bg-[#DADCE0] my-2 ${className}`} />
}

interface DrawerBadgeProps {
  children: string
  variant: 'primary' | 'promotions' | 'social'
}

function DrawerBadge({ children, variant }: DrawerBadgeProps) {
  const color = BADGE_COLORS[variant]
  return (
    <span
      className="h-5 shrink-0 rounded-full px-2 text-[12px] font-500 leading-5 whitespace-nowrap"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {children}
    </span>
  )
}

interface DrawerCounterProps {
  value: string
}

function DrawerCounter({ value }: DrawerCounterProps) {
  return (
    <span className="ml-auto w-9 text-right text-[13px] font-500 text-[#202124] shrink-0">
      {value}
    </span>
  )
}

interface DrawerItemProps {
  item: DrawerItemConfig
  isSelected: boolean
  onClick?: () => void
}

function DrawerItem({ item, isSelected, onClick }: DrawerItemProps) {
  const Icon = item.icon

  const badgeVariant =
    item.label === 'Primary' ? 'primary' : item.label === 'Promotions' ? 'promotions' : item.label === 'Social' ? 'social' : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex h-12 w-full items-center px-4 gap-4 text-[14px] transition-colors duration-150
        rounded-r-[24px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B57D0]
        ${
          isSelected
            ? 'bg-[#D3E3FD] text-[#202124] font-500'
            : 'text-[#202124] font-400 hover:bg-[#F1F3F4] active:bg-[#E8EAED]'
        }
      `}
      aria-current={isSelected ? 'page' : undefined}
      tabIndex={0}
    >
      <Icon size={20} strokeWidth={1.8} className="shrink-0" color={isSelected ? '#202124' : '#444746'} />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && badgeVariant && <DrawerBadge variant={badgeVariant}>{item.badge}</DrawerBadge>}
      {item.count && <DrawerCounter value={item.count} />}
    </button>
  )
}

interface DrawerSectionProps {
  title?: string
  items: DrawerItemConfig[]
  currentPath: string
  onItemClick: () => void
}

function DrawerSection({ title, items, currentPath, onItemClick }: DrawerSectionProps) {
  const getItemPath = (item: DrawerItemConfig): string => {
    if (item.to) return item.to
    const mailboxMap: Record<string, string> = {
      'All Mail': '/all',
      'Starred': '/starred',
      'Snoozed': '/snoozed',
      'Important': '/important',
      'Sent': '/sent',
      'Scheduled': '/scheduled',
      'Outbox': '/outbox',
      'Drafts': '/drafts',
      'Spam': '/spam',
      'Bin': '/trash',
      'Calendar': '/calendar',
      'Contacts': '/contacts',
    }
    return mailboxMap[item.label] || '/'
  }

  return (
    <div>
      {title && (
        <div className="px-5 py-3 text-[12px] font-500 uppercase tracking-wider text-[#5F6368]">
          {title}
        </div>
      )}
      <div className="px-2 space-y-1">
        {items.map((item) => {
          const itemPath = getItemPath(item)
          const isSelected = currentPath === itemPath || currentPath.startsWith(itemPath)
          return (
            <DrawerItem
              key={item.label}
              item={item}
              isSelected={isSelected}
              onClick={onItemClick}
            />
          )
        })}
      </div>
    </div>
  )
}

interface DrawerHeaderProps {
  title: string
}

function DrawerHeader({ title }: DrawerHeaderProps) {
  return (
    <header className="h-14 flex items-center px-5 pt-[env(safe-area-inset-top)] shrink-0">
      <div className="text-[22px] font-500 text-[#D93025]">{title}</div>
    </header>
  )
}

// ============================================
// Main Component
// ============================================

export function NavigationDrawer({ open, onClose }: NavigationDrawerProps) {
  const location = useLocation()

  const handleItemClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-30 bg-black transition-opacity duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)] ${
          open ? 'pointer-events-auto opacity-[0.38]' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-[85vw] transform flex-col bg-white shadow-[0_8px_24px_rgba(60,64,67,0.30)] transition-transform duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Gmail navigation"
      >
        {/* Header */}
        <DrawerHeader title="Gmail" />

        {/* Scrollable Content */}
        <nav className="min-h-0 flex-1 overflow-y-auto">
          {/* All Inboxes */}
          <div className="px-4 py-1">
            <button
              type="button"
              onClick={handleItemClick}
              className="flex h-12 w-full items-center gap-4 rounded-r-[24px] px-2 text-[14px] font-400 text-[#202124] transition-colors hover:bg-[#F1F3F4] active:bg-[#E8EAED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B57D0]"
              tabIndex={0}
            >
              <Inbox size={20} strokeWidth={1.8} color="#444746" className="shrink-0" />
              <span>All Inboxes</span>
            </button>
          </div>

          <DrawerDivider className="mx-5" />

          {/* Categories */}
          <DrawerSection
            items={CATEGORIES}
            currentPath={location.pathname}
            onItemClick={handleItemClick}
          />

          <DrawerDivider className="mx-5" />

          {/* All Labels */}
          <DrawerSection
            title="ALL LABELS"
            items={ALL_LABELS}
            currentPath={location.pathname}
            onItemClick={handleItemClick}
          />

          <DrawerDivider className="mx-5" />

          {/* Google Apps */}
          <DrawerSection
            title="GOOGLE APPS"
            items={GOOGLE_APPS}
            currentPath={location.pathname}
            onItemClick={handleItemClick}
          />

          <DrawerDivider className="mx-5" />

          {/* Settings & Help */}
          <div className="px-2 py-1 space-y-1">
            <button
              type="button"
              onClick={handleItemClick}
              className="flex h-12 w-full items-center gap-4 rounded-r-[24px] px-2 text-[14px] font-400 text-[#202124] transition-colors hover:bg-[#F1F3F4] active:bg-[#E8EAED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B57D0]"
              tabIndex={0}
            >
              <Settings size={20} strokeWidth={1.8} color="#444746" className="shrink-0" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={handleItemClick}
              className="flex h-12 w-full items-center gap-4 rounded-r-[24px] px-2 text-[14px] font-400 text-[#202124] transition-colors hover:bg-[#F1F3F4] active:bg-[#E8EAED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B57D0]"
              tabIndex={0}
            >
              <CircleHelp size={20} strokeWidth={1.8} color="#444746" className="shrink-0" />
              <span>Help and feedback</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}