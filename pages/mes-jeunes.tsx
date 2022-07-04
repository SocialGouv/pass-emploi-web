import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'

import EmptyStateImage from '../assets/images/empty_state.svg'

import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import { TableauJeunes } from 'components/jeune/TableauJeunes'
import Button from 'components/ui/Button'
import SuccessMessage from 'components/ui/SuccessMessage'
import { TotalActions } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import {
  compareJeunesByNom,
  JeuneAvecInfosComplementaires,
  JeuneAvecNbActionsNonTerminees,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { ActionsService } from 'services/actions.service'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface MesJeunesProps extends PageProps {
  structureConseiller: string
  conseillerJeunes: JeuneAvecNbActionsNonTerminees[]
  isFromEmail: boolean
  recuperationSuccess?: boolean
  deletionSuccess?: boolean
  ajoutAgenceSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
}

function MesJeunes({
  structureConseiller,
  conseillerJeunes,
  isFromEmail,
  deletionSuccess,
  recuperationSuccess,
  ajoutAgenceSuccess,
  messageEnvoiGroupeSuccess,
}: MesJeunesProps) {
  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials] = useChatCredentials()
  const messagesService = useDependance<MessagesService>('messagesService')
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const router = useRouter()

  const [conseiller, setConseiller] = useConseiller()
  const [jeunes, setJeunes] = useState<JeuneAvecInfosComplementaires[]>([])
  const [listeJeunesFiltres, setListJeunesFiltres] = useState<
    JeuneAvecInfosComplementaires[]
  >([])
  const [
    isRecuperationBeneficiairesLoading,
    setIsRecuperationBeneficiairesLoading,
  ] = useState<boolean>(false)

  const [showRecuperationSuccess, setShowRecuperationSuccess] =
    useState<boolean>(recuperationSuccess ?? false)
  const [showDeletionSuccess, setShowDeletionSuccess] = useState<boolean>(
    deletionSuccess ?? false
  )
  const [showAjoutAgenceSuccess, setShowAjoutAgenceSuccess] = useState<boolean>(
    ajoutAgenceSuccess ?? false
  )
  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  let initialTracking = 'Mes jeunes'
  if (conseillerJeunes.length === 0) initialTracking += ' - Aucun jeune'
  if (isFromEmail) initialTracking += ' - Origine email'
  if (showDeletionSuccess) initialTracking += ' - Succès suppr. compte'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const handleAddJeune = async () => {
    switch (structureConseiller) {
      case UserStructure.MILO:
        await router.push('/mes-jeunes/milo/creation-jeune')
        break
      case UserStructure.POLE_EMPLOI:
        await router.push('/mes-jeunes/pole-emploi/creation-jeune')
        break
      default:
        break
    }
  }

  async function closeRecuperationSuccess(): Promise<void> {
    setShowRecuperationSuccess(false)
    await router.replace('mes-jeunes', undefined, {
      shallow: true,
    })
  }

  async function closeDeletionSuccess(): Promise<void> {
    setShowDeletionSuccess(false)
    await router.replace('mes-jeunes', undefined, {
      shallow: true,
    })
  }

  async function closeMessageGroupeEnvoiSuccess(): Promise<void> {
    setShowMessageGroupeEnvoiSuccess(false)
    await router.replace('/mes-jeunes', undefined, { shallow: true })
  }

  async function closeAjoutAgenceSuccessMessage(): Promise<void> {
    setShowAjoutAgenceSuccess(false)
    await router.replace('/mes-jeunes', undefined, { shallow: true })
  }

  async function recupererBeneficiaires(): Promise<void> {
    setIsRecuperationBeneficiairesLoading(true)
    try {
      await conseillerService.recupererBeneficiaires(
        session!.user.id,
        session!.accessToken
      )
      await router.replace({
        pathname: '/mes-jeunes',
        query: { recuperation: 'succes' },
      })
      setConseiller({ ...conseiller!, aDesBeneficiairesARecuperer: false })
    } finally {
      setIsRecuperationBeneficiairesLoading(false)
    }
  }

  const onSearch = useCallback(
    (query: string) => {
      const querySplit = query.toLowerCase().split(/-|\s/)
      if (query) {
        const jeunesFiltresResult = jeunes.filter((jeune) => {
          const jeuneLastName = jeune.nom.replace(/’/i, "'").toLocaleLowerCase()
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
    setShowRecuperationSuccess(recuperationSuccess ?? false)
  }, [recuperationSuccess])

  useEffect(() => {
    if (!session || !chatCredentials) return

    messagesService
      .signIn(chatCredentials.token)
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
  }, [chatCredentials, conseillerJeunes, messagesService, session])

  useMatomo(trackingTitle)

  useMatomo(
    showMessageGroupeEnvoiSuccess
      ? 'Mes jeunes - Succès envoi message'
      : 'Mes jeunes'
  )

  return (
    <>
      {showRecuperationSuccess && (
        <SuccessMessage
          label='Vous avez récupéré vos bénéficiaires avec succès'
          onAcknowledge={closeRecuperationSuccess}
        />
      )}

      {showDeletionSuccess && (
        <SuccessMessage
          label='Le compte du jeune a bien été supprimé.'
          onAcknowledge={closeDeletionSuccess}
        />
      )}

      {showMessageGroupeEnvoiSuccess && (
        <SuccessMessage
          label={
            'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires'
          }
          onAcknowledge={closeMessageGroupeEnvoiSuccess}
        />
      )}

      {showAjoutAgenceSuccess && (
        <SuccessMessage
          label={`Votre ${
            structureConseiller === UserStructure.MILO
              ? 'Mission locale'
              : 'agence'
          } a été ajoutée à votre profil`}
          onAcknowledge={() => closeAjoutAgenceSuccessMessage()}
        />
      )}

      {conseiller?.aDesBeneficiairesARecuperer && (
        <div className='bg-primary_lighten rounded-medium p-6 mb-6 text-center'>
          <p className='text-base-medium text-primary'>
            {conseillerJeunes.length > 0 &&
              'Certains de vos bénéficiaires ont été transférés temporairement.'}
            {conseillerJeunes.length === 0 &&
              'Vos bénéficiaires ont été transférés temporairement vers un autre conseiller.'}
          </p>
          <Button
            onClick={recupererBeneficiaires}
            className='m-auto mt-4'
            isLoading={isRecuperationBeneficiairesLoading}
          >
            {conseillerJeunes.length > 0 && 'Récupérer ces bénéficiaires'}
            {conseillerJeunes.length === 0 && 'Récupérer les bénéficiaires'}
          </Button>
        </div>
      )}

      {conseillerJeunes.length > 0 && (
        <div className={`flex flex-wrap justify-between items-end mb-6`}>
          <RechercheJeune onSearchFilterBy={onSearch} />
          {(structureConseiller === UserStructure.MILO ||
            structureConseiller === UserStructure.POLE_EMPLOI) && (
            <AjouterJeuneButton handleAddJeune={handleAddJeune} />
          )}
        </div>
      )}

      {conseillerJeunes.length === 0 &&
        !conseiller?.aDesBeneficiairesARecuperer && (
          <div className='mx-auto my-0 flex flex-col items-center'>
            <EmptyStateImage
              aria-hidden='true'
              focusable='false'
              className='mb-16'
            />
            <p className='text-base-medium mb-12'>
              Vous n&apos;avez pas encore intégré de jeunes.
            </p>

            <AjouterJeuneButton handleAddJeune={handleAddJeune} />
          </div>
        )}

      {conseillerJeunes.length > 0 && (
        <TableauJeunes
          jeunes={listeJeunesFiltres}
          withActions={structureConseiller !== UserStructure.POLE_EMPLOI}
          withSituations={structureConseiller === UserStructure.MILO}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<MesJeunesProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
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
    const totauxActions: TotalActions[] =
      await actionsService.countActionsJeunes(user.id, accessToken)

    jeunesAvecNbActionsNonTerminees = jeunes.map((jeune) => {
      const totalJeune = totauxActions.find(
        (action) => action.idJeune === jeune.id
      )

      return {
        ...jeune,
        nbActionsNonTerminees: totalJeune?.nbActionsNonTerminees ?? 0,
      }
    })
  }

  const props: MesJeunesProps = {
    structureConseiller: user.structure,
    conseillerJeunes: [...jeunesAvecNbActionsNonTerminees].sort(
      compareJeunesByNom
    ),
    isFromEmail: Boolean(context.query?.source),
    pageTitle: 'Mes jeunes',
  }

  if (context.query.recuperation) {
    props.recuperationSuccess = context.query.recuperation === 'succes'
  }

  if (context.query.suppression)
    props.deletionSuccess = context.query.suppression === 'succes'

  if (context.query.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'
  }

  if (context.query.choixAgence) {
    props.ajoutAgenceSuccess = context.query.choixAgence === 'succes'
  }

  return { props }
}

export default withTransaction(MesJeunes.name, 'page')(MesJeunes)
