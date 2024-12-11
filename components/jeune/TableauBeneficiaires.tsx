import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { ForwardedRef, forwardRef, useEffect, useState } from 'react'

import SortIcon from '../ui/SortIcon'

import EmptyState from 'components/EmptyState'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import { BeneficiaireAvecInfosComplementaires } from 'interfaces/beneficiaire'
import { estMilo } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toShortDate } from 'utils/date'

const TableauBeneficiairesMilo = dynamic(
  () => import('components/jeune/TableauBeneficiairesMilo'),
  { ssr: false }
)
const TableauBeneficiairesPasMilo = dynamic(
  () => import('components/jeune/TableauBeneficiairesPasMilo'),
  { ssr: false }
)

type TableauBeneficiairesProps = {
  beneficiaires: BeneficiaireAvecInfosComplementaires[]
  total: number
}

function TableauBeneficiaires(
  { beneficiaires, total }: TableauBeneficiairesProps,
  ref: ForwardedRef<HTMLTableElement>
) {
  const [conseiller] = useConseiller()

  const nombrePages = Math.ceil(beneficiaires.length / 10)
  const [page, setPage] = useState<number>(1)

  const DEBUT_PERIODE = DateTime.now().startOf('week')
  const FIN_PERIODE = DateTime.now().endOf('week')
  const [
    triDerniereActiviteChronologique,
    setTriDerniereActiviteChronologique,
  ] = useState(false)
  const [beneficiairesTries, setBeneficiairesTries] = useState(
    trierParDerniereActivite(beneficiaires, triDerniereActiviteChronologique)
  )

  function trierParDerniereActivite(
    beneficiairesATrier: BeneficiaireAvecInfosComplementaires[],
    ordreChronologique: boolean
  ): BeneficiaireAvecInfosComplementaires[] {
    return beneficiairesATrier.toSorted((a, b) => {
      if (!a.isActivated || !b.isActivated)
        return Number(b.isActivated) - Number(a.isActivated)

      const dateA = DateTime.fromISO(a.lastActivity!)
      const dateB = DateTime.fromISO(b.lastActivity!)
      const diff = dateA.toMillis() - dateB.toMillis()
      return ordreChronologique ? diff : -diff
    })
  }

  useEffect(() => {
    setPage(1)
  }, [beneficiaires])

  useEffect(() => {
    setBeneficiairesTries(
      trierParDerniereActivite(beneficiaires, triDerniereActiviteChronologique)
    )
  }, [beneficiaires, triDerniereActiviteChronologique])

  return (
    <>
      {beneficiaires.length === 0 && (
        <EmptyState
          shouldFocus={true}
          illustrationName={IllustrationName.People}
          titre='Aucun bénéficiaire trouvé.'
          sousTitre='Recommencez ou modifiez votre recherche.'
        />
      )}

      {beneficiaires.length > 0 && (
        <>
          <h2 className='text-m-bold mb-2 text-center text-grey_800'>
            Semaine du {toShortDate(DEBUT_PERIODE)} au{' '}
            {toShortDate(FIN_PERIODE)}
          </h2>

          <button
            onClick={() => {
              setTriDerniereActiviteChronologique(
                !triDerniereActiviteChronologique
              )
            }}
            className='flex float-right mt-8 mb-8 text-m-regular text-right text-grey_800'
            title={
              triDerniereActiviteChronologique
                ? 'Trier par dernière activité ordre antichronologique'
                : 'Trier par dernière activité ordre chronologique'
            }
            aria-label={
              triDerniereActiviteChronologique
                ? 'Trier par dernière activité ordre antichronologique'
                : 'Trier par dernière activité ordre chronologique'
            }
            type='button'
          >
            Trier par dernière activité
            <SortIcon isDesc={!triDerniereActiviteChronologique} />
          </button>

          <Table
            ref={ref}
            caption={{
              text: 'Liste des bénéficiaires',
              count: total === beneficiaires.length ? total : undefined,
              visible: true,
            }}
          >
            {estMilo(conseiller) && (
              <TableauBeneficiairesMilo
                beneficiaires={beneficiairesTries}
                page={page}
                total={total}
              />
            )}

            {!estMilo(conseiller) && (
              <TableauBeneficiairesPasMilo
                beneficiaires={beneficiairesTries}
                page={page}
                total={total}
              />
            )}
          </Table>

          {nombrePages > 1 && (
            <Pagination
              pageCourante={page}
              nombreDePages={nombrePages}
              allerALaPage={setPage}
            />
          )}
        </>
      )}
    </>
  )
}

export default forwardRef(TableauBeneficiaires)
