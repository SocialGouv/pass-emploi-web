import { ComponentPropsWithoutRef } from 'react'

import IllustrationArrowForward from 'assets/images/illustration-arrow-forward.svg'
import IllustrationChecklist from 'assets/images/illustration-checklist-grey.svg'
import IllustrationDelete from 'assets/images/illustration-delete.svg'
import IllustrationError from 'assets/images/illustration-error.svg'
import IllustrationPeople from 'assets/images/illustration-people-grey.svg'
import IllustrationSend from 'assets/images/illustration-send-grey.svg'
import IllustrationSendWhite from 'assets/images/illustration-send-white.svg'

export enum IllustrationName {
  ArrowForward = 'ArrowForward',
  Checklist = 'Checklist',
  Delete = 'Delete',
  Error = 'Error',
  People = 'People',
  Send = 'Send',
  SendWhite = 'SendWhite',
}

const illustrationsByName: { [key in IllustrationName]: any } = {
  [IllustrationName.ArrowForward]: IllustrationArrowForward,
  [IllustrationName.Checklist]: IllustrationChecklist,
  [IllustrationName.Delete]: IllustrationDelete,
  [IllustrationName.Error]: IllustrationError,
  [IllustrationName.People]: IllustrationPeople,
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
