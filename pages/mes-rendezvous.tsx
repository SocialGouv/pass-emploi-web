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

  const AUJOURDHUI = DateTime.now().startOf('day')

  const [index7JoursAffiches, setIndex7JoursAffiches] = useState<number>(0)
  const [rdvs, setRdvs] = useState<RdvListItem[]>([])

  let initialTracking = `Mes rendez-vous`
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (suppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function allerRdvs7JoursPrecedants() {
    const index7JoursPrecedants = index7JoursAffiches - 1
    await chargerRdvs7Jours(index7JoursPrecedants)
    setIndex7JoursAffiches(index7JoursPrecedants)
    setTrackingTitle(`${trackingTitle} passés`)
  }

  async function allerRdvs7JoursActuels() {
    const index7JoursActuels = 0
    await chargerRdvs7Jours(index7JoursActuels)
    setIndex7JoursAffiches(index7JoursActuels)
    setTrackingTitle(trackingTitle)
  }

  async function allerRdvs7JoursSuivants() {
    const index7JoursSuivants = index7JoursAffiches + 1
    await chargerRdvs7Jours(index7JoursSuivants)
    setIndex7JoursAffiches(index7JoursSuivants)
    setTrackingTitle(`${trackingTitle} futurs`)
  }

  async function chargerRdvs7Jours(index7Jours: number) {
    const rdvs7Jours = await rendezVousService.getRendezVousConseiller(
      conseiller!.id,
      jourDeDebutDesRdvs(index7Jours),
      jourDeFinDesRdvs(index7Jours)
    )
    if (rdvs7Jours) setRdvs(rdvs7Jours.map(rdvToListItem))
  }

  function jourDeDebutDesRdvs(index7Jours?: number): DateTime {
    return AUJOURDHUI.plus({
      day: 7 * (index7Jours ?? index7JoursAffiches),
    })
  }

  function jourDeFinDesRdvs(index7Jours?: number): DateTime {
    return jourDeDebutDesRdvs(index7Jours ?? index7JoursAffiches)
      .plus({ day: 6 })
      .endOf('day')
  }

  useMatomo(trackingTitle)

  useEffect(() => {
    if (conseiller) chargerRdvs7Jours(index7JoursAffiches)
  }, [conseiller, index7JoursAffiches])

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
            onClick={allerRdvs7JoursActuels}
          >
            <span className='sr-only'>Aller à la</span> Semaine en cours
          </Button>
        </div>

        <div className='flex items-center mt-1'>
          <p className='text-m-bold text-primary mr-6'>
            du {jourDeDebutDesRdvs().toFormat('dd/MM/yyyy')} au{' '}
            {jourDeFinDesRdvs().toFormat('dd/MM/yyyy')}
          </p>
          <button
            aria-label='Aller à la semaine précédente'
            onClick={allerRdvs7JoursPrecedants}
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
            onClick={allerRdvs7JoursSuivants}
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
