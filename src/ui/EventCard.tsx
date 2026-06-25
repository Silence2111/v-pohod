import { useEffect } from 'react'
import { EVENT_BY_ID } from '../game/events'
import { sfx } from './sound'
import { Icon } from './icons'

interface Props {
  eventId: string
  onChoose: (optionIndex: number) => void
}

// Случайное событие на тропе — модалка с выбором.
export function EventCard({ eventId, onChoose }: Props) {
  const ev = EVENT_BY_ID[eventId]
  useEffect(() => {
    if (ev) sfx.tip()
  }, [eventId])
  if (!ev) return null
  return (
    <div className="tip-overlay">
      <div className="tip-card" onClick={(e) => e.stopPropagation()}>
        <div className="tip-head">
          <span className="tip-badge" style={{ background: '#f1f5ec', borderColor: '#dde7d3', color: 'var(--sage-deep)' }}>
            <Icon name="sparkle" s={15} /> Событие
          </span>
          <span className="tip-terr">
            <Icon name={ev.icon} s={20} /> {ev.title}
          </span>
        </div>

        <p style={{ margin: '4px 0 14px', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
          {ev.text}
        </p>

        <div className="actions">
          {ev.options.map((opt, i) => (
            <button
              key={i}
              className={i === 0 ? 'btn-primary' : 'btn-secondary'}
              onClick={() => onChoose(i)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
