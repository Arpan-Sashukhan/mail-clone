import { useGoogleLogin } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchGoogleProfile, storeProfile, type GoogleProfile } from '../services/googleProfile'

interface GmailLoginProps {
  onLoginSuccess?: (profile: GoogleProfile) => void
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

export default function GmailLogin({ onLoginSuccess }: GmailLoginProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!snackbarOpen) {
      return undefined
    }

    const timeout = window.setTimeout(() => setSnackbarOpen(false), 3600)
    return () => window.clearTimeout(timeout)
  }, [snackbarOpen])

  const login = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setSnackbarOpen(false)

      try {
        localStorage.setItem('gmail_access_token', tokenResponse.access_token)

        const profile = await fetchGoogleProfile(tokenResponse.access_token)
        storeProfile(profile)
        onLoginSuccess?.(profile)
        setSuccess(true)

        window.setTimeout(() => {
          navigate('/inbox', { replace: true })
        }, 220)
      } catch {
        localStorage.removeItem('gmail_access_token')
        setSnackbarOpen(true)
        setLoading(false)
      }
    },
    onError: () => {
      setLoading(false)
      setSnackbarOpen(true)
    },
  })

  return (
    <main
      className={`grid min-h-svh place-items-center bg-white px-6 py-10 transition-opacity duration-300 ${
        success ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <section className="w-full max-w-[420px] rounded-[32px] bg-white px-7 py-10 text-center shadow-[0_8px_30px_rgba(60,64,67,0.14),0_1px_3px_rgba(60,64,67,0.18)]">
        <div className="mx-auto grid size-24 place-items-center rounded-[28px] bg-white shadow-[0_2px_12px_rgba(60,64,67,0.16)]">
          <img src="/favicon.svg" alt="Gmail" className="size-16" />
        </div>

        <h1 className="mt-7 text-[32px] font-normal leading-10 tracking-normal text-[#202124]">Gmail</h1>
        <p className="mt-3 text-[17px] font-normal leading-6 text-[#202124]">Sign in with your Google Account</p>
        <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-[#5f6368]">
          Access your Gmail securely using Google's official authentication.
        </p>

        <button
          type="button"
          onClick={() => {
            if (!loading) {
              setLoading(true)
              login()
            }
          }}
          disabled={loading}
          className="relative mt-9 flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-[#dadce0] bg-white px-6 text-[15px] font-medium text-[#202124] shadow-[0_1px_2px_rgba(60,64,67,0.18)] transition duration-200 before:absolute before:inset-0 before:bg-[#1a73e8]/0 before:transition hover:bg-[#f8fafd] hover:shadow-[0_2px_6px_rgba(60,64,67,0.2)] active:scale-[0.98] active:before:bg-[#1a73e8]/10 disabled:pointer-events-none disabled:opacity-70"
          aria-label="Continue with Google"
        >
          {loading ? (
            <span className="size-5 animate-spin rounded-full border-2 border-[#1a73e8] border-t-transparent" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          <span>{loading ? 'Signing in' : 'Continue with Google'}</span>
        </button>
      </section>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 min-w-[220px] -translate-x-1/2 rounded-xl bg-[#323232] px-4 py-3 text-sm font-medium text-white shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition duration-200 ${
          snackbarOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        Unable to sign in.
      </div>
    </main>
  )
}
