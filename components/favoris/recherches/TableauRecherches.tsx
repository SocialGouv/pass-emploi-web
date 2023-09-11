import React from 'react'

import RechercheRow from 'components/favoris/recherches/RechercheRow'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { Recherche } from 'interfaces/favoris'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import EmptyState from 'components/EmptyState'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ButtonLink from 'components/ui/Button/ButtonLink'

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
          CTAPrimary={
            <ButtonLink href={`/recherche-offres`} className='ml-4'>
              <IconComponent
                name={IconName.Search}
                focusable='false'
                aria-hidden='true'
                className='mr-2 w-4 h-4'
              />
              Rechercher une offre
            </ButtonLink>
          }
        />
      )}

      {recherches.length > 0 && (
        <Table caption={{ text: 'Liste des recherches sauvegardées' }}>
          <THead>
            <TR isHeader={true}>
              <TH>Nom de la recherche</TH>
              <TH>Mot clé/métier</TH>
              <TH>Lieu/localisation</TH>
              <TH>Type</TH>
            </TR>
          </THead>
          <TBody>
            {recherches.map((recherche) => (
              <RechercheRow key={recherche.id} recherche={recherche} />
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
