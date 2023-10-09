import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { Agence } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface HomePageProps extends PageProps {
  redirectUrl: string
  referentielAgences: Agence[]
}

function Home({ redirectUrl, referentielAgences }: HomePageProps) {
  const router = useRouter()
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [_, setAlerte] = useAlerte()

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Pop-in sélection agence'
  )
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel('Succès ajout agence')
    setAlerte(AlerteParam.choixAgence)
    redirectToUrl()
  }

  async function redirectToUrl() {
    await router.replace(redirectUrl)
  }

  function trackContacterSupport() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Pop-in sélection agence',
      nom: '',
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  useMatomo(trackingLabel, aDesBeneficiaires)

  return (
    <RenseignementAgenceModal
      conseiller={conseiller}
      referentielAgences={referentielAgences}
      onAgenceChoisie={selectAgence}
      onContacterSupport={trackContacterSupport}
      onClose={redirectToUrl}
    />
  )
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context
): Promise<GetServerSidePropsResult<HomePageProps>> => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
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

  const { getConseillerServerSide } = await import(
    'services/conseiller.service'
  )
  let conseiller: Conseiller | undefined
  try {
    conseiller = await getConseillerServerSide(user, accessToken)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401) {
      return {
        redirect: {
          destination: '/api/auth/federated-logout',
          permanent: false,
        },
      }
    }
    throw e
  }
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const redirectUrl =
    (context.query.redirectUrl as string) ?? '/mes-jeunes' + sourceQueryParam

  if (
    Boolean(conseiller.agence) ||
    user.structure === StructureConseiller.PASS_EMPLOI
  ) {
    return {
      redirect: {
        destination: `${redirectUrl}`,
        permanent: false,
      },
    }
  }

  const { getAgencesServerSide } = await import('services/referentiel.service')
  const referentielAgences = await getAgencesServerSide(
    user.structure,
    accessToken
  )
  return {
    props: {
      redirectUrl,
      referentielAgences,
      pageTitle: 'Accueil',
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
