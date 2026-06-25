import type { CardId } from './types'

// Случайные события на плитках — добавляют разнообразие и «доброту» в дух игры.
// Эффекты мягкие и в основном позитивные, чтобы не ломать проходимость.

export interface EventEffect {
  story?: number // +жетоны истории
  move?: number // +/− очки движения текущему игроку
  healSelf?: boolean // снять усталость текущему
  healAll?: boolean // снять усталость всем
  card?: CardId // выдать командную карту
}

export interface EventOption {
  label: string
  effect: EventEffect
  result: string
}

export interface GameEvent {
  id: string
  icon: string
  title: string
  text: string
  options: EventOption[]
}

export const EVENTS: GameEvent[] = [
  {
    id: 'wanderer',
    icon: 'heart',
    title: 'Уставший путник',
    text: 'На тропе сидит уставший путник и просит немного помочь ему дойти.',
    options: [
      {
        label: 'Помочь (−1 шаг)',
        effect: { move: -1, story: 2 },
        result: 'Вы помогли путнику — на душе теплее. +2 жетона истории.',
      },
      { label: 'Идти дальше', effect: {}, result: 'Вы пошли своей дорогой.' },
    ],
  },
  {
    id: 'spring',
    icon: 'water',
    title: 'Чистый родник',
    text: 'Из-под камня бьёт прохладный родник.',
    options: [
      {
        label: 'Напиться',
        effect: { healSelf: true, story: 1 },
        result: 'Холодная вода взбодрила — усталость как рукой сняло.',
      },
    ],
  },
  {
    id: 'view',
    icon: 'camera',
    title: 'Захватывающий вид',
    text: 'С пригорка открывается невероятный вид на долину.',
    options: [
      {
        label: 'Полюбоваться',
        effect: { story: 2 },
        result: 'Команда любуется простором. +2 жетона истории.',
      },
    ],
  },
  {
    id: 'shortcut',
    icon: 'route',
    title: 'Короткая тропа',
    text: 'Вы заметили незаметную тропинку в обход.',
    options: [
      {
        label: 'Пройти по ней',
        effect: { move: 1 },
        result: 'Тропа сократила путь! +1 очко движения.',
      },
    ],
  },
  {
    id: 'forgotten_pack',
    icon: 'backpack',
    title: 'Забытый рюкзак',
    text: 'В кустах кто-то оставил рюкзак с припасами.',
    options: [
      {
        label: 'Взять припасы',
        effect: { card: 'rest' },
        result: 'Команда получает командную карту «Привал».',
      },
    ],
  },
  {
    id: 'songbird',
    icon: 'music',
    title: 'Песня у костра',
    text: 'Вечереет. Кто-то затягивает походную песню.',
    options: [
      {
        label: 'Подпеть всем вместе',
        effect: { healAll: true, story: 1 },
        result: 'Песня придала сил всей команде — усталость снята.',
      },
    ],
  },
]

export const EVENT_BY_ID: Record<string, GameEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
)
