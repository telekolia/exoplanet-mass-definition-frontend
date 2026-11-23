import { useEffect } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { Navigate, Route, Routes } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { FeedPage } from './pages/FeedPage'
import { TilePage } from './pages/TilePage'
import { LoginPage } from './pages/LoginPage'
import { DraftPage } from './pages/DraftPage'
import { useAppDispatch, useAppSelector } from './hooks'
import { selectBusy } from './store'
import { sessionEnded } from './slices/sessionActions'
import { saveSession } from './modules/session'

export default function App() {
  const dispatch = useAppDispatch()
  const { token, expiresAt, username, error } = useAppSelector((state) => state.user)
  const busy = useAppSelector(selectBusy)

  useEffect(() => {
    if (!token) return
    const timer = window.setTimeout(() => {
      saveSession(null)
      dispatch(sessionEnded())
    }, Math.max(0, expiresAt - Date.now()))
    return () => window.clearTimeout(timer)
  }, [dispatch, token, expiresAt])

  return (
    <div className="app" aria-busy={busy}>
      <header className="top-header">
        <h1>Телескопная</h1>
        {token && <span className="current-user">{username}</span>}
      </header>
      {error && <Alert className="auth-error" variant="danger">{error}</Alert>}
      <Routes>
        <Route path="/telescope-tile" element={<TilePage />} />
        <Route path="/telescope-feed" element={<FeedPage />} />
        <Route path="/telescope-draft" element={<DraftPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/telescope-tile" replace />} />
      </Routes>
      <TabBar />
      {busy && <div className="request-overlay" role="status" aria-live="polite">
        <Spinner animation="border" />
        <span>Выполняется запрос…</span>
      </div>}
    </div>
  )
}
