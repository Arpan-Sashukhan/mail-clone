interface AvatarProps {
  name: string
  src?: string
  className?: string
  color?: string
}

const colors = ['#7baaf7', '#f6a95d', '#8d6e63', '#57bb8a', '#e06666', '#ba68c8']

function hashSeed(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function Avatar({ name, src, className = '', color }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase()
  const background = color ?? colors[hashSeed(name) % colors.length]

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full text-[20px] font-medium leading-none text-white ${className}`}
      style={{ width: 'var(--mail-avatar)', height: 'var(--mail-avatar)', backgroundColor: background }}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initial || '?'
      )}
    </div>
  )
}
