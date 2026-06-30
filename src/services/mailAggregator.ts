import type { Email, Mailbox, MailProvider, MailProviderId } from '../types/email'
import { customProvider } from './customProvider'
import { createGmailProvider } from './gmailProvider'

type ProviderResult = {
  provider: MailProvider
  emails: Email[]
}

type MessageResult = {
  provider: MailProvider
  email?: Email
}

function sortByNewest(emails: Email[]) {
  return [...emails].sort((a, b) => Number(b.internalDate || 0) - Number(a.internalDate || 0))
}

function providers(accessToken?: string | null): MailProvider[] {
  return [accessToken ? createGmailProvider(accessToken) : undefined, customProvider].filter(Boolean) as MailProvider[]
}

async function settleMailbox(provider: MailProvider, mailbox: Mailbox, query: string): Promise<ProviderResult> {
  try {
    return {
      provider,
      emails: await provider.getMailbox(mailbox, query),
    }
  } catch (error) {
    console.error(`Unable to load ${provider.id} mailbox`, error)
    return {
      provider,
      emails: [],
    }
  }
}

async function settleMessage(provider: MailProvider, id: string): Promise<MessageResult> {
  try {
    return {
      provider,
      email: await provider.getMessage(id),
    }
  } catch (error) {
    console.error(`Unable to load ${provider.id} message`, error)
    return {
      provider,
      email: undefined,
    }
  }
}

export const mailAggregator = {
  async getMailbox(accessToken: string | null, mailbox: Mailbox = 'inbox', query = ''): Promise<Email[]> {
    const results = await Promise.all(providers(accessToken).map((provider) => settleMailbox(provider, mailbox, query)))
    return sortByNewest(results.flatMap((result) => result.emails))
  },

  async getInbox(accessToken: string | null): Promise<Email[]> {
    return this.getMailbox(accessToken, 'inbox')
  },

  async getMessage(accessToken: string | null, id: string, providerId?: MailProviderId): Promise<Email | undefined> {
    const availableProviders = providers(accessToken)
    const preferredProvider = providerId ? availableProviders.find((provider) => provider.id === providerId) : undefined

    if (preferredProvider) {
      const message = await settleMessage(preferredProvider, id)

      if (message.email) {
        return message.email
      }
    }

    const remainingProviders = availableProviders.filter((provider) => provider.id !== preferredProvider?.id)
    const results = await Promise.all(remainingProviders.map((provider) => settleMessage(provider, id)))
    return results.find((result) => result.email)?.email
  },

  async getSent(accessToken: string | null): Promise<Email[]> {
    return this.getMailbox(accessToken, 'sent')
  },

  async getDrafts(accessToken: string | null): Promise<Email[]> {
    return this.getMailbox(accessToken, 'drafts')
  },

  async getTrash(accessToken: string | null): Promise<Email[]> {
    return this.getMailbox(accessToken, 'trash')
  },

  async getStarred(accessToken: string | null): Promise<Email[]> {
    return this.getMailbox(accessToken, 'starred')
  },
}
