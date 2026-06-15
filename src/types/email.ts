export interface Email {
  id: string
  sender: string
  senderEmail: string
  subject: string
  preview: string
  body: string
  timestamp: string
  read: boolean
  starred: boolean
}

export type Mailbox = 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash' | 'custom'
