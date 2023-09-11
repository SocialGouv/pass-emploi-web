import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import EmptyState from 'components/EmptyState'
import { RdvRow } from 'components/rdv/RdvRow'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
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
  const router = useRouter()
  const isRdvPasses = router.asPath.endsWith('/rendez-vous-passes')
  const pathPrefix = router.asPath.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const rdvsAffiches = withIntercalaires
    ? insertIntercalaires(rdvs, ({ date }) => DateTime.fromISO(date))
    : rdvs

  const informationLabel =
    'L’information de présence est connue uniquement pour les informations collectives et les ateliers.'

  return (
    <>
      {rdvs.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          {!beneficiaireUnique && (
            <>
              <EmptyState
                illustrationName={IllustrationName.Checklist}
                titre='Vous n’avez rien de prévu pour l’instant.'
                CTAPrimary={
                  <ButtonLink href='/mes-jeunes/edition-rdv'>
                    <IconComponent
                      name={IconName.Add}
                      focusable={false}
                      aria-hidden={true}
                      className='mr-2 w-4 h-4'
                    />
                    Créer un rendez-vous
                  </ButtonLink>
                }
                CTASecondary={
                  <ButtonLink href='/mes-jeunes/edition-rdv?type=ac'>
                    <IconComponent
                      name={IconName.Add}
                      focusable={false}
                      aria-hidden={true}
                      className='mr-2 w-4 h-4'
                    />
                    Créer une animation collective
                  </ButtonLink>
                }
              />
            </>
          )}

          {beneficiaireUnique && isRdvPasses && (
            <>
              <EmptyState
                illustrationName={IllustrationName.Event}
                titre='Aucun événement ou rendez-vous pour votre bénéficiaire.'
                CTAPrimary={
                  <ButtonLink href={`${pathPrefix}/${beneficiaireUnique.id}`}>
                    <IconComponent
                      name={IconName.ChevronRight}
                      focusable={false}
                      aria-hidden={true}
                      className='mr-2 w-4 h-4'
                    />
                    Revenir à la fiche bénéficiaire
                  </ButtonLink>
                }
              />
            </>
          )}

          {beneficiaireUnique && !isRdvPasses && (
            <>
              <EmptyState
                illustrationName={IllustrationName.Event}
                titre='Aucun événement ou rendez-vous sur cette période pour votre bénéficiaire.'
                sousTitre='Créez un nouveau rendez-vous pour votre bénéficiaire ou consultez l’historique des événements passés.'
                CTAPrimary={
                  <ButtonLink
                    href={`${pathPrefix}/${beneficiaireUnique.id}/rendez-vous-passes`}
                  >
                    <IconComponent
                      name={IconName.ChevronRight}
                      focusable={false}
                      aria-hidden={true}
                      className='mr-2 w-4 h-4'
                    />
                    Consulter l’historique
                  </ButtonLink>
                }
              />
            </>
          )}
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
