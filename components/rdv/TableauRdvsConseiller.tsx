import { DateTime } from 'luxon'
import React from 'react'

import EmptyState from 'components/EmptyState'
import { RdvRow } from 'components/rdv/RdvRow'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { buildAgenda, renderAgenda } from 'presentation/Intercalaires'

type TableauRdvsConseillerProps = {
  idConseiller: string
  rdvs: EvenementListItem[]
  periode: { debut: DateTime; fin: DateTime }
}

export default function TableauRdvsConseiller({
  rdvs,
  idConseiller,
  periode,
}: TableauRdvsConseillerProps) {
  const agendaRdvs = buildAgenda(rdvs, periode, ({ date }) =>
    DateTime.fromISO(date)
  )

  return (
    <>
      {rdvs.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre='Vous n’avez rien de prévu pour l’instant.'
            premierLien={{
              href: '/mes-jeunes/edition-rdv?type=ac',
              label: 'Créer une animation collective',
              iconName: IconName.Add,
            }}
            secondLien={{
              href: '/mes-jeunes/edition-rdv',
              label: 'Créer un rendez-vous',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {rdvs.length > 0 && (
        <Table asDiv={true} caption={{ text: 'Liste de mes événements' }}>
          <THead>
            <TR isHeader={true}>
              <TH>Horaires</TH>
              <TH>Bénéficiaire</TH>
              <TH>Type</TH>
              <TH>Modalité</TH>
              <TH>Créé par vous</TH>
            </TR>
          </THead>

          <TBody>
            {renderAgenda(
              agendaRdvs,
              (rdv) => (
                <RdvRow key={rdv.id} rdv={rdv} idConseiller={idConseiller} />
              ),
              true
            )}
          </TBody>
        </Table>
      )}
    </>
  )
}
