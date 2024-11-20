import React, { FormEvent, Fragment, useEffect, useRef, useState } from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import DisplayMessageConseiller from 'components/chat/DisplayMessageConseiller'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BeneficiaireEtChat, Chat } from 'interfaces/beneficiaire'
import { fromConseiller, Message } from 'interfaces/message'
import {
  getMessagesDuMemeJour,
  modifierMessage as _modifierMessage,
  supprimerMessage as _supprimerMessage,
} from 'services/messages.service'
import { getPreviousItemId } from 'utils/algo'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toLongMonthDate, toShortDate } from 'utils/date'

export default function MessagesDuJour({
  beneficiaireEtChat,
  messageSelectionne,
  beneficiaireNomComplet,
  idConseiller,
  getConseillerNomComplet,
}: {
  beneficiaireEtChat: BeneficiaireEtChat
  messageSelectionne: Message
  beneficiaireNomComplet: string
  idConseiller: string
  getConseillerNomComplet: (message: Message) => string | undefined
}) {
  const chatCredentials = useChatCredentials()
  const [conseiller] = useConseiller()

  const [messagesDuJour, setMessagesDuJour] = useState<Message[]>([
    messageSelectionne,
  ])

  const [messageAModifier, setMessageAModifier] = useState<
    Message | undefined
  >()
  const [userInput, setUserInput] = useState<string>()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  async function modifierMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!messageAModifier || !userInput) return

    const messageModifie = await _modifierMessage(
      beneficiaireEtChat.chatId,
      messageAModifier,
      userInput,
      chatCredentials!.cleChiffrement
    )

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Message',
      action: 'Modification',
      nom: '',
      aDesBeneficiaires: true,
    })

    setMessagesDuJour((messages) => {
      const index = messages.findIndex(({ id }) => id === messageModifie.id)
      messages[index] = messageModifie
      return messages
    })
    setMessageAModifier(undefined)
  }

  async function supprimerMessage(messageASupprimer: Message) {
    const idMessageToFocus = getPreviousItemId(
      messageASupprimer.id,
      messagesDuJour
    )
    const messageSupprime = await _supprimerMessage(
      beneficiaireEtChat.chatId,
      messageASupprimer,
      chatCredentials!.cleChiffrement
    )

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Message',
      action: 'Suppression',
      nom: '',
      aDesBeneficiaires: true,
    })

    setMessagesDuJour((messages) => {
      const index = messages.findIndex(({ id }) => id === messageSupprime.id)
      messages[index] = messageSupprime
      return [...messages]
    })
    if (idMessageToFocus) {
      const messageToFocus = document.getElementById(
        `message-${idMessageToFocus}`
      )!
      messageToFocus.setAttribute('tabIndex', '-1')
      messageToFocus.focus()
    } else {
      document.getElementById('chat-bouton-retour')?.focus()
    }
  }

  useEffect(() => {
    if (!chatCredentials) return

    getMessagesDuMemeJour(
      beneficiaireEtChat,
      messageSelectionne,
      chatCredentials.cleChiffrement
    ).then(setMessagesDuJour)
  }, [chatCredentials])

  useEffect(() => {
    const messageToFocus = document.getElementById(
      `message-${messageSelectionne.id}`
    )!
    messageToFocus.setAttribute('tabIndex', '-1')
    messageToFocus.focus()
  }, [messagesDuJour])

  useEffect(() => {
    if (messageAModifier) {
      inputRef.current!.value = messageSelectionne.content
      setUserInput(messageSelectionne.content)
      inputRef.current!.focus()
    } else {
      setUserInput('')
    }
  }, [messageAModifier])

  return (
    <>
      <h2
        className='text-base-bold text-center mb-2'
        id='description-messages'
        aria-label={`Messages du ${toLongMonthDate(messageSelectionne.creationDate)}`}
      >
        Messages du {toShortDate(messageSelectionne.creationDate)}
      </h2>

      <ul
        className='p-4 overflow-y-auto'
        aria-describedby='description-messages'
      >
        {messagesDuJour.map((message, key) => (
          <Fragment key={key}>
            {!fromConseiller(message) && (
              <DisplayMessageBeneficiaire
                message={message}
                beneficiaireNomComplet={beneficiaireNomComplet}
              />
            )}

            {fromConseiller(message) && (
              <DisplayMessageConseiller
                message={message}
                conseillerNomComplet={getConseillerNomComplet(message)}
                isConseillerCourant={message.conseillerId === idConseiller}
                isEnCoursDeModification={false}
                lastSeenByJeune={beneficiaireEtChat.lastJeuneReading}
                onSuppression={() => supprimerMessage(message)}
                onModification={() => setMessageAModifier(message)}
              />
            )}
          </Fragment>
        ))}
      </ul>

      {messageAModifier && (
        <form onSubmit={modifierMessage} className='p-3'>
          <div className='grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-3'>
            <p className='self-center text-s-regular'>Modifier le message</p>
            <button
              type='button'
              onClick={() => {
                setMessageAModifier(undefined)
              }}
              title='Annuler la modification du message'
              className='w-12 h-12'
            >
              <span className='sr-only'>
                Annuler la modification du message
              </span>
              <IconComponent
                aria-hidden={true}
                focusable={false}
                name={IconName.Close}
                className='m-auto h-6 w-6'
              />
            </button>

            <label htmlFor='input-new-message' className='sr-only'>
              Message à envoyer
            </label>
            <textarea
              ref={inputRef}
              id='input-new-message'
              className='p-4 bg-white rounded-base border border-grey_700'
              onChange={(e) => setUserInput(e.target.value)}
              title='Écrivez votre message ici...'
              placeholder='Écrivez votre message ici...'
              rows={5}
            />
            <div className='relative'>
              <button
                type='submit'
                aria-label='Envoyer la modification du message'
                title='Envoyer la modification du message'
                disabled={!userInput}
                className='bg-primary w-12 h-12 border-none rounded-full disabled:bg-grey_500 disabled:cursor-not-allowed absolute bottom-0'
              >
                <IconComponent
                  name={IconName.Send}
                  aria-hidden={true}
                  focusable={false}
                  className='m-auto w-6 h-6 fill-white'
                />
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  )
}
