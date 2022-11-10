import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import TableauRdv from 'components/rdv/TableauRdv'
import { StructureConseiller } from 'interfaces/conseiller'
import { PeriodeRdv, RdvListItem } from 'interfaces/rdv'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import withDependance from 'utils/injectionDependances/withDependance'

interface RendezVousPassesProps {
  rdvs: RdvListItem[]
}

function RendezVousPasses({ rdvs }: RendezVousPassesProps) {
  const [conseiller] = useConseiller()
  useMatomo('Détail jeune - Rendez-vous passés')

  return (
    <TableauRdv
      rdvs={rdvs}
      idConseiller={conseiller?.id ?? ''}
      withNameJeune={false}
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

  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')

  const {
    session: {
      accessToken,
      user: { structure },
    },
  } = sessionOrRedirect

  const isPoleEmploi = structure === StructureConseiller.POLE_EMPLOI

  const rdvs = isPoleEmploi
    ? []
    : await rendezVousService.getRendezVousJeune(
        context.query.jeune_id as string,
        PeriodeRdv.PASSES,
        accessToken
      )

  if (!rdvs) {
    return { notFound: true }
  }

  return {
    props: {
      rdvs,
      pageTitle: 'Rendez-vous passés',
    },
  }
}

export default withTransaction(RendezVousPasses.name, 'page')(RendezVousPasses)
