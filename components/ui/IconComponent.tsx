import AideIcon from '../../assets/icons/aide.svg'
import SupervisionIcon from '../../assets/icons/arrow-right.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import ProfilIcon from '../../assets/icons/profil.svg'
import RendezvousIcon from '../../assets/icons/rendez-vous.svg'

const iconTypes = {
  people: PeopleIcon,
  profil: ProfilIcon,
  supervision: SupervisionIcon,
  rendezvous: RendezvousIcon,
  logout: LogoutIcon,
  aide: AideIcon,
}

const IconComponent = ({ name, ...props }) => {
  let Icon = iconTypes[name]
  return <Icon {...props} />
}

export default IconComponent
