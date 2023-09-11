import { DateTime } from 'luxon'
import React from 'react'

import EmptyStateImage from 'assets/images/illustration-event-grey.svg'
import { RdvRow } from 'components/rdv/RdvRow'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'
import {
  insertIntercalaires,
  renderListeWithIntercalaires,
} from 'presentation/Intercalaires'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import ButtonLink from 'components/ui/Button/ButtonLink'
import EmptyState from 'components/EmptyState'

type TableauRdvProps = {
  idConseiller: string
  rdvs: EvenementListItem[]
  withIntercalaires?: boolean
  beneficiaireUnique?: BaseJeune
  additionalColumns?: ColumnHeaderLabel
}

export type ColumnHeaderLabel = 'Présent' | 'Modalité'

export default function TableauRdv({
  rdvs,
  idConseiller,
  withIntercalaires = false,
  beneficiaireUnique,
  additionalColumns = 'Modalité',
}: TableauRdvProps) {
  const rdvsAffiches = withIntercalaires
    ? insertIntercalaires(rdvs, ({ date }) => DateTime.fromISO(date))
    : rdvs

  const informationLabel =
    'L’information de présence est connue uniquement pour les informations collectives et les ateliers.'

  return (
    <>
      {rdvs.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre='Aucun événement ou rendez-vous pour votre bénéficiaire.'
          />
        </div>
      )}

      {rdvs.length > 0 && (
        <Table asDiv={true} caption={{ text: 'Liste de mes événements' }}>
          <THead>
            <TR isHeader={true}>
              <TH>Horaires</TH>
              {!beneficiaireUnique && <TH>Bénéficiaire</TH>}
              <TH>Type</TH>
              <TH>
                {additionalColumns}
                {additionalColumns === 'Présent' && (
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
            {renderListeWithIntercalaires(rdvsAffiches, (rdv) => (
              <RdvRow
                key={rdv.id}
                rdv={rdv}
                withDate={!withIntercalaires}
                beneficiaireUnique={beneficiaireUnique}
                idConseiller={idConseiller}
                withIndicationPresenceBeneficiaire={
                  additionalColumns === 'Présent'
                }
              />
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
