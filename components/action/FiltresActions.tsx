import Button, { ButtonStyle } from 'components/ui/Button'
import { ActionStatus } from 'interfaces/action'

const TOUTES_LES_ACTIONS_FILTRE_LABEL: string = 'toutes'

interface FiltresActionsProps {
  currentFilter: string
  actionsLength: number
  actionsARealiserLength: number
  actionsEnCoursLength: number
  actionsTermineesLength: number
  filterClicked: (filter: ActionStatus | string) => void
}

function FiltresActions({
  currentFilter,
  actionsLength,
  actionsARealiserLength,
  actionsEnCoursLength,
  actionsTermineesLength,
  filterClicked,
}: FiltresActionsProps) {
  return (
    <div role='tablist' className='flex'>
      <Button
        role='tab'
        id='actions-toutes'
        tabIndex={currentFilter === TOUTES_LES_ACTIONS_FILTRE_LABEL ? 0 : -1}
        selected={currentFilter === TOUTES_LES_ACTIONS_FILTRE_LABEL}
        aria-controls='panneau-actions-toutes'
        className='mr-4'
        style={ButtonStyle.SECONDARY}
        onClick={() => filterClicked(TOUTES_LES_ACTIONS_FILTRE_LABEL)}
      >
        Toutes ({actionsLength})
      </Button>
      <Button
        role='tab'
        id={`actions-${ActionStatus.NotStarted}`}
        tabIndex={currentFilter === ActionStatus.NotStarted ? 0 : -1}
        selected={currentFilter === ActionStatus.NotStarted}
        aria-controls={`panneau-actions-${ActionStatus.NotStarted}`}
        disabled={actionsARealiserLength === 0}
        className='mr-4'
        style={ButtonStyle.SECONDARY}
        onClick={() => filterClicked(ActionStatus.NotStarted)}
      >
        À réaliser ({actionsARealiserLength})
      </Button>
      <Button
        role='tab'
        id={`actions-${ActionStatus.InProgress}`}
        tabIndex={currentFilter === ActionStatus.InProgress ? 0 : -1}
        selected={currentFilter === ActionStatus.InProgress}
        aria-controls={`panneau-actions-${ActionStatus.InProgress}`}
        disabled={actionsEnCoursLength === 0}
        className='mr-4'
        style={ButtonStyle.SECONDARY}
        onClick={() => filterClicked(ActionStatus.InProgress)}
      >
        En Cours ({actionsEnCoursLength})
      </Button>
      <Button
        role='tab'
        id={`actions-${ActionStatus.Done}`}
        tabIndex={currentFilter === ActionStatus.Done ? 0 : -1}
        selected={currentFilter === ActionStatus.Done}
        disabled={actionsTermineesLength === 0}
        aria-controls={`panneau-actions-${ActionStatus.Done}`}
        className='mr-4'
        style={ButtonStyle.SECONDARY}
        onClick={() => filterClicked(ActionStatus.Done)}
      >
        Terminées ({actionsTermineesLength})
      </Button>
    </div>
  )
}

export default FiltresActions
