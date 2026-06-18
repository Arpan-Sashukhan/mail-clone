import { useEffect, useMemo, useState } from 'react'
import { gmailService } from '../services/gmailService'
import type { Email, Mailbox } from '../types/email'

export function useEmails(mailbox: Mailbox = 'inbox') {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadEmails() {
    try {
      const accessToken = localStorage.getItem(
        'gmail_access_token'
      )

      if (!accessToken) {
        setLoading(false)
        return
      }

      const messages = await gmailService.getInbox(
        accessToken
      )

      setEmails(messages)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmails()
  }, [])

  const filteredEmails = useMemo(() => {
    if (mailbox === 'starred') {
      return emails.filter((email) => email.starred)
    }

    if (mailbox === 'sent') {
      return emails.filter((email) => email.sender === 'You')
    }

    if (mailbox === 'drafts') {
      return emails.slice(0, 2)
    }

    if (mailbox === 'trash') {
      return emails.slice(-3)
    }

    return emails
  }, [emails, mailbox])

  async function refresh() {
    setRefreshing(true)

    await loadEmails()

    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

  return {
    emails: filteredEmails,
    loading,
    refreshing,
    refresh,
  }
}