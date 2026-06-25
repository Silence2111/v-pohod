import type { GameState } from '../game/types'
import { evalQuest, questLabel, questIcon } from '../game/quests'
import { Icon } from './icons'
import './quests.css'

// Панель заданий уровня с галочками выполнения.
export function Quests({ state }: { state: GameState }) {
  if (!state.quests.length) return null
  const doneCount = state.quests.filter((q) => evalQuest(state, q).done).length

  return (
    <div className="card quests">
      <div className="section-label">
        <Icon name="target" s={13} /> Задания уровня · {doneCount}/{state.quests.length}
      </div>
      <div className="quest-list">
        {state.quests.map((q) => {
          const p = evalQuest(state, q)
          return (
            <div key={q.id} className={`quest-row ${p.done ? 'done' : ''}`}>
              <span className="quest-check">
                <Icon name={p.done ? 'check' : questIcon(q.kind)} s={15} />
              </span>
              <span className="quest-label">{questLabel(q)}</span>
              <span className="quest-prog">
                {p.done ? '✓' : `${Math.min(p.cur, p.target)}/${p.target}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
