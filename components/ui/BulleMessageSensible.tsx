import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function BulleMessageSensible() {
  return (
    <span
      aria-label='Attention à nos propos. Ne sont autorisés, ni les commentaires insultants ou excessifs, ni les données trop personnelles ou sensibles.'
      title='Attention à nos propos. Ne sont autorisés, ni les commentaires insultants ou excessifs, ni les données trop personnelles ou sensibles.'
    >
      <IconComponent
        name={IconName.InfoOutline}
        className='h-6 w-6 fill-primary '
      />
    </span>
  )
}
