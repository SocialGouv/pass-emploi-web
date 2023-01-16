import propsStatutsActions from 'components/action/propsStatutsActions'
import RadioBox from 'components/action/RadioBox'
import { StatutAction } from 'interfaces/action'

interface RadioBoxStatutProps {
  status: StatutAction
  isSelected: boolean
  onChange: (statutChoisi: StatutAction) => void
  isDisabled: boolean
}

export default function RadioBoxStatut({
  status,
  isSelected,
  onChange,
  isDisabled,
}: RadioBoxStatutProps) {
  const { label, color } = propsStatutsActions[status]
  const id = `option-statut--${label.toLowerCase()}`

  return (
    <RadioBox
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
