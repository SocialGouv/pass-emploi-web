import React from 'react'

import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { SessionsAClore } from 'services/sessions.service'

interface TableauSessionsImiloProps {
  sessions: SessionsAClore[]
}

export default function TableauSessionsImilo({
  sessions,
}: TableauSessionsImiloProps) {
  return (
    <>
      <Table caption={{ text: 'Liste des sessions i-milo à clore' }}>
        <thead>
          <TR isHeader={true}>
            <TH>Date</TH>
            <TH>Titre de la session</TH>
            <TH>Voir le détail</TH>
          </TR>
        </thead>

        <tbody>
          {sessions.map((session: SessionsAClore) => (
            <TR key={session.id}>
              <TD>{session.date}</TD>
              <TD>
                <div>
                  <p className='text-base-bold'>{session.titre}</p>
                  {session.sousTitre && <p>{session.sousTitre}</p>}
                </div>
              </TD>
              <TDLink
                href={`/agenda/sessions/${session.id}`}
                labelPrefix='Accéder au détail de la session du'
              />
            </TR>
          ))}
        </tbody>
      </Table>
    </>
  )
}
