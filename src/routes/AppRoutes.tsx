import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import type { Mailbox } from '../types/email'

const ComposePage = lazy(() => import('../pages/ComposePage').then((module) => ({ default: module.ComposePage })))
const EmailDetailPage = lazy(() => import('../pages/EmailDetailPage').then((module) => ({ default: module.EmailDetailPage })))
const InboxPage = lazy(() => import('../pages/InboxPage').then((module) => ({ default: module.InboxPage })))
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))

const mailboxes: Mailbox[] = [
  'inbox',
  'sent',
  'starred',
  'important',
  'drafts',
  'trash',
  'spam',
  'social',
  'promotions',
  'updates',
  'forums',
  'all',
  'custom',
]

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-svh place-items-center bg-white dark:bg-[#202124]">
          <div className="mail-shimmer h-12 w-12 rounded-full bg-[#e8eef7] dark:bg-[#303134]" aria-label="Loading page" />
        </main>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/inbox" replace />} />
          {mailboxes.map((mailbox) => (
            <Route key={mailbox} path={mailbox} element={<InboxPage mailbox={mailbox} />} />
          ))}
          <Route path="email/:id" element={<EmailDetailPage />} />
          <Route path="compose" element={<ComposePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/inbox" replace />} />
      </Routes>
    </Suspense>
  )
}
