import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import { Conseiller, UserStructure } from 'interfaces/conseiller'
import { ConseillerService } from 'services/conseiller.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface ProfilProps {
  conseiller: Conseiller
  structureConseiller: string
  pageTitle: string
}

function Profil({ conseiller, structureConseiller }: ProfilProps) {
  const labelAgence =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  useMatomo('Profil')

  return (
    <>
      <h1>Profil</h1>
      <h3>
        {conseiller.firstName} {conseiller.lastName}
      </h3>
      <dl>
        {conseiller.email && (
          <>
            <dt aria-label='Votre e-mail'>Votre e-mail :</dt>
            <dd>{conseiller.email}</dd>
          </>
        )}

        {conseiller.agence && (
          <>
            <dt aria-label={`Votre ${labelAgence}`}>Votre {labelAgence} :</dt>
            <dd>{conseiller.agence.nom}</dd>
          </>
        )}
      </dl>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ProfilProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const { user, accessToken } = sessionOrRedirect.session
  const conseiller = await conseillerService.getConseiller(user.id, accessToken)
  if (!conseiller) throw new Error(`Conseiller ${user.id} inexistant`)

  return {
    props: {
      conseiller: conseiller,
      structureConseiller: user.structure,
      pageTitle: 'Mon profil',
    },
  }
}

export default withTransaction(Profil.name, 'page')(Profil)
