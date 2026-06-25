import { BCHP_URL } from '../game/bridge'

// Официальный логотип БЧП (из public/bchp-logo.svg).
export function BchpLogo({ sm, link }: { sm?: boolean; link?: boolean }) {
  const img = (
    <img
      className={`bchp-logo ${sm ? 'sm' : ''}`}
      src={`${import.meta.env.BASE_URL}bchp-logo.svg`}
      alt="Больше, чем путешествие"
    />
  )
  if (!link) return img
  return (
    <a href={BCHP_URL} target="_blank" rel="noopener noreferrer" className="bchp-logo-link">
      {img}
    </a>
  )
}
