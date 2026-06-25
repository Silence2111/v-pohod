import type { Tile, TerrainType, MapSize, ArtifactId } from './types'
import { SIZES } from './data'
import type { RNG } from './rng'

export const idx = (r: number, c: number, cols: number) => r * cols + c
export const inBounds = (r: number, c: number, rows: number, cols: number) =>
  r >= 0 && c >= 0 && r < rows && c < cols

export function neighbors(i: number, cols: number, rows: number): number[] {
  const r = Math.floor(i / cols)
  const c = i % cols
  const res: number[] = []
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
  for (const [dr, dc] of deltas) {
    const nr = r + dr
    const nc = c + dc
    if (inBounds(nr, nc, rows, cols)) res.push(idx(nr, nc, cols))
  }
  return res
}

// L-образный коридор между двумя клетками — для гарантии проходимости
function corridor(a: number, b: number, cols: number): Set<number> {
  const set = new Set<number>()
  let r = Math.floor(a / cols)
  let c = a % cols
  const tr = Math.floor(b / cols)
  const tc = b % cols
  set.add(idx(r, c, cols))
  while (c !== tc) {
    c += c < tc ? 1 : -1
    set.add(idx(r, c, cols))
  }
  while (r !== tr) {
    r += r < tr ? 1 : -1
    set.add(idx(r, c, cols))
  }
  return set
}

export interface GeneratedMap {
  tiles: Tile[]
  cols: number
  rows: number
  base: number
  intermediate: number
  main: number
}

export interface MapOptions {
  theme?: TerrainType // тематическая местность главы (чаще встречается)
  hardRatio?: number // переопределение доли сложной местности
}

export function generateMap(
  size: MapSize,
  rng: RNG = Math.random,
  opts: MapOptions = {},
): GeneratedMap {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const { cols, rows } = SIZES[size]
  const hardRatio = opts.hardRatio ?? SIZES[size].hardRatio
  const theme = opts.theme
  // Пул «несложной» местности с уклоном в тему главы
  const easyPool: TerrainType[] = ['plain', 'plain', 'forest', 'forest', 'water']
  if (theme && theme !== 'plain') easyPool.push(theme, theme, theme)
  const hardPool: TerrainType[] = ['swamp', 'mountains']
  if (theme === 'swamp' || theme === 'mountains') hardPool.push(theme, theme)
  const n = cols * rows

  const base = idx(rows - 1, 0, cols) // нижний-левый угол
  const main = idx(0, cols - 1, cols) // верхний-правый угол
  // Промежуточная цель — в центральной зоне, со смещением
  const midR = Math.floor(rows / 2)
  const midC = Math.floor(cols / 2)
  const intermediate = idx(midR, Math.max(0, midC - (rng() < 0.5 ? 1 : 0)), cols)

  // Гарантированный коридор: База → Промежуточная → Главная
  const safe = new Set<number>([
    ...corridor(base, intermediate, cols),
    ...corridor(intermediate, main, cols),
  ])

  const centerR = (rows - 1) / 2
  const centerC = (cols - 1) / 2
  const maxDist = Math.hypot(centerR, centerC)

  const tiles: Tile[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    let terrain: TerrainType = 'plain'

    if (!safe.has(i)) {
      // Чем ближе к центру — тем выше шанс сложной местности
      const dist = Math.hypot(r - centerR, c - centerC)
      const centrality = 1 - dist / maxDist // 0..1
      const hardChance = hardRatio + centrality * 0.35

      const roll = rng()
      if (roll < hardChance) {
        terrain = pick<TerrainType>(hardPool)
      } else {
        terrain = pick<TerrainType>(easyPool)
      }
    } else {
      // Безопасный коридор: только равнины (стоимость 1) — гарантия проходимости
      // при любом броске (минимальный бросок = 1), без soft-lock.
      terrain = 'plain'
    }

    let kind: Tile['kind'] = 'normal'
    if (i === base) {
      kind = 'base'
      terrain = 'plain'
    } else if (i === intermediate) {
      kind = 'intermediate'
      terrain = 'plain'
    } else if (i === main) {
      kind = 'main'
      terrain = 'plain'
    }

    tiles.push({ index: i, row: r, col: c, terrain, kind, revealed: false })
  }

  // Размещаем 4 артефакта-находки на обычных проходимых плитках (не на целях/базе)
  const artifactPool: ArtifactId[] = ['compass', 'boat', 'headgear', 'gear']
  const candidates = tiles
    .filter((t) => t.kind === 'normal' && t.terrain !== 'mountains' && t.terrain !== 'swamp')
    .map((t) => t.index)
  for (const art of artifactPool) {
    if (candidates.length === 0) break
    const ci = Math.floor(rng() * candidates.length)
    const tileIndex = candidates.splice(ci, 1)[0]
    tiles[tileIndex].artifact = art
  }

  // Открываем Базу и её соседей в начале
  tiles[base].revealed = true
  for (const nb of neighbors(base, cols, rows)) tiles[nb].revealed = true

  return { tiles, cols, rows, base, intermediate, main }
}
