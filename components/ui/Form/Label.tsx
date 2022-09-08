import { ReactNode } from 'react'

import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'

type LabelProps = {
  htmlFor: string
  children: ReactNode
  inputRequired?: boolean
  withBulleMessageSensible?: boolean
}
export default function Label({
  htmlFor,
  inputRequired = false,
  withBulleMessageSensible = false,
  children,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-base-medium text-content_color block mb-3 ${
        withBulleMessageSensible ? 'flex' : ''
      }`}
    >
      {inputRequired && <span aria-hidden={true}>*&nbsp;</span>}
      {children}
      {withBulleMessageSensible && (
        <span className='ml-2'>
          <BulleMessageSensible />
        </span>
      )}
    </label>
  )
}
