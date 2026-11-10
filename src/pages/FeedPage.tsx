import { useEffect, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { FeedCard } from '../components/FeedCard'
import type { Telescope } from '../modules/telescope'
import { getFeedItem } from '../modules/telescopesApi'
import '../styles/feed.css'

export function FeedPage() {
  const [params] = useSearchParams()
  const idParam = params.get('id')
  const next = params.get('next') === 'true'
  const [telescope, setTelescope] = useState<Telescope | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const id = idParam === null ? null : Number(idParam)
    setLoading(true)
    setError('')
    if (id !== null && (!Number.isSafeInteger(id) || id < 1)) {
      setError('Некорректный ID телескопа.')
      setLoading(false)
      return
    }

    getFeedItem(id, next, controller.signal)
      .then((item) => {
        if (!controller.signal.aborted) setTelescope(item)
      })
      .catch((reason: Error) => {
        if (!controller.signal.aborted) setError(reason.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [idParam, next])

  return (
    <main className="feed-main">
      {loading ? (
        <Spinner className="align-self-center text-light" animation="border" aria-label="Загрузка ленты" />
      ) : error ? (
        <Alert className="align-self-center" variant="danger">{error}</Alert>
      ) : telescope ? (
        <FeedCard key={telescope.id} telescope={telescope} />
      ) : (
        <p className="align-self-center text-light">Карточка не найдена.</p>
      )}
    </main>
  )
}
