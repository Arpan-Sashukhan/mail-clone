import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { NavigationDrawer } from '../components/NavigationDrawer'

export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('mailx-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('mailx-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <div className="min-h-svh bg-white text-slate-900 dark:bg-[#111315] dark:text-slate-100">
      <Outlet context={{ openDrawer: () => setDrawerOpen(true) }} />
      <NavigationDrawer
        open={drawerOpen}
        darkMode={darkMode}
        onClose={() => setDrawerOpen(false)}
        onToggleTheme={() => setDarkMode((value) => !value)}
      />
    </div>
  )
}
