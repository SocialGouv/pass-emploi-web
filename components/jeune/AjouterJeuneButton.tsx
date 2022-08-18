import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface AjouterJeuneButtonProps {
  handleAddJeune: () => void
}

export const AjouterJeuneButton = ({
  handleAddJeune,
}: AjouterJeuneButtonProps) => {
  return (
    <Button onClick={handleAddJeune}>
      <IconComponent
        name={IconName.Add}
        focusable='false'
        aria-hidden='true'
        className='mr-2 w-4 h-4'
      />
      Ajouter un jeune
    </Button>
  )
}
