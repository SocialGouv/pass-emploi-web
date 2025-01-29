import { DateTime } from 'luxon'
import React, { FormEvent, useEffect, useRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import { ValueWithError } from 'components/ValueWithError'
import { MessageImportantPreRempli } from 'services/messages.service'

interface MessageImportantModalProps {
  messageImportantIsLoading: boolean
  messageImportantPreRempli: MessageImportantPreRempli | undefined
  onModificationMessageImportant: (
    message: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => void
  onCancel: () => void
  onDeleteMessageImportant: () => void
  succesEnvoiMessageImportant?: boolean
  succesDesactivationMessageImportant?: boolean
}

export default function MessageImportantModal({
  messageImportantPreRempli,
  messageImportantIsLoading,
  succesEnvoiMessageImportant,
  succesDesactivationMessageImportant,
  onModificationMessageImportant,
  onCancel,
  onDeleteMessageImportant,
}: MessageImportantModalProps) {
  const MAX_INPUT_LENGTH = 150

  const modalRef = useRef<ModalHandles>(null)

  const [dateDebut, setDateDebut] = useState<
    ValueWithError<string | undefined>
  >({
    value: messageImportantPreRempli?.dateDebut ?? undefined,
  })

  const [dateFin, setDateFin] = useState<ValueWithError<string | undefined>>({
    value: messageImportantPreRempli?.dateFin ?? undefined,
  })

  const [message, setMessage] = useState<ValueWithError<string | undefined>>({
    value: messageImportantPreRempli?.message ?? undefined,
  })

  function validerDateDebut() {
    if (!dateDebut.value) {
      setDateDebut({
        ...dateDebut,
        error:
          'Le champ “Date de début” est vide. Renseignez une date de début.',
      })
      return false
    }
    return true
  }

  function validerDateFin() {
    if (!dateFin.value) {
      setDateFin({
        ...dateFin,
        error: 'Le champ “Date de fin” est vide. Renseignez une date de fin.',
      })
      return false
    } else {
      const dateDebutFormate = DateTime.fromISO(dateDebut.value!)
      const dateFinFormate = DateTime.fromISO(dateFin.value)
      if (dateFinFormate < dateDebutFormate) {
        setDateFin({
          ...dateFin,
          error:
            'Le champ “Date de fin” est invalide. La date de fin ne peut pas être antérieure à la date de début.',
        })
        return false
      }
    }

    return true
  }

  function validerTexte() {
    if (!message.value) {
      setMessage({
        value: message.value,
        error: 'Le champ “Message” est vide. Renseignez un message.',
      })
      return false
    }
    if (message.value && message.value.length > MAX_INPUT_LENGTH) {
      setMessage({
        value: message.value,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.',
      })
      return false
    }
    return true
  }

  function modifierMessageImportant(e: FormEvent) {
    e.preventDefault()
    const dateDebutEstValide = validerDateDebut()
    const dateFinEstValide = validerDateFin()
    const messageEstValide = validerTexte()

    if (dateDebutEstValide && dateFinEstValide && messageEstValide) {
      const debut = DateTime.fromISO(dateDebut.value!)
      const fin = DateTime.fromISO(dateFin.value!)
      onModificationMessageImportant(message.value!, debut, fin)
    }
  }

  const dateFinMessagePreRempliEstFuture =
    messageImportantPreRempli?.dateFin &&
    DateTime.fromISO(messageImportantPreRempli.dateFin).startOf('day') >=
      DateTime.now().startOf('day')

  useEffect(() => {
    if (succesEnvoiMessageImportant || succesDesactivationMessageImportant) {
      modalRef.current!.focusClose()
    }
  }, [succesEnvoiMessageImportant, succesDesactivationMessageImportant])

  return (
    <Modal
      title='Configurer un message important'
      onClose={onCancel}
      ref={modalRef}
    >
      {!succesEnvoiMessageImportant && !succesDesactivationMessageImportant && (
        <>
          {succesEnvoiMessageImportant === false && (
            <FailureAlert label="Suite à un problème inconnu l'envoi du message important a échoué. Vous pouvez réessayer." />
          )}

          <p className='mb-2'>
            Vous pouvez configurer un message pour indiquer une information
            importante à vos bénéficiaires (par exemple signaler une absence...)
          </p>
          <p className='mb-6'>
            Ce message ainsi que la période apparaitront en bandeau informatif
            au niveau de la messagerie
          </p>

          <p className='text-base-bold'>Tous les champs sont obligatoires</p>

          <form onSubmit={modifierMessageImportant}>
            <div className='mt-4 flex flex-col justify-center'>
              <div className='flex flex-wrap gap-2 mb-4 items-end'>
                <div className='flex-1'>
                  <Label htmlFor='date-debut'>
                    {{ main: 'Date de début', helpText: 'format : jj/mm/aaaa' }}
                  </Label>
                  {dateDebut.error && (
                    <InputError id='date-debut--error' className='mb-2'>
                      {dateDebut.error}
                    </InputError>
                  )}
                  <Input
                    type='date'
                    id='date-debut'
                    required={true}
                    defaultValue={dateDebut.value}
                    onChange={(value: string) => setDateDebut({ value })}
                    onBlur={validerDateDebut}
                    invalid={Boolean(dateDebut.error)}
                  />
                </div>
                <div className='flex-1'>
                  <Label htmlFor='date-fin'>
                    {{ main: 'Date de fin', helpText: 'format : jj/mm/aaaa' }}
                  </Label>
                  {dateFin.error && (
                    <InputError id={'date-fin--error'} className='mb-2'>
                      {dateFin.error}
                    </InputError>
                  )}
                  <Input
                    type='date'
                    id='date-fin'
                    required={true}
                    defaultValue={dateFin.value}
                    onChange={(value: string) => setDateFin({ value })}
                    onBlur={validerDateFin}
                    invalid={Boolean(dateFin.error)}
                  />
                </div>
              </div>

              <Label htmlFor='message-important'>
                {{
                  main: 'Message',
                  helpText: `${MAX_INPUT_LENGTH} caractères maximum`,
                  precision:
                    'Si votre message contient un lien, n’hésitez pas à le raccourcir pour une meilleure lisibilité (avec par exemple https://urlr.me/ )',
                }}
              </Label>
              {message.error && (
                <InputError id={'message-important--error'} className='mb-2'>
                  {message.error}
                </InputError>
              )}
              <Textarea
                id='message-important'
                maxLength={MAX_INPUT_LENGTH}
                allowOverMax={true}
                onChange={(value: string) => setMessage({ value: value })}
                onBlur={validerTexte}
                defaultValue={message.value ?? ''}
                invalid={Boolean(message.error)}
              />

              <div className='flex justify-center'>
                {dateFinMessagePreRempliEstFuture && (
                  <Button
                    type='button'
                    style={ButtonStyle.SECONDARY}
                    onClick={onDeleteMessageImportant}
                    className='mr-3'
                  >
                    Désactiver le message
                  </Button>
                )}
                <Button type='submit' isLoading={messageImportantIsLoading}>
                  <IconComponent
                    name={IconName.Send}
                    focusable={false}
                    aria-hidden={true}
                  />
                  Envoyer
                </Button>
              </div>
            </div>
          </form>
        </>
      )}

      {succesEnvoiMessageImportant && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Check}
            className='mx-auto my-8 fill-success_darken w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <SuccessAlert label='Votre message a bien été diffusé à l’ensemble de vos bénéficiaires' />
        </div>
      )}

      {succesDesactivationMessageImportant && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Check}
            className='mx-auto my-8 fill-success_darken w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <SuccessAlert label='Votre message a bien été désactivé' />
        </div>
      )}
    </Modal>
  )
}
