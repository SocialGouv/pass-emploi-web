import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { NombreActionsParStatut, StatutAction } from 'interfaces/action'

export const TOUTES_LES_ACTIONS_LABEL: string = 'toutes'

interface FiltresActionsTabListProps {
  currentFilter: string
  actionsCount: number
  actionsCountParStatut: NombreActionsParStatut
  prenomJeune: string
  controlledIdPrefix: string
  filterClicked: (filter: StatutAction | string) => void
}

export const LABELS_FILTRES: { [key in StatutAction]: string } = {
  Annulee: 'Annulées',
  Terminee: 'Terminées',
  Commencee: 'Commencées',
  ARealiser: 'À réaliser',
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

  return (
    <TabList label={`Filtrer les actions de ${prenomJeune} par statut`}>
      <Tab
        label='Toutes'
        count={actionsCount}
        controls={`${controlledIdPrefix}-${TOUTES_LES_ACTIONS_LABEL}`}
        selected={isSelected(TOUTES_LES_ACTIONS_LABEL)}
        onSelectTab={() => filterClicked(TOUTES_LES_ACTIONS_LABEL)}
      />
      {Object.values(StatutAction).map((statut) => (
        <Tab
          key={statut}
          label={LABELS_FILTRES[statut]}
          count={actionsCountParStatut[statut]}
          controls={`${controlledIdPrefix}-${statut}`}
          selected={isSelected(statut)}
          onSelectTab={() => filterClicked(statut)}
        />
      ))}
    </TabList>
  )
}

export default FiltresActionsTabList
