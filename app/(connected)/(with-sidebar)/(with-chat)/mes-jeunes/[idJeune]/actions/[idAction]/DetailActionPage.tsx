'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'

import CommentaireAction from 'components/action/CommentaireAction'
import HistoriqueAction from 'components/action/HistoriqueAction'
import StatutActionForm from 'components/action/StatutActionForm'
import Modal, { ModalHandles } from 'components/Modal'
import PageActionsPortal from 'components/PageActionsPortal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import {
  Action,
  estSupprimable,
  estTermine,
  StatutAction,
} from 'interfaces/action'
import { estCEJ } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toLongMonthDate } from 'utils/date'
import { unsafeRandomId } from 'utils/helpers'
import { usePortefeuille } from 'utils/portefeuilleContext'

export type DetailActionProps = {
  action: Action
  from: 'pilotage' | 'beneficiaire'
}

function DetailActionPage({ action, from }: DetailActionProps) {
  const [conseiller] = useConseiller()
  const { beneficiaire } = action
  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)

  const router = useRouter()
  const [portefeuille] = usePortefeuille()
  const [alerte, _] = useAlerte()

  const [statutAJour, setStatutAJour] = useState<StatutAction>(action.status)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)
  const [showSuppression, setShowSuppression] = useState<boolean>(false)

  const initialTracking = `Détail Action${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const estAQualifier = statutAJour === StatutAction.TermineeAQualifier
  const qualifiee = statutAJour === StatutAction.TermineeQualifiee

  const suppressionModalRef = useRef<ModalHandles>(null)

  async function updateStatutAction(statutChoisi: StatutAction): Promise<void> {
    const { modifierAction } = await import('services/actions.service')
    await modifierAction(action.id, { statut: statutChoisi })
    setStatutAJour(statutChoisi)

    if (estTermine(statutChoisi))
      action.dateFinReelle = DateTime.now().toISODate()
  }

  async function supprimerAction(): Promise<void> {
    const { deleteAction } = await import('services/actions.service')
    try {
      await deleteAction(action.id)
      setTrackingTitle(`${initialTracking} - Suppression action`)
      router.push('/mes-jeunes/' + beneficiaire.id)
    } catch (error) {
      setShowEchecMessage(true)
      console.log('Erreur lors de la suppression de l action', error)
    }
  }

  // FIXME : dirty fix, problème de l’action
  const random = unsafeRandomId()

  useMatomo(
    alerte && alerte.key === AlerteParam.envoiMessage
      ? `${trackingTitle} - Succès envoi message`
      : trackingTitle,
    portefeuille.length > 0
  )
  return (
    <>
      <PageActionsPortal>
        <>
          {estAQualifier && !lectureSeule && (
            <ButtonLink
              style={ButtonStyle.PRIMARY}
              href={`/mes-jeunes/${beneficiaire.id}/actions/${action.id}/qualification?liste=${from}&misc=${random}`}
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

          {estSupprimable(action) && !lectureSeule && (
            <Button
              label="Supprimer l'action"
              onClick={() => setShowSuppression(true)}
              style={ButtonStyle.WARNING}
            >
              <IconComponent
                name={IconName.Delete}
                aria-hidden={true}
                focusable={false}
                className='w-4 h-4 mr-2'
              />
              Supprimer l’action
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
        statutCourant={statutAJour}
        lectureSeule={lectureSeule}
        avecQualification={estCEJ(beneficiaire)}
      />

      <div className='border-b-2 border-primary-lighten mt-8'>
        <div className='flex justify-between mb-2'>
          <h2 className='text-m-bold text-grey-800 mb-5'>
            Informations sur l’action
          </h2>
          {!qualifiee && (
            <ButtonLink
              href={`/mes-jeunes/${beneficiaire.id}/actions/${action.id}/modification?misc=${random}`}
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

        <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,auto)]'>
          <dt className='text-base-bold pb-6'>
            <span>Catégorie :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {action.qualification?.libelle ?? (
              <>
                <span aria-hidden={true}>--</span>
                <span className='sr-only'>information non disponible</span>
              </>
            )}
          </dd>
          <dt className='text-base-bold pb-6'>
            <span>Titre de l’action :</span>
          </dt>
          <dd className='text-base-regular pl-6'>{action.titre}</dd>
          <dt className='text-base-bold pb-6'>
            <span>Description :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {action.comment ? (
              action.comment
            ) : (
              <>
                <span aria-hidden={true}>--</span>
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

          {estTermine(statutAJour) && (
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

      <CommentaireAction action={action} initiallyOpened={!action.comment} />

      <HistoriqueAction action={action} />

      {showSuppression && (
        <Modal
          ref={suppressionModalRef}
          title='Supprimer l’action ?'
          titleIllustration={IllustrationName.Delete}
          onClose={() => setShowSuppression(false)}
        >
          <p>
            Votre choix est définitif. Vous ne pourrez plus la consulter ni la
            modifier.
          </p>
          <div className='mt-10 flex justify-center gap-4'>
            <Button
              onClick={(e) => suppressionModalRef.current!.closeModal(e)}
              style={ButtonStyle.SECONDARY}
              label={`Annuler la suppression de l’action ${action.titre}`}
            >
              Annuler
            </Button>
            <Button
              onClick={() => supprimerAction()}
              style={ButtonStyle.PRIMARY}
              label={`Supprimer l’action ${action.titre}`}
            >
              Supprimer
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default withTransaction(DetailActionPage.name, 'page')(DetailActionPage)
