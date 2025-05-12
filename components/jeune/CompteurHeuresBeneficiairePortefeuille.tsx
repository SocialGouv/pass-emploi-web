export function CompteurHeuresBeneficiairePortefeuille({
  value,
}: {
  value: number
}) {
  const MAX_HEURES = 15
  const PROGRESSION = Math.min((value / MAX_HEURES) * 100, 100)

  let colorClass = ''
  if (value < 10) {
    colorClass = 'bg-warning'
  } else if (value < MAX_HEURES) {
    colorClass = 'bg-alert'
  } else {
    colorClass = 'bg-success'
  }

  return (
    <>
      <div
        className='h-2 rounded-full bg-grey-100 overflow-hidden w-3/4'
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={MAX_HEURES}
        aria-valuenow={value}
        aria-labelledby={`progressLabel-${value}`}
      >
        <div
          className={`h-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${PROGRESSION}%` }}
        />
      </div>
      <p id={`progressLabel-${value}`} className='mt-2'>
        <span className='font-bold'>{value}h</span> déclarée
        {value > 1 ? 's' : ''}
      </p>
    </>
  )
}
