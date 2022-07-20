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

  const stateChanged = useRef<boolean>(false)

  function changerPage(page: number) {
    if (page < 1 || page > nombrePages) return
    setPageCourante(page)
    stateChanged.current = true
  }

  function filtrerActions(statutsSelectionnes: StatutAction[]) {
    if (
      statutsSelectionnes.every((statut) => filtres.includes(statut)) &&
      filtres.every((filtre) => statutsSelectionnes.includes(filtre))
    )
      return

    setFiltres(statutsSelectionnes)
    setPageCourante(1)
    stateChanged.current = true
  }

  function trierActions() {
    setTri(
      tri === TRI.dateDecroissante ? TRI.dateCroissante : TRI.dateDecroissante
    )
    setPageCourante(1)
    stateChanged.current = true
  }

  useEffect(() => {
    if (stateChanged.current) {
      setIsLoading(true)

      getActions(pageCourante, filtres, tri).then(
        ({ actions, metadonnees }) => {
          setActionsAffichees(actions)
          setNombrePages(metadonnees.nombrePages)
          setIsLoading(false)
        }
      )
    }
  }, [tri, filtres, pageCourante])

  return (
    <>
      {poleEmploi && <IntegrationPoleEmploi label='actions et démarches' />}

      {!poleEmploi && actionsInitiales.metadonnees.nombreTotal === 0 && (
        <p className='text-md mb-2'>
          {jeune.prenom} {jeune.nom} n’a pas encore d’action
        </p>
      )}

      {!poleEmploi && actionsInitiales.metadonnees.nombreTotal > 0 && (
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
