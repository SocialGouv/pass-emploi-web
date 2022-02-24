import Button from 'components/ui/Button'
import { UserStructure } from 'interfaces/conseiller'
import Router from 'next/router'
import AddIcon from '../../assets/icons/add_person.svg'

interface AjouterJeuneButtonProps {
  structureConseiller: string
}

export const AjouterJeuneButton = ({
  structureConseiller,
}: AjouterJeuneButtonProps) => {
  const handleAddJeune = () => {
    switch (structureConseiller) {
      case UserStructure.MILO:
        Router.push('/mes-jeunes/milo/creation-jeune')
        break
      case UserStructure.POLE_EMPLOI:
        Router.push('/mes-jeunes/pole-emploi/creation-jeune')
        break
      default:
        break
    }
  }

  return (
    <Button onClick={handleAddJeune}>
      <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
      Ajouter un jeune
    </Button>
  )
}
