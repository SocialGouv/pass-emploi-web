import React from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

type ListeListesDeDiffusionProps = {
  listesDeDiffusion: ListeDeDiffusion[] | undefined
  onAfficherListe: (liste: ListeDeDiffusion) => void
}
export default function ListeListesDeDiffusion({
  listesDeDiffusion,
  onAfficherListe,
}: ListeListesDeDiffusionProps) {
  return (
    <>
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
        <div className='h-full flex flex-col px-4'>
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
                className='bg-blanc rounded-small mb-2 last:mb-0'
              >
                <button
                  onClick={() => onAfficherListe(liste)}
                  className='w-full p-3 text-left'
                >
                  <TitreListe liste={liste} />
                  <span className='text-s-regular'>
                    {liste.beneficiaires.length} destinataire(s)
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function TitreListe({ liste }: { liste: ListeDeDiffusion }): JSX.Element {
  const informationLabel =
    'Un ou plusieurs bénéficiaires de cette liste ont été réaffectés temporairement.'

  if (
    liste.beneficiaires.some(
      ({ estDansLePortefeuille }) => !estDansLePortefeuille
    )
  ) {
    return (
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
    )
  }

  return <h4 className='text-base-medium'>{liste.titre}</h4>
}
