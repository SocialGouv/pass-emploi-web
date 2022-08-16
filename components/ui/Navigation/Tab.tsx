import IconComponent, { IconName } from './IconComponent'

import { Badge } from 'components/ui/Indicateurs/Badge'

export interface TabProps {
  label: string
  controls: string
  selected: boolean
  onSelectTab: () => void
  count?: number
  iconName?: IconName
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
    <li
      role='tab'
      id={`${controls}--tab`}
      tabIndex={selected ? 0 : -1}
      aria-controls={controls}
      aria-selected={selected}
      onClick={onSelectTab}
      className={`text-m-regular px-4 pb-2 flex items-center cursor-pointer ${
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
          <Badge count={count} bgColor='primary' />
        </span>
      )}
    </li>
  )
}
