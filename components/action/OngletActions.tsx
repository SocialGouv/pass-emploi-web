import React, { useEffect, useState } from 'react'

import TableauActionsBeneficiaire from 'components/action/TableauActionsBeneficiaire'
import EmptyState from 'components/EmptyState'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SpinningLoader from 'components/ui/SpinningLoader'
import {
  Action,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { DetailBeneficiaire, estCEJ } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { getActionsBeneficiaire } from 'services/actions.service'
import { Periode } from 'types/dates'
import { useAlerte } from 'utils/alerteContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface OngletActionsProps {
  beneficiaire: DetailBeneficiaire
  categories: SituationNonProfessionnelle[]
  shouldFocus: boolean
  onLienExterne: (label: string) => void
  semaine: Periode
  labelSemaine: string
}

export default function OngletActions({
  categories,
  shouldFocus,
  beneficiaire,
  onLienExterne,
  semaine,
  labelSemaine,
}: OngletActionsProps) {
  const [_, setAlerte] = useAlerte()
  const [conseiller] = useConseiller()
  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)

  const [actions, setActions] = useState<Action[]>()

  const [qualificationEnErreur, setQualificationEnErreur] =
    useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function qualifierActions(
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) {
    document.querySelector('header')?.scrollIntoView()

    setQualificationEnErreur(false)
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
      setQualificationEnErreur(true)
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

    setActions(
      actions!.map((affichee) =>
        updateSiQualifiee(affichee, actionsQualifiees, qualificationSNP)
      )
    )
  }

  useEffect(() => {
    setIsLoading(true)

    getActionsBeneficiaire(beneficiaire.id, semaine)
      .then(setActions)
      .finally(() => {
        setIsLoading(false)
      })
  }, [semaine])

  return (
    <>
      {isLoading && <SpinningLoader />}

      {!isLoading && actions && actions.length === 0 && !lectureSeule && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            shouldFocus={shouldFocus}
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

      {!isLoading && actions && actions.length === 0 && lectureSeule && (
        <EmptyState
          shouldFocus={shouldFocus}
          illustrationName={IllustrationName.Checklist}
          titre={`Aucune action prévue pour ${beneficiaire.prenom} ${beneficiaire.nom}.`}
        />
      )}

      {qualificationEnErreur && (
        <FailureAlert
          label='Certaines actions n’ont pas pu être qualifiées.'
          onAcknowledge={() => setQualificationEnErreur(false)}
        />
      )}

      {!isLoading && actions && actions.length > 0 && (
        <TableauActionsBeneficiaire
          jeune={beneficiaire}
          categories={categories}
          actions={actions}
          shouldFocus={shouldFocus}
          labelSemaine={labelSemaine}
          avecQualification={
            estCEJ(beneficiaire)
              ? {
                  onLienExterne,
                  onQualification: qualifierActions,
                }
              : undefined
          }
        />
      )}
    </>
  )
}

function updateSiQualifiee(
  affichee: Action,
  actionsQualifiees: Array<{ idAction: string }>,
  qualificationSNP: boolean
) {
  const actionAEteQualifiee = actionsQualifiees.some(
    ({ idAction }) => idAction === affichee.id
  )
  if (!actionAEteQualifiee) return affichee

  return {
    ...affichee,
    status: StatutAction.TermineeQualifiee,
    qualification: qualificationSNP
      ? affichee.qualification
      : {
          code: CODE_QUALIFICATION_NON_SNP,
          isSituationNonProfessionnelle: false,
          libelle: 'Action non qualifiée en Situation Non Professionnelle',
        },
  }
}
