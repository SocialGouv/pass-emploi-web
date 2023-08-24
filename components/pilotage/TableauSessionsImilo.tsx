import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { SessionsAClore } from 'services/sessions.service'

interface TableauSessionsImiloProps {
  sessions: SessionsAClore[]
}

export default function TableauSessionsImilo({
  sessions,
}: TableauSessionsImiloProps) {
  return (
    <>
      <Table
        asDiv={true}
        caption={{ text: 'Liste des sessions i-milo à clore' }}
      >
        <THead>
          <TR isHeader={true}>
            <TH>Date</TH>
            <TH>Titre de la session</TH>
          </TR>
        </THead>

        <TBody>
          {sessions.map((session: SessionsAClore) => (
            <TR
              key={session.id}
              href={`/agenda/sessions/${session.id}`}
              label={`Accéder au détail de la session : ${session.titre}`}
            >
              <TD>{session.date}</TD>
              <TD>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-base-bold'>{session.titre}</p>
                    {session.sousTitre && <p>{session.sousTitre}</p>}
                  </div>
                  <span className='flex flex-row justify-end'>
                    <IconComponent
                      name={IconName.ChevronRight}
                      focusable={false}
                      aria-hidden={true}
                      className='w-6 h-6 fill-primary'
                    />
                  </span>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </>
  )
}
