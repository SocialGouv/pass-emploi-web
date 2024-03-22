import React from 'react'

import { AgendaData, AgendaRows } from 'components/AgendaRows'
import { EvenementRow } from 'components/rdv/EvenementRow'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'

type TableauEvenementsConseillerProps = {
  idConseiller: string
  agendaEvenements: AgendaData<EvenementListItem>
}

export default function TableauEvenementsConseiller({
  agendaEvenements,
  idConseiller,
}: TableauEvenementsConseillerProps) {
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
        <AgendaRows
          agenda={agendaEvenements}
          Item={({ item }) => (
            <EvenementRow
              key={item.id}
              evenement={item}
              idConseiller={idConseiller}
            />
          )}
        />
      </TBody>
    </Table>
  )
}
