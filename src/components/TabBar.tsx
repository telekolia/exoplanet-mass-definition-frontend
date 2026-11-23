import axios from 'axios'
import { Nav, Navbar } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { authApi, requestError } from '../api'
import { useAppDispatch, useAppSelector } from '../hooks'
import { saveSession } from '../modules/session'
import { sessionEnded } from '../slices/sessionActions'
import { setAuthError, setAuthLoading } from '../slices/userSlice'
import { selectBusy } from '../store'

export function TabBar() {
  const { isAuthenticated, token, username } = useAppSelector((state) => state.user)
  const busy = useAppSelector(selectBusy)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  async function logout() {
    if (busy) return
    dispatch(setAuthLoading(true))
    try {
      await authApi.post('/users/logout', undefined, { headers: { Authorization: `Bearer ${token}` } })
      finish()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) finish()
      else dispatch(setAuthError(requestError(error)))
    } finally {
      dispatch(setAuthLoading(false))
    }
  }
  function finish() {
    saveSession(null)
    dispatch(sessionEnded())
    navigate('/telescope-tile', { replace: true })
  }

  return (
    <Navbar className="bottom-nav" aria-label="Главное меню">
      <NavLink to="/telescope-feed" aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault() }}>Лента</NavLink>
      {isAuthenticated ? (
        <NavLink to="/telescope-draft" aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault() }}>Добавление</NavLink>
      ) : <Nav.Link as="span" disabled>Добавление</Nav.Link>}
      <NavLink to="/telescope-tile" aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault() }}>Плитка</NavLink>
      {isAuthenticated ? (
        <button className="nav-link" title={username} onClick={logout} disabled={busy}>Выход</button>
      ) : (
        <NavLink to="/login" aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault() }}>Вход</NavLink>
      )}
    </Navbar>
  )
}
