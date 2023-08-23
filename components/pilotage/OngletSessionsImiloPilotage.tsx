import React from 'react'

import EmptyStateImage from 'assets/images/illustration-event-grey.svg'
import TableauSessionsImilo from 'components/pilotage/TableauSessionsImilo'
import { SessionsAClore } from 'services/sessions.service'

interface OngletSessionsImiloPilotageProps {
  sessions?: SessionsAClore[]
}
export default function OngletSessionsImiloPilotage({
  sessions,
}: OngletSessionsImiloPilotageProps) {
  return (
    <>
      {Boolean(sessions?.length === 0) && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable={false}
            aria-hidden={true}
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Vous n’avez pas de session à clore.
          </p>
        </div>
      )}

      {Boolean(sessions?.length > 0) && (
        <TableauSessionsImilo sessions={sessions!} />
      )}
    </>
  )
}
