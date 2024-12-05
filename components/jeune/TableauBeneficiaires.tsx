import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { ForwardedRef, forwardRef, useEffect, useState } from 'react'

import SortIcon from '../ui/SortIcon'

import EmptyState from 'components/EmptyState'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import {
  BaseBeneficiaire,
  BeneficiaireAvecInfosComplementaires,
} from 'interfaces/beneficiaire'
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
  beneficiairesFiltres: BeneficiaireAvecInfosComplementaires[]
  total: number
}

function TableauBeneficiaires(
  { beneficiairesFiltres, total }: TableauBeneficiairesProps,
  ref: ForwardedRef<HTMLTableElement>
) {
  const [conseiller] = useConseiller()

  const nombrePages = Math.ceil(beneficiairesFiltres.length / 10)
  const [page, setPage] = useState<number>(1)

  const DEBUT_PERIODE = DateTime.now().startOf('week')
  const FIN_PERIODE = DateTime.now().endOf('week')
  const [triDerniereActiviter, setTriDerniereActiviter] = useState(true)
  const [triBeneficiaires, setTriBeneficiaires] = useState(beneficiairesFiltres)

  const trierParDerniereActivite = () => {
    const nouvelleTri = !triDerniereActiviter
    const triBeneficiaires = [...beneficiairesFiltres].sort((a, b) => {
      if (!a.isActivated && !b.isActivated) return 0
      if (!a.isActivated) return 1
      if (!b.isActivated) return -1

      const dateA = DateTime.fromISO(a.lastActivity!)
      const dateB = DateTime.fromISO(b.lastActivity!)
      return nouvelleTri
        ? dateB.diff(dateA).milliseconds
        : dateA.diff(dateB).milliseconds
    })

    setTriBeneficiaires(triBeneficiaires)
    setPage(1)
    setTriDerniereActiviter(nouvelleTri)
  }

  useEffect(() => {
    setTriBeneficiaires(beneficiairesFiltres)
    setPage(1)
  }, [beneficiairesFiltres])

  return (
    <>
      {triBeneficiaires.length === 0 && (
        <EmptyState
          shouldFocus={true}
          illustrationName={IllustrationName.People}
          titre='Aucun bénéficiaire trouvé.'
          sousTitre='Recommencez ou modifiez votre recherche.'
        />
      )}

      {triBeneficiaires.length > 0 && (
        <>
          <h2 className='text-m-bold mb-2 text-center text-grey_800'>
            Semaine du {toShortDate(DEBUT_PERIODE)} au{' '}
            {toShortDate(FIN_PERIODE)}
          </h2>

          <button
            onClick={trierParDerniereActivite}
            className='flex float-right mt-8 mb-8 text-m-regular text-right text-grey_800'
            title={
              triDerniereActiviter
                ? 'Trier par dernière activité ordre anticronologique'
                : 'Trier par dernière activité ordre cronologique'
            }
            type='button'
          >
            Trier par dernière activité
            <SortIcon isDesc={triDerniereActiviter} />
          </button>

          <Table
            ref={ref}
            caption={{
              text: 'Liste des bénéficiaires',
              count: total === triBeneficiaires.length ? total : undefined,
              visible: true,
            }}
          >
            {estMilo(conseiller) && (
              <TableauBeneficiairesMilo
                beneficiairesFiltres={triBeneficiaires}
                page={page}
                total={total}
              />
            )}

            {!estMilo(conseiller) && (
              <TableauBeneficiairesPasMilo
                beneficiairesFiltres={triBeneficiaires}
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
