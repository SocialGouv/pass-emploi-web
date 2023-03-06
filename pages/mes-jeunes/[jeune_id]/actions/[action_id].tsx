import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { HistoriqueAction } from 'components/action/HistoriqueAction'
import StatutActionForm from 'components/action/StatutActionForm'
import TagQualificationAction from 'components/action/TagQualificationAction'
import PageActionsPortal from 'components/PageActionsPortal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  Action,
  Commentaire,
  QualificationAction,
  StatutAction,
} from 'interfaces/action'
import { estMilo, StructureConseiller, UserType } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { ActionsService } from 'services/actions.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toShortDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface PageActionProps extends PageProps {
  action: Action
  jeune: BaseJeune
  commentaires: Commentaire[]
  pageTitle: string
}

function PageAction({ action, jeune, commentaires }: PageActionProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const router = useRouter()
  const [conseiller] = useConseiller()
  const [alerte, setAlerte] = useAlerte()

  const [qualification, setQualification] = useState<
    QualificationAction | undefined
  >(action.qualification)
  const [statut, setStatut] = useState<StatutAction>(action.status)
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)

  const pageTracking = 'Détail Action'

  const conseillerEstMilo = estMilo(conseiller)

  const estARealiser: boolean = useMemo(
    () => statut !== StatutAction.Terminee && statut !== StatutAction.Annulee,
    [statut]
  )
  const estAQualifier: boolean = useMemo(
    () =>
      conseillerEstMilo && statut === StatutAction.Terminee && !qualification,
    [qualification, statut]
  )
  const afficherSuppressionAction = useMemo(
    () =>
      action.creatorType === UserType.CONSEILLER.toLowerCase() &&
      !Boolean(action.qualification) &&
      commentaires.length === 0 &&
      statut !== StatutAction.Terminee,
    [action.creatorType, action.qualification, commentaires.length, statut]
  )
  const dateEcheance: string = useMemo(
    () => toShortDate(action.dateEcheance),
    [action.dateEcheance]
  )

  async function updateStatutAction(statutChoisi: StatutAction): Promise<void> {
    const nouveauStatut = await actionsService.updateAction(
      action.id,
      statutChoisi
    )
    setStatut(nouveauStatut)
  }

  async function qualifierAction(
    isSituationNonProfessionnelle: boolean
  ): Promise<void> {
    if (isSituationNonProfessionnelle) {
      await router.push(
        `/mes-jeunes/${jeune.id}/actions/${action.id}/qualification`
      )
    } else {
      const nouvelleQualification = await actionsService.qualifier(
        action.id,
        CODE_QUALIFICATION_NON_SNP,
        {
          dateDebutModifiee: DateTime.fromISO(action.dateEcheance),
          dateFinModifiee: DateTime.fromISO(action.dateEcheance),
        }
      )
      setQualification(nouvelleQualification)
      setAlerte(AlerteParam.qualificationNonSNP)
    }
  }

  async function deleteAction(): Promise<void> {
    setDeleteDisabled(true)
    actionsService
      .deleteAction(action.id)
      .then(() => {
        setAlerte(AlerteParam.suppressionAction)
        router.push({
          pathname: '/mes-jeunes/' + jeune.id,
          query: { onglet: 'actions' },
        })
      })
      .catch((error: Error) => {
        setShowEchecMessage(true)
        console.log('Erreur lors de la suppression de l action', error)
      })
      .finally(() => {
        setDeleteDisabled(false)
      })
  }

  function onAjoutCommentaire(estEnSucces: boolean) {
    if (!estEnSucces) {
      setShowEchecMessage(true)
    } else {
      setAlerte(AlerteParam.ajoutCommentaireAction)
      router.push(`/mes-jeunes/${jeune.id}/actions/${action.id}`)
    }
  }

  useMatomo(
    alerte && alerte.key === AlerteParam.envoiMessage
      ? `${pageTracking} - Succès envoi message`
      : pageTracking
  )

  return (
    <>
      <PageActionsPortal>
        <>
          {afficherSuppressionAction && (
            <Button
              label="Supprimer l'action"
              onClick={() => deleteAction()}
              style={ButtonStyle.SECONDARY}
              disabled={deleteDisabled}
            >
              <IconComponent
                name={IconName.Trashcan}
                aria-hidden={true}
                focusable={false}
                className='w-4 h-4 mr-2'
              />
              Supprimer
            </Button>
          )}
        </>
      </PageActionsPortal>

      {showEchecMessage && (
        <FailureAlert
          label="Une erreur s'est produite, veuillez réessayer ultérieurement"
          onAcknowledge={() => setShowEchecMessage(false)}
        />
      )}

      {conseillerEstMilo && (
        <TagQualificationAction statut={statut} qualification={qualification} />
      )}

      <h2
        className='text-m-bold text-grey_800 mb-5'
        title='Intitulé de l’action'
      >
        {action.content}
      </h2>

      {action.comment && <p className='mb-8'>{action.comment}</p>}

      {estARealiser && (
        <div className='flex p-2 text-accent_2 bg-accent_3_lighten rounded-l mb-8'>
          <IconComponent
            name={IconName.Clock}
            aria-hidden='true'
            focusable='false'
            className='h-5 w-5 mr-1 stroke-accent_2'
          />
          <span>
            À réaliser pour le : <b>{dateEcheance}</b>
          </span>
        </div>
      )}

      <StatutActionForm
        updateStatutAction={updateStatutAction}
        qualifierAction={(isSituationNonProfessionnelle) =>
          qualifierAction(isSituationNonProfessionnelle)
        }
        statutCourant={statut}
        estAQualifier={estAQualifier}
      />
      <HistoriqueAction action={action} />
      <CommentairesAction
        idAction={action.id}
        commentairesInitiaux={commentaires}
        onAjout={onAjoutCommentaire}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PageActionProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }
  const { jeune_id, action_id } = context.query

  const actionsService = withDependance<ActionsService>('actionsService')
  const actionEtJeune = await actionsService.getAction(
    action_id as string,
    accessToken
  )
  if (!actionEtJeune) return { notFound: true }
  if (jeune_id !== actionEtJeune.jeune.id) return { notFound: true }

  const commentaires = await actionsService.recupererLesCommentaires(
    action_id as string,
    accessToken
  )
  if (!commentaires) return { notFound: true }

  const { action, jeune } = actionEtJeune
  const props: PageActionProps = {
    action,
    jeune,
    commentaires,
    pageTitle: `Portefeuille - Actions de ${jeune.prenom} ${jeune.nom} - ${action.content}`,
    pageHeader: 'Détails de l’action',
  }

  return { props }
}

export default withTransaction(PageAction.name, 'page')(PageAction)
