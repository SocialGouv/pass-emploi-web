import {
  BeneficiaireIndicationPortefeuille,
  BeneficiaireListeItem,
} from 'components/jeune/BeneficiaireIndications'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface MultiselectionProps {
  selection: {
    id: string
    value: string
    avecIndication: boolean
    estUneListe: boolean
  }[]
  typeSelection: string
  unselect: (id: string) => void
  renderIndication?: (props: { value: string; id: string }) => JSX.Element
  renderListeItem?: (props: { value: string; id: string }) => JSX.Element
  disabled?: boolean
}

export default function Multiselection({
  selection,
  typeSelection,
  unselect,
  renderIndication = BeneficiaireIndicationPortefeuille,
  renderListeItem = BeneficiaireListeItem,
  disabled,
}: MultiselectionProps) {
  const id = `selected-${typeSelection}s`

  return (
    <ul
      aria-labelledby={`${id}--title`}
      id={id}
      className='bg-grey_100 rounded-base px-2 py-4 max-h-96 overflow-y-auto'
    >
      {selection.map(({ id: idItem, value, avecIndication, estUneListe }) => (
        <li
          key={idItem}
          className='bg-white w-full rounded-full px-8 py-2 mb-2 last:mb-0 flex justify-between items-center break-all overflow-y-auto max-h-56'
        >
          {avecIndication && renderIndication({ value, id: idItem })}
          {estUneListe && renderListeItem({ value, id: idItem })}
          {!avecIndication && !estUneListe && value}

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
