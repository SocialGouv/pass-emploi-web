import { ForwardedRef, forwardRef, useRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'

type ChangementDispositifBeneficiaireModalProps = {
  dispositif: string
  onConfirm: (nouveauDispositif: string) => void
  onCancel: () => void
}
function ChangementDispositifBeneficiaireModal(
  {
    dispositif,
    onConfirm,
    onCancel,
  }: ChangementDispositifBeneficiaireModalProps,
  ref: ForwardedRef<ModalHandles>
) {
  const checkboxRef = useRef<HTMLInputElement>(null)
  const [confirmError, setConfirmError] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const nouveauDispositif = ((): string => {
    switch (dispositif) {
      case 'CEJ':
        return 'PACEA'
      case 'PACEA':
      default:
        return 'CEJ'
    }
  })()

  function changerDispositif() {
    if (!checkboxRef.current!.checked) {
      setConfirmError('Cet élément est obligatoire.')
      return
    }

    setLoading(true)
    onConfirm(nouveauDispositif)
  }

  return (
    <Modal
      ref={ref}
      title={`Confirmation du changement de dispositif (passage en ${nouveauDispositif})`}
      onClose={onCancel}
      titleIllustration={IllustrationName.ArrowForward}
    >
      <p className='p-6 flex gap-2 rounded-base bg-warning_lighten text-warning text-base-bold'>
        <IconComponent
          name={IconName.Error}
          className='shrink-0 w-6 h-6 fill-current'
        />
        Attention, cette modification ne doit être utilisée que pour corriger
        une erreur dans le choix du dispositif lors de la création du compte.
      </p>

      <p className='mt-4 mb-8 text-center'>
        Si vous devez effectuer un changement de dispositif, la bonne procédure
        consiste à{' '}
        <strong className='underline'>archiver le compte du jeune</strong> et à
        créer un nouveau compte correspondant au nouveau dispositif.
      </p>

      {confirmError && (
        <InputError
          id='check-changement-dispositif--error'
          ref={(e) => e?.focus()}
        >
          {confirmError}
        </InputError>
      )}
      <label htmlFor='check-changement-dispositif' className='flex gap-2'>
        <input
          type='checkbox'
          id='check-changement-dispositif'
          ref={checkboxRef}
        />
        Je confirme que le passage en {nouveauDispositif} de ce bénéficiaire est
        lié à une erreur lors de la création du compte (obligatoire)
      </label>

      <Button
        style={ButtonStyle.PRIMARY}
        onClick={changerDispositif}
        className='block mx-auto mt-8'
        isLoading={loading}
      >
        Confirmer le passage du bénéficiaire en {nouveauDispositif}
      </Button>
    </Modal>
  )
}

export default forwardRef(ChangementDispositifBeneficiaireModal)
