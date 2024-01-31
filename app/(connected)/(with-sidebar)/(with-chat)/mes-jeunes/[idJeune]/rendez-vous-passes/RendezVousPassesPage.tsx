'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type RendezVousPassesProps = {
  beneficiaire: BaseJeune
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
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  useMatomo(trackingLabel, aDesBeneficiaires)

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
