// ===== Базовые перечисления по обязательному своду механики =====

export type TerrainType = 'plain' | 'forest' | 'water' | 'swamp' | 'mountains'

export type RoleId =
  | 'scout' // Разведчик
  | 'explorer' // Исследователь
  | 'campKeeper' // Хранитель лагеря
  | 'atmosphereKeeper' // Хранитель атмосферы
  | 'impressionsKeeper' // Хранитель впечатлений
  | 'rescuer' // Спасатель

export type ArtifactId = 'compass' | 'boat' | 'headgear' | 'gear'

export type WeatherId = 'clear' | 'cloudy' | 'rain' | 'heat' | 'wind' | 'fog'

export type CardId = 'secondWind' | 'rest' | 'cohesion'

export type MapSize = 'small' | 'medium' | 'large'

export type TileKind = 'normal' | 'base' | 'intermediate' | 'main'

// ===== Сущности игрового состояния =====

export interface Tile {
  index: number
  row: number
  col: number
  terrain: TerrainType
  kind: TileKind
  revealed: boolean // тип плитки открыт игрокам
  artifact?: ArtifactId // находка на карте
}

export type Gender = 'm' | 'f'

export interface Player {
  id: number
  name: string
  role: RoleId
  gender: Gender
  color: string
  pos: number // индекс плитки
  artifacts: ArtifactId[]
  fatigue: number // усталость: каждое очко = −1 к следующему броску (мин. бросок 1)
  boost: number // бонус к следующему броску (например, от Хранителя атмосферы)
  // заряды особых действий (особое = ограниченное)
  specialCharges: number
  // отметки использования за партию (для рейтинга «задействованы способности всех»)
  usedPassive: boolean
  usedSpecial: boolean
  visitedIntermediate: boolean
}

// Эффекты, действующие в рамках текущего хода игрока (модель «бросок ≥ порог»)
export interface TurnState {
  rolled: boolean // бросок сделан
  lastRoll: number // итоговый бросок (с учётом усталости/бонусов/погоды)
  moved: boolean // ход уже сделан (1 перемещение за бросок)
  extraMove: boolean // Разведчик дал доп. перемещение
  ignoreDifficult: boolean // Исследователь: пройти 1 сложную местность без порога
  scoutMarchUsed: boolean // «Быстрый марш» использован
  passiveHelpUsed: boolean // пассивная помощь команде использована в этом ходу
}

export type Phase = 'setup' | 'weather' | 'turn' | 'finished'

export interface GameAchvStats {
  mountains: number // входов в горы
  swamps: number // входов в болото
  trades: number // передач снаряжения
  cards: number // сыграно командных карт
  events: number // разрешено событий
}

export interface GameState {
  phase: Phase
  mode: 'normal' | 'daily' | 'chapter'
  dailyKey?: string // ключ даты для «Похода дня»
  level?: number // глобальный индекс уровня (режим глав)
  size: MapSize
  cols: number
  rows: number
  tiles: Tile[]
  players: Player[]
  current: number // индекс игрока, чей ход
  round: number
  weather: WeatherId
  weatherSuppressed: boolean // «Тёплый привал» Хранителя лагеря
  weatherRerolls: number // доступные перебросы погоды (даются на перевале/промеж. цели)
  storyTokens: number // жетоны истории команды
  commandCards: CardId[] // общая «рука» командных карт
  jointTaskDone: boolean // совместная задача выполнена
  tip: string | null // активная подсказка «в игре → в жизни» (id из TIPS)
  seenTips: string[] // уже показанные подсказки (каждая 1 раз за партию)
  event: string | null // активное событие на плитке (id из EVENTS)
  achv: GameAchvStats // счётчики для достижений
  turn: TurnState
  log: LogEntry[]
  // вспом. для способностей, требующих выбора цели
  pending?: PendingAction
  targetRounds: number
  stars: number
}

export interface LogEntry {
  round: number
  icon: string
  text: string
  highlight?: boolean
}

export type PendingAction =
  | { kind: 'explorerReveal' } // открыть любую плитку
  | { kind: 'campRemoveFatigue' } // снять усталость у любого
  | { kind: 'atmosphereBoost' } // +1 другому игроку
  | { kind: 'atmosphereCleanse' } // снять негатив у любого
  | { kind: 'rescuerRemove' } // снять серьёзный штраф
  | { kind: 'rescuerMove' } // переместить игрока на соседнюю
  | { kind: 'rescuerMoveTarget'; playerId: number } // выбрать клетку для перемещения
  | { kind: 'trade'; artifact: ArtifactId } // обмен артефактом
