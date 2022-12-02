import { BeneficiaireIndicationPortefeuille } from 'components/jeune/BeneficiaireIndications'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface MultiselectionProps {
  selection: { id: string; value: string; avecIndication: boolean }[]
  typeSelection: string
  unselect: (id: string) => void
  renderIndication?: (props: { value: string }) => JSX.Element
  disabled?: boolean
}

export default function Multiselection({
  selection,
  typeSelection,
  unselect,
  renderIndication = BeneficiaireIndicationPortefeuille,
  disabled,
}: MultiselectionProps) {
  const id = `selected-${typeSelection}s`

  return (
    <ul
      aria-labelledby={`${id}--title`}
      id={id}
      role='region'
      className='bg-grey_100 rounded-[12px] px-2 py-4 max-h-96 overflow-y-auto'
      aria-live='polite'
      aria-relevant='additions removals'
    >
      {selection.map(({ id: idItem, value, avecIndication }) => (
        <li
          key={idItem}
          className='bg-blanc w-full rounded-full px-8 py-2 mb-2 last:mb-0 flex justify-between items-center break-all overflow-y-auto max-h-56'
          aria-atomic={true}
        >
          {avecIndication && renderIndication({ value })}
          {!avecIndication && value}

          {!disabled && (
            <button type='reset' onClick={() => unselect(idItem)}>
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
