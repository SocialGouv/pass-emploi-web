import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'
import { MandatoryNode } from 'types/components'

type LabelProps = {
  htmlFor: string
  children: MandatoryNode | { main: string; sub: string }
  inputRequired?: boolean
  withBulleMessageSensible?: boolean
}
export default function Label({
  htmlFor,
  inputRequired = false,
  withBulleMessageSensible = false,
  children,
}: LabelProps) {
  if (Object.prototype.hasOwnProperty.call(children, 'main')) {
    const { main, sub } = children as { main: string; sub: string }
    return (
      <label htmlFor={htmlFor} className='inline-block text-content_color mb-3'>
        <p
          className={`text-base-medium ${
            withBulleMessageSensible ? 'flex' : ''
          }`}
        >
          {inputRequired && <span aria-hidden={true}>*&nbsp;</span>}
          {main}
          {withBulleMessageSensible && (
            <span className='ml-2'>
              <BulleMessageSensible />
            </span>
          )}
        </p>
        <p className='text-s-regular'>{sub}</p>
      </label>
    )
  } else {
    const content = children as MandatoryNode
    return (
      <label
        htmlFor={htmlFor}
        className={`inline-block text-base-medium text-content_color mb-3 ${
          withBulleMessageSensible ? 'flex' : ''
        }`}
      >
        {inputRequired && <span aria-hidden={true}>*&nbsp;</span>}
        {content}
        {withBulleMessageSensible && (
          <span className='ml-2'>
            <BulleMessageSensible />
          </span>
        )}
      </label>
    )
  }
}
