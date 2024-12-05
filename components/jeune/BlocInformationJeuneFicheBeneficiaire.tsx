import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import {
  Email,
  IdentifiantPartenaire,
  InformationNonDisponible,
} from 'components/jeune/BlocInformationJeune'
import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { CategorieSituation, EtatSituation } from 'interfaces/beneficiaire'
import {
  Conseiller,
  estConseilDepartemental,
  estMilo,
} from 'interfaces/conseiller'
import { toShortDate } from 'utils/date'

interface BlocInformationJeuneFicheBeneficiaireProps {
  conseiller: Conseiller
  idBeneficiaire: string
  dateFinCEJ?: string
  email?: string
  situations?: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
  urlDossier?: string
  onIdentifiantPartenaireCopie?: () => void
  identifiantPartenaire?: string
  onIdentifiantPartenaireClick?: () => void
}

export function BlocInformationJeuneFicheBeneficiaire({
  conseiller,
  dateFinCEJ,
  email,
  idBeneficiaire,
  situations,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
}: BlocInformationJeuneFicheBeneficiaireProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'
  const conseillerEstMilo = estMilo(conseiller)
  const aIdentifiantFT =
    !conseillerEstMilo && !estConseilDepartemental(conseiller)
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      <h2 className='text-m-bold text-grey_800 mb-2'>Informations</h2>

      {conseillerEstMilo && (
        <>
          {!situations?.length && (
            <div className='mb-3'>
              <SituationTag situation={CategorieSituation.SANS_SITUATION} />
            </div>
          )}

          {Boolean(situations?.length) && (
            <SituationTag situation={situations![0].categorie} />
          )}
        </>
      )}

      <dl className='flex flex-col'>
        {conseillerEstMilo && (
          <div className='flex'>
            <dt className='text-base-regular'>Date de fin du CEJ :</dt>
            <dd className='text-base-bold ml-1'>
              {dateFinCEJ ? (
                toShortDate(dateFinCEJ)
              ) : (
                <InformationNonDisponible />
              )}
            </dd>
          </div>
        )}

        {email && <Email email={email} />}

        {aIdentifiantFT &&
          onIdentifiantPartenaireCopie &&
          onIdentifiantPartenaireClick && (
            <IdentifiantPartenaire
              identifiantPartenaire={identifiantPartenaire}
              onCopy={onIdentifiantPartenaireCopie}
              onClick={onIdentifiantPartenaireClick}
            />
          )}
      </dl>

      <LienVersInformations
        idBeneficiaire={idBeneficiaire}
        pathPrefix={pathPrefix}
      />
    </div>
  )
}

function LienVersInformations({
  idBeneficiaire,
  pathPrefix,
}: {
  idBeneficiaire: string
  pathPrefix: string
}) {
  return (
    <Link
      href={`${pathPrefix}/${idBeneficiaire}/informations?onglet=informations`}
      className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'
    >
      Voir plus d’informations
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-[inherit]'
        aria-hidden={true}
        focusable={false}
      />
    </Link>
  )
}
