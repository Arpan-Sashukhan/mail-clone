export interface Email {
  id: string
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
  read: boolean
  starred: boolean
  important?: boolean
  labels?: string[]
  attachments?: EmailAttachment[]
  rawHeaders?: Record<string, string>
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
