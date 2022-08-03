import { MouseEvent } from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import IconComponent from 'components/ui/IconComponent'
import { StatutAction } from 'interfaces/action'

interface RadioButtonStatusProps {
  status: StatutAction
  isSelected: boolean
  onChange: (statutChoisi: StatutAction) => void
}

export default function RadioButtonStatus({
  status,
  isSelected,
  onChange,
}: RadioButtonStatusProps) {
  const onClick = (e: MouseEvent) => {
    e.preventDefault()
    onChange(status)
  }

  const { label, color, iconName } = propsStatutsActions[status]
  const id = `option-statut--${label.toLowerCase()}`
  const selectedStyle = `border-${color} bg-${color}_lighten text-${color}`

  return (
    <div
      className={`flex items-center px-4 py-3 border border-solid rounded-full text-s-bold mr-4 cursor-pointer ${
        isSelected ? selectedStyle : 'border-grey_800 text-grey_800'
      }`}
      onClick={onClick}
    >
      {isSelected && (
        <IconComponent
          name={iconName}
          focusable={false}
          aria-hidden={true}
          className={`fill-${color} mr-2 w-4 h-4`}
        />
      )}
      <label htmlFor={id} className='whitespace-nowrap cursor-pointer'>
        {label}
      </label>
      <input
        className='sr-only'
        type='radio'
        id={id}
        name='option-statut'
        checked={isSelected}
        readOnly={true}
        required={true}
      />
    </div>
  )
}
