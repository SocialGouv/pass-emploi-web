import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'

export interface TabProps {
  label: string
  controls: string
  selected: boolean
  onSelectTab: () => void
  important?: boolean
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
  important,
}: TabProps) {
  const accentuer = important && count && count > 0

  return (
    <li role='presentation'>
      <button
        role='tab'
        tabIndex={selected ? 0 : -1}
        id={`${controls}--tab`}
        aria-controls={controls}
        aria-selected={selected}
        onClick={onSelectTab}
        className={`h-full text-base-medium text-grey_800 px-4 pb-2 flex items-center cursor-pointer ${
          selected
            ? 'text-base-bold border-b-4 border-b-primary'
            : 'hover:font-bold'
        }`}
      >
        {iconName && (
          <IconComponent
            name={iconName}
            aria-hidden={true}
            focusable={false}
            className={`shrink-0 w-4 h-4 mr-2 ${
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
              className={
                'shrink-0 ml-4 ' +
                (accentuer
                  ? 'text-white bg-warning'
                  : 'text-primary bg-primary_lighten')
              }
            />
            <span className='sr-only'> éléments</span>
          </>
        )}
      </button>
    </li>
  )
}
