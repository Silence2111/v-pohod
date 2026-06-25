import { useState } from 'react'
import type { GameState, CardId, ArtifactId } from '../game/types'
import { ROLES, ARTIFACTS, CARDS } from '../game/data'
import { Icon } from './icons'

export interface Actions {
  rollStep: () => void
  scoutMarch: () => void
  explorerToggle: () => void
  requestExplorerReveal: () => void
  campSpecial: () => void
  impressionsSpecial: () => void
  requestCampRemove: () => void
  requestAtmosphereBoost: () => void
  requestAtmosphereCleanse: () => void
  requestRescuerRemove: () => void
  requestRescuerMove: () => void
  startTrade: (artifact: ArtifactId) => void
  playCard: (card: CardId) => void
  resolvePlayerTarget: (id: number) => void
  rerollWeather: () => void
  cancelPending: () => void
  endTurn: () => void
}

export function Panel({ state, a }: { state: GameState; a: Actions }) {
  const p = state.players[state.current]
  const role = ROLES[p.role]
  const t = state.turn
  const pend = state.pending
  const wSup = state.weatherSuppressed
  const [rolling, setRolling] = useState(false)

  const roll = () => {
    setRolling(true)
    setTimeout(() => setRolling(false), 500)
    a.rollStep()
  }

  return (
    <div className="panel">
      {pend && <PendingHint state={state} a={a} />}

      <div className="card current-player" style={{ ['--accent' as string]: p.color }}>
        <div className="cp-head">
          <span className="cp-avatar" style={{ background: p.color }}>
            <Icon name={p.role} s={26} />
          </span>
          <div>
            <div className="cp-name" style={{ color: p.color }}>
              {p.name}
            </div>
            <div className="cp-role">
              {role.name} · {p.gender === 'm' ? '♂' : '♀'} · {role.motto}
            </div>
          </div>
        </div>

        <div className="move-points">
          {t.rolled ? (
            <>
              <span className="mp-num">{t.lastRoll}</span>
              <span className="mp-label">
                выпало
                <br />
                на кубике
              </span>
              <span className="mp-dice">
                {t.moved ? 'ход сделан' : 'идите на плитку ≤ броска'}
              </span>
            </>
          ) : (
            <>
              <span className="mp-num" style={{ color: 'var(--muted)' }}>
                ?
              </span>
              <span className="mp-label" style={{ flex: 1 }}>
                бросьте кубик,
                <br />
                чтобы пойти
              </span>
            </>
          )}
        </div>

        <div className="stat-row">
          {p.fatigue > 0 && (
            <span className="badge warn">
              <Icon name="tired" s={13} /> усталость {p.fatigue}
            </span>
          )}
          {p.boost > 0 && (
            <span className="badge good">
              <Icon name="sparkle" s={13} /> бонус +{p.boost}
            </span>
          )}
          <span className="badge">
            <Icon name="star" s={13} /> заряды: {p.specialCharges}
          </span>
          {p.visitedIntermediate && (
            <span className="badge good">
              <Icon name="intermediate" s={13} /> на цели
            </span>
          )}
        </div>

        {p.artifacts.length > 0 && (
          <>
            <div className="section-label">
              <Icon name="backpack" s={13} /> Снаряжение
            </div>
            <div className="artifact-chips">
              {p.artifacts.map((art, i) => (
                <button
                  key={i}
                  className="artifact-chip"
                  title={`${ARTIFACTS[art].desc}\nНажмите, чтобы передать товарищу`}
                  onClick={() => a.startTrade(art)}
                >
                  <Icon name={art} s={14} /> {ARTIFACTS[art].name} <Icon name="swap" s={12} />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="section-label">
          <Icon name="boot" s={13} /> Ход
        </div>
        <div className="actions">
          {!t.rolled && (
            <button className="btn-primary" onClick={roll}>
              <Icon name="dice" s={18} className={rolling ? 'dice-rolling' : ''} /> Бросок шага
            </button>
          )}

          {p.role === 'scout' && (
            <button
              className="btn-secondary"
              disabled={p.specialCharges <= 0 || t.scoutMarchUsed}
              onClick={a.scoutMarch}
            >
              <Icon name="boot" s={16} /> Быстрый марш (доп. шаг)
              {p.specialCharges <= 0 ? ' — использован' : ''}
            </button>
          )}
          {p.role === 'explorer' && (
            <>
              <button
                className={`btn-secondary ${t.ignoreDifficult ? 'on' : ''}`}
                onClick={a.explorerToggle}
              >
                <Icon name="rock" s={16} /> Игнор сложной местности: {t.ignoreDifficult ? 'ВКЛ' : 'выкл'}
              </button>
              <button
                className="btn-secondary"
                disabled={p.specialCharges <= 0}
                onClick={a.requestExplorerReveal}
              >
                <Icon name="eye" s={16} /> Разведка карты{p.specialCharges <= 0 ? ' — использовано' : ''}
              </button>
            </>
          )}
          {p.role === 'campKeeper' && (
            <>
              <button className="btn-secondary" disabled={t.passiveHelpUsed} onClick={a.requestCampRemove}>
                <Icon name="camp" s={16} /> Снять усталость (любому)
              </button>
              <button className="btn-secondary" disabled={p.specialCharges <= 0 || wSup} onClick={a.campSpecial}>
                <Icon name="cup" s={16} /> Тёплый привал (отменить погоду)
              </button>
            </>
          )}
          {p.role === 'atmosphereKeeper' && (
            <>
              <button className="btn-secondary" disabled={t.passiveHelpUsed} onClick={a.requestAtmosphereBoost}>
                <Icon name="music" s={16} /> +1 к шагу товарищу
              </button>
              <button className="btn-secondary" disabled={p.specialCharges <= 0} onClick={a.requestAtmosphereCleanse}>
                <Icon name="sparkle" s={16} /> Снять негатив ({p.specialCharges})
              </button>
            </>
          )}
          {p.role === 'impressionsKeeper' && (
            <button
              className="btn-secondary"
              disabled={p.specialCharges <= 0 || state.storyTokens < 5}
              onClick={a.impressionsSpecial}
            >
              <Icon name="camera" s={16} /> Памятный кадр (5 жетонов)
            </button>
          )}
          {p.role === 'rescuer' && (
            <>
              <button className="btn-secondary" disabled={t.passiveHelpUsed} onClick={a.requestRescuerRemove}>
                <Icon name="bandage" s={16} /> Снять серьёзный штраф
              </button>
              <button className="btn-secondary" disabled={p.specialCharges <= 0} onClick={a.requestRescuerMove}>
                <Icon name="rescuer" s={16} /> Спасательная операция
              </button>
            </>
          )}

          {state.weatherRerolls > 0 && (
            <button className="btn-secondary" onClick={a.rerollWeather} title="Доступно после перевала">
              <Icon name="cloudy" s={16} /> Перебросить погоду ({state.weatherRerolls})
            </button>
          )}

          <button className="btn-sage" onClick={a.endTurn}>
            <Icon name="check" s={18} /> Завершить ход
          </button>
        </div>

        {state.commandCards.length > 0 && (
          <>
            <div className="section-label">
              <Icon name="cohesion" s={13} /> Командные карты
            </div>
            <div className="cmd-cards">
              {dedupeCards(state.commandCards).map(({ card, n }) => (
                <button key={card} className="cmd-card" title={CARDS[card].desc} onClick={() => a.playCard(card)}>
                  <span className="ci">
                    <Icon name={card} s={18} />
                  </span>
                  <span>
                    {CARDS[card].name}
                    {n > 1 ? ` ×${n}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Команда + совместная задача */}
      <div className="card">
        <div className="section-label">
          <Icon name="users" s={13} /> Команда
          <span style={{ marginLeft: 'auto', color: 'var(--amber)', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <Icon name="camera" s={13} /> {state.storyTokens}
          </span>
        </div>

        <div className={`task-banner ${state.jointTaskDone ? 'done' : ''}`} style={{ marginBottom: 10 }}>
          <span className="ti">
            <Icon name={state.jointTaskDone ? 'check' : 'puzzle'} s={16} />
          </span>
          {state.jointTaskDone
            ? 'Совместная задача выполнена!'
            : 'Задача: доставьте артефакт на Промежуточную цель.'}
        </div>

        <div className="players-mini">
          {state.players.map((pl) => {
            const isTarget = !!pend && canTarget(state, pl.id)
            return (
              <div
                key={pl.id}
                className={`pm-row ${pl.id === state.current ? 'active' : ''} ${isTarget ? 'target' : ''}`}
                onClick={() => isTarget && a.resolvePlayerTarget(pl.id)}
              >
                <span className="dot" style={{ background: pl.color, width: 22, height: 22 }}>
                  <Icon name={pl.role} s={12} />
                </span>
                <span className="pm-name">{pl.name}</span>
                <span className="pm-role">{ROLES[pl.role].name}</span>
                <span className="pm-status">
                  {pl.fatigue > 0 && <Icon name="tired" s={13} />}
                  {pl.boost > 0 && <Icon name="sparkle" s={13} />}
                  {pl.visitedIntermediate && <Icon name="intermediate" s={13} />}
                  {pl.artifacts.length > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Icon name="backpack" s={13} />
                      {pl.artifacts.length}
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="section-label">
          <Icon name="scroll" s={13} /> Журнал похода
        </div>
        <div className="log">
          {[...state.log]
            .slice(-40)
            .reverse()
            .map((e, i) => (
              <div key={i} className={`log-entry ${e.highlight ? 'hl' : ''}`}>
                <span className="r">Р{e.round}</span>
                <span className="em">{e.icon}</span>
                <span>{e.text}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function dedupeCards(cards: CardId[]): { card: CardId; n: number }[] {
  const counts = new Map<CardId, number>()
  for (const c of cards) counts.set(c, (counts.get(c) || 0) + 1)
  return [...counts.entries()].map(([card, n]) => ({ card, n }))
}

function canTarget(state: GameState, id: number): boolean {
  const pend = state.pending
  if (!pend) return false
  const cur = state.current
  switch (pend.kind) {
    case 'campRemoveFatigue':
    case 'rescuerRemove':
    case 'atmosphereCleanse':
    case 'rescuerMove':
      return true
    case 'atmosphereBoost':
    case 'trade':
      return id !== cur
    default:
      return false
  }
}

function PendingHint({ state, a }: { state: GameState; a: Actions }) {
  const pend = state.pending!
  const map: Record<string, string> = {
    explorerReveal: 'Выберите закрытую плитку на карте, чтобы открыть её.',
    campRemoveFatigue: 'Выберите игрока, чтобы снять усталость.',
    atmosphereBoost: 'Выберите другого игрока для +1 к шагу.',
    atmosphereCleanse: 'Выберите игрока, чтобы снять негатив.',
    rescuerRemove: 'Выберите игрока, чтобы снять серьёзный штраф.',
    rescuerMove: 'Выберите игрока, которого нужно переместить.',
    rescuerMoveTarget: 'Выберите соседнюю клетку на карте.',
    trade: `Передать ${'artifact' in pend ? ARTIFACTS[pend.artifact].name : ''}: выберите товарища.`,
  }
  return (
    <div className="hint action">
      <span className="flex" style={{ gap: 10 }}>
        <span className="ic">
          <Icon name="target" s={18} />
        </span>
        {map[pend.kind]}
      </span>
      <button className="btn-ghost" onClick={a.cancelPending}>
        Отмена
      </button>
    </div>
  )
}
