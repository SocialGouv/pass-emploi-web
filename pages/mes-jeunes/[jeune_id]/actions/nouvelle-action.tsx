import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

import BackIcon from '../../../../assets/icons/arrow_back.svg'

import Button from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { actionsPredefinies } from 'referentiel/action'
import { ActionsService } from 'services/actions.service'
import styles from 'styles/components/Layouts.module.css'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

interface EditionActionProps {
  idJeune: string
  withoutChat: true
  pageTitle: string
}

function EditionAction({ idJeune }: EditionActionProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const { data: session } = useSession<true>({ required: true })
  const router = useRouter()

  const [tab, setTab] = useState<'predefinies' | 'personnalisees'>(
    'predefinies'
  )
  const [intitule, setIntitule] = useState<string>('')
  const [commentaire, setCommentaire] = useState<string>('')

  function switchTab() {
    setTab((prevTab) =>
      prevTab === 'predefinies' ? 'personnalisees' : 'predefinies'
    )
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
    await router.push(`/mes-jeunes/${idJeune}/actions`)
  }

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
      <div className={`${styles.content} ${styles.content_without_chat}`}>
        <form onSubmit={creerAction}>
          <div role='tablist'>
            <Button
              role='tab'
              type='button'
              id='creer-action-predefinie'
              controls='form-action-predefinie'
              onClick={switchTab}
            >
              Action prédéfinie
            </Button>
            <Button
              role='tab'
              type='button'
              id='creer-action-personnalisee'
              controls='form-action-personnalisee'
              onClick={switchTab}
            >
              Action personnalisée
            </Button>
          </div>

          {tab === 'predefinies' && (
            <div
              id='form-action-predefinie'
              aria-labelledby='creer-action-predefinie'
            >
              <label htmlFor='intitule-action-predefinie'>
                * Choisir une action prédéfinie
              </label>
              <select
                id='intitule-action-predefinie'
                required={true}
                onChange={(e) => setIntitule(e.target.value)}
              >
                {actionsPredefinies.map(({ id, content }) => (
                  <option key={id}>{content}</option>
                ))}
              </select>

              <label htmlFor='commentaire-action-predefinie'>
                Commentaire de l&apos;action
              </label>
              <textarea
                id='commentaire-action-predefinie'
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>
          )}

          {tab === 'personnalisees' && (
            <div
              id='form-action-personnalisee'
              aria-labelledby='creer-action-personnalisee'
            >
              <label htmlFor='intitule-action-personnalisee'>
                * Intitulé de l&apos;action
              </label>
              <input
                type='text'
                id='intitule-action-personnalisee'
                required={true}
                onChange={(e) => setIntitule(e.target.value)}
              />

              <label htmlFor='commentaire-action-personnalisee'>
                Commentaire de l&apos;action
              </label>
              <textarea
                id='commentaire-action-personnalisee'
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>
          )}

          <ButtonLink href={`/mes-jeunes/${idJeune}/actions`}>
            Annuler
          </ButtonLink>
          <Button type='submit' disabled={!formulaireEstValide()}>
            Envoyer
          </Button>
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
      pageTitle: 'Actions jeune – Création action prédéfinie',
    },
  }
}

export default withTransaction(EditionAction.name, 'page')(EditionAction)
