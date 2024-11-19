import React, { useRef, useState } from 'react'

import Details from 'components/Details'
import Button from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import Textarea from 'components/ui/Form/Textarea'
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
  const chatCredentials = useChatCredentials()
  const detailsRef = useRef<{ focusSummary: () => void }>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
      inputRef.current!.value = ''
    } catch {
      setSuccesEnvoi(false)
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <Details summary='Commentaire' ref={detailsRef}>
      {succesEnvoi && (
        <SuccessAlert
          label='Votre message a bien été envoyé, retrouvez le dans votre conversation avec le bénéficiaire.'
          onAcknowledge={() => {
            setSuccesEnvoi(undefined)
            detailsRef.current!.focusSummary()
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
        ref={inputRef}
        id='commentaire-action'
        onChange={(value) => setMessage({ value })}
        invalid={Boolean(message.error)}
        required
      />

      {succesEnvoi === false && (
        <InputError id='envoi-button--error' ref={(e) => e?.focus()}>
          Erreur lors de l’envoi du message, veuillez réessayer plus tard.
        </InputError>
      )}

      <Button
        type='button'
        className='block ml-auto'
        onClick={commenterAction}
        isLoading={envoiEnCours}
        describedBy={succesEnvoi === false ? 'envoi-button--error' : undefined}
        disabled={!message.value}
      >
        Envoyer au bénéficiaire
      </Button>
    </Details>
  )
}
