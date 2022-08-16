import { useState } from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'

interface UpdateNumeroPEModalProps {
  numeroPoleEmploi: string | undefined
  updateNumeroPoleEmploi: (numeroPoleEmploi: string) => Promise<void>
  onClose: () => void
}

export default function UpdateNumeroPEModal({
  numeroPoleEmploi,
  updateNumeroPoleEmploi,
  onClose,
}: UpdateNumeroPEModalProps) {
  const [getNumeroPoleEmploi, setNumeroPoleEmploi] = useState<
    string | undefined
  >(numeroPoleEmploi)

  function identifiantPoleEmploiEstValide() {
    return (
      getNumeroPoleEmploi &&
      getNumeroPoleEmploi.length > 0 &&
      getNumeroPoleEmploi.length < 11
    )
  }

  async function handleUpdateNumeroPoleEmploi() {
    if (identifiantPoleEmploiEstValide()) {
      await updateNumeroPoleEmploi(getNumeroPoleEmploi!)
    }
  }

  const titre = numeroPoleEmploi
    ? 'Modifiez le numéro Pôle Emploi du jeune'
    : 'Ajoutez le numéro Pôle Emploi du jeune'

  return (
    <Modal title={titre} onClose={onClose}>
      <label htmlFor='numeroPoleEmploi' className='text-base-bold mb-2'>
        Numéro Pôle Emploi (10 caractères maximum)
      </label>
      <input
        type='text'
        id='numeroPoleEmploi'
        name='numeroPoleEmploi'
        defaultValue={numeroPoleEmploi}
        onChange={(e) => setNumeroPoleEmploi(e.target.value)}
        maxLength={10}
        className={'border border-solid rounded-medium w-full px-4 py-3 mb-8'}
      />

      <div className='flex justify-center mt-12'>
        <Button
          type='button'
          className='mr-[16px]'
          style={ButtonStyle.SECONDARY}
          onClick={onClose}
        >
          <span className='px-[40px]'>Annuler</span>
        </Button>

        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          disabled={!Boolean(getNumeroPoleEmploi)}
          onClick={handleUpdateNumeroPoleEmploi}
        >
          <span className='px-[40px]'>Enregistrer</span>
        </Button>
      </div>
    </Modal>
  )
}
