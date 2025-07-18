export function ProgressComptageHeure({
  heures,
  label,
  bgColor = 'grey-100',
  className,
}: {
  heures: number
  label: string
  bgColor?: string
  className?: string
}) {
  const MAX_HEURES = 15
  const PROGRESSION_HEURES = Math.min((heures / MAX_HEURES) * 100, 100)

  function getColorClass(nbHeures: number) {
    if (nbHeures < 10) {
      return 'bg-warning'
    } else if (nbHeures < MAX_HEURES) {
      return 'bg-alert'
    } else {
      return 'bg-success'
    }
  }

  return (
    <>
      <div
        className={`h-2 rounded-full bg-${bgColor} overflow-hidden ${className ?? ''}`}
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={MAX_HEURES}
        aria-valuenow={heures}
        aria-labelledby={`progressLabel-${heures}`}
      >
        <div
          className={`h-full transition-all duration-300 ${getColorClass(heures)}`}
          style={{ width: `${PROGRESSION_HEURES}%` }}
        />
      </div>
      <p id={`progressLabel-${heures}`} className='mt-2'>
        <span className='font-bold'>{heures}h</span> {label}
        {heures > 1 ? 's' : ''}
      </p>
    </>
  )
}
