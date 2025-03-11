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
        parseInt(valeur, 10) > 0 ? styles[color] : 'bg-grey_100 text-grey_800'
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
  ACCENT_2: 'text-accent_2 bg-accent_2_lighten',
  ACCENT_3: 'text-primary bg-accent_3_lighten',
  ALERT: 'text-content_color bg-alert_lighten',
  PRIMARY: 'text-primary_darken bg-primary_lighten',
  WARNING: 'text-warning bg-warning_lighten',
}
