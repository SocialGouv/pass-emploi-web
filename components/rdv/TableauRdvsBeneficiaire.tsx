import { useRouter } from 'next/router'
import React from 'react'

import EmptyState from 'components/EmptyState'
import { RdvRow } from 'components/rdv/RdvRow'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'

type TableauRdvsBeneficiaireProps = {
  idConseiller: string
  rdvs: EvenementListItem[]
  beneficiaire: BaseJeune
  additionalColumn?: ColumnHeaderLabel
}

export type ColumnHeaderLabel = 'Présent' | 'Modalité'

export default function TableauRdvsBeneficiaire({
  rdvs,
  idConseiller,
  beneficiaire,
  additionalColumn = 'Modalité',
}: TableauRdvsBeneficiaireProps) {
  const router = useRouter()
  const pathPrefix = router.asPath.startsWith('/etablissement')
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
        <Table asDiv={true} caption={{ text: 'Liste de mes événements' }}>
          <THead>
            <TR isHeader={true}>
              <TH>Horaires</TH>
              <TH>Type</TH>
              <TH>
                {additionalColumn}
                {isRdvPasses && (
                  <IconComponent
                    name={IconName.Info}
                    role='img'
                    focusable={false}
                    aria-label={informationLabel}
                    title={informationLabel}
                    className='w-3 h-3 ml-2 fill-primary inline'
                  />
                )}
              </TH>
              <TH>Créé par vous</TH>
            </TR>
          </THead>

          <TBody>
            {rdvs.map((rdv) => (
              <RdvRow
                key={rdv.id}
                rdv={rdv}
                withDate={true}
                beneficiaireUnique={beneficiaire}
                idConseiller={idConseiller}
                withIndicationPresenceBeneficiaire={isRdvPasses}
              />
            ))}
          </TBody>
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
  beneficiaire: BaseJeune
  isRdvPasses: boolean
  pathPrefix: string
}): React.JSX.Element {
  return (
    <>
      {isRdvPasses && (
        <EmptyState
          illustrationName={IllustrationName.Event}
          titre='Aucun événement ou rendez-vous pour votre bénéficiaire.'
          premierLien={{
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
          premierLien={{
            href: `${pathPrefix}/${beneficiaire.id}/rendez-vous-passes`,
            label: 'Consulter l’historique',
          }}
        />
      )}
    </>
  )
}
