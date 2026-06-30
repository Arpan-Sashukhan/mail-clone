import type { Email, Mailbox, MailProvider } from '../types/email'
import { gmailService } from './gmailService'

export function createGmailProvider(accessToken: string): MailProvider {
  return {
    id: 'gmail',

    getMailbox(mailbox: Mailbox = 'inbox', query = ''): Promise<Email[]> {
      return gmailService.getMailbox(accessToken, mailbox, query)
    },

    getInbox(): Promise<Email[]> {
      return this.getMailbox('inbox')
    },

    async getMessage(id: string): Promise<Email> {
      return gmailService.getMessage(accessToken, id)
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
}
