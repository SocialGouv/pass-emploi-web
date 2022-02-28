import Button from 'components/ui/Button'
import AddIcon from '../../assets/icons/add_person.svg'

interface AjouterJeuneButtonProps {
  handleAddJeune: () => void
}

export const AjouterJeuneButton = ({
  handleAddJeune,
}: AjouterJeuneButtonProps) => {
  return (
    <Button onClick={handleAddJeune}>
      <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
      Ajouter un jeune
    </Button>
  )
}
