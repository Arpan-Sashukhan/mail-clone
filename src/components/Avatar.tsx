interface AvatarProps {
  name: string
  src?: string
  className?: string
}

const colors = [
  'bg-[#a8d672] text-[#1f4d16]',
  'bg-[#8ab4f8] text-[#0b3d91]',
  'bg-[#f28b82] text-[#7f1d1d]',
  'bg-[#fdd663] text-[#5c4100]',
  'bg-[#c58af9] text-[#4c148c]',
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
