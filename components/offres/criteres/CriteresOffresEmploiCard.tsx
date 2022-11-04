import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Localite } from 'interfaces/referentiel'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

interface CriteresOffresEmploiCardProps {
  criteres: SearchOffresEmploiQuery
}

export default function CriteresOffresEmploiCard({
  criteres,
}: CriteresOffresEmploiCardProps) {
  const localite = getLocalite(criteres)
  const titre = getTitre(criteres.motsCles, localite)
  return (
    <div className='rounded-small shadow-s p-6'>
      <p className='text-base-bold mb-2'>{titre}</p>
      <DataTag text={'Offre d’emploi'} />
      {criteres.motsCles && (
        <DataTag className='ml-2' text={criteres.motsCles} />
      )}
      {criteres.debutantAccepte && (
        <DataTag className='ml-2' text={'Débutant accepté'} />
      )}
      {localite && (
        /*TODO-1027 autre moyen que div pour passer à la ligne?*/
        <div className='mt-4'>
          <DataTag text={localite.libelle} iconName={IconName.Location} />
        </div>
      )}
      {criteres.durees && (
        /*TODO-1027 autre moyen que div pour passer à la ligne?*/
        <div>
          {criteres.durees.map((duree) => (
            <DataTag className={'mt-4 mr-2'} key={duree} text={duree} />
          ))}
        </div>
      )}
      {criteres.typesContrats && (
        /*TODO-1027 autre moyen que div pour passer à la ligne?*/
        <div>
          {criteres.typesContrats.map((typeContrat) => (
            <DataTag
              className={'mt-4 mr-2'}
              key={typeContrat}
              text={typeContrat}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getLocalite(criteres: SearchOffresEmploiQuery): Localite | undefined {
  if (criteres.departement) {
    return criteres.departement
  } else if (criteres.commune) {
    return criteres.commune
  }
}

function getTitre(motsCles?: string, localite?: Localite): string {
  return [motsCles, localite?.libelle].filter((e) => e).join(' - ')
}
