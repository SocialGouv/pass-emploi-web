import React from 'react'

import { AgendaRow } from 'components/rdv/AgendaRow'
import Table from 'components/ui/Table/Table'
import { EvenementListItem } from 'interfaces/evenement'

type TableauEvenementsConseillerProps = {
  evenements: EvenementListItem[]
}

export default function TableauEvenementsConseiller({
  evenements,
}: TableauEvenementsConseillerProps) {
  return (
    <Table caption={{ text: 'Liste de mes événements' }}>
      <thead className='sr-only'>
        <tr>
          <th scope='col'>Horaires et durée</th>
          <th scope='col'>Bénéficiaire et modalités</th>
          <th scope='col'>Créateur</th>
          <th scope='col'>Inscrits</th>
          <th scope='col'>Voir le détail</th>
        </tr>
      </thead>

      <tbody>
        {evenements.map((evenement) => (
          <AgendaRow key={evenement.id} evenement={evenement} />
        ))}
      </tbody>
    </Table>
  )
}
