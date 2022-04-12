import { withTransaction } from '@elastic/apm-rum-react'
import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { CollapseButton } from 'components/jeune/CollapseButton'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import SuccessMessage from 'components/SuccessMessage'
import ButtonLink from 'components/ui/ButtonLink'
import { ActionJeune, compareActionsDatesDesc } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerHistorique, Jeune } from 'interfaces/jeune'
import { Rdv } from 'interfaces/rdv'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import withDependance from 'utils/injectionDependances/withDependance'
import BackIcon from '../../../assets/icons/arrow_back.svg'

interface FicheJeuneProps {
  jeune: Jeune
  rdvs: Rdv[]
  actions: ActionJeune[]
  conseillers: ConseillerHistorique[]
  rdvCreationSuccess?: boolean
  rdvModificationSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function FicheJeune({
  jeune,
  rdvs,
  actions,
  conseillers,
  rdvCreationSuccess,
  rdvModificationSuccess,
  messageEnvoiGroupeSuccess,
}: FicheJeuneProps) {
  const { data: session } = useSession<true>({ required: true })
  const router = useRouter()

  const [, setCurrentJeune] = useCurrentJeune()
  const listeConseillersReduite = conseillers.slice(0, 5)
  const [conseillersAffiches, setConseillersAffiches] = useState<
    ConseillerHistorique[]
  >(listeConseillersReduite)
  const [rdvsAVenir, setRdvsAVenir] = useState(rdvs)

  const [selectedRdv, setSelectedRdv] = useState<Rdv | undefined>(undefined)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showRdvCreationSuccess, setShowRdvCreationSuccess] = useState<boolean>(
    rdvCreationSuccess ?? false
  )
  const [showRdvModificationSuccess, setShowRdvModificationSuccess] =
    useState<boolean>(rdvModificationSuccess ?? false)

  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const pageTracking: string = jeune.isActivated
    ? 'Détail jeune'
    : 'Détail jeune - Non Activé'
  let initialTracking = pageTracking
  if (rdvCreationSuccess) initialTracking += ' - Creation rdv succès'
  if (rdvModificationSuccess) initialTracking += ' - Modification rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  const isPoleEmploi = session?.user.structure === UserStructure.POLE_EMPLOI

  function closeRdvEditionMessage(): void {
    setShowRdvCreationSuccess(false)
    setShowRdvModificationSuccess(false)
    router.replace('', undefined, { shallow: true })
  }

  function deleteRdv() {
    if (selectedRdv) {
      const index = rdvsAVenir.indexOf(selectedRdv)
      const nouvelleListeRdvs = [
        ...rdvsAVenir.slice(0, index),
        ...rdvsAVenir.slice(index + 1, rdvsAVenir.length),
      ]
      setRdvsAVenir(nouvelleListeRdvs)
    }
  }

  function openDeleteRdvModal(rdv: Rdv) {
    setSelectedRdv(rdv)
    setShowDeleteModal(true)
    setTrackingLabel(pageTracking + ' - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setShowDeleteModal(false)
    setTrackingLabel(pageTracking)
  }

  function closeMessageGroupeEnvoiSuccess(): void {
    setShowMessageGroupeEnvoiSuccess(false)
    router.replace('', undefined, { shallow: true })
  }

  function toggleListeConseillers(): void {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setConseillersAffiches(conseillers)
    } else {
      setConseillersAffiches(listeConseillersReduite)
    }
  }

  useMatomo(trackingLabel)

  useEffect(() => {
    setCurrentJeune(jeune)
  }, [jeune, setCurrentJeune])

  return (
    <>
      <div className={`flex items-center justify-between ${styles.header}`}>
        <Link href={'/mes-jeunes'}>
          <a className='flex items-center'>
            <BackIcon aria-hidden={true} focusable='false' />
            <span className='ml-6 h4-semi text-bleu_nuit'>
              Liste de mes jeunes
            </span>
          </a>
        </Link>

        {!isPoleEmploi && (
          <ButtonLink href={`/mes-jeunes/edition-rdv`}>
            Fixer un rendez-vous
          </ButtonLink>
        )}
      </div>

      <div className={styles.content}>
        {showRdvCreationSuccess && (
          <SuccessMessage
            label={'Le rendez-vous a bien été créé'}
            onAcknowledge={closeRdvEditionMessage}
          />
        )}

        {showRdvModificationSuccess && (
          <SuccessMessage
            label={'Le rendez-vous a bien été modifié'}
            onAcknowledge={closeRdvEditionMessage}
          />
        )}
        {showMessageGroupeEnvoiSuccess && (
          <SuccessMessage
            label={
              'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des jeunes'
            }
            onAcknowledge={closeMessageGroupeEnvoiSuccess}
          />
        )}
        <DetailsJeune jeune={jeune} />

        <div className='mt-8'>
          <h2 className='text-base-medium mb-2'>Historique des conseillers</h2>
          <ListeConseillersJeune
            id='liste-conseillers'
            conseillers={conseillersAffiches}
          />
        </div>

        {conseillers.length > 5 && (
          <div className='flex justify-center mt-8'>
            <CollapseButton
              controlledId='liste-conseillers'
              isOpen={isExpanded}
              onClick={toggleListeConseillers}
            />
          </div>
        )}

        <div className='mt-10 border-b border-bleu_blanc'>
          <h2 className='h4-semi text-bleu_nuit mb-4'>
            Rendez-vous {!isPoleEmploi && `(${rdvs?.length})`}
          </h2>

          {!isPoleEmploi ? (
            <RdvList
              rdvs={rdvsAVenir}
              onDelete={openDeleteRdvModal}
              withNameJeune={false}
            />
          ) : (
            <IntegrationPoleEmploi label='convocations' />
          )}
        </div>
        <div className='mt-8 border-b border-bleu_blanc pb-8'>
          <h2 className='h4-semi text-bleu_nuit mb-4'>Actions</h2>

          {isPoleEmploi && (
            <IntegrationPoleEmploi label='actions et démarches' />
          )}

          {!isPoleEmploi && actions.length !== 0 && (
            <>
              <TableauActionsJeune
                jeune={jeune}
                actions={actions}
                hideTableHead={true}
              />
              <div className='flex justify-center mt-8'>
                <Link href={`/mes-jeunes/${jeune.id}/actions`}>
                  <a className='text-sm text-bleu_nuit underline'>
                    Voir la liste des actions du jeune
                  </a>
                </Link>
              </div>
            </>
          )}

          {!isPoleEmploi && actions.length === 0 && (
            <>
              <p className='text-md text-bleu mb-2'>
                {jeune.firstName} n&apos;a pas encore d&apos;action
              </p>
              <Link href={`/mes-jeunes/${jeune.id}/actions`}>
                <a className='text-sm text-bleu_nuit underline'>
                  Accédez à cette page pour créer une action
                </a>
              </Link>
            </>
          )}
        </div>
        {showDeleteModal && selectedRdv && (
          <DeleteRdvModal
            onClose={closeDeleteRdvModal}
            onDelete={deleteRdv}
            show={showDeleteModal}
            rdv={selectedRdv}
          />
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<FicheJeuneProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')
  const actionsService = withDependance<ActionsService>('actionsService')
  const {
    session: {
      accessToken,
      user: { structure },
    },
  } = sessionOrRedirect

  const isPoleEmploi = structure === UserStructure.POLE_EMPLOI
  const [jeune, conseillers, rdvs, actions] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    jeunesService.getConseillersDuJeune(
      context.query.jeune_id as string,
      accessToken
    ),
    isPoleEmploi
      ? []
      : rendezVousService.getRendezVousJeune(
          context.query.jeune_id as string,
          accessToken
        ),
    isPoleEmploi
      ? []
      : actionsService.getActionsJeune(
          context.query.jeune_id as string,
          accessToken
        ),
  ])

  if (!jeune) {
    return { notFound: true }
  }

  const now = new Date()
  const props: FicheJeuneProps = {
    jeune,
    rdvs: rdvs.filter((rdv) => new Date(rdv.date) > now),
    actions: [...actions].sort(compareActionsDatesDesc).slice(0, 3),
    conseillers,
    pageTitle: `Mes jeunes - ${resInfoJeune.firstName} ${resInfoJeune.lastName}`,
  }
  if (context.query.creationRdv)
    props.rdvCreationSuccess = context.query.creationRdv === 'succes'

  if (context.query.modificationRdv)
    props.rdvModificationSuccess = context.query.modificationRdv === 'succes'

  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query?.envoiMessage === 'succes'
  }

  return {
    props,
  }
}

export default withTransaction(FicheJeune.name, 'page')(FicheJeune)
