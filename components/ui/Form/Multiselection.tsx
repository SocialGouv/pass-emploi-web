import IconComponent, { IconName } from 'components/ui/IconComponent'

interface MultiselectionProps {
  selection: { id: string; value: string; avecIndicateur: boolean }[]
  typeSelection: string
  unselect: (id: string) => void
  infoLabel?: string
  disabled?: boolean
}

export default function Multiselection({
  selection,
  infoLabel,
  typeSelection,
  unselect,
  disabled,
}: MultiselectionProps) {
  const tag = `selected-${typeSelection}s`

  return (
    <ul
      aria-labelledby={`${tag}--title`}
      id={tag}
      role='region'
      className='bg-grey_100 rounded-[12px] px-2 py-4 max-h-96 overflow-y-auto'
      aria-live='polite'
      aria-relevant='additions removals'
    >
      {selection.map(({ id, value, avecIndicateur }) => (
        <li
          key={id}
          className='bg-blanc w-full rounded-full px-8 py-2 mb-2 last:mb-0 flex justify-between items-center break-all overflow-y-auto max-h-56'
          aria-atomic={true}
        >
          {avecIndicateur && (
            <div className='flex items-center text-base-bold text-accent_3'>
              <div aria-label={infoLabel} className='mr-2'>
                <IconComponent
                  name={IconName.Info}
                  focusable={false}
                  aria-hidden={true}
                  className='w-6 h-6 fill-accent_3'
                  title={infoLabel}
                />
              </div>
              {value}
            </div>
          )}
          {!avecIndicateur && value}

          {!disabled && (
            <button type='reset' onClick={() => unselect(id)}>
              <span className='sr-only'>
                Enlever {typeSelection} {value}
              </span>
              <IconComponent
                name={IconName.Remove}
                focusable={false}
                aria-hidden={true}
                className='w-8 h-8'
                title='Enlever'
              />
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
