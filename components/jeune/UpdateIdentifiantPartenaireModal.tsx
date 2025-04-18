import {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import useMatomo from 'utils/analytics/useMatomo'

interface UpdateIdentifiantPartenaireModalProps {
  identifiantPartenaire: string | undefined
  updateIdentifiantPartenaire: (identifiantPartenaire: string) => Promise<void>
  onClose: () => void
}

function UpdateIdentifiantPartenaireModal(
  {
    identifiantPartenaire,
    updateIdentifiantPartenaire,
    onClose,
  }: UpdateIdentifiantPartenaireModalProps,
  ref: ForwardedRef<ModalHandles>
) {
  const MAX_INPUT_LENGTH = 11

  const [getIdentifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(identifiantPartenaire)

  const modalRef = useRef<ModalHandles>(null)
  useImperativeHandle(ref, () => modalRef.current!)

  function identifiantPartenaireEstValide() {
    return (
      getIdentifiantPartenaire?.length &&
      getIdentifiantPartenaire.length <= MAX_INPUT_LENGTH
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
      : 'Détail jeune - ajout identifiant PE',
    true
  )

  const titre = identifiantPartenaire
    ? 'Modifiez l’identifiant France Travail du bénéficiaire'
    : 'Ajoutez l’identifiant France Travail du bénéficiaire'

  return (
    <Modal ref={modalRef} title={titre} onClose={onClose}>
      <div className='mt-8 mb-14'>
        <Label htmlFor='identifiantPartenaire'>
          Identifiant France Travail ({MAX_INPUT_LENGTH.toString()} caractères
          maximum)
        </Label>
        <Input
          type='text'
          id='identifiantPartenaire'
          defaultValue={identifiantPartenaire}
          onChange={setIdentifiantPartenaire}
          maxLength={MAX_INPUT_LENGTH}
        />
      </div>

      <div className='h-[1px] bg-primary-lighten' />
      <div className='flex justify-center mt-4'>
        <Button
          type='button'
          className='mr-4'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
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

export default forwardRef(UpdateIdentifiantPartenaireModal)
