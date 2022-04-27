import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

import BackIcon from '../../../../assets/icons/arrow_back.svg'

import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { actionsPredefinies } from 'referentiel/action'
import { ActionsService } from 'services/actions.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

interface EditionActionProps {
  idJeune: string
  withoutChat: true
  pageTitle: string
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
      <div className={`flex items-center ${styles.header}`}>
        <Link href={`/mes-jeunes/${idJeune}/actions`}>
          <a className='items-center mr-4'>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
            <span className='sr-only'>Page précédente</span>
          </a>
        </Link>

        <h1 className='text-l-medium text-bleu_nuit'>
          Créer une nouvelle action
        </h1>
      </div>
      <div
        className={`${styles.content} ${styles.content_without_chat} w-full`}
      >
        <form onSubmit={creerAction}>
          <div role='tablist' className='flex mb-10'>
            {Object.entries(tabsLabel).map(([tab, label]) => (
              <Button
                role='tab'
                type='button'
                key={`creer-action-${tab}`}
                id={`creer-action-${tab}`}
                controls={`form-action-${tab}`}
                onClick={switchTab}
                tabIndex={isSelected(tab) ? -1 : 0}
                selected={isSelected(tab)}
                style={
                  isSelected(tab) ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY
                }
                className='ml-3 first:ml-0'
              >
                Action {label}
              </Button>
            ))}
          </div>

          <p className='text-sm-medium text-content_color'>
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
                className='mt-3 w-full border border-solid border-content_color rounded-medium px-4 py-3'
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
              Envoyer
            </Button>
          </div>
        </form>
      </div>
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
    },
  }
}

export default withTransaction(EditionAction.name, 'page')(EditionAction)
