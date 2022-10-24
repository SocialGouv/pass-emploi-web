import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'
import { MandatoryNode } from 'types/components'

type LabelProps = {
  htmlFor: string
  children: MandatoryNode | { main: string; helpText: string }
  inputRequired?: boolean
  withBulleMessageSensible?: boolean
}
export default function Label({
  htmlFor,
  inputRequired = false,
  withBulleMessageSensible = false,
  children,
}: LabelProps) {
  const withHelpText = Object.prototype.hasOwnProperty.call(children, 'main')
  const mainLabel: string = withHelpText
    ? (children as { main: string }).main
    : (children as string)
  const helpText: string | undefined = withHelpText
    ? (children as { helpText: string }).helpText
    : undefined

  return (
    <label htmlFor={htmlFor} className='flex flex-wrap text-content_color mb-3'>
      <span className='text-base-medium mr-2'>
        {inputRequired && <span aria-hidden={true}>*&nbsp;</span>}
        {mainLabel}
        {withBulleMessageSensible && (
          <span className='ml-2'>
            <BulleMessageSensible />
          </span>
        )}
      </span>
      {helpText && <span className='text-s-regular'> {helpText}</span>}
    </label>
  )
}
