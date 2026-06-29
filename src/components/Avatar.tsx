interface AvatarProps {
  name: string
  src?: string
  className?: string
}

const colors = [
  'bg-[#d3e3fd] text-[#0842a0]',
  'bg-[#f9dedc] text-[#b3261e]',
  'bg-[#c2e7ff] text-[#00639b]',
  'bg-[#c4eed0] text-[#146c2e]',
  'bg-[#ffe1a6] text-[#7c4a00]',
]

export function Avatar({ name, src, className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const color = colors[name.length % colors.length]

  return (
    <div className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-medium leading-none ${color} ${className}`}>
      {src ? (
        <img src={src} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initials || '?'
      )}
    </div>
  )
}
