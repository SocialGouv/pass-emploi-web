import { useState } from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
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
        <Label htmlFor='identifiantPartenaire'>
          Identifiant Pôle emploi (10 caractères maximum)
        </Label>
        <Input
          type='text'
          id='identifiantPartenaire'
          defaultValue={identifiantPartenaire}
          onChange={setIdentifiantPartenaire}
          maxLength={10}
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
