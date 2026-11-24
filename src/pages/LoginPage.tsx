import { useState, type FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { authApi, requestError } from '../api'
import { useAppDispatch, useAppSelector } from '../hooks'
import { saveSession } from '../modules/session'
import { sessionStarted } from '../slices/sessionActions'
import { setAuthError, setAuthLoading } from '../slices/userSlice'
import { selectBusy } from '../store'
import '../styles/draft.css'

interface LoginResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authenticated = useAppSelector((state) => state.user.isAuthenticated)
  const busy = useAppSelector(selectBusy)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    dispatch(setAuthLoading(true))
    try {
      const { data } = await authApi.post<LoginResponse>('/users/login', {
        login: login.trim(),
        password,
      })
      if (!data.access_token || !Number.isFinite(data.expires_in) || data.expires_in <= 0)
        throw new Error('Сервис не вернул корректный токен.')
      const session = {
        token: data.access_token,
        username: login.trim(),
        expiresAt: Date.now() + data.expires_in * 1000,
      }
      saveSession(session)
      dispatch(sessionStarted(session))
      navigate('/telescope-tile', { replace: true })
    } catch (error) {
      dispatch(setAuthError(requestError(error)))
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  if (authenticated) return <Navigate to="/telescope-tile" replace />
  return (
    <main className="draft-main login-main">
      <h2>Вход</h2>
      <Form onSubmit={submit}>
        <fieldset className="input-container" disabled={busy}>
          <Form.Group controlId="login">
            <Form.Label>Логин</Form.Label>
            <Form.Control
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
              maxLength={64}
              required
            />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              maxLength={100}
              required
            />
          </Form.Group>
          <Button
            variant="light"
            className="main-button"
            type="submit"
            disabled={busy || !login.trim()}
          >
            Войти
          </Button>
        </fieldset>
      </Form>
    </main>
  )
}
