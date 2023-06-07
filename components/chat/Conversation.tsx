import { DateTime } from 'luxon'
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import DisplayMessage from 'components/chat/DisplayMessage'
import HeaderChat from 'components/chat/HeaderChat'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import FileInput from 'components/ui/Form/FileInput'
import { InputError } from 'components/ui/Form/InputError'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { InfoFichier } from 'interfaces/fichier'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { ByDay, Message } from 'interfaces/message'
import {
  FormNouveauMessageIndividuel,
  observeDerniersMessages,
  observeJeuneReadingDate,
  setReadByConseiller,
} from 'services/messages.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { dateIsToday, toShortDate } from 'utils/date'

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

    const { sendNouveauMessage: _sendNouveauMessage } = await import(
      'services/messages.service'
    )
    _sendNouveauMessage(formNouveauMessage)

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

  function chargerPlusDeMessages() {
    const pageSuivante = nombrePagesChargees + 1
    setLoadingMoreMessages(true)
    const idFirstDisplayedMessage = messagesByDay![0].messages[0].id

    unsubscribeFromMessages.current()
    unsubscribeFromMessages.current = observerMessages(
      jeuneChat.chatId,
      pageSuivante
    )

    setNombrePagesChargees(pageSuivante)
    const previousFirstDisplayedMessage =
      conteneurMessagesRef.current!.querySelector('#' + idFirstDisplayedMessage)
    previousFirstDisplayedMessage!.scrollIntoView()
  }

  const observerMessages = useCallback(
    (idChatToObserve: string, nombreDePages: number) => {
      if (!chatCredentials) return () => {}

      return observeDerniersMessages(
        idChatToObserve,
        chatCredentials.cleChiffrement,
        nombreDePages,
        (messagesGroupesParJour: ByDay<Message>[]) => {
          setMessagesByDay((previousValue) => {
            if (
              !messagesGroupesParJour.length ||
              (previousValue?.length &&
                previousValue[0].messages[0].id ===
                  messagesGroupesParJour[0].messages[0].id)
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
    [chatCredentials]
  )

  async function uploadFichier(fichierSelectionne: File) {
    setUploadedFileError(undefined)

    try {
      setIsFileUploading(true)

      const { uploadFichier: _uploadFichier } = await import(
        'services/fichiers.service'
      )
      const infoFichier = await _uploadFichier(
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
    const { deleteFichier } = await import('services/fichiers.service')
    await deleteFichier(uploadedFileInfo!.id)
  }

  async function toggleFlag() {
    const flagged = !jeuneChat.flaggedByConseiller
    const { toggleFlag: _toggleFlag } = await import(
      'services/messages.service'
    )
    _toggleFlag(jeuneChat.chatId, flagged)
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Conversation suivie',
      action: 'Conversation',
      nom: flagged.toString(),
      avecBeneficiaires: jeuneChat.chatId ? 'oui' : 'non',
    })
  }

  useEffect(() => {
    unsubscribeFromMessages.current = observerMessages(jeuneChat.chatId, 1)
    setReadByConseiller(jeuneChat.chatId)

    return unsubscribeFromMessages.current
  }, [jeuneChat.chatId, observerMessages])

  useEffect(() => {
    if (messagesByDay?.length && nombrePagesChargees === 1) {
      const dernierJour = conteneurMessagesRef.current!.lastElementChild
      const lastMessage = dernierJour!.querySelector('li:last-child')

      lastMessage!.scrollIntoView()
    }
  }, [messagesByDay, nombrePagesChargees])

  useEffect(() => {
    const unsubscribe = observeJeuneReadingDate(
      jeuneChat.chatId,
      setLastSeenByJeune
    )
    return () => unsubscribe()
  }, [jeuneChat.chatId])

  useEffect(() => {
    if (uploadedFileInfo) {
      deleteFile()
    }
    inputRef.current!.value = ''
    setNewMessage('')
  }, [jeuneChat.chatId])

  return (
    <div className='h-full flex flex-col bg-grey_100'>
      <HeaderChat
        onBack={onBack}
        labelRetour='Retour sur ma messagerie'
        titre={`Discuter avec ${jeuneChat.nom} ${jeuneChat.prenom}`}
        iconName={
          jeuneChat.flaggedByConseiller
            ? IconName.BookmarkFill
            : IconName.BookmarkOutline
        }
        iconLabel={
          jeuneChat.flaggedByConseiller
            ? 'Ne plus suivre la conversation'
            : 'Suivre la conversation'
        }
        onClickIcon={toggleFlag}
      />

      <div
        className='p-4 grow overflow-y-auto short:hidden'
        aria-live='polite'
        aria-busy={!messagesByDay}
      >
        {!messagesByDay && <SpinningLoader />}

        {messagesByDay && conseiller && (
          <>
            {hasNoMoreMessages && (
              <span className='text-xs-regular text-center block mb-3'>
                Aucun message plus ancien
              </span>
            )}
            {!hasNoMoreMessages && (
              <Button
                onClick={chargerPlusDeMessages}
                style={ButtonStyle.TERTIARY}
                className='mx-auto mb-3'
                isLoading={loadingMoreMessages}
              >
                <IconComponent
                  name={IconName.ChevronUp}
                  aria-hidden={true}
                  focusable={false}
                  className='w-4 h-4 fill-[currentColor] mr-2'
                />
                Voir messages plus anciens
              </Button>
            )}
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
                        isConseillerCourant={
                          message.conseillerId === conseiller.id
                        }
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
        <div className='grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-y-3 gap-x-3'>
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
            className='p-4 bg-blanc rounded-base border text-base-bold border-grey_700 focus-within:outline focus-within:outline-1'
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
                    name={IconName.Close}
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
              className='w-full outline-none text-base-regular'
              onFocus={() => setReadByConseiller(jeuneChat.chatId)}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Écrivez votre message ici...'
              rows={5}
            />
          </div>
          <div className='relative'>
            <button
              type='submit'
              aria-label='Envoyer le message'
              disabled={!newMessage && !Boolean(uploadedFileInfo)}
              className='bg-primary w-12 h-12 border-none rounded-full disabled:bg-grey_500 disabled:cursor-not-allowed absolute bottom-0'
            >
              <IconComponent
                name={IconName.Send}
                aria-hidden='true'
                focusable='false'
                className='m-auto w-6 h-6 fill-blanc'
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
