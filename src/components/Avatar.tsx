interface AvatarProps {
  name: string
  src?: string
  className?: string
}

const colors = [
  'bg-[#a8d672]',
  'bg-[#8ab4f8]',
  'bg-[#f28b82]',
  'bg-[#fdd663]',
  'bg-[#c58af9]',
]

export function Avatar({ name, src, className = '' }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase()
  const color = colors[name.length % colors.length]

  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full text-[20px] font-medium leading-none text-white ${color} ${className}`} style={{width: "var(--mail-avatar)", height: "var(--mail-avatar)",}}>
      {src ? (
        <img src={src} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initial || '?'
      )}
    </div>
  )
}
