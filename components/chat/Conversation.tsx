import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import DisplayMessage from 'components/chat/DisplayMessage'
import BulleMessageSensible from 'components/ui/BulleMessageSensible'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InputError } from 'components/ui/InputError'
import ResizingMultilineInput from 'components/ui/ResizingMultilineInput'
import { InfoFichier } from 'interfaces/fichier'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { Message, MessagesOfADay } from 'interfaces/message'
import { FichiersService } from 'services/fichiers.service'
import {
  FormNouveauMessageIndividuel,
  MessagesService,
} from 'services/messages.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { dateIsToday, formatDayDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

const todayOrDate = (date: Date) =>
  dateIsToday(date) ? "Aujourd'hui" : `Le ${formatDayDate(date)}`

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
  const [chatCredentials] = useChatCredentials()
  const messagesService = useDependance<MessagesService>('messagesService')
  const fichiersService = useDependance<FichiersService>('fichiersService')
  const [conseiller] = useConseiller()

  const [newMessage, setNewMessage] = useState('')
  const [messagesByDay, setMessagesByDay] = useState<MessagesOfADay[]>([])
  const [uploadedFileInfo, setUploadedFileInfo] = useState<
    InfoFichier | undefined
  >(undefined)
  const [uploadedFileError, setUploadedFileError] = useState<
    string | undefined
  >(undefined)
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false)

  const [lastSeenByJeune, setLastSeenByJeune] = useState<Date | undefined>(
    undefined
  )
  const hiddenFileInput = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

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
        (messagesGroupesParJour: MessagesOfADay[]) => {
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

  function handleFileUploadClick() {
    hiddenFileInput.current!.click()
  }

  async function handleFileUploadChange(event: ChangeEvent<HTMLInputElement>) {
    setUploadedFileError(undefined)
    if (!event.target.files || !event.target.files[0]) return

    const fichierSelectionne = event.target.files[0]
    try {
      setIsFileUploading(true)
      const infoFichier = await fichiersService.uploadFichier(
        [jeuneChat.id],
        fichierSelectionne
      )
      setUploadedFileInfo(infoFichier)
    } catch (error) {
      setUploadedFileError((error as Error).message)
    } finally {
      hiddenFileInput.current!.value = ''
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
      <div className='flex items-center mx-4 my-6 short:hidden'>
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
        <h2 className='w-full text-left text-primary w-text-m-bold'>
          Discuter avec {jeuneChat.nom} {jeuneChat.prenom}
        </h2>
        <button
          aria-label={
            jeuneChat.flaggedByConseiller
              ? 'Ne plus suivre la conversation'
              : 'Suivre la conversation'
          }
          title={
            jeuneChat.flaggedByConseiller
              ? 'Ne plus suivre la conversation'
              : 'Suivre la conversation'
          }
          className='p-3 border-none rounded-full mr-2 bg-primary_lighten'
          onClick={toggleFlag}
        >
          <IconComponent
            name={
              jeuneChat.flaggedByConseiller
                ? IconName.FlagFilled
                : IconName.Flag
            }
            className='w-6 h-6 fill-primary'
          />
        </button>
      </div>
      <span className='border-b border-grey_500 mx-4 mb-6 short:hidden' />

      <ul className='p-4 flex-grow overflow-y-auto short:hidden'>
        {messagesByDay.map((messagesOfADay: MessagesOfADay) => (
          <li key={messagesOfADay.date.getTime()} className='mb-5'>
            <div className={`text-md text-center mb-3`}>
              <span>{todayOrDate(messagesOfADay.date)}</span>
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

      <form onSubmit={sendNouveauMessage} className='p-3'>
        {uploadedFileError && (
          <InputError id='piece-jointe--error'>{uploadedFileError}</InputError>
        )}
        <div className='grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-y-3 gap-x-1'>
          <span
            id='piece-jointe--desc'
            className='self-center text-xs short:hidden'
          >
            Formats acceptés de pièce jointe : .PDF, .JPG, .JPEG, .PNG (5 Mo
            maximum)
          </span>
          <button
            type='button'
            aria-controls='piece-jointe'
            aria-describedby='piece-jointe--desc'
            className='bg-primary w-12 h-12 border-none rounded-[50%] disabled:bg-grey_500 disabled:cursor-not-allowed short:hidden'
            onClick={handleFileUploadClick}
            disabled={Boolean(uploadedFileInfo) || isFileUploading}
          >
            <IconComponent
              name={isFileUploading ? IconName.Spinner : IconName.File}
              aria-hidden='true'
              focusable='false'
              className={`m-auto w-6 h-6 fill-blanc ${
                isFileUploading ? 'animate-spin' : ''
              }`}
            />
            <label htmlFor='piece-jointe' className='sr-only'>
              Attacher une pièce jointe
            </label>
            <input
              id='piece-jointe'
              type='file'
              aria-describedby={
                uploadedFileError ? 'piece-jointe--error' : undefined
              }
              aria-invalid={uploadedFileError ? true : undefined}
              ref={hiddenFileInput}
              onChange={handleFileUploadChange}
              className='hidden'
              accept='.pdf, .png, .jpeg, .jpg'
            />
          </button>

          <div
            className='p-4 bg-blanc rounded-x_large border text-md border-primary focus-within:outline focus-within:outline-1'
            onClick={() => inputRef.current!.focus()}
          >
            {uploadedFileInfo && (
              <div className='flex px-2 py-1 rounded-medium bg-primary_lighten w-fit mb-4'>
                <span className='font-bold break-words'>
                  {uploadedFileInfo.nom}
                </span>
                <button
                  type='button'
                  aria-label='Supprimer la pièce jointe'
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
              className='bg-primary w-12 h-12 border-none rounded-[50%] disabled:bg-grey_500 disabled:cursor-not-allowed'
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
