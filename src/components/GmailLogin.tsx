import { useGoogleLogin } from '@react-oauth/google'
import { gmailService } from '../services/gmailService'

export default function GmailLogin() {
  const login = useGoogleLogin({
    scope:
      'openid email profile https://www.googleapis.com/auth/gmail.readonly',

    onSuccess: async (tokenResponse) => {
      try {
        localStorage.setItem(
          'gmail_access_token',
          tokenResponse.access_token
        )

        const messages = await gmailService.getInbox(
          tokenResponse.access_token
        )

        console.log('FULL GMAIL DATA')
        console.log(messages)

        alert('Google Login Successful')
      } catch (error) {
        console.error('Gmail API Error:', error)
        alert('Failed to fetch Gmail messages')
      }
    },

    onError: () => {
      alert('Google Login Failed')
    },
  })

  return (
    <button
      onClick={() => login()}
      style={{
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Connect Gmail
    </button>
  )
}