import React from 'react'

import EmptyStateImage from 'assets/images/illustration-send-white.svg'
import HeaderChat from 'components/chat/HeaderChat'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
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
  return (
    <>
      {!messagerieFullScreen && (
        <>
          <HeaderChat
            titre={'Mes listes de diffusion'}
            labelRetour={'Retour sur ma messagerie'}
            onBack={onBack!}
          />

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
        </>
      )}

      {!listesDeDiffusion && <SpinningLoader />}

      {listesDeDiffusion && listesDeDiffusion.length === 0 && (
        <div className='bg-grey_100 flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Vous n’avez pas encore créé de liste de diffusion
          </p>
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
                className='bg-blanc rounded-base mb-2 last:mb-0'
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

      {messagerieFullScreen && (
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
          <h4 className='flex items-center text-primary text-base-medium'>
            <IconComponent
              name={IconName.Info}
              role='img'
              focusable={false}
              aria-label={informationLabel}
              title={informationLabel}
              className='w-3 h-3 mr-2 fill-[currentColor]'
            />
            {liste.titre}
          </h4>
        )}
        {!aBeneficiairesReaffectes && (
          <h4 className='text-base-medium'>{liste.titre}</h4>
        )}

        <span className='text-s-regular'>
          {liste.beneficiaires.length} destinataire(s)
        </span>
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
