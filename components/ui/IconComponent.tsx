import { ComponentPropsWithoutRef } from 'react'

import ActionsIcon from 'assets/icons/actions.svg'
import AddIcon from 'assets/icons/add.svg'
import AideIcon from 'assets/icons/aide.svg'
import ArrowDoubleIcon from 'assets/icons/arrow_double.svg'
import ArrowDownIcon from 'assets/icons/arrow_down.svg'
import ArrowLeftIcon from 'assets/icons/arrow_left.svg'
import ArrowRightIcon from 'assets/icons/arrow_right.svg'
import FileIcon from 'assets/icons/attach_file.svg'
import BoardIcon from 'assets/icons/board.svg'
import CalendarIcon from 'assets/icons/calendar.svg'
import CancelIcon from 'assets/icons/cancel.svg'
import CheckIcon from 'assets/icons/check.svg'
import ChevronDownIcon from 'assets/icons/chevron_down.svg'
import ChevronFirstIcon from 'assets/icons/chevron_first.svg'
import ChevronLastIcon from 'assets/icons/chevron_last.svg'
import ChevronLeftIcon from 'assets/icons/chevron_left.svg'
import ChevronRightIcon from 'assets/icons/chevron_right.svg'
import ChevronUpIcon from 'assets/icons/chevron_up.svg'
import Chiffre1Icon from 'assets/icons/chiffre_1.svg'
import Chiffre2Icon from 'assets/icons/chiffre_2.svg'
import Chiffre3Icon from 'assets/icons/chiffre_3.svg'
import Chiffre4Icon from 'assets/icons/chiffre_4.svg'
import Chiffre5Icon from 'assets/icons/chiffre_5.svg'
import ClipboardIcon from 'assets/icons/clipboard.svg'
import ClockIcon from 'assets/icons/clock.svg'
import CloseIcon from 'assets/icons/close.svg'
import CommentIcon from 'assets/icons/comment.svg'
import ContratIcon from 'assets/icons/contrat.svg'
import DecorativePointIcon from 'assets/icons/decorative_point.svg'
import EmailIcon from 'assets/icons/email.svg'
import EuroIcon from 'assets/icons/euro.svg'
import FavoriteIcon from 'assets/icons/favorite.svg'
import FlagIcon from 'assets/icons/flag.svg'
import FlagFilledIcon from 'assets/icons/flag_filled.svg'
import ImportantIcon from 'assets/icons/important.svg'
import ImportantOutlineIcon from 'assets/icons/important_outline.svg'
import InfoIcon from 'assets/icons/information.svg'
import InfoOutlineIcon from 'assets/icons/information_outline.svg'
import KoIcon from 'assets/icons/ko.svg'
import LaunchIcon from 'assets/icons/launch.svg'
import LocationIcon from 'assets/icons/location.svg'
import LockIcon from 'assets/icons/lock.svg'
import LogoutIcon from 'assets/icons/logout.svg'
import MenuIcon from 'assets/icons/menu.svg'
import NoteIcon from 'assets/icons/note.svg'
import PartageIcon from 'assets/icons/partage.svg'
import PenIcon from 'assets/icons/pen.svg'
import PendingIcon from 'assets/icons/pending.svg'
import PeopleIcon from 'assets/icons/people.svg'
import ProfilIcon from 'assets/icons/profil.svg'
import RemoveIcon from 'assets/icons/remove.svg'
import RendezVousIcon from 'assets/icons/rendez-vous.svg'
import RoundedArrowRightIcon from 'assets/icons/rounded_arrow_right.svg'
import RoundedCheckIcon from 'assets/icons/rounded_check.svg'
import RoundedCheckFilledIcon from 'assets/icons/rounded_check_filled.svg'
import RoundedCloseIcon from 'assets/icons/rounded_close.svg'
import RoundedCloseFilledIcon from 'assets/icons/rounded_close_filled.svg'
import SearchIcon from 'assets/icons/search.svg'
import SendIcon from 'assets/icons/send.svg'
import SpinnerIcon from 'assets/icons/spinner.svg'
import SuitcaseIcon from 'assets/icons/suitcase.svg'
import TrashcanIcon from 'assets/icons/trashcan.svg'
import WarningIcon from 'assets/icons/warning.svg'

export enum IconName {
  Actions = 'Actions',
  Add = 'Add',
  Aide = 'Aide',
  ArrowDouble = 'ArrowDouble',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  RoundedArrowRight = 'RoundedArrowRight',
  Calendar = 'Calendar',
  Cancel = 'Cancel',
  Board = 'Board',
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
  Chiffre5 = 'Chiffre5',
  Clipboard = 'Clipboard',
  Clock = 'Clock',
  Close = 'Close',
  Comment = 'Comment',
  Contrat = 'Contrat',
  DecorativePoint = 'DecorativePoint',
  Trashcan = 'Trashcan',
  Email = 'Email',
  Euro = 'Euro',
  Favorite = 'Favorite',
  File = 'File',
  Flag = 'Flag',
  FlagFilled = 'FlagFilled',
  Important = 'Important',
  ImportantOutline = 'ImportantOutline',
  Info = 'Info',
  InfoOutline = 'InfoOutline',
  Ko = 'Ko',
  Launch = 'Launch',
  Location = 'Location',
  Lock = 'Lock',
  Logout = 'Logout',
  Menu = 'Menu',
  Note = 'Note',
  Partage = 'Partage',
  Pending = 'Pending',
  People = 'People',
  Profil = 'Profil',
  Pen = 'Pen',
  Remove = 'Remove',
  RendezVous = 'RendezVous',
  RoundedClose = 'RoundedClose',
  RoundedCloseFilled = 'RoundedCloseFilled',
  RoundedCheck = 'RoundedCheck',
  RoundedCheckFilled = 'RoundedCheckFilled',
  Search = 'Search',
  Send = 'Send',
  Spinner = 'Spinner',
  Suitcase = 'Suitcase',
  Warning = 'Warning',
}

const iconsByName: { [key in IconName]: any } = {
  [IconName.Actions]: ActionsIcon,
  [IconName.Add]: AddIcon,
  [IconName.Aide]: AideIcon,
  [IconName.ArrowDouble]: ArrowDoubleIcon,
  [IconName.ArrowDown]: ArrowDownIcon,
  [IconName.ArrowLeft]: ArrowLeftIcon,
  [IconName.ArrowRight]: ArrowRightIcon,
  [IconName.RoundedArrowRight]: RoundedArrowRightIcon,
  [IconName.Calendar]: CalendarIcon,
  [IconName.Cancel]: CancelIcon,
  [IconName.Check]: CheckIcon,
  [IconName.Board]: BoardIcon,
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
  [IconName.Chiffre5]: Chiffre5Icon,
  [IconName.Clock]: ClockIcon,
  [IconName.Close]: CloseIcon,
  [IconName.Clipboard]: ClipboardIcon,
  [IconName.Comment]: CommentIcon,
  [IconName.Contrat]: ContratIcon,
  [IconName.DecorativePoint]: DecorativePointIcon,
  [IconName.Trashcan]: TrashcanIcon,
  [IconName.Email]: EmailIcon,
  [IconName.Euro]: EuroIcon,
  [IconName.Favorite]: FavoriteIcon,
  [IconName.File]: FileIcon,
  [IconName.Flag]: FlagIcon,
  [IconName.FlagFilled]: FlagFilledIcon,
  [IconName.Important]: ImportantIcon,
  [IconName.ImportantOutline]: ImportantOutlineIcon,
  [IconName.Info]: InfoIcon,
  [IconName.InfoOutline]: InfoOutlineIcon,
  [IconName.Ko]: KoIcon,
  [IconName.Launch]: LaunchIcon,
  [IconName.Location]: LocationIcon,
  [IconName.Lock]: LockIcon,
  [IconName.Logout]: LogoutIcon,
  [IconName.Menu]: MenuIcon,
  [IconName.Note]: NoteIcon,
  [IconName.Pen]: PenIcon,
  [IconName.Pending]: PendingIcon,
  [IconName.Partage]: PartageIcon,
  [IconName.People]: PeopleIcon,
  [IconName.Profil]: ProfilIcon,
  [IconName.Remove]: RemoveIcon,
  [IconName.RendezVous]: RendezVousIcon,
  [IconName.RoundedClose]: RoundedCloseIcon,
  [IconName.RoundedCloseFilled]: RoundedCloseFilledIcon,
  [IconName.RoundedCheck]: RoundedCheckIcon,
  [IconName.RoundedCheck]: RoundedCheckIcon,
  [IconName.RoundedCheckFilled]: RoundedCheckFilledIcon,
  [IconName.Search]: SearchIcon,
  [IconName.Send]: SendIcon,
  [IconName.Spinner]: SpinnerIcon,
  [IconName.Suitcase]: SuitcaseIcon,
  [IconName.Warning]: WarningIcon,
}

type IconComponentProps = ComponentPropsWithoutRef<'svg'> & {
  name: IconName
  title?: string
}
export default function IconComponent({ name, ...props }: IconComponentProps) {
  const Icon = iconsByName[name]
  return <Icon {...props} />
}
