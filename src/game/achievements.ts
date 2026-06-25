import type { GameState, ArtifactId } from './types'

// Значки-достижения. Большинство проверяются по итогу партии,
// «real_traveler» — только в реальной жизни (мостик к настоящему походу).

export interface Achievement {
  id: string
  name: string
  icon: string
  desc: string
  inGame: boolean // можно ли получить внутри игры
  check?: (s: GameState) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_hike',
    name: 'Первый поход',
    icon: 'boot',
    desc: 'Завершить первую партию.',
    inGame: true,
    check: () => true,
  },
  {
    id: 'three_stars',
    name: 'Идеальный поход',
    icon: 'starFill',
    desc: 'Получить 3 звезды за партию.',
    inGame: true,
    check: (s) => s.stars >= 3,
  },
  {
    id: 'team_spirit',
    name: 'Дружная команда',
    icon: 'users',
    desc: 'Каждый игрок применил способность.',
    inGame: true,
    check: (s) => s.players.every((p) => p.usedPassive || p.usedSpecial),
  },
  {
    id: 'cartographer',
    name: 'Картограф',
    icon: 'map',
    desc: 'Открыть все плитки карты.',
    inGame: true,
    check: (s) => s.tiles.every((t) => t.revealed),
  },
  {
    id: 'collector',
    name: 'Снаряжён по полной',
    icon: 'backpack',
    desc: 'Собрать все 4 артефакта в одной партии.',
    inGame: true,
    check: (s) => {
      const set = new Set<ArtifactId>()
      s.players.forEach((p) => p.artifacts.forEach((ar) => set.add(ar)))
      return set.size >= 4
    },
  },
  {
    id: 'climber',
    name: 'Покоритель гор',
    icon: 'mountains',
    desc: 'Подняться в горы.',
    inGame: true,
    check: (s) => s.achv.mountains > 0,
  },
  {
    id: 'helper',
    name: 'Рука помощи',
    icon: 'heart',
    desc: 'Передать снаряжение товарищу.',
    inGame: true,
    check: (s) => s.achv.trades > 0,
  },
  {
    id: 'fast',
    name: 'Налегке',
    icon: 'route',
    desc: 'Дойти в целевой темп или быстрее.',
    inGame: true,
    check: (s) => s.round <= s.targetRounds,
  },
  {
    id: 'daily_done',
    name: 'Поход дня',
    icon: 'signpost',
    desc: 'Пройти «Поход дня».',
    inGame: true,
    check: (s) => s.mode === 'daily',
  },
  {
    id: 'real_traveler',
    name: 'Настоящий путешественник',
    icon: 'peak',
    desc: 'Сходить в настоящий поход (отмечается вручную).',
    inGame: false,
  },
]

export const ACHV_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)
