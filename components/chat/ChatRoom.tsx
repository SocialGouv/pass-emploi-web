import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

import ListeConversations from 'components/chat/ListeConversations'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import { RechercheBeneficiaire } from 'components/jeune/RechercheBeneficiaire'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BeneficiaireChat } from 'interfaces/beneficiaire'
import {
  desactiverMessageImportant,
  FormNouveauMessageImportant,
  getMessageImportant,
  MessageImportantPreRempli,
} from 'services/messages.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const MessageImportantModal = dynamic(
  () => import('components/chat/MessageImportantModal'),
  { ssr: false }
)

interface ChatRoomProps {
  jeunesChats: BeneficiaireChat[] | undefined
  showMenu: boolean
  onOuvertureMenu: () => void
  onAccesListesDiffusion: () => void
  onAccesConversation: (idJeune: string) => void
}

export default function ChatRoom({
  jeunesChats,
  showMenu,
  onOuvertureMenu,
  onAccesListesDiffusion,
  onAccesConversation,
}: ChatRoomProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const chatCredentials = useChatCredentials()

  const [chatsFiltres, setChatsFiltres] = useState<BeneficiaireChat[]>()
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
    } catch (error) {
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
    } catch (error) {
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
    const chatsFiltresResult = (jeunesChats ?? []).filter((jeune) => {
      const jeuneLastName = jeune.nom.replace(/’/i, "'").toLocaleLowerCase()
      const jeuneFirstName = jeune.prenom.replace(/’/i, "'").toLocaleLowerCase()
      for (const item of querySplit) {
        if (jeuneLastName.includes(item) || jeuneFirstName.includes(item)) {
          return true
        }
      }
    })

    setChatsFiltres(chatsFiltresResult)
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
    setChatsFiltres(jeunesChats)
  }, [jeunesChats])

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
            aria-controls='menu-mobile'
            aria-expanded={showMenu}
            className='absolute left-4 top-[calc(50%-1.25rem)]'
          >
            <IconComponent
              name={IconName.Menu}
              className='w-10 h-10 fill-primary layout_s:hidden'
              aria-hidden={true}
              focusable={false}
              title='Ouvrir le menu principal'
            />
          </button>
        </nav>

        <h2 className='text-l-bold text-primary'>Messagerie</h2>
        <div
          onClick={permuterMenuActionsMessagerie}
          className='relative flex items-center gap-2 justify-end text-xs-medium text-content'
        >
          <button
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
                      <IconComponent
                        name={IconName.DecorativePoint}
                        className='absolute right-[-8px] top-[-8px] w-3 h-3 fill-warning'
                        focusable={false}
                        aria-hidden={true}
                        title='Un message important est déjà configuré'
                      />
                      <span className='sr-only'>
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
          <div className='mx-3'>
            <AlerteDisplayer hideOnLargeScreen={true} />
          </div>

          <div
            className='flex justify-center my-8 layout_s:hidden'
            data-testid='form-chat'
          >
            <RechercheBeneficiaire onSearchFilterBy={filtrerConversations} />
          </div>

          {chatsFiltres && (
            <button
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
              <span className='grow text-left'>
                Voir mes listes de diffusion
              </span>
              <IconComponent
                name={IconName.ChevronRight}
                className='mr-2 h-6 w-6 fill-[currentColor]'
                aria-hidden={true}
                focusable={false}
              />
            </button>
          )}

          <ListeConversations
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
          onConfirmation={envoyerMessageImportant}
          onCancel={() => {
            setAfficherModaleMessageImportant(false)
          }}
          onDeleteMessageImportant={supprimerMessageImportant}
        />
      )}
    </>
  )
}
