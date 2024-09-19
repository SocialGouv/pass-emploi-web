import IconComponent, { IconName } from '../IconComponent'

import { Badge } from 'components/ui/Indicateurs/Badge'

export interface TabProps {
  label: string
  controls: string
  selected: boolean
  onSelectTab: () => void
  count?: number
  iconName?: IconName
  ariaLabel?: string
}

export default function Tab({
  label,
  controls,
  selected,
  onSelectTab,
  count,
  iconName,
  ariaLabel,
}: TabProps) {
  return (
    <li role='presentation'>
      <button
        role='tab'
        tabIndex={selected ? 0 : -1}
        id={`${controls}--tab`}
        aria-controls={controls}
        aria-selected={selected}
        onClick={onSelectTab}
        className={`text-m-medium text-grey_800 px-4 pb-2 flex items-center cursor-pointer ${
          selected
            ? 'text-m-bold border-b-4 border-b-primary'
            : 'hover:font-bold'
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
        {ariaLabel ? <span aria-label={ariaLabel}>{label}</span> : label}
        {count !== undefined && (
          <>
            <span className='sr-only'> </span>
            <Badge
              count={count}
              textColor='primary'
              bgColor='primary_lighten'
              style='ml-4'
              size={6}
            />
            <span className='sr-only'> éléments</span>
          </>
        )}
      </button>
    </li>
  )
}
