import TexteAvecLien from 'components/chat/TexteAvecLien'
import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'

type ComplexLabel = {
  main: string
  helpText: string | string[]
  precision?: string
}
type LabelProps = {
  htmlFor: string
  children: string | string[] | ComplexLabel
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
    <label
      htmlFor={htmlFor}
      className='flex flex-wrap items-baseline text-content_color mb-3'
    >
      <span className='text-base-regular'>
        {inputRequired && <span>*&nbsp;</span>}
        {main}
        {withBulleMessageSensible && (
          <span className='ml-2'>
            <BulleMessageSensible />
          </span>
        )}
      </span>
      {helpText && <span className='text-s-regular ml-2'> {helpText}</span>}
      {precision && (
        <span className='text-xs-regular ml-2'>
          <TexteAvecLien texte={precision} />
        </span>
      )}
    </label>
  )
}

function isComplexLabel(
  children: string | string[] | ComplexLabel
): children is ComplexLabel {
  return Object.prototype.hasOwnProperty.call(children, 'main')
}
