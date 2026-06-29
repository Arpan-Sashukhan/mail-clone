export interface GoogleProfile {
  name: string
  email: string
  picture?: string
}

const PROFILE_STORAGE_KEY = 'gmail_google_profile'

export function getStoredProfile(): GoogleProfile | null {
  const value = localStorage.getItem(PROFILE_STORAGE_KEY)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as GoogleProfile
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    return null
  }
}

export function storeProfile(profile: GoogleProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function clearGoogleSession() {
  localStorage.removeItem('gmail_access_token')
  localStorage.removeItem(PROFILE_STORAGE_KEY)
  localStorage.removeItem('selected_email')
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to verify Google session')
  }

  const profile = (await response.json()) as {
    name?: string
    email?: string
    picture?: string
  }

  if (!profile.email) {
    throw new Error('Google profile response did not include an email')
  }

  return {
    name: profile.name || profile.email,
    email: profile.email,
    picture: profile.picture,
  }
}
