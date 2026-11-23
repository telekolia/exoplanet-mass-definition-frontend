import { useEffect } from 'react'
import { Alert } from 'react-bootstrap'
import { LatitudeFilter } from '../components/LatitudeFilter'
import { TelescopeCard } from '../components/TelescopeCard'
import { useAppDispatch, useAppSelector } from '../hooks'
import { selectBusy } from '../store'
import { applyRange, clearActionError, deleteTelescope, getTelescopesList, setRange } from '../slices/telescopesSlice'
import '../styles/tile.css'

export function TilePage() {
  const dispatch = useAppDispatch()
  const { range, appliedRange, items, listError, listLoading, listMock, actionError } = useAppSelector((state) => state.telescopes)
  const { token, isAuthenticated } = useAppSelector((state) => state.user)
  const busy = useAppSelector(selectBusy)

  useEffect(() => { dispatch(clearActionError()) }, [dispatch])

  useEffect(() => {
    const request = dispatch(getTelescopesList())
    return () => request.abort()
  }, [dispatch, appliedRange, token])

  return (
    <main className="tile-main">
      <h2>Каталог телескопов</h2>
      <LatitudeFilter range={range} disabled={busy} onChange={(value) => dispatch(setRange(value))} onApply={() => dispatch(applyRange())} />
      <h2>Результаты поиска:</h2>
      {listMock && <Alert variant="secondary">Сервис недоступен. Показан демонстрационный каталог.</Alert>}
      {actionError && <Alert variant="danger">{actionError}</Alert>}
      {listError ? (
        <Alert variant="danger">
          {listError}
          <button className="btn btn-link" disabled={busy} onClick={() => dispatch(getTelescopesList())}>Повторить</button>
        </Alert>
      ) : !listLoading && items.length === 0 ? (
        <p className="text-center">Телескопы в этом диапазоне не найдены.</p>
      ) : (
        <div className="cards-grid">
          {items.map((telescope) => (
            <TelescopeCard key={telescope.id} telescope={telescope} disabled={busy}
              canDelete={isAuthenticated && !listMock && Boolean(telescope.is_creator)}
              onDelete={() => dispatch(deleteTelescope(telescope.id))} />
          ))}
        </div>
      )}
    </main>
  )
}
