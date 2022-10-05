import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { Agence } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ConseillerService } from 'services/conseiller.service'
import { ReferentielService } from 'services/referentiel.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type HomePageProps = PageProps & {
  redirectUrl: string
  agenceRenseignee: boolean
  referentielAgences: Agence[]
  withoutChat: true
}

function Home({
  redirectUrl,
  agenceRenseignee,
  referentielAgences,
}: HomePageProps) {
  const router = useRouter()
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const [conseiller, setConseiller] = useConseiller()

  const MIN_DESKTOP_WIDTH = 600

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Pop-in sélection agence'
  )

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller!, agence: agence.nom })
    setTrackingLabel('Succès ajout agence')
    await router.replace(
      `${redirectUrl}?${QueryParam.choixAgence}=${QueryValue.succes}`
    )
  }

  const redirectToOriginalDestination = useCallback(() => {
    router.replace(redirectUrl)
  }, [redirectUrl, router])

  useEffect(() => {
    if (agenceRenseignee) redirectToOriginalDestination()
    // if (agenceRenseignee)
    // if (window.innerWidth < MIN_DESKTOP_WIDTH)
    //   router.replace('/onboarding?' + new URLSearchParams({ redirectUrl }))
    // }, [agenceRenseignee, redirectToOriginalDestination])
    // }, [agenceRenseignee, redirectUrl, router])
  })

  useMatomo(trackingLabel)

  return (
    <>
      {agenceRenseignee && (
        <div aria-busy={true}>
          <IconComponent
            name={IconName.Spinner}
            focusable={false}
            aria-label='Chargement…'
            className='m-auto w-3/4 fill-primary animate-spin'
          />
        </div>
      )}
      {!agenceRenseignee && (
        <RenseignementAgenceModal
          structureConseiller={
            conseiller?.structure ?? StructureConseiller.PASS_EMPLOI
          }
          referentielAgences={referentielAgences}
          onAgenceChoisie={selectAgence}
          onClose={redirectToOriginalDestination}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context
): Promise<GetServerSidePropsResult<HomePageProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  const sourceQueryParam = context.query.source
    ? `?source=${context.query.source}`
    : ''

  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const conseiller = await conseillerService.getConseillerServerSide(
    user,
    accessToken
  )
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const redirectUrl =
    (context.query.redirectUrl as string) ?? '/mes-jeunes' + sourceQueryParam

  let referentielAgences: Agence[] = []
  let agenceRenseignee = true
  if (
    user.structure !== StructureConseiller.PASS_EMPLOI &&
    !conseiller.agence
  ) {
    const agenceService =
      withDependance<ReferentielService>('referentielService')
    referentielAgences = await agenceService.getAgences(
      user.structure,
      accessToken
    )
    agenceRenseignee = false
  }

  return {
    props: {
      pageTitle: 'Accueil',
      redirectUrl,
      agenceRenseignee,
      referentielAgences,
      withoutChat: true,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
