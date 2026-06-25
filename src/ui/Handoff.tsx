import type { Player } from '../game/types'
import { ROLES } from '../game/data'
import { Icon } from './icons'

interface Props {
  player: Player
  onReady: () => void
}

// Передача устройства следующему игроку (поочерёдный режим).
export function Handoff({ player, onReady }: Props) {
  const role = ROLES[player.role]
  return (
    <div className="handoff">
      <div className="handoff-card">
        <div className="handoff-pass">
          <Icon name="swap" s={16} /> Передайте устройство
        </div>
        <div className="handoff-avatar" style={{ borderColor: player.color, color: player.color }}>
          <Icon name={player.role} s={46} />
        </div>
        <div className="handoff-name">{player.name}</div>
        <div className="handoff-role">{role.name}</div>
        <p className="handoff-motto">
          {role.motto} — твой ход. Соберитесь и помогите команде дойти вместе.
        </p>
        <button className="handoff-go" onClick={onReady}>
          <Icon name="boot" s={18} /> Я готов(а)
        </button>
      </div>
    </div>
  )
}
