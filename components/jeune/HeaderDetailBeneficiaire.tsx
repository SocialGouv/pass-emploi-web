import React from 'react'

import DispositifTag from 'components/jeune/DispositifTag'
import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { CategorieSituation } from 'interfaces/beneficiaire'

type HeaderDetailBeneficiaireProps = {
  nomComplet: string
  conseillerEstMilo: boolean
  dispositif: string
  situation: CategorieSituation | undefined
  onSupprimerBeneficiaire: (() => void) | undefined
}
export default function HeaderDetailBeneficiaire({
  nomComplet,
  conseillerEstMilo,
  dispositif,
  onSupprimerBeneficiaire,
  situation,
}: HeaderDetailBeneficiaireProps) {
  return (
    <div className='rounded-t-[inherit] bg-primary-lighten px-6 py-4 flex flex-row justify-between items-center'>
      <div>
        <h1 className='text-m-bold'>{nomComplet}</h1>

        {conseillerEstMilo && (
          <dl className='mt-3 flex flex-row gap-1'>
            <dt className='sr-only'>Dispositif</dt>
            <dd>
              <DispositifTag dispositif={dispositif} onWhite={true} />
            </dd>

            <dt className='sr-only'>Situation</dt>
            <dd>
              {!situation && (
                <SituationTag situation={CategorieSituation.SANS_SITUATION} />
              )}

              {situation && <SituationTag situation={situation} />}
            </dd>
          </dl>
        )}
      </div>

      {onSupprimerBeneficiaire && (
        <button
          onClick={onSupprimerBeneficiaire}
          type='button'
          title='Supprimer ce compte'
          className='rounded-full hover:bg-primary hover:fill-white hover:shadow-base'
        >
          <IconComponent
            name={IconName.Delete}
            focusable={false}
            aria-hidden={true}
            className='m-1 w-6 h-6'
          />
          <span className='sr-only'>Supprimer ce compte</span>
        </button>
      )}
    </div>
  )
}
