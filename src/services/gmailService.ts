import type { Email, EmailAttachment, Mailbox } from '../types/email'

const GMAIL_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me'

type GmailHeader = {
  name: string
  value: string
}

type GmailPartBody = {
  data?: string
  size?: number
  attachmentId?: string
}

type GmailPart = {
  partId?: string
  mimeType?: string
  filename?: string
  headers?: GmailHeader[]
  body?: GmailPartBody
  parts?: GmailPart[]
}

type GmailMessage = {
  id: string
  threadId?: string
  labelIds?: string[]
  snippet?: string
  internalDate?: string
  payload?: GmailPart
}

type GmailListResponse = {
  messages?: Array<{ id: string; threadId?: string }>
  nextPageToken?: string
}

export interface SendMailInput {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  threadId?: string
  inReplyTo?: string
}

export const mailboxLabels: Record<Mailbox, string | undefined> = {
  inbox: 'INBOX',
  sent: 'SENT',
  starred: 'STARRED',
  important: 'IMPORTANT',
  drafts: 'DRAFT',
  trash: 'TRASH',
  spam: 'SPAM',
  social: 'CATEGORY_SOCIAL',
  promotions: 'CATEGORY_PROMOTIONS',
  updates: 'CATEGORY_UPDATES',
  forums: 'CATEGORY_FORUMS',
  all: undefined,
  custom: undefined,
}

function ensureOk(response: Response) {
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'TOKEN_EXPIRED' : 'GMAIL_REQUEST_FAILED')
  }
}

function authHeaders(accessToken: string, extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  }
}

function getHeader(headers: GmailHeader[] = [], name: string) {
  return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function parseAddress(value: string) {
  const match = value.match(/^(.*?)\s*<([^>]+)>$/)

  if (!match) {
    return {
      name: value.replaceAll('"', '').trim() || 'Unknown Sender',
      email: value.trim(),
    }
  }

  return {
    name: match[1].replaceAll('"', '').trim() || match[2],
    email: match[2].trim(),
  }
}

function splitAddresses(value = '') {
  return value
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function decodeBase64Url(data = '') {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  try {
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return binary
  }
}

function decodeQuotedPrintable(value: string) {
  const withoutSoftBreaks = value.replace(/=\r?\n/g, '')
  const bytes = withoutSoftBreaks.replace(/=([A-Fa-f0-9]{2})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  )

  try {
    return decodeURIComponent(escape(bytes))
  } catch {
    return bytes
  }
}

function decodeBody(data = '') {
  return decodeQuotedPrintable(decodeBase64Url(data))
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function textToHtml(value: string) {
  return escapeHtml(value)
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

function sanitizeHtml(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html')

  document.querySelectorAll('script, iframe, object, embed, form, input, button').forEach((node) => node.remove())
  document.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()

      if (name.startsWith('on') || value.startsWith('javascript:')) {
        element.removeAttribute(attribute.name)
      }
    }

    if (element.tagName.toLowerCase() === 'a') {
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noreferrer')
    }

    if (element.tagName.toLowerCase() === 'img') {
      element.setAttribute('loading', 'lazy')
      element.setAttribute('referrerpolicy', 'no-referrer')
    }
  })

  return document.body.innerHTML
}

function collectMessageParts(part: GmailPart | undefined, result = { html: '', plain: '', attachments: [] as EmailAttachment[] }) {
  if (!part) {
    return result
  }

  const disposition = getHeader(part.headers, 'Content-Disposition').toLowerCase()
  const contentId = getHeader(part.headers, 'Content-ID').replace(/[<>]/g, '')
  const filename = part.filename || ''
  const mimeType = part.mimeType || 'application/octet-stream'
  const attachmentId = part.body?.attachmentId
  const size = part.body?.size || 0

  if (attachmentId || filename) {
    result.attachments.push({
      id: attachmentId || part.partId || filename,
      filename: filename || contentId || 'Inline image',
      mimeType,
      size,
      inline: disposition.includes('inline') || Boolean(contentId),
      contentId,
    })
  }

  if (part.body?.data && !attachmentId) {
    const decoded = decodeBody(part.body.data)

    if (mimeType === 'text/html') {
      result.html += decoded
    }

    if (mimeType === 'text/plain') {
      result.plain += decoded
    }
  }

  part.parts?.forEach((child) => collectMessageParts(child, result))
  return result
}

function labelName(labelId: string) {
  return labelId
    .replace('CATEGORY_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatTimestamp(internalDate?: string) {
  if (!internalDate) {
    return ''
  }

  return new Date(Number(internalDate)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function formatDate(internalDate?: string) {
  if (!internalDate) {
    return ''
  }

  return new Date(Number(internalDate)).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function fetchMessage(accessToken: string, id: string, format: 'full' | 'metadata' = 'full') {
  const response = await fetch(`${GMAIL_BASE_URL}/messages/${id}?format=${format}`, {
    headers: authHeaders(accessToken),
  })

  ensureOk(response)
  return (await response.json()) as GmailMessage
}

function mapMessage(message: GmailMessage): Email {
  const headers = message.payload?.headers || []
  const from = getHeader(headers, 'From')
  const sender = parseAddress(from)
  const parts = collectMessageParts(message.payload)
  const bodyHtml = sanitizeHtml(parts.html || textToHtml(parts.plain || message.snippet || ''))
  const labelIds = message.labelIds || []
  const headerMap = headers.reduce<Record<string, string>>((acc, header) => {
    acc[header.name] = header.value
    return acc
  }, {})

  return {
    id: message.id,
    provider: 'gmail',
    threadId: message.threadId,
    sender: sender.name,
    senderName: sender.name,
    senderEmail: sender.email,
    to: splitAddresses(getHeader(headers, 'To')),
    cc: splitAddresses(getHeader(headers, 'Cc')),
    bcc: splitAddresses(getHeader(headers, 'Bcc')),
    replyTo: getHeader(headers, 'Reply-To'),
    date: getHeader(headers, 'Date') || formatDate(message.internalDate),
    subject: getHeader(headers, 'Subject') || '(No Subject)',
    preview: message.snippet || parts.plain.replace(/\s+/g, ' ').slice(0, 140),
    body: parts.plain || message.snippet || '',
    bodyPlain: parts.plain || message.snippet || '',
    bodyHtml,
    timestamp: formatTimestamp(message.internalDate),
    internalDate: message.internalDate,
    read: !labelIds.includes('UNREAD'),
    starred: labelIds.includes('STARRED'),
    important: labelIds.includes('IMPORTANT'),
    importance: labelIds.includes('IMPORTANT') ? 'high' : 'normal',
    labels: labelIds.map(labelName),
    attachments: parts.attachments,
    rawHeaders: headerMap,
  }
}

function encodeMessage(value: string) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function buildMimeMessage(input: SendMailInput) {
  const headers = [
    `To: ${input.to.join(', ')}`,
    input.cc?.length ? `Cc: ${input.cc.join(', ')}` : '',
    input.bcc?.length ? `Bcc: ${input.bcc.join(', ')}` : '',
    `Subject: ${input.subject || '(no subject)'}`,
    'Content-Type: text/html; charset=UTF-8',
    input.inReplyTo ? `In-Reply-To: ${input.inReplyTo}` : '',
    input.inReplyTo ? `References: ${input.inReplyTo}` : '',
  ].filter(Boolean)

  return `${headers.join('\r\n')}\r\n\r\n${textToHtml(input.body || '')}`
}

export const gmailService = {
  async getMailbox(accessToken: string, mailbox: Mailbox = 'inbox', query = ''): Promise<Email[]> {
    const label = mailboxLabels[mailbox]
    const params = new URLSearchParams({ maxResults: '20' })

    if (label) {
      params.set('labelIds', label)
    }

    if (query.trim()) {
      params.set('q', query.trim())
    }

    const response = await fetch(`${GMAIL_BASE_URL}/messages?${params.toString()}`, {
      headers: authHeaders(accessToken),
    })

    ensureOk(response)
    const data = (await response.json()) as GmailListResponse

    const messages = await Promise.all((data.messages || []).map((message) => fetchMessage(accessToken, message.id)))
    return messages.map(mapMessage)
  },

  async getInbox(accessToken: string): Promise<Email[]> {
    return this.getMailbox(accessToken, 'inbox')
  },

  async getMessage(accessToken: string, id: string): Promise<Email> {
    return mapMessage(await fetchMessage(accessToken, id))
  },

  async downloadAttachment(accessToken: string, messageId: string, attachmentId: string) {
    const response = await fetch(`${GMAIL_BASE_URL}/messages/${messageId}/attachments/${attachmentId}`, {
      headers: authHeaders(accessToken),
    })

    ensureOk(response)
    const data = (await response.json()) as { data?: string; size?: number }
    return data.data || ''
  },

  async sendMail(accessToken: string, input: SendMailInput) {
    const response = await fetch(`${GMAIL_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: authHeaders(accessToken, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        raw: encodeMessage(buildMimeMessage(input)),
        threadId: input.threadId,
      }),
    })

    ensureOk(response)
    return response.json()
  },
}
