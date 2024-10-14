import IconComponent, { IconName } from './IconComponent'

export default function TileIndicateur({
  valeur,
  label,
  bgColor,
  textColor,
  iconName,
}: {
  valeur: string
  label: string
  bgColor: string
  textColor: string
  iconName?: IconName
}) {
  return (
    <li
      className={`flex flex-col shrink-0 p-3 rounded-base ${
        parseInt(valeur, 10) > 0
          ? `bg-${bgColor} text-${textColor}`
          : 'bg-grey_100 text-grey_800'
      }`}
    >
      <span className='text-xl-bold'>{valeur}</span>

      <span className='flex items-center gap-1'>
        {iconName && (
          <IconComponent
            name={iconName}
            focusable={false}
            aria-hidden={true}
            className='inline w-3 h-3 fill-current'
          />
        )}
        {label}
      </span>
    </li>
  )
}
