interface MaterialSwitchProps {
  checked: boolean
  label: string
  description?: string
  onChange: (checked: boolean) => void
}

export function MaterialSwitch({ checked, label, description, onChange }: MaterialSwitchProps) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center gap-4 px-5 py-2 transition hover:bg-[#f8fafd] dark:hover:bg-white/[0.06]">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#202124] dark:text-[#e8eaed]">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-5 text-[#5f6368] dark:text-[#bdc1c6]">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
        aria-label={label}
      />
      <span className="relative h-8 w-13 rounded-full bg-[#c4c7c5] transition peer-checked:bg-[#a8c7fa] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0b57d0] dark:bg-[#5f6368] dark:peer-checked:bg-[#0842a0]">
        <span
          className={`absolute left-1 top-1 grid size-6 place-items-center rounded-full bg-white shadow-[0_1px_3px_rgba(60,64,67,0.35)] transition dark:bg-[#e8eaed] ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  )
}
