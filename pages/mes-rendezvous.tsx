import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import React, { useState } from 'react'

import IconComponent, { IconName } from '../components/ui/IconComponent'

import TableauRdv from 'components/rdv/TableauRdv'
import ButtonLink from 'components/ui/Button/ButtonLink'
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
  rendezVous: RdvListItem[]
  rendezVousSemaineCourante: RdvListItem[]
  dateDebut: string
  dateFin: string
  creationSuccess?: boolean
  modificationSuccess?: boolean
  suppressionSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function MesRendezvous({
  rendezVous,
  rendezVousSemaineCourante,
  dateDebut,
  dateFin,
  creationSuccess,
  modificationSuccess,
  suppressionSuccess,
  messageEnvoiGroupeSuccess,
}: MesRendezvousProps) {
  const [conseiller] = useConseiller()

  const pageTracking = `Mes rendez-vous`
  let initialTracking = pageTracking
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (suppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  useMatomo(trackingTitle)

  return (
    <>
      <ButtonLink href={'/mes-jeunes/edition-rdv'} className='mb-6 w-fit'>
        Fixer un rendez-vous
      </ButtonLink>

      <div className='mb-12'>
        <p className='text-base-medium'>Période du :</p>
        <div className='flex items-center mt-1'>
          <p className='text-m-bold text-primary mr-6'>
            {dateDebut} au {dateFin}
          </p>
          <button
            title='Aller à la semaine précédente'
            aria-label='Aller à la semaine précédente'
          >
            <IconComponent
              name={IconName.ChevronLeft}
              className='w-6 h-6 fill-primary'
              focusable='false'
            />
          </button>
          <button
            title='Aller à la semaine suivante'
            aria-label='Aller à la semaine suivante'
          >
            <IconComponent
              name={IconName.ChevronRight}
              className='w-6 h-6 fill-primary ml-8'
              focusable='false'
            />
          </button>
        </div>
      </div>

      <TableauRdv
        idConseiller={conseiller?.id ?? ''}
        rdvs={listeRdvAVenirItem(rendezVousSemaineCourante)}
      />
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

  const AUJOURDHUI = DateTime.now()
  const FIN_SEMAINE_COURANTE = AUJOURDHUI.plus({ day: 6 })

  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')

  const rendezVous = await rendezVousService.getRendezVousConseiller(
    user.id,
    accessToken,
    AUJOURDHUI.toFormat('yyyy-MM-dd'),
    FIN_SEMAINE_COURANTE.toFormat('yyyy-MM-dd')
  )
  const rendezVousSemaineCourante =
    await rendezVousService.getRendezVousConseiller(
      user.id,
      accessToken,
      AUJOURDHUI.toFormat('yyyy-MM-dd'),
      FIN_SEMAINE_COURANTE.toFormat('yyyy-MM-dd')
    )

  const props: MesRendezvousProps = {
    rendezVous: rendezVous.map(rdvToListItem),
    rendezVousSemaineCourante: rendezVousSemaineCourante.map(rdvToListItem),
    dateDebut: AUJOURDHUI.toFormat('yyyy-MM-dd'),
    dateFin: FIN_SEMAINE_COURANTE.toFormat('yyyy-MM-dd'),
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
