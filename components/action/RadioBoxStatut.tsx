import propsStatutsActions from 'components/action/propsStatutsActions'
import RadioBox from 'components/action/RadioBox'
import { StatutAction } from 'interfaces/action'

interface RadioBoxStatutProps {
  status: StatutAction
  isSelected: boolean
  onChange: (statutChoisi: StatutAction) => void
  isDisabled: boolean
  estQualifiee?: boolean
}

export default function RadioBoxStatut({
  status,
  isSelected,
  onChange,
  isDisabled,
  estQualifiee,
}: RadioBoxStatutProps) {
  const { label } = propsStatutsActions[status]

  return (
    <RadioBox
      isSelected={isSelected}
      onChange={() => onChange(status)}
      name='option-statut'
      label={estQualifiee ? 'Terminée' : label}
      disabled={isDisabled}
    />
  )
}
