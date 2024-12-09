import { DateTime } from 'luxon'
import Link from 'next/link'
import React, {
  FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import DisplayMessageConseiller from 'components/chat/DisplayMessageConseiller'
import HeaderChat from 'components/chat/HeaderChat'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import FileInput from 'components/ui/Form/FileInput'
import { InputError } from 'components/ui/Form/InputError'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import SpinningLoader from 'components/ui/SpinningLoader'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { InfoFichier } from 'interfaces/fichier'
import {
  ByDay,
  fromConseiller,
  getPreviousItemId,
  Message,
  OfDay,
} from 'interfaces/message'
import {
  FormNouveauMessageIndividuel,
  modifierMessage as _modifierMessage,
  observeDerniersMessages,
  observeJeuneReadingDate,
  setReadByConseiller,
  supprimerMessage as _supprimerMessage,
} from 'services/messages.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { dateIsToday, toShortDate } from 'utils/date'

type ConversationProps = {
  beneficiaireNomComplet: string
  onBack: () => void
  getConseillerNomComplet: (message: Message) => string | undefined
  beneficiaireChat: BeneficiaireEtChat
  shouldFocusOnFirstRender: boolean
  toggleAfficherRecherche: () => void
}

export function Conversation({
  beneficiaireNomComplet,
  onBack,
  getConseillerNomComplet,
  beneficiaireChat,
  shouldFocusOnFirstRender,
  toggleAfficherRecherche,
}: ConversationProps) {
  const NB_MESSAGES_PAR_PAGE = 10
  const idNoMoreMessage = 'no-more-message'

  const chatCredentials = useChatCredentials()
  const [conseiller] = useConseiller()
  const isFirstRender = useRef<boolean>(true)

  const [userInput, setUserInput] = useState('')

  const [isFlaggedByConseiller, setFlaggedByConseiller] = useState<boolean>(
    beneficiaireChat.flaggedByConseiller
  )

  const [uploadedFileError, setUploadedFileError] = useState<
    string | undefined
  >(undefined)
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false)

  const [messageAModifier, setMessageAModifier] = useState<
    Message | undefined
  >()

  const [messagesByDay, setMessagesByDay] = useState<ByDay<Message>>()
  const [uploadedFileInfo, setUploadedFileInfo] = useState<
    InfoFichier | undefined
  >(undefined)

  const [lastSeenByJeune, setLastSeenByJeune] = useState<DateTime | undefined>(
    undefined
  )

  const [nombrePagesChargees, setNombrePagesChargees] = useState<number>()
  const [loadingMoreMessages, setLoadingMoreMessages] = useState<boolean>(false)
  const [hasNoMoreMessages, setHasNoMoreMessages] = useState<boolean>(false)
  const unsubscribeFromMessages = useRef<() => void>(() => undefined)
  const idPrecedentPremierMessage = useRef<string | undefined>(undefined)

  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)

  const headerChatRef = useRef<{ focusRetour: () => void }>(null)
  const conteneurMessagesRef = useRef<HTMLUListElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const addFileRef = useRef<HTMLInputElement | null>(null)
  const deleteFileRef = useRef<HTMLButtonElement | null>(null)
  const pjErrorRef = useRef<HTMLDivElement | null>(null)

  const observerMessages = useCallback(
    (beneficiaireEtChat: BeneficiaireEtChat, nombreDePages: number) => {
      if (!chatCredentials) return () => {}

      return observeDerniersMessages(
        beneficiaireEtChat,
        chatCredentials.cleChiffrement,
        { pages: nombreDePages, taillePage: NB_MESSAGES_PAR_PAGE },
        (messagesGroupesParJour: ByDay<Message>) => {
          setMessagesByDay(messagesGroupesParJour)
          setNombrePagesChargees(nombreDePages)
          setHasNoMoreMessages(
            messagesGroupesParJour.length < nombreDePages * NB_MESSAGES_PAR_PAGE
          )

          setLoadingMoreMessages(false)

          if (document.activeElement === inputRef.current) {
            setReadByConseiller(beneficiaireEtChat.chatId)
          }
        }
      )
    },
    [chatCredentials]
  )

  function permuterVisibiliteMessagerie() {
    setMessagerieEstVisible(!messagerieEstVisible)
  }

  function resetTextbox() {
    inputRef.current!.value = ''
    setUserInput('')
  }

  function displayDate(date: DateTime) {
    return dateIsToday(date) ? "Aujourd'hui" : `Le ${toShortDate(date)}`
  }

  async function sendNouveauMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!(userInput || Boolean(uploadedFileInfo)) || isFileUploading) return

    const formNouveauMessage: FormNouveauMessageIndividuel = {
      beneficiaireChat: beneficiaireChat,
      newMessage:
        userInput ||
        'Votre conseiller vous a transmis une nouvelle pièce jointe : ',
      cleChiffrement: chatCredentials!.cleChiffrement,
    }

    if (uploadedFileInfo) formNouveauMessage.infoPieceJointe = uploadedFileInfo

    const { sendNouveauMessage: _sendNouveauMessage } = await import(
      'services/messages.service'
    )
    _sendNouveauMessage(formNouveauMessage)

    setUploadedFileInfo(undefined)
    resetTextbox()
  }

  function chargerPlusDeMessages() {
    const pageSuivante = nombrePagesChargees! + 1
    setLoadingMoreMessages(true)
    idPrecedentPremierMessage.current = messagesByDay!.days[0].messages[0].id

    unsubscribeFromMessages.current()
    unsubscribeFromMessages.current = observerMessages(
      beneficiaireChat,
      pageSuivante
    )
  }

  async function uploadFichier(fichierSelectionne: File) {
    setUploadedFileError(undefined)

    try {
      setIsFileUploading(true)

      const { uploadFichier: _uploadFichier } = await import(
        'services/fichiers.service'
      )
      const infoFichier = await _uploadFichier(
        [beneficiaireChat.id],
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

  function preparerModificationMessage(message: Message) {
    setMessageAModifier(message)
    inputRef.current!.value = message.content
    setUserInput(message.content)
    inputRef.current!.focus()
  }

  function annulerModificationMessage() {
    setMessageAModifier(undefined)
    resetTextbox()
  }

  async function modifierMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!messageAModifier || !userInput) return

    await _modifierMessage(
      beneficiaireChat.chatId,
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
    setMessageAModifier(undefined)
    resetTextbox()

    const messageToFocus = document.getElementById(
      `message-${messageAModifier.id}`
    )!
    messageToFocus.setAttribute('tabIndex', '-1')
    messageToFocus.focus()
  }

  async function supprimerMessage(message: Message) {
    await _supprimerMessage(
      beneficiaireChat.chatId,
      message,
      chatCredentials!.cleChiffrement
    )

    const messageToFocus = document.getElementById(`message-${message.id}`)!
    messageToFocus.setAttribute('tabIndex', '-1')
    messageToFocus.focus()

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Message',
      action: 'Suppression',
      nom: '',
      aDesBeneficiaires: true,
    })
  }

  async function deleteFile() {
    setUploadedFileInfo(undefined)
    const { deleteFichier } = await import('services/fichiers.service')
    await deleteFichier(uploadedFileInfo!.id)
  }

  async function toggleFlag() {
    const flagged = !isFlaggedByConseiller
    const { toggleFlag: _toggleFlag } = await import(
      'services/messages.service'
    )
    await _toggleFlag(beneficiaireChat.chatId, flagged)
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Conversation suivie',
      action: 'Conversation',
      nom: flagged.toString(),
      aDesBeneficiaires: true,
    })
    setFlaggedByConseiller(flagged)
  }

  function focusDernierMessage() {
    const dernierJour = conteneurMessagesRef.current!.lastElementChild
    const lastMessage =
      dernierJour!.querySelector<HTMLLIElement>('li:last-child')

    lastMessage!.setAttribute('tabIndex', '-1')
    lastMessage!.focus()
  }

  useEffect(() => {
    unsubscribeFromMessages.current = observerMessages(beneficiaireChat, 1)
    setReadByConseiller(beneficiaireChat.chatId)

    return unsubscribeFromMessages.current
  }, [beneficiaireChat.chatId, observerMessages])

  useEffect(() => {
    if (!nombrePagesChargees) return

    if (!messagesByDay!.length && shouldFocusOnFirstRender) {
      headerChatRef.current!.focusRetour()
      return
    }

    if (nombrePagesChargees === 1 && shouldFocusOnFirstRender) {
      focusDernierMessage()
      return
    }

    if (nombrePagesChargees > 1 && idPrecedentPremierMessage.current) {
      const idMessageToFocus = getPreviousItemId(
        idPrecedentPremierMessage.current,
        messagesByDay!
      )
      const toFocus = idMessageToFocus
        ? document.getElementById(`message-${idMessageToFocus}`)!
        : document.getElementById(idNoMoreMessage)!
      toFocus.setAttribute('tabIndex', '-1')
      toFocus.focus()
    }
  }, [messagesByDay, nombrePagesChargees])

  useEffect(() => {
    if (uploadedFileInfo) deleteFile()
    resetTextbox()
    const unsubscribe = observeJeuneReadingDate(
      beneficiaireChat.chatId,
      setLastSeenByJeune
    )
    return () => unsubscribe()
  }, [beneficiaireChat.chatId])

  useEffect(() => {
    if (isFirstRender.current) return

    if (uploadedFileInfo) deleteFileRef.current!.focus()
    else addFileRef.current!.focus()
  }, [uploadedFileInfo])

  useEffect(() => {
    if (isFirstRender.current) return
    if (messagerieEstVisible) focusDernierMessage()
    return () => {}
  }, [messagerieEstVisible])

  useEffect(() => {
    isFirstRender.current = false
    return () => {
      isFirstRender.current = true
    }
  }, [])

  useEffect(() => {
    if (uploadedFileError) pjErrorRef.current!.focus()
  }, [uploadedFileError])

  return (
    <>
      <HeaderChat
        ref={headerChatRef}
        onBack={onBack}
        labelRetour='
        Retour sur ma messagerie'
        titre={
          <p>
            Discuter avec{' '}
            <Link
              aria-label={`Voir la fiche de ${beneficiaireChat.nom} ${beneficiaireChat.prenom}`}
              href={`/mes-jeunes/${beneficiaireChat.id}`}
              className='underline'
            >
              {beneficiaireChat.nom} {beneficiaireChat.prenom}
            </Link>
          </p>
        }
        onPermuterBookMark={toggleFlag}
        isFlaggedByConseiller={isFlaggedByConseiller}
        onLancerRecherche={toggleAfficherRecherche}
        onPermuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        messagerieEstVisible={messagerieEstVisible}
        beneficiaire={`${beneficiaireChat.prenom} ${beneficiaireChat.nom}`}
      />

      {messagerieEstVisible && (
        <>
          <div
            className='p-4 h-full grow overflow-y-auto short:hidden'
            aria-live='polite'
            aria-busy={!messagesByDay || loadingMoreMessages}
          >
            {!messagesByDay && <SpinningLoader />}

            {messagesByDay && conseiller && (
              <>
                {messagesByDay.length !== 0 && (
                  <>
                    {hasNoMoreMessages && (
                      <p
                        id={idNoMoreMessage}
                        className='text-xs-regular text-center block mb-3'
                      >
                        Aucun message plus ancien
                      </p>
                    )}

                    {!hasNoMoreMessages && (
                      <Button
                        onClick={chargerPlusDeMessages}
                        style={ButtonStyle.TERTIARY}
                        className='mx-auto mb-3'
                        isLoading={loadingMoreMessages}
                        type='button'
                      >
                        <IconComponent
                          name={IconName.ChevronUp}
                          aria-hidden={true}
                          focusable={false}
                          className='w-4 h-4 fill-current mr-2'
                        />
                        Voir messages plus anciens
                      </Button>
                    )}
                  </>
                )}

                {messagesByDay.length === 0 && (
                  <>
                    <p className='text-base-bold text-center text-content_color'>
                      Ceci est le début de votre conversation avec votre
                      bénéficiaire.
                    </p>
                    <p className='text-base-regular text-center text-content_color mt-4'>
                      Écrivez votre premier message !
                    </p>
                    <div className='text-primary text-center mt-4'>
                      <p className='inline-flex items-center text-base'>
                        <IconComponent
                          name={IconName.Info}
                          focusable={false}
                          aria-hidden={true}
                          className='inline h-6 w-6 fill-current'
                        />
                        <strong>Attention à nos propos</strong>
                      </p>
                      <p>
                        Ne sont autorisés, ni les commentaires insultants ou
                        excessifs, ni les données trop personnelles ou
                        sensibles.
                      </p>
                    </div>
                    <IllustrationComponent
                      name={IllustrationName.SendWhite}
                      focusable={false}
                      aria-hidden={true}
                      className='w-48 h-48 m-auto mt-8 [--secondary-fill:theme(colors.grey\_100)]'
                    />
                  </>
                )}

                {messagesByDay.length > 0 && (
                  <ul ref={conteneurMessagesRef}>
                    {messagesByDay.days.map(
                      (messagesOfADay: OfDay<Message>) => (
                        <li
                          key={messagesOfADay.date.toMillis()}
                          className='mb-5'
                        >
                          <div className='text-base-regular text-center mb-3'>
                            <p>{displayDate(messagesOfADay.date)}</p>
                          </div>

                          <ul>
                            {messagesOfADay.messages.map((message: Message) => (
                              <Fragment key={message.id}>
                                {!fromConseiller(message) && (
                                  <DisplayMessageBeneficiaire
                                    message={message}
                                    beneficiaireNomComplet={
                                      beneficiaireNomComplet
                                    }
                                  />
                                )}

                                {fromConseiller(message) && (
                                  <DisplayMessageConseiller
                                    message={message}
                                    conseillerNomComplet={getConseillerNomComplet(
                                      message
                                    )}
                                    lastSeenByJeune={lastSeenByJeune}
                                    isConseillerCourant={
                                      message.conseillerId === conseiller.id
                                    }
                                    onSuppression={() =>
                                      supprimerMessage(message)
                                    }
                                    onModification={() =>
                                      preparerModificationMessage(message)
                                    }
                                    isEnCoursDeModification={
                                      message.id === messageAModifier?.id
                                    }
                                  />
                                )}
                              </Fragment>
                            ))}
                          </ul>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </>
            )}
          </div>

          <form
            onSubmit={messageAModifier ? modifierMessage : sendNouveauMessage}
            className='p-3'
          >
            {uploadedFileError && (
              <InputError id='piece-jointe--error' ref={pjErrorRef}>
                {uploadedFileError}
              </InputError>
            )}
            <div className='grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-3'>
              {!messageAModifier && (
                <>
                  <p
                    id='piece-jointe--desc'
                    className='self-center text-xs-regular short:hidden'
                  >
                    Formats acceptés de pièce jointe : .PDF, .JPG, .PNG, .WEBP
                    (5 Mo maximum)
                  </p>

                  <FileInput
                    ref={addFileRef}
                    id='piece-jointe'
                    ariaDescribedby='piece-jointe--desc'
                    onChange={uploadFichier}
                    isLoading={isFileUploading}
                    disabled={Boolean(uploadedFileInfo)}
                    iconOnly={true}
                    invalid={Boolean(uploadedFileError)}
                  />
                </>
              )}

              {messageAModifier && (
                <>
                  <p className='self-center text-s-regular'>
                    Modifier le message
                  </p>
                  <button
                    type='button'
                    onClick={annulerModificationMessage}
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
                </>
              )}

              {/* onClick pour faciliter le focus sur la textarea, mouse only donc pas d'impact sur la navigation au clavier */}
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
              <div
                className='p-4 bg-white rounded-base border text-base-bold border-grey_700 focus-within:[outline:auto]'
                onClick={() => inputRef.current!.focus()}
              >
                {uploadedFileInfo && (
                  <div className='flex px-2 py-1 rounded-base bg-primary_lighten w-fit mb-4'>
                    <p className='break-all overflow-y-auto max-h-56'>
                      {uploadedFileInfo.nom}
                    </p>
                    <button
                      ref={deleteFileRef}
                      type='button'
                      aria-label={
                        'Supprimer la pièce jointe ' + uploadedFileInfo.nom
                      }
                      onClick={deleteFile}
                    >
                      <IconComponent
                        name={IconName.Close}
                        aria-hidden={true}
                        focusable={false}
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
                  onFocus={() => setReadByConseiller(beneficiaireChat.chatId)}
                  onChange={(e) => setUserInput(e.target.value)}
                  title='Écrivez votre message ici...'
                  placeholder='Écrivez votre message ici...'
                  rows={5}
                />
              </div>
              <div className='relative'>
                <button
                  type='submit'
                  aria-label={`Envoyer ${messageAModifier ? 'la modification du message' : 'le message'}`}
                  title={`Envoyer ${messageAModifier ? 'la modification du message' : 'le message'}`}
                  disabled={!userInput && !Boolean(uploadedFileInfo)}
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
        </>
      )}

      {!messagerieEstVisible && (
        <MessagerieCachee
          permuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        />
      )}
    </>
  )
}
