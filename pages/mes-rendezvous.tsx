import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import RdvList from 'components/rdv/RdvList'
import ButtonLink from 'components/ui/ButtonLink'
import SuccessMessage from 'components/ui/SuccessMessage'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { UserStructure } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { QueryParams, QueryValues } from 'referentiel/queryParams'
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
  suppressionSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function MesRendezvous({
  rendezVousFuturs,
  rendezVousPasses,
  creationSuccess,
  modificationSuccess,
  suppressionSuccess,
  messageEnvoiGroupeSuccess,
}: MesRendezvousProps) {
  const router = useRouter()
  const { data: session } = useSession<true>({ required: true })

  const [showRdvCreationSuccess, setShowRdvCreationSuccess] = useState<boolean>(
    creationSuccess ?? false
  )
  const [showRdvModificationSuccess, setShowRdvModificationSuccess] =
    useState<boolean>(modificationSuccess ?? false)

  const [showRdvSuppressionSuccess, setShowRdvSuppressionSuccess] =
    useState<boolean>(suppressionSuccess ?? false)

  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  const [displayOldRdv, setDisplayOldRdv] = useState(false)

  const pageTracking = `Mes rendez-vous`
  let initialTracking = pageTracking
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (suppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function toggleDisplayOldRdv(): void {
    setDisplayOldRdv(!displayOldRdv)
    if (displayOldRdv) {
      setTrackingTitle('Mes rendez-vous passés')
    } else {
      setTrackingTitle(pageTracking)
    }
  }

  function closeRdvMessage(): void {
    setShowRdvCreationSuccess(false)
    setShowRdvModificationSuccess(false)
    setShowRdvSuppressionSuccess(false)
    router.replace('', undefined, { shallow: true })
  }

  function closeMessageGroupeEnvoiSuccess(): void {
    setShowMessageGroupeEnvoiSuccess(false)
    router.replace('', undefined, { shallow: true })
  }

  useMatomo(trackingTitle)

  return (
    <>
      {showRdvCreationSuccess && (
        <SuccessMessage
          label={'Le rendez-vous a bien été créé'}
          onAcknowledge={closeRdvMessage}
        />
      )}

      {showRdvModificationSuccess && (
        <SuccessMessage
          label={'Le rendez-vous a bien été modifié'}
          onAcknowledge={closeRdvMessage}
        />
      )}

      {showRdvSuppressionSuccess && (
        <SuccessMessage
          label={'Le rendez-vous a bien été supprimé'}
          onAcknowledge={closeRdvMessage}
        />
      )}

      {showMessageGroupeEnvoiSuccess && (
        <SuccessMessage
          label={
            'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires'
          }
          onAcknowledge={closeMessageGroupeEnvoiSuccess}
        />
      )}
      <ButtonLink href={'/mes-jeunes/edition-rdv'} className='mb-4 w-fit'>
        Fixer un rendez-vous
      </ButtonLink>

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
            rdvs={rendezVousFuturs}
          />
        </div>
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

  if (context.query[QueryParams.creationRdv])
    props.creationSuccess =
      context.query[QueryParams.creationRdv] === QueryValues.succes

  if (context.query[QueryParams.modificationRdv])
    props.modificationSuccess =
      context.query[QueryParams.modificationRdv] === QueryValues.succes

  if (context.query[QueryParams.suppressionRdv])
    props.suppressionSuccess =
      context.query[QueryParams.suppressionRdv] === QueryValues.succes

  if (context.query[QueryParams.envoiMessage]) {
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParams.envoiMessage] === QueryValues.succes
  }
  return { props }
}

export default withTransaction(MesRendezvous.name, 'page')(MesRendezvous)
