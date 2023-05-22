import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'

interface AjouterJeuneButtonProps {
  structure: StructureConseiller
}

export const AjouterJeuneButton = ({ structure }: AjouterJeuneButtonProps) => {
  function getHref() {
    switch (structure) {
      case StructureConseiller.MILO:
        return '/mes-jeunes/milo/creation-jeune'
      case StructureConseiller.POLE_EMPLOI:
        return '/mes-jeunes/pole-emploi/creation-jeune'
    }
  }

  const href = getHref()

  return (
    <>
      {href && (
        <ButtonLink href={href}>
          <IconComponent
            name={IconName.Add}
            focusable='false'
            aria-hidden='true'
            className='mr-2 w-4 h-4'
          />
          Ajouter un bénéficiaire
        </ButtonLink>
      )}
    </>
  )
}
