import type { GameState, TerrainType } from '../game/types'
import { TERRAIN } from '../game/data'
import { Icon } from './icons'
import { TerrainScene } from './terrains'
import './journal.css'

const ORDER: TerrainType[] = ['plain', 'forest', 'water', 'swamp', 'mountains']

// Журнал открытых территорий: прогресс исследования карты по типам местности.
export function Journal({ state }: { state: GameState }) {
  const total = state.tiles.length
  const revealed = state.tiles.filter((t) => t.revealed).length
  const pct = total ? Math.round((revealed / total) * 100) : 0

  const counts = ORDER.map((terr) => {
    const all = state.tiles.filter((t) => t.terrain === terr)
    const open = all.filter((t) => t.revealed).length
    return { terr, open, all: all.length }
  })

  return (
    <div className="card journal">
      <div className="section-label">
        <Icon name="scroll" s={13} /> Журнал территорий · {revealed}/{total} ({pct}%)
      </div>
      <div className="journal-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="journal-list">
        {counts.map(({ terr, open, all }) => (
          <div key={terr} className={`journal-row ${open === 0 ? 'is-locked' : ''}`}>
            <span className="journal-mini">
              {open > 0 ? <TerrainScene terrain={terr} /> : <Icon name="eye" s={16} />}
            </span>
            <span className="journal-name">{TERRAIN[terr].name}</span>
            <span className="journal-count">
              {open}
              <span className="muted">/{all}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
