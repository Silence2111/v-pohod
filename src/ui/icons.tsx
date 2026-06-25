// Премиальный набор SVG-иконок в едином duotone-стиле.
// Иконки используют currentColor для контуров; родитель задаёт цвет.
// viewBox 24×24, скруглённые штрихи. Заливка-акцент через fillOpacity.

import type { CSSProperties } from 'react'

interface IP {
  s?: number
  className?: string
  style?: CSSProperties
}

const base = (s: number) => ({
  width: s,
  height: s,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
})
const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}
const soft = { fill: 'currentColor', fillOpacity: 0.14 }

type IconFn = (p: Required<Pick<IP, 's'>> & IP) => JSX.Element

// ============ ТЕРРЕЙНЫ ============
const plain: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M3 18c3-1 5-1 9-1s6 0 9 1" {...stroke} />
    <path d="M7 18c0-3 .5-5 1.5-6M12 18c0-4 .5-6 1.5-7M17 18c0-3 .4-5 1.2-6" {...stroke} />
  </svg>
)
const forest: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M12 3 6.5 11h11L12 3Z" {...soft} {...stroke} />
    <path d="M12 8.5 7 15h10l-5-6.5Z" {...soft} {...stroke} />
    <path d="M12 15v5" {...stroke} />
  </svg>
)
const water: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <rect x="3" y="6" width="18" height="13" rx="3" {...soft} />
    <path d="M4 9c2 0 2 1.4 4 1.4S10 9 12 9s2 1.4 4 1.4S18 9 20 9" {...stroke} />
    <path d="M4 13c2 0 2 1.4 4 1.4S10 13 12 13s2 1.4 4 1.4S18 13 20 13" {...stroke} />
  </svg>
)
const swamp: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M3 16c2 0 2 1.3 4 1.3S11 16 13 16s2 1.3 4 1.3 2-1.3 4-1.3" {...stroke} />
    <circle cx="8" cy="12" r="1.1" {...soft} {...stroke} />
    <circle cx="15" cy="10.5" r="1.1" {...soft} {...stroke} />
    <path d="M11 16c0-3 0-5 1-7M16 17c0-3 .3-5 1-6" {...stroke} />
  </svg>
)
const mountains: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M3 19 9 7l4 7 2-3 6 8H3Z" {...soft} {...stroke} />
    <path d="M7.2 11.2 9 7l2.2 4-1.3 1.2L9 11l-.9 1.2-.9-1Z" fill="currentColor" fillOpacity="0.5" />
  </svg>
)

// ============ ОСОБЫЕ ПЛИТКИ ============
const home: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 11 12 4l8 7" {...stroke} />
    <path d="M6 10v9h12v-9" {...soft} {...stroke} />
    <path d="M10 19v-5h4v5" {...stroke} />
  </svg>
)
const flag: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M7 21V4" {...stroke} />
    <path d="M7 5h10l-2.5 3.5L17 12H7" {...soft} {...stroke} />
  </svg>
)
const peak: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M3 20 10 6l4 7 2-3 5 10H3Z" {...soft} {...stroke} />
    <path d="M10 6v-3l3 1.5L10 6" fill="currentColor" {...stroke} />
  </svg>
)

// ============ РОЛИ ============
const scout: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="7.5" cy="14" r="3.2" {...soft} {...stroke} />
    <circle cx="16.5" cy="14" r="3.2" {...soft} {...stroke} />
    <path d="M10.7 13h2.6M6 11l1.5-3h2M18 11l-1.5-3h-2" {...stroke} />
  </svg>
)
const explorer: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="11" cy="11" r="6" {...soft} {...stroke} />
    <path d="m20 20-4-4M9 11h4M11 9v4" {...stroke} />
  </svg>
)
const camp: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M5 20h14" {...stroke} />
    <path d="M7 20l5-12 5 12" {...soft} {...stroke} />
    <path d="M9.5 20 12 8l2.5 12" {...stroke} />
    <path d="M12 5c-1 .8-1 1.7 0 2.5C13 6.7 13 5.8 12 5Z" fill="currentColor" />
  </svg>
)
const music: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="7" cy="17" r="2.4" {...soft} {...stroke} />
    <circle cx="17" cy="15" r="2.4" {...soft} {...stroke} />
    <path d="M9.4 17V7l10-2v10" {...stroke} />
    <path d="M9.4 9 19.4 7" {...stroke} />
  </svg>
)
const camera: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <rect x="3" y="7" width="18" height="12" rx="3" {...soft} {...stroke} />
    <path d="M8 7l1.4-2h5.2L16 7" {...stroke} />
    <circle cx="12" cy="13" r="3" {...stroke} />
  </svg>
)
const rescue: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="12" cy="12" r="8" {...soft} {...stroke} />
    <circle cx="12" cy="12" r="3.4" {...stroke} />
    <path d="M12 4v4M12 16v4M4 12h4M16 12h4" {...stroke} />
  </svg>
)

// ============ АРТЕФАКТЫ ============
const compass: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="12" cy="12" r="8.5" {...soft} {...stroke} />
    <path d="m15 9-2 4-4 2 2-4 4-2Z" fill="currentColor" {...stroke} />
  </svg>
)
const boat: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M3 14h18l-2.2 4.2a2 2 0 0 1-1.8 1.1H7a2 2 0 0 1-1.8-1.1L3 14Z" {...soft} {...stroke} />
    <path d="M12 14V5M12 5l5 3-5 1.5" {...stroke} />
  </svg>
)
const hat: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 15c1.5-5 4-7 8-7s6.5 2 8 7" {...soft} {...stroke} />
    <path d="M3 15h13c2 0 4 .4 5 1.2-1 .8-3 1.3-5 1.3H3v-2.5Z" {...stroke} />
  </svg>
)
const backpack: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M6 9a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" {...soft} {...stroke} />
    <path d="M9 9a3 3 0 0 1 6 0M9 14h6v3H9z" {...stroke} />
  </svg>
)

// ============ ПОГОДА ============
const sun: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="12" cy="12" r="4" {...soft} {...stroke} />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" {...stroke} />
  </svg>
)
const cloud: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M7 18a4 4 0 0 1-.5-8 5 5 0 0 1 9.7-1.2A3.5 3.5 0 0 1 17 18H7Z" {...soft} {...stroke} />
  </svg>
)
const rain: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M7 14a4 4 0 0 1-.5-8 5 5 0 0 1 9.7-1.2A3.5 3.5 0 0 1 17 14H7Z" {...soft} {...stroke} />
    <path d="M8 17l-1 2.5M12 17l-1 2.5M16 17l-1 2.5" {...stroke} />
  </svg>
)
const heat: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="12" cy="10" r="3.4" {...soft} {...stroke} />
    <path d="M12 2.5v1.6M12 16v1.4M4.5 10h1.4M18 10h1.4M6 4l1 1M18 4l-1 1" {...stroke} />
    <path d="M6 19c1-.8 2-.8 3 0s2 .8 3 0 2-.8 3 0 2 .8 3 0" {...stroke} />
  </svg>
)
const wind: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M3 9h9a2.5 2.5 0 1 0-2.5-2.5" {...stroke} />
    <path d="M3 13h13a2.5 2.5 0 1 1-2.5 2.5" {...stroke} />
    <path d="M3 17h7" {...stroke} />
  </svg>
)
const fog: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 8h14M6 12h13M4 16h12M9 20h9" {...stroke} />
  </svg>
)

// ============ КОМАНДНЫЕ КАРТЫ ============
const breath: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 8h8a2.5 2.5 0 1 0-2.5-2.5" {...stroke} />
    <path d="M4 12h12a2.5 2.5 0 1 1-2.5 2.5" {...stroke} />
    <path d="M4 16h6" {...stroke} />
  </svg>
)
const cup: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" {...soft} {...stroke} />
    <path d="M16 10h2a2 2 0 0 1 0 4h-2" {...stroke} />
    <path d="M8 3.5c-.8.8-.8 1.6 0 2.4M11.5 3.5c-.8.8-.8 1.6 0 2.4" {...stroke} />
  </svg>
)
const hands: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M3 12l4-3 5 3 5-3 4 3-4 4-5-2-5 2-4-4Z" {...soft} {...stroke} />
    <path d="M12 12v4" {...stroke} />
  </svg>
)

// ============ UI / РАЗНОЕ ============
const dice: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <rect x="4" y="4" width="16" height="16" rx="4" {...soft} {...stroke} />
    <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    <circle cx="15" cy="9" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="9" cy="15" r="1.2" fill="currentColor" />
    <circle cx="15" cy="15" r="1.2" fill="currentColor" />
  </svg>
)
const starIcon: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path
      d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"
      {...soft}
      {...stroke}
    />
  </svg>
)
const starFill: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path
      d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"
      fill="currentColor"
    />
  </svg>
)
const share: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="6" cy="12" r="2.5" {...soft} {...stroke} />
    <circle cx="17" cy="6" r="2.5" {...soft} {...stroke} />
    <circle cx="17" cy="18" r="2.5" {...soft} {...stroke} />
    <path d="m8.2 10.8 6.6-3.6M8.2 13.2l6.6 3.6" {...stroke} />
  </svg>
)
const boot: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M7 4v9l-2 1c-1 .5-1.5 1.4-1.5 2.5V19h16v-1c0-2-1.5-3-3.5-3.3-2-.3-3-1.2-3-3V4H7Z" {...soft} {...stroke} />
    <path d="M7 9h2.5" {...stroke} />
  </svg>
)
const sparkle: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M12 4c.4 3.4 1.2 4.2 4.6 4.6-3.4.4-4.2 1.2-4.6 4.6-.4-3.4-1.2-4.2-4.6-4.6C10.8 8.2 11.6 7.4 12 4Z" {...soft} {...stroke} />
    <path d="M18 14c.2 1.6.6 2 2.2 2.2-1.6.2-2 .6-2.2 2.2-.2-1.6-.6-2-2.2-2.2 1.6-.2 2-.6 2.2-2.2Z" fill="currentColor" />
  </svg>
)
const tired: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="12" cy="12" r="8.5" {...soft} {...stroke} />
    <path d="M8 10.5s.6-1 1.6-1 1.6 1 1.6 1M13 10.5s.6-1 1.6-1 1.6 1 1.6 1" {...stroke} />
    <path d="M9 15.5c1-.7 5-.7 6 0" {...stroke} />
  </svg>
)
const heart: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" {...soft} {...stroke} />
  </svg>
)
const target: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="12" cy="12" r="8" {...soft} {...stroke} />
    <circle cx="12" cy="12" r="4.5" {...stroke} />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
  </svg>
)
const route: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="6" cy="18" r="2" {...soft} {...stroke} />
    <circle cx="18" cy="6" r="2" {...soft} {...stroke} />
    <path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" strokeDasharray="0.1 3.2" {...stroke} />
  </svg>
)
const swap: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M6 8h11l-2.5-2.5M18 16H7l2.5 2.5" {...stroke} />
  </svg>
)
const check: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="m5 12.5 4.5 4.5L19 6.5" {...stroke} />
  </svg>
)
const puzzle: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 9h2.5a1.6 1.6 0 1 1 3.2 0H12v2.3a1.6 1.6 0 1 0 0 3.2V17H4v-3a1.6 1.6 0 1 1 0-3.2V9Z" {...soft} {...stroke} />
  </svg>
)
const eye: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" {...soft} {...stroke} />
    <circle cx="12" cy="12" r="2.6" {...stroke} />
  </svg>
)
const rock: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 16l3-6 4 2 3-4 6 8H4Z" {...soft} {...stroke} />
  </svg>
)
const bandage: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(45 12 12)" {...soft} {...stroke} />
    <path d="M12 10v4M10 12h4" {...stroke} />
  </svg>
)
const mapIcon: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" {...soft} {...stroke} />
    <path d="M9 4v14M15 6v14" {...stroke} />
  </svg>
)
const users: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <circle cx="9" cy="8" r="3" {...soft} {...stroke} />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" {...stroke} />
    <path d="M16 6a3 3 0 0 1 0 5.7M17 13.5a5.5 5.5 0 0 1 3.5 5" {...stroke} />
  </svg>
)
const scroll: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M6 4h10a2 2 0 0 1 2 2v11a3 3 0 0 0 3-3" {...stroke} />
    <path d="M6 4a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2Z" {...stroke} />
    <path d="M8 7v10a3 3 0 0 0 3 3h7" {...soft} {...stroke} />
    <path d="M11 10h5M11 13h5" {...stroke} />
  </svg>
)

const bulb: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M12 3a6 6 0 0 0-3.8 10.6c.8.7 1.3 1.2 1.3 2.4h5c0-1.2.5-1.7 1.3-2.4A6 6 0 0 0 12 3Z" {...soft} {...stroke} />
    <path d="M9.5 19h5M10.5 21.5h3" {...stroke} />
  </svg>
)
const pin: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" {...soft} {...stroke} />
    <circle cx="12" cy="10" r="2.5" {...stroke} />
  </svg>
)
const link: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M11 13 20 4M15 4h5v5" {...stroke} />
    <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" {...stroke} />
  </svg>
)
const signpost: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M12 3v18" {...stroke} />
    <path d="M12 6h6l2 2-2 2h-6z" {...soft} {...stroke} />
    <path d="M12 13H6l-2 2 2 2h6z" {...stroke} />
  </svg>
)

const sound: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 9v6h3l5 4V5L7 9H4Z" {...soft} {...stroke} />
    <path d="M16 9a3.5 3.5 0 0 1 0 6M18.5 6.5a7 7 0 0 1 0 11" {...stroke} />
  </svg>
)
const mute: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M4 9v6h3l5 4V5L7 9H4Z" {...soft} {...stroke} />
    <path d="M16 10l5 5M21 10l-5 5" {...stroke} />
  </svg>
)
const wifi: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9 9 0 0 1 13 0M8.5 16a4.5 4.5 0 0 1 7 0" {...stroke} />
    <circle cx="12" cy="19.5" r="1.2" fill="currentColor" />
  </svg>
)
const copy: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" {...soft} {...stroke} />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" {...stroke} />
  </svg>
)
const plus: IconFn = ({ s, ...r }) => (
  <svg {...base(s)} {...r}>
    <path d="M12 5v14M5 12h14" {...stroke} />
  </svg>
)

export const ICONS: Record<string, IconFn> = {
  bulb,
  pin,
  link,
  signpost,
  sound,
  mute,
  wifi,
  copy,
  plus,
  // террейны
  plain,
  forest,
  water,
  swamp,
  mountains,
  // плитки
  base: home,
  intermediate: flag,
  main: peak,
  // роли
  scout,
  explorer,
  campKeeper: camp,
  atmosphereKeeper: music,
  impressionsKeeper: camera,
  rescuer: rescue,
  // артефакты
  compass,
  boat,
  headgear: hat,
  gear: backpack,
  // погода
  clear: sun,
  cloudy: cloud,
  rain,
  heat,
  wind,
  fog,
  // карты
  secondWind: breath,
  rest: cup,
  cohesion: hands,
  // ui
  dice,
  star: starIcon,
  starFill,
  share,
  boot,
  sparkle,
  tired,
  heart,
  target,
  route,
  swap,
  check,
  puzzle,
  eye,
  rock,
  bandage,
  map: mapIcon,
  users,
  scroll,
}

export function Icon({ name, s = 24, className, style }: { name: string } & IP) {
  const C = ICONS[name]
  if (!C) return null
  return <C s={s} className={className} style={style} />
}
