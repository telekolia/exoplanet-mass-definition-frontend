import { Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

export function TabBar() {
  return (
    <Navbar className="bottom-nav" aria-label="Главное меню">
      <NavLink to="/telescope-feed">Лента</NavLink>
      <Nav.Link as="span" disabled>Добавление</Nav.Link>
      <NavLink to="/telescope-tile">Плитка</NavLink>
      <Nav.Link as="span" disabled>Вход</Nav.Link>
    </Navbar>
  )
}
