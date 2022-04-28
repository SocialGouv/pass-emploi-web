import { GetServerSideProps } from 'next'

import { Conseiller } from 'interfaces/conseiller'
import { ConseillerService } from 'services/conseiller.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

export default function Profil({ conseiller }: { conseiller: Conseiller }) {
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
            <dt aria-label='Votre agence'>Votre agence :</dt>
            <dd>{conseiller.agence.nom}</dd>
          </>
        )}
      </dl>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<{
  conseiller: Conseiller
}> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const { user, accessToken } = sessionOrRedirect.session
  const conseiller = await conseillerService.getConseiller(user.id, accessToken)
  if (!conseiller) throw new Error(`Conseiller ${user.id} inexistant`)

  return { props: { conseiller: conseiller! } }
}
