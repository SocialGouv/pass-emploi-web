import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import DispositifTag from 'components/jeune/DispositifTag'
import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ProgressComptageHeure } from 'components/ui/Indicateurs/ProgressComptageHeure'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  BeneficiaireAvecInfosComplementaires,
  CompteurHeuresPortefeuille,
  estCEJ,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { estMilo } from 'interfaces/structure'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toRelativeDateTime } from 'utils/date'

interface TableauBeneficiairesMiloProps {
  beneficiaires: BeneficiaireAvecInfosComplementaires[]
  comptagesHeures: CompteurHeuresPortefeuille | null
  page: number
  total: number
}

export default function TableauBeneficiairesMilo({
  beneficiaires,
  comptagesHeures,
  page,
  total,
}: TableauBeneficiairesMiloProps) {
  const [conseiller] = useConseiller()

  const [beneficiairesAffiches, setBeneficiairesAffiches] = useState<
    BeneficiaireAvecInfosComplementaires[]
  >([])

  const comptageHeuresColumn = 'Nombre d’heures déclarées'
  const actionsColumn = 'Actions créées'
  const rdvColumn = 'RDV et ateliers'
  const derniereActiviteColumn = 'Dernière activité'

  function doitAfficherComptageHeures(
    beneficiaire: BeneficiaireAvecInfosComplementaires
  ) {
    return (
      estCEJ(beneficiaire) &&
      estMilo(conseiller.structure) &&
      conseiller.agence?.id &&
      (process.env.NEXT_PUBLIC_COMPTAGE_HEURES_EARLY_ADOPTERS ?? '')
        .split(',')
        .includes(conseiller.agence.id)
    )
  }

  function getHeuresCalculeesParBeneficiaire(idBeneficiaire: string) {
    const compteurHeures = comptagesHeures?.comptages?.find(
      (compteur) => compteur.idBeneficiaire === idBeneficiaire
    )
    return compteurHeures?.nbHeuresDeclarees ?? 0
  }

  function getTempsDerniereMiseAJour(date: string) {
    const dateTime = DateTime.fromISO(date)
    const now = DateTime.now()
    const diff = now.diff(dateTime, ['hours', 'minutes']).toObject()

    const hours = Math.floor(diff.hours ?? 0)
    const minutes = Math.floor(diff.minutes ?? 0)

    let result = 'il y a '
    if (hours === 0 && minutes === 0) {
      return 'maintenant'
    }

    if (hours > 0) {
      result += `${hours}h `
    }
    result += `${minutes}min`

    return result.trim()
  }

  useEffect(() => {
    setBeneficiairesAffiches(beneficiaires.slice(10 * (page - 1), 10 * page))
  }, [beneficiaires, page])

  useMatomo('Mes jeunes', total > 0)

  return (
    <>
      <thead className='sr-only'>
        <TR isHeader={true}>
          <TH>Bénéficiaire et situation</TH>
          <TH>{comptageHeuresColumn}</TH>
          <TH>{actionsColumn}</TH>
          <TH>{rdvColumn}</TH>
          <TH>{derniereActiviteColumn}</TH>
          <TH>Voir le détail</TH>
        </TR>
      </thead>

      <tbody className='grid grid-cols-[repeat(5,auto)] layout-m:grid-cols-[repeat(6,auto)] gap-y-2'>
        {beneficiairesAffiches.map(
          (beneficiaire: BeneficiaireAvecInfosComplementaires) => (
            <TR
              key={beneficiaire.id}
              className='grid grid-cols-subgrid grid-rows-[repeat(2,auto)] layout-m:grid-rows-[auto] col-span-full items-center'
            >
              <TD
                isBold
                className='h-full p-2! rounded-tl-base! rounded-bl-none! layout-m:rounded-l-base!'
              >
                <div>
                  {beneficiaire.structureMilo?.id ===
                    conseiller.structureMilo?.id &&
                    beneficiaire.isReaffectationTemporaire && (
                      <span className='self-center mr-2'>
                        <IconComponent
                          name={IconName.Schedule}
                          focusable={false}
                          className='w-4 h-4'
                          role='img'
                          aria-labelledby={`label-beneficiaire-temporaire-${beneficiaire.id}`}
                          title='bénéficiaire temporaire'
                        />
                        <span
                          id={`label-beneficiaire-temporaire-${beneficiaire.id}`}
                          className='sr-only'
                        >
                          bénéficiaire temporaire
                        </span>
                      </span>
                    )}
                  {beneficiaire.structureMilo?.id !==
                    conseiller.structureMilo?.id && (
                    <span className='self-center mr-2'>
                      <IconComponent
                        name={IconName.Error}
                        focusable={false}
                        role='img'
                        aria-labelledby={`label-ml-differente-${beneficiaire.id}`}
                        className='inline w-4 h-4 fill-warning'
                        title='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre.'
                      />
                      <span
                        id={`label-ml-differente-${beneficiaire.id}`}
                        className='sr-only'
                      >
                        Ce bénéficiaire est rattaché à une Mission Locale
                        différente de la vôtre.
                      </span>
                    </span>
                  )}
                  {getNomBeneficiaireComplet(beneficiaire)}
                </div>
                <div className='mt-2 flex gap-2'>
                  <DispositifTag dispositif={beneficiaire.dispositif} />
                  <SituationTag situation={beneficiaire.situationCourante} />
                </div>
              </TD>

              <TD className='relative h-full p-4! after:content-none after:absolute after:right-0 after:top-4 after:bottom-4 after:border-l-2 after:border-grey-500 layout-m:after:content-[""]'>
                {doitAfficherComptageHeures(beneficiaire) &&
                  comptagesHeures && (
                    <>
                      <span className='text-s-regular mb-4'>
                        Actualisé{' '}
                        {getTempsDerniereMiseAJour(
                          comptagesHeures.dateDerniereMiseAJour
                        )}
                      </span>
                      <ProgressComptageHeure
                        heures={getHeuresCalculeesParBeneficiaire(
                          beneficiaire.id
                        )}
                        label='déclarée'
                        className='w-3/4'
                      />
                    </>
                  )}

                {doitAfficherComptageHeures(beneficiaire) &&
                  !comptagesHeures && (
                    <p className='text-s-regular text-warning flex'>
                      <IconComponent
                        name={IconName.Info}
                        aria-hidden={true}
                        focusable={false}
                        className='w-6 h-6 mr-2 fill-warning shrink-0'
                      />
                      Comptage des heures indisponible
                    </p>
                  )}
              </TD>

              <TD className='h-full p-2!'>
                <div
                  className='text-s-regular text-grey-800 mb-2'
                  aria-hidden={true}
                >
                  {actionsColumn}
                </div>
                <span className='text-m-bold'>
                  {beneficiaire.actionsCreees}
                </span>
              </TD>

              <TD className='h-full p-2!'>
                <div
                  className='text-s-regular text-grey-800 mb-2'
                  aria-hidden={true}
                >
                  {rdvColumn}
                </div>
                <span className='text-m-bold'>{beneficiaire.rdvs}</span>
              </TD>

              <TD className='h-full p-2! row-start-2 col-span-4 flex flex-row justify-start items-baseline gap-4 rounded-bl-base layout-m:row-start-1 layout-m:col-start-5 layout-m:col-span-1 layout-m:rounded-none layout-m:flex-col layout-m:gap-0 layout-m:justify-center layout-m:pt-0'>
                {beneficiaire.lastActivity && (
                  <>
                    <span
                      className='text-xs-regular text-grey-800 mb-2'
                      aria-hidden={true}
                    >
                      {derniereActiviteColumn}
                    </span>
                    <span className='text-s-regular'>
                      {toRelativeDateTime(beneficiaire.lastActivity)}
                    </span>
                  </>
                )}
                {!beneficiaire.lastActivity && (
                  <span className='text-s-regular text-warning'>
                    Compte non activé
                  </span>
                )}
              </TD>

              <TDLink
                href={`/mes-jeunes/${beneficiaire.id}`}
                labelPrefix='Accéder à la fiche de'
                className='p-2! row-span-2 h-full flex items-center justify-center layout-m:row-span-1'
              />
            </TR>
          )
        )}
      </tbody>
    </>
  )
}
