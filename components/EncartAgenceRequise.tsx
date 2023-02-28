import React, { useState } from 'react'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'

type EncartAgenceRequiseProps = {
  structureConseiller: StructureConseiller
  getAgences: (structure: StructureConseiller) => Promise<Agence[]>
  onAgenceChoisie: (agence: { id?: string; nom: string }) => Promise<void>
  onContacterSupport: () => void
  onChangeAffichageModal: (trackingMessage: string) => void
}
export default function EncartAgenceRequise({
  structureConseiller,
  getAgences,
  onAgenceChoisie,
  onChangeAffichageModal,
  onContacterSupport,
}: EncartAgenceRequiseProps): JSX.Element {
  const [agences, setAgences] = useState<Agence[]>([])
  const [showAgenceModal, setShowAgenceModal] = useState<boolean>(false)
  const labelEtablissement =
    structureConseiller === StructureConseiller.MILO
      ? 'Mission Locale'
      : 'agence'

  async function openAgenceModal() {
    if (!agences.length) {
      setAgences(await getAgences(structureConseiller))
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

  return (
    <>
      <div className='bg-warning_lighten rounded-base p-6'>
        <p className='flex items-center text-base-bold text-warning mb-2'>
          <IconComponent
            focusable={false}
            aria-hidden={true}
            className='w-4 h-4 mr-2 fill-warning'
            name={IconName.Important}
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
          structureConseiller={structureConseiller}
          referentielAgences={agences}
          onAgenceChoisie={renseignerAgence}
          onContacterSupport={onContacterSupport}
          onClose={closeAgenceModal}
        />
      )}
    </>
  )
}
