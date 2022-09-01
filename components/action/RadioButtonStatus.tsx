import propsStatutsActions from 'components/action/propsStatutsActions'
import RadioButton from 'components/action/RadioButton'
import { StatutAction } from 'interfaces/action'

interface RadioButtonStatusProps {
  status: StatutAction
  isSelected: boolean
  onChange: (statutChoisi: StatutAction) => void
  isDisabled: boolean
}

export default function RadioButtonStatus({
  status,
  isSelected,
  onChange,
  isDisabled,
}: RadioButtonStatusProps) {
  const { label, color } = propsStatutsActions[status]
  const id = `option-statut--${label.toLowerCase()}`

  return (
    <RadioButton
      isSelected={isSelected}
      color={color}
      onChange={() => onChange(status)}
      name='option-statut'
      id={id}
      label={label}
      disabled={isDisabled}
    />
  )
}
