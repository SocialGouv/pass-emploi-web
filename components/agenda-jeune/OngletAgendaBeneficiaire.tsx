import React, { useEffect, useState } from 'react'

import AgendaRow from 'components/agenda-jeune/AgendaRow'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Agenda, AgendaMetadata, EntreeAgenda } from 'interfaces/agenda'
import { toShortDate } from 'utils/date'

interface OngletAgendaBeneficiaireProps {
  idBeneficiaire: string
  isPoleEmploi: boolean
  recupererAgenda: () => Promise<Agenda>
}

export function OngletAgendaBeneficiaire({
  idBeneficiaire,
  isPoleEmploi,
  recupererAgenda,
}: OngletAgendaBeneficiaireProps) {
  const [actionsEtRendezVous, setActionsEtRendezVous] = useState<
    Array<EntreeAgenda>
  >([])
  const [metadata, setMetadata] = useState<AgendaMetadata>()

  useEffect(() => {
    if (!isPoleEmploi) {
      recupererAgenda().then((agenda) => {
        setActionsEtRendezVous(agenda.entrees)
        setMetadata(agenda.metadata)
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
            <ol>
              {actionsEtRendezVous.map((entree) => (
                <AgendaRow
                  key={entree.id}
                  entree={entree}
                  jeuneId={idBeneficiaire}
                />
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  )
}
