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

interface RendezVousPassesProps {
  beneficiaire: BaseJeune
  rdvs: EvenementListItem[]
}

function RendezVousPasses({ beneficiaire, rdvs }: RendezVousPassesProps) {
  const [conseiller] = useConseiller()

  useMatomo('Détail jeune - Rendez-vous passés')

  return (
    <TableauRdv
      rdvs={rdvs}
      idConseiller={conseiller?.id ?? ''}
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
      user: { structure },
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

  return {
    props: {
      beneficiaire,
      rdvs,
      pageTitle: 'Rendez-vous passés de ' + getNomJeuneComplet(beneficiaire),
    },
  }
}

export default withTransaction(RendezVousPasses.name, 'page')(RendezVousPasses)
