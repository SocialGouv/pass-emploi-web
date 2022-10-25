import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ActionPredefinie } from 'interfaces/action'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ActionsService } from 'services/actions.service'
import { ReferentielService } from 'services/referentiel.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface EditionActionProps extends PageProps {
  idJeune: string
  actionsPredefinies: ActionPredefinie[]
}

function EditionAction({ idJeune, actionsPredefinies }: EditionActionProps) {
  const router = useRouter()
  const actionsService = useDependance<ActionsService>('actionsService')

  type Tab = 'predefinie' | 'personnalisee'
  const tabsLabel: { [key in Tab]: string } = {
    predefinie: 'prédéfinie',
    personnalisee: 'personnalisée',
  }
  const [currentTab, setCurrentTab] = useState<Tab>('predefinie')
  const [intitule, setIntitule] = useState<string>('')
  const [commentaire, setDescription] = useState<string>('')
  const [dateEcheance, setDateEcheance] = useState<string>('')
  const INPUT_MAX_LENGTH = 250

  const [trackingTitle, setTrackingTitle] = useState<string>(
    `Actions jeune – Création action ${tabsLabel[currentTab]}`
  )

  function switchTab() {
    const newTab = currentTab === 'predefinie' ? 'personnalisee' : 'predefinie'
    setCurrentTab(newTab)
    setTrackingTitle(`Actions jeune – Création action ${tabsLabel[currentTab]}`)
  }

  function isSelected(tab: string): boolean {
    return currentTab === tab
  }

  function formulaireEstValide(): boolean {
    return Boolean(intitule) && Boolean(dateEcheance)
  }

  async function creerAction(e: FormEvent) {
    e.preventDefault()
    if (!formulaireEstValide()) return

    const action = {
      intitule,
      commentaire,
      dateEcheance,
    }
    await actionsService.createAction(action, idJeune)
    await router.push({
      pathname: `/mes-jeunes/${idJeune}`,
      query: { [QueryParam.creationAction]: QueryValue.succes },
    })
  }

  useMatomo(trackingTitle)

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
              Choisir une action prédéfinie
            </Label>
            <Select
              id='intitule-action-predefinie'
              required={true}
              onChange={setIntitule}
            >
              {actionsPredefinies.map(({ id, titre }) => (
                <option key={id}>{titre}</option>
              ))}
            </Select>

            <Label
              htmlFor='commentaire-action-predefinie'
              withBulleMessageSensible={true}
            >
              Description de l&apos;action
            </Label>
            <Textarea
              id='commentaire-action-predefinie'
              defaultValue={commentaire}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={INPUT_MAX_LENGTH}
              rows={3}
            />

            <Label
              htmlFor='date-echeance-action-predefinie'
              inputRequired={true}
            >
              Définir une date d’échéance
            </Label>
            <Input
              type='date'
              id='date-echeance-action-predefinie'
              required={true}
              defaultValue={dateEcheance}
              onChange={setDateEcheance}
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
              Intitulé de l&apos;action
            </Label>
            <Input
              type='text'
              id='intitule-action-personnalisee'
              required={true}
              onChange={setIntitule}
            />

            <Label
              htmlFor='commentaire-action-personnalisee'
              withBulleMessageSensible={true}
            >
              Description de l&apos;action
            </Label>
            <Textarea
              id='commentaire-action-personnalisee'
              defaultValue={commentaire}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={INPUT_MAX_LENGTH}
              rows={3}
            />

            <Label
              htmlFor='date-echeance-action-personnalisee'
              inputRequired={true}
            >
              Définir une date d’échéance
            </Label>
            <Input
              type='date'
              id='date-echeance-action-personnalisee'
              required={true}
              defaultValue={dateEcheance}
              onChange={setDateEcheance}
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
              name={IconName.Send}
              focusable='false'
              aria-hidden='true'
              className='mr-2 w-4 h-4 fill-blanc'
            />
            Envoyer
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  EditionActionProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const referentielService =
    withDependance<ReferentielService>('referentielService')

  const idJeune = context.query.jeune_id as string
  const actionsPredefinies = await referentielService.getActionsPredefinies()
  return {
    props: {
      idJeune,
      actionsPredefinies,
      withoutChat: true,
      pageTitle: 'Actions jeune – Création action',
      pageHeader: 'Créer une nouvelle action',
      returnTo: `/mes-jeunes/${idJeune}`,
    },
  }
}

export default withTransaction(EditionAction.name, 'page')(EditionAction)
