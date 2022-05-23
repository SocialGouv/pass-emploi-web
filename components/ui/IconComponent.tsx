import { ComponentPropsWithoutRef } from 'react'

import ActionsIcon from '../../assets/icons/actions.svg'
import AddIcon from '../../assets/icons/add.svg'
import AideIcon from '../../assets/icons/aide.svg'
import ArrowDoubleIcon from '../../assets/icons/arrow_double.svg'
import ArrowDownIcon from '../../assets/icons/arrow_down.svg'
import ArrowRightIcon from '../../assets/icons/arrow_right.svg'
import CalendarIcon from '../../assets/icons/calendar.svg'
import CancelIcon from '../../assets/icons/cancel.svg'
import CheckSuccessIcon from '../../assets/icons/check_success.svg'
import ChevronDownIcon from '../../assets/icons/chevron_down.svg'
import ChevronRightIcon from '../../assets/icons/chevron_right.svg'
import ChevronUpIcon from '../../assets/icons/chevron_up.svg'
import CloseIcon from '../../assets/icons/close.svg'
import InfoIcon from '../../assets/icons/information.svg'
import LaunchIcon from '../../assets/icons/launch.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import ProfilIcon from '../../assets/icons/profil.svg'
import RendezVousIcon from '../../assets/icons/rendez-vous.svg'

export enum IconName {
  Actions = 'Actions',
  Add = 'Add',
  Aide = 'Aide',
  ArrowDouble = 'ArrowDouble',
  ArrowDown = 'ArrowDown',
  ArrowRight = 'ArrowRight',
  Calendar = 'Calendar',
  Cancel = 'Cancel',
  CheckSuccess = 'CheckSuccess',
  ChevronDown = 'ChevronDown',
  ChevronRight = 'ChevronRight',
  ChevronUp = 'ChevronUp',
  Close = 'Close',
  Info = 'Info',
  Launch = 'Launch',
  Logout = 'Logout',
  People = 'People',
  Profil = 'Profil',
  RendezVous = 'RendezVous',
}

const iconsByName: { [key in IconName]: any } = {
  [IconName.Actions]: ActionsIcon,
  [IconName.Add]: AddIcon,
  [IconName.Aide]: AideIcon,
  [IconName.ArrowDouble]: ArrowDoubleIcon,
  [IconName.ArrowDown]: ArrowDownIcon,
  [IconName.ArrowRight]: ArrowRightIcon,
  [IconName.Calendar]: CalendarIcon,
  [IconName.Cancel]: CancelIcon,
  [IconName.CheckSuccess]: CheckSuccessIcon,
  [IconName.ChevronDown]: ChevronDownIcon,
  [IconName.ChevronRight]: ChevronRightIcon,
  [IconName.ChevronUp]: ChevronUpIcon,
  [IconName.Close]: CloseIcon,
  [IconName.Info]: InfoIcon,
  [IconName.Launch]: LaunchIcon,
  [IconName.Logout]: LogoutIcon,
  [IconName.People]: PeopleIcon,
  [IconName.Profil]: ProfilIcon,
  [IconName.RendezVous]: RendezVousIcon,
}

interface IconComponentProps extends ComponentPropsWithoutRef<any> {
  name: IconName
}

export default function IconComponent({ name, ...props }: IconComponentProps) {
  const Icon = iconsByName[name]
  return <Icon {...props} />
}
