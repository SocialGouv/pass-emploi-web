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
    ? 'Modifiez l’identifiant Pôle Emploi du jeune'
    : 'Ajoutez l’identifiant Pôle Emploi du jeune'

  return (
    <Modal title={titre} onClose={onClose}>
      <div className='mt-8 mb-14'>
        <label htmlFor='identifiantPoleEmploi' className='text-base-medium'>
          Identifiant Pôle Emploi (10 caractères maximum)
        </label>
        <input
          type='text'
          id='identifiantPoleEmploi'
          name='identifiantPoleEmploi'
          defaultValue={numeroPoleEmploi}
          onChange={(e) => setNumeroPoleEmploi(e.target.value)}
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
          disabled={!Boolean(getNumeroPoleEmploi)}
          onClick={handleUpdateNumeroPoleEmploi}
        >
          <span className='px-10'>Enregistrer</span>
        </Button>
      </div>
    </Modal>
  )
}
