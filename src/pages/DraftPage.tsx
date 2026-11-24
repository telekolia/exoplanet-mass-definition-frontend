import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks'
import { useFileURL } from '../modules/useFileURL'
import {
  createTelescopeDraft,
  getTelescopeDraft,
  publishTelescopeDraft,
  setDraftError,
  setDraftFields,
  setDraftTitle,
} from '../slices/draftSlice'
import { clearActionError, deleteTelescope } from '../slices/telescopesSlice'
import { selectBusy } from '../store'
import defaultImage from '../assets/telescope.png'
import defaultVideo from '../assets/default-video.mp4'
import '../styles/draft.css'

export function DraftPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAppSelector((state) => state.user)
  const { item, title, fields, loaded, error } = useAppSelector((state) => state.draft)
  const actionError = useAppSelector((state) => state.telescopes.actionError)
  const busy = useAppSelector(selectBusy)
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const imagePreview = useFileURL(image)
  const videoPreview = useFileURL(video)

  useEffect(() => {
    dispatch(clearActionError())
  }, [dispatch])

  useEffect(() => {
    if (!isAuthenticated) return
    const request = dispatch(getTelescopeDraft())
    return () => request.abort()
  }, [dispatch, token, isAuthenticated])

  useEffect(() => {
    if (item) {
      setImage(null)
      setVideo(null)
    }
  }, [item?.id])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (item) {
      const result = await dispatch(publishTelescopeDraft())
      if (publishTelescopeDraft.fulfilled.match(result)) navigate('/telescope-tile')
      return
    }
    if (
      image &&
      (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(image.type) ||
        image.size > 5 * 1024 * 1024)
    ) {
      dispatch(setDraftError('Выберите JPEG, PNG, GIF или WebP размером до 5 МиБ.'))
      return
    }
    if (
      video &&
      (!['video/mp4', 'video/webm'].includes(video.type) || video.size > 50 * 1024 * 1024)
    ) {
      dispatch(setDraftError('Выберите MP4 или WebM размером до 50 МиБ.'))
      return
    }
    await dispatch(
      createTelescopeDraft({ title, ...(image ? { image } : {}), ...(video ? { video } : {}) }),
    )
  }

  async function remove() {
    if (!item || busy) return
    const result = await dispatch(deleteTelescope(item.id))
    if (deleteTelescope.fulfilled.match(result)) {
      setImage(null)
      setVideo(null)
    }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!loaded)
    return (
      <main className="draft-main">
        <h2>Добавление</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button
          className="main-button"
          variant="light"
          disabled={busy}
          onClick={() => dispatch(getTelescopeDraft())}
        >
          Повторить
        </Button>
      </main>
    )

  return (
    <>
      <Form id="draft-form" onSubmit={submit} hidden />
      <main className="draft-main">
        <h2>{item ? 'Публикация черновика' : 'Создание'}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {actionError && <Alert variant="danger">{actionError}</Alert>}
        <h3>Предпросмотр медиа</h3>
        <div className="input-container">
          <img
            className="preview__content"
            src={imagePreview || item?.image_url || defaultImage}
            alt={title || 'Изображение по умолчанию'}
            onError={({ currentTarget }) => {
              if (currentTarget.getAttribute('src') !== defaultImage)
                currentTarget.src = defaultImage
            }}
          />
          <video
            className="preview__content"
            autoPlay
            muted
            loop
            playsInline
            controls
            src={videoPreview || item?.video_url || defaultVideo}
            onError={({ currentTarget }) => {
              if (currentTarget.getAttribute('src') !== defaultVideo)
                currentTarget.src = defaultVideo
            }}
          />
        </div>
        <h3>Заголовки</h3>
        <div className="input-container">
          <label htmlFor="draft-title">Название</label>
          <Form.Control
            id="draft-title"
            form="draft-form"
            value={title}
            maxLength={127}
            required
            readOnly={Boolean(item)}
            disabled={busy}
            onChange={(event) => dispatch(setDraftTitle(event.target.value))}
          />
          {item && (
            <>
              <label htmlFor="draft-description">Описание</label>
              <Form.Control
                id="draft-description"
                as="textarea"
                form="draft-form"
                value={fields.description}
                maxLength={255}
                required
                rows={3}
                disabled={busy}
                onChange={(event) => dispatch(setDraftFields({ description: event.target.value }))}
              />
            </>
          )}
        </div>
        {!item && (
          <>
            <h3>Загрузка медиа</h3>
            <div className="input-container">
              <label htmlFor="draft-image">Изображение</label>
              <Form.Control
                id="draft-image"
                type="file"
                form="draft-form"
                accept="image/jpeg,image/png,image/gif,image/webp"
                disabled={busy}
                onChange={(event) =>
                  setImage((event.target as HTMLInputElement).files?.[0] ?? null)
                }
              />
              <label htmlFor="draft-video">Видео</label>
              <Form.Control
                id="draft-video"
                type="file"
                form="draft-form"
                accept="video/mp4,video/webm"
                disabled={busy}
                onChange={(event) =>
                  setVideo((event.target as HTMLInputElement).files?.[0] ?? null)
                }
              />
            </div>
          </>
        )}
        {item && (
          <>
            <h3>Поля по теме</h3>
            <div className="input-container">
              <label htmlFor="draft-latitude">Широта</label>
              <Form.Control
                id="draft-latitude"
                form="draft-form"
                type="number"
                min={-90}
                max={90}
                step={0.0001}
                value={fields.latitude}
                required
                disabled={busy}
                onChange={(event) => dispatch(setDraftFields({ latitude: event.target.value }))}
              />
              <label htmlFor="draft-longitude">Долгота</label>
              <Form.Control
                id="draft-longitude"
                form="draft-form"
                type="number"
                min={-180}
                max={180}
                step={0.0001}
                value={fields.longitude}
                required
                disabled={busy}
                onChange={(event) => dispatch(setDraftFields({ longitude: event.target.value }))}
              />
            </div>
          </>
        )}
        <div className="input-container">
          <Button
            variant="light"
            className="main-button"
            type="submit"
            form="draft-form"
            disabled={busy || !title.trim()}
          >
            {item ? 'Опубликовать' : 'Далее'}
          </Button>
          {item && (
            <Button variant="light" className="main-button" disabled={busy} onClick={remove}>
              Удалить
            </Button>
          )}
        </div>
      </main>
    </>
  )
}
