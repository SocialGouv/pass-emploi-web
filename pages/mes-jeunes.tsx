import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useCallback, useEffect, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import TableauJeunes from 'components/jeune/TableauJeunes'
import PageActionsPortal from 'components/PageActionsPortal'
import Button from 'components/ui/Button/Button'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { TotalActions } from 'interfaces/action'
import {
  estMilo,
  estPoleEmploi,
  estUserPoleEmploi,
} from 'interfaces/conseiller'
import {
  compareJeunesByNom,
  JeuneAvecInfosComplementaires,
  JeuneAvecNbActionsNonTerminees,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { countMessagesNotRead } from 'services/messages.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface MesJeunesProps extends PageProps {
  accessToken: string
  isFromEmail: boolean
}

function MesJeunes({ accessToken, isFromEmail }: MesJeunesProps) {
  const [chatCredentials] = useChatCredentials()
  const [alerte, setAlerte] = useAlerte()

  const [conseiller, setConseiller] = useConseiller()
  const [jeunes, setJeunes] = useState<JeuneAvecInfosComplementaires[]>()
  const [jeunesFiltres, setJeunesFiltres] =
    useState<JeuneAvecInfosComplementaires[]>()
  const [conseillerJeunes, setConseillerJeunes] = useState<
    JeuneAvecNbActionsNonTerminees[]
  >([])

  const [
    isRecuperationBeneficiairesLoading,
    setIsRecuperationBeneficiairesLoading,
  ] = useState<boolean>(false)

  let initialTracking = 'Mes jeunes'
  if (conseillerJeunes.length === 0) initialTracking += ' - Aucun jeune'
  if (isFromEmail) initialTracking += ' - Origine email'
  if (alerte?.key === AlerteParam.creationBeneficiaire)
    initialTracking += ' - Succès creation compte'
  if (alerte?.key === AlerteParam.suppressionBeneficiaire)
    initialTracking += ' - Succès suppr. compte'
  if (alerte?.key === AlerteParam.recuperationBeneficiaires)
    initialTracking += ' - Succès récupération'
  if (alerte?.key === AlerteParam.envoiMessage)
    initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function recupererBeneficiaires(): Promise<void> {
    setIsRecuperationBeneficiairesLoading(true)
    try {
      const { recupererBeneficiaires: _recupererBeneficiaires } = await import(
        'services/conseiller.service'
      )
      await _recupererBeneficiaires()
      setAlerte(AlerteParam.recuperationBeneficiaires)
      setConseiller({ ...conseiller, aDesBeneficiairesARecuperer: false })
    } finally {
      setIsRecuperationBeneficiairesLoading(false)
    }
  }

  const onSearch = useCallback(
    (query: string) => {
      const querySplit = query.toLowerCase().split(/-|\s/)
      if (query) {
        const jeunesFiltresResult = jeunes!.filter((jeune) => {
          const jeuneLastName = jeune.nom.replace(/’/i, "'").toLocaleLowerCase()
          const jeuneFirstName = jeune.prenom
            .replace(/’/i, "'")
            .toLocaleLowerCase()
          for (const item of querySplit) {
            if (jeuneLastName.includes(item) || jeuneFirstName.includes(item)) {
              return true
            }
          }
          return false
        })
        setJeunesFiltres(jeunesFiltresResult)
        if (jeunesFiltresResult.length > 0) {
          setTrackingTitle('Clic sur Rechercher - Recherche avec résultats')
        } else {
          setTrackingTitle('Clic sur Rechercher - Recherche sans résultats')
        }
      } else {
        setJeunesFiltres(jeunes)
        setTrackingTitle(initialTracking)
      }
    },
    [initialTracking, jeunes]
  )

  useEffect(() => {
    if (!chatCredentials || !conseillerJeunes.length) return

    countMessagesNotRead(conseillerJeunes.map((j) => j.id))
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
        setJeunesFiltres(jeunesAvecMessagesNonLus)
      })
  }, [chatCredentials, conseillerJeunes])

  useEffect(() => {
    const toto = async () => {
      const { getJeunesDuConseillerClientSide } = await import(
        'services/jeunes.service'
      )
      const jeunes = await getJeunesDuConseillerClientSide()

      let jeunesAvecNbActionsNonTerminees: JeuneAvecNbActionsNonTerminees[]
      if (estPoleEmploi(conseiller)) {
        jeunesAvecNbActionsNonTerminees = jeunes.map((jeune) => ({
          ...jeune,
          nbActionsNonTerminees: 0,
        }))
      } else {
        const { countActionsJeunes } = await import('services/actions.service')
        const totauxActions: TotalActions[] = await countActionsJeunes(
          conseiller.id,
          accessToken
        )

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
      setConseillerJeunes(
        [...jeunesAvecNbActionsNonTerminees].sort(compareJeunesByNom)
      )
    }

    toto().catch((error: Error) => {
      console.log(error)
    })
  }, [])

  const adesBeneficiaires = conseillerJeunes.length === 0 ? 'non' : 'oui'

  useMatomo(trackingTitle, adesBeneficiaires)

  return (
    <>
      <PageActionsPortal>
        <AjouterJeuneButton structure={conseiller.structure} />
      </PageActionsPortal>

      {conseiller.aDesBeneficiairesARecuperer && (
        <div className='bg-primary_lighten rounded-base p-6 mb-6 text-center'>
          <p className='text-base-bold text-primary'>
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

      {conseillerJeunes.length === 0 &&
        !conseiller.aDesBeneficiairesARecuperer && (
          <div className='mx-auto my-0 flex flex-col items-center'>
            <EmptyStateImage
              aria-hidden='true'
              focusable='false'
              className='w-[360px] h-[200px] mb-16'
            />
            <p className='text-base-bold mb-12'>
              Vous n&apos;avez pas encore intégré de bénéficiaires.
            </p>
          </div>
        )}

      {conseillerJeunes.length > 0 && (
        <>
          <div className='mb-12'>
            <RechercheJeune onSearchFilterBy={onSearch} />
          </div>

          {!jeunesFiltres && <SpinningLoader />}

          {jeunesFiltres && (
            <TableauJeunes
              jeunesFiltres={jeunesFiltres}
              totalJeunes={conseillerJeunes.length}
              withActions={!estPoleEmploi(conseiller)}
              withSituations={estMilo(conseiller)}
            />
          )}
        </>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<MesJeunesProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const {
    session: { accessToken },
  } = sessionOrRedirect

  const props: MesJeunesProps = {
    accessToken: accessToken,
    isFromEmail: Boolean(context.query?.source),
    pageTitle: 'Portefeuille',
  }

  return { props }
}

export default withTransaction(MesJeunes.name, 'page')(MesJeunes)
