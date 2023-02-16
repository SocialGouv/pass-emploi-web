import React, { useEffect, useRef, useState } from 'react'

import TableauActionsAQualifier from 'components/pilotage/TableauActionsAQualifier'
import Pagination from 'components/ui/Table/Pagination'
import { ActionPilotage, MetadonneesActions } from 'interfaces/action'

interface OngletActionsPilotageProps {
  actionsInitiales: {
    actions: Array<ActionPilotage>
    page: number
    metadonnees: MetadonneesActions
  }
  getActions: (page: number) => Promise<{
    actions: Array<ActionPilotage>
    metadonnees: MetadonneesActions
  }>
}

export function OngletActionsPilotage({
  actionsInitiales,
  getActions,
}: OngletActionsPilotageProps) {
  const [actionsAffichees, setActionsAffichees] = useState<
    Array<ActionPilotage>
  >(actionsInitiales.actions)

  const [nombrePages, setNombrePages] = useState<number>(
    actionsInitiales.metadonnees.nombrePages
  )
  const [pageCourante, setPageCourante] = useState<number>(
    actionsInitiales.page
  )

  const pageChangee = useRef<boolean>(false)

  function changerPage(page: number) {
    if (page < 1 || page > nombrePages) return
    setPageCourante(page)
    pageChangee.current = true
  }

  useEffect(() => {
    if (pageChangee.current) {
      getActions(pageCourante).then(({ actions, metadonnees }) => {
        setActionsAffichees(actions)
        setNombrePages(metadonnees.nombrePages)
      })
    }
  }, [pageCourante])

  return (
    <>
      {actionsInitiales.metadonnees.nombreTotal === 0 && (
        <p className='text-base-bold mb-2'>
          Vous n’avez pas d’action à qualifier.
        </p>
      )}

      {actionsInitiales.metadonnees.nombreTotal > 0 && (
        <>
          <TableauActionsAQualifier actions={actionsAffichees} />
          {nombrePages > 1 && (
            <div className='mt-6'>
              <Pagination
                nomListe='actions'
                nombreDePages={nombrePages}
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
