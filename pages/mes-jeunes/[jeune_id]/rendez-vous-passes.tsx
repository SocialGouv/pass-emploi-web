import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import TableauRdv from 'components/rdv/TableauRdv'
import { StructureConseiller } from 'interfaces/conseiller'
import { PeriodeEvenements, EvenementListItem } from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { EvenementsService } from 'services/evenements.service'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import withDependance from 'utils/injectionDependances/withDependance'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface RendezVousPassesProps {
  beneficiaire: BaseJeune
  lectureSeule: boolean
  rdvs: EvenementListItem[]
}

function RendezVousPasses({
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
    <TableauRdv
      rdvs={rdvs}
      idConseiller={conseiller.id}
      beneficiaireUnique={beneficiaire}
      additionalColumns='Présent'
    />
  )
}

export const getServerSideProps: GetServerSideProps<
  RendezVousPassesProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const evenementsService =
    withDependance<EvenementsService>('evenementsService')
  const jeunesService = withDependance<JeunesService>('jeunesService')

  const {
    session: {
      accessToken,
      user: { structure, id },
    },
  } = sessionOrRedirect

  const isPoleEmploi = structure === StructureConseiller.POLE_EMPLOI
  const idBeneficiaire = context.query.jeune_id as string

  const [beneficiaire, rdvs] = await Promise.all([
    jeunesService.getJeuneDetails(idBeneficiaire, accessToken),
    isPoleEmploi
      ? []
      : await evenementsService.getRendezVousJeune(
          idBeneficiaire,
          PeriodeEvenements.PASSES,
          accessToken
        ),
  ])
  if (!beneficiaire) {
    return { notFound: true }
  }

  const lectureSeule = beneficiaire.idConseiller !== id

  return {
    props: {
      beneficiaire,
      lectureSeule,
      rdvs,
      pageTitle: 'Rendez-vous passés de ' + getNomJeuneComplet(beneficiaire),
    },
  }
}

export default withTransaction(RendezVousPasses.name, 'page')(RendezVousPasses)
