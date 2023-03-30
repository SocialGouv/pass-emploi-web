import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'

type ComplexLabel = {
  main: string
  helpText: string | string[]
  precision?: string
}
type LabelProps = {
  htmlFor: string
  children: string | ComplexLabel
  inputRequired?: boolean
  withBulleMessageSensible?: boolean
}
export default function Label({
  htmlFor,
  inputRequired = false,
  withBulleMessageSensible = false,
  children,
}: LabelProps) {
  const { main, helpText, precision } = isComplexLabel(children)
    ? children
    : { main: children, helpText: undefined, precision: undefined }

  return (
    <label htmlFor={htmlFor} className='flex flex-wrap text-content_color mb-3'>
      <span className='text-base-regular'>
        {inputRequired && <span aria-hidden={true}>*&nbsp;</span>}
        {main}
        {withBulleMessageSensible && (
          <span className='ml-2'>
            <BulleMessageSensible />
          </span>
        )}
      </span>
      {helpText && <span className='text-s-regular ml-2'> {helpText}</span>}
      {helpText && <span className='text-xs-regular ml-2'> {precision}</span>}
    </label>
  )
}

function isComplexLabel(
  children: string | ComplexLabel
): children is ComplexLabel {
  return Object.prototype.hasOwnProperty.call(children, 'main')
}
