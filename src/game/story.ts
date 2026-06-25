import type { GameState } from './types'
import { ROLES, SIZES } from './data'

// Собирает «историю похода» — текстовый итог для публикации в соцсетях
export function buildStory(s: GameState): string {
  const names = s.players.map((p) => p.name).join(', ')
  const sizeName = SIZES[s.size].name.toLowerCase()
  const stars = '⭐'.repeat(s.stars) + '☆'.repeat(3 - s.stars)

  const highlights = s.log
    .filter((e) => e.highlight)
    .map((e) => `  ${e.icon} ${e.text}`)
    .slice(0, 14)
    .join('\n')

  const foundArtifacts = s.players.flatMap((p) => p.artifacts)
  const artifactLine =
    foundArtifacts.length > 0
      ? `Собрано снаряжение: ${foundArtifacts.length} артефакт(ов).`
      : 'Дошли без лишнего снаряжения.'

  const roleLines = s.players
    .map((p) => {
      const r = ROLES[p.role]
      const used = p.usedPassive || p.usedSpecial ? 'проявил(а) себя' : 'был(а) рядом'
      return `  ${r.icon} ${p.name} — ${r.name}, ${used}.`
    })
    .join('\n')

  return [
    `🥾 История похода «В Поход!»`,
    `Команда: ${names}`,
    `Карта: ${sizeName}, маршрут База → Промежуточная цель → Главная цель.`,
    ``,
    `Главные моменты:`,
    highlights || '  Тихий, но дружный поход.',
    ``,
    roleLines,
    ``,
    artifactLine,
    `Дошли за ${s.round} раунд(ов). Жетонов истории: ${s.storyTokens}.`,
    ``,
    `Итог: ${stars}`,
    `#ВПоход #БольшеЧемПутешествие #ПоходыПервых`,
  ].join('\n')
}
