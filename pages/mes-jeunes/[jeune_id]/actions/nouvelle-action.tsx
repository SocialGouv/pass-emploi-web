import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ValueWithError } from 'components/ValueWithError'
import { ActionPredefinie } from 'interfaces/action'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { dateIsInInterval } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

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
  const [dateEcheance, setDateEcheance] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })
  const INPUT_MAX_LENGTH = 250
  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/

  const [trackingTitle, setTrackingTitle] = useState<string>(
    `Actions jeune – Création action ${tabsLabel[currentTab]}`
  )
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function switchTab() {
    const newTab = currentTab === 'predefinie' ? 'personnalisee' : 'predefinie'
    setCurrentTab(newTab)
    setIntitule({ value: intitule?.value })
    setTrackingTitle(`Actions jeune – Création action ${tabsLabel[currentTab]}`)
  }

  function isSelected(tab: string): boolean {
    return currentTab === tab
  }

  function formulaireEstValide(): boolean {
    return Boolean(intitule.value) && dateIsValid()
  }

  function dateIsValid(): boolean {
    return Boolean(dateEcheance.value && regexDate.test(dateEcheance.value))
  }

  function intituleEstValide() {
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

  function dateEcheanceEstValide() {
    const unAnAvant = DateTime.now().minus({ year: 1, day: 1 })
    const deuxAnsApres = DateTime.now().plus({ year: 2 })

    if (
      dateEcheance.value &&
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
    } else if (!dateIsValid()) {
      setDateEcheance({
        ...dateEcheance,
        error:
          'Le champ “Date d’échéance” est invalide. Le format attendu est jj/mm/aaaa, par exemple : 20/03/2023.',
      })
    }
    return Boolean(intitule.value)
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

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      <form onSubmit={creerAction}>
        <TabList className='mb-10'>
          {Object.entries(tabsLabel).map(([tab, label]) => (
            <Tab
              key={tab}
              label={`Action ${label}`}
              controls={`form-action-${tab}`}
              selected={isSelected(tab)}
              onSelectTab={switchTab}
            />
          ))}
        </TabList>

        <p className='text-s-bold text-content_color'>
          Tous les champs avec * sont obligatoires
        </p>

        {currentTab === 'predefinie' && (
          <div
            role='tabpanel'
            id='form-action-predefinie'
            aria-labelledby='creer-action-predefinie'
            className='mt-5'
          >
            <Label htmlFor='intitule-action-predefinie' inputRequired={true}>
              {{
                main: 'Action prédéfinie',
                helpText: 'Sélectionner dans la liste',
              }}
            </Label>
            {intitule.error && (
              <InputError id='intitule--error' className='mb-2'>
                {intitule.error}
              </InputError>
            )}
            <Select
              id='intitule-action-predefinie'
              required={true}
              onChange={(value: string) => setIntitule({ value })}
              onBlur={intituleEstValide}
            >
              {actionsPredefinies.map(({ id, titre }) => (
                <option key={id}>{titre}</option>
              ))}
            </Select>

            <Label
              htmlFor='commentaire-action-predefinie'
              withBulleMessageSensible={true}
            >
              Commentaire
            </Label>
            <Textarea
              id='commentaire-action-predefinie'
              defaultValue={commentaire}
              onChange={setDescription}
              maxLength={INPUT_MAX_LENGTH}
            />

            <Label
              htmlFor='date-echeance-action-predefinie'
              inputRequired={true}
            >
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
              onBlur={dateEcheanceEstValide}
            />
          </div>
        )}

        {currentTab === 'personnalisee' && (
          <div
            role='tabpanel'
            id='form-action-personnalisee'
            aria-labelledby='creer-action-personnalisee'
            tabIndex={0}
            className='mt-5'
          >
            <Label htmlFor='intitule-action-personnalisee' inputRequired={true}>
              Titre de l&apos;action
            </Label>
            {intitule.error && (
              <InputError id='intitule--error' className='mb-2'>
                {intitule.error}
              </InputError>
            )}
            <Input
              type='text'
              id='intitule-action-personnalisee'
              required={true}
              onChange={(value: string) => setIntitule({ value })}
              onBlur={intituleEstValide}
            />

            <Label
              htmlFor='commentaire-action-personnalisee'
              withBulleMessageSensible={true}
            >
              Commentaire
            </Label>
            <Textarea
              id='commentaire-action-personnalisee'
              defaultValue={commentaire}
              onChange={setDescription}
              maxLength={INPUT_MAX_LENGTH}
            />

            <Label
              htmlFor='date-echeance-action-personnalisee'
              inputRequired={true}
            >
              Date d’échéance
            </Label>
            {dateEcheance.error && (
              <InputError id='date-echeance--error' className='mb-2'>
                {dateEcheance.error}
              </InputError>
            )}
            <Input
              type='date'
              id='date-echeance-action-personnalisee'
              required={true}
              defaultValue={dateEcheance.value}
              onChange={(value: string) => setDateEcheance({ value })}
              onBlur={dateEcheanceEstValide}
            />
          </div>
        )}

        <div className='mt-8 flex justify-center'>
          <ButtonLink
            href={`/mes-jeunes/${idJeune}/actions`}
            style={ButtonStyle.SECONDARY}
          >
            Annuler
          </ButtonLink>
          <Button
            type='submit'
            disabled={!formulaireEstValide()}
            className='ml-6'
          >
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
