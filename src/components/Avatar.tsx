interface AvatarProps {
  name: string
  className?: string
}

const colors = ['bg-[#c7dbff] text-[#0b57d0]', 'bg-[#fad2cf] text-[#b3261e]', 'bg-[#c2e7ff] text-[#00639b]', 'bg-[#c4eed0] text-[#146c2e]', 'bg-[#ffe1a6] text-[#7c4a00]']

export function Avatar({ name, className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const color = colors[name.length % colors.length]

  return (
    <div className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-medium ${color} ${className}`}>
      {initials}
    </div>
  )
}
