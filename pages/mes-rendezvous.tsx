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
  const FIN_SEMAINE_COURANTE = AUJOURDHUI.plus({ day: 6 }).endOf('day')

  const [numeroSemaineAffichee, setNumeroSemaineAffichee] = useState<number>(0)
  const [rdvs, setRdvs] = useState<RdvListItem[] | undefined>()

  let initialTracking = `Mes rendez-vous`
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (suppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function allerRdvsPasses() {
    const numeroSemainePassee = numeroSemaineAffichee - 1
    await chargerRdvsSemaine(numeroSemainePassee)
    setNumeroSemaineAffichee(numeroSemainePassee)
    setTrackingTitle(`${trackingTitle} passés`)
  }

  async function allerRdvsSemaineCourante() {
    const numeroSemaineCourante = 0
    await chargerRdvsSemaine(numeroSemaineCourante)
    setNumeroSemaineAffichee(numeroSemaineCourante)
    setTrackingTitle(trackingTitle)
  }

  async function allerRdvsSemaineFuture() {
    const numeroSemaineFuture = numeroSemaineAffichee + 1
    await chargerRdvsSemaine(numeroSemaineFuture)
    setNumeroSemaineAffichee(numeroSemaineFuture)
    setTrackingTitle(`${trackingTitle} futurs`)
  }

  async function chargerRdvsSemaine(numeroSemaine: number) {
    const rdvsSemaine =
      await rendezVousService.getRendezVousConseillerClientSide(
        conseiller!.id,
        jourDeDebutDesRdvs(numeroSemaine),
        jourDeFinDesRdvs(numeroSemaine)
      )
    if (rdvsSemaine) setRdvs(rdvsSemaine.map(rdvToListItem))
  }

  function jourDeDebutDesRdvs(numeroSemaine?: number) {
    return AUJOURDHUI.plus({
      day: 7 * (numeroSemaine ?? numeroSemaineAffichee),
    })
  }

  function jourDeFinDesRdvs(numeroSemaine?: number) {
    return FIN_SEMAINE_COURANTE.plus({
      day: 7 * (numeroSemaine ?? numeroSemaineAffichee),
    })
  }

  useMatomo(trackingTitle)

  useEffect(() => {
    if (!rdvs && conseiller) allerRdvsSemaineCourante()
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
            du {jourDeDebutDesRdvs().toFormat('dd/MM/yyyy')} au{' '}
            {jourDeFinDesRdvs().toFormat('dd/MM/yyyy')}
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
