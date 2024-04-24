import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

import ListeConversations from 'components/chat/ListeConversations'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { JeuneChat } from 'interfaces/jeune'
import { FormNouveauMessageImportant } from 'services/messages.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const MessageImportantModal = dynamic(
  () => import('components/chat/MessageImportantModal'),
  { ssr: false }
)

interface ChatRoomProps {
  jeunesChats: JeuneChat[] | undefined
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

  const [chatsFiltres, setChatsFiltres] = useState<JeuneChat[]>()
  const [afficherModaleMessageImportant, setAfficherModaleMessageImportant] =
    useState<boolean>(false)
  const [succesEnvoiMessageImportant, setSuccesEnvoiMessageImportant] =
    useState<boolean | undefined>()
  const [messageImportantIsLoading, setMessageImportantIsLoading] =
    useState<boolean>(false)

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

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
      }

      const { sendNouveauMessageImportant } = await import(
        'services/messages.service'
      )
      await sendNouveauMessageImportant(formNouveauMessageImportant)
      setSuccesEnvoiMessageImportant(true)
      trackEvent({
        structure: conseiller.structure,
        categorie: 'Conseiller',
        action: 'Message',
        nom: 'Message important',
        avecBeneficiaires: aDesBeneficiaires,
      })
      setMessageImportantIsLoading(false)
    } catch (error) {
      setMessageImportantIsLoading(false)
      setSuccesEnvoiMessageImportant(false)
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
      avecBeneficiaires: aDesBeneficiaires,
    })
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
    setChatsFiltres(jeunesChats)
  }, [jeunesChats])

  return (
    <>
      <div className='relative bg-blanc shadow-base mb-6 layout_s:bg-primary_lighten layout_s:shadow-none layout_s:mx-4 layout_base:mt-6'>
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

        <div className='flex flex-start wrap gap-4 justify-center my-6 grow layout_s:justify-start layout_s:p-0 layout_base:my-3'>
          <h2 className='text-l-bold text-primary'>Messagerie</h2>
          <button
            onClick={() => {
              setSuccesEnvoiMessageImportant(undefined)
              setAfficherModaleMessageImportant(true)
            }}
            title='Configurer un message important'
          >
            <IconComponent
              name={IconName.Settings}
              className='w-6 h-6 fill-primary'
              focusable={false}
              aria-hidden={true}
            />
            <span className='sr-only'>Configurer un message important</span>
          </button>
        </div>
      </div>

      <div className='mx-3'>
        <AlerteDisplayer hideOnLargeScreen={true} />
      </div>

      <div
        className='flex justify-center my-8 layout_s:hidden'
        data-testid='form-chat'
      >
        <RechercheJeune onSearchFilterBy={filtrerConversations} />
      </div>

      {chatsFiltres && (
        <button
          className='flex items-center text-primary bg-blanc rounded-base p-4 mb-2 mx-4'
          onClick={onAccesListesDiffusion}
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

      {afficherModaleMessageImportant && (
        <MessageImportantModal
          succesEnvoiMessageImportant={succesEnvoiMessageImportant}
          messageImportantIsLoading={messageImportantIsLoading}
          onConfirmation={envoyerMessageImportant}
          onCancel={() => setAfficherModaleMessageImportant(false)}
        />
      )}
    </>
  )
}
