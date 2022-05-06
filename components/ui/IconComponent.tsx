import SupervisionIcon from '../../assets/icons/arrow-right.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import PersonIcon from '../../assets/icons/person.svg'
import RendezvousIcon from '../../assets/icons/rendez-vous.svg'

const iconTypes = {
  people: PeopleIcon,
  person: PersonIcon,
  supervision: SupervisionIcon,
  rendezvous: RendezvousIcon,
}

const IconComponent = ({ name, ...props }) => {
  let Icon = iconTypes[name]
  return <Icon {...props} />
}

export default IconComponent
