import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import ListeConversations from 'components/chat/ListeConversations'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import RechercheBeneficiaire from 'components/jeune/RechercheBeneficiaire'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
import {
  FormNouveauMessageImportant,
  getMessageImportant,
  MessageImportantPreRempli,
} from 'services/messages.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const MessageImportantModal = dynamic(
  () => import('components/chat/MessageImportantModal')
)

type ChatRoomProps = {
  beneficiairesChats: BeneficiaireEtChat[] | undefined
  onOuvertureMenu: () => void
  onAccesListesDiffusion: () => void
  onAccesConversation: (conversation: BeneficiaireEtChat) => void
}

function ChatRoom(
  {
    beneficiairesChats,
    onOuvertureMenu,
    onAccesListesDiffusion,
    onAccesConversation,
  }: ChatRoomProps,
  ref: ForwardedRef<{
    focusAccesListesDiffusion: () => void
    focusConversation: (id: string) => void
  }>
) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const chatCredentials = useChatCredentials()

  const isFirstRender = useRef<boolean>(true)
  const chatroomChildRef = useRef<HTMLDivElement>(null)
  const listeConversationsRef = useRef<{
    focus: () => void
    focusConversation: (id: string) => void
  }>(null)
  const accesListesDiffusionRef = useRef<HTMLButtonElement>(null)
  useImperativeHandle(ref, () => ({
    focusAccesListesDiffusion: () => accesListesDiffusionRef.current!.focus(),
    focusConversation: (id: string) =>
      listeConversationsRef.current!.focusConversation(id),
  }))

  const [chatsFiltres, setChatsFiltres] = useState<
    BeneficiaireEtChat[] | undefined
  >(beneficiairesChats)
  const [afficherMenuActionsMessagerie, setAfficherMenuActionsMessagerie] =
    useState<boolean>(false)
  const [messageImportantPreRempli, setMessageImportantPreRempli] = useState<
    MessageImportantPreRempli | undefined
  >(undefined)
  const [succesEnvoiMessageImportant, setSuccesEnvoiMessageImportant] =
    useState<boolean | undefined>()
  const [
    succesDesactivationMessageImportant,
    setSuccesDesactivationMessageImportant,
  ] = useState<boolean | undefined>()
  const [messageImportantIsLoading, setMessageImportantIsLoading] =
    useState<boolean>(false)
  const [afficherModaleMessageImportant, setAfficherModaleMessageImportant] =
    useState<boolean>(false)

  const [
    afficherNotificationMessageImportant,
    setAfficherNotificationMessageImportant,
  ] = useState<boolean>(false)

  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)

  function permuterMenuActionsMessagerie() {
    setAfficherMenuActionsMessagerie(!afficherMenuActionsMessagerie)
  }

  function permuterVisibiliteMessagerie() {
    setAfficherMenuActionsMessagerie(false)
    setMessagerieEstVisible(!messagerieEstVisible)
  }

  async function envoyerMessageImportant(
    message: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<void> {
    try {
      setMessageImportantIsLoading(true)
      const formNouveauMessageImportant: FormNouveauMessageImportant = {
        idConseiller: conseiller.id,
        newMessage: message,
        dateFin: dateFin,
        dateDebut: dateDebut,
        cleChiffrement: chatCredentials!.cleChiffrement,
        idMessageImportant: messageImportantPreRempli?.id,
      }

      const { sendNouveauMessageImportant } = await import(
        'services/messages.service'
      )
      const nouveauMessageImportant = await sendNouveauMessageImportant(
        formNouveauMessageImportant
      )
      setMessageImportantPreRempli(nouveauMessageImportant)

      setSuccesEnvoiMessageImportant(true)
    } catch {
      setSuccesEnvoiMessageImportant(false)
    } finally {
      setMessageImportantIsLoading(false)
    }
  }

  async function supprimerMessageImportant(): Promise<void> {
    if (!messageImportantPreRempli) return
    try {
      setMessageImportantIsLoading(true)

      const { desactiverMessageImportant } = await import(
        'services/messages.service'
      )
      await desactiverMessageImportant(messageImportantPreRempli.id)
      setMessageImportantPreRempli(undefined)

      setSuccesDesactivationMessageImportant(true)
    } catch {
      setSuccesDesactivationMessageImportant(false)
    } finally {
      setMessageImportantIsLoading(false)
    }
  }

  async function toggleFlag(idChat: string, flagged: boolean): Promise<void> {
    const { toggleFlag: _toggleFlag } = await import(
      'services/messages.service'
    )
    _toggleFlag(idChat, flagged)
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Conversation suivie',
      action: 'ChatRoom',
      nom: flagged.toString(),
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  async function ouvrirModaleMessageImportant() {
    setAfficherModaleMessageImportant(true)
    setSuccesEnvoiMessageImportant(undefined)
    setSuccesDesactivationMessageImportant(undefined)
  }

  function filtrerConversations(saisieUtilisateur: string) {
    const querySplit = saisieUtilisateur.toLowerCase().split(/-|\s/)
    const chatsFiltresResult = (beneficiairesChats ?? []).filter((jeune) => {
      const jeuneLastName = jeune.nom.replace(/’/i, "'").toLocaleLowerCase()
      const jeuneFirstName = jeune.prenom.replace(/’/i, "'").toLocaleLowerCase()
      for (const item of querySplit) {
        if (jeuneLastName.includes(item) || jeuneFirstName.includes(item)) {
          return true
        }
      }
    })

    setChatsFiltres(chatsFiltresResult)
    listeConversationsRef.current!.focus()
  }

  useEffect(() => {
    if (!chatCredentials) return

    getMessageImportant(chatCredentials.cleChiffrement).then(
      setMessageImportantPreRempli
    )
  }, [chatCredentials])

  useEffect(() => {
    setAfficherNotificationMessageImportant(
      Boolean(
        messageImportantPreRempli?.dateFin &&
          DateTime.fromISO(messageImportantPreRempli.dateFin).startOf('day') >=
            DateTime.now().startOf('day')
      )
    )
  }, [messageImportantPreRempli])

  useEffect(() => {
    setChatsFiltres(beneficiairesChats)
  }, [beneficiairesChats])

  useEffect(() => {
    if (isFirstRender.current) return
    if (messagerieEstVisible) {
      const parentContainer = chatroomChildRef.current!.parentElement!
      parentContainer.setAttribute('tabIndex', '-1')
      parentContainer.focus()
    }
  }, [messagerieEstVisible])

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  return (
    <>
      <div className='relative py-6 gap-4 px-4 bg-white flex flex-wrap justify-between shadow-base mb-6 layout_s:bg-primary_lighten layout_s:shadow-none layout_base:my-3'>
        <nav
          role='navigation'
          aria-label='Menu principal'
          className='layout_s:hidden'
        >
          <button
            type='button'
            onClick={onOuvertureMenu}
            className='absolute left-4 top-[calc(50%-1.25rem)]'
            title='Ouvrir le menu principal'
          >
            <IconComponent
              name={IconName.Menu}
              className='w-10 h-10 fill-primary layout_s:hidden'
              aria-hidden={true}
              focusable={false}
            />
            <span className='sr-only'>Ouvrir le menu principal</span>
          </button>
        </nav>

        <h2 className='text-l-bold text-primary'>Messagerie</h2>
        <div className='relative flex items-center gap-2 justify-end text-xs-medium text-content'>
          <button
            onClick={permuterMenuActionsMessagerie}
            type='button'
            className='bg-primary rounded-full fill-white hover:shadow-base'
            title={`${afficherMenuActionsMessagerie ? 'Cacher les' : 'Accéder aux'} actions de votre messagerie`}
          >
            <IconComponent
              focusable={false}
              aria-hidden={true}
              className='inline w-6 h-6 m-1'
              name={IconName.More}
            />
            <span className='sr-only'>
              {afficherMenuActionsMessagerie ? 'Cacher les' : 'Accéder aux'}{' '}
              actions de votre messagerie
            </span>
          </button>

          {afficherMenuActionsMessagerie && (
            <div className='absolute top-[4em] z-10 bg-white rounded-base p-2 shadow-m'>
              <button
                onClick={ouvrirModaleMessageImportant}
                className='p-2 flex items-center text-nowrap text-s-bold gap-2 hover:text-primary hover:fill-primary'
              >
                <div className='relative'>
                  <IconComponent
                    name={IconName.Settings}
                    className='inline w-6 h-6 fill-[current-color]'
                    focusable={false}
                    aria-hidden={true}
                  />
                  {afficherNotificationMessageImportant && (
                    <>
                      {/* TODO tooltip https://inclusive-components.design/tooltips-toggletips/ ? */}
                      <IconComponent
                        name={IconName.DecorativePoint}
                        className='absolute right-[-8px] top-[-8px] w-3 h-3 fill-warning'
                        role='img'
                        aria-labelledby='deja-configure-label'
                        title='Un message important est déjà configuré'
                        focusable={false}
                      />
                      <span id='deja-configure-label' className='sr-only'>
                        Un message important est déjà configuré
                      </span>
                    </>
                  )}
                </div>
                Configurer un message important
              </button>

              <button
                onClick={permuterVisibiliteMessagerie}
                className='p-2 flex items-center text-nowrap text-s-bold gap-2 hover:text-primary hover:fill-primary'
              >
                <IconComponent
                  name={
                    messagerieEstVisible
                      ? IconName.VisibilityOff
                      : IconName.VisibilityOn
                  }
                  className='inline w-6 h-6 fill-[current-color]'
                  focusable={false}
                  aria-hidden={true}
                />
                {messagerieEstVisible
                  ? 'Masquer la messagerie'
                  : 'Rendre visible la messagerie'}
              </button>
            </div>
          )}
        </div>
      </div>

      {messagerieEstVisible && (
        <>
          <div ref={chatroomChildRef} className='mx-3'>
            <AlerteDisplayer hideOnLargeScreen={true} />
          </div>

          <div
            className='flex justify-center my-8 layout_s:hidden'
            data-testid='form-chat'
          >
            <RechercheBeneficiaire onSearchFilterBy={filtrerConversations} />
          </div>

          <button
            ref={accesListesDiffusionRef}
            className='flex items-center text-primary bg-white rounded-base p-4 mb-2 mx-4'
            onClick={onAccesListesDiffusion}
            type='button'
          >
            <IconComponent
              name={IconName.PeopleFill}
              className='mr-2 h-6 w-6 fill-primary'
              aria-hidden={true}
              focusable={false}
            />
            <span className='grow text-left'>Voir mes listes de diffusion</span>
            <IconComponent
              name={IconName.ChevronRight}
              className='mr-2 h-6 w-6 fill-current'
              aria-hidden={true}
              focusable={false}
            />
          </button>

          <ListeConversations
            ref={listeConversationsRef}
            conversations={chatsFiltres}
            onToggleFlag={toggleFlag}
            onSelectConversation={onAccesConversation}
          />
        </>
      )}

      {!messagerieEstVisible && (
        <MessagerieCachee
          permuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        />
      )}

      {afficherModaleMessageImportant && (
        <MessageImportantModal
          messageImportantPreRempli={messageImportantPreRempli}
          succesEnvoiMessageImportant={succesEnvoiMessageImportant}
          succesDesactivationMessageImportant={
            succesDesactivationMessageImportant
          }
          messageImportantIsLoading={messageImportantIsLoading}
          onModificationMessageImportant={envoyerMessageImportant}
          onCancel={() => {
            setAfficherModaleMessageImportant(false)
          }}
          onDeleteMessageImportant={supprimerMessageImportant}
        />
      )}
    </>
  )
}
export default forwardRef(ChatRoom)
