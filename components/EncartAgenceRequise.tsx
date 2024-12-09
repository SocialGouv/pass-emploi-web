import dynamic from 'next/dynamic'
import React, { ReactElement, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Conseiller, estMilo, StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import { trackEvent } from 'utils/analytics/matomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

const RenseignementAgenceModal = dynamic(
  () => import('components/RenseignementAgenceModal'),
  { ssr: false }
)

type EncartAgenceRequiseProps = {
  conseiller: Conseiller
  getAgences: (structure: StructureConseiller) => Promise<Agence[]>
  onAgenceChoisie: (agence: { id?: string; nom: string }) => Promise<void>
  onChangeAffichageModal: (trackingMessage: string) => void
}
export default function EncartAgenceRequise({
  conseiller,
  getAgences,
  onAgenceChoisie,
  onChangeAffichageModal,
}: EncartAgenceRequiseProps): ReactElement {
  const [portefeuille] = usePortefeuille()
  const [agences, setAgences] = useState<Agence[]>([])
  const [showAgenceModal, setShowAgenceModal] = useState<boolean>(false)
  const labelEtablissement = estMilo(conseiller) ? 'Mission Locale' : 'agence'
  async function openAgenceModal() {
    if (!agences.length) {
      setAgences(await getAgences(conseiller.structure))
    }
    setShowAgenceModal(true)
    onChangeAffichageModal('Pop-in sélection agence')
  }

  async function closeAgenceModal() {
    setShowAgenceModal(false)
    onChangeAffichageModal('Fermeture pop-in sélection agence')
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await onAgenceChoisie(agence)
    setShowAgenceModal(false)
  }

  function trackContacterSupport() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Pop-in sélection agence',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  return (
    <>
      <div className='bg-warning_lighten rounded-base p-6'>
        <p className='flex items-center text-base-bold text-warning mb-2'>
          <IconComponent
            focusable={false}
            aria-hidden={true}
            className='w-4 h-4 mr-2 fill-warning'
            name={IconName.Error}
          />
          Votre {labelEtablissement} n’est pas renseignée
        </p>
        <p className='text-base-regular text-warning mb-6'>
          Pour créer ou voir les animations collectives de votre{' '}
          {labelEtablissement} vous devez la renseigner dans votre profil.
        </p>
        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={openAgenceModal}
          className='mx-auto'
        >
          Renseigner votre {labelEtablissement}
        </Button>
      </div>

      {showAgenceModal && agences.length > 0 && (
        <RenseignementAgenceModal
          conseiller={conseiller}
          referentielAgences={agences}
          onAgenceChoisie={renseignerAgence}
          onContacterSupport={trackContacterSupport}
          onClose={closeAgenceModal}
        />
      )}
    </>
  )
}
