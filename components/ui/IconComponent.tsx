import { ComponentPropsWithoutRef } from 'react'

import ActionsIcon from '../../assets/icons/actions.svg'
import AddIcon from '../../assets/icons/add.svg'
import AideIcon from '../../assets/icons/aide.svg'
import ArrowDoubleIcon from '../../assets/icons/arrow_double.svg'
import ArrowDownIcon from '../../assets/icons/arrow_down.svg'
import ArrowLeftIcon from '../../assets/icons/arrow_left.svg'
import ArrowRightIcon from '../../assets/icons/arrow_right.svg'
import CalendarIcon from '../../assets/icons/calendar.svg'
import CancelIcon from '../../assets/icons/cancel.svg'
import CheckIcon from '../../assets/icons/check.svg'
import CheckRoundedIcon from '../../assets/icons/check_rounded.svg'
import ChevronDownIcon from '../../assets/icons/chevron_down.svg'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'
import ChevronRightIcon from '../../assets/icons/chevron_right.svg'
import ChevronUpIcon from '../../assets/icons/chevron_up.svg'
import Chiffre1Icon from '../../assets/icons/chiffre_1.svg'
import Chiffre2Icon from '../../assets/icons/chiffre_2.svg'
import Chiffre3Icon from '../../assets/icons/chiffre_3.svg'
import Chiffre4Icon from '../../assets/icons/chiffre_4.svg'
import CloseIcon from '../../assets/icons/close.svg'
import DeleteIcon from '../../assets/icons/delete.svg'
import InfoIcon from '../../assets/icons/information.svg'
import LaunchIcon from '../../assets/icons/launch.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import ProfilIcon from '../../assets/icons/profil.svg'
import RendezVousIcon from '../../assets/icons/rendez-vous.svg'
import SearchIcon from '../../assets/icons/search.svg'
import SendIcon from '../../assets/icons/send.svg'

export enum IconName {
  Actions = 'Actions',
  Add = 'Add',
  Aide = 'Aide',
  ChevronLeft = 'ChevronLeft',
  ArrowDouble = 'ArrowDouble',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  Calendar = 'Calendar',
  Cancel = 'Cancel',
  CheckRounded = 'CheckRounded',
  Check = 'Check',
  ChevronDown = 'ChevronDown',
  ChevronRight = 'ChevronRight',
  ChevronUp = 'ChevronUp',
  Chiffre1 = 'Chiffre1',
  Chiffre2 = 'Chiffre2',
  Chiffre3 = 'Chiffre3',
  Chiffre4 = 'Chiffre4',
  Close = 'Close',
  Delete = 'Delete',
  Info = 'Info',
  Launch = 'Launch',
  Logout = 'Logout',
  People = 'People',
  Profil = 'Profil',
  RendezVous = 'RendezVous',
  Search = 'Search',
  Send = 'Send',
}

const iconsByName: { [key in IconName]: any } = {
  [IconName.Actions]: ActionsIcon,
  [IconName.Add]: AddIcon,
  [IconName.Aide]: AideIcon,
  [IconName.ArrowDouble]: ArrowDoubleIcon,
  [IconName.ChevronLeft]: ChevronLeftIcon,
  [IconName.ArrowDown]: ArrowDownIcon,
  [IconName.ArrowLeft]: ArrowLeftIcon,
  [IconName.ArrowRight]: ArrowRightIcon,
  [IconName.Calendar]: CalendarIcon,
  [IconName.Cancel]: CancelIcon,
  [IconName.CheckRounded]: CheckRoundedIcon,
  [IconName.Check]: CheckIcon,
  [IconName.ChevronDown]: ChevronDownIcon,
  [IconName.ChevronRight]: ChevronRightIcon,
  [IconName.ChevronUp]: ChevronUpIcon,
  [IconName.Chiffre1]: Chiffre1Icon,
  [IconName.Chiffre2]: Chiffre2Icon,
  [IconName.Chiffre3]: Chiffre3Icon,
  [IconName.Chiffre4]: Chiffre4Icon,
  [IconName.Close]: CloseIcon,
  [IconName.Delete]: DeleteIcon,
  [IconName.Info]: InfoIcon,
  [IconName.Launch]: LaunchIcon,
  [IconName.Logout]: LogoutIcon,
  [IconName.People]: PeopleIcon,
  [IconName.Profil]: ProfilIcon,
  [IconName.RendezVous]: RendezVousIcon,
  [IconName.Search]: SearchIcon,
  [IconName.Send]: SendIcon,
}

interface IconComponentProps extends ComponentPropsWithoutRef<any> {
  name: IconName
}

export default function IconComponent({ name, ...props }: IconComponentProps) {
  const Icon = iconsByName[name]
  return <Icon {...props} />
}
