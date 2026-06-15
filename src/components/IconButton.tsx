import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({ label, children, className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-11 shrink-0 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
