import React from 'react'

import { RdvRow } from 'components/rdv/RdvRow'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { AgendaData, renderAgenda } from 'presentation/Intercalaires'

type TableauRdvsConseillerProps = {
  idConseiller: string
  agendaRdvs: AgendaData<EvenementListItem>
}

export default function TableauRdvsConseiller({
  agendaRdvs,
  idConseiller,
}: TableauRdvsConseillerProps) {
  return (
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
  )
}
