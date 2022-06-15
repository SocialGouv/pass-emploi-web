import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { InputError } from './ui/InputError'

import FileIcon from 'assets/icons/attach_file.svg'
import DisplayMessage from 'components/DisplayMessage'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ResizingMultilineInput from 'components/ui/ResizingMultilineInput'
import { InfoFichier } from 'interfaces/fichier'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { Message, MessagesOfADay } from 'interfaces/message'
import { FichiersService } from 'services/fichiers.service'
import { FormNouveauMessage, MessagesService } from 'services/messages.service'
import useSession from 'utils/auth/useSession'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
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
  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials] = useChatCredentials()
  const messagesService = useDependance<MessagesService>('messagesService')
  const fichiersService = useDependance<FichiersService>('fichiersService')

  const [newMessage, setNewMessage] = useState('')
  const [messagesByDay, setMessagesByDay] = useState<MessagesOfADay[]>([])
  const [uploadedFileInfo, setUploadedFileInfo] = useState<
    InfoFichier | undefined
  >(undefined)
  const [uploadedFileError, setUploadedFileError] = useState<
    string | undefined
  >(undefined)

  const [lastSeenByJeune, setLastSeenByJeune] = useState<Date | undefined>(
    undefined
  )
  const inputFocused = useRef<boolean>(false)
  const hiddenFileInput = useRef<HTMLInputElement>(null)

  function onInputFocused() {
    inputFocused.current = true
    setReadByConseiller(jeuneChat.chatId)
  }

  async function sendNouveauMessage(event: any) {
    event.preventDefault()
    if (!newMessage && !Boolean(uploadedFileInfo)) return

    const formNouveauMessage: FormNouveauMessage = {
      conseiller: {
        id: session!.user.id,
        structure: session!.user.structure,
      },
      jeuneChat,
      newMessage:
        newMessage ||
        'Votre conseiller vous a transmis une nouvelle pièce jointe : ',
      accessToken: session!.accessToken,
      cleChiffrement: chatCredentials!.cleChiffrement,
    }

    if (uploadedFileInfo) formNouveauMessage.infoPieceJointe = uploadedFileInfo

    messagesService.sendNouveauMessage(formNouveauMessage)

    setUploadedFileInfo(undefined)
    setNewMessage('')
  }

  function getConseillerNomComplet(message: Message) {
    const conseiller = conseillers.find((c) => c.id === message.conseillerId)
    if (conseiller) {
      return `${conseiller?.prenom.toLowerCase()} ${conseiller?.nom.toLowerCase()}`
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

          if (inputFocused.current) {
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
      const infoFichier = await fichiersService.uploadFichier(
        [jeuneChat.id],
        fichierSelectionne,
        session!.accessToken
      )
      setUploadedFileInfo(infoFichier)
    } catch (error) {
      setUploadedFileError((error as Error).message)
    }
  }

  async function handleFileDeleteClick() {
    await fichiersService.deleteFichier(
      uploadedFileInfo!.id,
      session!.accessToken
    )
    setUploadedFileInfo(undefined)
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

  return (
    <div className='h-full flex flex-col bg-grey_100'>
      <div className='flex items-center mx-4 my-6'>
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
        <h2 className='w-full text-center text-primary text-m-medium'>
          Discuter avec
          <br />
          {jeuneChat.firstName} {jeuneChat.lastName}
        </h2>
      </div>
      <span className='border-b border-grey_500 mx-4 mb-6'></span>

      <ul className='p-4 flex-grow overflow-y-auto'>
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

      <form
        data-testid='newMessageForm'
        onSubmit={sendNouveauMessage}
        className='p-3'
      >
        {uploadedFileInfo && (
          <div className='pb-3 flex flex-row'>
            <FileIcon
              aria-hidden='true'
              focusable='false'
              className='w-6 h-6'
            />
            <span className='font-bold break-words'>
              {uploadedFileInfo.nom}
            </span>
            <button
              type='button'
              aria-label='Supprimer la pièce jointe'
              onClick={handleFileDeleteClick}
            >
              <IconComponent
                name={IconName.RoundedClose}
                aria-hidden='false'
                focusable='false'
                className='w-6 h-6 ml-2'
              />
            </button>
          </div>
        )}
        {uploadedFileError && (
          <InputError id='piece-jointe--error' className='mb-3'>
            {uploadedFileError}
          </InputError>
        )}
        <div className='w-full bg-grey_100  flex items-end'>
          <div className='flex flex-col w-full'>
            <label htmlFor='input-new-message' className='sr-only'>
              Message à envoyer
            </label>
            <ResizingMultilineInput
              id='input-new-message'
              className='flex-grow p-4 bg-blanc mr-2 rounded-x_large border-0 text-md border-none'
              onFocus={onInputFocused}
              onBlur={() => (inputFocused.current = false)}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Écrivez votre message ici...'
              minRows={3}
              maxRows={7}
            />
            <span className='px-4 pt-2 text-xs'>
              Formats acceptés de pièce jointe : .PDF, .JPG, .PNG (5 Mo maximum)
            </span>
          </div>
          <div className='flex flex-col'>
            <button
              type='submit'
              aria-label='Envoyer le message'
              disabled={!newMessage && !Boolean(uploadedFileInfo)}
              className='bg-primary w-12 h-12 border-none rounded-[50%] shrink-0 mb-3 disabled:bg-grey_500 disabled:cursor-not-allowed'
            >
              <IconComponent
                name={IconName.Send}
                aria-hidden='true'
                focusable='false'
                className='m-auto w-6 h-6 fill-blanc'
              />
            </button>

            <button
              type='button'
              aria-controls='piece-jointe'
              className='bg-primary w-12 h-12 border-none rounded-[50%] shrink-0 mb-3 disabled:bg-grey_500 disabled:cursor-not-allowed'
              onClick={handleFileUploadClick}
              disabled={Boolean(uploadedFileInfo)}
            >
              <IconComponent
                name={IconName.File}
                aria-hidden='true'
                focusable='false'
                className='m-auto w-6 h-6 fill-blanc'
              />
              <label htmlFor='piece-jointe' className='sr-only'>
                Attacher une pièce jointe
              </label>
              <input
                id='piece-jointe'
                type='file'
                aria-describedby={
                  uploadedFileError ? 'piece-joine--error' : undefined
                }
                aria-invalid={uploadedFileError ? true : undefined}
                ref={hiddenFileInput}
                onChange={handleFileUploadChange}
                className='hidden'
                accept='.pdf, .png, .jpeg, .jpg'
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
