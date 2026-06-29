import { useCallback, useEffect, useMemo, useState } from 'react'
import { gmailService } from '../services/gmailService'
import type { Email, Mailbox } from '../types/email'

type CacheEntry = {
  emails: Email[]
  updatedAt: number
}

const mailboxCache = new Map<string, CacheEntry>()
const MAILBOX_STORAGE_KEY = 'mailx-mailbox-cache'

function loadStoredCache() {
  if (mailboxCache.size) {
    return
  }

  const value = localStorage.getItem(MAILBOX_STORAGE_KEY)

  if (!value) {
    return
  }

  try {
    const entries = JSON.parse(value) as Array<[string, CacheEntry]>
    entries.forEach(([key, entry]) => mailboxCache.set(key, entry))
  } catch {
    localStorage.removeItem(MAILBOX_STORAGE_KEY)
  }
}

function persistCache() {
  const entries = Array.from(mailboxCache.entries()).slice(-24)
  localStorage.setItem(MAILBOX_STORAGE_KEY, JSON.stringify(entries))
}

function getCacheKey(mailbox: Mailbox, query: string) {
  return `${mailbox}:${query.trim()}`
}

export function useEmails(mailbox: Mailbox = 'inbox', query = '') {
  loadStoredCache()
  const cacheKey = useMemo(() => getCacheKey(mailbox, query), [mailbox, query])
  const cached = mailboxCache.get(cacheKey)
  const [emails, setEmails] = useState<Email[]>(() => cached?.emails || [])
  const [loading, setLoading] = useState(() => !cached)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadEmails = useCallback(
    async (force = false) => {
      const cachedValue = mailboxCache.get(cacheKey)

      if (cachedValue && !force) {
        setEmails(cachedValue.emails)
        setLoading(false)
        setError('')
        return
      }

      try {
        const accessToken = localStorage.getItem('gmail_access_token')

        if (!accessToken) {
          setEmails([])
          setLoading(false)
          setError('No Gmail Connected')
          return
        }

        if (!refreshing) {
          setLoading(true)
        }

        const messages = await gmailService.getMailbox(accessToken, mailbox, query)
        mailboxCache.set(cacheKey, {
          emails: messages,
          updatedAt: Date.now(),
        })
        persistCache()
        setEmails(messages)
        setError('')
      } catch (loadError) {
        console.error(loadError)
        setEmails([])
        setError('Unable to load Gmail messages.')
      } finally {
        setLoading(false)
      }
    },
    [cacheKey, mailbox, query, refreshing],
  )

  useEffect(() => {
    const cachedValue = mailboxCache.get(cacheKey)
    queueMicrotask(() => {
      setEmails(cachedValue?.emails || [])
      setLoading(!cachedValue)
      setError('')
      void loadEmails()
    })
  }, [cacheKey, loadEmails])

  async function refresh() {
    setRefreshing(true)
    await loadEmails(true)

    window.setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

  function updateEmail(id: string, updater: (email: Email) => Email) {
    setEmails((current) => {
      const next = current.map((email) => (email.id === id ? updater(email) : email))
      mailboxCache.set(cacheKey, {
        emails: next,
        updatedAt: Date.now(),
      })
      persistCache()
      return next
    })
  }

  return {
    emails,
    loading,
    refreshing,
    error,
    refresh,
    updateEmail,
  }
}
