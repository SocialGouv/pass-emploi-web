import { ComponentPropsWithoutRef } from 'react'

import ActionsIcon from '../../assets/icons/actions.svg'
import AddIcon from '../../assets/icons/add.svg'
import AideIcon from '../../assets/icons/aide.svg'
import ArrowDoubleIcon from '../../assets/icons/arrow_double.svg'
import ArrowDownIcon from '../../assets/icons/arrow_down.svg'
import ArrowLeftIcon from '../../assets/icons/arrow_left.svg'
import ArrowRightIcon from '../../assets/icons/arrow_right.svg'
import FileIcon from '../../assets/icons/attach_file.svg'
import CalendarIcon from '../../assets/icons/calendar.svg'
import CancelIcon from '../../assets/icons/cancel.svg'
import CheckIcon from '../../assets/icons/check.svg'
import CheckRoundedIcon from '../../assets/icons/check_rounded.svg'
import ChevronDownIcon from '../../assets/icons/chevron_down.svg'
import ChevronFirstIcon from '../../assets/icons/chevron_first.svg'
import ChevronLastIcon from '../../assets/icons/chevron_last.svg'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'
import ChevronRightIcon from '../../assets/icons/chevron_right.svg'
import ChevronUpIcon from '../../assets/icons/chevron_up.svg'
import Chiffre1Icon from '../../assets/icons/chiffre_1.svg'
import Chiffre2Icon from '../../assets/icons/chiffre_2.svg'
import Chiffre3Icon from '../../assets/icons/chiffre_3.svg'
import Chiffre4Icon from '../../assets/icons/chiffre_4.svg'
import ClockIcon from '../../assets/icons/clock.svg'
import CloseIcon from '../../assets/icons/close.svg'
import DecorativePointIcon from '../../assets/icons/decorative_point.svg'
import DeleteIcon from '../../assets/icons/delete.svg'
import InfoIcon from '../../assets/icons/information.svg'
import InfoOutlineIcon from '../../assets/icons/information_outline.svg'
import LaunchIcon from '../../assets/icons/launch.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import ProfilIcon from '../../assets/icons/profil.svg'
import RendezVousIcon from '../../assets/icons/rendez-vous.svg'
import RoundedCloseIcon from '../../assets/icons/rounded_close.svg'
import SearchIcon from '../../assets/icons/search.svg'
import SendIcon from '../../assets/icons/send.svg'
import SpinnerIcon from '../../assets/icons/spinner.svg'
import TrashCanIcon from '../../assets/icons/trash_can.svg'

export enum IconName {
  Actions = 'Actions',
  Add = 'Add',
  Aide = 'Aide',
  ArrowDouble = 'ArrowDouble',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  Calendar = 'Calendar',
  Cancel = 'Cancel',
  CheckRounded = 'CheckRounded',
  Check = 'Check',
  ChevronDown = 'ChevronDown',
  ChevronFirst = 'ChevronFirst',
  ChevronLast = 'ChevronLast',
  ChevronLeft = 'ChevronLeft',
  ChevronRight = 'ChevronRight',
  ChevronUp = 'ChevronUp',
  Chiffre1 = 'Chiffre1',
  Chiffre2 = 'Chiffre2',
  Chiffre3 = 'Chiffre3',
  Chiffre4 = 'Chiffre4',
  Clock = 'Clock',
  Close = 'Close',
  DecorativePoint = 'DecorativePoint',
  Delete = 'Delete',
  File = 'File',
  Info = 'Info',
  InfoOutline = 'InfoOutline',
  Launch = 'Launch',
  Logout = 'Logout',
  People = 'People',
  Profil = 'Profil',
  RendezVous = 'RendezVous',
  RoundedClose = 'RoundedClose',
  Search = 'Search',
  Send = 'Send',
  Spinner = 'Spinner',
  TrashCan = 'TrashCan',
}

const iconsByName: { [key in IconName]: any } = {
  [IconName.Actions]: ActionsIcon,
  [IconName.Add]: AddIcon,
  [IconName.Aide]: AideIcon,
  [IconName.ArrowDouble]: ArrowDoubleIcon,
  [IconName.ArrowDown]: ArrowDownIcon,
  [IconName.ArrowLeft]: ArrowLeftIcon,
  [IconName.ArrowRight]: ArrowRightIcon,
  [IconName.Calendar]: CalendarIcon,
  [IconName.Cancel]: CancelIcon,
  [IconName.CheckRounded]: CheckRoundedIcon,
  [IconName.Check]: CheckIcon,
  [IconName.ChevronDown]: ChevronDownIcon,
  [IconName.ChevronFirst]: ChevronFirstIcon,
  [IconName.ChevronLast]: ChevronLastIcon,
  [IconName.ChevronLeft]: ChevronLeftIcon,
  [IconName.ChevronRight]: ChevronRightIcon,
  [IconName.ChevronUp]: ChevronUpIcon,
  [IconName.Chiffre1]: Chiffre1Icon,
  [IconName.Chiffre2]: Chiffre2Icon,
  [IconName.Chiffre3]: Chiffre3Icon,
  [IconName.Chiffre4]: Chiffre4Icon,
  [IconName.Close]: CloseIcon,
  [IconName.Clock]: ClockIcon,
  [IconName.DecorativePoint]: DecorativePointIcon,
  [IconName.Delete]: DeleteIcon,
  [IconName.File]: FileIcon,
  [IconName.Info]: InfoIcon,
  [IconName.InfoOutline]: InfoOutlineIcon,
  [IconName.Launch]: LaunchIcon,
  [IconName.Logout]: LogoutIcon,
  [IconName.People]: PeopleIcon,
  [IconName.Profil]: ProfilIcon,
  [IconName.RendezVous]: RendezVousIcon,
  [IconName.RoundedClose]: RoundedCloseIcon,
  [IconName.Search]: SearchIcon,
  [IconName.Send]: SendIcon,
  [IconName.Spinner]: SpinnerIcon,
  [IconName.TrashCan]: TrashCanIcon,
}

interface IconComponentProps extends ComponentPropsWithoutRef<any> {
  name: IconName
}

export default function IconComponent({ name, ...props }: IconComponentProps) {
  const Icon = iconsByName[name]
  return <Icon {...props} />
}
