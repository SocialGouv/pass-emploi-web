import React, { useEffect, useRef } from 'react'

import { EvenementRow } from 'components/rdv/EvenementRow'
import Table from 'components/ui/Table/Table'
import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'

type TableauRdvsBeneficiaireProps = {
  idConseiller: string
  rdvs: EvenementListItem[]
  beneficiaire: IdentiteBeneficiaire
  shouldFocus: boolean
}

export default function TableauRdvsBeneficiaire({
  rdvs,
  idConseiller,
  beneficiaire,
  shouldFocus,
}: TableauRdvsBeneficiaireProps) {
  const isFirstRender = useRef<boolean>(true)
  const listeRdvsRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    isFirstRender.current = false
    return () => {
      isFirstRender.current = true
    }
  }, [])

  useEffect(() => {
    if (isFirstRender.current) return
    if (shouldFocus) listeRdvsRef.current!.focus()
  }, [shouldFocus])

  return (
    <Table
      ref={listeRdvsRef}
      caption={{
        text: `Liste des rendez-vous et ateliers de ${beneficiaire.prenom} ${beneficiaire.nom}`,
      }}
    >
      <thead className='sr-only'>
        <tr>
          <th scope='col'>Horaires et durée</th>
          <th scope='col'>Titre et modalités</th>
          <th scope='col'>Créateur</th>
          <th scope='col'>Présence</th>
          <th scope='col'>Voir le détail</th>
        </tr>
      </thead>

      <tbody>
        {rdvs.map((rdv) => (
          <EvenementRow
            key={rdv.id}
            evenement={rdv}
            idConseiller={idConseiller}
          />
        ))}
      </tbody>
    </Table>
  )
}
