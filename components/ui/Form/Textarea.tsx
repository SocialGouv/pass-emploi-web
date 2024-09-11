import { ChangeEvent, forwardRef, useState } from 'react'

import styles from 'styles/components/Input.module.css'
import { useDebounce } from 'utils/hooks/useDebounce'

type TextareaProps = {
  id: string
  onChange: (value: string) => void
  rows?: number
  required?: boolean
  disabled?: boolean
  defaultValue?: string
  maxLength?: number
  onBlur?: () => void
  invalid?: boolean
  allowOverMax?: boolean
}

type DecompteCaracteresProps = {
  id: string
  debounced: string
  maxLength?: number
  invalid: boolean
}

function DecompteCaracteres({
  id,
  debounced,
  maxLength,
  invalid,
}: DecompteCaracteresProps) {
  return (
    <div className='text-xs-regular text-right mb-4'>
      <p
        id={id + '--length'}
        aria-live='polite'
        aria-atomic={true}
        className='sr-only'
      >
        {debounced.length} sur {maxLength} caractères autorisés
      </p>
      <p aria-hidden={true} className={invalid ? 'text-warning' : ''}>
        {debounced.length} / {maxLength}
      </p>
    </div>
  )
}

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      onChange,
      rows = 3,
      defaultValue = '',
      required = false,
      disabled = false,
      invalid = false,
      onBlur,
      maxLength,
      allowOverMax = false,
    },
    ref
  ) => {
    const [value, setValue] = useState<string>(defaultValue)
    const debounced = useDebounce(value, 500)

    function updateValue(e: ChangeEvent<HTMLTextAreaElement>): void {
      const newValue = e.target.value
      setValue(newValue)
      onChange(newValue)
    }

    function provideDescription(): string | undefined {
      let descriptions = []
      if (invalid) descriptions.push(id + '--error')
      if (maxLength) descriptions.push(id + '--length')
      return descriptions.length ? descriptions.join(' ') : undefined
    }

    function provideStyle(): string {
      let className = styles.input
      if (maxLength) className += ' !mb-3'
      if (invalid) className += ' ' + styles.invalid
      return className
    }

    return (
      <>
        <textarea
          id={id}
          required={required}
          disabled={disabled}
          defaultValue={defaultValue}
          onChange={updateValue}
          onBlur={onBlur}
          maxLength={allowOverMax ? undefined : maxLength}
          rows={rows}
          aria-describedby={provideDescription()}
          aria-invalid={invalid || undefined}
          className={provideStyle()}
          ref={ref}
        />
        {Boolean(maxLength) && (
          <DecompteCaracteres
            id={id}
            debounced={debounced}
            maxLength={maxLength}
            invalid={invalid}
          />
        )}
      </>
    )
  }
)

TextArea.displayName = 'TextArea'
export default TextArea
