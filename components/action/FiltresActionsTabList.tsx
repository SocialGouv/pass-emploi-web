import Button, { ButtonStyle } from 'components/ui/Button'
import { ActionStatus } from 'interfaces/action'

const TOUTES_LES_ACTIONS_LABEL: string = 'toutes'

interface FiltresActionsTabListProps {
  currentFilter: string
  actionsLength: number
  actionsARealiserLength: number
  actionsCommenceesLength: number
  actionsTermineesLength: number
  prenomJeune: string
  filterClicked: (filter: ActionStatus | string) => void
}

function FiltresActionsTabList({
  currentFilter,
  actionsLength,
  actionsARealiserLength,
  actionsCommenceesLength,
  actionsTermineesLength,
  prenomJeune,
  filterClicked,
}: FiltresActionsTabListProps) {
  function isSelected(filter: string): boolean {
    return currentFilter === filter
  }

  function getTabIndex(filter: string): -1 | 0 {
    return isSelected(filter) ? -1 : 0
  }

  return (
    <div
      role='tablist'
      className='flex'
      aria-label={`Filtrer les actions de ${prenomJeune} par statut`}
    >
      <Button
        role='tab'
        id='actions-toutes'
        type='button'
        tabIndex={getTabIndex(TOUTES_LES_ACTIONS_LABEL)}
        selected={isSelected(TOUTES_LES_ACTIONS_LABEL)}
        aria-controls={`panneau-actions-${TOUTES_LES_ACTIONS_LABEL}`}
        className='mr-4'
        style={
          isSelected(TOUTES_LES_ACTIONS_LABEL)
            ? ButtonStyle.PRIMARY
            : ButtonStyle.SECONDARY
        }
        onClick={() => filterClicked(TOUTES_LES_ACTIONS_LABEL)}
      >
        Toutes ({actionsLength})
      </Button>
      <Button
        role='tab'
        id={`actions-${ActionStatus.NotStarted}`}
        type='button'
        tabIndex={getTabIndex(ActionStatus.NotStarted)}
        selected={isSelected(ActionStatus.NotStarted)}
        aria-controls={`panneau-actions-${ActionStatus.NotStarted}`}
        disabled={actionsARealiserLength === 0}
        className='mr-4'
        style={
          isSelected(ActionStatus.NotStarted)
            ? ButtonStyle.PRIMARY
            : ButtonStyle.SECONDARY
        }
        onClick={() => filterClicked(ActionStatus.NotStarted)}
      >
        À réaliser ({actionsARealiserLength})
      </Button>
      <Button
        role='tab'
        id={`actions-${ActionStatus.InProgress}`}
        type='button'
        tabIndex={getTabIndex(ActionStatus.InProgress)}
        selected={isSelected(ActionStatus.InProgress)}
        aria-controls={`panneau-actions-${ActionStatus.InProgress}`}
        disabled={actionsCommenceesLength === 0}
        className='mr-4'
        style={
          isSelected(ActionStatus.InProgress)
            ? ButtonStyle.PRIMARY
            : ButtonStyle.SECONDARY
        }
        onClick={() => filterClicked(ActionStatus.InProgress)}
      >
        Commencées ({actionsCommenceesLength})
      </Button>
      <Button
        role='tab'
        id={`actions-${ActionStatus.Done}`}
        type='button'
        tabIndex={getTabIndex(ActionStatus.Done)}
        selected={isSelected(ActionStatus.Done)}
        disabled={actionsTermineesLength === 0}
        aria-controls={`panneau-actions-${ActionStatus.Done}`}
        className='mr-4'
        style={
          isSelected(ActionStatus.Done)
            ? ButtonStyle.PRIMARY
            : ButtonStyle.SECONDARY
        }
        onClick={() => filterClicked(ActionStatus.Done)}
      >
        Terminées ({actionsTermineesLength})
      </Button>
    </div>
  )
}

export default FiltresActionsTabList
