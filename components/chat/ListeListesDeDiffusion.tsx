import React, { useState } from 'react'

import HeaderChat from 'components/chat/HeaderChat'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import EmptyState from 'components/EmptyState'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

type ListeListesDeDiffusionProps = {
  listesDeDiffusion: ListeDeDiffusion[] | undefined
  onAfficherListe: (liste: ListeDeDiffusion) => void
  onBack?: () => void
  messagerieFullScreen?: boolean
}
export default function ListeListesDeDiffusion({
  listesDeDiffusion,
  onAfficherListe,
  onBack,
  messagerieFullScreen,
}: ListeListesDeDiffusionProps) {
  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)

  function permuterVisibiliteMessagerie() {
    setMessagerieEstVisible(!messagerieEstVisible)
  }

  return (
    <>
      {!messagerieFullScreen && (
        <>
          <HeaderChat
            titre={'Mes listes de diffusion'}
            labelRetour={'Retour sur ma messagerie'}
            onBack={onBack!}
            onPermuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
            messagerieEstVisible={messagerieEstVisible}
          />

          {messagerieEstVisible && (
            <div className='hidden layout_s:block w-fit ml-4 mb-8'>
              <ButtonLink
                href='/mes-jeunes/listes-de-diffusion'
                style={ButtonStyle.TERTIARY}
                className='mr-auto'
              >
                <IconComponent
                  name={IconName.Edit}
                  focusable={false}
                  aria-hidden={true}
                  className='w-4 h-4 fill-primary mr-3'
                />
                Gérer mes listes de diffusion
              </ButtonLink>
            </div>
          )}
        </>
      )}

      {messagerieEstVisible && (
        <>
          {!listesDeDiffusion && <SpinningLoader alert={true} />}

          {listesDeDiffusion && listesDeDiffusion.length === 0 && (
            <div className='bg-grey_100 flex flex-col justify-center items-center'>
              <EmptyState
                illustrationName={IllustrationName.SendWhite}
                titre='Vous n’avez pas encore créé de liste de diffusion.'
                sousTitre='Envoyez des messages à plusieurs bénéficiaires à la fois grâce aux listes de diffusion.'
                lien={{
                  href: '/mes-jeunes/listes-de-diffusion/edition-liste',
                  label: 'Créer une liste',
                  iconName: IconName.Add,
                }}
              />
            </div>
          )}

          {listesDeDiffusion && listesDeDiffusion.length > 0 && (
            <div className='flex flex-col m-4 overflow-y-auto'>
              <h3
                id='listes-de-diffusion'
                className='text-m-medium text-primary mb-4'
              >
                Listes ({listesDeDiffusion.length})
              </h3>
              <ul
                aria-describedby='listes-de-diffusion'
                className='overflow-y-auto'
              >
                {listesDeDiffusion.map((liste) => (
                  <li
                    key={liste.id}
                    className='bg-white rounded-base mb-2 last:mb-0'
                  >
                    <ListeDeDiffusionTile
                      liste={liste}
                      onAfficherListe={onAfficherListe}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {listesDeDiffusion &&
            listesDeDiffusion.length > 0 &&
            messagerieFullScreen && (
              <div className='hidden layout_s:block w-fit mx-auto'>
                <ButtonLink
                  href='/mes-jeunes/listes-de-diffusion'
                  style={ButtonStyle.TERTIARY}
                >
                  <IconComponent
                    name={IconName.Edit}
                    focusable={false}
                    aria-hidden={true}
                    className='w-4 h-4 fill-primary mr-3'
                  />
                  Gérer mes listes de diffusion
                </ButtonLink>
              </div>
            )}
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

function ListeDeDiffusionTile({
  liste,
  onAfficherListe,
}: {
  liste: ListeDeDiffusion
  onAfficherListe: (liste: ListeDeDiffusion) => void
}): JSX.Element {
  const aBeneficiairesReaffectes = liste.beneficiaires.some(
    ({ estDansLePortefeuille }) => !estDansLePortefeuille
  )
  const informationLabel =
    'Un ou plusieurs bénéficiaires de cette liste ont été réaffectés temporairement.'

  return (
    <button
      onClick={() => onAfficherListe(liste)}
      className='w-full p-3 flex'
      aria-label={
        'Consulter les messages de la liste ' +
        liste.titre +
        (aBeneficiairesReaffectes ? ` (${informationLabel})` : '')
      }
    >
      <div className='grow text-left'>
        {aBeneficiairesReaffectes && (
          <h4
            className='flex items-center text-primary text-base-medium'
            title={informationLabel}
          >
            <IconComponent
              name={IconName.Info}
              role='img'
              focusable={false}
              aria-label={informationLabel}
              className='w-3 h-3 mr-2 fill-current'
            />
            {liste.titre}
          </h4>
        )}
        {!aBeneficiairesReaffectes && (
          <h4 className='text-base-medium'>{liste.titre}</h4>
        )}

        <p className='text-s-regular'>
          {liste.beneficiaires.length} destinataire(s)
        </p>
      </div>
      <IconComponent
        name={IconName.ChevronRight}
        className='h-6 w-6 fill-primary'
        aria-hidden={true}
        focusable={false}
      />
    </button>
  )
}
