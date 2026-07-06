import { Link } from 'react-router-dom'
import { UnreadBadge } from './UnreadBadge'

interface BottomNavigationItemProps {
  icon: string
  label: string
  active?: boolean
  badgeCount?: number
  onClick?: () => void
  to?: string
}

function BottomNavigationItem({ icon, label, active = false, badgeCount, onClick, to }: BottomNavigationItemProps) {
  const content = (
    <>
      <span className="relative grid place-items-center">
        <span
          aria-hidden="true"
          className={`material-symbols-rounded nav-icon text-2xl leading-none ${active ? 'material-symbols-filled' : ''}`}
        >
          {icon}
        </span>
        {typeof badgeCount === 'number' ? <UnreadBadge count={badgeCount} /> : null}
      </span>
      <span className="mt-1">{label}</span>
    </>
  )

  const className = `nav-item flex flex-col items-center justify-center gap-0 pt-2 pb-2 font-['Google_Sans',Roboto,sans-serif] font-medium leading-4 transition-colors ${
    active ? 'selected text-[#1A73E8]' : 'text-[#5F6368]'
  }`

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} aria-current={active ? 'page' : undefined}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {content}
    </button>
  )
}

interface EmailDetailBottomNavProps {
  unreadCount?: number
}

/**
 * Persistent Gmail Android style bottom navigation shown on the email
 * detail screen. Unlike the 5-tab inbox navigation, Gmail collapses this
 * down to just "Mail" (with an unread badge) and "Meet" while reading a
 * message.
 */
export function EmailDetailBottomNav({ unreadCount = 99 }: EmailDetailBottomNavProps) {
  function openMeet() {
    window.open('https://meet.google.com/landing', '_blank', 'noopener,noreferrer')
  }

  return (
    <nav
      className="gmail-email-detail-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary navigation"
    >
      <BottomNavigationItem icon="mail" label="Mail" active to="/inbox" badgeCount={unreadCount} />
      <BottomNavigationItem icon="videocam" label="Meet" onClick={openMeet} />
    </nav>
  )
}
