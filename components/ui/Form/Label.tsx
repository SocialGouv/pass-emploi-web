import { ReactNode } from 'react'

import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'

type LabelProps = {
  htmlFor: string
  children: ReactNode
  inputRequired?: boolean
  inputSensible?: boolean
}
export default function Label({
  htmlFor,
  inputRequired = false,
  inputSensible = false,
  children,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-base-medium text-content_color block mb-3 ${
        inputSensible ? 'flex' : ''
      }`}
    >
      {inputRequired && <span aria-hidden={true}>*&nbsp;</span>}
      {children}
      {inputSensible && (
        <span className='ml-2'>
          <BulleMessageSensible />
        </span>
      )}
    </label>
  )
}
