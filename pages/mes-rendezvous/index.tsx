import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import SuccessMessage from 'components/SuccessMessage'
import ButtonLink from 'components/ui/ButtonLink'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { UserStructure } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface MesRendezvousProps extends PageProps {
  rendezVousFuturs: RdvListItem[]
  rendezVousPasses: RdvListItem[]
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

  const [selectedRdv, setSelectedRdv] = useState<RdvListItem | undefined>(
    undefined
  )
  const [rdvsAVenir, setRdvsAVenir] = useState<RdvListItem[]>(rendezVousFuturs)
  const [displayOldRdv, setDisplayOldRdv] = useState(false)

  const pageTracking = `Mes rendez-vous`
  let initialTracking = pageTracking
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function deleteRdv(deletedRdv: RdvListItem) {
    setRdvsAVenir((prevRdvs) => {
      const index = rdvsAVenir.indexOf(deletedRdv)
      prevRdvs.splice(index, 1)
      return prevRdvs
    })
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

  function openDeleteRdvModal(rdv: RdvListItem) {
    setSelectedRdv(rdv)
    setTrackingTitle(pageTracking + ' - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setSelectedRdv(undefined)
    setTrackingTitle(pageTracking)
  }

  useMatomo(trackingTitle)

  return (
    <>
      <ButtonLink href={'/mes-jeunes/edition-rdv'} className='mb-4 w-fit'>
        Fixer un rendez-vous
      </ButtonLink>

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

      <TabList className='mb-[40px]'>
        <Tab
          label='Prochains rendez-vous'
          controls='rendez-vous-futurs'
          selected={!displayOldRdv}
          onSelectTab={toggleDisplayOldRdv}
        />
        <Tab
          label='Rendez-vous passés'
          controls='rendez-vous-passes'
          selected={displayOldRdv}
          onSelectTab={toggleDisplayOldRdv}
        />
      </TabList>

      {displayOldRdv ? (
        <div
          role='tabpanel'
          id='rendez-vous-passes'
          aria-labelledby='rendez-vous-passes--tab'
          tabIndex={0}
        >
          <RdvList
            idConseiller={session?.user.id ?? ''}
            rdvs={rendezVousPasses}
          />
        </div>
      ) : (
        <div
          role='tabpanel'
          id='rendez-vous-futurs'
          aria-labelledby='rendez-vous-futurs--tab'
          tabIndex={0}
        >
          <RdvList
            idConseiller={session?.user.id ?? ''}
            rdvs={rdvsAVenir}
            onDelete={openDeleteRdvModal}
          />
        </div>
      )}

      {selectedRdv && (
        <DeleteRdvModal
          rdv={selectedRdv}
          onClose={closeDeleteRdvModal}
          onDelete={deleteRdv}
        />
      )}
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
    rendezVousFuturs: futurs.map(rdvToListItem),
    rendezVousPasses: passes.map(rdvToListItem),
    pageTitle: 'Tableau de bord - Mes rendez-vous',
    pageHeader: 'Rendez-vous',
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
