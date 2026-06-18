import type { Email } from '../types/email'

const GMAIL_BASE_URL =
  'https://gmail.googleapis.com/gmail/v1/users/me'

function getHeader(
  headers: any[],
  name: string
) {
  return (
    headers.find(
      (header) =>
        header.name.toLowerCase() ===
        name.toLowerCase()
    )?.value ?? ''
  )
}

export const gmailService = {
  async getInbox(
    accessToken: string
  ): Promise<Email[]> {
    const listResponse = await fetch(
      `${GMAIL_BASE_URL}/messages?maxResults=20`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const listData = await listResponse.json()

    const messages = await Promise.all(
      (listData.messages || []).map(
        async (message: any) => {
          const detailResponse = await fetch(
            `${GMAIL_BASE_URL}/messages/${message.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )

          const gmailMessage =
            await detailResponse.json()

          const headers =
            gmailMessage.payload?.headers || []

          return {
            id: gmailMessage.id,
            sender:
              getHeader(headers, 'From') ||
              'Unknown Sender',

            senderEmail:
              getHeader(headers, 'From'),

            subject:
              getHeader(headers, 'Subject') ||
              '(No Subject)',

            preview:
              gmailMessage.snippet || '',

            body:
              gmailMessage.snippet || '',

            timestamp: new Date(
              Number(gmailMessage.internalDate)
            ).toLocaleDateString(),

            read: true,

            starred: false,
          } satisfies Email
        }
      )
    )

    return messages
  },
}