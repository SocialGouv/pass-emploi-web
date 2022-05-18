import IconComponent from './IconComponent'

import { Badge } from 'components/ui/Badge'

export interface TabProps {
  label: string
  controls: string
  selected: boolean
  onSelectTab: () => void
  count?: number
  iconName?: string
}

export default function Tab({
  label,
  controls,
  selected,
  onSelectTab,
  count,
  iconName,
}: TabProps) {
  return (
    <button
      role='tab'
      id={`${controls}--tab`}
      type='button'
      tabIndex={selected ? -1 : undefined}
      aria-controls={controls}
      aria-selected={selected}
      onClick={onSelectTab}
      className={`text-m-regular px-4 pb-2 flex items-center ${
        selected
          ? 'border-b-4 border-b-primary text-content_color'
          : 'hover:border-b-4 hover:border-primary_darken text-grey_800'
      }`}
    >
      {iconName && (
        <IconComponent
          name={iconName}
          aria-hidden={true}
          focusable={false}
          className={`w-4 h-4 mr-2 ${
            selected
              ? 'fill-primary stroke-primary'
              : 'fill-grey_800 stroke-grey_800'
          }`}
        />
      )}
      {label}
      {count !== undefined && (
        <span className='ml-4'>
          <Badge count={count} />
        </span>
      )}
    </button>
  )
}
