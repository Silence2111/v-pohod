import { loadProfile } from '../game/profile'
import { LANDMARKS } from '../game/chapters'
import { BchpLogo } from './Logo'
import { Icon } from './icons'

export function CardsGallery({ onBack }: { onBack: () => void }) {
  const collected = new Set(loadProfile().cards)
  return (
    <div className="app">
      <div className="topbar">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="swap" s={15} /> Назад
        </button>
        <div className="brandmark">
          <BchpLogo sm />
          <span className="leaf">
            <Icon name="camera" s={20} />
          </span>
          <h1>Достопримечательности</h1>
        </div>
        <span style={{ width: 70 }} />
      </div>

      <div className="hint">
        <span className="ic">
          <Icon name="pin" s={18} />
        </span>
        Карточки мест России — награда за каждые 3 уровня. Собрано {collected.size} из{' '}
        {LANDMARKS.length}.
      </div>

      <div className="cards-grid">
        {LANDMARKS.map((lm) => {
          const got = collected.has(lm.id)
          return (
            <div key={lm.id} className={`lm-card ${got ? '' : 'locked'}`}>
              <div className="lm-emoji">{got ? lm.emoji : '❔'}</div>
              <div className="lm-body">
                <div className="lm-name">{got ? lm.name : 'Не открыто'}</div>
                <div className="lm-region">{got ? lm.region : '—'}</div>
                {got && <div className="lm-info">{lm.info}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
