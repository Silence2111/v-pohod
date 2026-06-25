import { useState } from 'react'
import type { MapSize, RoleId, Gender } from '../game/types'
import { ROLES, ROLE_ORDER, SIZES, PLAYER_COLORS, TERRAIN, WEATHER, ARTIFACTS } from '../game/data'
import type { PlayerConfig } from '../game/engine'
import { Icon } from './icons'

interface Props {
  daily?: boolean
  chapter?: boolean
  online?: boolean
  handoff: boolean
  onHandoffChange: (v: boolean) => void
  onStart: (players: PlayerConfig[], size: MapSize) => void
  onBack: () => void
}

export function Setup({ daily, chapter, online, handoff, onHandoffChange, onStart, onBack }: Props) {
  const [count, setCount] = useState(3)
  const [size, setSize] = useState<MapSize>('medium')
  const [names, setNames] = useState<string[]>(['', '', '', '', '', ''])
  const [roles, setRoles] = useState<RoleId[]>([...ROLE_ORDER])
  const [genders, setGenders] = useState<Gender[]>(['m', 'f', 'm', 'f', 'm', 'f'])
  const [showRules, setShowRules] = useState(false)

  const setRole = (playerIdx: number, role: RoleId, gender: Gender) => {
    setRoles((prev) => {
      const next = [...prev]
      const owner = next.findIndex((r, i) => r === role && i < count && i !== playerIdx)
      if (owner >= 0) next[owner] = next[playerIdx]
      next[playerIdx] = role
      return next
    })
    setGenders((prev) => {
      const next = [...prev]
      next[playerIdx] = gender
      return next
    })
  }

  const start = () => {
    const players: PlayerConfig[] = Array.from({ length: count }, (_, i) => ({
      name: names[i] || `Игрок ${i + 1}`,
      role: roles[i],
      gender: genders[i],
    }))
    onStart(players, daily ? 'medium' : size)
  }

  return (
    <div className="app">
      <div className="topbar">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="swap" s={15} /> В меню
        </button>
        <div className="brandmark">
          <span className="leaf">
            <Icon name={daily ? 'signpost' : 'boot'} s={20} />
          </span>
          <h1>{daily ? 'Поход дня' : 'Новый поход'}</h1>
        </div>
        <span style={{ width: 70 }} />
      </div>

      <div className="setup-grid">
        <div className="card">
          <div className="section-label">
            <Icon name="users" s={14} /> Сколько вас в команде?
          </div>
          <div className="size-row">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className={`chip ${count === n ? 'active' : ''}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>

          {!daily && !chapter && (
            <>
              <div className="section-label">
                <Icon name="map" s={14} /> Размер карты
              </div>
              <div className="size-row">
                {(Object.keys(SIZES) as MapSize[]).map((sz) => (
                  <button
                    key={sz}
                    className={`chip ${size === sz ? 'active' : ''}`}
                    onClick={() => setSize(sz)}
                  >
                    {SIZES[sz].name} · {SIZES[sz].cols}×{SIZES[sz].rows}
                  </button>
                ))}
              </div>
            </>
          )}
          {daily && (
            <p className="muted" style={{ marginTop: 10 }}>
              «Поход дня» — одна и та же карта для всех сегодня. Пройдите её на максимум звёзд!
            </p>
          )}

          {!online && (
            <>
              <div className="section-label">
                <Icon name="swap" s={14} /> Режим устройства
              </div>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={handoff}
                  onChange={(e) => onHandoffChange(e.target.checked)}
                />
                <span>Показывать экран передачи устройства между ходами</span>
              </label>
            </>
          )}
          {online && (
            <p className="muted" style={{ marginTop: 10 }}>
              Онлайн-режим: вы — хост. Настройте команду и начните — подключившиеся увидят игру и
              смогут ходить вместе с вами.
            </p>
          )}
        </div>

        <div className="card">
          <div className="section-label">
            <Icon name="heart" s={14} /> Игроки и роли
          </div>
          <div className="player-rows">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="player-block">
                <div className="player-row">
                  <span className="dot" style={{ background: PLAYER_COLORS[i] }}>
                    <Icon name={roles[i]} s={15} />
                  </span>
                  <input
                    placeholder={`Игрок ${i + 1}`}
                    value={names[i]}
                    onChange={(e) => {
                      const next = [...names]
                      next[i] = e.target.value
                      setNames(next)
                    }}
                  />
                </div>
                <div className="role-picker g12">
                  {ROLE_ORDER.flatMap((rid) =>
                    (['m', 'f'] as Gender[]).map((g) => {
                      const active = roles[i] === rid && genders[i] === g
                      return (
                        <button
                          key={rid + g}
                          className={`role-chip ${active ? 'active' : ''} ${g}`}
                          onClick={() => setRole(i, rid, g)}
                          title={`${ROLES[rid].name} (${g === 'm' ? 'мальчик' : 'девочка'})\n${ROLES[rid].passive}`}
                        >
                          <span className="rc-ic">
                            <Icon name={rid} s={18} />
                          </span>
                          <span className={`g-badge ${g}`}>{g === 'm' ? '♂' : '♀'}</span>
                          <small>{ROLES[rid].name}</small>
                        </button>
                      )
                    }),
                  )}
                </div>
                <div className="role-info">
                  <Icon name={roles[i]} s={14} />
                  <span>
                    <b>
                      {ROLES[roles[i]].name} · {genders[i] === 'm' ? 'мальчик' : 'девочка'}
                    </b>{' '}
                    — {ROLES[roles[i]].passive}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            У каждой роли — 1 постоянное + 1 особое действие. Победа командная: важна синергия, а не
            гонка.
          </p>
        </div>

        <div className="flex wrap center">
          <button className="btn-primary" onClick={start}>
            <Icon name="boot" s={18} /> В поход!
          </button>
          <button className="btn-secondary" onClick={() => setShowRules((v) => !v)}>
            <Icon name="scroll" s={16} /> {showRules ? 'Скрыть правила' : 'Как играть'}
          </button>
        </div>

        {showRules && <RulesCard />}
      </div>
    </div>
  )
}

function RulesCard() {
  return (
    <div className="card">
      <div className="section-label">
        <Icon name="target" s={14} /> Цель
      </div>
      <p style={{ marginTop: 0 }}>
        Командой пройдите от <b>Базы</b> через <b>Промежуточную цель</b> к <b>Главной цели</b>.
        Проигрыша нет — в конце команда получает 1–3 звезды и «историю похода».
      </p>

      <div className="section-label">
        <Icon name="dice" s={14} /> Ход-цикл (максимум 2 броска)
      </div>
      <ol>
        <li>Бросок погоды на раунд — общий для всех.</li>
        <li>
          Каждый по очереди: (опц.) способность роли → бросок шага → движение → помощь товарищу.
        </li>
        <li>Сходили все → новая погода.</li>
      </ol>

      <div className="section-label">Местности</div>
      <div className="legend">
        {Object.values(TERRAIN).map((t) => (
          <span key={t.id} className={`lg ${t.hard ? 'hard' : ''}`} title={t.desc}>
            <span className="li">
              <Icon name={t.id} s={16} />
            </span>
            {t.name}
          </span>
        ))}
      </div>

      <div className="section-label">Погода</div>
      <div className="legend">
        {Object.values(WEATHER).map((w) => (
          <span key={w.id} className="lg" title={w.desc}>
            <span className="li">
              <Icon name={w.id} s={16} />
            </span>
            {w.name}
          </span>
        ))}
      </div>

      <div className="section-label">Артефакты</div>
      <div className="legend">
        {Object.values(ARTIFACTS).map((art) => (
          <span key={art.id} className="lg" title={art.desc}>
            <span className="li">
              <Icon name={art.id} s={16} />
            </span>
            {art.name}
          </span>
        ))}
      </div>
    </div>
  )
}
