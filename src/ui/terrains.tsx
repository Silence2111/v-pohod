import type { TerrainType } from '../game/types'

// Полноплиточные иллюстрации местностей — живые сцены вместо мелких иконок.
// Уникальные id градиентов с префиксом, чтобы не конфликтовать между типами.

function Plain() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="terr-scene">
      <defs>
        <linearGradient id="pl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eaf6ff" />
          <stop offset="1" stopColor="#f3fbe6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#pl-sky)" />
      <circle cx="80" cy="20" r="11" fill="#FBD36B" />
      <path d="M0 70 Q30 58 55 66 T100 64 V100 H0Z" fill="#bfe08a" />
      <path d="M0 82 Q35 72 70 80 T100 78 V100 H0Z" fill="#9bd06e" />
      <g stroke="#6fae4e" strokeWidth="2" strokeLinecap="round">
        <path d="M18 88 V80M24 88 V82M30 88 V81" />
        <path d="M70 92 V84M76 92 V86M82 92 V85" />
      </g>
      <circle cx="46" cy="86" r="2.4" fill="#E26FA0" />
      <circle cx="46" cy="86" r="1" fill="#fff" />
    </svg>
  )
}

function Forest() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="terr-scene">
      <rect width="100" height="100" fill="#dff0d6" />
      <path d="M0 72 Q50 60 100 72 V100 H0Z" fill="#bcdfa6" />
      {[18, 50, 82].map((x, i) => (
        <g key={i} transform={`translate(${x} ${i === 1 ? 30 : 40})`}>
          <rect x="-3" y="34" width="6" height="12" rx="2" fill="#8a5a33" />
          <path d="M0 -2 L16 22 H-16Z" fill="#2f9e63" />
          <path d="M0 10 L14 34 H-14Z" fill="#1f8a52" />
        </g>
      ))}
    </svg>
  )
}

function Water() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="terr-scene">
      <defs>
        <linearGradient id="wt-w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe4fb" />
          <stop offset="1" stopColor="#7fb9e8" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#wt-w)" />
      <g stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" fill="none">
        <path d="M8 34 q10 -7 20 0 t20 0 t20 0 t20 0" />
        <path d="M4 56 q10 -7 20 0 t20 0 t20 0 t20 0" />
        <path d="M8 78 q10 -7 20 0 t20 0 t20 0 t20 0" />
      </g>
      <ellipse cx="72" cy="64" rx="12" ry="6" fill="#5fae5a" opacity="0.85" />
    </svg>
  )
}

function Swamp() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="terr-scene">
      <defs>
        <linearGradient id="sw-w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa86a" />
          <stop offset="1" stopColor="#6e7a45" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#sw-w)" />
      <ellipse cx="40" cy="60" rx="34" ry="16" fill="#56602f" opacity="0.6" />
      <g fill="#4d5a2b">
        <circle cx="30" cy="58" r="3" />
        <circle cx="52" cy="66" r="2.2" />
        <circle cx="44" cy="54" r="1.6" />
      </g>
      <g stroke="#3f5a2a" strokeWidth="3" strokeLinecap="round">
        <path d="M16 84 V58M22 84 V62M78 86 V60M84 86 V64M72 86 V66" />
      </g>
      <g fill="#7d6a3a">
        <ellipse cx="20" cy="56" rx="4" ry="1.6" />
        <ellipse cx="80" cy="58" rx="4" ry="1.6" />
      </g>
      <rect x="50" y="74" width="30" height="5" rx="2.5" fill="#6b4f2a" transform="rotate(-8 65 76)" />
    </svg>
  )
}

function Mountains() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="terr-scene">
      <defs>
        <linearGradient id="mt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef0fb" />
          <stop offset="1" stopColor="#dfe2f4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#mt-sky)" />
      <path d="M-5 95 L28 38 L52 78 L70 52 L105 95 Z" fill="#9a8fc8" />
      <path d="M52 78 L70 52 L105 95 H52Z" fill="#7e72b8" />
      <path d="M28 38 L20 51 L26 49 L31 57 L36 49 L41 53 Z" fill="#ffffff" />
      <path d="M70 52 L64 62 L69 60 L73 67 L77 60 L81 63 Z" fill="#ffffff" />
      <path d="M-5 95 L28 38 L40 60 L18 95 Z" fill="#a99ed2" />
    </svg>
  )
}

const SCENES: Record<TerrainType, () => JSX.Element> = {
  plain: Plain,
  forest: Forest,
  water: Water,
  swamp: Swamp,
  mountains: Mountains,
}

export function TerrainScene({ terrain }: { terrain: TerrainType }) {
  const S = SCENES[terrain]
  return <S />
}
