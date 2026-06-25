// Headless-проверка проходимости: жадный авто-игрок ведёт команду к победе.
import * as E from './src/game/engine'
import type { GameState, MapSize } from './src/game/types'
import { ROLE_ORDER } from './src/game/data'
import { neighbors } from './src/game/map'

// Взвешенное расстояние (Дейкстра): сложная местность дороже — бот держится равнинного коридора.
function bfsDist(s: GameState, from: number, to: number): number {
  const W: Record<string, number> = { plain: 1, forest: 1, water: 3, swamp: 6, mountains: 8 }
  const dist = new Map<number, number>([[from, 0]])
  const pq: [number, number][] = [[0, from]]
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, cur] = pq.shift()!
    if (cur === to) return d
    if (d > (dist.get(cur) ?? Infinity)) continue
    for (const nb of neighbors(cur, s.cols, s.rows)) {
      const nd = d + (W[s.tiles[nb].terrain] ?? 1)
      if (nd < (dist.get(nb) ?? Infinity)) {
        dist.set(nb, nd)
        pq.push([nd, nb])
      }
    }
  }
  return dist.get(to) ?? Infinity
}

// Куда стремиться: если команда ещё не была на промежуточной — туда, иначе на главную
function goalFor(s: GameState): number {
  const team = s.players.some((p) => p.visitedIntermediate)
  const inter = s.tiles.findIndex((t) => t.kind === 'intermediate')
  const main = s.tiles.findIndex((t) => t.kind === 'main')
  return team ? main : inter
}

function playOne(size: MapSize, nPlayers: number): { win: boolean; rounds: number; stars: number } {
  const configs = Array.from({ length: nPlayers }, (_, i) => ({
    name: `P${i + 1}`,
    role: ROLE_ORDER[i % ROLE_ORDER.length], gender: (i % 2 === 0 ? "m" : "f") as any,
  }))
  let s = E.createGame(configs, size)
  let guard = 0
  const MAX = 1500

  while (s.phase !== 'finished' && guard++ < MAX) {
    if (s.phase === 'weather') {
      s = E.rollWeather(s)
      continue
    }
    // ход игрока (модель «бросок ≥ порог»: один бросок → одно перемещение)
    const p = s.players[s.current]
    s = E.rollStep(s)
    if (p.role === 'scout' && p.specialCharges > 0) s = E.scoutMarch(s) // доп. шаг
    if (p.role === 'explorer') s = E.explorerToggle(s) // игнор сложной

    let safety = 0
    while (s.phase === 'turn' && safety++ < 8) {
      if (!s.turn.rolled) s = E.rollStep(s) // доп. бросок после «Быстрого марша»
      if (s.turn.moved) break
      const me = s.players[s.current]
      const goal = goalFor(s)
      if (me.pos === goal) break // уже на цели — стоим
      const options = neighbors(me.pos, s.cols, s.rows)
        .map((nb) => ({ nb, ok: E.checkMove(s, nb).ok }))
        .filter((o) => o.ok)
      if (options.length === 0) break
      options.sort((a, b) => bfsDist(s, a.nb, goal) - bfsDist(s, b.nb, goal))
      s = E.moveTo(s, options[0].nb)
    }
    if (s.phase === 'finished') break
    s = E.endTurn(s)
  }

  return { win: s.phase === 'finished', rounds: s.round, stars: s.stars }
}

const sizes: MapSize[] = ['small', 'medium', 'large']
let total = 0
let wins = 0
const starCount: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
let roundSum = 0
for (const size of sizes) {
  for (let players = 2; players <= 6; players++) {
    for (let rep = 0; rep < 20; rep++) {
      const r = playOne(size, players)
      total++
      if (r.win) {
        wins++
        roundSum += r.rounds
        starCount[r.stars] = (starCount[r.stars] || 0) + 1
      } else {
        console.log(`LOSS/STALL: size=${size} players=${players} rounds=${r.rounds}`)
      }
    }
  }
}
console.log('================ РЕЗУЛЬТАТ СИМУЛЯЦИИ ================')
console.log(`Партий: ${total}, побед: ${wins} (${((wins / total) * 100).toFixed(1)}%)`)
console.log(`Средн. раундов до победы: ${(roundSum / Math.max(1, wins)).toFixed(1)}`)
console.log(`Звёзды: ⭐=${starCount[1]} ⭐⭐=${starCount[2]} ⭐⭐⭐=${starCount[3]}`)
