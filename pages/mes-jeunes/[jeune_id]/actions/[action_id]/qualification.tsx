import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { FormEvent, useState } from 'react'

import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Select from 'components/ui/Form/Select'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action, StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { toIsoLocalDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type QualificationProps = PageProps & {
  action: Action
  situationsNonProfessionnelles: Array<{ code: string; label: string }>
}

function PageQualification({
  action,
  situationsNonProfessionnelles,
}: QualificationProps) {
  const actionsService = useDependance<ActionsService>('actionsService')

  const [codeSNP, setCodeSNP] = useState<string | undefined>()
  const [dateFin, setDateFin] = useState<string | undefined>(
    action.dateFinReelle
  )

  const [isQualificationEnCours, setIsQualificationEnCours] =
    useState<boolean>(false)

  async function qualifierAction(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()

    const date = dateFin ? DateTime.fromISO(dateFin).toJSDate() : undefined

    setIsQualificationEnCours(true)
    try {
      await actionsService.qualifier(action.id, codeSNP!, date)
    } finally {
      setIsQualificationEnCours(false)
    }
  }

  return (
    <form onSubmit={qualifierAction}>
      <p className='text-s-bold mb-6'>Tous les champs sont obligatoires</p>

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

      <fieldset className='border-none flex flex-col mb-8'>
        <legend className='flex items-center text-m-bold mb-4'>
          <IconComponent
            name={IconName.Chiffre2}
            role='img'
            focusable={false}
            aria-label='Étape 2'
            className='mr-2 w-8 h-8'
          />
          Type
        </legend>

        <label htmlFor='select-type' className='text-base-bold mb-2'>
          <span aria-hidden={true}>* </span>Type
        </label>
        <Select id='select-type' required={true} onChange={setCodeSNP}>
          {situationsNonProfessionnelles.map(({ label, code }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </Select>
      </fieldset>

      <fieldset className='border-none flex flex-col mb-8'>
        <legend className='flex items-center text-m-bold mb-4'>
          <IconComponent
            name={IconName.Chiffre3}
            role='img'
            focusable={false}
            aria-label='Étape 3'
            className='mr-2 w-8 h-8'
          />
          Date de fin de l’action
        </legend>

        <label htmlFor='input-date-fin' className='text-base-bold mb-2'>
          <span aria-hidden={true}>* </span>Date
        </label>
        <Input
          type='date'
          id='input-date-fin'
          defaultValue={
            action.dateFinReelle
              ? toIsoLocalDate(new Date(action.dateFinReelle))
              : ''
          }
          min={toIsoLocalDate(new Date(action.creationDate))}
          onChange={setDateFin}
        />
      </fieldset>

      <Button type='submit' isLoading={isQualificationEnCours}>
        Créer et envoyer à i-milo
      </Button>
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
