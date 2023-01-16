import { DateTime } from 'luxon'
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import DisplayMessage from 'components/chat/DisplayMessage'
import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'
import FileInput from 'components/ui/Form/FileInput'
import { InputError } from 'components/ui/Form/InputError'
import ResizingMultilineInput from 'components/ui/Form/ResizingMultilineInput'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { InfoFichier } from 'interfaces/fichier'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { Message, ByDay } from 'interfaces/message'
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

  const observerMessages = useCallback(
    (idChatToObserve: string) => {
      if (!chatCredentials) return () => {}

      return messagesService.observeMessages(
        idChatToObserve,
        chatCredentials.cleChiffrement,
        (messagesGroupesParJour: ByDay<Message>[]) => {
          setMessagesByDay(messagesGroupesParJour)

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
    const unsubscribe = observerMessages(jeuneChat.chatId)
    setReadByConseiller(jeuneChat.chatId)

    return () => unsubscribe()
  }, [jeuneChat.chatId, observerMessages, setReadByConseiller])

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
          <ul>
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
                    className='w-6 h-6 ml-2'
                  />
                </button>
              </div>
            )}

            <label htmlFor='input-new-message' className='sr-only'>
              Message à envoyer
            </label>
            <ResizingMultilineInput
              inputRef={inputRef}
              id='input-new-message'
              className='w-full outline-none'
              onFocus={() => setReadByConseiller(jeuneChat.chatId)}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Écrivez votre message ici...'
              minRows={3}
              maxRows={7}
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
