'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import { DetailBeneficiaire } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type RendezVousPassesProps = {
  beneficiaire: DetailBeneficiaire
  rdvs: EvenementListItem[]
}

function RendezVousPassesPage({ beneficiaire, rdvs }: RendezVousPassesProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const trackingLabel = `Détail jeune - Rendez-vous passés ${
    !estConseillerReferent(conseiller, beneficiaire)
      ? ' - hors portefeuille'
      : ''
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
