import { DateTime } from 'luxon'
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import DisplayMessage from 'components/chat/DisplayMessage'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'
import FileInput from 'components/ui/Form/FileInput'
import { InputError } from 'components/ui/Form/InputError'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { InfoFichier } from 'interfaces/fichier'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { ByDay, Message } from 'interfaces/message'
import { FichiersService } from 'services/fichiers.service'
import {
  FormNouveauMessageIndividuel,
  MessagesService,
} from 'services/messages.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { dateIsToday, toShortDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

type ConversationProps = {
  conseillers: ConseillerHistorique[]
  jeuneChat: JeuneChat
  onBack: () => void
}

export default function Conversation({
  jeuneChat,
  conseillers,
  onBack,
}: ConversationProps) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const fichiersService = useDependance<FichiersService>('fichiersService')
  const [chatCredentials] = useChatCredentials()
  const [conseiller] = useConseiller()

  const [newMessage, setNewMessage] = useState('')
  const [messagesByDay, setMessagesByDay] = useState<ByDay<Message>[]>()
  const [uploadedFileInfo, setUploadedFileInfo] = useState<
    InfoFichier | undefined
  >(undefined)
  const [uploadedFileError, setUploadedFileError] = useState<
    string | undefined
  >(undefined)
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false)

  const [lastSeenByJeune, setLastSeenByJeune] = useState<DateTime | undefined>(
    undefined
  )

  const [nombrePagesChargees, setNombrePagesChargees] = useState<number>(1)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState<boolean>(false)
  const [hasNoMoreMessages, setHasNoMoreMessages] = useState<boolean>(false)
  const unsubscribeFromMessages = useRef<() => void>(() => undefined)

  const conteneurMessagesRef = useRef<HTMLUListElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  function displayDate(date: DateTime) {
    return dateIsToday(date) ? "Aujourd'hui" : `Le ${toShortDate(date)}`
  }

  async function sendNouveauMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!(newMessage || Boolean(uploadedFileInfo)) || isFileUploading) return

    const formNouveauMessage: FormNouveauMessageIndividuel = {
      jeuneChat,
      newMessage:
        newMessage ||
        'Votre conseiller vous a transmis une nouvelle pièce jointe : ',
      cleChiffrement: chatCredentials!.cleChiffrement,
    }

    if (uploadedFileInfo) formNouveauMessage.infoPieceJointe = uploadedFileInfo

    messagesService.sendNouveauMessage(formNouveauMessage)

    setUploadedFileInfo(undefined)
    inputRef.current!.value = ''
    setNewMessage('')
  }

  function getConseillerNomComplet(message: Message) {
    const conseillerTrouve = conseillers.find(
      (c) => c.id === message.conseillerId
    )
    if (conseillerTrouve) {
      return `${conseillerTrouve?.prenom.toLowerCase()} ${conseillerTrouve?.nom.toLowerCase()}`
    }
  }

  const setReadByConseiller = useCallback(
    (idChatToUpdate: string) => {
      messagesService.setReadByConseiller(idChatToUpdate)
    },
    [messagesService]
  )

  function chargerPlusDeMessages() {
    const pageSuivante = nombrePagesChargees + 1
    setLoadingMoreMessages(true)
    unsubscribeFromMessages.current()
    unsubscribeFromMessages.current = observerMessages(
      jeuneChat.chatId,
      pageSuivante
    )
    setNombrePagesChargees(pageSuivante)
  }

  const observerMessages = useCallback(
    (idChatToObserve: string, nombreDePages: number) => {
      if (!chatCredentials) return () => {}

      return messagesService.observeDerniersMessages(
        idChatToObserve,
        chatCredentials.cleChiffrement,
        nombreDePages,
        (messagesGroupesParJour: ByDay<Message>[]) => {
          setMessagesByDay((previousValue) => {
            if (
              previousValue &&
              previousValue[0].messages[0].id ===
                messagesGroupesParJour[0].messages[0].id
            ) {
              setHasNoMoreMessages(true)
            }
            return messagesGroupesParJour
          })
          setLoadingMoreMessages(false)

          if (document.activeElement === inputRef.current) {
            setReadByConseiller(idChatToObserve)
          }
        }
      )
    },
    [chatCredentials, messagesService, setReadByConseiller]
  )

  const observerLastJeuneReadingDate = useCallback(
    (idChatToObserve: string) => {
      return messagesService.observeJeuneReadingDate(
        idChatToObserve,
        setLastSeenByJeune
      )
    },
    [messagesService]
  )

  async function uploadFichier(fichierSelectionne: File) {
    setUploadedFileError(undefined)

    try {
      setIsFileUploading(true)
      const infoFichier = await fichiersService.uploadFichier(
        [jeuneChat.id],
        [],
        fichierSelectionne
      )
      setUploadedFileInfo(infoFichier)
    } catch (error) {
      setUploadedFileError((error as Error).message)
    } finally {
      setIsFileUploading(false)
    }
  }

  async function deleteFile() {
    setUploadedFileInfo(undefined)
    await fichiersService.deleteFichier(uploadedFileInfo!.id)
  }

  async function toggleFlag() {
    const flagged = !jeuneChat.flaggedByConseiller
    messagesService.toggleFlag(jeuneChat.chatId, flagged)
    trackEvent({
      structure: conseiller!.structure,
      categorie: 'Conversation suivie',
      action: 'Conversation',
      nom: flagged.toString(),
    })
  }

  useEffect(() => {
    unsubscribeFromMessages.current = observerMessages(jeuneChat.chatId, 1)
    setReadByConseiller(jeuneChat.chatId)

    return unsubscribeFromMessages.current
  }, [jeuneChat.chatId, observerMessages, setReadByConseiller])

  useEffect(() => {
    if (messagesByDay?.length && nombrePagesChargees === 1) {
      conteneurMessagesRef
        .current!.lastElementChild!.querySelector('li:last-child')
        ?.scrollIntoView({
          behavior: 'smooth',
        })
    }
  }, [messagesByDay, nombrePagesChargees])

  useEffect(() => {
    const unsubscribe = observerLastJeuneReadingDate(jeuneChat.chatId)
    return () => unsubscribe()
  }, [jeuneChat.chatId, observerLastJeuneReadingDate])

  useEffect(() => {
    if (uploadedFileInfo) {
      deleteFile()
    }
    inputRef.current!.value = ''
    setNewMessage('')
  }, [jeuneChat.chatId])

  return (
    <div className='h-full flex flex-col bg-grey_100 '>
      <div className='flex items-center mx-4 pb-6 my-6 border-b border-grey_500 short:hidden'>
        <button
          className='p-3 border-none rounded-full mr-2 bg-primary_lighten'
          onClick={onBack}
        >
          <IconComponent
            name={IconName.ChevronLeft}
            role='img'
            focusable='false'
            aria-label='Retour sur ma messagerie'
            className='w-6 h-6 fill-primary'
          />
        </button>
        <h2 className='w-full text-left text-primary text-l-bold'>
          Discuter avec {jeuneChat.nom} {jeuneChat.prenom}
        </h2>
        <button
          aria-label={
            jeuneChat.flaggedByConseiller
              ? 'Ne plus suivre la conversation'
              : 'Suivre la conversation'
          }
          className='p-3 border-none rounded-full mr-2 bg-primary_lighten'
          onClick={toggleFlag}
        >
          {jeuneChat.flaggedByConseiller && (
            <IconComponent
              name={IconName.FlagFilled}
              title='Ne plus suivre la conversation'
              className='w-6 h-6 fill-primary'
            />
          )}
          {!jeuneChat.flaggedByConseiller && (
            <IconComponent
              name={IconName.Flag}
              title='Suivre la conversation'
              className='w-6 h-6 fill-primary'
            />
          )}
        </button>
      </div>

      <div
        className='p-4 grow overflow-y-auto short:hidden'
        aria-live='polite'
        aria-busy={!messagesByDay}
      >
        {!messagesByDay && <SpinningLoader />}

        {messagesByDay && (
          <>
            {hasNoMoreMessages && (
              <span
                id='no-more-messages'
                className='text-xs-regular text-center block'
              >
                Aucun message plus ancien
              </span>
            )}
            <Button
              onClick={chargerPlusDeMessages}
              style={ButtonStyle.TERTIARY}
              className='mx-auto mb-3'
              isLoading={loadingMoreMessages}
              disabled={hasNoMoreMessages}
              describedBy='no-more-messages'
            >
              <IconComponent
                name={IconName.ChevronUp}
                aria-hidden={true}
                focusable={false}
                className='w-4 h-4 fill-[currentColor] mr-2'
              />
              Voir messages plus anciens
            </Button>

            <ul ref={conteneurMessagesRef}>
              {messagesByDay.map((messagesOfADay: ByDay<Message>) => (
                <li key={messagesOfADay.date.toMillis()} className='mb-5'>
                  <div className='text-base-regular text-center mb-3'>
                    <span>{displayDate(messagesOfADay.date)}</span>
                  </div>

                  <ul>
                    {messagesOfADay.messages.map((message: Message) => (
                      <DisplayMessage
                        key={message.id}
                        message={message}
                        conseillerNomComplet={getConseillerNomComplet(message)}
                        lastSeenByJeune={lastSeenByJeune}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <form onSubmit={sendNouveauMessage} className='p-3'>
        {uploadedFileError && (
          <InputError id='piece-jointe--error'>{uploadedFileError}</InputError>
        )}
        <div className='grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-y-3 gap-x-1'>
          <span
            id='piece-jointe--desc'
            className='self-center text-xs-regular short:hidden'
          >
            Formats acceptés de pièce jointe : .PDF, .JPG, .JPEG, .PNG (5 Mo
            maximum)
          </span>

          <FileInput
            id='piece-jointe'
            ariaDescribedby='piece-jointe--desc'
            onChange={uploadFichier}
            isLoading={isFileUploading}
            disabled={Boolean(uploadedFileInfo)}
            iconOnly={true}
          />

          <div
            className='p-4 bg-blanc rounded-base border text-base-bold border-primary focus-within:outline focus-within:outline-1'
            onClick={() => inputRef.current!.focus()}
          >
            {uploadedFileInfo && (
              <div className='flex px-2 py-1 rounded-base bg-primary_lighten w-fit mb-4'>
                <span className='break-all overflow-y-auto max-h-56'>
                  {uploadedFileInfo.nom}
                </span>
                <button
                  type='button'
                  aria-label={
                    'Supprimer la pièce jointe ' + uploadedFileInfo.nom
                  }
                  onClick={deleteFile}
                >
                  <IconComponent
                    name={IconName.RoundedClose}
                    aria-hidden='true'
                    focusable='false'
                    className='w-6 h-6 ml-2 fill-primary stroke-primary'
                  />
                </button>
              </div>
            )}

            <label htmlFor='input-new-message' className='sr-only'>
              Message à envoyer
            </label>
            <textarea
              ref={inputRef}
              id='input-new-message'
              className='w-full outline-none'
              onFocus={() => setReadByConseiller(jeuneChat.chatId)}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Écrivez votre message ici...'
              rows={5}
            />
          </div>
          <div>
            <button
              type='submit'
              aria-label='Envoyer le message'
              disabled={!newMessage && !Boolean(uploadedFileInfo)}
              className='bg-primary w-12 h-12 border-none rounded-full disabled:bg-grey_500 disabled:cursor-not-allowed'
            >
              <IconComponent
                name={IconName.Send}
                aria-hidden='true'
                focusable='false'
                className='m-auto w-6 h-6 fill-blanc'
              />
            </button>
            <span className='flex justify-center mt-3'>
              <BulleMessageSensible />
            </span>
          </div>
        </div>
      </form>
    </div>
  )
}
