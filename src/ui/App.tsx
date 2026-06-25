import { useState, useEffect, useRef } from 'react'
import type { GameState, MapSize, ArtifactId, CardId } from '../game/types'
import * as E from '../game/engine'
import type { PlayerConfig } from '../game/engine'
import { applyAction } from '../game/actions'
import type { Action } from '../game/actions'
import { createHost, joinRoom } from '../game/net'
import type { NetHandle, HostHandle, GuestHandle } from '../game/net'
import { WEATHER } from '../game/data'
import { mulberry32, hashStr, todayKey } from '../game/rng'
import { Menu } from './Menu'
import { Setup } from './Setup'
import { Board } from './Board'
import { Panel } from './Panel'
import type { Actions } from './Panel'
import { EndScreen } from './EndScreen'
import { TipCard } from './TipCard'
import { EventCard } from './EventCard'
import { Handoff } from './Handoff'
import { OnlineLobby } from './OnlineLobby'
import { Intro } from './Intro'
import { WorldMap } from './WorldMap'
import { CardsGallery } from './CardsGallery'
import { Journal } from './Journal'
import { Quests } from './Quests'
import { Chat } from './Chat'
import type { ChatMsg } from './Chat'
import { Mascot } from './illustrations'
import { loadProfile, markIntroSeen } from '../game/profile'
import { CHAPTERS, chapterOf, levelInChapter, levelParams } from '../game/chapters'
import type { TerrainType } from '../game/types'
import { sfx, haptic } from './sound'
import { Icon } from './icons'

type View = 'menu' | 'setup' | 'daily' | 'online' | 'world' | 'cards' | 'play'

interface PendingChapter {
  level: number
  theme: TerrainType
  hardRatio: number
  size: 'small' | 'medium' | 'large'
}

export function App() {
  const [view, setView] = useState<View>('menu')
  const [game, setGame] = useState<GameState | null>(null)
  const [handoffEnabled, setHandoffEnabled] = useState(true)
  const [handoffTo, setHandoffTo] = useState<number | null>(null)

  // Сеть
  const netRef = useRef<NetHandle | null>(null)
  const [online, setOnline] = useState<null | 'host' | 'guest'>(null)
  const [hostCode, setHostCode] = useState<string | null>(null)
  const [peers, setPeers] = useState(0)
  const [guestStatus, setGuestStatus] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(false)
  const [pendingChapter, setPendingChapter] = useState<PendingChapter | null>(null)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])

  // Демо для показа: ?demo / ?demo=end / ?demo=tip / ?demo=handoff / ?view=setup
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.search.includes('view=setup')) {
      setView('setup')
      return
    }
    if (window.location.search.includes('view=online')) {
      setView('online')
      return
    }
    if (window.location.search.includes('view=world')) {
      setView('world')
      return
    }
    if (!window.location.search.includes('demo')) return
    const demo: PlayerConfig[] = [
      { name: 'Алиса', role: 'scout', gender: 'f' },
      { name: 'Борис', role: 'explorer', gender: 'm' },
      { name: 'Вера', role: 'campKeeper', gender: 'f' },
      { name: 'Глеб', role: 'impressionsKeeper', gender: 'm' },
    ]
    const gg = E.createGame(demo, 'medium')
    setHandoffEnabled(false)
    if (window.location.search.includes('end')) {
      setGame({ ...gg, phase: 'finished', stars: 2, round: 6, storyTokens: 9 })
    } else if (window.location.search.includes('tip')) {
      setGame({ ...E.rollWeather(gg), tip: 'mountains', seenTips: ['mountains'] })
    } else if (window.location.search.includes('handoff')) {
      setGame(E.rollWeather(gg))
      setHandoffTo(0)
    } else if (window.location.search.includes('event')) {
      setGame({ ...E.rollWeather(gg), event: 'wanderer' })
    } else {
      setGame(E.rollStep(E.rollWeather(gg)))
    }
    if (window.location.search.includes('intro')) setShowIntro(true)
    setView('play')
  }, [])

  const closeNet = () => {
    netRef.current?.close()
    netRef.current = null
    setOnline(null)
    setHostCode(null)
    setPeers(0)
    setGuestStatus(null)
  }

  const toMenu = () => {
    closeNet()
    setGame(null)
    setHandoffTo(null)
    setPendingChapter(null)
    setView('menu')
  }

  const startGame = (players: PlayerConfig[], size: MapSize, daily: boolean) => {
    let opts: E.GameOptions = {}
    let useSize = size
    if (pendingChapter) {
      opts = {
        mode: 'chapter',
        level: pendingChapter.level,
        theme: pendingChapter.theme,
        hardRatio: pendingChapter.hardRatio,
      }
      useSize = pendingChapter.size
    } else if (daily) {
      opts = { mode: 'daily', dailyKey: todayKey(), rng: mulberry32(hashStr('vpohod-' + todayKey())) }
    }
    const ns = E.createGame(players, useSize, opts)
    setGame(ns)
    setHandoffTo(null)
    setView('play')
    if (online === 'host') (netRef.current as HostHandle)?.broadcast(ns)
    if (!loadProfile().introSeen) {
      setShowIntro(true)
      markIntroSeen()
    }
  }

  // Запуск уровня «ходилки»: настроить команду под тему главы
  const startLevel = (levelGlobal: number) => {
    const ci = chapterOf(levelGlobal)
    const params = levelParams(levelInChapter(levelGlobal))
    setPendingChapter({
      level: levelGlobal,
      theme: CHAPTERS[ci].terrain,
      hardRatio: params.hardRatio,
      size: params.size,
    })
    setView('setup')
  }

  // Применение действия от гостя на хосте (всегда к актуальному состоянию)
  const hostApplyRemote = (action: Action) => {
    setGame((prev) => {
      if (!prev) return prev
      const ns = applyAction(prev, action)
      ;(netRef.current as HostHandle)?.broadcast(ns)
      return ns
    })
  }

  const addChatMsg = (from: string, text: string) =>
    setChatMsgs((prev) => [...prev, { id: (prev[prev.length - 1]?.id ?? 0) + 1, from, text }])

  const onCreateRoom = () => {
    setOnline('host')
    setHandoffEnabled(false)
    netRef.current = createHost({
      onReady: setHostCode,
      onAction: hostApplyRemote,
      onPeers: setPeers,
      onError: () => setHostCode(null),
      onChat: addChatMsg,
    })
  }

  const onJoinRoom = (code: string) => {
    setOnline('guest')
    setHandoffEnabled(false)
    setGuestStatus('connecting')
    netRef.current = joinRoom(code, {
      onChat: addChatMsg,
      onState: (s) => {
        setGame(s)
        setView('play')
      },
      onStatus: setGuestStatus,
    })
  }

  // ---------- Экраны вне игры ----------
  if (view === 'menu') {
    return (
      <>
        {showIntro && <Intro onClose={() => setShowIntro(false)} />}
        <Menu
          onPlay={() => setView('world')}
          onDaily={() => setView('daily')}
          onTutorial={() => setShowIntro(true)}
          onOnline={() => {
            setOnline(null)
            setHostCode(null)
            setPeers(0)
            setGuestStatus(null)
            setView('online')
          }}
        />
      </>
    )
  }
  if (view === 'online') {
    return (
      <OnlineLobby
        onBack={toMenu}
        onCreateRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
        onStartHost={() => setView('setup')}
        hostCode={hostCode}
        peers={peers}
        guestStatus={guestStatus}
      />
    )
  }
  if (view === 'world') {
    return (
      <WorldMap onPlay={startLevel} onBack={toMenu} onCards={() => setView('cards')} />
    )
  }
  if (view === 'cards') {
    return <CardsGallery onBack={() => setView('world')} />
  }
  if (view === 'setup' || view === 'daily') {
    return (
      <Setup
        daily={view === 'daily'}
        chapter={!!pendingChapter}
        online={online != null}
        handoff={handoffEnabled}
        onHandoffChange={setHandoffEnabled}
        onBack={() => {
          const wasChapter = !!pendingChapter
          setPendingChapter(null)
          if (wasChapter) setView('world')
          else toMenu()
        }}
        onStart={(players, size) => startGame(players, size, view === 'daily')}
      />
    )
  }

  if (!game) return null

  if (game.phase === 'finished') {
    return (
      <EndScreen
        state={game}
        onRestart={() => setView(online ? 'online' : 'setup')}
        onMenu={toMenu}
        onWorld={() => {
          setPendingChapter(null)
          setGame(null)
          setView('world')
        }}
      />
    )
  }

  const g = game
  const isGuest = online === 'guest'

  const totalArtifacts = (s: GameState) => s.players.reduce((n, p) => n + p.artifacts.length, 0)

  // Единая отправка действия: гость → хосту; хост/офлайн → применяем локально
  const dispatch = (action: Action): GameState | null => {
    if (isGuest) {
      ;(netRef.current as GuestHandle)?.send(action)
      return null
    }
    const ns = applyAction(g, action)
    setGame(ns)
    if (online === 'host') (netRef.current as HostHandle)?.broadcast(ns)
    return ns
  }

  // ---------- Действия ----------
  const a: Actions = {
    rollStep: () => {
      sfx.dice()
      haptic(14)
      dispatch({ t: 'rollStep' })
    },
    scoutMarch: () => {
      sfx.reveal()
      dispatch({ t: 'scoutMarch' })
    },
    explorerToggle: () => {
      sfx.click()
      dispatch({ t: 'explorerToggle' })
    },
    requestExplorerReveal: () => {
      sfx.click()
      dispatch({ t: 'request', kind: { kind: 'explorerReveal' } })
    },
    campSpecial: () => {
      sfx.card()
      dispatch({ t: 'campSpecial' })
    },
    impressionsSpecial: () => {
      sfx.pickup()
      dispatch({ t: 'impressionsSpecial' })
    },
    requestCampRemove: () => {
      sfx.click()
      dispatch({ t: 'request', kind: { kind: 'campRemoveFatigue' } })
    },
    requestAtmosphereBoost: () => {
      sfx.click()
      dispatch({ t: 'request', kind: { kind: 'atmosphereBoost' } })
    },
    requestAtmosphereCleanse: () => {
      sfx.click()
      dispatch({ t: 'request', kind: { kind: 'atmosphereCleanse' } })
    },
    requestRescuerRemove: () => {
      sfx.click()
      dispatch({ t: 'request', kind: { kind: 'rescuerRemove' } })
    },
    requestRescuerMove: () => {
      sfx.click()
      dispatch({ t: 'request', kind: { kind: 'rescuerMove' } })
    },
    startTrade: (art: ArtifactId) => {
      sfx.click()
      dispatch({ t: 'startTrade', art })
    },
    playCard: (card: CardId) => {
      sfx.card()
      dispatch({ t: 'playCard', card })
    },
    resolvePlayerTarget: (id: number) => {
      sfx.pickup()
      dispatch({ t: 'resolvePlayer', id })
    },
    rerollWeather: () => {
      sfx.weather()
      dispatch({ t: 'rerollWeather' })
    },
    cancelPending: () => dispatch({ t: 'cancelPending' }),
    endTurn: () => {
      sfx.click()
      const ns = dispatch({ t: 'endTurn' })
      if (ns) setHandoffTo(handoffEnabled && !online && ns.phase === 'turn' ? ns.current : null)
    },
  }

  const doRollWeather = () => {
    sfx.weather()
    const ns = dispatch({ t: 'weather' })
    if (ns && handoffEnabled && !online) setHandoffTo(ns.current)
  }

  const onTileClick = (index: number) => {
    const pend = g.pending
    if (pend?.kind === 'explorerReveal') {
      sfx.reveal()
      dispatch({ t: 'explorerReveal', i: index })
    } else if (pend?.kind === 'rescuerMoveTarget') {
      sfx.pickup()
      dispatch({ t: 'resolveTile', i: index })
    } else if (!pend) {
      const before = totalArtifacts(g)
      const ns = dispatch({ t: 'move', i: index })
      if (ns) {
        if (totalArtifacts(ns) > before) sfx.pickup()
        else sfx.step()
        haptic(10)
      } else {
        sfx.step()
      }
    }
  }

  const onSendChat = (text: string) => {
    const from = online === 'host' ? 'Ведущий' : 'Игрок'
    netRef.current?.sendChat(from, text)
  }

  const w = WEATHER[g.weather]
  const needWeather = g.phase === 'weather'

  return (
    <div className="app">
      {showIntro && <Intro onClose={() => setShowIntro(false)} />}
      {handoffTo !== null && (
        <Handoff player={g.players[handoffTo]} onReady={() => setHandoffTo(null)} />
      )}
      {handoffTo === null && g.event && (
        <EventCard eventId={g.event} onChoose={(i) => dispatch({ t: 'resolveEvent', i })} />
      )}
      {handoffTo === null && !g.event && g.tip && (
        <TipCard tipId={g.tip} onClose={() => dispatch({ t: 'dismissTip' })} />
      )}

      <div className="topbar">
        <div className="brandmark">
          <span className="leaf">
            <Icon name={g.mode === 'daily' ? 'signpost' : online ? 'wifi' : 'boot'} s={20} />
          </span>
          <h1>{g.mode === 'daily' ? 'Поход дня' : online ? 'Онлайн-поход' : 'В Поход!'}</h1>
        </div>
        <div className="flex wrap">
          {online && (
            <span className="pill" title="Онлайн-режим">
              <span className="wicon">
                <Icon name="wifi" s={16} />
              </span>
              {online === 'host' ? `хост · ${peers}` : 'гость'}
            </span>
          )}
          <button className="btn-ghost" onClick={toMenu} title="Выйти в меню">
            <Icon name="swap" s={15} /> Меню
          </button>
          <span className="pill round">Раунд {g.round}</span>
          <span className="pill">
            <span className="wicon">
              <Icon name={g.weather} s={18} />
            </span>
            {w.name}
            {g.weatherSuppressed && ' · привал'}
          </span>
        </div>
      </div>

      {needWeather ? (
        <div className="hint action">
          <span className="flex" style={{ gap: 10 }}>
            <span className="ic">
              <Icon name="cloudy" s={18} />
            </span>
            Начало раунда {g.round}. Определите погоду тура — это первый бросок.
          </span>
          <button className="btn-primary" onClick={doRollWeather}>
            <Icon name="dice" s={18} /> Бросить погоду
          </button>
        </div>
      ) : (
        <div className="turn-banner" style={{ ['--accent' as string]: g.players[g.current].color }}>
          <span className="tb-avatar" style={{ background: g.players[g.current].color }}>
            <Icon name={g.players[g.current].role} s={20} />
          </span>
          <div className="tb-text">
            <div className="tb-name">
              Ход: {g.players[g.current].name}{' '}
              <span className="tb-gender">{g.players[g.current].gender === 'm' ? '♂' : '♀'}</span>
            </div>
            <div className="tb-hint">
              {!g.turn.rolled
                ? 'Бросьте кубик, затем идите на подсвеченную плитку'
                : g.turn.moved
                  ? 'Ход сделан — помогите команде и завершите ход'
                  : 'Идите на плитку с порогом ≤ вашего броска'}
            </div>
          </div>
          <span className="tb-round">Раунд {g.round}</span>
        </div>
      )}

      <div className="game">
        <div className="board-col">
          <Board state={g} onTileClick={onTileClick} onRoll={a.rollStep} />
          {!needWeather && <Quests state={g} />}
          {online && <Chat messages={chatMsgs} onSend={onSendChat} />}
          <Journal state={g} />
        </div>
        {!needWeather ? (
          <Panel state={g} a={a} />
        ) : (
          <div className="panel">
            <div className="card">
              <div className="section-label">
                <Icon name="route" s={13} /> Маршрут команды
              </div>
              <p className="muted" style={{ marginTop: 0 }}>
                После броска погоды игроки ходят по очереди. Цель — всей командой дойти до Главной
                цели, побывав на Промежуточной.
              </p>
              <div className="legend" style={{ marginTop: 12 }}>
                <span className="lg">
                  <span className="li">
                    <Icon name="base" s={16} />
                  </span>
                  База
                </span>
                <span className="lg">
                  <span className="li">
                    <Icon name="intermediate" s={16} />
                  </span>
                  Промежуточная
                </span>
                <span className="lg">
                  <span className="li">
                    <Icon name="main" s={16} />
                  </span>
                  Главная цель
                </span>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Mascot s={120} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
