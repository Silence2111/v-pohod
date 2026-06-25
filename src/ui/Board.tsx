import type { GameState } from '../game/types'
import { TERRAIN } from '../game/data'
import { checkMove, effectiveThreshold } from '../game/engine'
import { neighbors } from '../game/map'
import { Icon } from './icons'
import { Dice } from './Dice'
import { TerrainScene } from './terrains'

interface Props {
  state: GameState
  onTileClick: (index: number) => void
  onRoll?: () => void
}

const KIND_LABEL: Record<string, string> = {
  base: 'База',
  intermediate: 'Цель',
  main: 'Финиш',
}

export function Board({ state, onTileClick, onRoll }: Props) {
  const cur = state.players[state.current]
  const pend = state.pending

  const reachable = new Set<number>()
  const selectable = new Set<number>()

  if (state.phase === 'turn' && !pend) {
    for (const nb of neighbors(cur.pos, state.cols, state.rows)) {
      if (checkMove(state, nb).ok) reachable.add(nb)
    }
  }
  if (pend?.kind === 'explorerReveal') {
    state.tiles.forEach((t) => {
      if (!t.revealed) selectable.add(t.index)
    })
  }
  if (pend?.kind === 'rescuerMoveTarget') {
    const moved = state.players[pend.playerId]
    for (const nb of neighbors(moved.pos, state.cols, state.rows)) selectable.add(nb)
  }

  const handle = (i: number) => {
    if (reachable.has(i) || selectable.has(i)) onTileClick(i)
  }

  return (
    <div className="board-wrap">
      {state.phase === 'turn' && (
        <Dice
          key={`${state.round}-${state.current}-${state.turn.rolled}-${state.turn.lastRoll}`}
          value={state.turn.lastRoll}
          rolled={state.turn.rolled}
          onRoll={onRoll}
        />
      )}
      <div className="board" style={{ gridTemplateColumns: `repeat(${state.cols}, 1fr)` }}>
        {state.tiles.map((t) => {
          const ter = TERRAIN[t.terrain]
          const isReach = reachable.has(t.index)
          const isSel = selectable.has(t.index)
          const occupants = state.players.filter((p) => p.pos === t.index)
          const isAdjacent =
            state.phase === 'turn' &&
            !pend &&
            neighbors(cur.pos, state.cols, state.rows).includes(t.index)
          const showTh = t.revealed && isAdjacent ? effectiveThreshold(state, cur, t.index) : null

          return (
            <div
              key={t.index}
              className={[
                'tile',
                t.revealed ? '' : 'closed',
                t.kind !== 'normal' && t.revealed ? 'special' : '',
                isReach ? 'reachable' : '',
                isSel ? 'selectable' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={t.revealed ? { background: ter.bg } : undefined}
              onClick={() => handle(t.index)}
              title={t.revealed ? `${ter.name} — ${ter.desc}` : 'Закрытая плитка'}
            >
              {t.revealed ? (
                <>
                  <TerrainScene terrain={t.terrain} />
                  {t.kind !== 'normal' && (
                    <span className="kind-badge">
                      <Icon name={t.kind} s={22} />
                    </span>
                  )}
                  {t.kind !== 'normal' && <span className="kind-flag">{KIND_LABEL[t.kind]}</span>}
                  {t.artifact && (
                    <span className="artifact-mark">
                      <Icon name={t.artifact} s={13} />
                    </span>
                  )}
                  {showTh !== null && (
                    <span className={`cost-mark ${isReach ? 'ok' : 'no'}`}>{showTh}+</span>
                  )}
                </>
              ) : (
                <Icon name="eye" s={16} style={{ opacity: 0.28 }} />
              )}

              {occupants.length > 0 && (
                <div className="pawns">
                  {occupants.map((p) => (
                    <div
                      key={p.id}
                      className={`pawn ${p.id === state.current && state.phase === 'turn' ? 'me' : ''}`}
                      style={{ background: p.color }}
                      title={p.name}
                    >
                      <Icon name={p.role} s={13} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
