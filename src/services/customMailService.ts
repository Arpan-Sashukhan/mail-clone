import type { Email } from '../types/email'
import { gmailService } from './gmailService'

export const customMailService = {
  getInbox(): Promise<Email[]> {
    return gmailService.getInbox()
  },

  getMessage(id: string): Promise<Email | undefined> {
    return gmailService.getMessage(id)
  },

  sendMail(message: Pick<Email, 'senderEmail' | 'subject' | 'body'>): Promise<Email> {
    return gmailService.sendMail(message)
  },

  deleteMail(id: string): Promise<{ deleted: boolean; id: string }> {
    return gmailService.deleteMail(id)
  },
}
