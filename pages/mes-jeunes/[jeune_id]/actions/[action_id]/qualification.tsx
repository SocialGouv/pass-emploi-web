import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Action, StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { ActionsService } from 'services/actions.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type QualificationProps = PageProps & {
  action: Action
  situationsNonProfessionnelles: Array<{ code: string; label: string }>
  returnTo: string
}

function PageQualification({
  action,
  situationsNonProfessionnelles,
  returnTo,
}: QualificationProps) {
  const router = useRouter()
  const actionsService = useDependance<ActionsService>('actionsService')
  const [_, setAlerte] = useAlerte()

  const [codeSNP, setCodeSNP] = useState<string | undefined>()
  const [dateDebut, setDateDebut] = useState<string>(action.creationDate)
  const [dateFin, setDateFin] = useState<string | undefined>(
    action.dateFinReelle
  )

  const [isQualificationEnCours, setIsQualificationEnCours] =
    useState<boolean>(false)
  const [erreurQualification, setErreurQualification] = useState<
    string | undefined
  >()

  function isFormValid(): boolean {
    return Boolean(codeSNP) && Boolean(dateFin) && Boolean(dateDebut)
  }

  async function qualifierAction(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!isFormValid()) return

    setErreurQualification(undefined)
    setIsQualificationEnCours(true)
    try {
      await actionsService.qualifier(
        action.id,
        codeSNP!,
        DateTime.fromISO(dateDebut).startOf('day'),
        DateTime.fromISO(dateFin!).startOf('day')
      )
      await router.push(returnTo)
      setAlerte(AlerteParam.qualificationSNP)
    } catch (error) {
      setErreurQualification(
        error instanceof ApiError
          ? error.message
          : 'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
      )
    } finally {
      setIsQualificationEnCours(false)
    }
  }

  useMatomo('Création Situation Non Professionnelle')

  return (
    <form onSubmit={qualifierAction}>
      {erreurQualification && (
        <FailureAlert
          label={erreurQualification}
          onAcknowledge={() => setErreurQualification(undefined)}
        />
      )}

      <div className='mb-6'>
        <InformationMessage content='Ces informations seront intégrées sur le dossier i-milo du jeune' />
      </div>

      <p className='text-s-bold mb-6'>Tous les champs sont obligatoires</p>

      <Etape numero={1} titre="Résumé de l'action">
        <p className='text-m-bold'>{action.content}</p>
        <p className='pt-6 text-base-regular'>{action.comment}</p>
      </Etape>

      <Etape numero={2} titre='Type'>
        <Label htmlFor='select-type' inputRequired={true}>
          Type
        </Label>
        <Select id='select-type' required={true} onChange={setCodeSNP}>
          {situationsNonProfessionnelles.map(({ label, code }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </Select>
      </Etape>

      <Etape numero={3} titre='Date de début de l’action'>
        <Label htmlFor='input-date-debut' inputRequired={true}>
          Date de début
        </Label>
        <Input
          type='date'
          id='input-date-debut'
          defaultValue={
            action.creationDate ?? ''
              ? DateTime.fromISO(action.creationDate).toISODate()
              : ''
          }
          onChange={setDateDebut}
          required={true}
        />
      </Etape>

      <Etape numero={4} titre='Date de fin de l’action'>
        <Label htmlFor='input-date-fin' inputRequired={true}>
          Date de fin
        </Label>
        <Input
          type='date'
          id='input-date-fin'
          defaultValue={
            action.dateFinReelle
              ? DateTime.fromISO(action.dateFinReelle).toISODate()
              : ''
          }
          min={DateTime.fromISO(dateDebut).toISODate()}
          onChange={setDateFin}
          required={true}
        />
      </Etape>

      <div className='flex justify-center'>
        <ButtonLink
          href={returnTo}
          style={ButtonStyle.SECONDARY}
          className='mr-3'
        >
          Annuler
        </ButtonLink>
        <Button
          type='submit'
          isLoading={isQualificationEnCours}
          disabled={!isFormValid()}
        >
          <IconComponent
            name={IconName.Send}
            aria-hidden={true}
            focusable={false}
            className='w-[1em] h-[1em] mr-2'
          />
          Créer et envoyer à i-milo
        </Button>
      </div>
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
      pageTitle: 'Actions jeune - Qualifier action',
      pageHeader: 'Créer une situation non professionnelle',
      returnTo: `/mes-jeunes/${jeune.id}/actions/${action.id}`,
      withoutChat: true,
    },
  }
}

export default withTransaction(
  PageQualification.name,
  'page'
)(PageQualification)
