import AideIcon from '../../assets/icons/aide.svg'
import SupervisionIcon from '../../assets/icons/arrow-right.svg'
import CalendarIcon from '../../assets/icons/calendar.svg'
import LaunchIcon from '../../assets/icons/launch.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import ProfilIcon from '../../assets/icons/profil.svg'
import RendezvousIcon from '../../assets/icons/rendez-vous.svg'

const iconTypes = {
  aide: AideIcon,
  calendar: CalendarIcon,
  launch: LaunchIcon,
  logout: LogoutIcon,
  people: PeopleIcon,
  profil: ProfilIcon,
  rendezvous: RendezvousIcon,
  supervision: SupervisionIcon,
}

// @ts-ignore
//FIXME: props avec typescript
const IconComponent = ({ name, ...props }) => {
  // @ts-ignore
  let Icon = iconTypes[name]
  return <Icon {...props} />
}

export default IconComponent
