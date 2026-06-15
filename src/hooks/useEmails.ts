import { useEffect, useMemo, useState } from 'react'
import { gmailService } from '../services/gmailService'
import type { Email, Mailbox } from '../types/email'

export function useEmails(mailbox: Mailbox = 'inbox') {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    gmailService.getInbox().then((messages) => {
      setEmails(messages)
      setLoading(false)
    })
  }, [])

  const filteredEmails = useMemo(() => {
    if (mailbox === 'starred') {
      return emails.filter((email) => email.starred)
    }

    if (mailbox === 'sent') {
      return emails.filter((email) => email.sender === 'You')
    }

    if (mailbox === 'drafts') {
      return emails.slice(0, 2).map((email) => ({ ...email, subject: `Draft: ${email.subject}` }))
    }

    if (mailbox === 'trash') {
      return emails.slice(-3)
    }

    if (mailbox === 'custom') {
      return emails.filter((email) => email.senderEmail.includes('northstar'))
    }

    return emails
  }, [emails, mailbox])

  async function refresh() {
    setRefreshing(true)
    const messages = await gmailService.getInbox()

    window.setTimeout(() => {
      setEmails(messages)
      setRefreshing(false)
    }, 700)
  }

  return { emails: filteredEmails, loading, refreshing, refresh }
}
