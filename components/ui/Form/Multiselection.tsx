import { ForwardedRef, forwardRef, useRef } from 'react'

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
  onYieldFocus: () => void
  renderIndication?: (props: { value: string; id: string }) => JSX.Element
  renderListeItem?: (props: { value: string; id: string }) => JSX.Element
  disabled?: boolean
}

function Multiselection(
  {
    selection,
    typeSelection,
    unselect,
    onYieldFocus,
    renderIndication = BeneficiaireIndicationPortefeuille,
    renderListeItem = BeneficiaireListeItem,
    disabled,
  }: MultiselectionProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const id = `selected-${typeSelection}s`

  const ulRef = useRef<HTMLUListElement>(null)

  async function deselectionner(idItem: string, index: number) {
    const newFocusIndex = index === selection.length - 1 ? index - 1 : index + 1
    unselect(idItem)

    if (selection.length === 1) onYieldFocus()
    else
      ulRef
        .current!.querySelector<HTMLButtonElement>(
          `li:nth-child(${newFocusIndex + 1}) > button:last-child`
        )!
        .focus()
  }

  return (
    <ul
      id={id}
      ref={ulRef}
      aria-labelledby={id + '--title'}
      className='bg-grey_100 rounded-base px-2 py-4 max-h-96 overflow-y-auto'
    >
      {selection.map(
        ({ id: idItem, value, avecIndication, estUneListe }, index) => (
          <li
            key={idItem}
            className='bg-white w-full rounded-full px-8 py-2 mb-2 last:mb-0 flex justify-between items-center break-all overflow-y-auto max-h-56'
          >
            {avecIndication && renderIndication({ value, id: idItem })}
            {estUneListe && renderListeItem({ value, id: idItem })}
            {!avecIndication && !estUneListe && value}

            {!disabled && (
              <button
                type='button'
                onClick={() => deselectionner(idItem, index)}
                ref={index === 0 ? ref : undefined}
              >
                <span id={idItem + '--label-remove'} className='sr-only'>
                  Enlever {typeSelection} {value}
                </span>
                <IconComponent
                  name={IconName.Remove}
                  focusable={false}
                  role='img'
                  aria-labelledby={idItem + '--label-remove'}
                  title={`Enlever ${typeSelection} ${value}`}
                  className='w-8 h-8'
                />
              </button>
            )}
          </li>
        )
      )}
    </ul>
  )
}

export default forwardRef(Multiselection)
