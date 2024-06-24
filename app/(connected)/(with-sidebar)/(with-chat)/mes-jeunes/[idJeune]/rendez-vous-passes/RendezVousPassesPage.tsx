'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type RendezVousPassesProps = {
  beneficiaire: BaseBeneficiaire
  lectureSeule: boolean
  rdvs: EvenementListItem[]
}

function RendezVousPassesPage({
  beneficiaire,
  lectureSeule,
  rdvs,
}: RendezVousPassesProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const trackingLabel = `Détail jeune - Rendez-vous passés ${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <TableauRdvsBeneficiaire
      rdvs={rdvs}
      idConseiller={conseiller.id}
      beneficiaire={beneficiaire}
      additionalColumn='Présent'
    />
  )
}

export default withTransaction(
  RendezVousPassesPage.name,
  'page'
)(RendezVousPassesPage)
