import { useState, useRef, useEffect } from 'react'
import { Icon } from './icons'
import './chat.css'

export interface ChatMsg {
  id: number
  from: string
  text: string
}

export function Chat({ messages, onSend }: { messages: ChatMsg[]; onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages.length])

  const send = () => {
    const t = text.trim()
    if (!t) return
    onSend(t.slice(0, 200))
    setText('')
  }

  return (
    <div className="card chat">
      <div className="section-label">
        <Icon name="users" s={13} /> Чат команды
      </div>
      <div className="chat-list" ref={listRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">Напишите команде…</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="chat-msg">
              <b>{m.from}:</b> {m.text}
            </div>
          ))
        )}
      </div>
      <div className="chat-input">
        <input
          value={text}
          maxLength={200}
          placeholder="Сообщение…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
        />
        <button className="btn-primary chat-send" onClick={send} disabled={!text.trim()}>
          <Icon name="share" s={16} />
        </button>
      </div>
    </div>
  )
}
