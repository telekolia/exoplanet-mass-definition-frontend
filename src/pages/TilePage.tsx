import { useEffect, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { LatitudeFilter } from '../components/LatitudeFilter'
import { TelescopeCard } from '../components/TelescopeCard'
import { FULL_LATITUDE_RANGE, type Telescope } from '../modules/telescope'
import { getTelescopes } from '../modules/telescopesApi'
import '../styles/tile.css'

export function TilePage() {
  const [range, setRange] = useState(FULL_LATITUDE_RANGE)
  const [appliedRange, setAppliedRange] = useState(FULL_LATITUDE_RANGE)
  const [telescopes, setTelescopes] = useState<Telescope[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    getTelescopes(appliedRange, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setTelescopes(items)
      })
      .catch((reason: Error) => {
        if (!controller.signal.aborted) setError(reason.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [appliedRange])

  return (
    <main className="tile-main">
      <h2>Каталог телескопов</h2>
      <LatitudeFilter range={range} onChange={setRange} onApply={() => setAppliedRange({ ...range })} />
      <h2>Результаты поиска:</h2>
      {loading ? (
        <Spinner className="align-self-center" animation="border" aria-label="Загрузка каталога" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : telescopes.length === 0 ? (
        <p className="text-center">Телескопы в этом диапазоне не найдены.</p>
      ) : (
        <div className="cards-grid">
          {telescopes.map((telescope) => <TelescopeCard key={telescope.id} telescope={telescope} />)}
        </div>
      )}
    </main>
  )
}
