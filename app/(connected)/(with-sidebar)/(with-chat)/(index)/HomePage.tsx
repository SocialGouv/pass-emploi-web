'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Agence } from 'interfaces/referentiel'
import { estMilo, structureMilo } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent, trackPage } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type HomePageProps = {
  redirectUrl: string
  afficherModaleOnboarding: boolean
  afficherModaleAgence: boolean
  afficherModaleEmail: boolean
  referentielAgences?: Agence[]
}

const RenseignementAgenceModal = dynamic(
  () => import('components/RenseignementAgenceModal')
)
const RenseignementEmailModal = dynamic(
  () => import('components/RenseignementEmailModal')
)
const RenseignementStructureModal = dynamic(
  () => import('components/RenseignementStructureModal')
)
const OnboardingModal = dynamic(
  () => import('components/onboarding/OnboardingModal')
)

function HomePage({
  afficherModaleOnboarding,
  afficherModaleAgence,
  afficherModaleEmail,
  redirectUrl,
  referentielAgences,
}: HomePageProps) {
  const router = useRouter()
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [_, setAlerte] = useAlerte()

  const [showModaleOnboarding, setShowModaleOnboarding] = useState<boolean>(
    afficherModaleOnboarding
  )
  const [showModaleEmail, setShowModaleEmail] =
    useState<boolean>(afficherModaleEmail)
  const [showModaleAgence, setShowModaleAgence] =
    useState<boolean>(afficherModaleAgence)

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Pop-in sélection agence'
  )
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

  function redirectToUrl() {
    router.replace(redirectUrl)
  }

  function trackContacterSupport() {
    trackEvent({
      structure: structureMilo,
      categorie: 'Contact Support',
      action: 'Pop-in sélection Mission Locale',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  function trackAccederImilo() {
    trackPage({
      structure: structureMilo,
      customTitle: 'Accès i-milo',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  useEffect(() => {
    if (!showModaleOnboarding && !showModaleAgence && !showModaleEmail)
      redirectToUrl()
  }, [showModaleOnboarding, showModaleAgence, showModaleEmail])

  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <>
      {showModaleEmail && (
        <RenseignementEmailModal
          onAccederImilo={trackAccederImilo}
          onClose={() => setShowModaleEmail(false)}
        />
      )}

      {showModaleAgence && estMilo(conseiller.structure) && (
        <RenseignementStructureModal
          onContacterSupport={trackContacterSupport}
          onAccederImilo={trackAccederImilo}
          onClose={() => setShowModaleAgence(false)}
        />
      )}

      {showModaleAgence &&
        !estMilo(conseiller.structure) &&
        referentielAgences && (
          <RenseignementAgenceModal
            referentielAgences={referentielAgences}
            onAgenceChoisie={selectAgence}
            onClose={() => setShowModaleAgence(false)}
          />
        )}

      {showModaleOnboarding && (
        <OnboardingModal
          conseiller={conseiller}
          onClose={() => setShowModaleOnboarding(false)}
        />
      )}
    </>
  )
}

export default withTransaction(HomePage.name, 'page')(HomePage)
