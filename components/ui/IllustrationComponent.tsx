import { ComponentPropsWithoutRef, FC, SVGProps } from 'react'

import IllustrationArrowForward from 'assets/images/illustration-arrow-forward.svg'
import IllustrationCheck from 'assets/images/illustration-check.svg'
import IllustrationChecklist from 'assets/images/illustration-checklist.svg'
import IllustrationDelete from 'assets/images/illustration-delete.svg'
import IllustrationError from 'assets/images/illustration-error.svg'
import IllustrationEtablissement from 'assets/images/illustration-etablissement.svg'
import IllustrationEvent from 'assets/images/illustration-event.svg'
import IllustrationForum from 'assets/images/illustration-forum.svg'
import IllustrationInfo from 'assets/images/illustration-info.svg'
import IllustrationMaintenance from 'assets/images/illustration-maintenance.svg'
import IllustrationMessagerie from 'assets/images/illustration-messagerie.svg'
import IllustrationPeople from 'assets/images/illustration-people.svg'
import IllustrationQuestion from 'assets/images/illustration-question-mark.svg'
import IllustrationSablier from 'assets/images/illustration-sablier.svg'
import IllustrationSearch from 'assets/images/illustration-search.svg'
import IllustrationSend from 'assets/images/illustration-send.svg'

export enum IllustrationName {
  ArrowForward = 'ArrowForward',
  Check = 'Check',
  Checklist = 'Checklist',
  Delete = 'Delete',
  Error = 'Error',
  Etablissement = 'Etablissement',
  Event = 'Event',
  Forum = 'Forum',
  Info = 'Info',
  Maintenance = 'Maintenance',
  Messagerie = 'Messagerie',
  People = 'People',
  Question = 'Question',
  Sablier = 'Sablier',
  Search = 'Search',
  Send = 'Send',
}

const illustrationsByName: {
  [key in IllustrationName]: FC<SVGProps<SVGElement>>
} = {
  [IllustrationName.ArrowForward]: IllustrationArrowForward,
  [IllustrationName.Check]: IllustrationCheck,
  [IllustrationName.Checklist]: IllustrationChecklist,
  [IllustrationName.Delete]: IllustrationDelete,
  [IllustrationName.Error]: IllustrationError,
  [IllustrationName.Etablissement]: IllustrationEtablissement,
  [IllustrationName.Event]: IllustrationEvent,
  [IllustrationName.Forum]: IllustrationForum,
  [IllustrationName.Info]: IllustrationInfo,
  [IllustrationName.Maintenance]: IllustrationMaintenance,
  [IllustrationName.Messagerie]: IllustrationMessagerie,
  [IllustrationName.People]: IllustrationPeople,
  [IllustrationName.Question]: IllustrationQuestion,
  [IllustrationName.Sablier]: IllustrationSablier,
  [IllustrationName.Search]: IllustrationSearch,
  [IllustrationName.Send]: IllustrationSend,
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
