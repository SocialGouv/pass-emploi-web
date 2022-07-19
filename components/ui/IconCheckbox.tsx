import { ChangeEvent, ComponentPropsWithoutRef } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/IconCheckbox.module.css'

interface IconCheckboxProps extends ComponentPropsWithoutRef<any> {
  id: string
  checked: boolean
  checkedIconName: IconName
  uncheckedIconName: IconName
  checkedLabel: string
  uncheckedLabel: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function IconCheckbox({
  id,
  checked,
  checkedIconName,
  uncheckedIconName,
  checkedLabel,
  uncheckedLabel,
  onChange,
  ...props
}: IconCheckboxProps) {
  return (
    <div title={checked ? checkedLabel : uncheckedLabel} {...props}>
      <label htmlFor={id} className='sr-only'>
        {checked ? checkedLabel : uncheckedLabel}
      </label>

      <input
        type='checkbox'
        id={id}
        checked={checked}
        className={`${styles.checkbox} sr-only`}
        onChange={onChange}
      />

      <IconComponent
        name={checked ? checkedIconName : uncheckedIconName}
        aria-hidden={true}
        focusable={false}
        className='cursor-pointer w-full h-full fill-inherit'
      />
    </div>
  )
}
