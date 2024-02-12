import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import RenseignementEmailModal from 'components/RenseignementEmailModal'
import RenseignementStructureModal from 'components/RenseignementStructureModal'
import {
  aEtablissement,
  Conseiller,
  doitSignerLesCGU,
  estMilo,
  estPassEmploi,
  StructureConseiller,
} from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { Agence } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import {
  trackEvent,
  trackPage,
  userStructureDimensionString,
} from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface HomePageProps extends PageProps {
  redirectUrl: string
  afficherModaleAgence: boolean
  afficherModaleEmail: boolean
  referentielAgences?: Agence[]
}

function Home({
  afficherModaleAgence,
  afficherModaleEmail,
  redirectUrl,
  referentielAgences,
}: HomePageProps) {
  const router = useRouter()
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [_, setAlerte] = useAlerte()
  const [showModaleEmail, setShowModaleEmail] =
    useState<boolean>(afficherModaleEmail)
  const [showModaleAgence, setShowModaleAgence] =
    useState<boolean>(afficherModaleAgence)

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

  function trackContacterSupport(etablissement: string) {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Pop-in sélection ' + etablissement,
      nom: '',
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  function trackAccederImilo() {
    trackPage({
      structure: userStructureDimensionString(StructureConseiller.MILO),
      customTitle: 'Accès i-milo',
    })
  }

  useEffect(() => {
    if (!showModaleAgence && !showModaleEmail) redirectToUrl()
  }, [showModaleAgence, showModaleEmail])

  useMatomo(trackingLabel, aDesBeneficiaires)

  return (
    <>
      {showModaleAgence && !referentielAgences && (
        <RenseignementStructureModal
          onContacterSupport={() => trackContacterSupport('structure')}
          onAccederImilo={trackAccederImilo}
          onClose={() => setShowModaleAgence(false)}
        />
      )}

      {showModaleAgence && referentielAgences && (
        <RenseignementAgenceModal
          conseiller={conseiller}
          referentielAgences={referentielAgences}
          onAgenceChoisie={selectAgence}
          onContacterSupport={() => trackContacterSupport('agence')}
          onClose={() => setShowModaleAgence(false)}
        />
      )}

      {showModaleEmail && (
        <RenseignementEmailModal
          onAccederImilo={trackAccederImilo}
          onClose={() => setShowModaleEmail(false)}
        />
      )}
    </>
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

  if (doitSignerLesCGU(conseiller))
    return {
      redirect: {
        destination: '/consentement-cgu',
        permanent: false,
      },
    }

  const redirectUrl =
    (context.query.redirectUrl as string) ?? '/mes-jeunes' + sourceQueryParam

  const emailEstManquant = estMilo(conseiller) && !conseiller.email
  const agenceEstManquante =
    !estPassEmploi(conseiller) && !aEtablissement(conseiller)

  if (emailEstManquant || agenceEstManquante) {
    let props: HomePageProps = {
      afficherModaleAgence: agenceEstManquante,
      afficherModaleEmail: emailEstManquant,
      redirectUrl,
      pageTitle: 'Accueil',
    }

    if (!estMilo(conseiller) && agenceEstManquante) {
      const { getAgencesServerSide } = await import(
        'services/referentiel.service'
      )
      props.referentielAgences = await getAgencesServerSide(
        conseiller.structure,
        accessToken
      )
    }
    return { props }
  }

  return {
    redirect: {
      destination: `${redirectUrl}`,
      permanent: false,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
