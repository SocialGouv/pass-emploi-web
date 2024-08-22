import IconComponent, { IconName } from 'components/ui/IconComponent'

type ToggleState = {
  iconName: IconName
  actionTitle: string
}
type IconToggleProps = {
  id: string
  label: string
  checked: boolean
  checkedState: ToggleState
  uncheckedState: ToggleState
  onToggle: () => void
  className?: string
}

export default function IconToggle({
  id,
  label,
  checked,
  checkedState,
  uncheckedState,
  onToggle,
  className,
}: IconToggleProps) {
  const state = checked ? checkedState : uncheckedState
  return (
    <>
      <label htmlFor={id} className='sr-only'>
        {label}
      </label>
      <button
        id={id}
        type='button'
        role='switch'
        aria-checked={checked}
        onClick={onToggle}
        title={state.actionTitle}
        className={className}
      >
        <IconComponent
          name={state.iconName}
          focusable={false}
          aria-hidden={true}
          className='fill-inherit'
        />
      </button>
    </>
  )
}
