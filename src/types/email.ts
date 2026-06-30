export interface Email {
  id: string
  provider: MailProviderId
  threadId?: string
  sender: string
  senderEmail: string
  senderName?: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  date?: string
  subject: string
  preview: string
  body: string
  bodyHtml?: string
  bodyPlain?: string
  timestamp: string
  internalDate?: string
  read: boolean
  starred: boolean
  important?: boolean
  importance?: string
  labels?: string[]
  attachments?: EmailAttachment[]
  avatar?: string
  category?: string
  rawHeaders?: Record<string, string>
}

export type MailProviderId = 'gmail' | 'custom'

export interface MailProvider {
  id: MailProviderId
  getMailbox(mailbox?: Mailbox, query?: string): Promise<Email[]>
  getInbox(): Promise<Email[]>
  getMessage(id: string): Promise<Email | undefined>
  getSent(): Promise<Email[]>
  getDrafts(): Promise<Email[]>
  getTrash(): Promise<Email[]>
  getStarred(): Promise<Email[]>
}

export interface EmailAttachment {
  id: string
  filename: string
  mimeType: string
  size: number
  inline: boolean
  contentId?: string
  dataUrl?: string
}

export type Mailbox =
  | 'inbox'
  | 'sent'
  | 'starred'
  | 'important'
  | 'drafts'
  | 'trash'
  | 'spam'
  | 'social'
  | 'promotions'
  | 'updates'
  | 'forums'
  | 'all'
  | 'custom'
