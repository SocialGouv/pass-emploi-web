import React from 'react'

import EmptyState from 'components/EmptyState'
import OffreRow from 'components/favoris/offres/OffreRow'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Table from 'components/ui/Table/Table'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { Offre } from 'interfaces/favoris'

interface TableauOffresProps {
  offres: Offre[]
}

export default function TableauOffres({ offres }: TableauOffresProps) {
  return (
    <>
      {offres.length === 0 && (
        <EmptyState
          illustrationName={IllustrationName.Checklist}
          titre='Votre bénéficiaire n’a mis aucune offre en favori pour l’instant.'
          sousTitre='Partagez des offres d’emploi, d’alternance, de service civique ou d’immersion à votre bénéficiaire depuis la partie “Offres”.'
          lien={{
            href: '/offres',
            label: 'Rechercher une offre',
            iconName: IconName.Search,
          }}
        />
      )}

      {offres.length > 0 && (
        <Table caption={{ text: 'Liste des offres en favoris' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Type et n° d’offre</TH>
              <TH>Titre</TH>
              <TH>Entreprise</TH>
              <TH>Statut</TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>
          <tbody>
            {offres.map((offre) => (
              <OffreRow key={offre.id} offre={offre} />
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
