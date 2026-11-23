import { Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import heart from '../assets/heart_empty.svg'
import defaultImage from '../assets/telescope.png'
import type { Telescope } from '../modules/telescope'

interface Props {
  telescope: Telescope
  disabled?: boolean
  canDelete?: boolean
  onDelete: () => void
}

export function TelescopeCard({ telescope, disabled, canDelete, onDelete }: Props) {
  return (
    <Card as="article" className="telescope-card">
      <Card.Img
        className="card-telescope-image"
        src={telescope.image_url || defaultImage}
        alt={telescope.title}
        onError={({ currentTarget }) => {
          if (currentTarget.getAttribute('src') !== defaultImage) currentTarget.src = defaultImage
        }}
      />
      <h3>{telescope.title}</h3>
      <div className="card-likes">
        <img src={heart} alt="Лайки" />
        <p>{telescope.likes_count}</p>
      </div>
      <Link className="main-button" aria-disabled={disabled} onClick={(event) => { if (disabled) event.preventDefault() }} to={`/telescope-feed?id=${telescope.id}`}>Подробнее</Link>
      {canDelete && <Button variant="light" className="main-button" disabled={disabled} onClick={onDelete}>Удалить</Button>}
    </Card>
  )
}
