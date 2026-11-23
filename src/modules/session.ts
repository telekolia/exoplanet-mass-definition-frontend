const storageKey = 'telescopes.session'
export interface UserSession { token: string; username: string; expiresAt: number }

function restoreSession(): UserSession | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null') as UserSession | null
    if (value && typeof value.token === 'string' && typeof value.username === 'string' && value.expiresAt > Date.now()) return value
    localStorage.removeItem(storageKey)
  } catch { return null }
  return null
}

let session = restoreSession()
export function getSession() { return session }
export function saveSession(value: UserSession | null) {
  session = value
  try {
    if (value) localStorage.setItem(storageKey, JSON.stringify(value))
    else localStorage.removeItem(storageKey)
  } catch { return }
}
