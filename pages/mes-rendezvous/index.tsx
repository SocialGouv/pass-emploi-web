import { withTransaction } from '@elastic/apm-rum-react'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import SuccessMessage from 'components/SuccessMessage'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { UserStructure } from 'interfaces/conseiller'
import { Rdv } from 'interfaces/rdv'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { RendezVousService } from 'services/rendez-vous.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

type MesRendezvousProps = {
  rendezVousFuturs: Rdv[]
  rendezVousPasses: Rdv[]
  creationSuccess?: boolean
  modificationSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function MesRendezvous({
  rendezVousFuturs,
  rendezVousPasses,
  creationSuccess,
  modificationSuccess,
  messageEnvoiGroupeSuccess,
}: MesRendezvousProps) {
  const router = useRouter()
  const { data: session } = useSession<true>({ required: true })

  const [showRdvCreationSuccess, setShowRdvCreationSuccess] = useState<boolean>(
    creationSuccess ?? false
  )
  const [showRdvModificationSuccess, setShowRdvModificationSuccess] =
    useState<boolean>(modificationSuccess ?? false)
  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [displayOldRdv, setDisplayOldRdv] = useState(false)
  const [selectedRdv, setSelectedRdv] = useState<Rdv | undefined>(undefined)
  const [rdvsAVenir, setRdvsAVenir] = useState(rendezVousFuturs)

  const pageTracking = `Mes rendez-vous`
  let initialTracking = pageTracking
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function deleteRdv() {
    const index = rdvsAVenir.indexOf(selectedRdv!)
    const newArray = [
      ...rdvsAVenir.slice(0, index),
      ...rdvsAVenir.slice(index + 1, rdvsAVenir.length),
    ]
    setRdvsAVenir(newArray)
  }

  function toggleDisplayOldRdv(): void {
    setDisplayOldRdv(!displayOldRdv)
    if (displayOldRdv) {
      setTrackingTitle('Mes rendez-vous passés')
    } else {
      setTrackingTitle(pageTracking)
    }
  }

  function closeRdvEditionMessage(): void {
    setShowRdvCreationSuccess(false)
    setShowRdvModificationSuccess(false)
    router.replace('', undefined, { shallow: true })
  }

  function closeMessageGroupeEnvoiSuccess(): void {
    setShowMessageGroupeEnvoiSuccess(false)
    router.replace('', undefined, { shallow: true })
  }

  function openDeleteRdvModal(rdv: Rdv) {
    setSelectedRdv(rdv)
    setShowDeleteModal(true)
    setTrackingTitle(pageTracking + ' - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setShowDeleteModal(false)
    setTrackingTitle(pageTracking)
  }

  useMatomo(trackingTitle)

  return (
    <>
      <span
        className={`flex flex-wrap justify-between items-center ${styles.header}`}
      >
        <h1 className='h2-semi text-bleu_nuit'>Rendez-vous</h1>
        <ButtonLink href={'/mes-jeunes/edition-rdv'}>
          Fixer un rendez-vous
        </ButtonLink>
      </span>

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

        <div role='tablist' className='flex mb-[40px]'>
          <Button
            role='tab'
            type='button'
            controls='rendez-vous-futurs'
            className='mr-[8px]'
            style={displayOldRdv ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY}
            onClick={toggleDisplayOldRdv}
          >
            Prochains rendez-vous
          </Button>

          <Button
            role='tab'
            type='button'
            controls='rendez-vous-passes'
            style={displayOldRdv ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY}
            onClick={toggleDisplayOldRdv}
          >
            Rendez-vous passés
          </Button>
        </div>

        {displayOldRdv ? (
          <RdvList
            id='rendez-vous-passes'
            idConseiller={session?.user.id ?? ''}
            rdvs={rendezVousPasses}
          />
        ) : (
          <RdvList
            id='rendez-vous-futurs'
            idConseiller={session?.user.id ?? ''}
            rdvs={rdvsAVenir}
            onDelete={openDeleteRdvModal}
          />
        )}

        {showDeleteModal && (
          <DeleteRdvModal
            onClose={closeDeleteRdvModal}
            onDelete={deleteRdv}
            show={showDeleteModal}
            rdv={selectedRdv!}
          />
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  MesRendezvousProps
> = async (context): Promise<GetServerSidePropsResult<MesRendezvousProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === UserStructure.POLE_EMPLOI) {
    return { notFound: true }
  }

  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')
  const { passes, futurs } = await rendezVousService.getRendezVousConseiller(
    user.id,
    accessToken
  )

  const props: MesRendezvousProps = {
    rendezVousFuturs: futurs,
    rendezVousPasses: passes,
    messageEnvoiGroupeSuccess: Boolean(context.query?.envoiMessage),
    pageTitle: 'Tableau de bord - Mes rendez-vous',
  }

  if (context.query.creationRdv)
    props.creationSuccess = context.query.creationRdv === 'succes'

  if (context.query.modificationRdv)
    props.modificationSuccess = context.query.modificationRdv === 'succes'

  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'
  }
  return { props }
}

export default withTransaction(MesRendezvous.name, 'page')(MesRendezvous)
