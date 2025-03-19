import { DateTime } from 'luxon'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { IndicateursSemaine } from 'interfaces/beneficiaire'
import { toShortDate } from 'utils/date'

type ResumeIndicateursJeuneProps = {
  idBeneficiaire: string
  debutDeLaSemaine: DateTime
  finDeLaSemaine: DateTime
  indicateursSemaine: IndicateursSemaine | undefined
}

export function ResumeIndicateursJeune({
  idBeneficiaire,
  debutDeLaSemaine,
  finDeLaSemaine,
  indicateursSemaine,
}: ResumeIndicateursJeuneProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey-100'>
      <h2 className='text-m-bold text-grey-800'>Cette semaine</h2>
      <p className='mb-4'>
        du {toShortDate(debutDeLaSemaine)} au {toShortDate(finDeLaSemaine)}
      </p>
      <div
        className={`flex flex-wrap gap-6 ${
          !indicateursSemaine ? 'animate-pulse' : ''
        }`}
      >
        <div className='text-content-color text-base-bold'>
          <h3 className='mb-2'>Les actions</h3>
          <ul className='flex gap-2'>
            <TileIndicateur
              valeur={indicateursSemaine?.actions.creees.toString() ?? '-'}
              label={
                indicateursSemaine?.actions.creees !== 1 ? 'Créées' : 'Créée'
              }
              color='PRIMARY'
            />
            <TileIndicateur
              valeur={indicateursSemaine?.actions.terminees.toString() ?? '-'}
              label={
                indicateursSemaine?.actions.terminees !== 1
                  ? 'Terminées'
                  : 'Terminée'
              }
              color='ACCENT_3'
              iconName={IconName.CheckCircleFill}
            />
            <TileIndicateur
              valeur={indicateursSemaine?.actions.enRetard.toString() ?? '-'}
              label='En retard'
              color='WARNING'
              iconName={IconName.Error}
            />
          </ul>
        </div>
      </div>
      <LienVersIndicateurs
        idBeneficiaire={idBeneficiaire}
        pathPrefix={pathPrefix}
      />
    </div>
  )
}

function LienVersIndicateurs({
  idBeneficiaire,
  pathPrefix,
}: {
  idBeneficiaire: string
  pathPrefix: string
}) {
  return (
    <Link
      href={`${pathPrefix}/${idBeneficiaire}/informations?onglet=indicateurs`}
      className='flex items-center text-content-color underline hover:text-primary hover:fill-primary mt-4'
    >
      Voir plus d’indicateurs
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-[inherit]'
        aria-hidden={true}
        focusable={false}
      />
    </Link>
  )
}
