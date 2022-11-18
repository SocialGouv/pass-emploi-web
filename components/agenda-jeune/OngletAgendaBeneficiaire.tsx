import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import AgendaActionRow from './AgendaActionRow'

import { AgendaRdvRow } from 'components/agenda-jeune/AgendaRdvRow'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { AgendaMetadata, EntreeAgenda } from 'interfaces/agenda'
import { AgendaService } from 'services/agenda.service'
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
    Array<EntreeAgenda>
  >([])
  const [metadata, setMetadata] = useState<AgendaMetadata>()

  function actionEtRendezVousRows(): JSX.Element[] {
    return actionsEtRendezVous.map((item) => {
      if (item.type === 'action') {
        return (
          <AgendaActionRow
            key={item.id}
            action={item}
            jeuneId={idBeneficiaire}
          />
        )
      }
      if (item.type === 'evenement') {
        return <AgendaRdvRow key={item.id} rdv={item} />
      }
      return <></>
    })
  }

  useEffect(() => {
    if (!isPoleEmploi) {
      agendaService
        .recupererAgenda(idBeneficiaire, DateTime.now())
        .then((response) => {
          updateNombreEvenement(response.entrees.length)
          setActionsEtRendezVous(response.entrees)
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
            <ol className=''>{actionEtRendezVousRows()}</ol>
          )}
        </div>
      )}
    </>
  )
}
