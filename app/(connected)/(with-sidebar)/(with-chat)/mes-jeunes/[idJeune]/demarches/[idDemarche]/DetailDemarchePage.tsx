'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React from 'react'

import propsStatutsDemarches from 'components/action/propsStatutsDemarches'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Demarche } from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { toLongMonthDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

type DetailDemarcheProps = {
  demarche: Demarche
  lectureSeule: boolean
  isStale: boolean
}

function DetailDemarchePage({
  demarche,
  lectureSeule,
  isStale,
}: DetailDemarcheProps) {
  const [portefeuille] = usePortefeuille()

  useMatomo(
    `Détail Demarche${lectureSeule ? ' - hors portefeuille' : ''}`,
    portefeuille.length > 0
  )
  return (
    <>
      {isStale && (
        <div className='mb-6'>
          <InformationMessage label='Cette démarche n’est peut-être pas à jour.'>
            <p className='pl-8'>
              Vous pouvez demander au bénéficiaire de se reconnecter à son
              application puis rafraîchir votre page.
            </p>
          </InformationMessage>
        </div>
      )}

      <div className='border-b-2 border-solid border-primary_lighten mb-5 pb-5'>
        <h2 className='text-m-bold text-grey_800 mb-6'>Statut</h2>
        <span className='text-base-bold'>
          {propsStatutsDemarches[demarche.statut].label}
        </span>
      </div>

      <div className='border-b-2 border-primary_lighten mt-8'>
        <h2 className='text-m-bold text-grey_800 mb-5'>
          Informations sur la démarche
        </h2>

        <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)] gap-6 pb-6'>
          <dt className='text-base-bold'>Catégorie :</dt>
          <dd className='text-base-regular'>{demarche.label}</dd>

          <dt className='text-base-bold'>Titre de la démarche :</dt>
          <dd className='text-base-regular'>{demarche.titre}</dd>

          <dt className='text-base-bold'>Moyen :</dt>
          <dd className='text-base-regular'>
            {demarche.sousTitre ?? (
              <>
                <span aria-hidden={true}>--</span>
                <span className='sr-only'>information non disponible</span>
              </>
            )}
          </dd>

          <dt className='text-base-bold'>Date d’échéance :</dt>
          <dd className='text-base-regular'>
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
