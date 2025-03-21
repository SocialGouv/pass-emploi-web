import React, { useEffect, useRef, useState } from 'react'

import TableauActionsBeneficiaire from 'components/action/TableauActionsBeneficiaire'
import EmptyState from 'components/EmptyState'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import Pagination from 'components/ui/Table/Pagination'
import {
  Action,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { DetailBeneficiaire, estCEJ } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { MetadonneesPagination } from 'types/pagination'
import { useAlerte } from 'utils/alerteContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface OngletActionsProps {
  beneficiaire: DetailBeneficiaire
  categories: SituationNonProfessionnelle[]
  actionsInitiales: {
    actions: Action[]
    page: number
    metadonnees: MetadonneesPagination
  }
  getActions: (
    page: number,
    filtres: { statuts: StatutAction[]; categories: string[] },
    tri: string
  ) => Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }>
  onLienExterne: (label: string) => void
}

export enum TRI {
  dateEcheanceDecroissante = 'date_echeance_decroissante',
  dateEcheanceCroissante = 'date_echeance_croissante',
}

export default function OngletActions({
  categories,
  actionsInitiales,
  getActions,
  beneficiaire,
  onLienExterne,
}: OngletActionsProps) {
  const [_, setAlerte] = useAlerte()
  const [conseiller] = useConseiller()
  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)

  const [actionsAffichees, setActionsAffichees] = useState<Action[]>(
    actionsInitiales.actions
  )
  const [tri, setTri] = useState<TRI>(TRI.dateEcheanceDecroissante)
  const [filtresParStatuts, setFiltresParStatuts] = useState<StatutAction[]>([])
  const [filtresParCategories, setFiltresParCategories] = useState<string[]>([])

  const [nombrePages, setNombrePages] = useState<number>(
    actionsInitiales.metadonnees.nombrePages
  )
  const [pageCourante, setPageCourante] = useState<number>(
    actionsInitiales.page
  )

  const [actionsEnErreur, setActionsEnErreur] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const stateChanged = useRef<boolean>(false)

  function changerPage(page: number) {
    if (page < 1 || page > nombrePages) return
    setPageCourante(page)
    stateChanged.current = true
  }

  function filtrerActions(filtres: Record<'categories' | 'statuts', string[]>) {
    setFiltresParStatuts((filtres['statuts'] as StatutAction[]) ?? [])
    setFiltresParCategories(filtres['categories'] ?? [])
    setPageCourante(1)
    stateChanged.current = true
  }

  function trierActions(nouveauTri: TRI) {
    setTri(nouveauTri)
    setPageCourante(1)
    stateChanged.current = true
  }

  async function qualifierActions(
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) {
    document.querySelector('header')?.scrollIntoView()

    setActionsEnErreur(false)
    const { qualifierActions: _qualifierActions } = await import(
      'services/actions.service'
    )

    let actionsPayload = [...actionsSelectionnees]
    if (!qualificationSNP) {
      actionsPayload = actionsPayload.map((a) => ({
        ...a,
        codeQualification: CODE_QUALIFICATION_NON_SNP,
      }))
    }
    const { idsActionsEnErreur } = await _qualifierActions(
      actionsPayload,
      qualificationSNP
    )

    let actionsQualifiees = actionsSelectionnees
    if (idsActionsEnErreur.length) {
      setActionsEnErreur(true)
      actionsQualifiees = actionsSelectionnees.filter(
        (action) => !idsActionsEnErreur.some((id) => id === action.idAction)
      )
    } else {
      setAlerte(
        qualificationSNP
          ? AlerteParam.multiQualificationSNP
          : AlerteParam.multiQualificationNonSNP
      )
    }

    if (filtresParStatuts.length) {
      setActionsAffichees(
        actionsAffichees.filter(
          (action) => !actionsQualifiees.some((a) => a.idAction === action.id)
        )
      )
    } else {
      setActionsAffichees(
        actionsAffichees.map((affichee) => {
          if (
            !actionsQualifiees.some(({ idAction }) => idAction === affichee.id)
          )
            return affichee
          return {
            ...affichee,
            status: StatutAction.TermineeQualifiee,
            qualification: qualificationSNP
              ? affichee.qualification
              : {
                  code: CODE_QUALIFICATION_NON_SNP,
                  isSituationNonProfessionnelle: false,
                  libelle:
                    'Action non qualifiée en Situation Non Professionnelle',
                },
          }
        })
      )
    }
  }

  useEffect(() => {
    if (stateChanged.current) {
      setIsLoading(true)

      getActions(
        pageCourante,
        { statuts: filtresParStatuts, categories: filtresParCategories },
        tri
      ).then(({ actions, metadonnees }) => {
        setActionsAffichees(actions)
        setNombrePages(metadonnees.nombrePages)
        setIsLoading(false)
      })
    }
  }, [tri, filtresParStatuts, filtresParCategories, pageCourante])

  return (
    <>
      {actionsInitiales.metadonnees.nombreTotal === 0 && !lectureSeule && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre={`Aucune action prévue pour ${beneficiaire.prenom} ${beneficiaire.nom}.`}
            lien={{
              href: `/mes-jeunes/${beneficiaire.id}/actions/nouvelle-action`,
              label: 'Créer une action',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {actionsInitiales.metadonnees.nombreTotal === 0 && lectureSeule && (
        <EmptyState
          illustrationName={IllustrationName.Checklist}
          titre={`Aucune action prévue pour ${beneficiaire.prenom} ${beneficiaire.nom}.`}
        />
      )}

      {actionsEnErreur && (
        <FailureAlert
          label='Certaines actions n’ont pas pu être qualifiées.'
          onAcknowledge={() => setActionsEnErreur(false)}
        />
      )}

      {actionsInitiales.metadonnees.nombreTotal > 0 && (
        <>
          <TableauActionsBeneficiaire
            jeune={beneficiaire}
            categories={categories}
            actionsFiltrees={actionsAffichees}
            isLoading={isLoading}
            onFiltres={filtrerActions}
            avecQualification={
              estCEJ(beneficiaire)
                ? {
                    onLienExterne,
                    onQualification: qualifierActions,
                  }
                : undefined
            }
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
