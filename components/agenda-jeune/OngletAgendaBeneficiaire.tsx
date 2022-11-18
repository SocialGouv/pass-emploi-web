import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import AgendaActionRow from './AgendaActionRow'

import { AgendaRdvRow } from 'components/agenda-jeune/AgendaRdvRow'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Action } from 'interfaces/action'
import { RdvListItem } from 'interfaces/rdv'
import { fusionneEtTriActionsEtRendezVous } from 'presentation/AgendaJeunePresentationHelper'
import { AgendaMetadata, AgendaService } from 'services/agenda.service'
import { toShortDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

interface OngletAgendaBeneficiaireProps {
  idBeneficiaire: string
  isPoleEmploi: boolean
  updateNombreEvenement: (nombre: number) => void
}

export function OngletAgendaBeneficiaire({
  idBeneficiaire,
  isPoleEmploi,
  updateNombreEvenement,
}: OngletAgendaBeneficiaireProps) {
  const agendaService = useDependance<AgendaService>('agendaService')
  const [actionsEtRendezVous, setActionsEtRendezVous] = useState<
    Array<Action | RdvListItem>
  >([])
  const [metadata, setMetadata] = useState<AgendaMetadata>()

  function instanceOfAction(object: any): object is Action {
    return 'creator' in object && 'dateEcheance' in object
  }

  function instanceOfRdvListItem(object: any): object is RdvListItem {
    return 'beneficiaires' in object && 'modality' in object
  }

  function actionEtRendezVousRows(): JSX.Element[] {
    return actionsEtRendezVous.map((item) => {
      if (instanceOfAction(item)) {
        return (
          <AgendaActionRow
            key={item.id}
            action={item}
            jeuneId={idBeneficiaire}
          />
        )
      }
      if (instanceOfRdvListItem(item)) {
        return <AgendaRdvRow key={item.id} rdv={item} />
      }
      return <></>
    })
  }

  useEffect(() => {
    if (!isPoleEmploi) {
      agendaService
        .recupererAgendaMilo(idBeneficiaire, DateTime.now())
        .then((response) => {
          updateNombreEvenement(
            response.actions.length + response.rendezVous.length
          )
          setActionsEtRendezVous(
            fusionneEtTriActionsEtRendezVous(
              response.actions,
              response.rendezVous
            )
          )
          setMetadata(response.metadata)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {isPoleEmploi && (
        <IntegrationPoleEmploi label='convocations et démarches' />
      )}

      {!isPoleEmploi && !metadata && <SpinningLoader />}

      {!isPoleEmploi && metadata && (
        <div>
          <p className='text-m-bold text-primary mb-6'>
            Période du {toShortDate(metadata.dateDeDebut)} au{' '}
            {toShortDate(metadata.dateDeFin)}
          </p>
          {actionsEtRendezVous.length === 0 && (
            <p className='text-content_color'>
              Il n’y a pas encore de rendez-vous ni d’action prévus sur cette
              période.
            </p>
          )}
          {actionsEtRendezVous.length > 0 && (
            <div className='table w-full border-spacing-y-2 border-separate'>
              <div role='rowgroup' className='table-row-group'>
                {actionEtRendezVousRows()}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
