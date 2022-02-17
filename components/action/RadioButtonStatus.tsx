import { ActionStatus } from 'interfaces/action'
import { MouseEvent } from 'react'
import DoneIcon from '../../assets/icons/simple_done.svg'

interface RadioButtonStatusProps {
  status: ActionStatus
  isSelected: boolean
  onChange: (statutChoisi: ActionStatus) => void
}

const mappedStatus: {
  [key in ActionStatus]: { label: string; color: string }
} = {
  [ActionStatus.NotStarted]: {
    label: 'À réaliser',
    color: 'accent_1',
  },
  [ActionStatus.InProgress]: {
    label: 'Commencée',
    color: 'accent_3',
  },
  [ActionStatus.Done]: {
    label: 'Terminée',
    color: 'accent_2',
  },
}

export const RadioButtonStatus = ({
  status,
  isSelected,
  onChange,
}: RadioButtonStatusProps) => {
  const onClick = (e: MouseEvent) => {
    e.preventDefault()
    onChange(status)
  }

  const { label, color } = mappedStatus[status]
  const id = `option-statut--${label.toLowerCase()}`
  const selectedStyle = `border-${color} bg-${color}_lighten text-${color}`

  return (
    <div
      className={`flex items-center px-4 py-3 border border-solid rounded-full text-sm-semi mr-4 cursor-pointer ${
        isSelected ? selectedStyle : 'border-grey_800 text-grey_800'
      }`}
      onClick={onClick}
    >
      {isSelected && (
        <DoneIcon
          focusable={false}
          aria-hidden={true}
          className={`fill-${color} mr-2`}
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
