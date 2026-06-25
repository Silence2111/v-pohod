import { useEffect } from 'react'
import { TIPS } from '../game/bridge'
import { sfx } from './sound'
import { Icon } from './icons'

interface Props {
  tipId: string
  onClose: () => void
}

// Контекстная подсказка «в игре → в жизни» — мостик к реальному походу.
export function TipCard({ tipId, onClose }: Props) {
  const tip = TIPS[tipId]
  useEffect(() => {
    if (tip) sfx.tip()
  }, [tipId])
  if (!tip) return null
  return (
    <div className="tip-overlay" onClick={onClose}>
      <div className="tip-card" onClick={(e) => e.stopPropagation()}>
        <div className="tip-head">
          <span className="tip-badge">
            <Icon name="bulb" s={15} /> В игре → в жизни
          </span>
          <span className="tip-terr">
            <Icon name={tip.icon} s={20} /> {tip.title}
          </span>
        </div>

        <div className="tip-line game">
          <span className="tl-label">
            <Icon name="dice" s={14} /> В игре
          </span>
          <span>{tip.game}</span>
        </div>
        <div className="tip-line real">
          <span className="tl-label">
            <Icon name="boot" s={14} /> В жизни
          </span>
          <span>{tip.real}</span>
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={onClose}>
          <Icon name="check" s={17} /> Понятно
        </button>
      </div>
    </div>
  )
}
