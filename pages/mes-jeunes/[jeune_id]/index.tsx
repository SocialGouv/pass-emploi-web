import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { ButtonStyle } from '../../../components/ui/Button'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { CollapseButton } from 'components/jeune/CollapseButton'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import SuccessMessage from 'components/SuccessMessage'
import ButtonLink from 'components/ui/ButtonLink'
import { Action, compareActionsDatesDesc } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerHistorique, Jeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import withDependance from 'utils/injectionDependances/withDependance'

interface FicheJeuneProps extends PageProps {
  jeune: Jeune
  rdvs: RdvListItem[]
  actions: Action[]
  conseillers: ConseillerHistorique[]
  rdvCreationSuccess?: boolean
  rdvModificationSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
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
  const [rdvsAVenir, setRdvsAVenir] = useState<RdvListItem[]>(rdvs)

  const [selectedRdv, setSelectedRdv] = useState<RdvListItem | undefined>(
    undefined
  )
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

  async function closeRdvEditionMessage() {
    setShowRdvCreationSuccess(false)
    setShowRdvModificationSuccess(false)
    await router.replace({ pathname: `/mes-jeunes/${jeune.id}` }, undefined, {
      shallow: true,
    })
  }

  function deleteRdv(deletedRdv: RdvListItem) {
    setRdvsAVenir((prevRdvs) => {
      const index = rdvsAVenir.indexOf(deletedRdv)
      prevRdvs.splice(index, 1)
      return prevRdvs
    })
  }

  function openDeleteRdvModal(rdv: RdvListItem) {
    setSelectedRdv(rdv)
    setTrackingLabel(pageTracking + ' - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setSelectedRdv(undefined)
    setTrackingLabel(pageTracking)
  }

  async function closeMessageGroupeEnvoiSuccess() {
    setShowMessageGroupeEnvoiSuccess(false)
    await router.replace({ pathname: `/mes-jeunes/${jeune.id}` }, undefined, {
      shallow: true,
    })
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
      <div className='flex'>
        {!isPoleEmploi && (
          <ButtonLink href={`/mes-jeunes/edition-rdv`} className='mb-4 w-fit'>
            Fixer un rendez-vous
          </ButtonLink>
        )}

        {!jeune.isActivated && (
          <ButtonLink
            href={`/mes-jeunes/${jeune.id}/suppression`}
            style={ButtonStyle.WARNING}
            className='ml-8'
          >
            Supprimer ce compte
          </ButtonLink>
        )}
      </div>

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

      <div className='mt-10 border-b border-primary_lighten'>
        <h2 className='text-l-regular text-primary_darken mb-4'>
          Rendez-vous {!isPoleEmploi && `(${rdvs?.length})`}
        </h2>

        {!isPoleEmploi ? (
          <RdvList
            rdvs={rdvsAVenir}
            idConseiller={session?.user.id ?? ''}
            onDelete={openDeleteRdvModal}
            withNameJeune={false}
          />
        ) : (
          <IntegrationPoleEmploi label='convocations' />
        )}
      </div>
      <div className='mt-8 border-b border-primary_lighten pb-8'>
        <h2 className='text-l-regular text-primary_darken mb-4'>Actions</h2>

        {isPoleEmploi && <IntegrationPoleEmploi label='actions et démarches' />}

        {!isPoleEmploi && actions.length !== 0 && (
          <>
            <TableauActionsJeune
              jeune={jeune}
              actions={actions}
              hideTableHead={true}
            />
            <div className='flex justify-center mt-8'>
              <Link href={`/mes-jeunes/${jeune.id}/actions`}>
                <a className='text-sm text-primary_darken underline'>
                  Voir la liste des actions du jeune
                </a>
              </Link>
            </div>
          </>
        )}

        {!isPoleEmploi && actions.length === 0 && (
          <>
            <p className='text-md mb-2'>
              {jeune.firstName} n&apos;a pas encore d&apos;action
            </p>
            <Link href={`/mes-jeunes/${jeune.id}/actions`}>
              <a className='text-sm text-primary_darken underline'>
                Accédez à cette page pour créer une action
              </a>
            </Link>
          </>
        )}
      </div>
      {selectedRdv && (
        <DeleteRdvModal
          onClose={closeDeleteRdvModal}
          onDelete={deleteRdv}
          rdv={selectedRdv}
        />
      )}
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
    rdvs: rdvs.filter((rdv) => new Date(rdv.date) > now).map(rdvToListItem),
    actions: [...actions].sort(compareActionsDatesDesc).slice(0, 3),
    conseillers,
    pageTitle: `Mes jeunes - ${jeune.firstName} ${jeune.lastName}`,
    pageHeader: `${jeune.firstName} ${jeune.lastName}`,
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
