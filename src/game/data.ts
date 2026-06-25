import type {
  TerrainType,
  RoleId,
  ArtifactId,
  WeatherId,
  MapSize,
  CardId,
} from './types'

// ===== Фирменная палитра «Больше, чем путешествие» (точные бренд-цвета) =====
export const BRAND = {
  violet: '#5236AF',
  mint: '#8ADBAB',
  lime: '#A9E44D',
  blue: '#7E96CD',
  ink: '#252525',
  grey: '#5C5C5C',
  light: '#F5F5F5',
}

// Цвета игроков — фирменные, насыщенные, различимые на светлом фоне
export const PLAYER_COLORS = [
  '#5236AF', // бренд-фиолет
  '#1FA567', // зелёный
  '#F0A024', // янтарь
  '#0077FF', // синий
  '#F75A40', // коралл
  '#019EA7', // бирюза
]

// ===== Пять типов местности =====
export interface TerrainInfo {
  id: TerrainType
  name: string
  icon: string
  bg: string
  hard: boolean
  threshold: number // бросок, нужный для входа
  helper?: ArtifactId // артефакт, снижающий порог
  helped?: number // порог при наличии артефакта
  desc: string
}

// Модель «бросок ≥ порог»: чтобы войти на плитку, нужно выбросить ≥ threshold.
// Свой артефакт снижает порог местности до helped.
export const TERRAIN: Record<TerrainType, TerrainInfo> = {
  plain: {
    id: 'plain',
    name: 'Равнина',
    icon: '🌾',
    bg: '#EAF3DA',
    hard: false,
    threshold: 1,
    desc: 'Проходится при броске 1 и выше.',
  },
  forest: {
    id: 'forest',
    name: 'Лес',
    icon: '🌲',
    bg: '#D2EEDC',
    hard: false,
    threshold: 3,
    helper: 'compass',
    helped: 1,
    desc: 'Нужен бросок 3+. С Компасом — 1+.',
  },
  water: {
    id: 'water',
    name: 'Водоём',
    icon: '💧',
    bg: '#D9EAFC',
    hard: false,
    threshold: 4,
    helper: 'boat',
    helped: 2,
    desc: 'Нужен бросок 4+. С Плавсредством — 2+.',
  },
  swamp: {
    id: 'swamp',
    name: 'Болото',
    icon: '🟤',
    bg: '#ECE6CE',
    hard: true,
    threshold: 5,
    helper: 'gear',
    helped: 3,
    desc: 'Нужен бросок 5+. Со Спецснаряжением — 3+.',
  },
  mountains: {
    id: 'mountains',
    name: 'Горы',
    icon: '⛰️',
    bg: '#E7E4F0',
    hard: true,
    threshold: 6,
    helper: 'headgear',
    helped: 3,
    desc: 'Нужен бросок 6. С Головным убором — 3+.',
  },
}

// ===== Шесть ролей (1 постоянное + 1 особое) =====
export interface RoleInfo {
  id: RoleId
  name: string
  icon: string
  motto: string
  passive: string
  special: string
  specialName: string
  charges: number
  raises: string
  startArtifacts: number
}

export const ROLES: Record<RoleId, RoleInfo> = {
  scout: {
    id: 'scout',
    name: 'Разведчик',
    icon: '🧭',
    motto: '«Я пойду первым»',
    passive: 'В начале своего хода открывает 1 соседнюю закрытую плитку.',
    special: 'Единственный в игре дополнительный шаг: +3 очка движения в этом ходу.',
    specialName: 'Быстрый марш',
    charges: 1,
    raises: 'Лидерство, планирование',
    startArtifacts: 0,
  },
  explorer: {
    id: 'explorer',
    name: 'Исследователь',
    icon: '🔎',
    motto: '«Почему здесь такие камни?»',
    passive: 'Игнорирует 1 эффект сложной местности на своём ходу (включить перед движением).',
    special: 'Разведка карты: открыть любую 1 закрытую плитку.',
    specialName: 'Разведка карты',
    charges: 1,
    raises: 'Любознательность, анализ',
    startArtifacts: 0,
  },
  campKeeper: {
    id: 'campKeeper',
    name: 'Хранитель лагеря',
    icon: '🏕️',
    motto: '«Кто голоден?»',
    passive: 'Раз в свой ход снимает 1 усталость у любого игрока (без требования соседства).',
    special: 'Тёплый привал: отменяет эффект погоды для всей команды на этот раунд.',
    specialName: 'Тёплый привал',
    charges: 1,
    raises: 'Ответственность, забота',
    startArtifacts: 0,
  },
  atmosphereKeeper: {
    id: 'atmosphereKeeper',
    name: 'Хранитель атмосферы',
    icon: '🎶',
    motto: '«Давайте споём!»',
    passive: 'Раз в раунд даёт +1 к шагу любому другому игроку.',
    special: 'Отменяет негативный эффект (усталость) у любого игрока.',
    specialName: 'Поддержка',
    charges: 2,
    raises: 'Эмпатия, дипломатия',
    startArtifacts: 0,
  },
  impressionsKeeper: {
    id: 'impressionsKeeper',
    name: 'Хранитель впечатлений',
    icon: '📸',
    motto: '«Какой закат!»',
    passive: 'За каждую новую открытую плитку команда получает +1 жетон истории.',
    special: 'Памятный кадр: превратить 5 жетонов истории в +4 очка движения команде сейчас.',
    specialName: 'Памятный кадр',
    charges: 1,
    raises: 'Самовыражение, память',
    startArtifacts: 0,
  },
  rescuer: {
    id: 'rescuer',
    name: 'Спасатель',
    icon: '🛟',
    motto: '«Я выведу. Спокойно.»',
    passive: 'Раз в свой ход отменяет 1 серьёзный штраф (усталость) у себя или любого игрока.',
    special: 'Спасательная операция: переместить любого игрока на соседнюю клетку.',
    specialName: 'Спасательная операция',
    charges: 1,
    raises: 'Безопасность, стрессоустойчивость',
    startArtifacts: 2,
  },
}

export const ROLE_ORDER: RoleId[] = [
  'scout',
  'explorer',
  'campKeeper',
  'atmosphereKeeper',
  'impressionsKeeper',
  'rescuer',
]

// ===== Четыре артефакта =====
export interface ArtifactInfo {
  id: ArtifactId
  name: string
  icon: string
  desc: string
}

export const ARTIFACTS: Record<ArtifactId, ArtifactInfo> = {
  compass: {
    id: 'compass',
    name: 'Компас',
    icon: '🧭',
    desc: 'Всегда видны соседние плитки (снимает скрытость леса вокруг владельца).',
  },
  boat: {
    id: 'boat',
    name: 'Плавсредство',
    icon: '🛶',
    desc: 'Переправа через водоём стоит 1 очко вместо 2.',
  },
  headgear: {
    id: 'headgear',
    name: 'Головной убор',
    icon: '🧢',
    desc: 'Игнорирует эффект погоды «Жара».',
  },
  gear: {
    id: 'gear',
    name: 'Спецснаряжение',
    icon: '🎒',
    desc: 'Вход в болото без «6» / игнор 1 сложной местности за ход.',
  },
}

// ===== Шесть погодных карт (штрафы только −1/−2) =====
export interface WeatherInfo {
  id: WeatherId
  name: string
  icon: string
  desc: string
}

export const WEATHER: Record<WeatherId, WeatherInfo> = {
  clear: { id: 'clear', name: 'Ясно', icon: '☀️', desc: '+1 к первому шагу для всех.' },
  cloudy: { id: 'cloudy', name: 'Облачность', icon: '⛅', desc: 'Нейтрально.' },
  rain: { id: 'rain', name: 'Дождь', icon: '🌧️', desc: 'Вход на сложную местность стоит +1 очко.' },
  heat: { id: 'heat', name: 'Жара', icon: '🔥', desc: 'Следующий бросок −1 (Головной убор отменяет).' },
  wind: { id: 'wind', name: 'Ветер', icon: '💨', desc: 'Нельзя возвращаться на уже пройденную в этом ходу плитку.' },
  fog: { id: 'fog', name: 'Туман', icon: '🌫️', desc: 'Все двигаются на 1 клетку меньше (минимум 1).' },
}

export const WEATHER_ORDER: WeatherId[] = ['clear', 'cloudy', 'rain', 'heat', 'wind', 'fog']

// ===== Командные карты (небольшой набор) =====
export interface CardInfo {
  id: CardId
  name: string
  icon: string
  desc: string
}

export const CARDS: Record<CardId, CardInfo> = {
  secondWind: {
    id: 'secondWind',
    name: 'Второе дыхание',
    icon: '🌬️',
    desc: '+1 к шагу всей команде в следующем броске.',
  },
  rest: {
    id: 'rest',
    name: 'Привал',
    icon: '☕',
    desc: 'Снимает усталость у всех игроков.',
  },
  cohesion: {
    id: 'cohesion',
    name: 'Сплочённость',
    icon: '🤝',
    desc: 'Переброс кубика текущему игроку.',
  },
}

export const CARD_ORDER: CardId[] = ['secondWind', 'rest', 'cohesion']

// ===== Размеры карты =====
export interface SizeInfo {
  id: MapSize
  name: string
  cols: number
  rows: number
  hardRatio: number
  targetRounds: number
}

export const SIZES: Record<MapSize, SizeInfo> = {
  small: { id: 'small', name: 'Маленькое', cols: 4, rows: 4, hardRatio: 0.18, targetRounds: 7 },
  medium: { id: 'medium', name: 'Среднее', cols: 5, rows: 5, hardRatio: 0.22, targetRounds: 11 },
  large: { id: 'large', name: 'Большое', cols: 6, rows: 6, hardRatio: 0.26, targetRounds: 16 },
}
