import { DateTime } from 'luxon'
import React, { FormEvent, MouseEvent, useRef, useState } from 'react'

import Modal from 'components/Modal'
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
import { toShortDate } from 'utils/date'

interface MessageImportantModalProps {
  messageImportantIsLoading: boolean
  messageImportantPreRempli: MessageImportantPreRempli | null
  onConfirmation: (
    message: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => void
  onCancel: () => void
  succesEnvoiMessageImportant?: boolean
}

export default function MessageImportantModal({
  messageImportantPreRempli,
  messageImportantIsLoading,
  succesEnvoiMessageImportant,
  onConfirmation,
  onCancel,
}: MessageImportantModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

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
    } else {
      const dateDebutFormate = DateTime.fromISO(dateDebut.value)
      const aujourdhui = DateTime.now().startOf('day')
      const troisAnsApres = aujourdhui.plus({ year: 3 })

      if (dateDebutFormate < aujourdhui || dateDebutFormate > troisAnsApres) {
        setDateDebut({
          ...dateDebut,
          error: `Le champ “Date de début” est invalide. La date de début attendue est comprise entre le ${toShortDate(aujourdhui)} et le ${toShortDate(troisAnsApres)}`,
        })
        return false
      }
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
      const aujourdhui = DateTime.now().startOf('day')
      const troisAnsApres = aujourdhui.plus({ year: 3 })

      if (dateFinFormate < aujourdhui || dateFinFormate > troisAnsApres) {
        setDateFin({
          ...dateFin,
          error: `Le champ “Date de fin” est invalide. La date de fin attendue est comprise entre le ${toShortDate(aujourdhui)} et le ${toShortDate(troisAnsApres)}`,
        })
        return false
      }

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
    if (message.value && message.value.length > 150) {
      setMessage({
        value: message.value,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.',
      })
      return false
    }
    return true
  }

  function validateFormulaire(e: FormEvent) {
    e.preventDefault()
    const dateDebutEstValide = validerDateDebut()
    const dateFinEstValide = validerDateFin()
    const messageEstValide = validerTexte()

    if (dateDebutEstValide && dateFinEstValide && messageEstValide) {
      const debut = DateTime.fromISO(dateDebut.value!)
      const fin = DateTime.fromISO(dateFin.value!)
      onConfirmation(message.value!, debut, fin)
    }
  }

  return (
    <Modal
      title='Configurer un message important'
      onClose={onCancel}
      ref={modalRef}
    >
      {!succesEnvoiMessageImportant && (
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
          <form onSubmit={validateFormulaire}>
            <div className='mt-4 flex flex-col justify-center'>
              <div className='flex gap-2 mb-4 items-end'>
                <div className='w-1/2'>
                  {dateDebut.error && (
                    <InputError id='date-debut--error' className='my-2'>
                      {dateDebut.error}
                    </InputError>
                  )}

                  <Label htmlFor='date-debut'>Date de début</Label>
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
                <div className='w-1/2'>
                  {dateFin.error && (
                    <InputError id={'date-fin--error'} className='my-2'>
                      {dateFin.error}
                    </InputError>
                  )}

                  <Label htmlFor='date-fin'>Date de fin</Label>
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

              {message.error && (
                <InputError id={'message--error'} className='my-2'>
                  {message.error}
                </InputError>
              )}

              <Label htmlFor='message-important'>
                {{
                  main: 'Message',
                  helpText: '150 caractères maximum',
                }}
              </Label>
              <Textarea
                id='message-important'
                maxLength={150}
                allowOverMax={true}
                onChange={(value: string) => setMessage({ value: value })}
                onBlur={validerTexte}
                defaultValue={message.value ?? ''}
              />

              <div className='flex justify-center'>
                <Button
                  type='button'
                  style={ButtonStyle.SECONDARY}
                  onClick={(e) => modalRef.current!.closeModal(e)}
                  className='mr-3'
                >
                  Annuler
                </Button>
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
    </Modal>
  )
}
