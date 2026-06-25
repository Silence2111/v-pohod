import { useState } from 'react'
import { Icon } from './icons'
import { BchpLogo } from './Logo'
import { sfx } from './sound'

interface Step {
  icon: string
  title: string
  text: string
}

const STEPS: Step[] = [
  {
    icon: 'map',
    title: 'Команда и карта',
    text: 'Вы — команда из 2–6 человек. Идёте вместе по процедурной карте из плиток. У каждого своя роль с уникальными способностями — нет слабых и главных.',
  },
  {
    icon: 'dice',
    title: 'Как идёт ход',
    text: 'Каждый раунд: бросок погоды (общий) → ваш ход — способность роли, бросок кубика, движение по плиткам, помощь товарищу. Сходили все — новая погода.',
  },
  {
    icon: 'target',
    title: 'Цель похода',
    text: 'Дойдите всей командой от Базы через Промежуточную цель к Главной. Проигрыша нет — важна синергия, а не гонка.',
  },
  {
    icon: 'starFill',
    title: 'Итог и реальный поход',
    text: 'В финале — 1–3 звезды и «история похода» для друзей. А ещё игра подскажет, как собраться в настоящий поход!',
  },
]

export function Intro({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0)
  const last = i === STEPS.length - 1
  const step = STEPS[i]

  const next = () => {
    sfx.click()
    if (last) onClose()
    else setI((v) => v + 1)
  }
  const back = () => {
    sfx.click()
    setI((v) => Math.max(0, v - 1))
  }

  return (
    <div className="tip-overlay">
      <div className="tip-card intro-card" onClick={(e) => e.stopPropagation()}>
        <BchpLogo sm />
        <div className="intro-ic" style={{ marginTop: 10 }}>
          <Icon name={step.icon} s={34} />
        </div>
        <h2 className="intro-title">{step.title}</h2>
        <p className="intro-text">{step.text}</p>

        <div className="intro-dots">
          {STEPS.map((_, k) => (
            <span key={k} className={`intro-dot ${k === i ? 'on' : ''}`} />
          ))}
        </div>

        <div className="flex" style={{ gap: 8 }}>
          {i > 0 ? (
            <button className="btn-secondary" onClick={back}>
              Назад
            </button>
          ) : (
            <button className="btn-ghost" onClick={onClose}>
              Пропустить
            </button>
          )}
          <button className="btn-primary grow" onClick={next}>
            {last ? (
              <>
                <Icon name="boot" s={18} /> В поход!
              </>
            ) : (
              'Далее'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
