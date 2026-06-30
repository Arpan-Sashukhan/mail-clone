import emails from '../data/emails.json'
import type { Email } from '../types/email'

const inbox = emails as Email[]

export const gmailService = {
  async getInbox(): Promise<Email[]> {
    return inbox
  },

  async getMessage(id: string): Promise<Email | undefined> {
    return inbox.find((email) => email.id === id)
  },

  async sendMail(message: Pick<Email, 'senderEmail' | 'subject' | 'body'>): Promise<Email> {
    return {
      id: `mx-${Date.now()}`,
      provider: 'gmail',
      sender: 'You',
      senderEmail: message.senderEmail,
      subject: message.subject,
      preview: message.body.slice(0, 96),
      body: message.body,
      timestamp: 'Now',
      internalDate: String(Date.now()),
      read: true,
      starred: false,
    }
  },

  async deleteMail(id: string): Promise<{ deleted: boolean; id: string }> {
    return { deleted: Boolean(inbox.find((email) => email.id === id)), id }
  },
}
