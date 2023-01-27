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

    function upateValue(e: ChangeEvent<HTMLTextAreaElement>): void {
      const newValue = e.target.value
      setValue(newValue)
      onChange(newValue)
    }

    function provideDescription(): string | undefined {
      let descriptions = []
      if (invalid) descriptions.push(id + '--error')
      if (maxLength) descriptions.push(id + '--length')
      return descriptions.length ? descriptions.join(',') : undefined
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
          onChange={upateValue}
          onBlur={onBlur}
          maxLength={allowOverMax ? undefined : maxLength}
          rows={rows}
          aria-describedby={provideDescription()}
          aria-invalid={invalid || undefined}
          className={provideStyle()}
          ref={ref}
        />
        {Boolean(maxLength) && (
          <span className='text-xs-regular text-right mb-4'>
            <span id={id + '--length'} className='sr-only'>
              {debounced.length} sur {maxLength} caractères
            </span>
            <span aria-hidden={true} className={invalid ? 'text-warning' : ''}>
              {debounced.length} / {maxLength}
            </span>
          </span>
        )}
      </>
    )
  }
)

TextArea.displayName = 'TextArea'
export default TextArea
