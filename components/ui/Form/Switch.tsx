import { ChangeEvent, useRef } from 'react'

import styles from 'styles/components/Switch.module.css'

type SwitchProps = {
  id: string
  checked: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  checkedLabel?: string
  uncheckedLabel?: string
  disabled?: boolean
}

export function Switch({
  id,
  checked,
  disabled,
  checkedLabel = 'Oui',
  uncheckedLabel = 'Non',
  onChange,
}: SwitchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type='checkbox'
        id={id}
        checked={checked}
        disabled={disabled}
        className={styles.checkbox}
        onChange={onChange}
      />
      <div
        onClick={() => inputRef.current!.click()}
        className='cursor-pointer flex items-center'
      >
        <span className={styles.toggle}></span>
        {checked && <p className='ml-3'>{checkedLabel}</p>}
        {!checked && <p className='ml-3'>{uncheckedLabel}</p>}
      </div>
    </>
  )
}
