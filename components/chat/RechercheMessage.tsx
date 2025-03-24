import React, {
  FormEvent,
  ForwardedRef,
  forwardRef,
  Fragment,
  useState,
} from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import DisplayMessageConseiller from 'components/chat/DisplayMessageConseiller'
import MessagesDuJour from 'components/chat/MessagesDuJour'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import { ValueWithError } from 'components/ValueWithError'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
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
  beneficiaireEtChat: BeneficiaireEtChat
  toggleAfficherRecherche: () => void
}
export function RechercheMessage({
  beneficiaireNomComplet,
  getConseillerNomComplet,
  beneficiaireEtChat,
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
        messageSelectionne={Boolean(messageSelectionne)}
        onFermerRecherche={toggleAfficherRecherche}
        onRetourMessage={() => setMessageSelectionne(undefined)}
      />

      {messageSelectionne && (
        <MessagesDuJour
          beneficiaireEtChat={beneficiaireEtChat}
          messageSelectionne={messageSelectionne}
          beneficiaireNomComplet={beneficiaireNomComplet}
          getConseillerNomComplet={getConseillerNomComplet}
          idConseiller={conseiller.id}
        />
      )}

      {!messageSelectionne && (
        <>
          <RechercheMessageForm
            ref={!resultatsRecherche ? (e) => e?.focus() : undefined}
            idJeuneChat={beneficiaireEtChat.id}
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
  messageSelectionne: boolean
  onFermerRecherche: () => void
  onRetourMessage: () => void
}) {
  return (
    <button
      id='chat-bouton-retour'
      className='m-4 border-none rounded-large bg-primary-lighten flex items-center text-content hover:text-primary focus:pr-2'
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

const RechercheMessageForm = forwardRef(
  (
    {
      idJeuneChat,
      onResultat,
    }: {
      idJeuneChat: string
      onResultat: (
        messages: Array<{ message: Message; matches: MessageRechercheMatch[] }>
      ) => void
    },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const chatCredentials = useChatCredentials()

    const [rechercheMessage, setRechercheMessage] =
      useState<ValueWithError<string | undefined>>()
    const [rechercheEnCours, setRechercheEnCours] = useState<boolean>(false)

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

      setRechercheEnCours(true)
      try {
        const resultats = await rechercherMessagesConversation(
          idJeuneChat,
          rechercheMessage.value,
          chatCredentials.cleChiffrement
        )
        onResultat(resultats)
      } finally {
        setRechercheEnCours(false)
      }
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
          ref={ref}
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
          isLoading={rechercheEnCours}
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
)
RechercheMessageForm.displayName = 'RechercheMessageForm'

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
      <p
        ref={(e) => e?.focus()}
        tabIndex={-1}
        className='text-base-bold text-center mb-2'
      >
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
            className='mx-auto w-[200px] h-[200px] [--secondary-fill:var(--color-white)]'
          />
          <span className='sr-only'>
            Aucun résultat trouvé pour cette recherche
          </span>
        </p>
      )}
    </>
  )
}
