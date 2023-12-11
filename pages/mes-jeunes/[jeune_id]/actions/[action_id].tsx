import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { HistoriqueAction } from 'components/action/HistoriqueAction'
import StatutActionForm from 'components/action/StatutActionForm'
import TagQualificationAction from 'components/action/TagQualificationAction'
import PageActionsPortal from 'components/PageActionsPortal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import {
  Action,
  Commentaire,
  QualificationAction,
  StatutAction,
} from 'interfaces/action'
import { estMilo, estUserPoleEmploi, UserType } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toShortDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface PageActionProps extends PageProps {
  action: Action
  jeune: BaseJeune
  lectureSeule: boolean
  commentaires: Commentaire[]
  pageTitle: string
}

function PageAction({
  action,
  jeune,
  commentaires,
  lectureSeule,
}: PageActionProps) {
  const router = useRouter()
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [alerte, setAlerte] = useAlerte()

  const [qualification, setQualification] = useState<
    QualificationAction | undefined
  >(action.qualification)
  const [statut, setStatut] = useState<StatutAction>(action.status)
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)

  const pageTracking = `Détail Action${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  const conseillerEstMilo = estMilo(conseiller)

  const estARealiser = statut === StatutAction.EnCours
  const estAQualifier = conseillerEstMilo && statut === StatutAction.Terminee
  const afficherSuppressionAction =
    action.creatorType === UserType.CONSEILLER.toLowerCase() &&
    action.status !== StatutAction.Terminee &&
    commentaires.length === 0

  const dateEcheance = toShortDate(action.dateEcheance)

  async function updateStatutAction(statutChoisi: StatutAction): Promise<void> {
    const { updateAction } = await import('services/actions.service')
    const nouveauStatut = await updateAction(action.id, statutChoisi)
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
      const { qualifier } = await import('services/actions.service')
      const nouvelleQualification = await qualifier(
        action.id,
        CODE_QUALIFICATION_NON_SNP,
        {
          dateDebutModifiee: DateTime.fromISO(action.dateEcheance),
          dateFinModifiee: DateTime.fromISO(action.dateEcheance),
        }
      )
      setQualification(nouvelleQualification)
      setAlerte(AlerteParam.qualificationNonSNP)
      setStatut(StatutAction.Qualifiee)
    }
  }

  async function deleteAction(): Promise<void> {
    setDeleteDisabled(true)
    const { deleteAction: _deleteAction } = await import(
      'services/actions.service'
    )
    _deleteAction(action.id)
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
      : pageTracking,
    aDesBeneficiaires
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
                name={IconName.Delete}
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

      {lectureSeule && (
        <div className='mb-6'>
          <InformationMessage label='Vous êtes en lecture seule'>
            Vous pouvez uniquement lire le détail de l’action de ce bénéficiaire
            car il ne fait pas partie de votre portefeuille.
          </InformationMessage>
        </div>
      )}

      {action.qualification && (
        <>
          {action.qualification.isSituationNonProfessionnelle && (
            <div className='mb-6'>
              <InformationMessage
                label={`Action qualifiée en Situation non-professionnelle : ${action.qualification.libelle}`}
              >
                Vous pouvez modifier cette action dans i-milo. <br /> Délai
                d’actualisation entre l’app CEJ et i-milo : 24h.
              </InformationMessage>
            </div>
          )}

          {!action.qualification.isSituationNonProfessionnelle && (
            <div className='mb-6'>
              <InformationMessage label='Action non qualifiée en Situation non-professionnelle : '>
                C’est enregistré ! Vous pouvez poursuivre votre travail.
              </InformationMessage>
            </div>
          )}
        </>
      )}

      {conseillerEstMilo && !action.qualification && (
        <TagQualificationAction statut={statut} qualification={qualification} />
      )}

      {estARealiser && (
        <div className='flex p-2 text-accent_2 bg-accent_3_lighten rounded-l mb-8'>
          <IconComponent
            name={IconName.Schedule}
            aria-hidden='true'
            focusable='false'
            className='h-5 w-5 mr-1 fill-accent_2'
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
        lectureSeule={lectureSeule}
      />

      <div className='border-b-2 border-primary_lighten mt-8'>
        <div className='flex justify-between mb-2'>
          <h2 className='text-m-bold text-grey_800 mb-5'>
            Informations sur l’action
          </h2>
        </div>

        <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
          <dt className='text-base-bold pb-6'>
            <span>Catégorie :</span>
          </dt>
          <dd className='text-base-regular pl-6'></dd>
          <dt className='text-base-bold pb-6'>
            <span>Titre de l’action :</span>
          </dt>
          <dd className='text-base-regular pl-6'>{action.content}</dd>
          <dt className='text-base-bold pb-6'>
            <span>Description :</span>
          </dt>
          <dd className='text-base-regular pl-6'>{action.comment}</dd>
          <dt className='text-base-bold pb-6'>
            <span>Date de l’action :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {DateTime.fromISO(action.dateEcheance).toFormat('dd/MM/yyyy')}
          </dd>
        </dl>
      </div>

      <HistoriqueAction action={action} />

      {Boolean(commentaires.length) && (
        <CommentairesAction
          idAction={action.id}
          commentairesInitiaux={commentaires}
          onAjout={onAjoutCommentaire}
          lectureSeule={lectureSeule}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PageActionProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (estUserPoleEmploi(user)) {
    return { notFound: true }
  }
  const { jeune_id, action_id } = context.query

  const { getAction, recupererLesCommentaires } = await import(
    'services/actions.service'
  )
  const actionEtJeune = await getAction(action_id as string, accessToken)

  if (!actionEtJeune) return { notFound: true }
  if (jeune_id !== actionEtJeune.jeune.id) return { notFound: true }

  const commentaires = await recupererLesCommentaires(
    action_id as string,
    accessToken
  )
  if (!commentaires) return { notFound: true }

  const { action, jeune } = actionEtJeune

  const lectureSeule = jeune.idConseiller !== user.id

  const props: PageActionProps = {
    action,
    jeune,
    commentaires,
    lectureSeule,
    pageTitle: `${
      lectureSeule ? 'Etablissement' : 'Portefeuille'
    } - Actions de ${jeune.prenom} ${jeune.nom} - ${action.content}`,
    pageHeader: 'Détails de l’action',
  }

  return { props }
}

export default withTransaction(PageAction.name, 'page')(PageAction)
