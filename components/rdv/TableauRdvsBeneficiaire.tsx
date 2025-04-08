import { usePathname } from 'next/navigation'
import React, { ReactElement } from 'react'

import EmptyState from 'components/EmptyState'
import { EvenementRow } from 'components/rdv/EvenementRow'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Table from 'components/ui/Table/Table'
import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'

type TableauRdvsBeneficiaireProps = {
  idConseiller: string
  rdvs: EvenementListItem[]
  beneficiaire: IdentiteBeneficiaire
  additionalColumn?: ColumnHeaderLabel
}

export type ColumnHeaderLabel = 'Présent' | 'Modalité'

export default function TableauRdvsBeneficiaire({
  rdvs,
  idConseiller,
  beneficiaire,
  additionalColumn = 'Modalité',
}: TableauRdvsBeneficiaireProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'
  const isRdvPasses = additionalColumn === 'Présent'

  return (
    <>
      {rdvs.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <StateAucunRendezvous
            beneficiaire={beneficiaire}
            isRdvPasses={isRdvPasses}
            pathPrefix={pathPrefix}
          />
        </div>
      )}

      {rdvs.length > 0 && (
        <Table
          caption={{
            text: `Liste des rendez-vous et ateliers de ${beneficiaire.prenom} ${beneficiaire.nom}`,
          }}
        >
          <thead className='sr-only'>
            <tr>
              <th scope='col'>Horaires et durée</th>
              <th scope='col'>Titre et modalités</th>
              <th scope='col'>Créateur</th>
              <th scope='col'>Présence</th>
              <th scope='col'>Voir le détail</th>
            </tr>
          </thead>

          <tbody>
            {rdvs.map((rdv) => (
              <EvenementRow
                key={rdv.id}
                evenement={rdv}
                idConseiller={idConseiller}
              />
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

function StateAucunRendezvous({
  beneficiaire,
  isRdvPasses,
  pathPrefix,
}: {
  beneficiaire: IdentiteBeneficiaire
  isRdvPasses: boolean
  pathPrefix: string
}): ReactElement {
  return (
    <>
      {isRdvPasses && (
        <EmptyState
          illustrationName={IllustrationName.Event}
          titre='Aucun événement ou rendez-vous pour votre bénéficiaire.'
          lien={{
            href: `${pathPrefix}/${beneficiaire.id}`,
            label: 'Revenir à la fiche bénéficiaire',
            iconName: IconName.ChevronLeft,
          }}
        />
      )}

      {!isRdvPasses && (
        <EmptyState
          illustrationName={IllustrationName.Event}
          titre='Aucun événement ou rendez-vous sur cette période pour votre bénéficiaire.'
          sousTitre='Créez un nouveau rendez-vous pour votre bénéficiaire.'
        />
      )}
    </>
  )
}
