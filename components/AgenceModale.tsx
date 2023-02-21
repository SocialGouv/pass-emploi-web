import React, { useState } from 'react'

import { StructureConseiller } from '../interfaces/conseiller'
import { Agence } from '../interfaces/referentiel'

import RenseignementAgenceModal from './RenseignementAgenceModal'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

type AgenceModaleProps = {
  structureConseiller: StructureConseiller
  getAgences: (structure: StructureConseiller) => Promise<Agence[]>
  onAgenceChoisie: (agence: { id?: string; nom: string }) => Promise<void>
  onContacterSupport: () => void
  onOuvertureModale: (trackingMessage: string) => void
}
export default function AgenceModale({
  structureConseiller,
  getAgences,
  onAgenceChoisie,
  onOuvertureModale,
  onContacterSupport,
}: AgenceModaleProps): JSX.Element {
  const [agences, setAgences] = useState<Agence[]>([])
  const [showAgenceModal, setShowAgenceModal] = useState<boolean>(false)

  async function openAgenceModal() {
    if (!agences.length) {
      setAgences(await getAgences(structureConseiller))
    }
    setShowAgenceModal(true)
    onOuvertureModale('Pop-in sélection agence')
  }

  async function closeAgenceModal() {
    setShowAgenceModal(false)
    onOuvertureModale('Fermeture pop-in')
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
          Votre agence n’est pas renseignée
        </p>
        <p className='text-base-regular text-warning mb-6'>
          Pour créer ou voir les animations collectives de votre mission locale
          vous devez la renseigner dans votre profil.
        </p>
        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={openAgenceModal}
          className='mx-auto'
        >
          Renseigner votre Mission locale
        </Button>
      </div>

      {showAgenceModal && agences.length && (
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
