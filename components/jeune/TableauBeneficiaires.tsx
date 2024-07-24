import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauBeneficiairesFT from 'components/jeune/TableauBeneficiairesFT'
import TableauBeneficiairesMilo from 'components/jeune/TableauBeneficiairesMilo'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import { BeneficiaireAvecInfosComplementaires } from 'interfaces/beneficiaire'
import { estFranceTravail, estMilo } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface TableauBeneficiairesProps {
  beneficiairesFiltres: BeneficiaireAvecInfosComplementaires[]
  total: number
}

export default function TableauBeneficiaires({
  beneficiairesFiltres,
  total,
}: TableauBeneficiairesProps) {
  const [conseiller] = useConseiller()

  const nombrePages = Math.ceil(beneficiairesFiltres.length / 10)
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    setPage(1)
  }, [beneficiairesFiltres])

  return (
    <>
      {beneficiairesFiltres.length === 0 && (
        <>
          <EmptyState
            illustrationName={IllustrationName.People}
            titre='Aucun bénéficiaire trouvé.'
            sousTitre='Recommencez ou modifiez votre recherche.'
          />
        </>
      )}

      {beneficiairesFiltres.length > 0 && (
        <>
          {estMilo(conseiller) && (
            <TableauBeneficiairesMilo
              beneficiairesFiltres={beneficiairesFiltres}
              page={page}
              total={total}
            />
          )}

          {estFranceTravail(conseiller) && (
            <TableauBeneficiairesFT
              beneficiairesFiltres={beneficiairesFiltres}
              page={page}
              total={total}
            />
          )}

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
