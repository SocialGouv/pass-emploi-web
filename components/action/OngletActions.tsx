import React, { useEffect, useRef, useState } from 'react'

import TableauActionsJeune from 'components/action/TableauActionsJeune'
import EmptyState from 'components/EmptyState'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import { Action, StatutAction } from 'interfaces/action'
import { Conseiller, estPoleEmploi } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { MetadonneesPagination } from 'types/pagination'

interface OngletActionsProps {
  conseiller: Conseiller
  jeune: BaseJeune

  actionsInitiales: {
    actions: Action[]
    page: number
    metadonnees: MetadonneesPagination
  }
  getActions: (
    page: number,
    statuts: StatutAction[],
    tri: string
  ) => Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }>
  lectureSeule?: boolean
}

export enum TRI {
  dateDecroissante = 'date_decroissante',
  dateCroissante = 'date_croissante',
  dateEcheanceDecroissante = 'date_echeance_decroissante',
  dateEcheanceCroissante = 'date_echeance_croissante',
}

export default function OngletActions({
  actionsInitiales,
  getActions,
  jeune,
  conseiller,
  lectureSeule,
}: OngletActionsProps) {
  const [actionsAffichees, setActionsAffichees] = useState<Action[]>(
    actionsInitiales.actions
  )
  const [tri, setTri] = useState<TRI>(TRI.dateEcheanceDecroissante)
  const [filtresParStatuts, setFiltresParStatuts] = useState<StatutAction[]>([])

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

  function filtrerActions(statuts: StatutAction[]) {
    if (
      statuts.every((statut) => filtresParStatuts.includes(statut)) &&
      filtresParStatuts.every((filtre) => statuts.includes(filtre))
    )
      return

    setFiltresParStatuts(statuts)
    setPageCourante(1)
    stateChanged.current = true
  }

  function trierActions(nouveauTri: TRI) {
    setTri(nouveauTri)
    setPageCourante(1)
    stateChanged.current = true
  }

  useEffect(() => {
    if (stateChanged.current) {
      setIsLoading(true)

      getActions(pageCourante, filtresParStatuts, tri).then(
        ({ actions, metadonnees }) => {
          setActionsAffichees(actions)
          setNombrePages(metadonnees.nombrePages)
          setIsLoading(false)
        }
      )
    }
  }, [tri, filtresParStatuts, pageCourante])

  return (
    <>
      {estPoleEmploi(conseiller) && (
        <IntegrationPoleEmploi label='actions et démarches' />
      )}

      {!estPoleEmploi(conseiller) && (
        <>
          {actionsInitiales.metadonnees.nombreTotal === 0 && (
            <div className='flex flex-col justify-center items-center'>
              <EmptyState
                illustrationName={IllustrationName.Checklist}
                titre={`Aucune action prévue pour ${jeune.prenom} ${jeune.nom}.`}
                lien={
                  !lectureSeule
                    ? {
                        href: `/mes-jeunes/${jeune.id}/actions/nouvelle-action`,
                        label: 'Créer une action',
                        iconName: IconName.Add,
                      }
                    : undefined
                }
              />
            </div>
          )}

          {actionsInitiales.metadonnees.nombreTotal > 0 && (
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
      )}
    </>
  )
}
