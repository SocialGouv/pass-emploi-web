import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
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

  const [commentaire, setCommentaire] = useState<ValueWithError>({
    value: action.content + (action.comment && ' - ' + action.comment),
  })
  const [codeSNP, setCodeSNP] = useState<string | undefined>()
  const [dateDebut, setDateDebut] = useState<string>(action.creationDate)
  const [dateFin, setDateFin] = useState<string | undefined>(
    action.dateFinReelle
  )

  const snpParOrdreAlphabetique = situationsNonProfessionnelles.sort((a, b) =>
    a.label.localeCompare(b.label)
  )

  const [isQualificationEnCours, setIsQualificationEnCours] =
    useState<boolean>(false)
  const [erreurQualification, setErreurQualification] = useState<
    string | undefined
  >()

  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(
    'Création Situation Non Professionnelle'
  )

  function isCommentaireValid(): boolean {
    return Boolean(commentaire.value) && commentaire.value.length <= 255
  }

  function validateCommentaire() {
    let error
    if (!commentaire.value) {
      error =
        'Le champ Intitulé et description n’est pas renseigné. Veuillez renseigner une description.'
    }
    if (commentaire.value.length > 255)
      error =
        'Vous avez dépassé le nombre maximal de caractères. Veuillez retirer des caractères.'

    setCommentaire({ ...commentaire, error })
  }

  function isFormValid(): boolean {
    return (
      isCommentaireValid() &&
      Boolean(codeSNP) &&
      Boolean(dateFin) &&
      Boolean(dateDebut)
    )
  }

  async function qualifierAction(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!isFormValid()) return

    setErreurQualification(undefined)
    setIsQualificationEnCours(true)
    try {
      await actionsService.qualifier(action.id, codeSNP!, {
        commentaire: commentaire.value,
        dateDebutModifiee: DateTime.fromISO(dateDebut).startOf('day'),
        dateFinModifiee: DateTime.fromISO(dateFin!).startOf('day'),
      })
      setAlerte(AlerteParam.qualificationSNP)
      await router.push(returnTo)
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

  useMatomo(labelMatomo)

  return (
    <form onSubmit={qualifierAction}>
      {erreurQualification && (
        <FailureAlert
          label={erreurQualification}
          onAcknowledge={() => setErreurQualification(undefined)}
        />
      )}

      <div className='mb-6'>
        <InformationMessage label='Ces informations seront intégrées sur le dossier i-milo du jeune'>
          <p>
            Les informations saisies sont partagées avec I-MILO, et doivent en
            respecter les Conditions Générales d’utilisation. Elles ne doivent
            comporter aucune donnée personnelle non autorisée par{' '}
            <strong>l’arrêté du 17 novembre 2021</strong> relatif au traitement
            automatisé de données à caractère personnel dénommé « I-MILO »
          </p>
          <span className='hover:text-primary_darken'>
            <ExternalLink
              href='https://c-milo.i-milo.fr/jcms/t482_1002488/fr/mentions-legales'
              label='Voir le détail des CGU'
              onClick={() => setLabelMatomo('Lien CGU')}
            />
          </span>
          <span className='hover:text-primary_darken'>
            <ExternalLink
              href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045084361'
              label='Voir le détail de l’arrêté du 17 novembre 2021'
              onClick={() => setLabelMatomo('Lien Arrêté 17 novembre 2021')}
            />
          </span>
        </InformationMessage>
      </div>

      <p className='text-s-bold mb-6'>Tous les champs sont obligatoires</p>

      <Etape numero={1} titre="Résumé de l'action">
        <Label
          htmlFor='commentaire'
          inputRequired={true}
          withBulleMessageSensible={true}
        >
          {{
            main: "Intitulé et description de l'action",
            helpText:
              'Vous retrouverez ce résumé dans les détails de la situation non-professionnelle sur i-milo, dans le champ « Commentaire ».',
            precision: '255 caractères maximum',
          }}
        </Label>
        {commentaire.error && (
          <InputError id='commentaire--error'>{commentaire.error}</InputError>
        )}
        <Textarea
          id='commentaire'
          maxLength={255}
          allowOverMax={true}
          defaultValue={commentaire.value}
          onChange={(value) => setCommentaire({ value })}
          invalid={Boolean(commentaire.error)}
          onBlur={validateCommentaire}
        />
      </Etape>

      <Etape numero={2} titre='Type'>
        <Label htmlFor='select-type' inputRequired={true}>
          Type
        </Label>
        <Select id='select-type' required={true} onChange={setCodeSNP}>
          {snpParOrdreAlphabetique.map(({ label, code }) => (
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
