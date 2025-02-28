import React from 'react'

import EmptyState from 'components/EmptyState'
import TableauSessionsImilo from 'components/pilotage/TableauSessionsImilo'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { SessionsAClore } from 'services/sessions.service'

interface OngletSessionsImiloPilotageProps {
  sessions?: SessionsAClore[]
}
export default function OngletSessionsImiloPilotage({
  sessions,
}: OngletSessionsImiloPilotageProps) {
  return (
    <>
      {Boolean(sessions && sessions.length === 0) && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Event}
            titre='Vous n’avez pas de session à clore.'
          />
        </div>
      )}

      {Boolean(sessions && sessions?.length > 0) && (
        <TableauSessionsImilo sessions={sessions!} />
      )}
    </>
  )
}
