import { ComponentPropsWithoutRef } from 'react'

import IllustrationArrowForward from 'assets/images/illustration-arrow-forward.svg'
import IllustrationCheck from 'assets/images/illustration-check.svg'
import IllustrationChecklist from 'assets/images/illustration-checklist-grey.svg'
import IllustrationCurvyArrow from 'assets/images/illustration-curvy-arrow.svg'
import IllustrationDelete from 'assets/images/illustration-delete.svg'
import IllustrationError from 'assets/images/illustration-error.svg'
import IllustrationEtablissement from 'assets/images/illustration-etablissement.svg'
import IllustrationEvent from 'assets/images/illustration-event-grey.svg'
import IllustrationInfo from 'assets/images/illustration-info.svg'
import IllustrationMaintenance from 'assets/images/illustration-maintenance.svg'
import IllustrationPeople from 'assets/images/illustration-people-grey.svg'
import IllustrationSablier from 'assets/images/illustration-sablier.svg'
import IllustrationSearch from 'assets/images/illustration-search-grey.svg'
import IllustrationSend from 'assets/images/illustration-send-grey.svg'
import IllustrationSendWhite from 'assets/images/illustration-send-white.svg'

export enum IllustrationName {
  ArrowForward = 'ArrowForward',
  Check = 'Check',
  Checklist = 'Checklist',
  CurvyArrow = 'CurvyArrow',
  Delete = 'Delete',
  Error = 'Error',
  Etablissement = 'Etablissement',
  Event = 'Event',
  Info = 'Info',
  Maintenance = 'Maintenance',
  People = 'People',
  Sablier = 'Sablier',
  Search = 'Search',
  Send = 'Send',
  SendWhite = 'SendWhite',
}

const illustrationsByName: { [key in IllustrationName]: any } = {
  [IllustrationName.ArrowForward]: IllustrationArrowForward,
  [IllustrationName.Check]: IllustrationCheck,
  [IllustrationName.Checklist]: IllustrationChecklist,
  [IllustrationName.CurvyArrow]: IllustrationCurvyArrow,
  [IllustrationName.Delete]: IllustrationDelete,
  [IllustrationName.Error]: IllustrationError,
  [IllustrationName.Etablissement]: IllustrationEtablissement,
  [IllustrationName.Event]: IllustrationEvent,
  [IllustrationName.Info]: IllustrationInfo,
  [IllustrationName.Maintenance]: IllustrationMaintenance,
  [IllustrationName.People]: IllustrationPeople,
  [IllustrationName.Sablier]: IllustrationSablier,
  [IllustrationName.Search]: IllustrationSearch,
  [IllustrationName.Send]: IllustrationSend,
  [IllustrationName.SendWhite]: IllustrationSendWhite,
}

type IllustrationsComponentProps = ComponentPropsWithoutRef<'svg'> & {
  name: IllustrationName
  title?: string
}
export default function IllustrationComponent({
  name,
  ...props
}: IllustrationsComponentProps) {
  const Icon = illustrationsByName[name]
  return <Icon {...props} />
}
