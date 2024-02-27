'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import RenseignementEmailModal from 'components/RenseignementEmailModal'
import RenseignementStructureModal from 'components/RenseignementStructureModal'
import { StructureConseiller } from 'interfaces/conseiller'
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
import { usePortefeuille } from 'utils/portefeuilleContext'

type HomePageProps = {
  redirectUrl: string
  afficherModaleAgence: boolean
  afficherModaleEmail: boolean
  referentielAgences?: Agence[]
}

function HomePage({
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
    router.replace(redirectUrl)
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

export default withTransaction(HomePage.name, 'page')(HomePage)
