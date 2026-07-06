import { Tag, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Email } from '../types/email'

interface CategoryCardProps {
  category: 'social' | 'promotions'
  emails: Email[]
}

const CATEGORY_META = {
  social: {
    label: 'Social',
    icon: Users,
    iconBg: '#D2E3FC',
    iconColor: '#1A73E8',
    badgeBg: '#12B5CB',
    to: '/social',
  },
  promotions: {
    label: 'Promotions',
    icon: Tag,
    iconBg: '#CEEAD6',
    iconColor: '#188038',
    badgeBg: '#34A853',
    to: '/promotions',
  },
} as const

export function CategoryCard({ category, emails }: CategoryCardProps) {
  const meta = CATEGORY_META[category]
  const Icon = meta.icon
  const unreadCount = emails.filter((email) => !email.read).length
  const count = unreadCount || emails.length

  const senderPreview = emails
    .slice(0, 3)
    .map((email) => email.sender)
    .join(', ')

  return (
    <Link
      to={meta.to}
      aria-label={`${meta.label}, ${count} new`}
      className="gmail-mail-item grid grid-cols-[var(--mail-avatar)_minmax(0,1fr)] items-start gap-3 bg-white text-left transition duration-150 hover:bg-[#F8FAFD] active:bg-[#EDF2FA]"
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: meta.iconBg, color: meta.iconColor }}
      >
        <Icon size={20} strokeWidth={2} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate font-['Roboto',Arial,sans-serif] text-[16px] font-medium leading-[1.3] text-[#202124]">{meta.label}</p>
          {count > 0 ? (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 text-white"
              style={{ backgroundColor: meta.badgeBg }}
            >
              {count} new
            </span>
          ) : null}
        </div>
        <p className="line-clamp-1 mt-1 overflow-hidden font-['Roboto',Arial,sans-serif] text-[14px] leading-[1.2] tracking-normal text-[#5f6368]">
          {senderPreview}
        </p>
      </div>
    </Link>
  )
}
