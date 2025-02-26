import { ComponentPropsWithoutRef, FC, SVGProps } from 'react'

import AddIcon from 'assets/icons/actions/add.svg'
import ArrowForwardIcon from 'assets/icons/actions/arrow_forward.svg'
import AttachFileIcon from 'assets/icons/actions/attach_file.svg'
import BookmarkFillIcon from 'assets/icons/actions/bookmark_fill.svg'
import BookmarkOutlineIcon from 'assets/icons/actions/bookmark_outline.svg'
import DeleteIcon from 'assets/icons/actions/delete.svg'
import EditIcon from 'assets/icons/actions/edit.svg'
import FilterIcon from 'assets/icons/actions/filter.svg'
import OutgoingMailIcon from 'assets/icons/actions/outgoing_mail.svg'
import SearchIcon from 'assets/icons/actions/search.svg'
import SendIcon from 'assets/icons/actions/send.svg'
import SettingsIcon from 'assets/icons/actions/settings.svg'
import ShareIcon from 'assets/icons/actions/share.svg'
import ContractIcon from 'assets/icons/custom/contract.svg'
import DecorativePointIcon from 'assets/icons/custom/decorative_point.svg'
import NoteIcon from 'assets/icons/custom/note.svg'
import PendingIcon from 'assets/icons/custom/pending.svg'
import RemoveIcon from 'assets/icons/custom/remove.svg'
import SpinnerIcon from 'assets/icons/custom/spinner.svg'
import SuitcaseIcon from 'assets/icons/custom/suitcase.svg'
import AccountCircleFillIcon from 'assets/icons/informations/account_circle_fill.svg'
import AccountCircleOutlineIcon from 'assets/icons/informations/account_circle_outline.svg'
import ArrowCircleRightFillIcon from 'assets/icons/informations/arrow_circle_right_fill.svg'
import ArrowCircleRightOutlineIcon from 'assets/icons/informations/arrow_circle_right_outline.svg'
import BarChartIcon from 'assets/icons/informations/bar_chart.svg'
import CancelIcon from 'assets/icons/informations/cancel.svg'
import CelebrationIcon from 'assets/icons/informations/celebration.svg'
import ChatFillIcon from 'assets/icons/informations/chat_fill.svg'
import ChatOutlineIcon from 'assets/icons/informations/chat_outline.svg'
import CheckIcon from 'assets/icons/informations/check.svg'
import CheckCircleFillIcon from 'assets/icons/informations/check_circle_fill.svg'
import CheckCircleOutlineIcon from 'assets/icons/informations/check_circle_outline.svg'
import ChecklistRtlFillIcon from 'assets/icons/informations/checklist_rtl_fill.svg'
import DescriptionIcon from 'assets/icons/informations/description.svg'
import DownloadIcon from 'assets/icons/informations/download.svg'
import ErrorIcon from 'assets/icons/informations/error.svg'
import EuroIcon from 'assets/icons/informations/euro.svg'
import EventFillIcon from 'assets/icons/informations/event_fill.svg'
import EventOutlineIcon from 'assets/icons/informations/event_outline.svg'
import FavoriteFillIcon from 'assets/icons/informations/favorite_fill.svg'
import FlagIcon from 'assets/icons/informations/flag.svg'
import HelpIcon from 'assets/icons/informations/help.svg'
import InfoIcon from 'assets/icons/informations/info.svg'
import LeaderboardFillIcon from 'assets/icons/informations/leaderboard_fill.svg'
import LeaderboardOutlineIcon from 'assets/icons/informations/leaderboard_outline.svg'
import LocationOnIcon from 'assets/icons/informations/location_on.svg'
import LockIcon from 'assets/icons/informations/lock.svg'
import MailIcon from 'assets/icons/informations/mail.svg'
import NotificationIcon from 'assets/icons/informations/notification.svg'
import PageViewFillIcon from 'assets/icons/informations/page_view_fill.svg'
import PageViewOutlineIcon from 'assets/icons/informations/page_view_outline.svg'
import PeopleFillIcon from 'assets/icons/informations/people_fill.svg'
import PeopleOutlineIcon from 'assets/icons/informations/people_outline.svg'
import ScheduleIcon from 'assets/icons/informations/schedule.svg'
import ScheduleOutlineIcon from 'assets/icons/informations/schedule_outline.svg'
import VisibilityOffIcon from 'assets/icons/informations/visibility-off.svg'
import VisibilityOnIcon from 'assets/icons/informations/visibility-on.svg'
import WarningIcon from 'assets/icons/informations/warning.svg'
import ArrowBackwardIcon from 'assets/icons/navigation/arrow_backward.svg'
import ArrowDownwardIcon from 'assets/icons/navigation/arrow_downward.svg'
import ArrowUpwardIcon from 'assets/icons/navigation/arrow_upward.svg'
import ChevronDownIcon from 'assets/icons/navigation/chevron_down.svg'
import ChevronLeftIcon from 'assets/icons/navigation/chevron_left.svg'
import ChevronRightIcon from 'assets/icons/navigation/chevron_right.svg'
import ChevronUpIcon from 'assets/icons/navigation/chevron_up.svg'
import CloseIcon from 'assets/icons/navigation/close.svg'
import FirstPageIcon from 'assets/icons/navigation/first_page.svg'
import LastPageIcon from 'assets/icons/navigation/last_page.svg'
import LogoutIcon from 'assets/icons/navigation/logout.svg'
import MenuIcon from 'assets/icons/navigation/menu.svg'
import MoreIcon from 'assets/icons/navigation/more.svg'
import OpenInNewIcon from 'assets/icons/navigation/open_in_new.svg'
import SwapVertIcon from 'assets/icons/navigation/swap_vert.svg'
import NumberCircleOneIcon from 'assets/icons/numbers/number_circle_1.svg'
import NumberCircleTwoIcon from 'assets/icons/numbers/number_circle_2.svg'
import NumberCircleThreeIcon from 'assets/icons/numbers/number_circle_3.svg'
import NumberCircleFourIcon from 'assets/icons/numbers/number_circle_4.svg'
import NumberCircleFiveIcon from 'assets/icons/numbers/number_circle_5.svg'

export enum IconName {
  AccountCircleFill = 'AccountCircleFill',
  AccountCircleOutline = 'AccountCircleOutline',
  Add = 'Add',
  ArrowBackward = 'ArrowBackward',
  ArrowCircleRightFill = 'ArrowCircleRightFill',
  ArrowCircleRightOutline = 'ArrowCircleRightOutline',
  ArrowDownward = 'ArrowDownward',
  ArrowForward = 'ArrowForward',
  ArrowUpward = 'ArrowUpward',
  AttachFile = 'AttachFile',
  BarChart = 'BarChart',
  BookmarkFill = 'BookmarkFill',
  BookmarkOutline = 'BookmarkOutline',
  Cancel = 'Cancel',
  Celebration = 'Celebration',
  ChatFill = 'ChatFill',
  ChatOutline = 'ChatOutline',
  Check = 'Check',
  CheckCircleFill = 'CheckCircleFill',
  CheckCircleOutline = 'CheckCircleOutline',
  ChecklistRtlFill = 'ChecklistRtlFill',
  ChevronDown = 'ChevronDown',
  ChevronLeft = 'ChevronLeft',
  ChevronRight = 'ChevronRight',
  ChevronUp = 'ChevronUp',
  Close = 'Close',
  Contract = 'Contract',
  DecorativePoint = 'DecorativePoint',
  Delete = 'Delete',
  Description = 'Description',
  Download = 'Download',
  Edit = 'Edit',
  Euro = 'Euro',
  Error = 'Error',
  EventFill = 'EventFill',
  EventOutline = 'EventOutline',
  FavoriteFill = 'FavoriteFill',
  Filter = 'Filter',
  FirstPage = 'FirstPage',
  Flag = 'Flag',
  Help = 'Help',
  Info = 'Info',
  LastPage = 'LastPage',
  LeaderboardFill = 'LeaderboardFill',
  LeaderboardOutline = 'LeaderboardOutline',
  LocationOn = 'LocationOn',
  Lock = 'Lock',
  Logout = 'Logout',
  Mail = 'Mail',
  Menu = 'Menu',
  More = 'More',
  Note = 'Note',
  Notification = 'Notification',
  NumberCircleOne = 'NumberCircleOne',
  NumberCircleTwo = 'NumberCircleTwo',
  NumberCircleThree = 'NumberCircleThree',
  NumberCircleFour = 'NumberCircleFour',
  NumberCircleFive = 'NumberCircleFive',
  OpenInNew = 'OpenInNew',
  OutgoingMail = 'OutgoingMail',
  PageViewFill = 'PageViewFill',
  PageViewOutline = 'PageViewOutline',
  Pending = 'Pending',
  PeopleFill = 'PeopleFill',
  PeopleOutline = 'PeopleOutline',
  Remove = 'Remove',
  Schedule = 'Schedule',
  ScheduleOutline = 'ScheduleOutline',
  Search = 'Search',
  Send = 'Send',
  Settings = 'Settings',
  Share = 'Share',
  Spinner = 'Spinner',
  Suitcase = 'Suitcase',
  SwapVert = 'SwapVert',
  VisibilityOn = 'VisibilityOn',
  VisibilityOff = 'VisibilityOff',
  Warning = 'Warning',
}

const iconsByName: { [key in IconName]: FC<SVGProps<SVGElement>> } = {
  [IconName.AccountCircleFill]: AccountCircleFillIcon,
  [IconName.AccountCircleOutline]: AccountCircleOutlineIcon,
  [IconName.ArrowBackward]: ArrowBackwardIcon,
  [IconName.ArrowCircleRightFill]: ArrowCircleRightFillIcon,
  [IconName.ArrowCircleRightOutline]: ArrowCircleRightOutlineIcon,
  [IconName.ArrowDownward]: ArrowDownwardIcon,
  [IconName.ArrowForward]: ArrowForwardIcon,
  [IconName.ArrowUpward]: ArrowUpwardIcon,
  [IconName.BookmarkFill]: BookmarkFillIcon,
  [IconName.BarChart]: BarChartIcon,
  [IconName.BookmarkOutline]: BookmarkOutlineIcon,
  [IconName.ChatFill]: ChatFillIcon,
  [IconName.ChatOutline]: ChatOutlineIcon,
  [IconName.Check]: CheckIcon,
  [IconName.CheckCircleFill]: CheckCircleFillIcon,
  [IconName.CheckCircleOutline]: CheckCircleOutlineIcon,
  [IconName.ChecklistRtlFill]: ChecklistRtlFillIcon,
  [IconName.ChevronDown]: ChevronDownIcon,
  [IconName.ChevronLeft]: ChevronLeftIcon,
  [IconName.ChevronRight]: ChevronRightIcon,
  [IconName.ChevronUp]: ChevronUpIcon,
  [IconName.Close]: CloseIcon,
  [IconName.Contract]: ContractIcon,
  [IconName.DecorativePoint]: DecorativePointIcon,
  [IconName.Delete]: DeleteIcon,
  [IconName.Description]: DescriptionIcon,
  [IconName.Edit]: EditIcon,
  [IconName.Euro]: EuroIcon,
  [IconName.EventFill]: EventFillIcon,
  [IconName.EventOutline]: EventOutlineIcon,
  [IconName.FavoriteFill]: FavoriteFillIcon,
  [IconName.Filter]: FilterIcon,
  [IconName.FirstPage]: FirstPageIcon,
  [IconName.Flag]: FlagIcon,
  [IconName.LastPage]: LastPageIcon,
  [IconName.LeaderboardFill]: LeaderboardFillIcon,
  [IconName.LeaderboardOutline]: LeaderboardOutlineIcon,
  [IconName.LocationOn]: LocationOnIcon,
  [IconName.Lock]: LockIcon,
  [IconName.Logout]: LogoutIcon,
  [IconName.Mail]: MailIcon,
  [IconName.Menu]: MenuIcon,
  [IconName.More]: MoreIcon,
  [IconName.NumberCircleOne]: NumberCircleOneIcon,
  [IconName.NumberCircleTwo]: NumberCircleTwoIcon,
  [IconName.NumberCircleThree]: NumberCircleThreeIcon,
  [IconName.NumberCircleFour]: NumberCircleFourIcon,
  [IconName.NumberCircleFive]: NumberCircleFiveIcon,
  [IconName.OpenInNew]: OpenInNewIcon,
  [IconName.OutgoingMail]: OutgoingMailIcon,
  [IconName.PageViewFill]: PageViewFillIcon,
  [IconName.PageViewOutline]: PageViewOutlineIcon,
  [IconName.PeopleFill]: PeopleFillIcon,
  [IconName.PeopleOutline]: PeopleOutlineIcon,
  [IconName.Schedule]: ScheduleIcon,
  [IconName.ScheduleOutline]: ScheduleOutlineIcon,
  [IconName.Share]: ShareIcon,
  [IconName.SwapVert]: SwapVertIcon,
  [IconName.Info]: InfoIcon,
  [IconName.Add]: AddIcon,
  [IconName.AttachFile]: AttachFileIcon,
  [IconName.Cancel]: CancelIcon,
  [IconName.Celebration]: CelebrationIcon,
  [IconName.Error]: ErrorIcon,
  [IconName.Help]: HelpIcon,
  [IconName.Warning]: WarningIcon,
  [IconName.Search]: SearchIcon,
  [IconName.Send]: SendIcon,
  [IconName.Settings]: SettingsIcon,
  [IconName.Spinner]: SpinnerIcon,
  [IconName.Suitcase]: SuitcaseIcon,
  [IconName.Pending]: PendingIcon,
  [IconName.Remove]: RemoveIcon,
  [IconName.Note]: NoteIcon,
  [IconName.Notification]: NotificationIcon,
  [IconName.VisibilityOn]: VisibilityOnIcon,
  [IconName.VisibilityOff]: VisibilityOffIcon,
  [IconName.Download]: DownloadIcon,
}

type IconComponentProps = ComponentPropsWithoutRef<'svg'> & {
  name: IconName
  title?: string
}
export default function IconComponent({
  name,
  className,
  ...props
}: IconComponentProps) {
  const Icon = iconsByName[name]
  return <Icon className={className} {...props} />
}
