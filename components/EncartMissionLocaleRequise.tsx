import dynamic from 'next/dynamic'
import React, { ReactElement, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Agence, MissionLocale } from 'interfaces/referentiel'
import { structureMilo } from 'interfaces/structure'
import { trackEvent } from 'utils/analytics/matomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

const RenseignementMissionLocaleModal = dynamic(
  () => import('components/RenseignementMissionLocaleModal')
)

type EncartMissionLocaleRequiseProps = {
  getMissionsLocales: () => Promise<Agence[]>
  onMissionLocaleChoisie: (milo: MissionLocale) => Promise<void>
  onChangeAffichageModal: (trackingMessage: string) => void
}
export default function EncartMissionLocaleRequise({
  getMissionsLocales,
  onMissionLocaleChoisie,
  onChangeAffichageModal,
}: EncartMissionLocaleRequiseProps): ReactElement {
  const [portefeuille] = usePortefeuille()
  const [missionsLocales, setMissionsLocales] = useState<Agence[]>([])
  const [showMissionLocaleModal, setShowMissionLocaleModal] =
    useState<boolean>(false)

  async function openMissionLocaleModal() {
    if (!missionsLocales.length) {
      setMissionsLocales(await getMissionsLocales())
    }
    setShowMissionLocaleModal(true)
    onChangeAffichageModal('Pop-in sélection Mission Locale')
  }

  async function closeMissionLocaleModal() {
    setShowMissionLocaleModal(false)
    onChangeAffichageModal('Fermeture pop-in sélection Mission Locale')
  }

  async function renseignerMissionLocale(
    missionLocale: MissionLocale
  ): Promise<void> {
    await onMissionLocaleChoisie(missionLocale)
    setShowMissionLocaleModal(false)
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

  return (
    <>
      <div className='bg-warning-lighten rounded-base p-6'>
        <p className='flex items-center text-base-bold text-warning mb-2'>
          <IconComponent
            focusable={false}
            aria-hidden={true}
            className='w-4 h-4 mr-2 fill-warning'
            name={IconName.Error}
          />
          Votre Mission Locale n’est pas renseignée
        </p>
        <p className='text-base-regular text-warning mb-6'>
          Pour créer ou voir les animations collectives de votre Mission Locale
          vous devez la renseigner dans votre profil.
        </p>
        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={openMissionLocaleModal}
          className='mx-auto'
        >
          Renseigner votre Mission Locale
        </Button>
      </div>

      {showMissionLocaleModal && missionsLocales.length > 0 && (
        <RenseignementMissionLocaleModal
          referentielMissionsLocales={missionsLocales}
          onMissionLocaleChoisie={renseignerMissionLocale}
          onContacterSupport={trackContacterSupport}
          onClose={closeMissionLocaleModal}
        />
      )}
    </>
  )
}
