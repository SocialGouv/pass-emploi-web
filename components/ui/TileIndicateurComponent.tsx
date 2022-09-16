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
    <div
      className={`flex flex-col p-3 rounded-medium bg-${bgColor} text-${textColor}`}
    >
      <span className='text-xl-bold'>{valeur}</span>

      <span className='flex items-center gap-1'>
        {iconName && (
          <IconComponent
            name={iconName}
            focusable='false'
            aria-hidden='true'
            className='inline w-3 h-3'
          />
        )}
        {label}
      </span>
    </div>
  )
}
