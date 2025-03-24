import IconComponent, { IconName } from 'components/ui/IconComponent'
import { unsafeRandomId } from 'utils/helpers'

export default function BulleMessageSensible() {
  // TODO toggletip https://inclusive-components.design/tooltips-toggletips/ ?
  const labelId = 'warning-propos-' + unsafeRandomId()
  const texte =
    'Attention à nos propos. Ne sont autorisés, ni les commentaires insultants ou excessifs, ni les données trop personnelles ou sensibles.'
  return (
    <>
      <IconComponent
        name={IconName.Info}
        className='inline h-6 w-6 fill-primary'
        role='img'
        aria-labelledby={labelId}
        title={texte}
      />
      <span id={labelId} className='sr-only'>
        {texte}
      </span>
    </>
  )
}
