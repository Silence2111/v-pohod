import type { GameState, ArtifactId, CardId, PendingAction } from './types'
import * as E from './engine'

// Единое описание хода игрока — сериализуемо (для сети) и применимо детерминированно.
export type Action =
  | { t: 'weather' }
  | { t: 'rollStep' }
  | { t: 'scoutMarch' }
  | { t: 'explorerToggle' }
  | { t: 'campSpecial' }
  | { t: 'impressionsSpecial' }
  | { t: 'request'; kind: PendingAction }
  | { t: 'startTrade'; art: ArtifactId }
  | { t: 'playCard'; card: CardId }
  | { t: 'resolvePlayer'; id: number }
  | { t: 'cancelPending' }
  | { t: 'endTurn' }
  | { t: 'move'; i: number }
  | { t: 'explorerReveal'; i: number }
  | { t: 'resolveTile'; i: number }
  | { t: 'resolveEvent'; i: number }
  | { t: 'dismissTip' }

export function applyAction(s: GameState, a: Action): GameState {
  switch (a.t) {
    case 'weather':
      return E.rollWeather(s)
    case 'rollStep':
      return E.rollStep(s)
    case 'scoutMarch':
      return E.scoutMarch(s)
    case 'explorerToggle':
      return E.explorerToggle(s)
    case 'campSpecial':
      return E.campSpecial(s)
    case 'impressionsSpecial':
      return E.impressionsSpecial(s)
    case 'request':
      return E.requestAction(s, a.kind)
    case 'startTrade':
      return E.startTrade(s, a.art)
    case 'playCard':
      return E.playCard(s, a.card)
    case 'resolvePlayer':
      return E.resolvePlayerTarget(s, a.id)
    case 'cancelPending':
      return E.cancelPending(s)
    case 'endTurn':
      return E.endTurn(s)
    case 'move':
      return E.moveTo(s, a.i)
    case 'explorerReveal':
      return E.explorerReveal(s, a.i)
    case 'resolveTile':
      return E.resolveTileTarget(s, a.i)
    case 'resolveEvent':
      return E.resolveEvent(s, a.i)
    case 'dismissTip':
      return E.dismissTip(s)
  }
}
