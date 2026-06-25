import { useState } from 'react'
import { isMuted, toggleMuted } from './sound'
import { loadProfile } from '../game/profile'
import { ACHIEVEMENTS, ACHV_BY_ID } from '../game/achievements'
import { todayKey } from '../game/rng'
import { BCHP_URL, BCHP_NAME } from '../game/bridge'
import { SceneHero, Mascot } from './illustrations'
import { Icon } from './icons'

interface Props {
  onPlay: () => void
  onDaily: () => void
  onOnline: () => void
  onTutorial: () => void
}

export function Menu({ onPlay, onDaily, onOnline, onTutorial }: Props) {
  const profile = loadProfile()
  const today = todayKey()
  const todayDone = !!profile.daily[today]
  const [tab, setTab] = useState<'none' | 'rules' | 'mission' | 'achv'>(() =>
    typeof window !== 'undefined' && window.location.search.includes('tab=achv') ? 'achv' : 'none',
  )
  const [muted, setMutedState] = useState(isMuted())

  const dailyDates = Object.values(profile.daily)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="app">
      <div className="title">
        <div className="brandmark">
          <span className="leaf">
            <Icon name="boot" s={26} />
          </span>
          <h1>
            В Поход<span className="bang">!</span>
          </h1>
        </div>
        <div className="sub">Кооперативная игра-путешествие · «{BCHP_NAME}»</div>
        <button
          className="sound-toggle"
          title={muted ? 'Включить звук' : 'Выключить звук'}
          onClick={() => setMutedState(toggleMuted())}
        >
          <Icon name={muted ? 'mute' : 'sound'} s={18} />
        </button>
      </div>

      {/* Иллюстрация-герой */}
      <div className="hero-banner">
        <SceneHero style={{ width: '100%', height: '100%' }} />
        <div className="hero-mascot">
          <Mascot s={104} />
        </div>
      </div>

      {/* Профиль */}
      <div className="card profile-card">
        <div className="profile-stats">
          <div className="pstat">
            <span className="pstat-num">{profile.games}</span>
            <span className="pstat-label">походов</span>
          </div>
          <div className="pstat">
            <span className="pstat-num">{profile.bestStars}/3</span>
            <span className="pstat-label">лучший результат</span>
          </div>
          <div className="pstat">
            <span className="pstat-num">
              {profile.achievements.length}/{ACHIEVEMENTS.length}
            </span>
            <span className="pstat-label">значков</span>
          </div>
        </div>
      </div>

      {/* Главные кнопки */}
      <div className="menu-buttons">
        <button className="menu-btn primary wide" onClick={onPlay}>
          <span className="mb-ic">
            <Icon name="boot" s={26} />
          </span>
          <span>
            <b>Играть</b>
            <small>Кооператив 2–6 игроков · карта глав</small>
          </span>
        </button>
        <button className="menu-btn" onClick={onDaily}>
          <span className="mb-ic">
            <Icon name="signpost" s={24} />
          </span>
          <span>
            <b>Поход дня</b>
            <small>{todayDone ? 'Пройден сегодня — улучшите результат' : 'Одна карта для всех'}</small>
          </span>
        </button>
        <button className="menu-btn" onClick={onOnline}>
          <span className="mb-ic">
            <Icon name="wifi" s={24} />
          </span>
          <span>
            <b>Игра с друзьями</b>
            <small>Онлайн-кооператив по коду комнаты</small>
          </span>
        </button>
        <button className={`menu-btn ${tab === 'achv' ? 'on' : ''}`} onClick={() => setTab(tab === 'achv' ? 'none' : 'achv')}>
          <span className="mb-ic">
            <Icon name="starFill" s={24} />
          </span>
          <span>
            <b>Достижения</b>
            <small>{profile.achievements.length} из {ACHIEVEMENTS.length}</small>
          </span>
        </button>
        <button className="menu-btn" onClick={onTutorial}>
          <span className="mb-ic">
            <Icon name="bulb" s={24} />
          </span>
          <span>
            <b>Обучение</b>
            <small>Интерактивный тур за минуту</small>
          </span>
        </button>
        <button className={`menu-btn ${tab === 'rules' ? 'on' : ''}`} onClick={() => setTab(tab === 'rules' ? 'none' : 'rules')}>
          <span className="mb-ic">
            <Icon name="scroll" s={24} />
          </span>
          <span>
            <b>Правила</b>
            <small>Полный справочник</small>
          </span>
        </button>
        <button className={`menu-btn ${tab === 'mission' ? 'on' : ''}`} onClick={() => setTab(tab === 'mission' ? 'none' : 'mission')}>
          <span className="mb-ic">
            <Icon name="heart" s={24} />
          </span>
          <span>
            <b>Миссия</b>
            <small>Зачем эта игра</small>
          </span>
        </button>
      </div>

      {tab !== 'none' && (
        <div className="tip-overlay" onClick={() => setTab('none')}>
          <div className="tip-card menu-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setTab('none')} title="Закрыть">
              <Icon name="swap" s={16} />
            </button>
            {tab === 'rules' && <RulesPanel />}
            {tab === 'mission' && <MissionPanel />}
            {tab === 'achv' && <AchvPanel unlocked={profile.achievements} />}
          </div>
        </div>
      )}

      {/* Результаты «Похода дня» */}
      {dailyDates.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="section-label">
            <Icon name="signpost" s={13} /> Ваши «Походы дня»
          </div>
          <div className="daily-table">
            {dailyDates.map((d) => (
              <div key={d.date} className="daily-row">
                <span className="daily-date">{d.date}</span>
                <span className="daily-stars">
                  {[0, 1, 2].map((i) => (
                    <Icon key={i} name={i < d.stars ? 'starFill' : 'star'} s={15} />
                  ))}
                </span>
                <span className="muted">{d.rounds} раунд(ов)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RulesPanel() {
  return (
    <div>
      <h2 className="modal-h">Правила</h2>
      <div className="section-label">
        <Icon name="target" s={14} /> Цель
      </div>
      <p style={{ marginTop: 0 }}>
        Командой пройдите от <b>Базы</b> через <b>Промежуточную цель</b> к <b>Главной цели</b>.
        Проигрыша нет — в конце команда получает 1–3 звезды и «историю похода». Важна синергия ролей,
        а не гонка.
      </p>
      <div className="section-label">
        <Icon name="dice" s={14} /> Ход-цикл
      </div>
      <ol>
        <li>Бросок погоды на раунд — общий для всех.</li>
        <li>Каждый по очереди: способность роли → бросок шага → движение → помощь товарищу.</li>
        <li>Сходили все → новая погода.</li>
      </ol>
    </div>
  )
}

function MissionPanel() {
  return (
    <div>
      <h2 className="modal-h">Миссия</h2>
      <div className="section-label">
        <Icon name="heart" s={14} /> Зачем эта игра
      </div>
      <p style={{ marginTop: 0 }}>
        «В Поход!» — игровая модель настоящего похода. Цель — вдохновить ребят идти в{' '}
        <b>реальные походы</b>, учиться работе в команде и помогать друг другу. Игра — мостик к
        программе «{BCHP_NAME}».
      </p>
      <a className="btn-secondary" href={BCHP_URL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 8 }}>
        <Icon name="link" s={16} /> О программе
      </a>
    </div>
  )
}

function AchvPanel({ unlocked }: { unlocked: string[] }) {
  return (
    <div>
      <h2 className="modal-h">Достижения</h2>
      <div className="section-label">
        <Icon name="starFill" s={14} /> Значки
      </div>
      <div className="achv-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.includes(a.id)
          return (
            <div key={a.id} className={`achv-item ${got ? 'got' : 'locked'}`}>
              <span className="achv-ic">
                <Icon name={got ? a.icon : 'eye'} s={20} />
              </span>
              <div>
                <div className="achv-name">{a.name}</div>
                <div className="achv-desc">
                  {a.desc}
                  {!a.inGame && ' (только в жизни)'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p className="muted" style={{ marginTop: 10 }}>
        {ACHV_BY_ID.real_traveler.name} — единственный значок, который нельзя получить в игре, только
        сходив в настоящий поход.
      </p>
    </div>
  )
}
