import { DateTime } from 'luxon'
import React from 'react'

import Modal from 'components/Modal'
import { ConseillerHistorique } from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { toLongMonthDate, toShortDate } from 'utils/date'

interface HistoriqueConseillersModalProps {
  conseillers: ConseillerHistorique[]
  onClose: () => void
}

export default function HistoriqueConseillersModal({
  conseillers,
  onClose,
}: HistoriqueConseillersModalProps) {
  useMatomo('Détail jeune - historique conseillers', true)

  return (
    <Modal title='Historique des conseillers' onClose={onClose}>
      <ol className='list-disc'>
        {conseillers.map((conseiller, index, arr) => {
          const depuis = DateTime.fromISO(conseiller.depuis)
          const jusqua = arr[index - 1]?.depuis

          return (
            <li className='list-none text-base-regular' key={depuis.toMillis()}>
              Du{' '}
              <span aria-label={toLongMonthDate(depuis)}>
                {toShortDate(depuis)}
              </span>
              {!jusqua && ' à aujourd’hui'}
              {jusqua && (
                <>
                  {' '}
                  au{' '}
                  <span aria-label={toLongMonthDate(jusqua)}>
                    {toShortDate(jusqua)}
                  </span>
                </>
              )}{' '}
              :{' '}
              <span className='text-base-bold'>
                {conseiller.nom} {conseiller.prenom}
              </span>
            </li>
          )
        })}
      </ol>
    </Modal>
  )
}
