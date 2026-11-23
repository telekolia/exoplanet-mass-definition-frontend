import { useEffect } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { FeedCard } from '../components/FeedCard'
import { useAppDispatch, useAppSelector } from '../hooks'
import { selectBusy } from '../store'
import { clearActionError, getTelescopeFeed, likeTelescope } from '../slices/telescopesSlice'
import '../styles/feed.css'

export function FeedPage() {
  const [params] = useSearchParams()
  const idParam = params.get('id')
  const next = params.get('next') === 'true'
  const id = idParam === null ? null : Number(idParam)
  const invalidID = id !== null && (!Number.isSafeInteger(id) || id < 1)
  const dispatch = useAppDispatch()
  const { feed, feedError, feedLoading, feedMock, actionError } = useAppSelector((state) => state.telescopes)
  const { token, isAuthenticated } = useAppSelector((state) => state.user)
  const busy = useAppSelector(selectBusy)

  useEffect(() => { dispatch(clearActionError()) }, [dispatch, id, next])

  useEffect(() => {
    if (invalidID) return
    const request = dispatch(getTelescopeFeed({ id, next }))
    return () => request.abort()
  }, [dispatch, id, next, token, invalidID])

  return (
    <main className="feed-main">
      {invalidID || feedError ? (
        <Alert className="align-self-center" variant="danger">
          {invalidID ? 'Некорректный ID телескопа.' : feedError}
          {!invalidID && <Button variant="link" disabled={busy} onClick={() => dispatch(getTelescopeFeed({ id, next }))}>Повторить</Button>}
        </Alert>
      ) : feed ? (
        <>
          {feedMock && <div className="feed-notice" role="status">Сервис недоступен. Демонстрационная лента.</div>}
          {actionError && <Alert className="feed-error" variant="danger">{actionError}</Alert>}
          <FeedCard key={feed.id} telescope={feed} disabled={busy}
            canLike={isAuthenticated && !feedMock}
            onLike={() => dispatch(likeTelescope({ id: feed.id, like: feed.is_liked ? 0 : 1 }))} />
        </>
      ) : !feedLoading ? (
        <p className="align-self-center text-light">Карточка не найдена.</p>
      ) : null}
    </main>
  )
}
