import { ComponentPropsWithoutRef } from 'react'

import ActionsIcon from '../../assets/icons/actions.svg'
import AideIcon from '../../assets/icons/aide.svg'
import SupervisionIcon from '../../assets/icons/arrow-right.svg'
import CalendarIcon from '../../assets/icons/calendar.svg'
import LaunchIcon from '../../assets/icons/launch.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import ProfilIcon from '../../assets/icons/profil.svg'
import RendezvousIcon from '../../assets/icons/rendez-vous.svg'

export enum IconName {
  Actions = 'Actions',
  Aide = 'Aide',
  Calendar = 'Calendar',
  Launch = 'Launch',
  Logout = 'Logout',
  People = 'People',
  Profil = 'Profil',
  RendezVous = 'RendezVous',
  Supervision = 'Supervision',
}

const iconsByName: { [key in IconName]: any } = {
  [IconName.Actions]: ActionsIcon,
  [IconName.Aide]: AideIcon,
  [IconName.Calendar]: CalendarIcon,
  [IconName.Launch]: LaunchIcon,
  [IconName.Logout]: LogoutIcon,
  [IconName.People]: PeopleIcon,
  [IconName.Profil]: ProfilIcon,
  [IconName.RendezVous]: RendezvousIcon,
  [IconName.Supervision]: SupervisionIcon,
}

interface IconComponentProps extends ComponentPropsWithoutRef<any> {
  name: IconName
}

export default function IconComponent({ name, ...props }: IconComponentProps) {
  const Icon = iconsByName[name]
  return <Icon {...props} />
}
