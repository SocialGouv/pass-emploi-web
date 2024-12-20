import { usePathname } from 'next/navigation'
import React, { ReactElement } from 'react'

import EmptyState from 'components/EmptyState'
import { EvenementRow } from 'components/rdv/EvenementRow'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Table from 'components/ui/Table/Table'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'

type TableauRdvsBeneficiaireProps = {
  idConseiller: string
  rdvs: EvenementListItem[]
  beneficiaire: BaseBeneficiaire
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

  const informationLabel =
    'L’information de présence est connue uniquement pour les informations collectives et les ateliers.'

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
        <Table caption={{ text: 'Liste de mes événements' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Horaires</TH>
              <TH>Type</TH>
              <TH title={isRdvPasses ? informationLabel : undefined}>
                {additionalColumn}
                {isRdvPasses && (
                  <IconComponent
                    name={IconName.Info}
                    role='img'
                    focusable={false}
                    aria-label={informationLabel}
                    className='w-3 h-3 ml-2 fill-primary inline'
                  />
                )}
              </TH>
              <TH>Créé par vous</TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>

          <tbody>
            {rdvs.map((rdv) => (
              <EvenementRow
                key={rdv.id}
                evenement={rdv}
                idConseiller={idConseiller}
                withIndicationPresenceBeneficiaire={isRdvPasses}
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
  beneficiaire: BaseBeneficiaire
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
          sousTitre='Créez un nouveau rendez-vous pour votre bénéficiaire ou consultez l’historique des événements passés.'
          lien={{
            href: `${pathPrefix}/${beneficiaire.id}/rendez-vous-passes`,
            label: 'Consulter l’historique',
          }}
        />
      )}
    </>
  )
}
