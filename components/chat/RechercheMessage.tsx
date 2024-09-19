import React, { FormEvent, Fragment, useEffect, useRef, useState } from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import DisplayMessageConseiller from 'components/chat/DisplayMessageConseiller'
import MessagesDuJour from 'components/chat/MessagesDuJour'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import { ValueWithError } from 'components/ValueWithError'
import { BeneficiaireChat } from 'interfaces/beneficiaire'
import {
  fromConseiller,
  Message,
  MessageRechercheMatch,
} from 'interfaces/message'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

type RechercheMessageProps = {
  beneficiaireNomComplet: string
  getConseillerNomComplet: (message: Message) => string | undefined
  beneficiaireChat: BeneficiaireChat
  toggleAfficherRecherche: () => void
}
export function RechercheMessage({
  beneficiaireNomComplet,
  getConseillerNomComplet,
  beneficiaireChat,
  toggleAfficherRecherche,
}: RechercheMessageProps) {
  const [conseiller] = useConseiller()

  const [resultatsRecherche, setResultatsRecherche] = useState<
    Array<{ message: Message; matches: MessageRechercheMatch[] }> | undefined
  >()
  const [messageSelectionne, setMessageSelectionne] = useState<
    Message | undefined
  >()

  return (
    <>
      <HeaderRechercheMessage
        messageSelectionne={messageSelectionne}
        onFermerRecherche={toggleAfficherRecherche}
        onRetourMessage={() => setMessageSelectionne(undefined)}
      />

      {messageSelectionne && (
        <MessagesDuJour
          conversation={beneficiaireChat}
          messageSelectionne={messageSelectionne}
          beneficiaireNomComplet={beneficiaireNomComplet}
          getConseillerNomComplet={getConseillerNomComplet}
          idConseiller={conseiller.id}
        />
      )}

      {!messageSelectionne && (
        <>
          <RechercheMessageForm
            idJeuneChat={beneficiaireChat.id}
            onResultat={setResultatsRecherche}
          />

          {resultatsRecherche && (
            <ResultatsRecherche
              resultatsRecherche={resultatsRecherche}
              beneficiaireNomComplet={beneficiaireNomComplet}
              getConseillerNomComplet={getConseillerNomComplet}
              idConseiller={conseiller.id}
              onSelectionnerMessage={setMessageSelectionne}
            />
          )}
        </>
      )}
    </>
  )
}

function HeaderRechercheMessage({
  messageSelectionne,
  onFermerRecherche,
  onRetourMessage,
}: {
  messageSelectionne?: Message
  onFermerRecherche: () => void
  onRetourMessage: () => void
}) {
  const ref = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (messageSelectionne) ref.current!.focus()
  }, [messageSelectionne])

  return (
    <button
      ref={ref}
      className='m-4 border-none rounded-full bg-primary_lighten flex items-center text-content hover:text-primary focus:pr-2'
      aria-label='Retourner à la discussion'
      onClick={messageSelectionne ? onRetourMessage : onFermerRecherche}
    >
      <IconComponent
        name={IconName.ArrowBackward}
        aria-hidden={true}
        focusable={false}
        className='w-5 h-5 fill-current mr-3'
      />
      <span className='text-s-regular underline'>
        Retour
        <span className='sr-only'>
          {messageSelectionne ? ' à la recherche' : ' à la conversation'}
        </span>
      </span>
    </button>
  )
}

function RechercheMessageForm({
  idJeuneChat,
  onResultat,
}: {
  idJeuneChat: string
  onResultat: (
    messages: Array<{ message: Message; matches: MessageRechercheMatch[] }>
  ) => void
}) {
  const chatCredentials = useChatCredentials()

  const [rechercheMessage, setRechercheMessage] =
    useState<ValueWithError<string | undefined>>()

  async function rechercherMessages(e: FormEvent) {
    e.preventDefault()
    if (!chatCredentials) return

    if (!rechercheMessage?.value) {
      setRechercheMessage({
        value: undefined,
        error: 'Le champ “Recherche" est vide. Renseignez une recherche.',
      })
      return
    }

    const { rechercherMessagesConversation } = await import(
      'services/messages.service'
    )

    const resultats = await rechercherMessagesConversation(
      idJeuneChat,
      rechercheMessage.value,
      chatCredentials.cleChiffrement
    )
    onResultat(resultats)
  }

  return (
    <form onSubmit={rechercherMessages} className='p-4'>
      <Label htmlFor='recherche-message' inputRequired={true}>
        Rechercher dans la conversation
      </Label>
      {rechercheMessage?.error && (
        <InputError id='recherche-message--error'>
          {rechercheMessage.error}
        </InputError>
      )}
      <Input
        id='recherche-message'
        type='text'
        required={true}
        invalid={Boolean(rechercheMessage?.error)}
        onChange={(value: string) => setRechercheMessage({ value })}
      />
      <Button
        style={ButtonStyle.PRIMARY}
        type='submit'
        label='Rechercher des messages'
        className='w-full'
      >
        <IconComponent
          name={IconName.Search}
          focusable={false}
          aria-hidden={true}
          className='w-4 h-4 mr-2'
        />
        Rechercher
      </Button>
    </form>
  )
}

function ResultatsRecherche({
  resultatsRecherche,
  beneficiaireNomComplet,
  idConseiller,
  getConseillerNomComplet,
  onSelectionnerMessage,
}: {
  resultatsRecherche: Array<{
    message: Message
    matches: MessageRechercheMatch[]
  }>
  beneficiaireNomComplet: string
  idConseiller: string
  getConseillerNomComplet: (message: Message) => string | undefined
  onSelectionnerMessage: (message: Message) => void
}) {
  return (
    <>
      <p className='text-base-bold text-center mb-2'>
        {resultatsRecherche.length}{' '}
        {resultatsRecherche.length > 1
          ? 'résultats trouvés'
          : 'résultat trouvé'}
      </p>
      {resultatsRecherche.length >= 1 && (
        <ul className='p-4 overflow-y-auto'>
          {resultatsRecherche.map(({ message, matches }, key) => (
            <Fragment key={key}>
              {!fromConseiller(message) && (
                <DisplayMessageBeneficiaire
                  message={message}
                  beneficiaireNomComplet={beneficiaireNomComplet}
                  estResultatDeRecherche={true}
                  onAllerAuMessage={() => onSelectionnerMessage(message)}
                  highlight={matches[0]}
                />
              )}

              {fromConseiller(message) && (
                <DisplayMessageConseiller
                  message={message}
                  conseillerNomComplet={getConseillerNomComplet(message)}
                  isConseillerCourant={message.conseillerId === idConseiller}
                  isEnCoursDeModification={false}
                  estResultatDeRecherche={true}
                  onAllerAuMessage={() => onSelectionnerMessage(message)}
                  highlight={matches[0]}
                />
              )}
            </Fragment>
          ))}
        </ul>
      )}

      {resultatsRecherche.length === 0 && (
        <p>
          <IllustrationComponent
            name={IllustrationName.Search}
            focusable={false}
            aria-hidden={true}
            className='mx-auto w-[200px] h-[200px] [--secondary-fill:theme(colors.white)]'
          />
          <span className='sr-only'>
            Aucun résultat trouvé pour cette recherche
          </span>
        </p>
      )}
    </>
  )
}
