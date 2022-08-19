import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import React, { useState } from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { listeRdvAVenirItem } from 'presentation/MesRdvViewModel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
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
  const [conseiller] = useConseiller()
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

  useMatomo(trackingTitle)

  return (
    <>
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
          <TableauRdv
            idConseiller={conseiller?.id ?? ''}
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
          <TableauRdv
            idConseiller={conseiller?.id ?? ''}
            rdvs={listeRdvAVenirItem(rendezVousFuturs)}
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
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
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
    pageHeader: 'Mes rendez-vous',
  }

  if (context.query[QueryParam.creationRdv])
    props.creationSuccess =
      context.query[QueryParam.creationRdv] === QueryValue.succes

  if (context.query[QueryParam.modificationRdv])
    props.modificationSuccess =
      context.query[QueryParam.modificationRdv] === QueryValue.succes

  if (context.query[QueryParam.suppressionRdv])
    props.suppressionSuccess =
      context.query[QueryParam.suppressionRdv] === QueryValue.succes

  if (context.query[QueryParam.envoiMessage]) {
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParam.envoiMessage] === QueryValue.succes
  }
  return { props }
}

export default withTransaction(MesRendezvous.name, 'page')(MesRendezvous)
