import React, {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  MouseEvent,
  useImperativeHandle,
  useRef,
} from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/ResettableTextInput.module.css'

interface ResettableTextInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onReset: () => void
  type?: string
  className?: string
  required?: boolean
  invalid?: boolean
}

function ResettableTextInput(
  {
    id,
    value,
    onChange,
    onReset,
    type = 'text',
    className,
    required = false,
    invalid = false,
  }: ResettableTextInputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current!)

  function applyChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
  }

  function applyReset(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    onReset()
    inputRef.current!.focus()
  }

  return (
    <div
      className={
        styles.wrapper +
        ' flex flex-horizontal overflow-hidden bg-white ' +
        (className ?? '')
      }
    >
      <input
        type={type}
        id={id}
        name={id}
        ref={inputRef}
        value={value}
        onChange={applyChange}
        className='flex-1 p-3 bg-white rounded-l-base outline-none'
        required={required}
        aria-describedby={invalid ? id + '--error' : undefined}
        aria-invalid={invalid || undefined}
      />
      <button
        type='reset'
        className='m-auto w-10 h-10 rounded-full hover:rounded-full hover:bg-primary_lighten'
        onClick={applyReset}
      >
        <span className='sr-only'>Effacer le champ de saisie</span>
        <IconComponent
          name={IconName.Close}
          focusable={false}
          aria-hidden={true}
          className='m-auto w-6 h-6 fill-current'
          title='Effacer'
        />
      </button>
    </div>
  )
}

export default forwardRef(ResettableTextInput)
