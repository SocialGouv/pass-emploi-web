import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Localite } from 'interfaces/referentiel'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

interface CriteresOffresEmploiCardProps {
  titre: string
  localite?: Localite
  criteres: SearchOffresEmploiQuery
}

export default function CriteresOffresEmploiCard({
  titre,
  localite,
  criteres,
}: CriteresOffresEmploiCardProps) {
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
