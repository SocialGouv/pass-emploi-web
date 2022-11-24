import { ChangeEvent } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/IconCheckbox.module.css'

interface IconCheckboxProps {
  id: string
  checked: boolean
  checkedIconName: IconName
  uncheckedIconName: IconName
  checkedLabel: string
  uncheckedLabel: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
}

export default function IconCheckbox({
  id,
  checked,
  checkedIconName,
  uncheckedIconName,
  checkedLabel,
  uncheckedLabel,
  onChange,
  className,
}: IconCheckboxProps) {
  return (
    <div title={checked ? checkedLabel : uncheckedLabel} className={className}>
      <input
        type='checkbox'
        id={id}
        checked={checked}
        className={`${styles.checkbox} sr-only`}
        onChange={onChange}
      />

      <label htmlFor={id}>
        <span className='sr-only'>
          {checked ? checkedLabel : uncheckedLabel}
        </span>
        <IconComponent
          name={checked ? checkedIconName : uncheckedIconName}
          aria-hidden={true}
          focusable={false}
          className='cursor-pointer w-full h-full fill-inherit'
        />
      </label>
    </div>
  )
}
