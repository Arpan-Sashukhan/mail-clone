import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('mailx-install-dismissed') === 'true')

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (!promptEvent || dismissed) {
    return null
  }

  async function install() {
    if (!promptEvent) {
      return
    }

    await promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }

  function dismiss() {
    localStorage.setItem('mailx-install-dismissed', 'true')
    setDismissed(true)
  }

  return (
    <div className="fixed inset-x-4 bottom-[max(20px,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-[28px] bg-white p-4 shadow-[0_12px_34px_rgba(60,64,67,0.28)] transition dark:bg-[#303134]" role="dialog" aria-label="Install MailX">
      <div className="flex gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf1fb] text-[#0b57d0] dark:bg-[#1d2b44] dark:text-[#a8c7fa]">
          <Download size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium text-[#202124] dark:text-[#e8eaed]">Install MailX</h2>
          <p className="mt-1 text-sm leading-5 text-[#5f6368] dark:text-[#bdc1c6]">Open mail from your home screen with a native app feel.</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={dismiss} className="h-10 rounded-full px-4 text-sm font-medium text-[#0b57d0] transition hover:bg-[#e8f0fe] dark:text-[#a8c7fa] dark:hover:bg-[#1d2b44]">
          Dismiss
        </button>
        <button type="button" onClick={install} className="h-10 rounded-full bg-[#0b57d0] px-5 text-sm font-medium text-white shadow-[0_1px_3px_rgba(60,64,67,0.3)] transition hover:bg-[#0842a0] active:scale-[0.98]">
          Install
        </button>
      </div>
    </div>
  )
}
