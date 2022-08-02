import { IconName } from 'components/ui/IconComponent'
import { StatutAction } from 'interfaces/action'

const propsStatutsActions: {
  [key in StatutAction]: {
    label: string
    color: string
    altColor: string
    iconName: IconName
  }
} = {
  ARealiser: {
    label: 'À réaliser',
    color: 'accent_1',
    altColor: 'accent_1_lighten',
    iconName: IconName.Check,
  },
  Annulee: {
    label: 'Annulée',
    color: 'accent_2',
    altColor: 'accent_2_lighten',
    iconName: IconName.Check,
  },
  Commencee: {
    label: 'Commencée',
    color: 'accent_3',
    altColor: 'accent_3_lighten',
    iconName: IconName.Check,
  },
  Terminee: {
    label: 'Terminée',
    color: 'accent_2',
    altColor: 'accent_2_lighten',
    iconName: IconName.Check,
  },
}

export default propsStatutsActions
