import React from 'react'

import RechercheRow from 'components/favoris/recherches/RechercheRow'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
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
        <p className='text-base-regular mb-2'>
          Votre jeune n’a pas de recherche sauvegardée
        </p>
      )}

      {recherches.length > 0 && (
        <Table caption='Liste des recherches sauvegardées'>
          <THead>
            <TH>Nom de la recherche</TH>
            <TH>Mot clé/métier</TH>
            <TH>Lieu/localisation</TH>
            <TH>Type</TH>
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
