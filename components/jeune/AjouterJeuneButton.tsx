import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'

interface AjouterJeuneButtonProps {
  structure: StructureConseiller
}

export function getAjouterJeuneHref(structure: StructureConseiller): string {
  switch (structure) {
    case StructureConseiller.MILO:
    case StructureConseiller.POLE_EMPLOI:
    case StructureConseiller.POLE_EMPLOI_BRSA:
      return '/mes-jeunes/creation-jeune'
    default:
      return ''
  }
}

export function AjouterJeuneButton({ structure }: AjouterJeuneButtonProps) {
  const href = getAjouterJeuneHref(structure)

  return (
    <>
      {href && (
        <ButtonLink href={href}>
          <IconComponent
            name={IconName.Add}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-4 h-4'
          />
          Ajouter un bénéficiaire
        </ButtonLink>
      )}
    </>
  )
}
