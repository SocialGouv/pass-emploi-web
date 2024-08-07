import IconComponent, { IconName } from 'components/ui/IconComponent'

type IconToggleProps = {
  id: string
  checked: boolean
  checkedIconName: IconName
  uncheckedIconName: IconName
  actionLabel: string
  oppositeActionLabel: string
  onToggle: () => void
  className?: string
}

export default function IconToggle({
  id,
  checked,
  checkedIconName,
  uncheckedIconName,
  actionLabel,
  oppositeActionLabel,
  onToggle,
  className,
}: IconToggleProps) {
  return (
    <>
      <label htmlFor={id} className='sr-only'>
        {actionLabel}
      </label>
      <button
        id={id}
        type='button'
        role='switch'
        aria-checked={checked}
        onClick={onToggle}
        title={checked ? oppositeActionLabel : actionLabel}
        className={className}
      >
        <IconComponent
          name={checked ? checkedIconName : uncheckedIconName}
          focusable={false}
          aria-hidden={true}
          className='fill-inherit'
        />
      </button>
    </>
  )
}
