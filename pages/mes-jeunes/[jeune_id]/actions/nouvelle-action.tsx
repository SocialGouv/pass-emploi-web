import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

import SendIcon from '../../../../assets/icons/send.svg'

import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { PageProps } from 'interfaces/pageProps'
import { actionsPredefinies } from 'referentiel/action'
import { ActionsService } from 'services/actions.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

interface EditionActionProps extends PageProps {
  idJeune: string
}

function EditionAction({ idJeune }: EditionActionProps) {
  const { data: session } = useSession<true>({ required: true })
  const router = useRouter()
  const actionsService = useDependance<ActionsService>('actionsService')

  type Tab = 'predefinie' | 'personnalisee'
  const tabsLabel: { [key in Tab]: string } = {
    predefinie: 'prédéfinie',
    personnalisee: 'personnalisée',
  }
  const [currentTab, setCurrentTab] = useState<Tab>('predefinie')
  const [intitule, setIntitule] = useState<string>('')
  const [commentaire, setCommentaire] = useState<string>('')
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
    return Boolean(intitule)
  }

  async function creerAction(e: FormEvent) {
    e.preventDefault()
    if (!formulaireEstValide()) return

    const action = { intitule, commentaire }
    await actionsService.createAction(
      action,
      session!.user.id,
      idJeune,
      session!.accessToken
    )
    await router.push({
      pathname: `/mes-jeunes/${idJeune}/actions`,
      query: { creation: 'succes' },
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

        <p className='text-s-medium text-content_color'>
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
              className='text-md text-content_color block'
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
              className='mt-10 text-md text-content_color block'
            >
              Commentaire de l&apos;action
            </label>
            <textarea
              id='commentaire-action-predefinie'
              onChange={(e) => setCommentaire(e.target.value)}
              maxLength={INPUT_MAX_LENGTH}
              rows={3}
              className='mt-3 w-full border border-solid border-content_color rounded-medium px-4 py-3'
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
              className='text-md text-content_color block'
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
              className='mt-10 text-md text-content_color block'
            >
              Commentaire de l&apos;action
            </label>
            <textarea
              id='commentaire-action-personnalisee'
              onChange={(e) => setCommentaire(e.target.value)}
              maxLength={INPUT_MAX_LENGTH}
              rows={3}
              className='mt-3 w-full border border-solid border-content_color rounded-medium px-4 py-3'
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
            <SendIcon focusable='false' aria-hidden='true' className='mr-2' />
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
      returnTo: `/mes-jeunes/${idJeune}/actions`,
    },
  }
}

export default withTransaction(EditionAction.name, 'page')(EditionAction)
