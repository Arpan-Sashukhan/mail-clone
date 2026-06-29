import {
  Bell,
  ChevronRight,
  Database,
  HelpCircle,
  Info,
  MessageSquare,
  Moon,
  Palette,
  PenLine,
  RotateCw,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MaterialSwitch } from '../components/MaterialSwitch'
import { SearchBar } from '../components/SearchBar'
import { useSettings, type DefaultReplyAction, type Density, type ThemeMode } from '../contexts/SettingsContext'
import type { GoogleProfile } from '../services/googleProfile'

interface LayoutContext {
  openDrawer: () => void
  profile: GoogleProfile
  onLogout: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="px-5 pb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#5f6368] dark:text-[#bdc1c6]">{title}</h2>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.12)] dark:bg-[#303134]">{children}</div>
    </section>
  )
}

function SelectRow<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <label className="flex min-h-16 items-center gap-4 px-5 py-2 transition hover:bg-[#f8fafd] dark:hover:bg-white/[0.06]">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#202124] dark:text-[#e8eaed]">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-5 text-[#5f6368] dark:text-[#bdc1c6]">{description}</span> : null}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-full border border-[#dadce0] bg-white px-3 py-2 text-sm font-medium text-[#202124] outline-none transition focus:border-[#0b57d0] dark:border-[#5f6368] dark:bg-[#202124] dark:text-[#e8eaed]"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function LinkRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  return (
    <div className="flex min-h-14 items-center gap-4 border-b border-[#e0e3e7] px-5 last:border-b-0 dark:border-[#3c4043]">
      <Icon size={20} className="text-[#5f6368] dark:text-[#bdc1c6]" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#202124] dark:text-[#e8eaed]">{label}</span>
      {value ? <span className="truncate text-sm text-[#5f6368] dark:text-[#bdc1c6]">{value}</span> : <ChevronRight size={18} className="text-[#5f6368] dark:text-[#bdc1c6]" />}
    </div>
  )
}

export function SettingsPage() {
  const { openDrawer, profile, onLogout } = useOutletContext<LayoutContext>()
  const { settings, updateSetting } = useSettings()

  return (
    <main className="gmail-scroll mx-auto min-h-svh max-w-2xl bg-[#f8fafd] pb-12 dark:bg-[#202124]">
      <SearchBar profile={profile} onOpenDrawer={openDrawer} onLogout={onLogout} />
      <section className="px-5 pb-1 pt-4">
        <h1 className="text-[28px] font-normal leading-9 text-[#202124] dark:text-[#e8eaed]">Settings</h1>
        <p className="mt-1 text-sm text-[#5f6368] dark:text-[#bdc1c6]">MailX preferences are saved on this device.</p>
      </section>

      <div className="px-4">
        <Section title="General Settings">
          <SelectRow<ThemeMode>
            label="Theme"
            description="Match Android Gmail with light, dark, or system default."
            value={settings.theme}
            options={[
              { value: 'system', label: 'System Default' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(value) => updateSetting('theme', value)}
          />
          <SelectRow<DefaultReplyAction>
            label="Default Reply Action"
            value={settings.defaultReplyAction}
            options={[
              { value: 'reply', label: 'Reply' },
              { value: 'replyAll', label: 'Reply All' },
            ]}
            onChange={(value) => updateSetting('defaultReplyAction', value)}
          />
          <MaterialSwitch checked={settings.conversationView} label="Conversation View" description="Group messages in the same thread." onChange={(value) => updateSetting('conversationView', value)} />
        </Section>

        <Section title="Notifications">
          <MaterialSwitch checked={settings.notifications} label="Master Switch" onChange={(value) => updateSetting('notifications', value)} />
          <MaterialSwitch checked={settings.inboxNotifications} label="Inbox Notifications" onChange={(value) => updateSetting('inboxNotifications', value)} />
          <MaterialSwitch checked={settings.priorityOnly} label="Priority Only" onChange={(value) => updateSetting('priorityOnly', value)} />
          <MaterialSwitch checked={settings.sound} label="Sound" onChange={(value) => updateSetting('sound', value)} />
          <MaterialSwitch checked={settings.vibration} label="Vibration" onChange={(value) => updateSetting('vibration', value)} />
          <MaterialSwitch checked={settings.badgeCount} label="Badge Count" onChange={(value) => updateSetting('badgeCount', value)} />
          <MaterialSwitch checked={settings.backgroundSync} label="Background Sync" description="Retry queued drafts when MailX is reopened online." onChange={(value) => updateSetting('backgroundSync', value)} />
        </Section>

        <Section title="Inbox Customization">
          <MaterialSwitch checked={settings.smartReplies} label="Smart Replies" onChange={(value) => updateSetting('smartReplies', value)} />
          <MaterialSwitch checked={settings.senderImages} label="Sender Images" onChange={(value) => updateSetting('senderImages', value)} />
          <MaterialSwitch checked={settings.autoDownloadImages} label="Auto Download Images" onChange={(value) => updateSetting('autoDownloadImages', value)} />
          <SelectRow
            label="Preview Lines"
            value={String(settings.previewLines)}
            options={[
              { value: '0', label: 'None' },
              { value: '1', label: '1 line' },
              { value: '2', label: '2 lines' },
            ]}
            onChange={(value) => updateSetting('previewLines', Number(value))}
          />
          <SelectRow<Density>
            label="Density"
            value={settings.density}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'cozy', label: 'Cozy' },
              { value: 'compact', label: 'Compact' },
            ]}
            onChange={(value) => updateSetting('density', value)}
          />
          <MaterialSwitch checked={settings.syncEnabled} label="Sync" description="Keep recent mailbox responses available for offline reads." onChange={(value) => updateSetting('syncEnabled', value)} />
        </Section>

        <Section title="Signature">
          <label className="block p-5">
            <span className="mb-2 block text-sm font-medium text-[#202124] dark:text-[#e8eaed]">Mobile Signature</span>
            <textarea
              value={settings.signature}
              onChange={(event) => updateSetting('signature', event.target.value)}
              className="min-h-28 w-full resize-none rounded-2xl border border-[#dadce0] bg-white px-4 py-3 text-sm leading-6 text-[#202124] outline-none transition focus:border-[#0b57d0] dark:border-[#5f6368] dark:bg-[#202124] dark:text-[#e8eaed]"
              placeholder="Sent from MailX"
              aria-label="Signature"
            />
          </label>
        </Section>

        <Section title="Storage">
          <LinkRow icon={Database} label="Offline Storage" value="Recent mail cached" />
          <LinkRow icon={RotateCw} label="Queued Drafts" value="Local retry ready" />
        </Section>

        <Section title="About">
          <LinkRow icon={Smartphone} label="Application Version" value="1.0.0" />
          <LinkRow icon={Palette} label="Build" value={import.meta.env.MODE} />
          <LinkRow icon={PenLine} label="Developer" value="MailX Demo" />
          <LinkRow icon={Shield} label="Privacy Policy" />
          <LinkRow icon={Info} label="Terms" />
          <LinkRow icon={HelpCircle} label="Help" />
          <LinkRow icon={Bell} label="Feedback" />
          <LinkRow icon={Sun} label="Light Palette" value="#ffffff" />
          <LinkRow icon={Moon} label="Dark Palette" value="#202124" />
          <LinkRow icon={SlidersHorizontal} label="Swipe Actions" value="Archive / Delete" />
          <LinkRow icon={MessageSquare} label="Conversation Tools" value="Reply ready" />
        </Section>
      </div>
    </main>
  )
}
