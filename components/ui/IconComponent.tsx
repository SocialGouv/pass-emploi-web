import AideIcon from '../../assets/icons/aide.svg'
import SupervisionIcon from '../../assets/icons/arrow-right.svg'
import LaunchIcon from '../../assets/icons/launch.svg'
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
  launch: LaunchIcon,
}

// @ts-ignore
//FIXME: props avec typescript
const IconComponent = ({ name, ...props }) => {
  // @ts-ignore
  let Icon = iconTypes[name]
  return <Icon {...props} />
}

export default IconComponent
