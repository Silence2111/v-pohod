import type { GameState, TerrainType } from './types'

// Задания уровня: 2–3 цели сверх простого «дойти». Выполнение отмечается галочками.
export type QuestKind =
  | 'explore'
  | 'artifacts'
  | 'mountains'
  | 'swamps'
  | 'speed'
  | 'teamwork'
  | 'cards'
  | 'joint'

export interface QuestSpec {
  id: string
  kind: QuestKind
  target: number
}

const ICON: Record<QuestKind, string> = {
  explore: 'map',
  artifacts: 'backpack',
  mountains: 'mountains',
  swamps: 'swamp',
  speed: 'route',
  teamwork: 'users',
  cards: 'cohesion',
  joint: 'puzzle',
}

export function questIcon(kind: QuestKind): string {
  return ICON[kind]
}

export function questLabel(q: QuestSpec): string {
  switch (q.kind) {
    case 'explore':
      return `Откройте ${q.target} плиток карты`
    case 'artifacts':
      return `Соберите ${q.target} артефакта(ов)`
    case 'mountains':
      return 'Поднимитесь в горы'
    case 'swamps':
      return 'Пройдите через болото'
    case 'speed':
      return `Дойдите за ≤ ${q.target} раундов`
    case 'teamwork':
      return 'Каждый применит способность'
    case 'cards':
      return 'Сыграйте командную карту'
    case 'joint':
      return 'Доставьте артефакт на перевал'
  }
}

export interface QuestProgress {
  cur: number
  target: number
  done: boolean
}

export function evalQuest(s: GameState, q: QuestSpec): QuestProgress {
  const total = (cur: number, target: number, done?: boolean): QuestProgress => ({
    cur,
    target,
    done: done ?? cur >= target,
  })
  const artifacts = s.players.reduce((n, p) => n + p.artifacts.length, 0)
  switch (q.kind) {
    case 'explore':
      return total(s.tiles.filter((t) => t.revealed).length, q.target)
    case 'artifacts':
      return total(artifacts, q.target)
    case 'mountains':
      return total(s.achv.mountains, q.target)
    case 'swamps':
      return total(s.achv.swamps, q.target)
    case 'speed':
      return total(s.round, q.target, s.round <= q.target)
    case 'teamwork': {
      const c = s.players.filter((p) => p.usedPassive || p.usedSpecial).length
      return total(c, q.target)
    }
    case 'cards':
      return total(s.achv.cards, q.target)
    case 'joint':
      return total(s.jointTaskDone ? 1 : 0, q.target)
  }
}

// Сгенерировать 2–3 задания под конкретную карту
export function generateQuests(
  tiles: { terrain: TerrainType }[],
  nPlayers: number,
  targetRounds: number,
  rng: () => number = Math.random,
): QuestSpec[] {
  const total = tiles.length
  const has = (t: TerrainType) => tiles.some((x) => x.terrain === t)

  const quests: QuestSpec[] = [
    { id: 'q_explore', kind: 'explore', target: Math.max(4, Math.ceil(total * 0.55)) },
  ]

  const pool: QuestSpec[] = [
    { id: 'q_artifacts', kind: 'artifacts', target: 2 },
    { id: 'q_team', kind: 'teamwork', target: nPlayers },
    { id: 'q_speed', kind: 'speed', target: targetRounds },
    { id: 'q_cards', kind: 'cards', target: 1 },
    { id: 'q_joint', kind: 'joint', target: 1 },
  ]
  if (has('mountains')) pool.push({ id: 'q_mtn', kind: 'mountains', target: 1 })
  if (has('swamp')) pool.push({ id: 'q_swamp', kind: 'swamps', target: 1 })

  // выбрать 2 случайных из пула
  const shuffled = [...pool].sort(() => rng() - 0.5)
  quests.push(...shuffled.slice(0, 2))
  return quests
}
