import type {
  GameState,
  Player,
  RoleId,
  ArtifactId,
  WeatherId,
  MapSize,
  TurnState,
  LogEntry,
  CardId,
} from './types'
import {
  ROLES,
  WEATHER,
  WEATHER_ORDER,
  SIZES,
  TERRAIN,
  ARTIFACTS,
  PLAYER_COLORS,
  CARDS,
  CARD_ORDER,
} from './data'
import { generateMap, neighbors } from './map'
import { EVENTS, EVENT_BY_ID } from './events'
import { generateQuests, evalQuest } from './quests'

// ===================== ВСПОМОГАТЕЛЬНОЕ =====================

const d6 = () => Math.floor(Math.random() * 6) + 1

function emptyTurn(): TurnState {
  return {
    rolled: false,
    lastRoll: 0,
    moved: false,
    extraMove: false,
    ignoreDifficult: false,
    scoutMarchUsed: false,
    passiveHelpUsed: false,
  }
}

function log(s: GameState, icon: string, text: string, highlight = false) {
  s.log.push({ round: s.round, icon, text, highlight })
}

const clone = (s: GameState): GameState => structuredClone(s)

export const hasArtifact = (p: Player, a: ArtifactId) => p.artifacts.includes(a)
const hasImpressions = (s: GameState) => s.players.some((p) => p.role === 'impressionsKeeper')

// ===================== СОЗДАНИЕ ИГРЫ =====================

export interface PlayerConfig {
  name: string
  role: RoleId
  gender: import('./types').Gender
}

export interface GameOptions {
  mode?: 'normal' | 'daily' | 'chapter'
  dailyKey?: string
  rng?: () => number
  theme?: import('./types').TerrainType
  hardRatio?: number
  level?: number
}

export function createGame(
  configs: PlayerConfig[],
  size: MapSize,
  opts: GameOptions = {},
): GameState {
  const map = generateMap(size, opts.rng, { theme: opts.theme, hardRatio: opts.hardRatio })
  const players: Player[] = configs.map((c, i) => {
    const role = ROLES[c.role]
    const startArtifacts: ArtifactId[] = []
    if (role.startArtifacts > 0) {
      // Спасатель стартует с 1–2 артефактами
      const pool: ArtifactId[] = ['compass', 'boat', 'headgear', 'gear']
      for (let k = 0; k < role.startArtifacts; k++) {
        startArtifacts.push(pool[k % pool.length])
      }
    }
    return {
      id: i,
      name: c.name.trim() || `Игрок ${i + 1}`,
      role: c.role,
      gender: c.gender,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      pos: map.base,
      artifacts: startArtifacts,
      fatigue: 0,
      boost: 0,
      specialCharges: role.charges,
      usedPassive: false,
      usedSpecial: false,
      visitedIntermediate: false,
    }
  })

  const s: GameState = {
    phase: 'weather',
    mode: opts.mode ?? 'normal',
    dailyKey: opts.dailyKey,
    level: opts.level,
    size,
    cols: map.cols,
    rows: map.rows,
    tiles: map.tiles,
    players,
    current: 0,
    round: 1,
    weather: 'cloudy',
    weatherSuppressed: false,
    weatherRerolls: 0,
    storyTokens: 0,
    commandCards: [...CARD_ORDER], // небольшой стартовый набор: по одной карте
    jointTaskDone: false,
    tip: null,
    seenTips: [],
    event: null,
    achv: { mountains: 0, swamps: 0, trades: 0, cards: 0, events: 0 },
    quests: generateQuests(map.tiles, players.length, SIZES[size].targetRounds, opts.rng),
    turn: emptyTurn(),
    log: [],
    targetRounds: SIZES[size].targetRounds,
    stars: 0,
  }
  log(s, '🥾', `Команда из ${players.length} собралась на Базе. В поход!`, true)
  return s
}

// ===================== ПОГОДА (бросок №1) =====================

export function rollWeather(prev: GameState): GameState {
  const s = clone(prev)
  const w: WeatherId = WEATHER_ORDER[Math.floor(Math.random() * WEATHER_ORDER.length)]
  s.weather = w
  s.weatherSuppressed = false
  s.phase = 'turn'
  s.current = 0
  beginTurn(s)
  log(s, WEATHER[w].icon, `Раунд ${s.round}. Погода: ${WEATHER[w].name} — ${WEATHER[w].desc}`)
  return s
}

// ===================== НАЧАЛО ХОДА ИГРОКА =====================

function beginTurn(s: GameState) {
  s.turn = emptyTurn()
  const p = s.players[s.current]
  p.fatigue = Math.max(0, p.fatigue) // защита
  // Постоянное действие Разведчика: открыть 1 соседнюю закрытую плитку
  if (p.role === 'scout') {
    const closed = neighbors(p.pos, s.cols, s.rows).filter((i) => !s.tiles[i].revealed)
    if (closed.length > 0) {
      const t = s.tiles[closed[0]]
      t.revealed = true
      grantStory(s, 1)
      p.usedPassive = true
      log(s, '🧭', `Разведчик ${p.name} заранее открыл ${TERRAIN[t.terrain].name}.`)
    }
  }
}

function grantStory(s: GameState, n: number) {
  if (hasImpressions(s)) s.storyTokens += n
}

// Показать подсказку «в игре → в жизни» один раз за партию
function fireTip(s: GameState, id: string) {
  if (!s.seenTips.includes(id)) {
    s.seenTips.push(id)
    s.tip = id
  }
}

export function dismissTip(prev: GameState): GameState {
  const s = clone(prev)
  s.tip = null
  return s
}

// Переброс погоды тура — доступен только после перевала (промежуточной цели)
export function rerollWeather(prev: GameState): GameState {
  if (prev.weatherRerolls <= 0) return prev
  const s = clone(prev)
  const prevW = s.weather
  let w = WEATHER_ORDER[Math.floor(Math.random() * WEATHER_ORDER.length)]
  if (w === prevW) w = WEATHER_ORDER[(WEATHER_ORDER.indexOf(w) + 1) % WEATHER_ORDER.length]
  s.weather = w
  s.weatherSuppressed = false
  s.weatherRerolls -= 1
  log(s, WEATHER[w].icon, `Погода переброшена: ${WEATHER[w].name} — ${WEATHER[w].desc}`, true)
  return s
}

// ===================== БРОСОК ШАГА (бросок №2) =====================

export function rollStep(prev: GameState): GameState {
  const s = clone(prev)
  const p = s.players[s.current]
  if (s.turn.rolled) return prev
  const roll = d6()
  let r = roll
  const suppressed = s.weatherSuppressed
  if (!suppressed) {
    if (s.weather === 'clear') r += 1
    if (s.weather === 'heat') r -= 1
    if (s.weather === 'wind') r -= 1
  }
  // Усталость снижает бросок
  if (p.fatigue > 0) {
    r -= p.fatigue
    log(s, '😮‍💨', `${p.name}: усталость −${p.fatigue} к броску.`)
    p.fatigue = 0
  }
  // Бонус к броску (Хранитель атмосферы, карты)
  if (p.boost > 0) {
    r += p.boost
    log(s, '✨', `${p.name}: бонус +${p.boost} к броску.`)
    p.boost = 0
  }
  r = Math.max(1, r) // минимум 1
  s.turn.rolled = true
  s.turn.moved = false
  s.turn.lastRoll = r
  log(s, '🎲', `${p.name} бросает кубик: ${roll}${r !== roll ? ` → ${r}` : ''}.`)
  return s
}

// ===================== ДВИЖЕНИЕ (бросок ≥ порог) =====================

export interface MoveCheck {
  ok: boolean
  threshold: number
  reason?: string
}

// Порог входа на плитку с учётом артефакта/погоды/способности
export function effectiveThreshold(s: GameState, p: Player, target: number): number {
  const tile = s.tiles[target]
  const t = TERRAIN[tile.terrain]
  if (s.turn.ignoreDifficult && t.hard) return 1 // Исследователь проходит сложное
  let th = t.threshold
  if (t.helper && hasArtifact(p, t.helper) && t.helped !== undefined) th = t.helped
  if (t.hard && s.weather === 'rain' && !s.weatherSuppressed) th += 1 // дождь усложняет
  return th
}

export function checkMove(s: GameState, target: number): MoveCheck {
  const p = s.players[s.current]
  if (!s.turn.rolled) return { ok: false, threshold: 0, reason: 'Сначала бросьте кубик' }
  if (s.turn.moved) return { ok: false, threshold: 0, reason: 'Ход уже сделан' }
  if (!neighbors(p.pos, s.cols, s.rows).includes(target))
    return { ok: false, threshold: 0, reason: 'Не соседняя плитка' }
  const th = effectiveThreshold(s, p, target)
  if (s.turn.lastRoll < th)
    return { ok: false, threshold: th, reason: `Нужен бросок ${th}+ (выпало ${s.turn.lastRoll})` }
  return { ok: true, threshold: th }
}

export function moveTo(prev: GameState, target: number): GameState {
  const check = checkMove(prev, target)
  if (!check.ok) return prev
  const s = clone(prev)
  const p = s.players[s.current]
  const tile = s.tiles[target]
  const t = TERRAIN[tile.terrain]

  // Исследователь: расходуем «игнор» при проходе сложной местности
  if (t.hard && s.turn.ignoreDifficult) {
    s.turn.ignoreDifficult = false
    log(s, '🔎', `${p.name} (Исследователь) преодолевает ${t.name}.`)
  }

  p.pos = target
  // Ход израсходован; «Быстрый марш» даёт ещё один бросок+ход
  if (s.turn.extraMove) {
    s.turn.extraMove = false
    s.turn.rolled = false
    s.turn.moved = false
    log(s, '🏃', `${p.name}: «Быстрый марш» — ещё один бросок!`)
  } else {
    s.turn.moved = true
  }

  revealAround(s, p, target)

  // Подбор артефакта-находки
  if (tile.artifact) {
    p.artifacts.push(tile.artifact)
    log(s, ARTIFACTS[tile.artifact].icon, `${p.name} нашёл артефакт: ${ARTIFACTS[tile.artifact].name}!`, true)
    if (tile.artifact === 'compass') fireTip(s, 'compass')
    tile.artifact = undefined
  }

  // Подсказки «в игре → в жизни» по типу местности
  if (tile.terrain === 'water') fireTip(s, 'water')
  if (tile.terrain === 'forest') fireTip(s, 'forest')

  // Болото утомляет — даёт работу помощникам
  if (tile.terrain === 'swamp') {
    p.fatigue += 1
    s.achv.swamps += 1
    log(s, '😮‍💨', `${p.name} увяз в Болоте — устал (+усталость).`)
    fireTip(s, 'swamp')
  }

  // Горы утомляют после подъёма
  if (tile.terrain === 'mountains') {
    s.achv.mountains += 1
    p.fatigue += 1
    log(s, '⛰️', `${p.name} взошёл в Горы (+усталость).`)
    fireTip(s, 'mountains')
  }

  // Достижение целей
  if (tile.kind === 'intermediate' && !p.visitedIntermediate) {
    const teamHadIntermediate = s.players.some((x) => x.visitedIntermediate)
    p.visitedIntermediate = true
    grantStory(s, 2)
    log(s, '🚩', `${p.name} достиг Промежуточной цели (перевал)!`, true)
    fireTip(s, 'intermediate')
    // Перевал: команда получает возможность перебросить погоду (один раз)
    if (!teamHadIntermediate) {
      s.weatherRerolls += 1
      log(s, '🌦️', `Перевал пройден — теперь можно перебросить погоду тура.`, true)
    }
  }
  // Совместная задача: доставить артефакт на Промежуточную цель
  if (tile.kind === 'intermediate' && !s.jointTaskDone && p.artifacts.length > 0) {
    s.jointTaskDone = true
    s.commandCards.push('secondWind')
    grantStory(s, 3)
    log(s, '🧩', `Совместная задача выполнена: артефакт доставлен на цель! Награда: командная карта.`, true)
  }
  if (tile.kind === 'main') {
    log(s, '🏔️', `${p.name} вышел к Главной цели!`, true)
  }

  maybeFireEvent(s, tile)
  checkWin(s)
  return s
}

// Случайное событие на обычной плитке (не накладываем на подсказку/победу)
function maybeFireEvent(s: GameState, tile: typeof s.tiles[number]) {
  if (s.event || s.tip || s.phase === 'finished') return
  if (tile.kind !== 'normal') return
  if (Math.random() < 0.2) {
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)]
    s.event = ev.id
  }
}

export function resolveEvent(prev: GameState, optionIndex: number): GameState {
  const s = clone(prev)
  const id = s.event
  if (!id) return prev
  const ev = EVENT_BY_ID[id]
  const opt = ev.options[optionIndex] ?? ev.options[0]
  const e = opt.effect
  const p = s.players[s.current]
  if (e.story) s.storyTokens += e.story
  if (e.move) {
    if (s.turn.rolled) s.turn.lastRoll = Math.max(1, s.turn.lastRoll + e.move)
    else p.boost += e.move
  }
  if (e.healSelf) p.fatigue = 0
  if (e.healAll) s.players.forEach((x) => (x.fatigue = 0))
  if (e.card) s.commandCards.push(e.card)
  s.achv.events += 1
  log(s, '✨', `${ev.title}: ${opt.result}`, true)
  s.event = null
  return s
}

function revealAround(s: GameState, p: Player, center: number) {
  let newly = 0
  const reveal = (i: number) => {
    if (!s.tiles[i].revealed) {
      s.tiles[i].revealed = true
      newly++
    }
  }
  reveal(center) // плитку, куда встал, видно всегда
  const centerTile = s.tiles[center]
  // Соседние клетки открывает ТОЛЬКО Разведчик; другим — только с Компасом.
  const canSeeAround = p.role === 'scout' || hasArtifact(p, 'compass')
  if (canSeeAround) {
    // Лес скрывает соседей (Компас снимает скрытость)
    const forestBlocks = centerTile.terrain === 'forest' && !hasArtifact(p, 'compass')
    if (!forestBlocks) {
      for (const nb of neighbors(center, s.cols, s.rows)) reveal(nb)
    }
  }
  if (newly > 0) {
    grantStory(s, newly)
    if (hasImpressions(s)) {
      const imp = s.players.find((x) => x.role === 'impressionsKeeper')
      if (imp) imp.usedPassive = true
    }
  }
}

// ===================== СПОСОБНОСТИ РОЛЕЙ =====================

// Разведчик: Быстрый марш (+3 очка движения)
export function scoutMarch(prev: GameState): GameState {
  const s = clone(prev)
  const p = s.players[s.current]
  if (p.role !== 'scout' || p.specialCharges <= 0 || s.turn.scoutMarchUsed) return prev
  p.specialCharges -= 1
  p.usedSpecial = true
  s.turn.scoutMarchUsed = true
  s.turn.extraMove = true // даст ещё один бросок+перемещение после хода
  log(s, '🏃', `${p.name} использует «Быстрый марш»: дополнительный шаг в этом ходу!`, true)
  return s
}

// Исследователь: включить игнор сложной местности (постоянное)
export function explorerToggle(prev: GameState): GameState {
  const s = clone(prev)
  const p = s.players[s.current]
  if (p.role !== 'explorer') return prev
  s.turn.ignoreDifficult = !s.turn.ignoreDifficult
  if (s.turn.ignoreDifficult) {
    p.usedPassive = true
    log(s, '🔎', `${p.name} готов проигнорировать 1 эффект сложной местности.`)
  }
  return s
}

// Хранитель лагеря: Тёплый привал (особое) — отменить погоду на раунд
export function campSpecial(prev: GameState): GameState {
  const s = clone(prev)
  const p = s.players[s.current]
  if (p.role !== 'campKeeper' || p.specialCharges <= 0) return prev
  p.specialCharges -= 1
  p.usedSpecial = true
  s.weatherSuppressed = true
  log(s, '🏕️', `${p.name}: «Тёплый привал» — погода ${WEATHER[s.weather].name} отменена на раунд.`, true)
  return s
}

// Хранитель впечатлений: Памятный кадр (особое) — 5 жетонов → бонус команде
export function impressionsSpecial(prev: GameState): GameState {
  const s = clone(prev)
  const p = s.players[s.current]
  if (p.role !== 'impressionsKeeper' || p.specialCharges <= 0 || s.storyTokens < 5) return prev
  s.storyTokens -= 5
  p.specialCharges -= 1
  p.usedSpecial = true
  s.players.forEach((x) => (x.fatigue = 0))
  if (s.turn.rolled) s.turn.lastRoll += 2
  else p.boost += 2
  log(s, '📸', `${p.name}: «Памятный кадр» — команда воодушевлена! Усталость снята, +2 к броску.`, true)
  return s
}

// Действия с выбором цели → выставляем pending
export function requestAction(prev: GameState, kind: NonNullable<GameState['pending']>): GameState {
  const s = clone(prev)
  s.pending = kind
  return s
}

export function cancelPending(prev: GameState): GameState {
  const s = clone(prev)
  s.pending = undefined
  return s
}

// Применить действие к выбранному игроку
export function resolvePlayerTarget(prev: GameState, targetId: number): GameState {
  const s = clone(prev)
  const pend = s.pending
  if (!pend) return prev
  const actor = s.players[s.current]
  const target = s.players[targetId]

  switch (pend.kind) {
    case 'campRemoveFatigue': {
      if (s.turn.passiveHelpUsed) return prev
      if (target.fatigue > 0) target.fatigue -= 1
      actor.usedPassive = true
      s.turn.passiveHelpUsed = true
      log(s, '🏕️', `${actor.name} снимает усталость у ${target.name}.`)
      s.pending = undefined
      break
    }
    case 'atmosphereBoost': {
      if (targetId === actor.id) return prev // только другому игроку
      if (s.turn.passiveHelpUsed) return prev
      target.boost += 1
      actor.usedPassive = true
      s.turn.passiveHelpUsed = true
      log(s, '🎶', `${actor.name} даёт +1 к шагу игроку ${target.name}.`)
      s.pending = undefined
      break
    }
    case 'atmosphereCleanse': {
      if (actor.specialCharges <= 0) return prev
      if (target.fatigue > 0) target.fatigue = 0
      actor.specialCharges -= 1
      actor.usedSpecial = true
      log(s, '🎶', `${actor.name} снимает негативные эффекты у ${target.name}.`)
      s.pending = undefined
      break
    }
    case 'rescuerRemove': {
      if (s.turn.passiveHelpUsed) return prev
      if (target.fatigue > 0) target.fatigue = 0
      actor.usedPassive = true
      s.turn.passiveHelpUsed = true
      log(s, '🛟', `${actor.name} снимает серьёзный штраф у ${target.name}.`)
      s.pending = undefined
      break
    }
    case 'rescuerMove': {
      if (actor.specialCharges <= 0) return prev
      s.pending = { kind: 'rescuerMoveTarget', playerId: targetId }
      break
    }
    case 'trade': {
      if (targetId === actor.id) return prev
      const ai = actor.artifacts.indexOf(pend.artifact)
      if (ai >= 0) {
        actor.artifacts.splice(ai, 1)
        target.artifacts.push(pend.artifact)
        s.achv.trades += 1
        log(s, ARTIFACTS[pend.artifact].icon, `${actor.name} передаёт ${ARTIFACTS[pend.artifact].name} → ${target.name}.`)
        fireTip(s, 'trade')
      }
      s.pending = undefined
      break
    }
    default:
      return prev
  }
  return s
}

// Спасательная операция: переместить выбранного игрока на соседнюю клетку
export function resolveTileTarget(prev: GameState, tileIndex: number): GameState {
  const s = clone(prev)
  const pend = s.pending
  if (!pend || pend.kind !== 'rescuerMoveTarget') return prev
  const actor = s.players[s.current]
  const moved = s.players[pend.playerId]
  if (!neighbors(moved.pos, s.cols, s.rows).includes(tileIndex)) return prev
  if (actor.specialCharges <= 0) return prev
  actor.specialCharges -= 1
  actor.usedSpecial = true
  moved.pos = tileIndex
  revealAround(s, moved, tileIndex)
  const t = s.tiles[tileIndex]
  if (t.kind === 'intermediate' && !moved.visitedIntermediate) {
    moved.visitedIntermediate = true
    log(s, '🚩', `${moved.name} достиг Промежуточной цели!`, true)
  }
  log(s, '🛟', `${actor.name}: «Спасательная операция» — ${moved.name} перемещён.`, true)
  s.pending = undefined
  checkWin(s)
  return s
}

// Исследователь: Разведка карты (особое) — открыть любую плитку
export function explorerReveal(prev: GameState, tileIndex: number): GameState {
  const s = clone(prev)
  const pend = s.pending
  if (!pend || pend.kind !== 'explorerReveal') return prev
  const p = s.players[s.current]
  if (p.specialCharges <= 0) return prev
  if (!s.tiles[tileIndex].revealed) {
    s.tiles[tileIndex].revealed = true
    grantStory(s, 1)
  }
  p.specialCharges -= 1
  p.usedSpecial = true
  log(s, '🔎', `${p.name}: «Разведка карты» — открыта ${TERRAIN[s.tiles[tileIndex].terrain].name}.`)
  s.pending = undefined
  return s
}

// ===================== КОМАНДНЫЕ КАРТЫ =====================

export function playCard(prev: GameState, card: CardId): GameState {
  if (!prev.commandCards.includes(card)) return prev
  const s = clone(prev)
  const info = CARDS[card]
  s.achv.cards += 1
  // убрать одну такую карту из общей руки
  s.commandCards.splice(s.commandCards.indexOf(card), 1)

  switch (card) {
    case 'secondWind': {
      // +1 к броску всей команде (текущему — сразу, если уже бросил)
      s.players.forEach((x) => {
        if (x.id === s.current && s.turn.rolled) s.turn.lastRoll += 1
        else x.boost += 1
      })
      break
    }
    case 'rest': {
      s.players.forEach((x) => (x.fatigue = 0))
      break
    }
    case 'cohesion': {
      // переброс текущему игроку
      s.turn.rolled = false
      s.turn.moved = false
      break
    }
  }
  log(s, info.icon, `Командная карта «${info.name}»: ${info.desc}`, true)
  return s
}

// Начать обмен артефактом
export function startTrade(prev: GameState, artifact: ArtifactId): GameState {
  const s = clone(prev)
  const p = s.players[s.current]
  if (!hasArtifact(p, artifact)) return prev
  s.pending = { kind: 'trade', artifact }
  return s
}

// ===================== КОНЕЦ ХОДА / РАУНДА =====================

export function endTurn(prev: GameState): GameState {
  const s = clone(prev)
  s.pending = undefined
  const last = s.players.length - 1
  if (s.current < last) {
    s.current += 1
    beginTurn(s)
  } else {
    // Раунд закрыт — новая погода
    s.round += 1
    s.phase = 'weather'
    s.current = 0
  }
  return s
}

// ===================== ПОБЕДА И ЗВЁЗДЫ =====================

function checkWin(s: GameState) {
  const teamVisitedIntermediate = s.players.some((p) => p.visitedIntermediate)
  const main = s.tiles.findIndex((t) => t.kind === 'main')
  const allAtMain = s.players.every((p) => p.pos === main)
  if (teamVisitedIntermediate && allAtMain) {
    s.phase = 'finished'
    s.stars = computeStars(s)
    log(s, '🎉', `Команда достигла Главной цели за ${s.round} раунд(ов)! Победа!`, true)
  }
}

function computeStars(s: GameState): number {
  const inTime = s.round <= s.targetRounds
  const everyoneContributed = s.players.every((p) => p.usedPassive || p.usedSpecial)
  const storyOk = !hasImpressions(s) || s.storyTokens >= Math.floor(s.tiles.length * 0.3)
  const allQuests = s.quests.length > 0 && s.quests.every((q) => evalQuest(s, q).done)

  // Выполнить все задания уровня — гарантированные 3 звезды (сильный стимул)
  if (allQuests) return 3
  if (s.round > Math.ceil(s.targetRounds * 1.6)) return 1
  if (inTime && everyoneContributed && storyOk) return 3
  return 2
}

export type { LogEntry }
