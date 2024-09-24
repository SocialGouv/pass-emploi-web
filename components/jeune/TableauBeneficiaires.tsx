import { DateTime } from 'luxon'
import React, { ForwardedRef, forwardRef, useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauBeneficiairesFT from 'components/jeune/TableauBeneficiairesFT'
import TableauBeneficiairesMilo from 'components/jeune/TableauBeneficiairesMilo'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import { BeneficiaireAvecInfosComplementaires } from 'interfaces/beneficiaire'
import { estMilo } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toShortDate } from 'utils/date'

interface TableauBeneficiairesProps {
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

  useEffect(() => {
    setPage(1)
  }, [beneficiairesFiltres])

  return (
    <>
      {beneficiairesFiltres.length === 0 && (
        <EmptyState
          shouldFocus={true}
          illustrationName={IllustrationName.People}
          titre='Aucun bénéficiaire trouvé.'
          sousTitre='Recommencez ou modifiez votre recherche.'
        />
      )}

      {beneficiairesFiltres.length > 0 && (
        <>
          {estMilo(conseiller) && (
            <h2 className='text-m-bold mb-2 text-center text-grey_800'>
              Semaine du {toShortDate(DEBUT_PERIODE)} au{' '}
              {toShortDate(FIN_PERIODE)}
            </h2>
          )}

          <Table
            ref={ref}
            caption={{
              text: 'Liste des bénéficiaires',
              count: total === beneficiairesFiltres.length ? total : undefined,
              visible: true,
            }}
          >
            {estMilo(conseiller) && (
              <TableauBeneficiairesMilo
                beneficiairesFiltres={beneficiairesFiltres}
                page={page}
                total={total}
              />
            )}

            {!estMilo(conseiller) && (
              <TableauBeneficiairesFT
                beneficiairesFiltres={beneficiairesFiltres}
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
