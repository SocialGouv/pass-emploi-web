import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { PageProps } from 'interfaces/pageProps'
import { actionsPredefinies } from 'referentiel/action'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ActionsService } from 'services/actions.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

interface EditionActionProps extends PageProps {
  idJeune: string
}

function EditionAction({ idJeune }: EditionActionProps) {
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
            <label
              htmlFor='intitule-action-predefinie'
              className='text-base-medium text-content_color block'
            >
              * Choisir une action prédéfinie
            </label>
            <select
              id='intitule-action-predefinie'
              required={true}
              onChange={(e) => setIntitule(e.target.value)}
              defaultValue={''}
              className='mt-3 w-full border border-solid border-content_color rounded-medium px-4 py-3 truncate'
            >
              <option aria-hidden hidden disabled value={''} />
              {actionsPredefinies.map(({ id, content }) => (
                <option key={id}>{content}</option>
              ))}
            </select>

            <label
              htmlFor='commentaire-action-predefinie'
              className='flex mt-10 text-base-medium text-content_color items-center'
            >
              Description de l&apos;action
              <span className='ml-2'>
                <BulleMessageSensible />
              </span>
            </label>
            <textarea
              id='commentaire-action-predefinie'
              defaultValue={commentaire}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={INPUT_MAX_LENGTH}
              rows={3}
              className='mt-3 w-full border border-solid border-content_color rounded-medium px-4 py-3'
            />
            <label htmlFor='date-echeance-action-predefinie' className='mb-2'>
              <span className='mt-10 text-base-medium text-content_color block'>
                * Définir une date d’échéance
              </span>
            </label>
            <input
              type='date'
              id='date-echeance-action-predefinie'
              name='date'
              required={true}
              defaultValue={dateEcheance}
              onChange={(e) => setDateEcheance(e.target.value)}
              className={`border border-solid rounded-medium w-full px-4 py-3 mb-4`}
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
            <label
              htmlFor='intitule-action-personnalisee'
              className='text-base-medium text-content_color block'
            >
              * Intitulé de l&apos;action
            </label>
            <input
              type='text'
              id='intitule-action-personnalisee'
              required={true}
              onChange={(e) => setIntitule(e.target.value)}
              className='mt-3 w-full border border-solid border-content_color rounded-medium px-4 py-3'
            />

            <label
              htmlFor='commentaire-action-personnalisee'
              className='mt-10 text-base-medium text-content_color block'
            >
              Description de l&apos;action
            </label>
            <textarea
              id='commentaire-action-personnalisee'
              defaultValue={commentaire}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={INPUT_MAX_LENGTH}
              rows={3}
              className='mt-3 w-full border border-solid border-content_color rounded-medium px-4 py-3'
            />
            <label
              htmlFor='date-echeance-action-personnalisee'
              className='mb-2'
            >
              <span className='mt-10 text-base-medium text-content_color block'>
                * Définir une date d’échéance
              </span>
            </label>
            <input
              type='date'
              id='date-echeance-action-personnalisee'
              name='date'
              required={true}
              defaultValue={dateEcheance}
              onChange={(e) => setDateEcheance(e.target.value)}
              className={`border border-solid rounded-medium w-full px-4 py-3 mb-4`}
            />
          </div>
        )}

        <div className='mt-10 flex justify-center'>
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

  const idJeune = context.query.jeune_id as string
  return {
    props: {
      idJeune,
      withoutChat: true,
      pageTitle: 'Actions jeune – Création action',
      pageHeader: 'Créer une nouvelle action',
      returnTo: `/mes-jeunes/${idJeune}`,
    },
  }
}

export default withTransaction(EditionAction.name, 'page')(EditionAction)
