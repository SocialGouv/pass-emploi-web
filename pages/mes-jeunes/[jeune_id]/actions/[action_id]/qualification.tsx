import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action, StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

type QualificationProps = PageProps & {
  action: Action
  situationsNonProfessionnelles: Array<{ code: string; label: string }>
}

function PageQualification({ action }: QualificationProps) {
  return (
    <form>
      <p className='text-s-bold mb-6'>
        Tous les champs avec * sont obligatoires
      </p>

      <fieldset className='border-none flex flex-col mb-8'>
        <legend className='flex items-center text-m-bold mb-4'>
          <IconComponent
            name={IconName.Chiffre1}
            role='img'
            focusable={false}
            aria-label='Étape 1'
            className='mr-2 w-8 h-8'
          />
          Résumé de l&apos;action
        </legend>

        <p className='text-m-bold'>{action.content}</p>
        <p className='pt-6 text-base-regular'>{action.comment}</p>
      </fieldset>
    </form>
  )
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
  const [actionContent, situationsNonProfessionnelles] = await Promise.all([
    actionsService.getAction(context.query.action_id as string, accessToken),
    actionsService.getSituationsNonProfessionnelles(accessToken),
  ])

  if (!actionContent) return { notFound: true }
  const { action, jeune } = actionContent
  if (action.status !== StatutAction.Terminee) return { notFound: true }
  if (action.qualification) return { notFound: true }

  return {
    props: {
      action,
      situationsNonProfessionnelles,
      pageTitle: 'Création d’une situation non professionnelle',
      returnTo: `/mes-jeunes/${jeune.id}/actions/${action.id}`,
      withoutChat: true,
    },
  }
}

export default withTransaction(
  PageQualification.name,
  'page'
)(PageQualification)
