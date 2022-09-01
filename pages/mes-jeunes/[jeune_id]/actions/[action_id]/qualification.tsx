import { GetServerSideProps } from 'next'

import { StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

type QualificationProps = {
  situationsNonProfessionnelles: Array<{ code: string; label: string }>
}

export const getServerSideProps: GetServerSideProps<
  QualificationProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure !== StructureConseiller.MILO) {
    return { notFound: true }
  }

  const actionsService = withDependance<ActionsService>('actionsService')
  const [action, situationsNonProfessionnelles] = await Promise.all([
    actionsService.getAction(context.query.action_id as string, accessToken),
    actionsService.getSituationsNonProfessionnelles(accessToken),
  ])

  if (!action) return { notFound: true }
  if (action.action.status !== StatutAction.Terminee) return { notFound: true }

  return { props: { situationsNonProfessionnelles } }
}
