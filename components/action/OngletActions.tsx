import React, { useEffect, useRef, useState } from 'react'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import Pagination from 'components/ui/Pagination'
import { Action, MetadonneesActions, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface OngletActionsProps {
  poleEmploi: boolean
  jeune: BaseJeune
  actionsInitiales: {
    actions: Action[]
    page: number
    metadonnees: MetadonneesActions
  }
  getActions: (
    page: number,
    statuts: StatutAction[],
    tri: string
  ) => Promise<{ actions: Action[]; metadonnees: MetadonneesActions }>
}

export enum TRI {
  dateDecroissante = 'date_decroissante',
  dateCroissante = 'date_croissante',
}

export function OngletActions({
  actionsInitiales,
  getActions,
  jeune,
  poleEmploi,
}: OngletActionsProps) {
  const [filtres, setFiltres] = useState<StatutAction[]>([])
  const [tri, setTri] = useState<TRI>(TRI.dateDecroissante)
  const [actionsAffichees, setActionsAffichees] = useState<Action[]>(
    actionsInitiales.actions
  )
  const [nombrePages, setNombrePages] = useState<number>(
    actionsInitiales.metadonnees.nombrePages
  )
  const [pageCourante, setPageCourante] = useState<number>(
    actionsInitiales.page
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const isMounted = useRef<boolean>(false)

  function changerPage(page: number) {
    if (page < 1 || page > nombrePages) return
    setPageCourante(page)
  }

  function filtrerActions(statutsSelectionnes: StatutAction[]) {
    setFiltres(statutsSelectionnes)
    setPageCourante(1)
  }

  function trierActions() {
    setTri(
      tri === TRI.dateDecroissante ? TRI.dateCroissante : TRI.dateDecroissante
    )
    setPageCourante(1)
  }

  useEffect(() => {
    if (isMounted.current) {
      console.log('plop')
      console.log(tri, filtres, pageCourante)
      console.log(getActions)
      setIsLoading(true)

      getActions(pageCourante, filtres, tri).then(
        ({ actions, metadonnees }) => {
          setActionsAffichees(actions)
          setNombrePages(metadonnees.nombrePages)
          setIsLoading(false)
        }
      )
    } else {
      isMounted.current = true
    }
  }, [tri, filtres, pageCourante, getActions])

  return (
    <>
      {poleEmploi && <IntegrationPoleEmploi label='actions et démarches' />}

      {!poleEmploi && (
        <>
          <TableauActionsJeune
            jeune={jeune}
            actions={actionsAffichees}
            isLoading={isLoading}
            onFiltres={filtrerActions}
            onTri={trierActions}
            tri={tri}
          />
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
