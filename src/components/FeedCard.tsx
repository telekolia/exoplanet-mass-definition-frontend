import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import arrow from '../assets/arrow.svg'
import heart from '../assets/heart_empty.svg'
import defaultImage from '../assets/telescope.png'
import defaultVideo from '../assets/default-video.mp4'
import type { Telescope } from '../modules/telescope'

export function FeedCard({ telescope }: { telescope: Telescope }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="feed-card">
      <video
        className="feed-card__video"
        autoPlay muted loop playsInline
        src={telescope.video_url || defaultVideo}
        poster={telescope.image_url || defaultImage}
        onError={({ currentTarget }) => {
          currentTarget.poster = defaultImage
          if (currentTarget.getAttribute('src') !== defaultVideo) currentTarget.src = defaultVideo
        }}
      />
      <div className="feed-card__overlay">
        <div className="feed-card__info">
          <h2 className="feed-card__title">{telescope.title}</h2>
          <p className={expanded ? 'feed-card__desc feed-card__desc--expanded' : 'feed-card__desc'}>{telescope.description}</p>
          {telescope.description && (
            <Button variant="link" className="feed-card__more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Свернуть' : 'Ещё'}
            </Button>
          )}
        </div>
        <aside className="feed-card__actions">
          <div>
            <p className="feed-card__actions__solo-text">широта:</p>
            <div className="feed-card__actions__box"><p>{telescope.latitude}</p></div>
          </div>
          <div>
            <p className="feed-card__actions__solo-text">долгота:</p>
            <div className="feed-card__actions__box"><p>{telescope.longitude}</p></div>
          </div>
          <div>
            <div className="feed-card__actions__box"><img src={heart} alt="Лайки" /></div>
            <p className="feed-card__actions__solo-text feed-card__actions__likes-amount">{telescope.likes_count}</p>
          </div>
          <Link className="feed-card__actions__next" to={`/telescope-feed?id=${telescope.id}&next=true`} aria-label="Следующий телескоп">
            <img src={arrow} alt="" />
          </Link>
        </aside>
      </div>
    </article>
  )
}
