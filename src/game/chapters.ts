import type { TerrainType, MapSize } from './types'

// Главы-территории: «ходилка» по 15 уровней в каждой, последовательное прохождение.
export interface Chapter {
  id: string
  n: number
  name: string
  terrain: TerrainType // тематическая местность главы
  accent: string // акцентный цвет темы
  tint: string // светлая подложка темы
  desc: string
}

export const LEVELS_PER_CHAPTER = 15

export const CHAPTERS: Chapter[] = [
  {
    id: 'plains',
    n: 1,
    name: 'Просторы',
    terrain: 'plain',
    accent: '#1FA567',
    tint: '#EAF3DA',
    desc: 'Широкие равнины — учимся ходить командой.',
  },
  {
    id: 'forest',
    n: 2,
    name: 'Лес',
    terrain: 'forest',
    accent: '#178052',
    tint: '#D2EEDC',
    desc: 'Густые леса — держимся вместе, не теряем тропу.',
  },
  {
    id: 'water',
    n: 3,
    name: 'Водоёмы',
    terrain: 'water',
    accent: '#0077FF',
    tint: '#D9EAFC',
    desc: 'Реки и озёра — ищем переправы.',
  },
  {
    id: 'swamp',
    n: 4,
    name: 'Болота',
    terrain: 'swamp',
    accent: '#9A7B2E',
    tint: '#ECE6CE',
    desc: 'Топкие тропы — идём осторожно, след в след.',
  },
  {
    id: 'mountains',
    n: 5,
    name: 'Горы',
    terrain: 'mountains',
    accent: '#5236AF',
    tint: '#E7E4F0',
    desc: 'Вершины — финальное испытание команды.',
  },
]

export const TOTAL_LEVELS = CHAPTERS.length * LEVELS_PER_CHAPTER

// Прогресс → индекс главы / уровень в главе (для следующего непройденного уровня)
export function chapterOf(levelGlobal: number): number {
  return Math.min(CHAPTERS.length - 1, Math.floor(levelGlobal / LEVELS_PER_CHAPTER))
}
export function levelInChapter(levelGlobal: number): number {
  return levelGlobal % LEVELS_PER_CHAPTER
}

// Размер и доля сложной местности по номеру уровня в главе (рост сложности)
export function levelParams(levelIdx: number): { size: MapSize; hardRatio: number } {
  const size: MapSize = levelIdx < 5 ? 'small' : levelIdx < 10 ? 'medium' : 'large'
  const hardRatio = 0.12 + levelIdx * 0.02
  return { size, hardRatio }
}

// ===== Карточки достопримечательностей РФ (награда каждые 5 уровней) =====
export interface Landmark {
  id: string
  name: string
  region: string
  info: string
  emoji: string
  wiki: string // статья в русской Википедии (для подтягивания реального фото)
}

export const LANDMARKS: Landmark[] = [
  { id: 'baikal', name: 'Озеро Байкал', region: 'Иркутская область / Бурятия', emoji: '🏞️', wiki: 'Байкал', info: 'Самое глубокое озеро планеты (1642 м) и крупнейший резервуар пресной воды.' },
  { id: 'elbrus', name: 'Эльбрус', region: 'Кабардино-Балкария', emoji: '🏔️', wiki: 'Эльбрус', info: 'Высочайшая вершина России и Европы — 5642 м.' },
  { id: 'kamchatka', name: 'Долина гейзеров', region: 'Камчатский край', emoji: '🌋', wiki: 'Долина гейзеров', info: 'Одно из крупнейших гейзерных полей мира в Кроноцком заповеднике.' },
  { id: 'kizhi', name: 'Кижи', region: 'Республика Карелия', emoji: '⛪', wiki: 'Кижский погост', info: 'Деревянный погост на острове Онежского озера, объект ЮНЕСКО.' },
  { id: 'altai', name: 'Золотые горы Алтая', region: 'Республика Алтай', emoji: '⛰️', wiki: 'Золотые горы Алтая', info: 'Горный край с Телецким озером и горой Белуха — наследие ЮНЕСКО.' },
  { id: 'curonian', name: 'Куршская коса', region: 'Калининградская область', emoji: '🏖️', wiki: 'Куршская коса', info: 'Узкая песчаная коса с «танцующим лесом» и дюнами.' },
  { id: 'lena', name: 'Ленские столбы', region: 'Республика Саха (Якутия)', emoji: '🪨', wiki: 'Ленские столбы', info: 'Гигантские скальные образования вдоль реки Лена.' },
  { id: 'valaam', name: 'Валаам', region: 'Республика Карелия', emoji: '🏝️', wiki: 'Валаам', info: 'Архипелаг на Ладожском озере со старинным монастырём.' },
  { id: 'redsquare', name: 'Красная площадь', region: 'Москва', emoji: '🏛️', wiki: 'Красная площадь', info: 'Сердце столицы: Кремль и собор Василия Блаженного.' },
  { id: 'peterhof', name: 'Петергоф', region: 'Санкт-Петербург', emoji: '⛲', wiki: 'Петергоф (дворцово-парковый ансамбль)', info: 'Дворцово-парковый ансамбль с каскадами фонтанов.' },
  { id: 'sochi', name: 'Красная Поляна', region: 'Краснодарский край', emoji: '🚠', wiki: 'Красная Поляна (Сочи)', info: 'Горный курорт в Кавказских горах рядом с Сочи.' },
  { id: 'sheregesh', name: 'Шерегеш', region: 'Кемеровская область', emoji: '🎿', wiki: 'Шерегеш', info: 'Один из лучших горнолыжных курортов Сибири — гора Зелёная.' },
  { id: 'ergaki', name: 'Природный парк Ергаки', region: 'Красноярский край', emoji: '🏕️', wiki: 'Ергаки', info: 'Скалы и озёра Западного Саяна — мекка для походников.' },
  { id: 'solovki', name: 'Соловецкие острова', region: 'Архангельская область', emoji: '🏰', wiki: 'Соловецкие острова', info: 'Архипелаг в Белом море с историческим монастырём.' },
  { id: 'manpupuner', name: 'Маньпупунёр', region: 'Республика Коми', emoji: '🗿', wiki: 'Маньпупунёр', info: 'Семь столбов выветривания — одно из чудес России.' },
]

// Карточка-награда за каждый 3-й уровень (levelGlobal — сколько всего пройдено)
export function rewardForLevel(levelGlobal: number): Landmark | null {
  if (levelGlobal % 3 !== 0) return null
  const idx = (levelGlobal / 3 - 1) % LANDMARKS.length
  return LANDMARKS[idx]
}
