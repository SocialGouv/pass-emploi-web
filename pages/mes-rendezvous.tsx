import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import React, { useEffect, useState } from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

interface MesRendezvousProps extends PageProps {
  creationSuccess?: boolean
  modificationSuccess?: boolean
  suppressionSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function MesRendezvous({
  creationSuccess,
  modificationSuccess,
  suppressionSuccess,
  messageEnvoiGroupeSuccess,
}: MesRendezvousProps) {
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')

  const [conseiller] = useConseiller()

  const [rdvs, setRdvs] = useState<RdvListItem[] | undefined>()
  const [debutPeriode, setDebutPeriode] = useState<DateTime | undefined>()
  const [finPeriode, setFinPeriode] = useState<DateTime | undefined>()

  let initialTracking = `Mes rendez-vous`
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (suppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  useMatomo(trackingTitle)

  async function allerRdvsPasses() {
    const DEBUT_RDVS_PASSES = debutPeriode!.minus({ day: 7 })
    const FIN_RDVS_PASSES = finPeriode!.minus({ day: 7 })

    const rdvsPasses =
      await rendezVousService.getRendezVousConseillerClientSide(
        conseiller!.id,
        DEBUT_RDVS_PASSES,
        FIN_RDVS_PASSES
      )

    setRdvs(rdvsPasses.map(rdvToListItem))
    setDebutPeriode(DEBUT_RDVS_PASSES)
    setFinPeriode(FIN_RDVS_PASSES)
    setTrackingTitle(`${trackingTitle} passés`)
  }

  async function allerRdvsSemaineCourante() {
    const AUJOURDHUI = DateTime.now().startOf('day')
    const FIN_SEMAINE_COURANTE = AUJOURDHUI.plus({ day: 6 }).endOf('day')

    const rdvsSemaineCourante =
      await rendezVousService.getRendezVousConseillerClientSide(
        conseiller!.id,
        AUJOURDHUI,
        FIN_SEMAINE_COURANTE
      )

    setRdvs(rdvsSemaineCourante.map(rdvToListItem))
    setDebutPeriode(AUJOURDHUI)
    setFinPeriode(FIN_SEMAINE_COURANTE)
  }

  async function allerRdvsSemaineFuture() {
    const DEBUT_RDVS_FUTURS = debutPeriode!.plus({ day: 7 })
    const FIN_RDVS_FUTURS = finPeriode!.plus({ day: 7 })

    const rdvsFuturs =
      await rendezVousService.getRendezVousConseillerClientSide(
        conseiller!.id,
        DEBUT_RDVS_FUTURS,
        FIN_RDVS_FUTURS
      )
    setRdvs(rdvsFuturs.map(rdvToListItem))
    setDebutPeriode(DEBUT_RDVS_FUTURS)
    setFinPeriode(FIN_RDVS_FUTURS)
    setTrackingTitle(`${trackingTitle} futurs`)
  }

  useEffect(() => {
    if (!rdvs && conseiller) {
      allerRdvsSemaineCourante()
    }
  }, [rdvs, conseiller])

  return (
    <>
      <ButtonLink href={'/mes-jeunes/edition-rdv'} className='mb-6 w-fit'>
        Fixer un rendez-vous
      </ButtonLink>

      <div className='mb-12'>
        <div className='flex justify-between items-center'>
          <p className='text-base-medium'>Période :</p>
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            onClick={allerRdvsSemaineCourante}
          >
            <span className='sr-only'>Aller à la</span> Semaine en cours
          </Button>
        </div>

        <div className='flex items-center mt-1'>
          <p className='text-m-bold text-primary mr-6'>
            du {debutPeriode?.toFormat('dd/MM/yyyy')} au{' '}
            {finPeriode?.toFormat('dd/MM/yyyy')}
          </p>
          <button
            aria-label='Aller à la semaine précédente'
            onClick={allerRdvsPasses}
          >
            <IconComponent
              name={IconName.ChevronLeft}
              className='w-6 h-6 fill-primary hover:fill-primary_darken'
              focusable='false'
              title='Aller à la semaine précédente'
            />
          </button>
          <button
            aria-label='Aller à la semaine suivante'
            onClick={allerRdvsSemaineFuture}
          >
            <IconComponent
              name={IconName.ChevronRight}
              className='w-6 h-6 fill-primary ml-8 hover:fill-primary_darken'
              focusable='false'
              title='Aller à la semaine suivante'
            />
          </button>
        </div>
      </div>

      <TableauRdv
        idConseiller={conseiller?.id ?? ''}
        rdvs={rdvs ?? []}
        withIntercalaires={true}
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
    session: { user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }

  const props: MesRendezvousProps = {
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
