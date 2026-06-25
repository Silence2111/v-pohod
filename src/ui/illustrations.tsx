import type { CSSProperties } from 'react'

// Фирменные иллюстрации в стиле БЧП (фиолет/мята/янтарь), лёгкий SVG.

// Панорамный пейзаж-герой: горы, тропа, палатка, флаг, солнце.
export function SceneHero({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F0FC" />
          <stop offset="1" stopColor="#FBFAFF" />
        </linearGradient>
        <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9ACE8" />
          <stop offset="1" stopColor="#A99AE0" />
        </linearGradient>
        <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6B54C4" />
          <stop offset="1" stopColor="#5236AF" />
        </linearGradient>
      </defs>

      <rect width="400" height="150" fill="url(#sky)" />

      {/* солнце */}
      <circle cx="330" cy="40" r="20" fill="#F0A024" opacity="0.9" />
      <g stroke="#F0A024" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M330 8v-6M330 78v6M362 40h6M292 40h6M353 17l4-4M303 67l4-4M353 63l4 4M303 13l4 4" />
      </g>

      {/* дальние горы */}
      <path d="M0 110 L70 55 L120 95 L180 45 L250 100 L320 60 L400 105 V150 H0 Z" fill="url(#m1)" opacity="0.55" />
      {/* снежные шапки */}
      <path d="M180 45 l-13 16 l9 -3 l6 7 l7 -8 l8 3 Z" fill="#fff" opacity="0.85" />
      <path d="M70 55 l-10 13 l7 -2 l4 5 l6 -6 Z" fill="#fff" opacity="0.8" />

      {/* ближние горы */}
      <path d="M0 150 L60 80 L130 130 L210 70 L300 130 L360 95 L400 130 V150 Z" fill="url(#m2)" />
      <path d="M210 70 l-15 20 l10 -3 l6 8 l8 -9 l9 4 Z" fill="#fff" opacity="0.9" />

      {/* холм переднего плана */}
      <path d="M0 150 C120 118 280 118 400 150 Z" fill="#8ADBAB" />
      <path d="M0 150 C120 128 280 128 400 150 Z" fill="#6FCF97" opacity="0.6" />

      {/* тропа */}
      <path d="M40 150 C90 138 110 134 150 134 C200 134 215 126 250 122" fill="none"
        stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 8" opacity="0.9" />

      {/* ёлки */}
      <g>
        <path d="M85 138 l8 -16 l8 16 Z" fill="#1FA567" />
        <path d="M85 132 l8 -14 l8 14 Z" fill="#178052" />
        <path d="M105 142 l6 -12 l6 12 Z" fill="#1FA567" />
      </g>

      {/* палатка у старта */}
      <g transform="translate(36,134)">
        <path d="M0 10 L9 -8 L18 10 Z" fill="#F0A024" />
        <path d="M9 -8 L9 10" stroke="#fff" strokeWidth="1.5" />
      </g>

      {/* флаг-цель */}
      <g transform="translate(250,104)">
        <path d="M0 0 L0 20" stroke="#3F2A91" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M0 1 L13 5 L0 9 Z" fill="#5236AF" />
      </g>
    </svg>
  )
}

// Дружелюбный маскот-путешественник (шапка, рюкзак, улыбка).
export function Mascot({ s = 120, style }: { s?: number; style?: CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" style={style} xmlns="http://www.w3.org/2000/svg">
      {/* рюкзак */}
      <rect x="30" y="52" width="60" height="46" rx="16" fill="#1FA567" />
      <rect x="44" y="62" width="32" height="22" rx="7" fill="#178052" />
      {/* тело */}
      <rect x="40" y="46" width="40" height="44" rx="18" fill="#5236AF" />
      {/* лямки */}
      <path d="M50 50 q-8 18 -2 38M70 50 q8 18 2 38" stroke="#3F2A91" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* голова */}
      <circle cx="60" cy="40" r="22" fill="#FFE3C2" />
      {/* шапка */}
      <path d="M38 36 a22 22 0 0 1 44 0 Z" fill="#F0A024" />
      <rect x="34" y="34" width="52" height="7" rx="3.5" fill="#D98A12" />
      <circle cx="60" cy="16" r="4" fill="#FFD27F" />
      {/* лицо */}
      <circle cx="52" cy="42" r="2.6" fill="#3A2A1A" />
      <circle cx="68" cy="42" r="2.6" fill="#3A2A1A" />
      <path d="M53 49 q7 6 14 0" stroke="#3A2A1A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="47" r="3" fill="#F7A38E" opacity="0.6" />
      <circle cx="72" cy="47" r="3" fill="#F7A38E" opacity="0.6" />
    </svg>
  )
}