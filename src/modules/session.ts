const storageKey = 'telescopes.session'
export interface UserSession { token: string; username: string; expiresAt: number }

let session: UserSession | null = null
export function getSession() { return session }
export function saveSession(value: UserSession | null) {
  session = value
  try {
    if (value) localStorage.setItem(storageKey, JSON.stringify(value))
    else localStorage.removeItem(storageKey)
  } catch { return }
}
