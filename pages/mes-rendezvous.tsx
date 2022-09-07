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
import withDependance from 'utils/injectionDependances/withDependance'

interface MesRendezvousProps extends PageProps {
  rendezVous: RdvListItem[]
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
  dateDebut,
  dateFin,
  creationSuccess,
  modificationSuccess,
  suppressionSuccess,
  messageEnvoiGroupeSuccess,
}: MesRendezvousProps) {
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')

  const [conseiller] = useConseiller()

  const [rdvs, setRdvs] = useState<RdvListItem[]>([])
  const [debutPeriode, setDebutPeriode] = useState<string>(dateDebut)
  const [finPeriode, setFinPeriode] = useState<string>(dateFin)

  let initialTracking = `Mes rendez-vous`
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (suppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  useMatomo(trackingTitle)

  async function allerRdvsPasses() {
    const FIN_RDVS_PASSES = DateTime.fromFormat(
      debutPeriode,
      'dd/MM/yyyy'
    ).minus({ day: 1 })
    const DEBUT_RDVS_PASSES = FIN_RDVS_PASSES.minus({ day: 6 })

    const rdvsPasses =
      await rendezVousService.getRendezVousConseillerClientSide(
        conseiller!.id,
        DEBUT_RDVS_PASSES.toFormat('yyyy-MM-dd'),
        FIN_RDVS_PASSES.toFormat('yyyy-MM-dd')
      )

    setRdvs(rdvsPasses.map(rdvToListItem))
    setDebutPeriode(DEBUT_RDVS_PASSES.toFormat('dd/MM/yyyy'))
    setFinPeriode(FIN_RDVS_PASSES.toFormat('dd/MM/yyyy'))
    setTrackingTitle(`${trackingTitle} passés`)
  }

  function allerRdvsSemaineCourante() {
    const AUJOURDHUI = DateTime.now()
    const FIN_SEMAINE_COURANTE = AUJOURDHUI.plus({ day: 6 })

    setRdvs(rendezVous)
    setDebutPeriode(AUJOURDHUI.toFormat('dd/MM/yyyy'))
    setFinPeriode(FIN_SEMAINE_COURANTE.toFormat('dd/MM/yyyy'))
  }

  async function allerRdvsSemaineFuture() {
    const FORMAT_DATE_DEBUT = DateTime.fromFormat(finPeriode, 'dd/MM/yyyy')
    const DEBUT_RDVS_FUTURS = FORMAT_DATE_DEBUT.plus({ day: 1 })
    const FIN_RDVS_FUTURS = DEBUT_RDVS_FUTURS.plus({ day: 6 })

    const rdvsFuturs =
      await rendezVousService.getRendezVousConseillerClientSide(
        conseiller!.id,
        DEBUT_RDVS_FUTURS.toFormat('yyyy-MM-dd'),
        FIN_RDVS_FUTURS.toFormat('yyyy-MM-dd')
      )
    setRdvs(rdvsFuturs.map(rdvToListItem))
    setDebutPeriode(DEBUT_RDVS_FUTURS.toFormat('dd/MM/yyyy'))
    setFinPeriode(FIN_RDVS_FUTURS.toFormat('dd/MM/yyyy'))
    setTrackingTitle(`${trackingTitle} futurs`)
  }

  useEffect(() => {
    setRdvs(rendezVous)
  }, [rendezVous])

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
            du {debutPeriode} au {finPeriode}
          </p>
          <button
            title='Aller à la semaine précédente'
            aria-label='Aller à la semaine précédente'
            onClick={allerRdvsPasses}
          >
            <IconComponent
              name={IconName.ChevronLeft}
              className='w-6 h-6 fill-primary hover:fill-primary_darken'
              focusable='false'
            />
          </button>
          <button
            title='Aller à la semaine suivante'
            aria-label='Aller à la semaine suivante'
            onClick={allerRdvsSemaineFuture}
          >
            <IconComponent
              name={IconName.ChevronRight}
              className='w-6 h-6 fill-primary ml-8 hover:fill-primary_darken'
              focusable='false'
            />
          </button>
        </div>
      </div>

      <TableauRdv
        idConseiller={conseiller?.id ?? ''}
        rdvs={rdvs}
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
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }

  const AUJOURDHUI = DateTime.now()
  const FIN_SEMAINE_COURANTE = AUJOURDHUI.plus({ day: 6 })

  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')

  const rendezVousSemaineCourante =
    await rendezVousService.getRendezVousConseillerServerSide(
      user.id,
      accessToken,
      AUJOURDHUI.toFormat('yyyy-MM-dd'),
      FIN_SEMAINE_COURANTE.toFormat('yyyy-MM-dd')
    )

  const props: MesRendezvousProps = {
    rendezVous: rendezVousSemaineCourante.map(rdvToListItem),
    dateDebut: AUJOURDHUI.toFormat('dd/MM/yyyy'),
    dateFin: FIN_SEMAINE_COURANTE.toFormat('dd/MM/yyyy'),
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
