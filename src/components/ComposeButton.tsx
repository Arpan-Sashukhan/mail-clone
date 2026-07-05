import { SquarePen } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ComposeButtonProps {
  compact?: boolean
}

export function ComposeButton({ compact = false }: ComposeButtonProps) {
  return (
    <Link
      to="/compose"
      aria-label="Compose"
      className={`gmail-compose`}
    >
      <SquarePen size={18} />
      {!compact ? <span>Compose</span> : null}
    </Link>
  )
}
