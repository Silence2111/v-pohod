import { useState, useRef, useEffect } from 'react'
import type { GameState } from '../game/types'
import { buildStory } from '../game/story'
import { BCHP_URL, BCHP_NAME, GEAR_CHECKLIST } from '../game/bridge'
import { recordGame, setRealHike, loadProfile, completeLevel } from '../game/profile'
import type { LevelResult } from '../game/profile'
import { ACHV_BY_ID } from '../game/achievements'
import { CHAPTERS, chapterOf } from '../game/chapters'
import { Confetti } from './Confetti'
import { sfx, haptic } from './sound'
import { Icon } from './icons'

interface Props {
  state: GameState
  onRestart: () => void
  onMenu: () => void
  onWorld?: () => void
}

export function EndScreen({ state, onRestart, onMenu, onWorld }: Props) {
  const story = buildStory(state)
  const [copied, setCopied] = useState(false)
  const [newAchv, setNewAchv] = useState<string[]>([])
  const [levelRes, setLevelRes] = useState<LevelResult | null>(null)
  const [hikeDone, setHikeDone] = useState(() => loadProfile().realHike)
  const recorded = useRef(false)
  const isChapter = state.mode === 'chapter' && state.level != null

  // Зафиксировать партию один раз и получить новые значки / прогресс главы
  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    const res = recordGame(state)
    setNewAchv(res.newAchievements)
    if (isChapter && state.level != null) setLevelRes(completeLevel(state.level))
    sfx.win()
    haptic(30)
    if (res.newAchievements.some((id) => id !== 'real_traveler')) {
      setTimeout(() => sfx.achieve(), 900)
    }
  }, [state])

  const players = state.players.length
  const teamWord =
    players === 2 ? 'вдвоём' : players === 3 ? 'втроём' : players === 4 ? 'вчетвером' : `командой из ${players}`

  const markHike = () => {
    const next = !hikeDone
    setHikeDone(next)
    setRealHike(next)
  }

  const verdict =
    state.stars === 3
      ? 'Идеальный поход! Слаженная команда.'
      : state.stars === 2
        ? 'Отличный поход — вы дошли вместе!'
        : 'Дошли! Главное — никто не остался один.'

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'В Поход!', text: story })
        return
      }
    } catch {
      /* отменено — копируем */
    }
    try {
      await navigator.clipboard.writeText(story)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  // Значки, полученные в игре (без «реального» — он отдельно)
  const earnedInGame = newAchv.filter((id) => id !== 'real_traveler')

  return (
    <div className="app">
      <Confetti />
      <div className="card end">
        <div className="brandmark" style={{ justifyContent: 'center' }}>
          <span className="leaf">
            <Icon name="peak" s={26} />
          </span>
        </div>
        <h1 style={{ color: 'var(--forest)', margin: '10px 0 0' }}>Поход завершён!</h1>

        <div className="end-stars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`st ${i < state.stars ? 'on' : ''}`}>
              <Icon name={i < state.stars ? 'starFill' : 'star'} s={52} />
            </span>
          ))}
        </div>
        <p style={{ fontWeight: 700, color: 'var(--sage-deep)', fontSize: 17 }}>{verdict}</p>
        <p className="muted">
          Дошли за {state.round} раунд(ов) · целевой темп ≤ {state.targetRounds}
        </p>

        {/* Награда уровня главы */}
        {levelRes?.reward && (
          <div className="reward-card">
            <div className="reward-emoji">{levelRes.reward.emoji}</div>
            <div>
              <div className="section-label" style={{ margin: 0 }}>
                <Icon name="camera" s={13} /> Новая карточка России
              </div>
              <div className="reward-name">{levelRes.reward.name}</div>
              <div className="reward-region">{levelRes.reward.region}</div>
              <div className="reward-info">{levelRes.reward.info}</div>
            </div>
          </div>
        )}

        {/* Завершение главы — приглашение в реальный поход + подарок */}
        {levelRes?.chapterDone && state.level != null && (
          <div className="chapter-done">
            <div className="cd-title">
              <Icon name="peak" s={18} /> Глава «{CHAPTERS[chapterOf(state.level - 1)].name}» пройдена!
            </div>
            <p>
              А теперь — по-настоящему: найдите похожую местность в своём регионе и сходите туда
              командой. За пройденную главу — подарок-сертификат «Команда главы».
            </p>
            <div className="cd-gift">
              <Icon name="starFill" s={16} /> Подарок: сертификат за прохождение главы
            </div>
          </div>
        )}

        {earnedInGame.length > 0 && (
          <div className="new-achv">
            <div className="section-label" style={{ justifyContent: 'center' }}>
              <Icon name="starFill" s={14} /> Новые значки
            </div>
            <div className="new-achv-row">
              {earnedInGame.map((id) => (
                <div key={id} className="new-achv-item">
                  <span className="nai-ic">
                    <Icon name={ACHV_BY_ID[id]?.icon ?? 'starFill'} s={20} />
                  </span>
                  {ACHV_BY_ID[id]?.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section-label" style={{ justifyContent: 'center' }}>
          <Icon name="scroll" s={14} /> История похода
        </div>
        <div className="story-box">{story}</div>

        <div className="flex wrap center">
          {isChapter && onWorld ? (
            <button className="btn-primary" onClick={onWorld}>
              <Icon name="route" s={18} /> В карту глав
            </button>
          ) : (
            <button className="btn-secondary" onClick={onRestart}>
              <Icon name="route" s={16} /> Новый поход
            </button>
          )}
          <button className="btn-secondary" onClick={share}>
            <Icon name={copied ? 'check' : 'share'} s={18} />
            {copied ? 'Скопировано!' : 'Поделиться'}
          </button>
          <button className="btn-ghost" onClick={onMenu}>
            <Icon name="swap" s={15} /> В меню
          </button>
        </div>
      </div>

      {/* Связка с реальными походами */}
      <div className="card bridge">
        <div className="bridge-head">
          <span className="bridge-ic">
            <Icon name="signpost" s={26} />
          </span>
          <div>
            <h2 style={{ margin: 0, color: 'var(--forest)' }}>А теперь — по-настоящему!</h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Вы прошли поход {teamWord}. Соберите ту же команду и сходите в настоящий — это и есть
              «{BCHP_NAME}».
            </p>
          </div>
        </div>

        <div className="section-label">
          <Icon name="backpack" s={14} /> Что взять в первый поход
        </div>
        <div className="gear-grid">
          {GEAR_CHECKLIST.map((gi, i) => (
            <div key={i} className="gear-item">
              <span className="gear-ic">
                <Icon name={gi.icon} s={17} />
              </span>
              {gi.text}
            </div>
          ))}
        </div>

        <div className="flex wrap" style={{ marginTop: 14 }}>
          <a className="btn-primary" href={BCHP_URL} target="_blank" rel="noopener noreferrer">
            <Icon name="pin" s={17} /> Найти поход рядом
          </a>
          <button className={`btn-secondary ${hikeDone ? 'on' : ''}`} onClick={markHike}>
            <Icon name={hikeDone ? 'starFill' : 'star'} s={16} />
            {hikeDone ? 'Я сходил в настоящий поход!' : 'Отметить: сходил вживую'}
          </button>
        </div>

        {hikeDone && (
          <div className="hike-badge">
            <Icon name="peak" s={20} /> Значок «Настоящий путешественник» получен — единственный,
            который нельзя добыть в игре. Так держать!
          </div>
        )}
      </div>
    </div>
  )
}
