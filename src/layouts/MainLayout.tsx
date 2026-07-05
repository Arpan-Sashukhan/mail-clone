import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import GmailLogin from '../components/GmailLogin'
import { NavigationDrawer } from '../components/NavigationDrawer'
import { InstallPrompt } from '../components/InstallPrompt'
import { OfflineBanner } from '../components/OfflineBanner'
import { useSettings } from '../contexts/SettingsContext'
import {
  clearGoogleSession,
  fetchGoogleProfile,
  getStoredProfile,
  storeProfile,
  type GoogleProfile,
} from '../services/googleProfile'
import { gmailService, type SendMailInput } from '../services/gmailService'

const SEND_QUEUE_KEY = 'mailx-send-queue'

type QueuedSend = {
  input: SendMailInput
  queuedAt: number
}

export function MainLayout() {
  const navigate = useNavigate()
  const { settings, resolvedDark, updateSetting } = useSettings()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfile] = useState<GoogleProfile | null>(() => getStoredProfile())
  const [authChecking, setAuthChecking] = useState(() => Boolean(localStorage.getItem('gmail_access_token')))

  useEffect(() => {
    let active = true
    const accessToken = localStorage.getItem('gmail_access_token')

    if (!accessToken) {
      clearGoogleSession()
      setAuthChecking(false)
      return undefined
    }

    fetchGoogleProfile(accessToken)
      .then((nextProfile) => {
        if (!active) {
          return
        }

        storeProfile(nextProfile)
        setProfile(nextProfile)
        setAuthChecking(false)
      })
      .catch(() => {
        if (!active) {
          return
        }

        clearGoogleSession()
        setProfile(null)
        setAuthChecking(false)
        navigate('/', { replace: true })
      })

    return () => {
      active = false
    }
  }, [navigate])

  useEffect(() => {
    async function flushSendQueue() {
      const accessToken = localStorage.getItem('gmail_access_token')
      const value = localStorage.getItem(SEND_QUEUE_KEY)

      if (!accessToken || !navigator.onLine || !value) {
        return
      }

      try {
        const queue = JSON.parse(value) as QueuedSend[]
        const remaining: QueuedSend[] = []

        for (const item of queue) {
          try {
            await gmailService.sendMail(accessToken, item.input)
          } catch {
            remaining.push(item)
          }
        }

        if (remaining.length) {
          localStorage.setItem(SEND_QUEUE_KEY, JSON.stringify(remaining))
        } else {
          localStorage.removeItem(SEND_QUEUE_KEY)
        }
      } catch {
        localStorage.removeItem(SEND_QUEUE_KEY)
      }
    }

    window.addEventListener('online', flushSendQueue)
    void flushSendQueue()

    return () => window.removeEventListener('online', flushSendQueue)
  }, [])

  function handleLogout() {
    clearGoogleSession()
    setProfile(null)
    setDrawerOpen(false)
    navigate('/inbox', { replace: true })
  }

  if (authChecking) {
    return (
      <main className="grid min-h-svh place-items-center bg-white">
        <div className="size-11 animate-spin rounded-full border-[3px] border-[#1a73e8] border-t-transparent" aria-label="Checking Google session" />
      </main>
    )
  }

  if (!profile) {
    return (
      <div className="gmail-app">
        <GmailLogin onLoginSuccess={setProfile} />
      </div>
    )
  }

  return (
    <div className="gmail-app">
      <div className="h-[env(safe-area-inset-top)] bg-inherit" />
      <OfflineBanner />
      <main className="flex-1 overflow-hidden">
        <div className="gmail-scroll email-detail-enter h-full overflow-y-auto">
          <Outlet context={{ openDrawer: () => setDrawerOpen(true), profile, onLogout: handleLogout }} />
        </div>
      </main>
      <InstallPrompt />
      <NavigationDrawer
        open={drawerOpen}
        darkMode={resolvedDark}
        profile={profile}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        onToggleTheme={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
      />
    </div>
  )
}
