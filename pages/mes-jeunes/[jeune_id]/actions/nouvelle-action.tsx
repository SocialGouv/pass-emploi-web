import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from '../../../../components/ui/Notifications/RecapitulatifErreursFormulaire'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'

import { ValueWithError } from 'components/ValueWithError'
import { ActionPredefinie, StatutAction } from 'interfaces/action'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import {
  dateIsInInterval,
  toFrenchFormat,
  WEEKDAY,
  WEEKDAY_MONTH_LONG,
} from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'
import { Etape } from '../../../../components/ui/Form/Etape'
import RadioBox from '../../../../components/action/RadioBox'

interface EditionActionProps extends PageProps {
  idJeune: string
  actionsPredefinies: ActionPredefinie[]
}

function EditionAction({ idJeune, actionsPredefinies }: EditionActionProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  type Tab = 'predefinie' | 'personnalisee'
  const tabsLabel: { [key in Tab]: string } = {
    predefinie: 'prédéfinie',
    personnalisee: 'personnalisée',
  }
  const [currentTab, setCurrentTab] = useState<Tab>('predefinie')
  const [intitule, setIntitule] = useState<ValueWithError<string | undefined>>({
    value: undefined,
  })
  const [commentaire, setDescription] = useState<string>('')
  const [statut, setStatut] = useState<StatutAction>(StatutAction.Terminee)
  const [dateEcheance, setDateEcheance] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })
  const INPUT_MAX_LENGTH = 250
  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/

  const [trackingTitle, setTrackingTitle] = useState<string>(
    `Actions jeune – Création action ${tabsLabel[currentTab]}`
  )
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function formulaireEstValide(): boolean {
    const intituleEstValide = validerIntitule()
    const dateEcheanceEstValide = validerDateEcheance()

    return Boolean(intituleEstValide && dateEcheanceEstValide)
  }

  function formatDateEcheanceEstValide(): boolean {
    return Boolean(dateEcheance.value && regexDate.test(dateEcheance.value))
  }

  function validerIntitule() {
    if (intitule.value === undefined) {
      setIntitule({
        ...intitule,
        error: `${
          currentTab === 'predefinie'
            ? 'Le champ “Action prédéfinie" est vide. Renseignez une action.'
            : 'Le champ “Titre de l’action" est vide. Renseignez un titre.'
        }`,
      })
    }
    return Boolean(intitule.value)
  }

  function validerDateEcheance() {
    const unAnAvant = DateTime.now().minus({ year: 1, day: 1 })
    const deuxAnsApres = DateTime.now().plus({ year: 2 })

    if (!dateEcheance.value) {
      setDateEcheance({
        ...dateEcheance,
        error:
          'Le champ “Date d’échéance” est vide. Renseignez une date d’échéance.',
      })
      return false
    } else if (
      !dateIsInInterval(
        DateTime.fromFormat(dateEcheance.value, 'yyyy-MM-dd'),
        unAnAvant,
        deuxAnsApres
      )
    ) {
      setDateEcheance({
        ...dateEcheance,
        error: `Le champ “Date d’échéance” est invalide. Le date attendue est comprise entre le ${unAnAvant.toFormat(
          'dd/MM/yyyy'
        )} et le ${deuxAnsApres.toFormat('dd/MM/yyyy')}.`,
      })
    } else if (!formatDateEcheanceEstValide()) {
      setDateEcheance({
        ...dateEcheance,
        error:
          'Le champ “Date d’échéance” est invalide. Le format attendu est jj/mm/aaaa, par exemple : 20/03/2023.',
      })
    }
    return Boolean(dateEcheance.value && regexDate.test(dateEcheance.value))
  }

  async function creerAction(e: FormEvent) {
    e.preventDefault()
    if (!formulaireEstValide()) return

    const action = {
      intitule: intitule.value!,
      commentaire,
      dateEcheance: dateEcheance.value!,
    }
    const { createAction } = await import('services/actions.service')
    await createAction(action, idJeune)
    setAlerte(AlerteParam.creationAction)
    await router.push(`/mes-jeunes/${idJeune}?onglet=actions`)
  }

  function getErreurs(): LigneErreur[] {
    const erreurs = []

    if (intitule.error) {
      if (currentTab === 'predefinie') {
        erreurs.push({
          ancre: '#intitule-action-predefinie',
          label: 'Le champ Action prédéfinie est vide.',
          titreChamp: 'Action prédéfinie',
        })
      } else {
        erreurs.push({
          ancre: '#intitule-action-personnalisee',
          label: 'Le champ Titre de l’action est vide.',
          titreChamp: 'Titre de l’action',
        })
      }
    }

    if (dateEcheance.error) {
      const ancre =
        currentTab === 'predefinie'
          ? '#date-echeance-action-predefinie'
          : '#date-echeance-action-personnalisee'
      const label = 'Le champ Date d’échéance est vide.'
      const titreChamp = 'Date d’échéance'

      erreurs.push({ ancre, label, titreChamp })
    }

    return erreurs
  }

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      <RecapitulatifErreursFormulaire erreurs={getErreurs()} />

      <form onSubmit={creerAction} noValidate={true}>
        <p className='text-s-bold text-content_color mb-4'>
          Tous les champs avec * sont obligatoires
        </p>
        <Label htmlFor='intitule-action-personnalisee'>Catégorie</Label>
        {intitule.error && (
          <InputError id='intitule--error' className='mb-2'>
            {intitule.error}
          </InputError>
        )}
        <Select
          id='intitule-action-predefinie'
          required={true}
          onChange={(value: string) => setIntitule({ value })}
          onBlur={validerIntitule}
        >
          {actionsPredefinies.map(({ id, titre }) => (
            <option key={id}>{titre}</option>
          ))}
        </Select>
        <Label htmlFor="titre de l'action" inputRequired={true}>
          Titre de l&apos;action
        </Label>
        <Input
          type='text'
          id='intitule-action-personnalisee'
          required={true}
          onChange={(value: string) => setIntitule({ value })}
          onBlur={validerIntitule}
        />
        <Label htmlFor='commentaire-action-predefinie'>Description</Label>
        <Textarea
          id='commentaire-action-predefinie'
          defaultValue={commentaire}
          onChange={setDescription}
          maxLength={INPUT_MAX_LENGTH}
        />
        <Etape numero={2} titre='Statut et date'></Etape>
        <Label htmlFor='action' inputRequired={true}>
          l&apos;action est:
        </Label>
        <RadioBox
          isSelected={statut === StatutAction.ARealiser}
          id='radio-statut-arealiser'
          label='À faire'
          name='radio-statut'
          onChange={() => setStatut(StatutAction.ARealiser)}
        />
        <RadioBox
          isSelected={statut === StatutAction.Terminee}
          id='radio-statut-terminee'
          label='Terminée'
          name='radio-statut'
          onChange={() => setStatut(StatutAction.Terminee)}
        />
        <Label htmlFor='date-echeance' inputRequired={true}>
          Date d’échéance
        </Label>
        {dateEcheance.error && (
          <InputError id='date-echeance--error' className='mb-2'>
            {dateEcheance.error}
          </InputError>
        )}
        <Input
          type='date'
          id='date-echeance-action-predefinie'
          required={true}
          defaultValue={dateEcheance.value}
          onChange={(value: string) => setDateEcheance({ value })}
          onBlur={validerDateEcheance}
        />
        <input
          type='button'
          value={`Aujourd'hui (${toFrenchFormat(DateTime.now(), WEEKDAY)})`}
          id='date-aujourdhui'
          onClick={() => {
            setDateEcheance({ value: DateTime.now().toISODate() })
          }}
        />

        <input
          type='button'
          id='date-demain'
          value={`Demain (${toFrenchFormat(
            DateTime.now().plus({ day: 1 }),
            WEEKDAY
          )})`}
          onClick={() => {
            setDateEcheance({
              value: DateTime.now().plus({ day: 1 }).toISODate(),
            })
          }}
        />

        <input
          type='button'
          id='semaine-prochaine'
          value={`Semaine prochaine ${toFrenchFormat(
            DateTime.now().plus({ week: 1 }).startOf('week'),
            WEEKDAY
          )}`}
          onClick={() => {
            setDateEcheance({
              value: DateTime.now()
                .plus({ week: 1 })
                .startOf('week')
                .toISODate(),
            })
          }}
        />

        <div className='mt-8 flex justify-center'>
          <ButtonLink
            href={`/mes-jeunes/${idJeune}/actions`}
            style={ButtonStyle.SECONDARY}
          >
            Annuler
          </ButtonLink>
          <Button type='submit' className='ml-6'>
            <IconComponent
              name={IconName.Add}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Créer l’action
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  EditionActionProps
> = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const idJeune = context.query.jeune_id as string

  const { getActionsPredefinies } = await import('services/referentiel.service')
  const actionsPredefinies = await getActionsPredefinies(
    sessionOrRedirect.session.accessToken
  )
  return {
    props: {
      idJeune,
      actionsPredefinies,
      withoutChat: true,
      pageTitle: 'Actions jeune – Créer action',
      pageHeader: 'Créer une nouvelle action',
      returnTo: `/mes-jeunes/${idJeune}`,
    },
  }
}

export default withTransaction(EditionAction.name, 'page')(EditionAction)
