import { Navigate, Route, Routes } from 'react-router-dom'
import { ComposePage } from '../pages/ComposePage'
import { EmailDetailPage } from '../pages/EmailDetailPage'
import { InboxPage } from '../pages/InboxPage'
import { MainLayout } from '../layouts/MainLayout'
import type { Mailbox } from '../types/email'

const mailboxes: Mailbox[] = ['inbox', 'starred', 'sent', 'drafts', 'trash', 'custom']

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/inbox" replace />} />
        {mailboxes.map((mailbox) => (
          <Route key={mailbox} path={mailbox} element={<InboxPage mailbox={mailbox} />} />
        ))}
        <Route path="email/:id" element={<EmailDetailPage />} />
        <Route path="compose" element={<ComposePage />} />
        <Route path="settings" element={<InboxPage mailbox="inbox" settingsView />} />
      </Route>
      <Route path="*" element={<Navigate to="/inbox" replace />} />
    </Routes>
  )
}
