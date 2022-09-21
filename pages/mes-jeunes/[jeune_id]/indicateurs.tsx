import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'

import { IndicateursJeune } from 'components/jeune/IndicateursJeune'
import { StructureConseiller } from 'interfaces/conseiller'
import { IndicateursSemaine } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

type IndicateursProps = PageProps & {
  idJeune: string
  idConseiller: string
}

function Indicateurs({ idJeune, idConseiller }: IndicateursProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()

  const aujourdHui = DateTime.now()
  const debutDeLaSemaine = aujourdHui.startOf('week')
  const finDeLaSemaine = aujourdHui.endOf('week')

  // TODO-GAD tracking

  useEffect(() => {
    if (!indicateursSemaine) {
      jeunesService
        .getIndicateursJeune(
          idConseiller,
          idJeune,
          debutDeLaSemaine,
          finDeLaSemaine
        )
        .then(setIndicateursSemaine)
    }
  }, [
    idConseiller,
    idJeune,
    debutDeLaSemaine,
    finDeLaSemaine,
    indicateursSemaine,
    jeunesService,
  ])

  return (
    <IndicateursJeune
      debutDeLaSemaine={debutDeLaSemaine}
      finDeLaSemaine={finDeLaSemaine}
      indicateursSemaine={indicateursSemaine}
    />
  )
}

export const getServerSideProps: GetServerSideProps<IndicateursProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }

  return {
    props: {
      idJeune: context.query.jeune_id as string,
      idConseiller: user.id,
      pageTitle: 'Indicateurs',
    },
  }
}

export default withTransaction(Indicateurs.name, 'page')(Indicateurs)
