import { useState } from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import useMatomo from 'utils/analytics/useMatomo'

interface UpdateIdentifiantPartenaireModalProps {
  identifiantPartenaire: string | undefined
  updateIdentifiantPartenaire: (identifiantPartenaire: string) => Promise<void>
  onClose: () => void
}

export default function UpdateIdentifiantPartenaireModal({
  identifiantPartenaire,
  updateIdentifiantPartenaire,
  onClose,
}: UpdateIdentifiantPartenaireModalProps) {
  const [getIdentifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(identifiantPartenaire)

  function identifiantPartenaireEstValide() {
    return (
      getIdentifiantPartenaire &&
      getIdentifiantPartenaire.length > 0 &&
      getIdentifiantPartenaire.length < 11
    )
  }

  async function handleUpdateIdentifiantPartenaire() {
    if (identifiantPartenaireEstValide()) {
      await updateIdentifiantPartenaire(getIdentifiantPartenaire!)
    }
  }

  useMatomo(
    identifiantPartenaire
      ? 'Détail jeune - modification identifiant PE'
      : 'Détail jeune - ajout identifiant PE'
  )

  const titre = identifiantPartenaire
    ? 'Modifiez l’identifiant Pôle emploi du jeune'
    : 'Ajoutez l’identifiant Pôle emploi du jeune'

  return (
    <Modal title={titre} onClose={onClose}>
      <div className='mt-8 mb-14'>
        <label htmlFor='identifiantPartenaire' className='text-base-medium'>
          Identifiant Pôle emploi (10 caractères maximum)
        </label>
        <input
          type='text'
          id='identifiantPartenaire'
          name='identifiantPartenaire'
          defaultValue={identifiantPartenaire}
          onChange={(e) => setIdentifiantPartenaire(e.target.value)}
          maxLength={10}
          className={'border border-solid rounded-medium w-full px-4 py-3 mt-3'}
        />
      </div>

      <div className='h-[1px] bg-primary_lighten' />
      <div className='flex justify-center mt-4'>
        <Button
          type='button'
          className='mr-4'
          style={ButtonStyle.SECONDARY}
          onClick={onClose}
        >
          <span className='px-10'>Annuler</span>
        </Button>

        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          disabled={!Boolean(getIdentifiantPartenaire)}
          onClick={handleUpdateIdentifiantPartenaire}
        >
          <span className='px-10'>Enregistrer</span>
        </Button>
      </div>
    </Modal>
  )
}
