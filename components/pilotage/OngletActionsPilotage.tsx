import React, { useEffect, useRef, useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-event-grey.svg'
import TableauActionsAQualifier from 'components/pilotage/TableauActionsAQualifier'
import Pagination from 'components/ui/Table/Pagination'
import { ActionPilotage } from 'interfaces/action'
import { MetadonneesPagination } from 'types/pagination'

interface OngletActionsPilotageProps {
  actionsInitiales: ActionPilotage[]
  metadonneesInitiales: MetadonneesPagination
  getActions: (page: number) => Promise<{
    actions: ActionPilotage[]
    metadonnees: MetadonneesPagination
  }>
}

export default function OngletActionsPilotage({
  actionsInitiales,
  metadonneesInitiales,
  getActions,
}: OngletActionsPilotageProps) {
  const [actions, setActions] = useState<ActionPilotage[]>(actionsInitiales)
  const [metadonnees, setMetadonnees] =
    useState<MetadonneesPagination>(metadonneesInitiales)

  const [pageCourante, setPageCourante] = useState<number>(1)

  const pageChangee = useRef<boolean>(false)

  function changerPage(page: number) {
    if (page < 1 || page > metadonnees.nombrePages) return
    setPageCourante(page)
    pageChangee.current = true
  }

  useEffect(() => {
    if (pageChangee.current) {
      getActions(pageCourante).then((update) => {
        setActions(update.actions)
        setMetadonnees(update.metadonnees)
        setPageCourante(Math.min(pageCourante, update.metadonnees.nombrePages))
      })
    }
  }, [pageCourante])

  return (
    <>
      {metadonnees.nombreTotal === 0 && (
        <div className='bg-grey_100 flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Vous n’avez pas d’action à qualifier.
          </p>
        </div>
      )}

      {metadonnees.nombreTotal > 0 && (
        <>
          <TableauActionsAQualifier actions={actions} />
          {metadonnees.nombrePages > 1 && (
            <div className='mt-6'>
              <Pagination
                nomListe='actions'
                nombreDePages={metadonnees.nombrePages}
                pageCourante={pageCourante}
                allerALaPage={changerPage}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}
