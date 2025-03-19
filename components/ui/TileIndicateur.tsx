import IconComponent, { IconName } from './IconComponent'

type TileIndicateurColor =
  | 'PRIMARY'
  | 'ALERT'
  | 'WARNING'
  | 'ACCENT_2'
  | 'ACCENT_3'
type TileIndicateurProps = {
  valeur: string
  label: string
  color: TileIndicateurColor
  iconName?: IconName
}

export default function TileIndicateur({
  valeur,
  label,
  color,
  iconName,
}: TileIndicateurProps) {
  return (
    <li
      className={`flex flex-col shrink-0 p-3 rounded-base ${
        parseInt(valeur, 10) > 0 ? styles[color] : 'bg-grey-100 text-grey-800'
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

const styles: { [key in TileIndicateurColor]: string } = {
  ACCENT_2: 'text-accent-2 bg-accent-2-lighten',
  ACCENT_3: 'text-primary bg-accent-3-lighten',
  ALERT: 'text-content-color bg-alert-lighten',
  PRIMARY: 'text-primary-darken bg-primary-lighten',
  WARNING: 'text-warning bg-warning-lighten',
}
