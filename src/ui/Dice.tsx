// Игровой кубик у поля: показывает выпавшее число 1–6 с анимацией броска.
// Когда бросок ещё не сделан и передан onRoll — кубик кликабелен (бросок без скролла).

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

export function Dice({
  value,
  rolled,
  onRoll,
}: {
  value: number
  rolled: boolean
  onRoll?: () => void
}) {
  const v = rolled ? Math.min(6, Math.max(1, value)) : 0
  const clickable = !rolled && !!onRoll

  const inner = (
    <div className={`die ${rolled ? 'rolled' : 'idle'} ${clickable ? 'can-roll' : ''}`}>
      {rolled ? (
        <div className="die-face">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={`pip ${PIPS[v]?.includes(i) ? 'on' : ''}`} />
          ))}
        </div>
      ) : (
        <div className="die-face die-q">?</div>
      )}
    </div>
  )

  if (clickable) {
    return (
      <button className="dice-wrap dice-btn" onClick={onRoll} title="Бросить кубик">
        {inner}
        <div className="dice-cap pulse-cap">Бросить</div>
      </button>
    )
  }

  return (
    <div className="dice-wrap" title={rolled ? `Выпало: ${value}` : 'Бросьте кубик'}>
      {inner}
      <div className="dice-cap">{rolled ? value : 'кубик'}</div>
    </div>
  )
}
