import Button, { ButtonStyle } from 'components/ui/Button'
import {
  NombreActionsParStatut,
  ActionStatus,
  LABELS_STATUT,
} from 'interfaces/action'

export const TOUTES_LES_ACTIONS_LABEL: string = 'toutes'

interface FiltresActionsTabListProps {
  currentFilter: string
  actionsCount: number
  actionsCountParStatut: NombreActionsParStatut
  prenomJeune: string
  controlledIdPrefix: string
  filterClicked: (filter: ActionStatus | string) => void
}

function FiltresActionsTabList({
  currentFilter,
  actionsCount,
  actionsCountParStatut,
  prenomJeune,
  controlledIdPrefix,
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
        aria-controls={`${controlledIdPrefix}-${TOUTES_LES_ACTIONS_LABEL}`}
        className='mr-4'
        style={
          isSelected(TOUTES_LES_ACTIONS_LABEL)
            ? ButtonStyle.PRIMARY
            : ButtonStyle.SECONDARY
        }
        onClick={() => filterClicked(TOUTES_LES_ACTIONS_LABEL)}
      >
        Toutes ({actionsCount})
      </Button>
      {Object.values(ActionStatus).map((statut) => (
        <Button
          role='tab'
          key={`actions-${statut.toLowerCase()}`}
          id={`actions-${statut.toLowerCase()}`}
          type='button'
          tabIndex={getTabIndex(statut)}
          selected={isSelected(statut)}
          aria-controls={`${controlledIdPrefix}-${statut}`}
          disabled={actionsCountParStatut[statut] === 0}
          className='mr-4'
          style={
            isSelected(statut) ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY
          }
          onClick={() => filterClicked(statut)}
        >
          {LABELS_STATUT[statut]} ({actionsCountParStatut[statut]})
        </Button>
      ))}
    </div>
  )
}

export default FiltresActionsTabList
