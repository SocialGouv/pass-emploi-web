import React, { useState } from 'react'

import { DetailMessageListeDeDiffusion } from 'components/chat/DetailMessageListeDeDiffusion'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'

type RubriqueListesDeDiffusionProps = {
  listesDeDiffusion: ListeDeDiffusion[] | undefined
  onBack: () => void
}

export default function RubriqueListesDeDiffusion({
  listesDeDiffusion,
  onBack,
}: RubriqueListesDeDiffusionProps) {
  const [listeSelectionnee, setListeSelectionnee] = useState<
    ListeDeDiffusion | undefined
  >()
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()

  const titre = messageSelectionne
    ? 'Détail du message'
    : listeSelectionnee?.titre ?? 'Mes listes de diffusion'
  const labelRetour =
    'Retour ' +
    (messageSelectionne
      ? 'aux messages de ma liste'
      : listeSelectionnee
      ? 'à mes listes de diffusion'
      : 'sur ma messagerie')

  return (
    <div className='h-full flex flex-col bg-grey_100 '>
      <div className='flex items-center mx-4 pb-6 my-6 border-b border-grey_500 short:hidden'>
        <button
          className='p-3 border-none rounded-full mr-2 bg-primary_lighten'
          onClick={() =>
            messageSelectionne
              ? setMessageSelectionne(undefined)
              : listeSelectionnee
              ? setListeSelectionnee(undefined)
              : onBack()
          }
        >
          <IconComponent
            name={IconName.ChevronLeft}
            role='img'
            focusable={false}
            title={labelRetour}
            aria-label={labelRetour}
            className='w-6 h-6 fill-[fillPrimary]'
          />
        </button>
        <h2 className='w-full text-left text-primary text-l-bold'>{titre}</h2>
      </div>

      {!listeSelectionnee && (
        <ListeListesDeDiffusion
          listesDeDiffusion={listesDeDiffusion}
          onAfficherListe={setListeSelectionnee}
        />
      )}

      {listeSelectionnee && !messageSelectionne && (
        <MessagesListeDeDiffusion
          liste={listeSelectionnee}
          onAfficherDetailMessage={setMessageSelectionne}
        />
      )}

      {listeSelectionnee && messageSelectionne && (
        <DetailMessageListeDeDiffusion message={messageSelectionne} />
      )}
    </div>
  )
}
