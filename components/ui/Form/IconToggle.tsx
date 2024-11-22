import IconComponent, { IconName } from 'components/ui/IconComponent'

type ToggleState = {
  iconName: IconName
  actionTitle: string
}
type IconToggleProps = {
  label: string
  checked: boolean
  checkedState: ToggleState
  uncheckedState: ToggleState
  onToggle: () => void
  className?: string
}

export default function IconToggle({
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
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        onClick={onToggle}
        aria-label={label}
        title={label + ' ' + state.actionTitle}
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
