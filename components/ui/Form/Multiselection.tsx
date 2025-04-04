import { ForwardedRef, forwardRef, ReactElement, useRef } from 'react'

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
  Indication?: (props: { value: string; id: string }) => ReactElement
  disabled?: boolean
}

function Multiselection(
  {
    selection,
    typeSelection,
    unselect,
    onYieldFocus,
    Indication = BeneficiaireIndicationPortefeuille,
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
      className='bg-grey-100 rounded-base px-2 py-4 max-h-96 overflow-y-auto'
    >
      {selection.map(
        ({ id: idItem, value, avecIndication, estUneListe }, index) => (
          <li
            key={idItem}
            className='bg-white w-full rounded-large px-8 py-2 mb-2 last:mb-0 flex justify-between items-center break-all overflow-y-auto max-h-56'
          >
            {avecIndication && <Indication value={value} id={idItem} />}
            {estUneListe && <BeneficiaireListeItem value={value} id={idItem} />}
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
