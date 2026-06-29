/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Density = 'comfortable' | 'cozy' | 'compact'
export type DefaultReplyAction = 'reply' | 'replyAll'

export interface MailXSettings {
  theme: ThemeMode
  notifications: boolean
  inboxNotifications: boolean
  priorityOnly: boolean
  sound: boolean
  vibration: boolean
  badgeCount: boolean
  backgroundSync: boolean
  conversationView: boolean
  smartReplies: boolean
  previewLines: number
  senderImages: boolean
  autoDownloadImages: boolean
  density: Density
  signature: string
  defaultReplyAction: DefaultReplyAction
  syncEnabled: boolean
}

interface SettingsContextValue {
  settings: MailXSettings
  resolvedDark: boolean
  updateSetting: <Key extends keyof MailXSettings>(key: Key, value: MailXSettings[Key]) => void
}

const SETTINGS_KEY = 'mailx-settings'

const defaultSettings: MailXSettings = {
  theme: 'system',
  notifications: true,
  inboxNotifications: true,
  priorityOnly: false,
  sound: true,
  vibration: true,
  badgeCount: true,
  backgroundSync: true,
  conversationView: true,
  smartReplies: true,
  previewLines: 1,
  senderImages: true,
  autoDownloadImages: true,
  density: 'comfortable',
  signature: '',
  defaultReplyAction: 'reply',
  syncEnabled: true,
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function getStoredSettings() {
  const legacyTheme = localStorage.getItem('mailx-theme')
  const value = localStorage.getItem(SETTINGS_KEY)

  if (!value) {
    return {
      ...defaultSettings,
      theme: legacyTheme === 'dark' || legacyTheme === 'light' ? legacyTheme : defaultSettings.theme,
    }
  }

  try {
    return {
      ...defaultSettings,
      ...(JSON.parse(value) as Partial<MailXSettings>),
    }
  } catch {
    localStorage.removeItem(SETTINGS_KEY)
    return defaultSettings
  }
}

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<MailXSettings>(() => getStoredSettings())
  const [systemDark, setSystemDark] = useState(() => getSystemDark())
  const resolvedDark = settings.theme === 'system' ? systemDark : settings.theme === 'dark'

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange(event: MediaQueryListEvent) {
      setSystemDark(event.matches)
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedDark)
    document.documentElement.dataset.theme = settings.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedDark ? '#202124' : '#ffffff')
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    localStorage.setItem('mailx-theme', resolvedDark ? 'dark' : 'light')
  }, [resolvedDark, settings])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      resolvedDark,
      updateSetting: (key, nextValue) => {
        setSettings((current) => ({
          ...current,
          [key]: nextValue,
        }))
      },
    }),
    [resolvedDark, settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const value = useContext(SettingsContext)

  if (!value) {
    throw new Error('useSettings must be used within SettingsProvider')
  }

  return value
}
