interface UnreadBadgeProps {
  count?: number
  max?: number
  className?: string
}

/**
 * Small rounded-pill badge used to show an unread count, matching the
 * Gmail Android bottom navigation badge (e.g. "99+"). Defaults to 99 so
 * every screen shows the same badge unless a page explicitly overrides it
 * with a real count.
 */
export function UnreadBadge({ count = 99, max = 99, className = '' }: UnreadBadgeProps) {
  if (count <= 0) {
    return null
  }

  const label = count > max ? `${max}+` : String(count)

  return (
    <span
      aria-hidden="true"
      className={`gmail-unread-badge absolute -right-2 -top-1.5 flex items-center justify-center rounded-full ${className}`}
    >
      {label}
    </span>
  )
}
