import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import heart from '../assets/heart_empty.svg'
import defaultImage from '../assets/telescope.png'
import type { Telescope } from '../modules/telescope'

export function TelescopeCard({ telescope }: { telescope: Telescope }) {
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
      <Link className="main-button" to={`/telescope-feed?id=${telescope.id}`}>Подробнее</Link>
    </Card>
  )
}
