import React from 'react'

import EmptyState from 'components/EmptyState'
import RechercheRow from 'components/favoris/recherches/RechercheRow'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Table from 'components/ui/Table/Table'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { Recherche } from 'interfaces/favoris'

interface TableauRecherchesProps {
  recherches: Recherche[]
}

export default function TableauRecherches({
  recherches,
}: TableauRecherchesProps) {
  return (
    <>
      {recherches.length === 0 && (
        <EmptyState
          illustrationName={IllustrationName.Checklist}
          titre='Votre bénéficiaire n’a sauvegardé aucune recherche pour l’instant.'
          sousTitre='Suggérez des recherches-types d’offres à votre bénéficiaire depuis la partie “Offres”.'
          lien={{
            href: '/offres',
            label: 'Rechercher une offre',
            iconName: IconName.Search,
          }}
        />
      )}

      {recherches.length > 0 && (
        <Table caption={{ text: 'Liste des recherches sauvegardées' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Nom de la recherche</TH>
              <TH>Mot clé/métier</TH>
              <TH>Lieu/localisation</TH>
              <TH>Type</TH>
            </TR>
          </thead>
          <tbody>
            {recherches.map((recherche) => (
              <RechercheRow key={recherche.id} recherche={recherche} />
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
