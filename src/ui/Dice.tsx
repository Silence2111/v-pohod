// Игровой кубик у поля: показывает выпавшее число 1–6 с анимацией броска.
// Перемонтируется по key при каждом новом броске → проигрывает «бросок и приземление».

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

export function Dice({ value, rolled }: { value: number; rolled: boolean }) {
  const v = rolled ? Math.min(6, Math.max(1, value)) : 0
  return (
    <div className="dice-wrap" title={rolled ? `Выпало: ${value}` : 'Бросьте кубик'}>
      <div className={`die ${rolled ? 'rolled' : 'idle'}`}>
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
      <div className="dice-cap">{rolled ? value : 'кубик'}</div>
    </div>
  )
}
