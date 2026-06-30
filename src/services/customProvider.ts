import { customEmails } from '../data/customEmails'
import type { Email, Mailbox, MailProvider } from '../types/email'

const mailboxLabel: Partial<Record<Mailbox, string>> = {
  inbox: 'Inbox',
  sent: 'Sent',
  starred: 'Starred',
  important: 'Important',
  drafts: 'Draft',
  trash: 'Trash',
  spam: 'Spam',
  social: 'Social',
  promotions: 'Promotions',
  updates: 'Updates',
  forums: 'Forums',
}

function hasLabel(email: Email, label: string) {
  return email.labels?.some((item) => item.toLowerCase() === label.toLowerCase()) ?? false
}

function matchesMailbox(email: Email, mailbox: Mailbox) {
  if (mailbox === 'all' || mailbox === 'custom') {
    return true
  }

  if (mailbox === 'starred') {
    return email.starred || hasLabel(email, 'Starred')
  }

  if (mailbox === 'important') {
    return email.important || hasLabel(email, 'Important')
  }

  const label = mailboxLabel[mailbox]
  return label ? hasLabel(email, label) : false
}

function normalized(value = '') {
  return value.toLowerCase()
}

function queryTerms(query: string) {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

function matchesQuery(email: Email, query = '') {
  const terms = queryTerms(query)

  if (!terms.length) {
    return true
  }

  const searchable = normalized(
    [
      email.sender,
      email.senderEmail,
      email.subject,
      email.preview,
      email.bodyPlain,
      email.body,
      ...(email.to || []),
      ...(email.labels || []),
      ...(email.attachments || []).map((attachment) => attachment.filename),
    ].join(' '),
  )

  return terms.every((term) => {
    if (term.startsWith('from:')) {
      return normalized(`${email.sender} ${email.senderEmail}`).includes(term.slice(5))
    }

    if (term.startsWith('subject:')) {
      return normalized(email.subject).includes(term.slice(8))
    }

    if (term === 'has:attachment') {
      return Boolean(email.attachments?.length)
    }

    if (term.startsWith('filename:')) {
      return email.attachments?.some((attachment) => normalized(attachment.filename).includes(term.slice(9))) ?? false
    }

    return searchable.includes(term)
  })
}

async function readCustomMailbox(mailbox: Mailbox = 'inbox', query = '') {
  return customEmails.filter((email) => matchesMailbox(email, mailbox) && matchesQuery(email, query))
}

export const customProvider: MailProvider = {
  id: 'custom',

  getMailbox(mailbox: Mailbox = 'inbox', query = ''): Promise<Email[]> {
    return readCustomMailbox(mailbox, query)
  },

  getInbox(): Promise<Email[]> {
    return this.getMailbox('inbox')
  },

  async getMessage(id: string): Promise<Email | undefined> {
    return customEmails.find((email) => email.id === id)
  },

  getSent(): Promise<Email[]> {
    return this.getMailbox('sent')
  },

  getDrafts(): Promise<Email[]> {
    return this.getMailbox('drafts')
  },

  getTrash(): Promise<Email[]> {
    return this.getMailbox('trash')
  },

  getStarred(): Promise<Email[]> {
    return this.getMailbox('starred')
  },
}
