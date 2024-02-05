import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { HistoriqueAction } from 'components/action/HistoriqueAction'
import StatutActionForm from 'components/action/StatutActionForm'
import PageActionsPortal from 'components/PageActionsPortal'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Action, Commentaire, StatutAction } from 'interfaces/action'
import { estMilo, estUserPoleEmploi } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toLongMonthDate } from 'utils/date'
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

  const [statut, setStatut] = useState<StatutAction>(action.status)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)

  const pageTracking = `Détail Action${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  const conseillerEstMilo = estMilo(conseiller)
  const estAQualifier = conseillerEstMilo && statut === StatutAction.Terminee
  const qualifiee = conseillerEstMilo && statut === StatutAction.Qualifiee

  async function updateStatutAction(statutChoisi: StatutAction): Promise<void> {
    const { modifierAction } = await import('services/actions.service')
    await modifierAction(action.id, { statut: statutChoisi })
    setStatut(statutChoisi)

    if (statutChoisi === StatutAction.Terminee)
      action.dateFinReelle = DateTime.now().toISODate()
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
          {estAQualifier && !lectureSeule && (
            <ButtonLink
              style={ButtonStyle.PRIMARY}
              href={`/mes-jeunes/${jeune.id}/actions/${action.id}/qualification`}
            >
              Qualifier l’action
              <IconComponent
                name={IconName.Send}
                aria-hidden={true}
                focusable={false}
                className='w-4 h-4 ml-2'
              />
            </ButtonLink>
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

      {qualifiee && (
        <>
          {action.qualification!.isSituationNonProfessionnelle && (
            <div className='mb-6'>
              <InformationMessage label={`Action qualifiée.`}>
                Vous pouvez modifier cette action dans i-milo. <br /> Délai
                d’actualisation entre l’app CEJ et i-milo : 24h.
              </InformationMessage>
            </div>
          )}

          {!action.qualification!.isSituationNonProfessionnelle && (
            <div className='mb-6'>
              <InformationMessage label='Action qualifiée en non SNP.'>
                Vous ne pouvez plus modifier cette action.
              </InformationMessage>
            </div>
          )}
        </>
      )}

      <StatutActionForm
        updateStatutAction={updateStatutAction}
        statutCourant={statut}
        lectureSeule={lectureSeule}
      />

      <div className='border-b-2 border-primary_lighten mt-8'>
        <div className='flex justify-between mb-2'>
          <h2 className='text-m-bold text-grey_800 mb-5'>
            Informations sur l’action
          </h2>
          {!qualifiee && (
            <ButtonLink
              href={`/mes-jeunes/${jeune.id}/actions/${action.id}/modification`}
              style={ButtonStyle.SECONDARY}
            >
              <IconComponent
                name={IconName.Edit}
                aria-hidden={true}
                focusable={false}
                className='w-4 h-4 mr-2'
              />
              Modifier l’action
            </ButtonLink>
          )}
        </div>

        <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
          <dt className='text-base-bold pb-6'>
            <span>Catégorie :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {action.qualification?.libelle ?? <TagCategorieAction />}
          </dd>
          <dt className='text-base-bold pb-6'>
            <span>Titre de l’action :</span>
          </dt>
          <dd className='text-base-regular pl-6'>{action.content}</dd>
          <dt className='text-base-bold pb-6'>
            <span>Description :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {action.comment ? (
              action.comment
            ) : (
              <>
                --
                <span className='sr-only'>information non disponible</span>
              </>
            )}
          </dd>
          <dt className='text-base-bold pb-6'>
            <span>Date de l’action :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {toLongMonthDate(action.dateEcheance)}
          </dd>
          {(statut === StatutAction.Terminee ||
            statut === StatutAction.Qualifiee) && (
            <>
              <dt className='text-base-bold pb-6'>
                <span>Date de réalisation :</span>
              </dt>
              <dd className='text-base-regular pl-6'>
                {toLongMonthDate(action.dateFinReelle!)}
              </dd>
            </>
          )}
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
