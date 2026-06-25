import { useState, useEffect } from 'react'
import type { Landmark } from '../game/chapters'
import { Icon } from './icons'
import './reward.css'

// Всплывающая карточка достопримечательности (награда за каждые 5 уровней),
// с реальным фото из Википедии и крестиком для пропуска.
export function RewardPopup({ landmark, onClose }: { landmark: Landmark; onClose: () => void }) {
  const [img, setImg] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    const url = `https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(landmark.wiki)}`
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return
        setImg(d.originalimage?.source || d.thumbnail?.source || null)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [landmark.wiki])

  return (
    <div className="tip-overlay" onClick={onClose}>
      <div className="reward-pop" onClick={(e) => e.stopPropagation()}>
        <button className="reward-close" onClick={onClose} title="Пропустить">
          <Icon name="swap" s={16} />
        </button>
        <div className="reward-photo">
          {img ? (
            <img
              src={img}
              alt={landmark.name}
              onLoad={() => setLoaded(true)}
              onError={() => setImg(null)}
              style={{ opacity: loaded ? 1 : 0 }}
            />
          ) : null}
          {!img && <div className="reward-photo-fallback">{landmark.emoji}</div>}
          <span className="reward-badge">
            <Icon name="camera" s={14} /> Новая карточка России
          </span>
        </div>
        <div className="reward-pop-body">
          <div className="reward-pop-name">
            {landmark.emoji} {landmark.name}
          </div>
          <div className="reward-pop-region">
            <Icon name="pin" s={13} /> {landmark.region}
          </div>
          <p className="reward-pop-info">{landmark.info}</p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={onClose}>
            <Icon name="check" s={17} /> Забрать в коллекцию
          </button>
        </div>
      </div>
    </div>
  )
}
