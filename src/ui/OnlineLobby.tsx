import { useState } from 'react'
import { Icon } from './icons'
import { BchpLogo } from './Logo'
import { sfx } from './sound'

interface Props {
  onBack: () => void
  onCreateRoom: () => void
  onJoinRoom: (code: string) => void
  onStartHost: () => void
  hostCode: string | null
  peers: number
  guestStatus: string | null
}

const STATUS_TEXT: Record<string, string> = {
  connecting: 'Подключение к комнате…',
  connected: 'Подключено! Ожидаем старта от хоста…',
  closed: 'Соединение закрыто.',
  error: 'Не удалось подключиться. Проверьте код и интернет.',
}

export function OnlineLobby({
  onBack,
  onCreateRoom,
  onJoinRoom,
  onStartHost,
  hostCode,
  peers,
  guestStatus,
}: Props) {
  const [mode, setMode] = useState<'choose' | 'host' | 'guest'>('choose')
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!hostCode) return
    try {
      await navigator.clipboard.writeText(hostCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="app">
      <div className="topbar">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="swap" s={15} /> В меню
        </button>
        <div className="brandmark">
          <BchpLogo sm />
          <span className="leaf">
            <Icon name="wifi" s={20} />
          </span>
          <h1>Игра с друзьями</h1>
        </div>
        <span style={{ width: 70 }} />
      </div>

      {mode === 'choose' && (
        <div className="menu-buttons" style={{ marginTop: 8 }}>
          <button
            className="menu-btn primary"
            onClick={() => {
              sfx.click()
              setMode('host')
              onCreateRoom()
            }}
          >
            <Icon name="plus" s={26} />
            <span>
              <b>Создать комнату</b>
              <small>Вы — ведущий, остальные подключаются по коду</small>
            </span>
          </button>
          <button
            className="menu-btn"
            onClick={() => {
              sfx.click()
              setMode('guest')
            }}
          >
            <Icon name="wifi" s={26} />
            <span>
              <b>Войти по коду</b>
              <small>Подключиться к комнате друга</small>
            </span>
          </button>
        </div>
      )}

      {mode === 'host' && (
        <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <Icon name="wifi" s={14} /> Код комнаты
          </div>
          {hostCode ? (
            <>
              <div className="room-code">{hostCode}</div>
              <div className="flex wrap center" style={{ marginBottom: 10 }}>
                <button className="btn-secondary" onClick={copy}>
                  <Icon name={copied ? 'check' : 'copy'} s={16} /> {copied ? 'Скопировано' : 'Скопировать код'}
                </button>
              </div>
              <p className="muted">
                Подключено игроков: <b>{peers}</b>. Передайте код друзьям, дождитесь подключения и
                начинайте.
              </p>
              <button className="btn-primary" style={{ marginTop: 8 }} onClick={onStartHost}>
                <Icon name="boot" s={18} /> Настроить и начать
              </button>
            </>
          ) : (
            <p className="muted">Создаём комнату…</p>
          )}
        </div>
      )}

      {mode === 'guest' && (
        <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <Icon name="wifi" s={14} /> Код комнаты
          </div>
          {!guestStatus ? (
            <>
              <input
                className="code-input"
                placeholder="КОД"
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 12 }}
                  disabled={code.trim().length < 4}
                  onClick={() => {
                    sfx.click()
                    onJoinRoom(code.trim())
                  }}
                >
                  <Icon name="wifi" s={18} /> Подключиться
                </button>
              </div>
            </>
          ) : (
            <p className="muted" style={{ fontSize: 15 }}>
              {STATUS_TEXT[guestStatus] ?? guestStatus}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
