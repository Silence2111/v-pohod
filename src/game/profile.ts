import type { GameState } from './types'
import { ACHIEVEMENTS } from './achievements'

// Профиль игрока хранится локально (localStorage) — без серверов (по ТЗ).

export interface DailyResult {
  date: string
  stars: number
  rounds: number
}

export interface Profile {
  games: number
  wins: number
  bestStars: number
  totalStars: number
  achievements: string[] // id разблокированных
  realHike: boolean // сходил в настоящий поход
  daily: Record<string, DailyResult> // лучший результат по дате
  introSeen: boolean // обучение пройдено
  levelsDone: number // пройдено уровней «ходилки» (0..75)
  cards: string[] // собранные карточки достопримечательностей
}

const KEY = 'vpohod_profile_v1'

const empty = (): Profile => ({
  games: 0,
  wins: 0,
  bestStars: 0,
  totalStars: 0,
  achievements: [],
  realHike: false,
  daily: {},
  introSeen: false,
  levelsDone: 0,
  cards: [],
})

export function markIntroSeen() {
  const p = loadProfile()
  if (!p.introSeen) {
    p.introSeen = true
    saveProfile(p)
  }
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    return { ...empty(), ...JSON.parse(raw) }
  } catch {
    return empty()
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* приватный режим — игнорируем */
  }
}

export interface RecordResult {
  profile: Profile
  newAchievements: string[]
}

// Зафиксировать итог партии: обновить статистику, разблокировать достижения,
// записать результат «Похода дня». Возвращает список НОВЫХ значков.
export function recordGame(s: GameState): RecordResult {
  const p = loadProfile()
  p.games += 1
  p.wins += 1 // проигрыша нет — финал = победа
  p.bestStars = Math.max(p.bestStars, s.stars)
  p.totalStars += s.stars

  const newAchievements: string[] = []
  for (const a of ACHIEVEMENTS) {
    if (!a.inGame || !a.check) continue
    if (p.achievements.includes(a.id)) continue
    if (a.check(s)) {
      p.achievements.push(a.id)
      newAchievements.push(a.id)
    }
  }

  if (s.mode === 'daily' && s.dailyKey) {
    const prev = p.daily[s.dailyKey]
    const better = !prev || s.stars > prev.stars || (s.stars === prev.stars && s.round < prev.rounds)
    if (better) p.daily[s.dailyKey] = { date: s.dailyKey, stars: s.stars, rounds: s.round }
  }

  saveProfile(p)
  return { profile: p, newAchievements }
}

import { rewardForLevel, LEVELS_PER_CHAPTER, TOTAL_LEVELS } from './chapters'
import type { Landmark } from './chapters'

export interface LevelResult {
  newLevelsDone: number
  reward: Landmark | null // карточка за каждые 5 уровней
  chapterDone: boolean // глава завершена (каждые 15 уровней)
}

// Зафиксировать прохождение текущего уровня «ходилки».
export function completeLevel(playedLevelGlobal: number): LevelResult {
  const p = loadProfile()
  // прогресс растёт только если пройден актуальный (следующий) уровень
  if (playedLevelGlobal === p.levelsDone && p.levelsDone < TOTAL_LEVELS) {
    p.levelsDone += 1
  }
  const reward = rewardForLevel(p.levelsDone)
  if (reward && !p.cards.includes(reward.id)) p.cards.push(reward.id)
  const chapterDone = p.levelsDone % LEVELS_PER_CHAPTER === 0 && p.levelsDone > 0
  saveProfile(p)
  return { newLevelsDone: p.levelsDone, reward, chapterDone }
}

export function setRealHike(done: boolean): Profile {
  const p = loadProfile()
  p.realHike = done
  if (done && !p.achievements.includes('real_traveler')) p.achievements.push('real_traveler')
  if (!done) p.achievements = p.achievements.filter((a) => a !== 'real_traveler')
  saveProfile(p)
  return p
}
