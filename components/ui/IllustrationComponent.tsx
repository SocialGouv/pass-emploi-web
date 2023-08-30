import { ComponentPropsWithoutRef } from 'react'

import IllustrationArrowForward from 'assets/images/illustration-arrow-forward.svg'
import IllustrationDelete from 'assets/images/illustration-delete.svg'
import IllustrationError from 'assets/images/illustration-error.svg'

export enum IllustrationName {
  ArrowForward = 'ArrowForward',
  Delete = 'Delete',
  Error = 'Error',
}

const illustrationsByName: { [key in IllustrationName]: any } = {
  [IllustrationName.ArrowForward]: IllustrationArrowForward,
  [IllustrationName.Delete]: IllustrationDelete,
  [IllustrationName.Error]: IllustrationError,
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
