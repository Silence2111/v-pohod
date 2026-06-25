import { loadProfile } from '../game/profile'
import { CHAPTERS, LEVELS_PER_CHAPTER, chapterOf, LANDMARKS } from '../game/chapters'
import { TerrainScene } from './terrains'
import { BchpLogo } from './Logo'
import { Icon } from './icons'

interface Props {
  onPlay: (levelGlobal: number) => void
  onBack: () => void
  onCards: () => void
}

export function WorldMap({ onPlay, onBack, onCards }: Props) {
  const profile = loadProfile()
  const done = profile.levelsDone
  const curChapter = chapterOf(done)

  return (
    <div className="app">
      <div className="topbar">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="swap" s={15} /> В меню
        </button>
        <div className="brandmark">
          <BchpLogo sm />
          <span className="leaf">
            <Icon name="route" s={20} />
          </span>
          <h1>Путь похода</h1>
        </div>
        <button className="btn-ghost" onClick={onCards}>
          <Icon name="camera" s={15} /> Карточки {profile.cards.length}/{LANDMARKS.length}
        </button>
      </div>

      <div className="hint">
        <span className="ic">
          <Icon name="signpost" s={18} />
        </span>
        Проходите уровни по порядку. Каждые 3 уровня — карточка достопримечательности России, а за
        главу — приглашение в настоящий поход.
      </div>

      <div className="chapters">
        {CHAPTERS.map((ch, ci) => {
          const startG = ci * LEVELS_PER_CHAPTER
          const chDone = done >= startG + LEVELS_PER_CHAPTER
          const chLocked = ci > curChapter
          const chDoneCount = Math.max(0, Math.min(LEVELS_PER_CHAPTER, done - startG))
          return (
            <div
              key={ch.id}
              className={`chapter ${chLocked ? 'locked' : ''} ${chDone ? 'done' : ''}`}
              style={{ ['--ch' as string]: ch.accent, ['--cht' as string]: ch.tint }}
            >
              <div className="chapter-bg">
                <TerrainScene terrain={ch.terrain} />
              </div>
              <div className="chapter-head">
                <span className="chapter-no">Глава {ch.n}</span>
                <span className="chapter-name">{ch.name}</span>
                {chLocked ? (
                  <span className="chapter-tag locked">
                    <Icon name="eye" s={13} /> закрыто
                  </span>
                ) : (
                  <span className="chapter-tag">
                    {chDoneCount}/{LEVELS_PER_CHAPTER}
                  </span>
                )}
              </div>
              {!chLocked && (
                <div className="nodes">
                  {Array.from({ length: LEVELS_PER_CHAPTER }, (_, i) => {
                    const g = startG + i
                    const isDone = g < done
                    const isCurrent = g === done
                    const reward = (i + 1) % 3 === 0
                    return (
                      <button
                        key={i}
                        className={`node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${
                          reward ? 'reward' : ''
                        }`}
                        disabled={!isDone && !isCurrent}
                        onClick={() => isCurrent && onPlay(g)}
                        title={
                          reward ? `Уровень ${i + 1} — награда: карточка` : `Уровень ${i + 1}`
                        }
                      >
                        {isDone ? <Icon name="check" s={14} /> : reward ? <Icon name="camera" s={13} /> : i + 1}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
