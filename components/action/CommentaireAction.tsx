import React, { useRef, useState } from 'react'

import Button from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import { ValueWithError } from 'components/ValueWithError'
import { Action } from 'interfaces/action'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { commenterAction as _commenterAction } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'

interface CommentaireActionProps {
  beneficiaire: BaseBeneficiaire
  action: Action
}

export default function CommentaireAction({
  beneficiaire,
  action,
}: CommentaireActionProps) {
  const expandButtonRef = useRef<HTMLButtonElement>(null)

  const chatCredentials = useChatCredentials()

  const [expanded, setExpanded] = useState<boolean>(false)
  const [message, setMessage] = useState<ValueWithError<string | undefined>>({
    value: undefined,
  })
  const [envoiEnCours, setEnvoiEnCours] = useState<boolean>(false)
  const [succesEnvoi, setSuccesEnvoi] = useState<boolean | undefined>(undefined)

  async function commenterAction() {
    setSuccesEnvoi(undefined)
    if (!message.value) {
      setMessage({
        ...message,
        error: 'Veuillez saisir un message à envoyer au bénéficiaire.',
      })
      return
    }

    try {
      setEnvoiEnCours(true)
      await _commenterAction({
        idDestinataire: beneficiaire.id,
        action,
        message: message.value,
        cleChiffrement: chatCredentials!.cleChiffrement,
      })
      setSuccesEnvoi(true)
    } catch {
      setSuccesEnvoi(false)
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <div
      role='group'
      aria-labelledby='commentaire-legend'
      className='bg-primary_lighten p-6 mt-8 rounded-base shadow-base'
    >
      <div
        id='commentaire-legend'
        className={`relative flex justify-between items-center cursor-pointer ${
          expanded ? 'mb-4' : ''
        }`}
      >
        <h2 className='text-m-bold text-primary'>Commentaire</h2>
        <button
          ref={expandButtonRef}
          type='button'
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className='hover:bg-white hover:rounded-l before:absolute before:inset-0 before:z-10'
        >
          <IconComponent
            name={expanded ? IconName.ChevronUp : IconName.ChevronDown}
            title={`${expanded ? 'Cacher' : 'Voir'} le commentaire`}
            className='h-6 w-6 fill-primary'
            focusable={false}
            aria-hidden={true}
          />
          <span className='sr-only'>
            {expanded ? 'Cacher' : 'Voir'} le commentaire
          </span>
        </button>
      </div>

      {expanded && (
        <>
          {succesEnvoi && (
            <SuccessAlert
              label='Votre message a bien été envoyé, retrouvez le dans votre conversation avec le bénéficiaire.'
              onAcknowledge={() => {
                setSuccesEnvoi(undefined)
                expandButtonRef.current!.focus()
              }}
            />
          )}

          <label htmlFor='commentaire-action' className='text-s-regular mb-3'>
            Demander plus d’information au bénéficiaire sur l’action
          </label>
          {message.error && (
            <InputError id='commentaire-action--error' ref={(e) => e?.focus()}>
              {message.error}
            </InputError>
          )}
          <Textarea
            id='commentaire-action'
            onChange={(value) => setMessage({ value })}
            invalid={Boolean(message.error)}
            required
          />

          {succesEnvoi === false && (
            <InputError id='envoi-button--error' ref={(e) => e?.focus()}>
              Erreur lors de l’envoie du message, veuillez réessayer plus tard.
            </InputError>
          )}

          <Button
            type='button'
            className='block ml-auto'
            onClick={commenterAction}
            isLoading={envoiEnCours}
            describedBy={
              succesEnvoi === false ? 'envoi-button--error' : undefined
            }
          >
            Envoyer au bénéficiaire
          </Button>
        </>
      )}
    </div>
  )
}
