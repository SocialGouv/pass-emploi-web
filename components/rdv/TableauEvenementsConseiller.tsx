import React from 'react'

import { AgendaData, AgendaRows } from 'components/rdv/AgendaRows'
import { EvenementRow } from 'components/rdv/EvenementRow'
import Table from 'components/ui/Table/Table'
import { TH } from 'components/ui/Table/TH'
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
    <Table caption={{ text: 'Liste de mes événements' }}>
      <thead>
        <TR isHeader={true}>
          <TH>Horaires</TH>
          <TH>Bénéficiaire</TH>
          <TH>Type</TH>
          <TH>Modalité</TH>
          <TH>Créé par vous</TH>
          <TH>Voir le détail</TH>
        </TR>
      </thead>

      <tbody>
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
      </tbody>
    </Table>
  )
}
