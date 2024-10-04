'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React from 'react'

import propsStatutsDemarches from 'components/action/propsStatutsDemarches'
import { Demarche } from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { toLongMonthDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

type DetailActionProps = {
  demarche: Demarche
  lectureSeule: boolean
}

function DetailDemarchePage({ demarche, lectureSeule }: DetailActionProps) {
  const [portefeuille] = usePortefeuille()

  useMatomo(
    `Détail Demarche${lectureSeule ? ' - hors portefeuille' : ''}`,
    portefeuille.length > 0
  )
  return (
    <>
      <div className='border-b-2 border-solid border-primary_lighten pt-5'>
        <dl>
          <dt>
            <h2 className='text-m-bold text-grey_800 pb-6'>Statut</h2>
          </dt>
          <dd className='text-base-bold mb-4'>
            {propsStatutsDemarches[demarche.statut].label}
          </dd>
        </dl>
      </div>

      <div className='border-b-2 border-primary_lighten mt-8'>
        <h2 className='text-m-bold text-grey_800 mb-5'>
          Informations sur la démarche
        </h2>

        <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
          <dt className='text-base-bold pb-6'>
            <span>Catégorie :</span>
          </dt>
          <dd className='text-base-regular pl-6'>{demarche.label}</dd>
          <dt className='text-base-bold pb-6'>
            <span>Titre de la démarche :</span>
          </dt>
          <dd className='text-base-regular pl-6'>{demarche.titre}</dd>
          <dt className='text-base-bold pb-6'>
            <span>Moyen :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {demarche.sousTitre ?? (
              <>
                --
                <span className='sr-only'>information non disponible</span>
              </>
            )}
          </dd>
          <dt className='text-base-bold pb-6'>
            <span>Date d’échéance :</span>
          </dt>
          <dd className='text-base-regular pl-6'>
            {toLongMonthDate(demarche.dateFin)}
          </dd>
        </dl>
      </div>
    </>
  )
}

export default withTransaction(
  DetailDemarchePage.name,
  'page'
)(DetailDemarchePage)
