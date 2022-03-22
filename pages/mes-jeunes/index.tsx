import { AppHead } from 'components/AppHead'
import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import { TableauJeunes } from 'components/jeune/TableauJeunes'
import SuccessMessage from 'components/SuccessMessage'
import { ActionsCount } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import {
  compareJeunesByLastName,
  JeuneAvecInfosComplementaires,
  JeuneAvecNbActionsNonTerminees,
} from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Router, { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddJeuneImage from '../../assets/images/ajouter_un_jeune.svg'

type MesJeunesProps = {
  structureConseiller: string
  conseillerJeunes: JeuneAvecNbActionsNonTerminees[]
  isFromEmail: boolean
  messageEnvoiGroupeSuccess?: boolean
  deletionSuccess?: boolean
}

function MesJeunes({
  structureConseiller,
  conseillerJeunes,
  isFromEmail,
  messageEnvoiGroupeSuccess,
  deletionSuccess,
}: MesJeunesProps) {
  const router = useRouter()
  const { data: session } = useSession({ required: true })
  const messagesService = useDependance<MessagesService>('messagesService')

  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  const [jeunes, setJeunes] = useState<JeuneAvecInfosComplementaires[]>([])
  const [listeJeunesFiltres, setListJeunesFiltres] = useState<
    JeuneAvecInfosComplementaires[]
  >([])
  const [showDeletionSuccess, setShowDeletionSuccess] = useState<boolean>(
    deletionSuccess ?? false
  )

  let initialTracking = 'Mes jeunes'
  if (conseillerJeunes.length === 0) initialTracking += ' - Aucun jeune'
  if (isFromEmail) initialTracking += ' - Origine email'
  if (showDeletionSuccess) initialTracking += ' - Succès suppr. compte'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const handleAddJeune = async () => {
    switch (structureConseiller) {
      case UserStructure.MILO:
        await Router.push('/mes-jeunes/milo/creation-jeune')
        break
      case UserStructure.POLE_EMPLOI:
        await Router.push('/mes-jeunes/pole-emploi/creation-jeune')
        break
      default:
        break
    }
  }

  async function closeDeletionSuccess(): Promise<void> {
    setShowDeletionSuccess(false)
    await Router.replace({ pathname: `/mes-jeunes` }, undefined, {
      shallow: true,
    })
  }

  function closeMessageGroupeEnvoiSuccess(): void {
    setShowMessageGroupeEnvoiSuccess(false)
    router.replace('/mes-jeunes', undefined, { shallow: true })
  }

  const onSearch = useCallback(
    (query: string) => {
      const querySplit = query.toLowerCase().split(/-|\s/)
      if (query) {
        const jeunesFiltresResult = jeunes.filter((jeune) => {
          const jeuneLastName = jeune.lastName
            .replace(/’/i, "'")
            .toLocaleLowerCase()
          for (const item of querySplit) {
            if (jeuneLastName.includes(item)) {
              return true
            }
          }
          return false
        })
        setListJeunesFiltres(jeunesFiltresResult)
        if (jeunesFiltresResult.length > 0) {
          setTrackingTitle('Clic sur Rechercher - Recherche avec résultats')
        } else {
          setTrackingTitle('Clic sur Rechercher - Recherche sans résultats')
        }
      } else {
        setListJeunesFiltres(jeunes)
        setTrackingTitle(initialTracking)
      }
    },
    [initialTracking, jeunes]
  )

  useEffect(() => {
    if (session?.firebaseToken) {
      messagesService
        .signIn(session.firebaseToken)
        .then(() =>
          messagesService.countMessagesNotRead(
            session.user.id,
            conseillerJeunes.map((j) => j.id)
          )
        )
        .catch(() =>
          conseillerJeunes.reduce(
            (mappedCounts, jeune) => ({ ...mappedCounts, [jeune.id]: 0 }),
            {} as { [idJeune: string]: number }
          )
        )
        .then((mappedCounts: { [idJeune: string]: number }) =>
          conseillerJeunes.map((jeune) => ({
            ...jeune,
            messagesNonLus: mappedCounts[jeune.id] ?? 0,
          }))
        )
        .then((jeunesAvecMessagesNonLus) => {
          setJeunes(jeunesAvecMessagesNonLus)
          setListJeunesFiltres(jeunesAvecMessagesNonLus)
        })
    }
  }, [conseillerJeunes, messagesService, session])

  useMatomo(trackingTitle)
  useMatomo(
    showMessageGroupeEnvoiSuccess
      ? 'Mes jeunes - Succès envoi message'
      : 'Mes jeunes'
  )

  return (
    <>
      <AppHead titre='Mes jeunes' />
      <div className={styles.header}>
        <div className={`flex flex-wrap justify-between mb-6`}>
          <h1 className='h2-semi text-bleu_nuit'>Mes Jeunes</h1>
          {(structureConseiller === UserStructure.MILO ||
            structureConseiller === UserStructure.POLE_EMPLOI) && (
            <AjouterJeuneButton handleAddJeune={handleAddJeune} />
          )}
        </div>

        <RechercheJeune onSearchFilterBy={onSearch} />
      </div>

      <div className={`w-full flex flex-col ${styles.content}`}>
        {showDeletionSuccess && (
          <SuccessMessage
            label='Le compte du jeune a bien été supprimé.'
            onAcknowledge={closeDeletionSuccess}
          />
        )}

        {showMessageGroupeEnvoiSuccess && (
          <SuccessMessage
            label={
              'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des jeunes'
            }
            onAcknowledge={closeMessageGroupeEnvoiSuccess}
          />
        )}

        {conseillerJeunes.length === 0 && (
          <div className='mx-auto my-0'>
            <AddJeuneImage
              aria-hidden='true'
              focusable='false'
              className='mb-16'
            />
            <p className='text-bleu_nuit text-base-medium mb-12'>
              Vous n&apos;avez pas encore intégré de jeunes.
            </p>

            <AjouterJeuneButton handleAddJeune={handleAddJeune} />
          </div>
        )}

        {conseillerJeunes.length > 0 && (
          <TableauJeunes
            jeunes={listeJeunesFiltres}
            withActions={structureConseiller !== UserStructure.POLE_EMPLOI}
          />
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<MesJeunesProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const jeunesService = withDependance<JeunesService>('jeunesService')
  const actionsService = withDependance<ActionsService>('actionsService')
  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)

  let jeunesAvecNbActionsNonTerminees: JeuneAvecNbActionsNonTerminees[]
  if (user.structure === UserStructure.POLE_EMPLOI) {
    jeunesAvecNbActionsNonTerminees = jeunes.map((jeune) => ({
      ...jeune,
      nbActionsNonTerminees: 0,
    }))
  } else {
    const actions = await actionsService.getActions(user.id, accessToken)

    jeunesAvecNbActionsNonTerminees = jeunes.map((jeune) => {
      let nbActionsNonTerminees = 0
      const currentJeuneAction = actions.find(
        (action: ActionsCount) => action.jeuneId === jeune.id
      )

      if (currentJeuneAction) {
        nbActionsNonTerminees =
          currentJeuneAction.inProgressActionsCount +
          currentJeuneAction.todoActionsCount
      }

      return {
        ...jeune,
        nbActionsNonTerminees,
      }
    })
  }

  const props: MesJeunesProps = {
    structureConseiller: user.structure,
    conseillerJeunes: [...jeunesAvecNbActionsNonTerminees].sort(
      compareJeunesByLastName
    ),
    isFromEmail: Boolean(context.query?.source),
    messageEnvoiGroupeSuccess: Boolean(context.query?.envoiMessage),
  }

  if (context.query.suppression)
    props.deletionSuccess = context.query.suppression === 'succes'

  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'
  }

  return { props }
}

export default MesJeunes
