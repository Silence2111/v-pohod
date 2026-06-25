import { Peer } from 'peerjs'
import type { DataConnection } from 'peerjs'
import type { GameState } from './types'
import type { Action } from './actions'

// Онлайн-кооператив через PeerJS (бесплатный публичный брокер, без своего сервера).
// Модель: хост авторитетен (держит игру), гости шлют действия и получают состояние.

const PREFIX = 'vpohod-room-'

// ICE-серверы: STUN (для своей сети) + бесплатный TURN (ретрансляция через NAT/файрвол).
// Без TURN соединение между игроками за разными роутерами часто не устанавливается.
const ICE = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]
const PEER_OPTS = { config: { iceServers: ICE } }

type Msg =
  | { type: 'state'; state: GameState }
  | { type: 'action'; action: Action }

function genCode(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // без похожих символов
  let s = ''
  for (let i = 0; i < 5; i++) s += abc[Math.floor(Math.random() * abc.length)]
  return s
}

export interface HostHandle {
  role: 'host'
  code: string
  broadcast: (state: GameState) => void
  count: () => number
  close: () => void
}

export interface GuestHandle {
  role: 'guest'
  send: (action: Action) => void
  close: () => void
}

export type NetHandle = HostHandle | GuestHandle

// Создать комнату (хост)
export function createHost(opts: {
  onReady: (code: string) => void
  onAction: (action: Action) => void
  onPeers: (n: number) => void
  onError: (msg: string) => void
}): HostHandle {
  const code = genCode()
  const peer = new Peer(PREFIX + code, PEER_OPTS)
  const conns: DataConnection[] = []
  let lastState: GameState | null = null

  peer.on('open', () => opts.onReady(code))
  peer.on('error', (e) => opts.onError(e.type || 'error'))
  peer.on('connection', (conn) => {
    conn.on('open', () => {
      conns.push(conn)
      if (lastState) conn.send({ type: 'state', state: lastState })
      opts.onPeers(conns.length)
    })
    conn.on('data', (d) => {
      const m = d as Msg
      if (m && m.type === 'action') opts.onAction(m.action)
    })
    conn.on('close', () => {
      const i = conns.indexOf(conn)
      if (i >= 0) conns.splice(i, 1)
      opts.onPeers(conns.length)
    })
  })

  return {
    role: 'host',
    code,
    broadcast(state) {
      lastState = state
      for (const c of conns) {
        try {
          c.send({ type: 'state', state })
        } catch {
          /* ignore */
        }
      }
    },
    count: () => conns.length,
    close() {
      try {
        peer.destroy()
      } catch {
        /* ignore */
      }
    },
  }
}

// Подключиться к комнате (гость)
export function joinRoom(
  code: string,
  opts: {
    onState: (state: GameState) => void
    onStatus: (status: 'connecting' | 'connected' | 'closed' | 'error') => void
  },
): GuestHandle {
  const peer = new Peer(undefined as unknown as string, PEER_OPTS)
  let conn: DataConnection | null = null
  opts.onStatus('connecting')

  peer.on('open', () => {
    conn = peer.connect(PREFIX + code.trim().toUpperCase(), { reliable: true })
    conn.on('open', () => opts.onStatus('connected'))
    conn.on('data', (d) => {
      const m = d as Msg
      if (m && m.type === 'state') opts.onState(m.state)
    })
    conn.on('close', () => opts.onStatus('closed'))
    conn.on('error', () => opts.onStatus('error'))
  })
  peer.on('error', () => opts.onStatus('error'))

  return {
    role: 'guest',
    send(action) {
      try {
        conn?.send({ type: 'action', action })
      } catch {
        /* ignore */
      }
    },
    close() {
      try {
        peer.destroy()
      } catch {
        /* ignore */
      }
    },
  }
}
